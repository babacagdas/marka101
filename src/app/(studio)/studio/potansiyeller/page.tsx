// src/app/(studio)/studio/potansiyeller/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface LeadPotential {
  id: string;
  brandName: string;
  contactName: string;
  stage: 'initial' | 'meeting' | 'proposal' | 'won' | 'lost';
  value: string;
  notes: string[];
}

import { useAgency } from '@/features/diagnoses/components/studio/AgencyContext';

export default function PotansiyellerPage() {
  const { leads, updateLeadStage, addLeadNote } = useAgency();

  const [activeLeadId, setActiveLeadId] = useState<string | null>(null);
  const [newNote, setNewNote] = useState('');
  const [filterStage, setFilterStage] = useState<string>('all');

  useEffect(() => {
    if (leads.length > 0 && !activeLeadId) {
      setActiveLeadId(leads[0].id);
    }
  }, [leads, activeLeadId]);

  const activeLead = leads.find((l) => l.id === activeLeadId) ?? null;

  const updateStage = (id: string, newStage: 'initial' | 'meeting' | 'proposal' | 'won' | 'lost') => {
    updateLeadStage(id, newStage);
  };

  const addNote = () => {
    if (!newNote.trim() || !activeLeadId) return;
    addLeadNote(activeLeadId, newNote.trim());
    setNewNote('');
  };

  const stages: { key: LeadPotential['stage']; label: string; bg: string; text: string }[] = [
    { key: 'initial', label: 'İlk İletişim', bg: 'bg-blue-500/10 border-blue-500/30', text: 'text-indigo-600' },
    { key: 'meeting', label: 'Toplantı Yapıldı', bg: 'bg-amber-500/10 border-amber-500/30', text: 'text-amber-600' },
    { key: 'proposal', label: 'Teklif Gönderildi', bg: 'bg-purple-500/10 border-purple-500/30', text: 'text-purple-600' },
    { key: 'won', label: 'Kazanıldı (Won)', bg: 'bg-emerald-500/10 border-emerald-500/30', text: 'text-emerald-600' },
    { key: 'lost', label: 'Kaybedildi (Lost)', bg: 'bg-red-500/10 border-red-500/30', text: 'text-red-650' }
  ];

  return (
    <div className="w-full space-y-6 animate-fade-in-up pb-12 text-gray-700 px-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200/50 pb-5">
        <div>
          <h1 className="text-xl font-black text-gray-800 tracking-tight">Potansiyel Müşteriler (Pipeline)</h1>
          <p className="text-xs text-gray-400 mt-1">
            Marka101 başvurularından ve diğer kaynaklardan dönüşen satış aşamaları ve teklif süreci yönetimi.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Pipeline Columns (Interactive) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-card rounded-md p-4 flex gap-4 items-center justify-between border border-white/5">
            <span className="text-xs font-black text-[#f1ecf9]">Boru Hattı Görünümü</span>
            <div className="flex gap-2">
              {['all', 'initial', 'meeting', 'proposal', 'won', 'lost'].map((stg) => (
                <button
                  key={stg}
                  onClick={() => setFilterStage(stg)}
                  className={`px-3 py-1 rounded text-[10px] font-black border transition-all ${
                    filterStage === stg
                      ? 'bg-gradient-to-r from-[#4f20c0] to-[#b5179e] text-white border-transparent'
                      : 'bg-white/5 border-white/5 text-[#8c869e] hover:text-white'
                  }`}
                >
                  {stg === 'all' ? 'Tümü' : stg}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {leads
              .filter((l) => filterStage === 'all' || l.stage === filterStage)
              .map((lead) => {
                const currentStage = stages.find((s) => s.key === lead.stage)!;
                const isActive = lead.id === activeLeadId;
                return (
                  <div
                    key={lead.id}
                    onClick={() => setActiveLeadId(lead.id)}
                    className={`p-5 rounded-md border transition-all cursor-pointer flex flex-col justify-between min-h-[160px] ${
                      isActive
                        ? 'bg-[#4f20c0]/15 border-[#4f20c0] shadow-[0_4px_15px_rgba(79,32,192,0.15)]'
                        : 'glass-card glass-card-hover'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-black text-[#f1ecf9] text-sm truncate">{lead.brandName}</h3>
                        <span className={`px-2 py-0.5 rounded-sm text-[8px] font-black border ${currentStage.bg} ${currentStage.text}`}>
                          {currentStage.label}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#8c869e] font-bold mt-1">Yetkili: {lead.contactName}</p>
                      <p className="text-xs font-black text-[#ccbdff] mt-2">{lead.value}</p>
                    </div>

                    <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/5">
                      <select
                        value={lead.stage}
                        onChange={(e) => updateStage(lead.id, e.target.value as any)}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-[#0e0b1a] border border-white/10 rounded px-2 py-1 text-[9px] font-black text-[#c9c5d8] focus:outline-none cursor-pointer w-full"
                      >
                        <option value="initial" className="bg-[#0e0b1a]">İlk İletişim</option>
                        <option value="meeting" className="bg-[#0e0b1a]">Toplantı Yapıldı</option>
                        <option value="proposal" className="bg-[#0e0b1a]">Teklif Gönderildi</option>
                        <option value="won" className="bg-[#0e0b1a]">Kazanıldı (Won)</option>
                        <option value="lost" className="bg-[#0e0b1a]">Kaybedildi (Lost)</option>
                      </select>
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateStage(lead.id, 'won');
                          }}
                          className="px-2 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-sm text-[8px] font-black transition-all"
                          title="Kazanıldı Yap"
                        >
                          Won
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateStage(lead.id, 'lost');
                          }}
                          className="px-2 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-sm text-[8px] font-black transition-all"
                          title="Kaybedildi Yap"
                        >
                          Lost
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Right Column: Active Lead Notes & History Log */}
        <div className="space-y-4">
          {activeLead ? (
            <div className="glass-card rounded-md p-6 space-y-6 border border-white/5">
              <div>
                <h3 className="font-black text-[#f1ecf9] text-base leading-tight">{activeLead.brandName}</h3>
                <p className="text-[10px] text-[#8c869e] mt-1 font-bold">Görüşme Notları ve İletişim Geçmişi</p>
              </div>

              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                {activeLead.notes.map((note, index) => (
                  <div key={index} className="p-3 bg-white/5 border border-white/5 rounded-md text-[11px] text-[#c9c5d8] leading-relaxed font-bold">
                    <p>{note}</p>
                    <span className="text-[8px] text-[#8c869e] block mt-2 font-bold">
                      Not #{index + 1} • Elena Creative
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 pt-2 border-t border-white/5">
                <label htmlFor="meeting-note-input" className="block text-[9px] font-bold text-[#8c869e] uppercase tracking-wider">Not Ekle</label>
                <textarea
                  id="meeting-note-input"
                  rows={3}
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Görüşme detaylarını girin..."
                  className="w-full bg-[#0e0b1a] border border-white/10 rounded-md px-3.5 py-2.5 text-xs font-semibold text-white placeholder-[#7d778f] focus:outline-none focus:border-[#4f20c0] transition-all"
                />
                <button
                  type="button"
                  onClick={addNote}
                  className="w-full bg-gradient-to-r from-[#4f20c0] to-[#b5179e] hover:scale-[1.02] text-white py-2.5 rounded font-extrabold text-xs shadow-[0_4px_15px_rgba(79,32,192,0.3)] transition-all"
                >
                  Görüşme Notu Kaydet
                </button>
              </div>
            </div>
          ) : (
            <div className="glass-card rounded-md p-6 text-center text-[#8c869e] font-bold text-xs border border-white/5">
              Detayları görmek için bir lead seçin.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
