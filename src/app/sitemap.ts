import { MetadataRoute } from 'next';
import { getCities, getListings } from '@/lib/db';

export const revalidate = 3600; // Cache sitemap for 1 hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://escortvilla.com';

  const [cities, listings] = await Promise.all([
    getCities({ onlyActive: true }),
    getListings({ status: 'PUBLISHED' }),
  ]);

  const now = new Date();

  // Core Static Pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${siteUrl}/contact`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];

  // City Directory Hubs (e.g. /companions-in-delhi, /companions-in-mumbai, etc.)
  const cityRoutes: MetadataRoute.Sitemap = cities.map((city) => ({
    url: `${siteUrl}/companions-in-${city.slug}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.9,
  }));

  // Individual Companion Profile Pages
  const profileRoutes: MetadataRoute.Sitemap = listings.map((listing) => ({
    url: `${siteUrl}/profile/${listing.id}`,
    lastModified: listing.updatedAt ? new Date(listing.updatedAt) : now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticRoutes, ...cityRoutes, ...profileRoutes];
}
