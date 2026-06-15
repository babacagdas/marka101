// src/app/(studio)/studio/musteriler/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAgency } from '@/features/diagnoses/components/studio/AgencyContext';

export default function MusterilerPage() {
  const { clients } = useAgency();
  const [selectedClientId, setSelectedClientId] = useState<string>('');

  useEffect(() => {
    if (clients.length > 0 && !selectedClientId) {
      setSelectedClientId(clients[0].id);
    }
  }, [clients, selectedClientId]);

  const activeClient = clients.find((c) => c.id === selectedClientId) ?? null;

  const statusLabels = {
    active: { label: 'Aktif Sözleşme', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
    expiring: { label: 'Süresi Azalan', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
    pending_renewal: { label: 'Yenileme Bekliyor', color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
  };

  return (
    <div className="w-full space-y-6 animate-fade-in-up pb-12 text-[#c9c5d8] px-2 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight">Kazanılan Müşteriler (Clients)</h1>
          <p className="text-xs text-[#8c869e] mt-1">
            Sözleşmesi devam eden firmalar, alınan hizmetler ve iletişim logları.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Client Listing Cards */}
        <div className="lg:col-span-1 space-y-4">
          {clients.map((client) => {
            const isActive = client.id === selectedClientId;
            // Map the colors for dark theme
            const status = client.contractStatus === 'active' 
              ? { label: 'Aktif Sözleşme', color: 'text-emerald-400 bg-emerald-950/20 border-emerald-900/30' }
              : client.contractStatus === 'expiring'
              ? { label: 'Süresi Azalan', color: 'text-amber-400 bg-amber-950/20 border-amber-900/30' }
              : { label: 'Yenileme Bekliyor', color: 'text-blue-400 bg-blue-950/20 border-blue-900/30' };

            return (
              <div
                key={client.id}
                onClick={() => setSelectedClientId(client.id)}
                className={`p-4 rounded-md border transition-all cursor-pointer flex items-center gap-4 ${
                  isActive
                    ? 'bg-[#4f20c0]/15 border-[#4f20c0] shadow-[0_8px_20px_rgba(79,32,192,0.15)]'
                    : 'glass-card glass-card-hover border-white/5'
                }`}
              >
                <div className="w-10 h-10 rounded bg-gradient-to-br from-[#4f20c0] to-[#b5179e] text-white flex items-center justify-center font-black text-sm shrink-0 shadow-md">
                  {client.logoText}
                </div>
                <div className="flex-grow min-w-0">
                  <h3 className="font-black text-white text-xs truncate leading-snug">{client.companyName}</h3>
                  <span className="text-[9px] text-[#8c869e] block truncate mt-0.5">{client.domain}</span>
                  <span className={`inline-block text-[8px] font-black border px-1.5 py-0.5 rounded mt-2 ${status.color}`}>
                    {status.label}
                  </span>
                </div>
              </div>
            );
          })}
          {clients.length === 0 && (
            <div className="glass-card rounded-md p-8 text-center text-[#8c869e] font-bold text-xs border border-white/5">
              Aktif müşteri bulunmuyor. Pipeline'dan kazanılan potansiyeller buraya aktarılır.
            </div>
          )}
        </div>

        {/* Right Side: Details View (Profile, Services, History) */}
        <div className="lg:col-span-2 space-y-6">
          {activeClient ? (
            <div className="glass-card rounded-md p-6 md:p-8 space-y-6 border border-white/5">
              {/* Header profile info */}
              <div className="flex justify-between items-start border-b border-white/5 pb-5 flex-wrap gap-4">
                <div className="flex gap-4 items-center">
                  <div className="w-14 h-14 rounded bg-gradient-to-br from-[#4f20c0] to-[#b5179e] text-white flex items-center justify-center font-black text-xl shadow-lg">
                    {activeClient.logoText}
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-white">{activeClient.companyName}</h2>
                    <p className="text-xs text-[#b5179e] font-black">{activeClient.domain}</p>
                    <p className="text-[10px] text-[#8c869e] mt-1">Sözleşme Başlangıcı: {activeClient.contractDate}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-[#8c869e] font-bold uppercase tracking-wider">Sözleşme Bedeli</p>
                  <p className="text-base font-black text-[#f6f5fa] mt-1">{activeClient.contractValue}</p>
                </div>
              </div>

              {/* Grid with services scope and documents */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="space-y-3">
                  <h3 className="text-[10px] font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4f20c0]" />
                    <span>Verilen Hizmetler</span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {activeClient.services.map((srv, index) => (
                      <span
                        key={index}
                        className="bg-white/5 border border-white/5 text-[#f1ecf9] font-black text-[10px] px-3 py-1.5 rounded shadow-sm"
                      >
                        {srv}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-[10px] font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#b5179e]" />
                    <span>Sözleşmeler ve Ek Dosyalar</span>
                  </h3>
                  <div className="space-y-2">
                    <div className="bg-white/5 border border-white/5 rounded p-3 flex justify-between items-center text-xs font-bold text-[#f1ecf9]">
                      <span className="truncate mr-2">Ana_Hizmet_Sozlesmesi_2026.pdf</span>
                      <button className="text-[#f1ecf9] hover:text-white font-black text-[10px] px-2.5 py-1 bg-white/5 border border-white/10 rounded transition-all shrink-0">
                        İndir
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* History list timeline */}
              <div className="space-y-4 pt-4 border-t border-white/5">
                <h3 className="text-[10px] font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>İletişim Geçmişi Logu</span>
                </h3>
                <div className="relative border-l-2 border-white/5 ml-3.5 pl-6 space-y-5">
                  {activeClient.history && activeClient.history.map((hist, index) => (
                    <div key={index} className="relative">
                      {/* dot */}
                      <span className="absolute left-[-30px] top-1.5 w-2.5 h-2.5 rounded-full bg-purple-900 border-2 border-[#06050b]" />
                      <div className="bg-white/5 border border-white/5 rounded p-3 text-xs font-bold text-[#c9c5d8]">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] font-black text-[#ccbdff] uppercase">{hist.type}</span>
                          <span className="text-[9px] text-[#8c869e]">{hist.date}</span>
                        </div>
                        <p className="text-[11px] leading-relaxed text-[#8c869e] font-medium">{hist.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card rounded-md p-12 text-center text-[#8c869e] font-bold text-xs border border-white/5">
              Müşteri detaylarını görüntülemek için sol taraftan bir firma seçin.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


