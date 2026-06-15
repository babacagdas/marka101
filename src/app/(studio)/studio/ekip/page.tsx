// src/app/(studio)/studio/ekip/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  avatar_color?: string;
}

export default function EkipPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [email, setEmail] = useState('');
  const [avatarColor, setAvatarColor] = useState('from-[#4f20c0] to-[#b5179e]');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMembers() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('team_members')
          .select('*')
          .order('created_at', { ascending: true });
        if (data) {
          setMembers(data);
        }
      } catch (err) {
        console.error('Error fetching members:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchMembers();
  }, []);

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !role.trim() || !email.trim()) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data, error: insertErr } = await supabase
        .from('team_members')
        .insert({
          name: name.trim(),
          role: role.trim(),
          email: email.trim().toLowerCase(),
          avatar_color: avatarColor,
        })
        .select()
        .single();

      if (insertErr) {
        setError('Bu e-posta adresiyle kayıtlı bir üye zaten mevcut.');
      } else if (data) {
        setMembers((prev) => [...prev, data]);
        setShowModal(false);
        // Reset form
        setName('');
        setRole('');
        setEmail('');
        setAvatarColor('from-[#4f20c0] to-[#b5179e]');
      }
    } catch (err) {
      console.error('Error inviting team member:', err);
      setError('İşlem sırasında bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const AVATAR_COLORS = [
    { value: 'from-[#4f20c0] to-[#b5179e]', label: 'Mor - Pembe' },
    { value: 'from-[#00b4d8] to-[#0077b6]', label: 'Mavi' },
    { value: 'from-[#f72585] to-[#7209b7]', label: 'Magenta' },
    { value: 'from-[#f59e0b] to-[#d97706]', label: 'Turuncu' },
  ];

  return (
    <div className="w-full space-y-6 animate-fade-in-up pb-12 px-2 text-[#c9c5d8] text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight">Ekip Yönetimi</h1>
          <p className="text-xs text-[#8c869e] mt-1">Ajans çalışanları, aktif roller ve ekip içi görev dağılım matrisi.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-[#4f20c0] to-[#b5179e] text-white font-extrabold text-xs px-5 py-2.5 rounded transition-all shadow-[0_4px_15px_rgba(79,32,192,0.3)] hover:scale-[1.02]"
        >
          Yeni Üye Ekle
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="glass-card rounded-md p-6 border border-white/5">
            <h3 className="text-sm font-black text-white mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#b5179e]">badge</span>
              <span>Aktif Ekip Üyeleri</span>
            </h3>

            <div className="space-y-3">
              {isLoading ? (
                <div className="p-8 text-xs font-bold text-[#8c869e] text-center animate-pulse">
                  Ekip üyeleri yükleniyor...
                </div>
              ) : members.length === 0 ? (
                <div className="p-8 text-xs font-bold text-[#8c869e] text-center border border-dashed border-white/10 rounded bg-white/5">
                  Henüz bir ekip üyesi eklenmemiş.
                </div>
              ) : (
                members.map((member) => (
                  <div key={member.id} className="flex justify-between items-center p-4 bg-white/[0.02] border border-white/5 rounded hover:border-[#4f20c0]/30 transition-all text-xs font-bold text-[#f1ecf9]">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded bg-gradient-to-br ${member.avatar_color ?? 'from-[#4f20c0] to-[#b5179e]'} text-white flex items-center justify-center font-black text-[10px]`}>
                        {member.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-black text-white">{member.name}</h4>
                        <p className="text-[10px] text-[#8c869e] mt-0.5">{member.role}</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-[#8c869e] font-semibold">{member.email}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="glass-card rounded-md p-6 space-y-4 border border-white/5">
          <h3 className="text-xs font-black uppercase text-[#8c869e] tracking-wider">İş Yükü Dağılımı</h3>
          <p className="text-xs font-bold text-[#8c869e] leading-relaxed">
            {members.length === 0 
              ? 'Şu anda kayıtlı bir ekip üyesi bulunmadığı için iş yükü dağılımı hesaplanamıyor.' 
              : 'Ekip içi görev atamalarını bu panelden yönetebilirsiniz.'}
          </p>
        </div>
      </div>

      {/* Team Member Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" style={{ backdropFilter: 'blur(80px)', WebkitBackdropFilter: 'blur(80px)' }}>
          <div className="bg-[#0c0a18]/95 border border-white/10 rounded-xl p-6 md:p-8 max-w-md w-full shadow-[0_15px_50px_rgba(0,0,0,0.8)] space-y-6 text-[#c9c5d8] animate-scale-up text-left">
            <div>
              <h3 className="text-base font-black text-white">Yeni Ekip Üyesi Davet Et</h3>
              <p className="text-[10px] text-[#8c869e] mt-1">Ajansınıza katılacak çalışma arkadaşı için profil oluşturun.</p>
            </div>
            
            <form onSubmit={handleCreateMember} className="space-y-4 text-xs font-bold">
              <div className="space-y-1">
                <label className="block text-[9px] font-bold text-[#8c869e] uppercase tracking-wider">Ad Soyad *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Örn: Ahmet Yılmaz"
                  className="w-full bg-[#0e0b1a] border border-white/10 rounded px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#4f20c0] transition-all font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] font-bold text-[#8c869e] uppercase tracking-wider">Rol / Ünvan *</label>
                <input
                  type="text"
                  required
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="Örn: UI/UX Designer"
                  className="w-full bg-[#0e0b1a] border border-white/10 rounded px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#4f20c0] transition-all font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] font-bold text-[#8c869e] uppercase tracking-wider">E-Posta Adresi *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ahmet@agency.com"
                  className="w-full bg-[#0e0b1a] border border-white/10 rounded px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#4f20c0] transition-all font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] font-bold text-[#8c869e] uppercase tracking-wider">Rozet / Avatar Rengi</label>
                <select
                  value={avatarColor}
                  onChange={(e) => setAvatarColor(e.target.value)}
                  className="w-full bg-[#0e0b1a] border border-white/10 rounded px-3 py-2.5 text-xs text-white focus:outline-none cursor-pointer focus:border-[#4f20c0] transition-all"
                >
                  {AVATAR_COLORS.map((col, idx) => (
                    <option key={idx} value={col.value} className="bg-[#0e0b1a]">
                      {col.label}
                    </option>
                  ))}
                </select>
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-sm font-bold text-[10px]">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-1/2 bg-white/5 border border-white/10 hover:bg-white/10 text-[#8c869e] hover:text-white py-3 rounded transition-all"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-1/2 bg-gradient-to-r from-[#4f20c0] to-[#b5179e] hover:scale-[1.02] text-white py-3 rounded font-extrabold shadow-lg shadow-purple-500/10 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Davet ediliyor...' : 'Ekibe Davet Et'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

