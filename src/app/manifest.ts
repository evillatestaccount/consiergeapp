import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'EscortVilla | Premier VIP Escort Services & Luxury Directory',
    short_name: 'EscortVilla',
    description: 'Premier global directory for verified VIP escort services, high-class independent escorts, and luxury companions.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0B070E',
    theme_color: '#0B070E',
    icons: [
      {
        src: '/icon.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/apple-icon.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
