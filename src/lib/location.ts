'use client';

import { useState, useEffect } from 'react';

export interface DetectedLocation {
  cityName: string;        // e.g. "Delhi" or "New Delhi"
  closestChapter: string;  // Exactly matches: 'Delhi' | 'Mumbai' | 'London' | 'New York'
  slug: string;            // 'delhi' | 'mumbai' | 'london' | 'new-york'
  displayName: string;     // e.g. "New Delhi" or "Delhi, India"
  lat?: number;
  lon?: number;
  source: 'gps' | 'ip' | 'timezone';
}

export interface CityChapterCoords {
  name: string;
  slug: string;
  lat: number;
  lon: number;
}

export const CHAPTER_COORDINATES: Record<string, CityChapterCoords> = {
  Delhi: { name: 'Delhi', slug: 'delhi', lat: 28.6315, lon: 77.2167 },
  Mumbai: { name: 'Mumbai', slug: 'mumbai', lat: 19.0760, lon: 72.8777 },
  London: { name: 'London', slug: 'london', lat: 51.5074, lon: -0.1278 },
  'New York': { name: 'New York', slug: 'new-york', lat: 40.7128, lon: -74.0060 },
};

// Calculate Haversine distance between two coordinates in kilometers
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Find closest supported chapter from coordinates
export function findClosestChapter(lat: number, lon: number): CityChapterCoords {
  let closest = CHAPTER_COORDINATES.Delhi;
  let minDistance = Infinity;

  for (const chapter of Object.values(CHAPTER_COORDINATES)) {
    const dist = calculateDistanceKm(lat, lon, chapter.lat, chapter.lon);
    if (dist < minDistance) {
      minDistance = dist;
      closest = chapter;
    }
  }

  return closest;
}

// Instant synchronous timezone-based heuristic (0ms, zero permissions required)
export function getTimezoneLocation(): DetectedLocation {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';

    // Indian subcontinent -> Delhi
    if (tz.includes('Kolkata') || tz.includes('Calcutta') || tz.includes('Colombo')) {
      return {
        cityName: 'Delhi',
        closestChapter: 'Delhi',
        slug: 'delhi',
        displayName: 'New Delhi',
        lat: CHAPTER_COORDINATES.Delhi.lat,
        lon: CHAPTER_COORDINATES.Delhi.lon,
        source: 'timezone',
      };
    }

    // UK & Western Europe -> London
    if (tz.includes('London') || tz.includes('Dublin') || tz.includes('Lisbon')) {
      return {
        cityName: 'London',
        closestChapter: 'London',
        slug: 'london',
        displayName: 'London',
        lat: CHAPTER_COORDINATES.London.lat,
        lon: CHAPTER_COORDINATES.London.lon,
        source: 'timezone',
      };
    }

    // Americas -> New York (or closest)
    if (tz.includes('America') || tz.includes('New_York') || tz.includes('Toronto') || tz.includes('Chicago')) {
      return {
        cityName: 'New York',
        closestChapter: 'New York',
        slug: 'new-york',
        displayName: 'New York',
        lat: CHAPTER_COORDINATES['New York'].lat,
        lon: CHAPTER_COORDINATES['New York'].lon,
        source: 'timezone',
      };
    }
  } catch (e) {
    // Ignore timezone parse errors
  }

  // Safe fallback to Delhi
  return {
    cityName: 'Delhi',
    closestChapter: 'Delhi',
    slug: 'delhi',
    displayName: 'New Delhi',
    lat: CHAPTER_COORDINATES.Delhi.lat,
    lon: CHAPTER_COORDINATES.Delhi.lon,
    source: 'timezone',
  };
}

let cachedLocation: DetectedLocation | null = null;

export async function detectPreciseLocation(): Promise<DetectedLocation> {
  // If we already have a high-precision GPS detection cached in memory, return it
  if (cachedLocation && cachedLocation.source === 'gps') {
    return cachedLocation;
  }

  // Check localStorage for previously verified location
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('escortvilla_detected_location') || localStorage.getItem('aura_detected_location');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.closestChapter && parsed?.slug) {
          cachedLocation = parsed;
        }
      }
    } catch {}
  }

  // Baseline from timezone
  const baseline = getTimezoneLocation();
  if (!cachedLocation) {
    cachedLocation = baseline;
  }

  // Try Browser Geolocation API (GPS / WiFi triangulation)
  if (typeof window !== 'undefined' && 'geolocation' in navigator) {
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 4000,
          maximumAge: 600000, // 10 minutes cache
          enableHighAccuracy: true,
        });
      });

      const { latitude, longitude } = position.coords;
      const closest = findClosestChapter(latitude, longitude);

      let detectedCityName = closest.name;
      let displayName = closest.name === 'Delhi' ? 'New Delhi' : closest.name;

      // Reverse geocode to get friendly local neighborhood/city name
      try {
        const res = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
          { signal: AbortSignal.timeout(3000) }
        );
        if (res.ok) {
          const data = await res.json();
          const specificCity = data.city || data.locality || data.principalSubdivision;
          if (specificCity) {
            displayName = specificCity;
          }
        }
      } catch {
        // Fallback to closest chapter name
      }

      const result: DetectedLocation = {
        cityName: detectedCityName,
        closestChapter: closest.name,
        slug: closest.slug,
        displayName: displayName,
        lat: latitude,
        lon: longitude,
        source: 'gps',
      };

      cachedLocation = result;
      try {
        localStorage.setItem('escortvilla_detected_location', JSON.stringify(result));
        window.dispatchEvent(new CustomEvent('escortvilla_location_changed', { detail: result }));
      } catch {}

      return result;
    } catch (geoError) {
      // Geolocation denied, prompt ignored, or timed out. Fall back to IP lookup
    }
  }

  // Secondary Fallback: IP-based lookup
  if (typeof window !== 'undefined' && (!cachedLocation || cachedLocation.source === 'timezone')) {
    try {
      const ipRes = await fetch('https://ipwho.is/', { signal: AbortSignal.timeout(3000) });
      if (ipRes.ok) {
        const ipData = await ipRes.json();
        if (ipData.success && ipData.latitude && ipData.longitude) {
          const closest = findClosestChapter(ipData.latitude, ipData.longitude);
          const ipCity = ipData.city || closest.name;

          const result: DetectedLocation = {
            cityName: closest.name,
            closestChapter: closest.name,
            slug: closest.slug,
            displayName: ipCity === 'Delhi' ? 'New Delhi' : ipCity,
            lat: ipData.latitude,
            lon: ipData.longitude,
            source: 'ip',
          };

          cachedLocation = result;
          try {
            localStorage.setItem('escortvilla_detected_location', JSON.stringify(result));
            window.dispatchEvent(new CustomEvent('escortvilla_location_changed', { detail: result }));
          } catch {}

          return result;
        }
      }
    } catch {
      // Fallback to baseline
    }
  }

  return cachedLocation || baseline;
}

// React Hook for unified location state across all pages
export function useUserLocation() {
  const [location, setLocation] = useState<DetectedLocation>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('escortvilla_detected_location') || localStorage.getItem('aura_detected_location');
        if (stored) return JSON.parse(stored);
      } catch {}
    }
    return getTimezoneLocation();
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    // Listen to location updates across tabs or components
    const handleLocationChange = (e: Event) => {
      const customEvent = e as CustomEvent<DetectedLocation>;
      if (customEvent.detail && isMounted) {
        setLocation(customEvent.detail);
      }
    };

    window.addEventListener('escortvilla_location_changed', handleLocationChange);

    // Trigger precise detection
    setLoading(true);
    detectPreciseLocation()
      .then((loc) => {
        if (isMounted) {
          setLocation(loc);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
      window.removeEventListener('escortvilla_location_changed', handleLocationChange);
    };
  }, []);

  return { location, loading };
}
