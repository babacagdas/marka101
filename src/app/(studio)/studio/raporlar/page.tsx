// src/app/(studio)/studio/raporlar/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

interface ReportItem {
  id: string;
  brand_name: string;
  updated_at: string;
  status: string;
}

export default function RaporlarPage() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchReports() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('diagnoses')
          .select('id, brand_name, updated_at, status')
          .in('status', ['output_ready', 'completed'])
          .order('updated_at', { ascending: false });
        if (data) {
          setReports(data);
        }
      } catch (err) {
        console.error('Error fetching reports:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchReports();
  }, []);

  return (
    <div className="w-full space-y-6 animate-fade-in-up pb-12 px-2 text-gray-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h1 className="text-xl font-black text-gray-800 tracking-tight">Raporlar</h1>
          <p className="text-xs text-gray-400 mt-1">Ajans süreçleri, marka teşhis çıktıları ve pazarlama performansı raporlama merkezi.</p>
        </div>
        <button className="bg-gradient-to-r from-[#4f20c0] to-[#b5179e] text-white font-extrabold text-xs px-4 py-2.5 rounded transition-all shadow-md hover:scale-[1.02]">
          Rapor Oluştur (Export PDF)
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="glass-card rounded-md p-6">
            <h3 className="text-sm font-black text-[#f1ecf9] mb-4">Mevcut Rapor Dosyaları</h3>
            <div className="space-y-3">
              {isLoading ? (
                <div className="p-8 text-xs font-bold text-[#8c869e] text-center animate-pulse">
                  Raporlar yükleniyor...
                </div>
              ) : reports.length === 0 ? (
                <div className="p-8 text-xs font-bold text-[#8c869e] text-center border border-dashed border-white/10 rounded bg-white/5">
                  Henüz hazır rapor bulunmuyor. Teşhis formları incelenip onaylandığında raporlar otomatik olarak burada listelenecektir.
                </div>
              ) : (
                reports.map((rep) => (
                  <div key={rep.id} className="flex justify-between items-center p-4 bg-white/5 border border-white/5 rounded hover:bg-white/10 transition-all text-xs font-bold text-[#c9c5d8]">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-red-400">picture_as_pdf</span>
                      <div>
                        <h4 className="font-black text-[#f1ecf9]">{rep.brand_name} Teşhis Raporu</h4>
                        <p className="text-[10px] text-[#8c869e] mt-0.5">
                          {new Date(rep.updated_at).toLocaleDateString('tr-TR')} • Hazır
                        </p>
                      </div>
                    </div>
                    <Link 
                      href={`/studio/marka101/${rep.id}/sonuc`}
                      className="text-[#ccbdff] hover:text-[#e81cff] font-black text-[10px] bg-white/5 border border-white/10 px-3 py-1.5 rounded-sm transition-all"
                    >
                      Görüntüle
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="glass-card rounded-md p-6 space-y-4 border border-white/5">
          <h3 className="text-xs font-black uppercase text-[#8c869e] tracking-wider">Otomatik Raporlama</h3>
          <p className="text-xs font-bold text-[#8c869e] leading-relaxed">
            Haftalık e-posta raporları her Pazartesi 09:00 tarihinde yönetim ekibine ve müşterilere gönderilmektedir.
          </p>
        </div>
      </div>
    </div>
  );
}
