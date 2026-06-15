// src/features/diagnoses/components/studio/PanelManager.tsx
'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import type { Diagnosis } from '../../types';
import { useAgency } from './AgencyContext';

interface PanelManagerProps {
  readonly diagnoses: Diagnosis[];
}

export function PanelManager({ diagnoses }: PanelManagerProps) {
  const { tasks, leads, clients } = useAgency();

  // Active filter for the brand listing table
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showDropdown, setShowDropdown] = useState(false);

  // Dynamic calculations for Brand Diagnostics
  const stats = useMemo(() => {
    const totalDiagnoses = diagnoses.length;
    const awaitingReview = diagnoses.filter(d => d.status === 'new' || d.status === 'in_review').length;
    const completedReports = diagnoses.filter(d => d.status === 'output_ready' || d.status === 'completed').length;
    
    // Average overall health score
    const scoredBrands = diagnoses.filter(d => d.overall_health_score !== null);
    const avgHealth = scoredBrands.length > 0
      ? scoredBrands.reduce((sum, d) => sum + Number(d.overall_health_score ?? 0), 0) / scoredBrands.length
      : 0;

    // High risk brands count
    const highRiskCount = diagnoses.filter(d => d.risk_level === 'high' || d.risk_level === 'critical').length;

    // Creative potential averages
    const avgCreative = scoredBrands.length > 0
      ? scoredBrands.reduce((sum, d) => sum + Number(d.creative_potential_score ?? 0), 0) / scoredBrands.length
      : 0;

    return {
      totalDiagnoses,
      awaitingReview,
      completedReports,
      avgHealth,
      highRiskCount,
      avgCreative
    };
  }, [diagnoses]);

  // Filter diagnoses for table
  const filteredDiagnoses = useMemo(() => {
    return diagnoses.filter(d => {
      if (selectedFilter === 'all') return true;
      if (selectedFilter === 'high_risk') return d.risk_level === 'high' || d.risk_level === 'critical';
      if (selectedFilter === 'pending') return d.status === 'new' || d.status === 'in_review';
      return true;
    });
  }, [diagnoses, selectedFilter]);

  return (
    <div className="space-y-8 flex-grow pb-12 text-gray-700 animate-fade-in-up">
      
      {/* ── SECTION 1: Brand Diagnostic Stats Grid ──────────────────────── */}
      <section className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-sm font-black uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
            <span>Marka Teşhis Özetleri (Diagnostic Stats)</span>
            <span className="material-symbols-outlined text-[16px] text-gray-400">keyboard_arrow_down</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Total Diagnoses */}
          <div className="glass-card rounded-md p-5 flex flex-col justify-between min-h-[140px] relative overflow-hidden border-r-4 border-r-[#4f20c0]">
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 rounded bg-[#4f20c0]/15 flex items-center justify-center text-[#ccbdff]">
                <span className="material-symbols-outlined text-[20px]">analytics</span>
              </div>
              {/* Circular Mini Chart */}
              <div className="relative flex items-center justify-center">
                <svg className="w-9 h-9 transform -rotate-90">
                  <circle cx="18" cy="18" r="14" className="text-white/10" strokeWidth="2.5" stroke="currentColor" fill="transparent" />
                  <circle cx="18" cy="18" r="14" strokeWidth="2.5" strokeDasharray={2 * Math.PI * 14} strokeDashoffset={2 * Math.PI * 14 * 0.3} strokeLinecap="round" stroke="#4f20c0" fill="transparent" />
                </svg>
                <span className="absolute text-[8px] font-black text-[#ccbdff]">+70%</span>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-[10px] font-bold text-[#8c869e] uppercase tracking-wider block">Toplam Analiz</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-[#f1ecf9] leading-none">
                  {stats.totalDiagnoses}
                </span>
                <span className="text-xs font-bold text-[#8c869e]">Teşhis Edildi</span>
              </div>
              <span className="text-[9px] text-[#8c869e]/80 font-bold mt-1.5 block">Sisteme kayıtlı toplam marka</span>
            </div>
          </div>

          {/* Card 2: Awaiting Review */}
          <div className="glass-card rounded-md p-5 flex flex-col justify-between min-h-[140px] relative overflow-hidden border-r-4 border-r-[#b5179e]">
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 rounded bg-[#b5179e]/15 flex items-center justify-center text-[#f6f5fa]">
                <span className="material-symbols-outlined text-[20px]">rate_review</span>
              </div>
              {/* Circular Mini Chart */}
              <div className="relative flex items-center justify-center">
                <svg className="w-9 h-9 transform -rotate-90">
                  <circle cx="18" cy="18" r="14" className="text-white/10" strokeWidth="2.5" stroke="currentColor" fill="transparent" />
                  <circle cx="18" cy="18" r="14" strokeWidth="2.5" strokeDasharray={2 * Math.PI * 14} strokeDashoffset={2 * Math.PI * 14 * 0.8} strokeLinecap="round" stroke="#b5179e" fill="transparent" />
                </svg>
                <span className="absolute text-[8px] font-black text-[#f6f5fa]">+20%</span>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-[10px] font-bold text-[#8c869e] uppercase tracking-wider block">İnceleme Bekleyen</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-[#f1ecf9] leading-none">
                  {stats.awaitingReview}
                </span>
                <span className="text-xs font-bold text-[#8c869e]">Kuyrukta</span>
              </div>
              <span className="text-[9px] text-[#8c869e]/80 font-bold mt-1.5 block">Kök sebep analizi bekleyenler</span>
            </div>
          </div>

          {/* Card 3: Avg Health Score */}
          <div className="glass-card rounded-md p-5 flex flex-col justify-between min-h-[140px] relative overflow-hidden border-r-4 border-r-emerald-400">
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 rounded bg-emerald-500/15 flex items-center justify-center text-emerald-400">
                <span className="material-symbols-outlined text-[20px]">favorite</span>
              </div>
              {/* Circular Mini Chart */}
              <div className="relative flex items-center justify-center">
                <svg className="w-9 h-9 transform -rotate-90">
                  <circle cx="18" cy="18" r="14" className="text-white/10" strokeWidth="2.5" stroke="currentColor" fill="transparent" />
                  <circle cx="18" cy="18" r="14" strokeWidth="2.5" strokeDasharray={2 * Math.PI * 14} strokeDashoffset={2 * Math.PI * 14 * 0.25} strokeLinecap="round" stroke="#10b981" fill="transparent" />
                </svg>
                <span className="absolute text-[8px] font-black text-emerald-400">7.4</span>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-[10px] font-bold text-[#8c869e] uppercase tracking-wider block">Ort. Sağlık Skoru</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-[#f1ecf9] leading-none">
                  {stats.avgHealth.toFixed(1)}
                </span>
                <span className="text-xs font-bold text-[#8c869e]">/ 10 Puan</span>
              </div>
              <span className="text-[9px] text-[#8c869e]/80 font-bold mt-1.5 block">Genel marka performansı</span>
            </div>
          </div>

          {/* Card 4: High Risk level */}
          <div className="glass-card rounded-md p-5 flex flex-col justify-between min-h-[140px] relative overflow-hidden border-r-4 border-r-red-400">
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 rounded bg-red-500/15 flex items-center justify-center text-red-400">
                <span className="material-symbols-outlined text-[20px]">warning</span>
              </div>
              {/* Circular Mini Chart */}
              <div className="relative flex items-center justify-center">
                <svg className="w-9 h-9 transform -rotate-90">
                  <circle cx="18" cy="18" r="14" className="text-white/10" strokeWidth="2.5" stroke="currentColor" fill="transparent" />
                  <circle cx="18" cy="18" r="14" strokeWidth="2.5" strokeDasharray={2 * Math.PI * 14} strokeDashoffset={2 * Math.PI * 14 * 0.9} strokeLinecap="round" stroke="#f87171" fill="transparent" />
                </svg>
                <span className="absolute text-[8px] font-black text-red-400 font-bold">Kritik</span>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-[10px] font-bold text-[#8c869e] uppercase tracking-wider block">Yüksek Riskli Markalar</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-[#f1ecf9] leading-none">
                  {stats.highRiskCount}
                </span>
                <span className="text-xs font-bold text-[#8c869e]">Kritik Limit</span>
              </div>
              <span className="text-[9px] text-[#8c869e]/80 font-bold mt-1.5 block">Acil aksiyon gerektirenler</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 2: Diagnostic Matrix & Charts ───────────────────── */}
      <section className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-sm font-black uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
            <span>Kreatif Sağlık & Analiz Matrisi</span>
            <span className="material-symbols-outlined text-[16px] text-gray-400">keyboard_arrow_down</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Large Column (Premium AI Insight Card) - span 3 */}
          <div className="lg:col-span-3 purple-premium-card rounded-md p-6 flex flex-col justify-between min-h-[300px] relative overflow-hidden">
            <div className="absolute top-[-20%] right-[-20%] w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-black tracking-wider uppercase text-white/70">Kreatif Kalite Standardı</span>
              <span className="material-symbols-outlined text-white/80">insights</span>
            </div>

            {/* Circular Gauge representing creative potential */}
            <div className="relative flex flex-col items-center justify-center mt-4">
              <svg className="w-28 h-28 transform -rotate-90">
                <circle cx="56" cy="56" r="44" className="text-white/20" strokeWidth="6" stroke="currentColor" fill="transparent" />
                <circle cx="56" cy="56" r="44" strokeWidth="6" strokeDasharray={2 * Math.PI * 44} strokeDashoffset={2 * Math.PI * 44 * (1 - (stats.avgCreative / 10))} strokeLinecap="round" stroke="#ffffff" fill="transparent" />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-xl font-black text-white">{Math.round(stats.avgCreative * 10)}%</span>
                <span className="text-[8px] font-bold text-white/60">Ajans Ortalaması</span>
              </div>
            </div>

            <div className="mt-6">
              <span className="text-[9px] font-bold text-white/50 block">AI Teşhis Önerisi</span>
              <p className="text-xs font-bold text-white leading-relaxed mt-1">
                Kreatif potansiyeli yüksek markaların reklam dönüşüm oranları daha dengeli seyrediyor.
              </p>
            </div>
          </div>

          {/* Middle Column (Two CRM metrics stacked) - span 3 */}
          <div className="lg:col-span-3 flex flex-col gap-5 justify-between">
            {/* Card 1: Leads value */}
            <div className="glass-card rounded-md p-5 flex-1 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="w-9 h-9 rounded bg-[#4f20c0]/15 flex items-center justify-center text-[#ccbdff]">
                  <span className="material-symbols-outlined text-[18px]">handshake</span>
                </div>
                <div className="w-6 h-6 rounded bg-[#4f20c0]/10 flex items-center justify-center">
                  <span className="text-[8px] font-black text-[#ccbdff]">+12%</span>
                </div>
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#8c869e] uppercase tracking-wider block">Pipeline Fırsat Hacmi</span>
                <p className="text-lg font-black text-[#f1ecf9] mt-1">
                  {leads.length} Aktif Aday
                </p>
                <span className="text-[8px] font-bold text-[#8c869e] mt-0.5 block">CRM boru hattındaki markalar</span>
              </div>
            </div>

            {/* Card 2: Active Clients health */}
            <div className="glass-card rounded-md p-5 flex-1 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="w-9 h-9 rounded bg-cyan-500/15 flex items-center justify-center text-cyan-400">
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                </div>
                <div className="w-6 h-6 rounded bg-cyan-500/10 flex items-center justify-center">
                  <span className="text-[8px] font-black text-cyan-400">NPS 4.9</span>
                </div>
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#8c869e] uppercase tracking-wider block">Kazanılan Müşteri Sağlığı</span>
                <p className="text-lg font-black text-[#f1ecf9] mt-1">
                  {clients.length} Aktif Müşteri
                </p>
                <span className="text-[8px] font-bold text-[#8c869e] mt-0.5 block">Sözleşmesi devam eden firmalar</span>
              </div>
            </div>
          </div>

          {/* Right Column (Monthly Diagnostics Volume Chart) - span 6 */}
          <div className="lg:col-span-6 glass-card rounded-md p-6 flex flex-col justify-between relative">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <div>
                <span className="text-[10px] font-bold text-[#8c869e] uppercase tracking-wider block">Aylık Teşhis Dağılımı</span>
                <h4 className="text-xs font-black text-[#f1ecf9] mt-0.5">Teşhis Hacmi & Rapor Hazırlama</h4>
              </div>
              
              {/* Dropdown Options Popup */}
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="w-8 h-8 rounded-full hover:bg-white/5 flex items-center justify-center text-[#8c869e] hover:text-[#f1ecf9] transition-all"
                >
                  <span className="material-symbols-outlined">more_vert</span>
                </button>
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-40 bg-[#120f26]/95 backdrop-blur-md border border-white/10 rounded shadow-xl p-2 z-20 text-xs font-bold text-[#c9c5d8] animate-fade-in-up">
                    <button onClick={() => setShowDropdown(false)} className="w-full text-left px-3 py-2 hover:bg-white/5 hover:text-white rounded transition-all">Detaylı Rapor</button>
                    <button onClick={() => setShowDropdown(false)} className="w-full text-left px-3 py-2 hover:bg-white/5 hover:text-white rounded transition-all">Geçmişi İncele</button>
                  </div>
                )}
              </div>
            </div>

            {/* Custom Bar Chart Visual representation */}
            <div className="h-44 flex items-end justify-between gap-4 px-2 mt-6 relative">
              <div className="absolute top-[-10px] left-[22%] bg-stone-900 border border-white/10 text-white text-[9px] font-black py-1 px-2.5 rounded shadow-lg z-10">
                Mar 2026
              </div>

              {[
                { month: 'Şub', value: 25 },
                { month: 'Mar', value: 60, active: true },
                { month: 'Nis', value: 45 },
                { month: 'May', value: 50 },
                { month: 'Haz', value: 75 },
                { month: 'Tem', value: 35 },
                { month: 'Ağu', value: 40 },
                { month: 'Eyl', value: 55 }
              ].map((item, idx) => {
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <div className="w-full bg-white/5 rounded-full h-full relative overflow-hidden">
                      <div
                        className={`absolute bottom-0 w-full rounded-full transition-all duration-700 ${
                          item.active
                            ? 'bg-gradient-to-t from-[#4f20c0] to-[#b5179e] shadow-[0_0_10px_rgba(79,32,192,0.3)]'
                            : 'bg-white/10 group-hover:bg-[#4f20c0]/30'
                        }`}
                        style={{ height: `${item.value}%` }}
                      />
                    </div>
                    <span className="text-[9px] font-black text-[#8c869e]">{item.month}</span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </section>

      {/* ── SECTION 3: Latest Diagnostic Records Table ────────────────── */}
      <section className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-sm font-black uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
            <span>Son Marka Teşhis Raporları (Latest Records)</span>
            <span className="material-symbols-outlined text-[16px] text-gray-400">keyboard_arrow_down</span>
          </h3>

          <div className="flex items-center bg-white/5 p-1 rounded border border-white/5 shadow-inner text-[10px] font-bold text-[#8c869e] no-print">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-3 py-1.5 rounded transition-all ${
                selectedFilter === 'all' ? 'bg-[#4f20c0] text-white' : 'hover:text-[#f1ecf9]'
              }`}
            >
              Tümü ({diagnoses.length})
            </button>
            <button
              onClick={() => setSelectedFilter('high_risk')}
              className={`px-3 py-1.5 rounded transition-all ${
                selectedFilter === 'high_risk' ? 'bg-[#4f20c0] text-white' : 'hover:text-[#f1ecf9]'
              }`}
            >
              Riskli ({diagnoses.filter(d => d.risk_level === 'high' || d.risk_level === 'critical').length})
            </button>
            <button
              onClick={() => setSelectedFilter('pending')}
              className={`px-3 py-1.5 rounded transition-all ${
                selectedFilter === 'pending' ? 'bg-[#4f20c0] text-white' : 'hover:text-[#f1ecf9]'
              }`}
            >
              Kuyruktakiler
            </button>
          </div>
        </div>

        {/* History Table List representation */}
        <div className="glass-card rounded-md overflow-hidden p-3 space-y-2 border border-white/5">
          
          {/* Header Row */}
          <div className="grid grid-cols-12 gap-4 px-4 py-2 border-b border-white/5 text-[9px] font-black tracking-wider text-[#8c869e] uppercase">
            <div className="col-span-4">Marka Adı / Sektör</div>
            <div className="col-span-2">Sağlık Skoru</div>
            <div className="col-span-2">İlerleme</div>
            <div className="col-span-2">Kritik Seviye</div>
            <div className="col-span-2 text-right">Teşhis Durumu</div>
          </div>

          {/* Rows */}
          <div className="space-y-1.5">
            {filteredDiagnoses.slice(0, 5).map((row) => {
              const score = row.overall_health_score ?? 5;
              const sub = row.public_submission as any;
              const sector = sub?.brandContext?.sector || 'general';

              // Status styles mapping
              const statusLabel = row.status === 'new' ? 'Yeni Başvuru' :
                                  row.status === 'in_review' ? 'İncelemede' :
                                  row.status === 'analyzed' ? 'Analiz Edildi' :
                                  row.status === 'output_ready' ? 'Rapor Hazır' :
                                  row.status === 'completed' ? 'Tamamlandı' : 'Arşivlendi';

              const statusColor = row.status === 'completed' || row.status === 'output_ready' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                  row.status === 'in_review' || row.status === 'analyzed' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' :
                                  'bg-[#4f20c0]/15 text-[#ccbdff] border-[#4f20c0]/20';

              const riskColor = row.risk_level === 'critical' || row.risk_level === 'high' ? 'text-red-400 bg-red-950/20 border-red-500/20' : 'text-[#8c869e]';

              return (
                <div 
                  key={row.id} 
                  className="grid grid-cols-12 gap-4 px-4 py-3 bg-white/[0.02] hover:bg-white/[0.06] rounded-md border border-white/5 items-center transition-all duration-200 text-xs font-bold text-[#c9c5d8]"
                >
                  {/* Name column */}
                  <div className="col-span-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-gradient-to-br from-[#4f20c0] to-[#b5179e] text-white flex items-center justify-center font-black text-xs shrink-0">
                      {row.brand_name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-black text-[#f1ecf9] truncate">{row.brand_name}</p>
                      <p className="text-[10px] text-[#8c869e] font-semibold">{sector}</p>
                    </div>
                  </div>

                  {/* Health Score column */}
                  <div className="col-span-2 font-black text-[#ccbdff]">
                    {score ? `${Number(score).toFixed(1)} / 10` : 'Skor Yok'}
                  </div>

                  {/* Progress Bar column */}
                  <div className="col-span-2 flex items-center gap-2">
                    <div className="flex-grow h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#4f20c0] to-[#b5179e] rounded-full" style={{ width: `${Number(score) * 10}%` }} />
                    </div>
                    <span className="text-[9px] text-[#8c869e]">{Math.round(Number(score) * 10)}%</span>
                  </div>

                  {/* Risk Level column */}
                  <div className="col-span-2">
                    <span className={`px-2 py-0.5 rounded-sm text-[9px] font-black border border-white/5 ${riskColor}`}>
                      {row.risk_level === 'critical' ? 'Kritik Risk' :
                       row.risk_level === 'high' ? 'Yüksek Risk' :
                       row.risk_level === 'medium' ? 'Orta Risk' : 'Düşük Risk'}
                    </span>
                  </div>

                  {/* Status column */}
                  <div className="col-span-2 text-right">
                    <span className={`px-2.5 py-0.5 rounded text-[9px] font-black border ${statusColor}`}>
                      {statusLabel}
                    </span>
                  </div>

                </div>
              );
            })}
            {filteredDiagnoses.length === 0 && (
              <p className="text-center py-6 text-xs text-[#8c869e] font-bold">Herhangi bir teşhis kaydı bulunamadı.</p>
            )}
          </div>

        </div>
      </section>

    </div>
  );
}
