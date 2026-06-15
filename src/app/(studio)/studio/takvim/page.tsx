// src/app/(studio)/studio/takvim/page.tsx
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

export default function TakvimPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Month navigation state
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(5); // 0-indexed (June = 5)

  // Selected date state YYYY-MM-DD
  const [selectedDate, setSelectedDate] = useState('2026-06-08');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledAt, setScheduledAt] = useState('2026-06-08T14:00');
  const [meetingLink, setMeetingLink] = useState('');
  const [hostName, setHostName] = useState('Elena Creative');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toast alert state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { clients, projects } = useAgency();

  const MONTH_NAMES = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];

  // Fetch all meetings from database
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
        setMeetings(prev => [...prev, data]);
        setShowModal(false);
        showToast(`"${title.trim()}" toplantısı başarıyla takvime eklendi.`);
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

  // Helper date formatting
  const formatDateKey = (year: number, month: number, day: number) => {
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
  };

  const matchMeetingDate = (meet: Meeting, dateKey: string) => {
    if (!meet.scheduled_at) return false;
    try {
      const datePart = meet.scheduled_at.split('T')[0];
      return datePart === dateKey;
    } catch (e) {
      return false;
    }
  };

  const matchProjectDeadline = (proj: any, dateKey: string) => {
    if (!proj.deadline) return false;
    if (proj.deadline.includes(dateKey)) return true;
    try {
      const parts = proj.deadline.split('.');
      if (parts.length === 3) {
        const pDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        return pDate === dateKey;
      }
    } catch (e) {}
    return false;
  };

  // Month-to-month handlers
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  // Days calculations
  const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
  let firstDayIndex = new Date(currentYear, currentMonth, 1).getDay() - 1; // 0-6 starting Monday
  if (firstDayIndex === -1) firstDayIndex = 6; // Sunday index correction

  // Events on selected day
  const meetingsToday = meetings.filter(m => matchMeetingDate(m, selectedDate));
  const projectsToday = projects.filter(p => matchProjectDeadline(p, selectedDate));

  return (
    <div className="w-full space-y-6 animate-fade-in-up pb-12 px-2 text-gray-700 relative">
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
          <h1 className="text-xl font-black text-[#f6f5fa] tracking-tight">Takvim</h1>
          <p className="text-xs text-[#928ca1] mt-1 font-medium">Ajans iş programı, proje teslim tarihleri ve planlanan toplantılar.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-[#4f20c0] to-[#b5179e] text-white font-extrabold text-xs px-4 py-2.5 rounded-lg transition-all shadow-md shadow-purple-500/10 hover:scale-[1.02] active:scale-[0.98]"
        >
          Etkinlik Ekle
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Left Card */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-card rounded-lg p-6 border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#b5179e]/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
              <h3 className="text-sm font-black text-[#f6f5fa] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#b5179e]">calendar_month</span>
                <span>{MONTH_NAMES[currentMonth]} {currentYear} İş Programı</span>
              </h3>
              
              <div className="flex items-center gap-2 bg-[#0e0b1a]/60 border border-white/5 p-1 rounded-lg">
                <button 
                  onClick={handlePrevMonth}
                  className="w-8 h-8 rounded-md bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#f6f5fa] transition-all"
                >
                  <span className="material-symbols-outlined text-sm">chevron_left</span>
                </button>
                <button 
                  onClick={handleNextMonth}
                  className="w-8 h-8 rounded-md bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#f6f5fa] transition-all"
                >
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
              </div>
            </div>

            {/* Calendar Grid Header */}
            <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-black text-[#928ca1] uppercase tracking-wider border-b border-white/5 pb-3 mb-3">
              <span>Pt</span><span>Sa</span><span>Ça</span><span>Pe</span><span>Cu</span><span>Ct</span><span>Pz</span>
            </div>

            {/* Calendar Grid Cells */}
            <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-[#c9c5d8]">
              {/* Offset days */}
              {Array.from({ length: firstDayIndex }).map((_, idx) => (
                <div key={`offset-${idx}`} className="p-3 bg-transparent border border-transparent" />
              ))}

              {/* Monthly days */}
              {Array.from({ length: totalDays }).map((_, idx) => {
                const day = idx + 1;
                const dateKey = formatDateKey(currentYear, currentMonth, day);
                const hasMeeting = meetings.some(m => matchMeetingDate(m, dateKey));
                const hasDeadline = projects.some(p => matchProjectDeadline(p, dateKey));
                const isSelected = selectedDate === dateKey;

                return (
                  <button
                    key={`day-${day}`}
                    onClick={() => setSelectedDate(dateKey)}
                    className={`p-3 rounded-lg flex flex-col items-center justify-center border transition-all ${
                      isSelected
                        ? 'bg-[#4f20c0]/35 border-[#b5179e]/60 text-[#f6f5fa] font-black scale-[1.05] shadow-lg shadow-purple-500/10'
                        : 'bg-[#0f0b1a]/40 border-white/5 hover:bg-[#18122c]/60 hover:border-white/10 text-[#c9c5d8]'
                    }`}
                  >
                    <span>{day}</span>
                    <div className="flex gap-1 mt-1 shrink-0">
                      {hasMeeting && <span className="w-1.5 h-1.5 bg-[#b5179e] rounded-full animate-pulse" />}
                      {hasDeadline && <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Info Legend */}
            <div className="flex gap-4 mt-6 pt-4 border-t border-white/5 text-[10px] font-bold text-[#928ca1]">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#b5179e]" /> Toplantılar</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400" /> Proje Teslimleri</span>
            </div>
          </div>
        </div>

        {/* Sidebar Day Details */}
        <div className="space-y-6 lg:col-span-1">
          <div className="glass-card rounded-lg p-6 space-y-4 border border-white/5">
            <h3 className="text-xs font-black uppercase text-[#928ca1] tracking-wider border-b border-white/5 pb-3 flex items-center justify-between">
              <span>Günün Etkinlikleri</span>
              <span className="text-[#f6f5fa] font-black text-[10px] bg-[#4f20c0]/30 px-2 py-0.5 rounded-full border border-white/5">
                {new Date(selectedDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
              </span>
            </h3>

            {isLoading ? (
              <div className="p-6 text-center text-xs font-bold text-[#928ca1] animate-pulse">Yükleniyor...</div>
            ) : meetingsToday.length === 0 && projectsToday.length === 0 ? (
              <div className="p-8 border border-dashed border-white/5 rounded-lg text-center bg-[#100d24]/10 text-[#928ca1] text-[11px]">
                <span className="material-symbols-outlined text-[32px] text-white/10 block mb-1">event_busy</span>
                Bu tarihte planlanmış bir etkinlik bulunmuyor.
              </div>
            ) : (
              <div className="space-y-4 pr-1 max-h-[360px] overflow-y-auto scrollbar-thin">
                {/* Render meetings */}
                {meetingsToday.map((top) => (
                  <div key={top.id} className="p-3.5 bg-[#140e2c]/50 border border-white/5 rounded-lg space-y-2 text-xs text-[#c9c5d8] font-bold">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-extrabold text-[#f6f5fa]">{top.title}</h4>
                        <p className="text-[9px] text-[#928ca1] mt-0.5">Host: {top.host_name ?? 'Elena Creative'}</p>
                      </div>
                      <span className="text-[9px] font-black text-[#b5179e] bg-[#b5179e]/10 px-2 py-0.5 rounded border border-[#b5179e]/20">
                        {new Date(top.scheduled_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {top.description && (
                      <p className="text-[10px] text-[#928ca1] font-medium leading-relaxed bg-[#0e0b1a]/30 p-2 rounded">
                        {top.description}
                      </p>
                    )}
                    {top.meeting_link && (
                      <a 
                        href={top.meeting_link.startsWith('http') ? top.meeting_link : `https://${top.meeting_link}`}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-[#4f20c0] hover:scale-[1.02] active:scale-[0.98] text-white border border-[#4f20c0]/30 py-1.5 rounded-md transition-all text-[10px] font-extrabold block text-center shadow-md shadow-purple-500/10"
                      >
                        Görüşmeye Katıl
                      </a>
                    )}
                  </div>
                ))}

                {/* Render project deadlines */}
                {projectsToday.map((proj) => (
                  <div key={proj.id} className="p-3.5 bg-[#1a142c]/20 border border-amber-400/10 rounded-lg space-y-2 text-xs text-[#c9c5d8] font-bold">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-extrabold text-[#f6f5fa]">{proj.name}</h4>
                        <p className="text-[9px] text-amber-400/95 mt-0.5 uppercase tracking-wide">Proje Teslim Tarihi</p>
                      </div>
                      <span className="text-[9px] font-black text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                        İlerleme: %{proj.progress}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Booking Scheduling Modal */}
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
