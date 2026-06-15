// src/app/(studio)/studio/bildirimler/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface NotificationItem {
  id: string;
  title: string;
  content?: string;
  is_read?: boolean;
  type?: string;
  created_at: string;
}

export default function BildirimlerPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .order('created_at', { ascending: false });
        if (data) {
          setNotifications(data);
        }
      } catch (err) {
        console.error('Error fetching notifications:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchNotifications();
  }, []);

  return (
    <div className="w-full space-y-6 animate-fade-in-up pb-12 px-2 text-gray-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h1 className="text-xl font-black text-gray-800 tracking-tight">Bildirim Merkezi</h1>
          <p className="text-xs text-gray-400 mt-1">Ajans süreçleri, atanan yeni görevler ve müşteri başvuru uyarıları.</p>
        </div>
        <button className="bg-purple-50 hover:bg-[#4f20c0] hover:text-white border border-[#4f20c0]/15 text-[#4f20c0] font-extrabold text-xs px-4 py-2.5 rounded transition-all shadow-sm">
          Tümünü Okundu İşaretle
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="glass-card rounded-md p-6">
            <h3 className="text-sm font-black text-gray-800 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#4f20c0]">notifications_active</span>
              <span>Son Bildirimler</span>
            </h3>

            <div className="space-y-3">
              {isLoading ? (
                <div className="p-8 text-xs font-bold text-gray-400 text-center animate-pulse">
                  Bildirimler yükleniyor...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-xs font-bold text-gray-400 text-center border border-dashed border-gray-200 rounded bg-white/20">
                  Yeni bir bildirim bulunmuyor.
                </div>
              ) : (
                notifications.map((bil) => (
                  <div key={bil.id} className="flex gap-4 p-4 bg-white/40 border border-white/60 rounded hover:bg-white/80 transition-all text-xs font-bold text-gray-700 items-start">
                    <span className="material-symbols-outlined text-purple-600 mt-0.5">
                      {bil.type === 'form' ? 'feed' : bil.type === 'task' ? 'task_alt' : 'verified_user'}
                    </span>
                    <div className="flex-1">
                      <h4 className="font-black text-gray-855">{bil.title}</h4>
                      <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">{bil.content}</p>
                      <span className="text-[8px] text-gray-400 block mt-1.5">{new Date(bil.created_at).toLocaleString('tr-TR')}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="glass-card rounded-md p-6 space-y-4">
          <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider">Bildirim Ayarları</h3>
          <p className="text-xs font-bold text-gray-555 leading-relaxed">
            Slack ve E-posta entegrasyonu aktif durumdadır. Önemli güncellemeler anlık olarak kanallara düşmektedir.
          </p>
        </div>
      </div>
    </div>
  );
}
