'use client';

import { useState, useEffect } from 'react';
import { MapPin, Navigation, Compass, ShieldCheck, Sparkles, Plus, Minus, RotateCcw } from 'lucide-react';
import { getTimezoneLocation, findClosestChapter } from '@/lib/location';

interface CityCoordinate {
  name: string;
  slug: string;
  lat: number;
  lon: number;
  district: string;
  address: string;
  availableHosts: number;
  delta: number;
}

const CITY_COORDINATES: Record<string, CityCoordinate> = {
  London: {
    name: 'London',
    slug: 'london',
    lat: 51.5074,
    lon: -0.1420,
    district: 'Mayfair & West End',
    address: '28 Mayfair Place, London W1J 8BN',
    availableHosts: 3,
    delta: 0.015,
  },
  'New York': {
    name: 'New York',
    slug: 'new-york',
    lat: 40.7638,
    lon: -73.9729,
    district: 'Manhattan (Midtown & Upper East Side)',
    address: '767 Fifth Avenue, Manhattan, NY 10153',
    availableHosts: 2,
    delta: 0.015,
  },
  Delhi: {
    name: 'Delhi',
    slug: 'delhi',
    lat: 28.6315,
    lon: 77.2167,
    district: 'Connaught Place & Lutyens Diplomatic Zone',
    address: 'Barakhamba Road, New Delhi 110001',
    availableHosts: 3,
    delta: 0.015,
  },
  Mumbai: {
    name: 'Mumbai',
    slug: 'mumbai',
    lat: 19.0657,
    lon: 72.8687,
    district: 'Bandra Kurla Complex (BKC) & South Mumbai',
    address: 'Bandra Kurla Complex, Mumbai 400051',
    availableHosts: 2,
    delta: 0.015,
  },
};

interface ConciergeMapProps {
  selectedCity?: string;
  onCitySelect?: (cityName: string) => void;
}

export default function ConciergeMap({ selectedCity, onCitySelect }: ConciergeMapProps) {
  const [activeCityKey, setActiveCityKey] = useState<string>(() => selectedCity || getTimezoneLocation().closestChapter);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number; label: string } | null>(null);
  const [isUserLocationActive, setIsUserLocationActive] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1); // Zoom modifier: 1 = normal, 0.5 = closer, 2 = wider
  const [locating, setLocating] = useState<boolean>(false);
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);

  // Sync with parent form if selectedCity changes
  useEffect(() => {
    if (selectedCity && CITY_COORDINATES[selectedCity]) {
      setActiveCityKey(selectedCity);
      setIsUserLocationActive(false);
    }
  }, [selectedCity]);

  // Try detecting user location on mount
  useEffect(() => {
    detectUserLocation(false);
  }, []);

  const detectUserLocation = (userInitiated = true) => {
    if (!navigator.geolocation) {
      if (userInitiated) alert('Geolocation is not supported by your browser.');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const closest = findClosestChapter(latitude, longitude);
        setUserLocation({
          lat: latitude,
          lon: longitude,
          label: 'Your Current Location',
        });
        if (userInitiated) {
          setIsUserLocationActive(true);
        } else if (!selectedCity) {
          setActiveCityKey(closest.name);
          if (onCitySelect) onCitySelect(closest.name);
        }
        setLocating(false);
      },
      (error) => {
        console.warn('Geolocation lookup notice:', error.message);
        setLocating(false);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const handleSelectCity = (name: string) => {
    setIsUserLocationActive(false);
    setActiveCityKey(name);
    setZoomLevel(1);
    if (onCitySelect) {
      onCitySelect(name);
    }
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.max(0.4, prev * 0.7));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.min(3, prev * 1.4));
  };

  // Determine active view coordinates
  const defaultConfig = CITY_COORDINATES[activeCityKey] || CITY_COORDINATES[getTimezoneLocation().closestChapter] || CITY_COORDINATES.Delhi;
  let currentLat = defaultConfig.lat;
  let currentLon = defaultConfig.lon;
  let currentTitle = `${defaultConfig.name} Concierge Chapter`;
  let currentDistrict = defaultConfig.district;
  let currentAddress = defaultConfig.address;
  let currentHosts = defaultConfig.availableHosts;

  if (isUserLocationActive && userLocation) {
    currentLat = userLocation.lat;
    currentLon = userLocation.lon;
    currentTitle = 'Your Local Area';
    currentDistrict = 'Zoomed into your location';
    currentAddress = 'Private Concierge Dispatch Zone';
    currentHosts = 4;
  }

  // Calculate bounding box for OpenStreetMap embed
  const delta = (isUserLocationActive ? 0.012 : 0.015) * zoomLevel;
  const bbox = `${currentLon - delta},${currentLat - delta * 0.6},${currentLon + delta},${currentLat + delta * 0.6}`;
  const embedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${currentLat},${currentLon}`;

  return (
    <div className="p-6 rounded-3xl glass-card relative overflow-hidden space-y-4">
      
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-magenta-500/20 border border-magenta-500/30 flex items-center justify-center">
            <Compass className="w-4 h-4 text-magenta-400 animate-spin-slow" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Concierge Geographic Hub
            </h4>
            <p className="text-[11px] text-neutral-400">
              High-resolution local view of active concierge zones
            </p>
          </div>
        </div>

        {/* User Geolocation Zoom Button */}
        <button
          type="button"
          onClick={() => detectUserLocation(true)}
          disabled={locating}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
            isUserLocationActive
              ? 'bg-magenta-500 text-white shadow-aura'
              : 'bg-white/10 hover:bg-white/15 text-neutral-300 hover:text-white border border-white/10'
          }`}
          title="Zoom to where you are located"
        >
          <Navigation className={`w-3.5 h-3.5 ${locating ? 'animate-spin' : ''}`} />
          <span>{locating ? 'Locating...' : 'Zoom to My Location'}</span>
        </button>
      </div>

      {/* City Switcher Pill Buttons */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
        {Object.keys(CITY_COORDINATES).map((cityName) => (
          <button
            key={cityName}
            type="button"
            onClick={() => handleSelectCity(cityName)}
            className={`px-3 py-1 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              !isUserLocationActive && activeCityKey === cityName
                ? 'bg-gradient-to-r from-[#D91680] to-[#4B1248] text-white border border-magenta-400/40 shadow-aura'
                : 'bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10 border border-white/10'
            }`}
          >
            {cityName}
          </button>
        ))}
      </div>

      {/* Interactive Map Frame with Dark Luxury Invert Filter */}
      <div className="relative h-72 w-full rounded-2xl overflow-hidden border border-white/15 shadow-inner bg-[#0B070E]">
        
        {/* Real Live Map Iframe with Dark Mode Filter */}
        <iframe
          title="Concierge Interactive Map"
          src={embedUrl}
          onLoad={() => setMapLoaded(true)}
          className="w-full h-full border-0 filter invert-[90%] hue-rotate-180 brightness-[88%] contrast-[118%] transition-opacity duration-500"
          style={{ opacity: mapLoaded ? 1 : 0.4 }}
          loading="lazy"
        />

        {/* Map Corner Zoom Controls */}
        <div className="absolute top-3 right-3 z-20 flex flex-col space-y-1.5 bg-[#0B070E]/85 backdrop-blur-md p-1 rounded-xl border border-white/20 shadow-lg">
          <button
            type="button"
            onClick={handleZoomIn}
            className="p-1.5 rounded-lg hover:bg-white/20 text-neutral-300 hover:text-white transition-colors"
            title="Zoom In"
            aria-label="Zoom In"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <div className="h-px bg-white/20 mx-1" />
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-1.5 rounded-lg hover:bg-white/20 text-neutral-300 hover:text-white transition-colors"
            title="Zoom Out"
            aria-label="Zoom Out"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Floating Focused Info Card (No Cluttered Overlapping Dots!) */}
        <div className="absolute bottom-3 left-3 right-3 z-20">
          <div className="p-3.5 rounded-2xl bg-[#0B070E]/90 backdrop-blur-xl border border-magenta-500/30 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            
            <div className="flex items-start space-x-2.5">
              <div className="w-3 h-3 rounded-full bg-emerald-400 mt-1 flex-shrink-0 animate-ping" />
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-white tracking-wide">{currentTitle}</span>
                  <span className="px-2 py-0.2 rounded-full text-[9px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Active Zone
                  </span>
                </div>
                <div className="text-[11px] text-magenta-300 font-medium line-clamp-1">
                  {currentDistrict}
                </div>
                <div className="text-[10px] text-neutral-400 mt-0.5 line-clamp-1">
                  {currentAddress}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 self-end sm:self-auto flex-shrink-0">
              <div className="text-right hidden sm:block">
                <span className="text-[10px] text-neutral-400 block">Verified Hosts</span>
                <span className="text-xs font-bold text-white">{currentHosts} Available</span>
              </div>
              <div className="w-8 h-8 rounded-xl bg-magenta-500/20 border border-magenta-500/40 flex items-center justify-center text-magenta-300">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>

          </div>
        </div>

      </div>

      <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-1">
        <span className="flex items-center space-x-1.5">
          <MapPin className="w-3.5 h-3.5 text-magenta-400" />
          <span>Centered on local dispatch perimeter (zero data clutter)</span>
        </span>
        <button
          type="button"
          onClick={() => {
            setIsUserLocationActive(false);
            setZoomLevel(1);
          }}
          className="hover:text-white flex items-center space-x-1 text-neutral-400"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset View</span>
        </button>
      </div>

    </div>
  );
}
