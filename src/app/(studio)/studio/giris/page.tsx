// src/app/(studio)/studio/giris/page.tsx
// Supabase Auth — email + şifre
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function StudioGirisPage() {
  const router = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password) {
      setError('E-posta ve şifre zorunludur.');
      return;
    }
    setIsLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (authError) {
      setError('E-posta veya şifre hatalı.');
      setIsLoading(false);
      return;
    }

    router.push('/studio/marka101');
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[#06050b] text-[#f1f1f1] flex items-center justify-center px-4 relative overflow-hidden font-sans antialiased">
      {/* Background glow effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#4f20c0]/15 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#b5179e]/10 rounded-full blur-[110px] pointer-events-none" />

      <div className="w-full max-w-sm relative z-10 animate-fade-in-up">
        {/* Logo Icon and Brand Header */}
        <div className="text-center mb-8 space-y-4 flex flex-col items-center">
          <img src="/studio-logo.png" alt="Logo" className="w-20 h-20 object-contain hover:scale-105 transition-all" />
          <div>
            <p className="text-[10px] font-black uppercase text-[#928ca1] tracking-widest">
              Deep Creative
            </p>
            <h1 className="text-xl font-black text-[#f6f5fa] tracking-tight mt-1">Studio Girişi</h1>
          </div>
        </div>

        {/* Glassmorphic Login Card */}
        <div className="bg-gradient-to-br from-[#100d24]/70 to-[#06050e]/70 border border-white/10 backdrop-blur-xl rounded-3xl p-7 shadow-2xl space-y-6 relative overflow-hidden">
          {/* Inner glows */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#b5179e]/5 rounded-full blur-[40px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#4f20c0]/5 rounded-full blur-[40px] pointer-events-none" />

          <div className="space-y-2 relative z-10">
            <label htmlFor="email" className="block text-[10px] font-bold text-[#928ca1] uppercase tracking-wider">
              E-posta
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(null); }}
              onKeyDown={(e) => { if (e.key === 'Enter') void handleLogin(); }}
              autoFocus
              className="w-full bg-[#0e0b1a]/70 border border-white/10 rounded-xl px-3.5 py-3 text-xs font-bold text-white placeholder-[#7d778f] focus:outline-none focus:border-[#4f20c0] transition-all"
              placeholder="admin@deepcreative.co"
            />
          </div>
          
          <div className="space-y-2 relative z-10">
            <label htmlFor="password" className="block text-[10px] font-bold text-[#928ca1] uppercase tracking-wider">
              Şifre
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(null); }}
              onKeyDown={(e) => { if (e.key === 'Enter') void handleLogin(); }}
              className="w-full bg-[#0e0b1a]/70 border border-white/10 rounded-xl px-3.5 py-3 text-xs font-bold text-white placeholder-[#7d778f] focus:outline-none focus:border-[#4f20c0] transition-all"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-950/20 border border-red-900/50 px-3.5 py-2.5 rounded-xl font-bold relative z-10">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={() => { void handleLogin(); }}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-[#4f20c0] to-[#b5179e] hover:scale-[1.02] active:scale-[0.98] text-white py-3.5 rounded-xl font-extrabold text-xs shadow-lg shadow-purple-500/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 relative z-10"
          >
            {isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </div>
      </div>
    </main>
  );
}
