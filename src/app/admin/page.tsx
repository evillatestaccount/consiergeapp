'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.authenticated && data.user) {
          if (data.user.role === 'SUPER_ADMIN') {
            router.replace('/admin/super');
          } else {
            router.replace('/admin/editor');
          }
        } else {
          router.replace('/admin/login');
        }
      })
      .catch(() => {
        router.replace('/admin/login');
      });
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="text-center space-y-3">
        <div className="w-8 h-8 border-2 border-magenta-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-neutral-400">Verifying session credentials...</p>
      </div>
    </div>
  );
}
