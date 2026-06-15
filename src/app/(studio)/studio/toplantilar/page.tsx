// src/app/(studio)/studio/toplantilar/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAgency } from '@/features/diagnoses/components/studio/AgencyContext';

interface Meeting {
  id: string;
  client_id?: string;
  title: string;
  description?: string;
  scheduled_at: string;
  meeting_link?: string;
  host_name?: string;
}

export default function ToplantilarPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledAt, setScheduledAt] = useState('2026-06-08T14:00');
  const [meetingLink, setMeetingLink] = useState('');
  const [hostName, setHostName] = useState('Elena Creative');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { clients } = useAgency();

  const fetchMeetings = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('meetings')
        .select('*')
        .order('scheduled_at', { ascending: true });
      if (data) {
        setMeetings(data);
      }
    } catch (err) {
      console.error('Error fetching meetings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !scheduledAt) return;

    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('meetings')
        .insert({
          title: title.trim(),
          description: description.trim() || null,
          scheduled_at: new Date(scheduledAt).toISOString(),
          meeting_link: meetingLink.trim() || null,
          host_name: hostName.trim() || 'Elena Creative',
          client_id: selectedClientId || null,
        })
        .select()
        .single();

      if (data) {
        setMeetings((prev) => [...prev, data].sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()));
        setShowModal(false);
        showToast(`"${title.trim()}" toplantısı başarıyla oluşturuldu.`);
        // Reset form
        setTitle('');
        setDescription('');
        setMeetingLink('');
        setHostName('Elena Creative');
        setSelectedClientId('');
      }
    } catch (err) {
      console.error('Error scheduling meeting:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-6 animate-fade-in-up pb-12 px-2 text-[#c9c5d8] relative">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-24 right-6 bg-[#0e0b20] border border-[#b5179e]/30 px-5 py-4 rounded-lg shadow-2xl text-xs font-bold text-[#f6f5fa] z-50 flex items-center gap-3 animate-fade-in-up">
          <span className="material-symbols-outlined text-[#b5179e] animate-pulse">event_available</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
        <div>
          <h1 className="text-xl font-black text-[#f6f5fa] tracking-tight">Toplantılar</h1>
          <p className="text-xs text-[#928ca1] mt-1 font-medium">Planlanan müşteri görüşmeleri, kreatif beyin fırtınaları ve ajans içi toplantı yönetimi.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-[#4f20c0] to-[#b5179e] text-white font-extrabold text-xs px-4 py-2.5 rounded-lg transition-all shadow-md shadow-purple-500/10 hover:scale-[1.02] active:scale-[0.98]"
        >
          Yeni Toplantı Planla
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column list of meetings */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-card rounded-lg p-6 border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#b5179e]/5 rounded-full blur-[100px] pointer-events-none" />

            <h3 className="text-sm font-black text-[#f6f5fa] mb-5 flex items-center gap-2 border-b border-white/5 pb-3">
              <span className="material-symbols-outlined text-[#b5179e]">video_call</span>
              <span>Yaklaşan Görüşmeler</span>
            </h3>

            <div className="space-y-3.5">
              {isLoading ? (
                <div className="p-8 text-xs font-bold text-[#928ca1] text-center animate-pulse">
                  Görüşmeler yükleniyor...
                </div>
              ) : meetings.length === 0 ? (
                <div className="p-8 text-xs font-bold text-[#928ca1] text-center border border-dashed border-white/10 rounded-lg bg-[#100d24]/10">
                  Planlanmış bir toplantı bulunmuyor.
                </div>
              ) : (
                meetings.map((top) => (
                  <div key={top.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-[#140e2c]/50 border border-white/5 rounded-lg hover:bg-[#181134]/70 transition-all text-xs font-bold text-[#c9c5d8]">
                    <div className="space-y-1.5 flex-1">
                      <h4 className="font-extrabold text-[#f6f5fa] text-sm">{top.title}</h4>
                      <div className="flex flex-wrap items-center gap-2 text-[10px] text-[#928ca1]">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">schedule</span>
                          {new Date(top.scheduled_at).toLocaleString('tr-TR', { dateStyle: 'medium', timeStyle: 'short' })}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">person</span>
                          Düzenleyen: {top.host_name ?? 'Elena Creative'}
                        </span>
                      </div>
                      {top.description && (
                        <p className="text-[10px] text-[#928ca1] font-medium leading-relaxed mt-1">{top.description}</p>
                      )}
                    </div>
                    {top.meeting_link && (
                      <a
                        href={top.meeting_link.startsWith('http') ? top.meeting_link : `https://${top.meeting_link}`}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-[#4f20c0] hover:scale-[1.03] active:scale-[0.98] text-white px-4 py-2 rounded-lg transition-all text-[10px] font-extrabold text-center shrink-0 shadow-md shadow-purple-500/15"
                      >
                        Görüşmeye Katıl
                      </a>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right column statistics widget */}
        <div className="space-y-6 lg:col-span-1">
          <div className="glass-card rounded-lg p-5 border border-white/5 space-y-4">
            <h3 className="text-xs font-black uppercase text-[#928ca1] tracking-wider border-b border-white/5 pb-3">
              Hızlı İstatistikler
            </h3>
            <div className="space-y-3.5 text-xs font-bold text-[#c9c5d8]">
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-[#928ca1]">Planlanan Toplantı:</span>
                <span className="text-[#f6f5fa] font-black">{meetings.length} adet</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-[#928ca1]">Bu Haftaki Görüşme:</span>
                <span className="text-[#f6f5fa] font-black">
                  {meetings.filter(m => {
                    const diffTime = new Date(m.scheduled_at).getTime() - new Date().getTime();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    return diffDays >= 0 && diffDays <= 7;
                  }).length} adet
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Shared Booking Scheduling Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in-up">
          <div className="glass-panel rounded-lg p-6 md:p-8 max-w-md w-full border border-white/10 shadow-2xl space-y-6 text-[#c9c5d8] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#b5179e]/5 rounded-full blur-[50px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#4f20c0]/5 rounded-full blur-[50px] pointer-events-none" />

            <div>
              <h3 className="text-base font-black text-[#f6f5fa]">Yeni Toplantı Planla</h3>
              <p className="text-[10px] text-[#928ca1] mt-1 font-medium">Ajansınız için yeni bir müşteri randevusu veya iç toplantı planlayın.</p>
            </div>

            <form onSubmit={handleCreateMeeting} className="space-y-4 text-xs font-bold text-[#c9c5d8]">
              <div className="space-y-1.5">
                <label className="block text-[9px] font-bold text-[#928ca1] uppercase tracking-wider">Toplantı Konusu *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Örn: Natura Kozmetik Kickoff Görüşmesi"
                  className="w-full bg-[#0e0b1a]/70 border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-[#f1ecf9] placeholder-[#7d778f] focus:outline-none focus:border-[#4f20c0] transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[9px] font-bold text-[#928ca1] uppercase tracking-wider">Açıklama / Detaylar</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Görüşme gündemi ve notlar..."
                  className="w-full bg-[#0e0b1a]/70 border border-white/10 rounded-lg px-3.5 py-2 text-xs text-[#f1ecf9] placeholder-[#7d778f] focus:outline-none focus:border-[#4f20c0] transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-bold text-[#928ca1] uppercase tracking-wider">Tarih & Saat *</label>
                  <input
                    type="datetime-local"
                    required
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    className="w-full bg-[#0e0b1a]/70 border border-white/10 rounded-lg px-3.5 py-2 text-xs text-[#f1ecf9] focus:outline-none focus:border-[#4f20c0] transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-bold text-[#928ca1] uppercase tracking-wider">Görüşme Linki (Google Meet / Zoom)</label>
                  <input
                    type="text"
                    value={meetingLink}
                    onChange={(e) => setMeetingLink(e.target.value)}
                    placeholder="meet.google.com/abc-defg-hij"
                    className="w-full bg-[#0e0b1a]/70 border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-[#f1ecf9] placeholder-[#7d778f] focus:outline-none focus:border-[#4f20c0] transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-bold text-[#928ca1] uppercase tracking-wider">Host (Düzenleyen)</label>
                  <input
                    type="text"
                    value={hostName}
                    onChange={(e) => setHostName(e.target.value)}
                    className="w-full bg-[#0e0b1a]/70 border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-[#f1ecf9] focus:outline-none focus:border-[#4f20c0] transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-bold text-[#928ca1] uppercase tracking-wider">İlgili Müşteri</label>
                  <select
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    className="w-full bg-[#0e0b1a]/70 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-[#f1ecf9] focus:outline-none cursor-pointer focus:border-[#4f20c0] transition-all"
                  >
                    <option value="">Seçiniz</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.companyName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-1/2 bg-white/5 border border-white/10 hover:bg-white/10 text-[#928ca1] py-3 rounded-lg font-extrabold transition-all"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-1/2 bg-gradient-to-r from-[#4f20c0] to-[#b5179e] hover:scale-[1.02] active:scale-[0.98] text-white py-3 rounded-lg font-extrabold shadow-lg shadow-purple-500/10 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Kaydediliyor...' : 'Toplantıyı Planla'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
