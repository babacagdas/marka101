// src/app/(studio)/studio/profil/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [initials, setInitials] = useState('AP');
  
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email ?? '');
        const displayName = user.user_metadata?.display_name || user.user_metadata?.name || '';
        setName(displayName);
        setIsLoaded(true);
      }
    }
    loadUser();
  }, []);

  useEffect(() => {
    const formattedInitials = name
      .split(' ')
      .filter(Boolean)
      .map(n => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || email.slice(0, 2).toUpperCase() || 'AP';
    setInitials(formattedInitials);
  }, [name, email]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (isSaving) return;

    setIsSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        data: { display_name: name.trim() }
      });

      if (error) throw error;

      setSuccessMsg('Profil bilgileriniz başarıyla güncellendi.');
      router.refresh();
    } catch (err: any) {
      console.error('[handleSave] Error updating profile:', err);
      setErrorMsg(err.message || 'Profil güncellenirken bir hata oluştu.');
    } finally {
      setIsSaving(false);
    }
  }

  if (!isLoaded) {
    return (
      <div className="w-full max-w-xl mx-auto py-24 text-center text-xs font-bold text-[#8c869e] animate-pulse">
        Kullanıcı bilgileri yükleniyor...
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto space-y-6 animate-fade-in-up pb-12 text-[#c9c5d8] px-2 text-left">
      {/* Title Header */}
      <div className="border-b border-white/5 pb-5">
        <h1 className="text-xl font-black text-white tracking-tight">Profil Ayarları</h1>
        <p className="text-xs text-[#8c869e] mt-1">Giriş yaptığınız kullanıcı bilgilerini görüntüleyin ve güncelleyin.</p>
      </div>

      {/* Main Settings Card */}
      <form onSubmit={handleSave} className="glass-card rounded-xl p-6 md:p-8 space-y-6 border border-white/5 bg-white/[0.02]">
        
        {/* Avatar Display */}
        <div className="flex items-center gap-4 border-b border-white/5 pb-5">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#4f20c0] to-[#b5179e] text-white flex items-center justify-center font-black text-xl shadow-lg shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <h3 className="font-black text-white text-base leading-none truncate">{name || 'Ajans Yöneticisi'}</h3>
            <span className="text-[10px] text-[#8c869e] block mt-2 font-bold truncate">{email}</span>
          </div>
        </div>

        {/* Inputs */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-black text-white block">E-posta Adresi</label>
            <input
              type="email"
              disabled
              value={email}
              className="w-full bg-[#0e0b1a]/40 border border-white/5 rounded-md px-4 py-3 text-xs font-semibold text-[#8c869e] cursor-not-allowed select-none outline-none"
            />
            <span className="text-[9px] text-[#8c869e] block">E-posta adresi giriş yöntemiyle ilişkilidir, değiştirilemez.</span>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-white block">Ad Soyad (Display Name)</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Adınız Soyadınız"
              required
              className="w-full bg-[#0e0b1a] border border-white/10 rounded-md px-4 py-3 text-xs font-semibold text-white focus:outline-none focus:border-[#4f20c0] placeholder-[#7d778f] transition-all"
            />
          </div>
        </div>

        {/* Alerts */}
        {successMsg && (
          <div className="p-3.5 bg-emerald-950/20 border border-emerald-900/30 text-emerald-450 text-xs font-bold rounded-md flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span>{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="p-3.5 bg-red-950/20 border border-red-900/30 text-red-400 text-xs font-bold rounded-md flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isSaving}
          className="w-full bg-gradient-to-r from-[#4f20c0] to-[#b5179e] hover:scale-[1.01] text-white py-3 rounded font-extrabold text-xs shadow-lg shadow-purple-500/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <span className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full" />
              <span>Kaydediliyor...</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[16px]">save</span>
              <span>Değişiklikleri Kaydet</span>
            </>
          )}
        </button>

      </form>
    </div>
  );
}
