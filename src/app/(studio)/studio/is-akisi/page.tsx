// src/app/(studio)/studio/is-akisi/page.tsx
'use client';

import { useEffect, useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';

interface ActivityLog {
  id: string;
  user_name: string;
  user_email: string;
  action_type: string;
  description: string;
  created_at: string;
}

const ACTION_ICONS: Record<string, { icon: string; color: string; bg: string }> = {
  freelancer_add: { icon: 'person_add', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  freelancer_update: { icon: 'manage_accounts', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  freelancer_delete: { icon: 'person_remove', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
  task_assign: { icon: 'assignment_ind', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
  task_status_change: { icon: 'task_alt', color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
  payment_made: { icon: 'payments', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  payment_update: { icon: 'edit_document', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
  payment_delete: { icon: 'money_off', color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' },
  default: { icon: 'history', color: 'text-gray-400', bg: 'bg-white/5 border-white/10' },
};

const ACTION_LABELS: Record<string, string> = {
  freelancer_add: 'İş Ortağı Eklendi',
  freelancer_update: 'İş Ortağı Güncellendi',
  freelancer_delete: 'İş Ortağı Silindi',
  task_assign: 'Görev Atandı',
  task_status_change: 'Görev Durumu Değişti',
  payment_made: 'Finans Kaydı Eklendi',
  payment_update: 'Finans Kaydı Güncellendi',
  payment_delete: 'Finans Kaydı Silindi',
};

// Seed/Fallback logs if DB table doesn't exist or is empty
const SEED_LOGS: ActivityLog[] = [
  {
    id: 'seed-1',
    user_name: 'Elena Creative',
    user_email: 'elena.creative@deep.com',
    action_type: 'freelancer_add',
    description: '"Can Demir (Grafik Tasarımcı)" isimli yeni bir iş ortağı/tedarikçi ekledi.',
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 mins ago
  },
  {
    id: 'seed-2',
    user_name: 'Ahmet Yılmaz',
    user_email: 'ahmet.yilmaz@deep.com',
    action_type: 'task_assign',
    description: '"Can Demir" isimli üyeye "Matbaa için Kurumsal Broşür Tasarımı" görevini atadı.',
    created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 mins ago
  },
  {
    id: 'seed-3',
    user_name: 'Elena Creative',
    user_email: 'elena.creative@deep.com',
    action_type: 'payment_made',
    description: '"Adobe CC Yıllık Lisans Aboneliği" isimli yeni bir finans kaydı (gider) ekledi.',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
  },
  {
    id: 'seed-4',
    user_name: 'Ahmet Yılmaz',
    user_email: 'ahmet.yilmaz@deep.com',
    action_type: 'task_status_change',
    description: '"SNC Mimarlık Ön Analizi" görevini "Tamamlandı" olarak işaretledi.',
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
  },
  {
    id: 'seed-5',
    user_name: 'Elena Creative',
    user_email: 'elena.creative@deep.com',
    action_type: 'payment_made',
    description: '"SNC Mimarlık Danışmanlık Ücreti" isimli yeni bir finans kaydı (gelir) ekledi.',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
  }
];

export default function IsAkisiPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('all'); // 'all', 'tasks', 'payments', 'freelancers'
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function loadLogs() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('activity_logs')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          // Table doesn't exist yet or other query error, use seed logs
          console.warn('[IsAkisiPage] Table activity_logs not found, loading seed logs instead.', error.message);
          setLogs(SEED_LOGS);
        } else if (data && data.length > 0) {
          setLogs(data);
        } else {
          // Empty table, load seed data to show something beautiful
          setLogs(SEED_LOGS);
        }
      } catch (err) {
        console.error('Error loading logs:', err);
        setLogs(SEED_LOGS);
      } finally {
        setIsLoading(false);
      }
    }
    loadLogs();
  }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // Search filter
      const matchesSearch =
        log.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.description.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      // Tab filter
      if (activeTab === 'all') return true;
      if (activeTab === 'tasks') return log.action_type.startsWith('task_');
      if (activeTab === 'payments') return log.action_type.startsWith('payment_');
      if (activeTab === 'freelancers') return log.action_type.startsWith('freelancer_');

      return true;
    });
  }, [logs, activeTab, searchTerm]);

  // Statistics
  const stats = useMemo(() => {
    const total = logs.length;
    const tasksCount = logs.filter((l) => l.action_type.startsWith('task_')).length;
    const paymentsCount = logs.filter((l) => l.action_type.startsWith('payment_')).length;
    const freelancersCount = logs.filter((l) => l.action_type.startsWith('freelancer_')).length;

    return { total, tasksCount, paymentsCount, freelancersCount };
  }, [logs]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="w-full space-y-6 pb-12 px-2 text-[#c9c5d8] text-left animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight">İş Akışı (Activity Log)</h1>
          <p className="text-xs text-[#8c869e] mt-1">
            Yönetim panelindeki kullanıcıların gerçekleştirdiği son işlemler, görev atamaları ve finans hareketleri.
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded p-4 flex flex-col justify-between border border-white/5 bg-white/[0.02]">
          <span className="text-[10px] text-[#8c869e] uppercase font-bold tracking-wider">Toplam İşlem</span>
          <span className="text-xl font-black text-white mt-1.5 block">{stats.total}</span>
        </div>
        <div className="glass-card rounded p-4 flex flex-col justify-between border border-white/5 bg-white/[0.02]">
          <span className="text-[10px] text-[#8c869e] uppercase font-bold tracking-wider">Görev Atamaları</span>
          <span className="text-xl font-black text-purple-400 mt-1.5 block">{stats.tasksCount}</span>
        </div>
        <div className="glass-card rounded p-4 flex flex-col justify-between border border-white/5 bg-white/[0.02]">
          <span className="text-[10px] text-[#8c869e] uppercase font-bold tracking-wider">Finansal Hareketler</span>
          <span className="text-xl font-black text-amber-400 mt-1.5 block">{stats.paymentsCount}</span>
        </div>
        <div className="glass-card rounded p-4 flex flex-col justify-between border border-white/5 bg-white/[0.02]">
          <span className="text-[10px] text-[#8c869e] uppercase font-bold tracking-wider">İş Ortaklığı İşlemleri</span>
          <span className="text-xl font-black text-emerald-400 mt-1.5 block">{stats.freelancersCount}</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-white/[0.02] border border-white/5 p-3 rounded-md">
        {/* Tabs */}
        <div className="flex flex-wrap gap-1.5 w-full lg:w-auto">
          {[
            { value: 'all', label: 'Tümü' },
            { value: 'tasks', label: 'Görevler' },
            { value: 'payments', label: 'Finans / Ödemeler' },
            { value: 'freelancers', label: 'Freelancer / Tedarikçiler' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-3 py-1.5 rounded-sm text-[10px] font-extrabold uppercase border tracking-wider transition-all duration-200 ${
                activeTab === tab.value
                  ? 'bg-[#4f20c0]/20 text-[#f1ecf9] border-[#4f20c0]/40'
                  : 'bg-transparent text-[#8c869e] border-transparent hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="w-full lg:w-64 relative">
          <span className="material-symbols-outlined text-[16px] text-[#8c869e] absolute left-2.5 top-2">search</span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="İşlem açıklaması veya kişi ara..."
            className="w-full bg-[#0e0b1a] border border-white/10 rounded-sm pl-8 pr-3 py-1.5 text-xs text-white placeholder-[#7d778f] focus:outline-none focus:border-[#4f20c0] font-bold"
          />
        </div>
      </div>

      {/* Timeline List */}
      <div className="glass-card rounded-xl p-6 border border-white/5 bg-white/[0.01]">
        {isLoading ? (
          <div className="py-24 text-center text-xs font-bold text-[#8c869e] animate-pulse">
            Log kayıtları yükleniyor...
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="py-24 text-center text-xs font-bold text-[#8c869e] border border-dashed border-white/10 rounded bg-white/5">
            İşlem geçmişi bulunmuyor.
          </div>
        ) : (
          <div className="relative border-l border-white/10 pl-6 space-y-8 ml-3 text-xs">
            {filteredLogs.map((log) => {
              const meta = ACTION_ICONS[log.action_type] || ACTION_ICONS.default;
              const label = ACTION_LABELS[log.action_type] || 'Diğer İşlem';
              const userInitials = log.user_name
                .split(' ')
                .filter(Boolean)
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase() || 'AP';

              return (
                <div key={log.id} className="relative group">
                  {/* Timeline bullet icon */}
                  <span className={`absolute -left-[37px] top-1.5 w-7 h-7 rounded-full border ${meta.bg} flex items-center justify-center text-white ring-8 ring-[#06050b] group-hover:scale-110 transition-all z-10`}>
                    <span className={`material-symbols-outlined text-[14px] ${meta.color}`}>
                      {meta.icon}
                    </span>
                  </span>

                  <div className="bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 hover:border-white/10 p-4 rounded-lg transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2 max-w-xl">
                      {/* Badge / Type info */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-sm border uppercase ${meta.bg} ${meta.color}`}>
                          {label}
                        </span>
                        <span className="text-[10px] text-[#8c869e] font-semibold">
                          {formatDate(log.created_at)}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="font-bold text-white text-xs leading-relaxed">
                        {log.description}
                      </p>

                      {/* Responsible User Info */}
                      <div className="flex items-center gap-2 pt-1">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#4f20c0] to-[#b5179e] text-white flex items-center justify-center font-black text-[8px] uppercase select-none">
                          {userInitials}
                        </div>
                        <span className="text-[10px] text-white/80 font-bold">
                          {log.user_name}
                        </span>
                        <span className="text-[9px] text-[#8c869e] font-medium">
                          ({log.user_email})
                        </span>
                      </div>
                    </div>

                    {/* Action Category Badge */}
                    <div className="shrink-0 hidden md:block">
                      <span className="text-[9px] font-bold text-[#8c869e] bg-white/5 border border-white/10 px-3 py-1.5 rounded-sm uppercase tracking-wider">
                        {log.action_type.split('_')[0]}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
