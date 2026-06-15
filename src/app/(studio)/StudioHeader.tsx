// src/app/(studio)/StudioHeader.tsx
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function StudioHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const isGiris = pathname === '/studio/giris';

  if (isGiris) return null; // Hide header on login page

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/studio/giris');
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-150 no-print">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Left Side: Brand Logo */}
        <Link href="/studio/marka101" className="flex items-center group">
          <img
            src="/deep-creative-logo.png"
            alt="Deep Creative"
            className="h-12 w-auto object-contain group-hover:scale-[1.02] transition-transform"
          />
        </Link>

        {/* Center: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/studio/marka101"
            className={`text-xs font-bold transition-colors ${
              pathname.startsWith('/studio/marka101') ? 'text-gray-950' : 'text-gray-400 hover:text-gray-650'
            }`}
          >
            Marka Başvuruları
          </Link>
          <Link
            href="/studio/panel"
            className={`text-xs font-bold transition-colors ${
              pathname.startsWith('/studio/panel') ? 'text-gray-950' : 'text-gray-400 hover:text-gray-650'
            }`}
          >
            Yönetici Paneli
          </Link>
          <a
            href="/marka101"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-gray-450 hover:text-gray-600 transition-colors flex items-center gap-1"
          >
            Açık Teşhis Formu ↗
          </a>
        </nav>

        {/* Right Side: Admin Profile & Logout */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-150 rounded-full pl-2 pr-3 py-1 text-left">
            <div className="w-6 h-6 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-600 uppercase">
              AD
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-900 block leading-none">Ajans Paneli</span>
              <span className="text-[8px] font-medium text-gray-400 block mt-0.5 leading-none">Yönetici</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void handleLogout()}
            className="text-gray-400 hover:text-red-600 transition-colors p-1.5 rounded-lg hover:bg-red-50"
            title="Çıkış Yap"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
