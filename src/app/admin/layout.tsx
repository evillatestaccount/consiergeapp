'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Sparkles, Shield, User, LogOut, ArrowLeft, Layers, Users, MapPin, Inbox } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ id: string; name: string; email: string; role: string } | null>(null);

  const isAuthPage = pathname.includes('/login') || pathname.includes('/register');

  useEffect(() => {
    if (!isAuthPage) {
      fetch('/api/auth/me')
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data?.authenticated && data.user) {
            setUser(data.user);
          } else {
            router.push('/admin/login');
          }
        })
        .catch(() => {
          router.push('/admin/login');
        });
    }
  }, [pathname, isAuthPage, router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      router.push('/admin/login');
    } catch (err) {
      console.error(err);
    }
  };

  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-[#070308] text-white">
        <head>
          <meta name="robots" content="noindex, nofollow" />
        </head>
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070308] text-white flex flex-col">
      <head>
        <meta name="robots" content="noindex, nofollow" />
      </head>
      {/* Top Admin Bar */}
      <header className="border-b border-white/10 bg-[#120814]/90 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          <div className="flex items-center space-x-6">
            <Link href="/" className="flex items-center space-x-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#D91680] to-[#4B1248] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-serif tracking-wider text-base font-bold text-white">
                ESCORT<span className="text-magenta-400">VILLA</span> PORTAL
              </span>
            </Link>

            {user && (
              <nav className="hidden md:flex items-center space-x-1 pl-4 border-l border-white/10">
                {user.role === 'SUPER_ADMIN' ? (
                  <>
                    <Link
                      href="/admin/super"
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-colors ${
                        pathname === '/admin/super' ? 'bg-magenta-500/20 text-magenta-300' : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      SuperAdmin Console
                    </Link>
                    <Link
                      href="/admin/editor"
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-colors ${
                        pathname === '/admin/editor' ? 'bg-magenta-500/20 text-magenta-300' : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      Editor View
                    </Link>
                  </>
                ) : (
                  <Link
                    href="/admin/editor"
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide bg-magenta-500/20 text-magenta-300"
                  >
                    Curator Dashboard
                  </Link>
                )}
              </nav>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <Link
              href="/"
              target="_blank"
              className="text-xs text-neutral-400 hover:text-white flex items-center space-x-1"
            >
              <span>Live Directory</span>
              <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
            </Link>

            {user && (
              <div className="flex items-center space-x-3 pl-4 border-l border-white/10">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-semibold text-white">{user.name}</div>
                  <div className="text-[10px] text-magenta-300 font-mono">
                    {user.role === 'SUPER_ADMIN' ? 'SuperAdmin' : 'Directory Editor'}
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 hover:text-rose-400 border border-white/10 text-neutral-400 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
