// src/features/diagnoses/components/studio/PresentationMode.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import type { Diagnosis } from '../../types';
import { RadarChart } from './RadarChart';

interface PresentationModeProps {
  readonly diagnosis: Diagnosis;
}

export function PresentationMode({ diagnosis }: PresentationModeProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const sub = (diagnosis.public_submission ?? {}) as any;
  const scores = sub?.scores ?? {};
  const explainability = scores?.explainability ?? {};
  const treatmentIntelligence = scores?.treatmentIntelligence ?? {};
  const sector = sub?.brandContext?.sector ?? 'general';

  const metrics = [
    { label: 'Premium Potansiyeli', value: diagnosis.premium_potential_score ?? 0, desc: 'Fiyat meşruiyeti ve görsel kalite algısı.' },
    { label: 'Satış Hazırlığı', value: diagnosis.sales_readiness_score ?? 0, desc: 'UX kalitesi ve dönüşüm hunisi optimizasyonu.' },
    { label: 'Kreatif Potansiyel', value: diagnosis.creative_potential_score ?? 0, desc: 'Metin yazımı, özgünlük ve hikaye anlatımı.' },
    { label: 'Teklif Gücü', value: diagnosis.offer_potential_score ?? 0, desc: 'USP netliği, kanca gücü ve karşı konulmazlık.' },
    { label: 'Müşteri Kalitesi', value: diagnosis.lead_quality_score ?? 0, desc: 'Hedef kitle uyumu ve lead niteliği.' },
  ];

  const totalSlides = 7;

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        e.preventDefault();
        setCurrentSlide((prev) => Math.min(prev + 1, totalSlides - 1));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCurrentSlide((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  // Sync fullscreen state
  useEffect(() => {
    function handleFullscreenChange() {
      setIsFullscreen(!!document.fullscreenElement);
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error('Fullscreen toggle error:', err);
    }
  };

  const nextSlide = () => setCurrentSlide((prev) => Math.min(prev + 1, totalSlides - 1));
  const prevSlide = () => setCurrentSlide((prev) => Math.max(prev - 1, 0));

  const RISK_LABELS: Record<string, string> = {
    critical: 'Kritik Risk',
    high: 'Yüksek Risk',
    medium: 'Orta Risk',
    low: 'Düşük Risk',
  };

  const RISK_GLOW: Record<string, string> = {
    critical: 'shadow-[0_0_20px_rgba(239,68,68,0.4)] border-red-500/50 text-red-400',
    high: 'shadow-[0_0_20px_rgba(249,115,22,0.4)] border-orange-500/50 text-orange-400',
    medium: 'shadow-[0_0_20px_rgba(245,158,11,0.4)] border-amber-500/50 text-amber-400',
    low: 'shadow-[0_0_20px_rgba(16,185,129,0.4)] border-emerald-500/50 text-emerald-400',
  };

  const SEVERITY_BADGES: Record<string, string> = {
    critical: 'bg-red-500/10 text-red-400 border border-red-500/30',
    high: 'bg-orange-500/10 text-orange-400 border border-orange-500/30',
    medium: 'bg-amber-500/10 text-amber-400 border border-amber-500/30',
    low: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full min-h-screen bg-[#07050f] text-[#f6f5fa] flex flex-col justify-between overflow-hidden p-6 sm:p-12 font-sans select-none"
    >
      {/* Background Neon Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-[#4f20c0]/15 blur-[120px] pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-[#e81cff]/10 blur-[130px] pointer-events-none animate-pulse" style={{ animationDuration: '12s' }} />
      <div className="absolute top-[30%] right-[10%] w-[30vw] h-[30vw] rounded-full bg-cyan-500/5 blur-[100px] pointer-events-none" />

      {/* Top Header Navigation */}
      <div className="relative z-10 flex justify-between items-center border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-gradient-to-tr from-[#4f20c0] to-[#e81cff] flex items-center justify-center shadow-lg shadow-[#4f20c0]/20">
            <span className="font-extrabold text-xs text-white tracking-tighter">DC</span>
          </div>
          <div>
            <span className="font-black text-xs uppercase tracking-widest text-white">{diagnosis.brand_name}</span>
            <span className="text-[10px] text-gray-500 font-bold ml-2 border-l border-white/10 pl-2">BIOS Diagnostic Deck</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Slide Progress Percentage */}
          <span className="text-[10px] font-mono font-bold text-gray-400 bg-white/5 px-2.5 py-1 rounded border border-white/5">
            Slayt {currentSlide + 1} / {totalSlides}
          </span>
          <button
            onClick={toggleFullscreen}
            type="button"
            className="p-1.5 rounded bg-white/5 hover:bg-white/10 border border-white/5 text-gray-400 hover:text-white transition-all"
            title="Tam Ekran"
          >
            <span className="material-symbols-outlined text-[18px]">
              {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
            </span>
          </button>
          <Link
            href={`/studio/marka101/${diagnosis.id}/sonuc`}
            className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 text-white font-bold rounded text-xs transition-all border border-white/5 flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[14px]">close</span>
            Sunumu Kapat
          </Link>
        </div>
      </div>

      {/* Main Slide Carousel container */}
      <div className="relative z-10 my-auto flex-grow flex items-center justify-center py-8">
        
        {/* Slide 0: COVER */}
        {currentSlide === 0 && (
          <div className="w-full max-w-4xl space-y-6 text-center sm:text-left animate-fade-in-up">
            <span className="inline-block px-3.5 py-1 bg-[#4f20c0]/20 text-[#e81cff] border border-[#e81cff]/20 rounded-full text-[10px] font-extrabold tracking-widest uppercase">
              BIOS Strategic Brand Diagnostic
            </span>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-none text-white uppercase max-w-3xl">
              Stratejik Büyüme &<br />
              <span className="bg-gradient-to-r from-[#e81cff] via-[#4f20c0] to-cyan-400 bg-clip-text text-transparent">
                Teşhis Raporu
              </span>
            </h1>
            <div className="h-1 w-24 bg-[#e81cff] rounded-full my-4" />
            <p className="text-xs sm:text-sm text-gray-400 max-w-xl font-medium leading-relaxed">
              Ön analiz form verileri, ajans değerlendirme skorları ve büyüme hunisi optimizasyonu için hazırlanan interaktif sunum planı.
            </p>
            <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-6 text-left border-t border-white/5">
              <div>
                <span className="text-[9px] font-bold text-gray-550 uppercase block">Hazırlanan Marka</span>
                <span className="font-extrabold text-white text-xs mt-1 block">{diagnosis.brand_name}</span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-gray-550 uppercase block">Değerlendiren</span>
                <span className="font-extrabold text-white text-xs mt-1 block">Deep Creative Studio</span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-gray-550 uppercase block">Tarih</span>
                <span className="font-extrabold text-white text-xs mt-1 block">
                  {diagnosis.created_at ? new Date(diagnosis.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
                </span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-gray-550 uppercase block">Metot</span>
                <span className="font-extrabold text-emerald-400 text-xs mt-1 block flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  XAI Engine v1.1
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Slide 1: BRAND HEALTH SCORE */}
        {currentSlide === 1 && (
          <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center animate-fade-in-up">
            <div className="space-y-6">
              <span className="text-[9px] font-bold text-[#e81cff] uppercase tracking-widest block">SLAYT 2 // GENEL SAĞLIK RAPORU</span>
              <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                Genel Marka Sağlık Skoru
              </h2>
              <p className="text-xs text-gray-400 leading-relaxed font-semibold">
                BIOS teşhis motoru, markanın pazar konumlamasını, kreatif tutarlılığını ve dönüşüm hunisi elementlerini tarayarak genel bir sağlık skoru belirler.
              </p>
              
              <div className="space-y-3 pt-2">
                <div className="bg-white/5 border border-white/5 rounded-lg p-4 flex items-center gap-4">
                  <span className="material-symbols-outlined text-[32px] text-[#e81cff]">trending_up</span>
                  <div>
                    <h4 className="text-xs font-extrabold text-white">Sektörel Kıyaslama</h4>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Markanızın sağlık skoru sektör ortalaması ile karşılaştırıldığında konumlandırma açısından kritik gelişim alanlarına işaret etmektedir.
                    </p>
                  </div>
                </div>

                {diagnosis.risk_level && (
                  <div className={`border rounded-lg p-4 flex items-center gap-4 ${RISK_GLOW[diagnosis.risk_level] ?? ''}`}>
                    <span className="material-symbols-outlined text-[32px]">warning</span>
                    <div>
                      <h4 className="text-xs font-extrabold text-white">Sistem Risk Değerlendirmesi</h4>
                      <p className="text-[11px] text-gray-300 mt-0.5">
                        Markanın taşıdığı yapısal risk seviyesi: <strong className="font-extrabold uppercase">{RISK_LABELS[diagnosis.risk_level]}</strong>.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col items-center justify-center p-8 bg-white/[0.02] border border-white/5 rounded-xl shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#e81cff]/5 rounded-full blur-2xl" />
              
              <div className="relative inline-flex items-center justify-center">
                {/* SVG Progress Ring */}
                <svg className="w-48 h-48 transform -rotate-90">
                  <circle
                    cx="96"
                    cy="96"
                    r="75"
                    className="text-white/5"
                    strokeWidth="12"
                    stroke="currentColor"
                    fill="transparent"
                  />
                  <circle
                    cx="96"
                    cy="96"
                    r="75"
                    strokeWidth="12"
                    strokeDasharray={2 * Math.PI * 75}
                    strokeDashoffset={2 * Math.PI * 75 - ((diagnosis.overall_health_score ?? 0) / 10) * (2 * Math.PI * 75)}
                    strokeLinecap="round"
                    stroke="url(#deckGlowGrad)"
                    fill="transparent"
                    className="transition-all duration-1000"
                  />
                  <defs>
                    <linearGradient id="deckGlowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#4f20c0" />
                      <stop offset="100%" stopColor="#e81cff" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-5xl font-black text-white tracking-tighter tabular-nums">
                    {(diagnosis.overall_health_score ?? 0).toFixed(1)}
                  </span>
                  <span className="text-[10px] font-bold text-gray-550 uppercase tracking-widest">
                    PUAN / 10
                  </span>
                </div>
              </div>

              <div className="mt-6 flex justify-around w-full border-t border-white/5 pt-4 text-center">
                <div>
                  <span className="text-[9px] font-bold text-gray-500 uppercase">Sektör Uyum</span>
                  <span className="block text-sm font-extrabold text-white mt-1">%{scores.sectorFit ?? 0}</span>
                </div>
                <div className="border-l border-white/5 px-4">
                  <span className="text-[9px] font-bold text-gray-550 uppercase">Satış Hazırlık</span>
                  <span className="block text-sm font-extrabold text-white mt-1">%{scores.salesReadiness ?? 0}</span>
                </div>
                <div className="border-l border-white/5 pl-4">
                  <span className="text-[9px] font-bold text-gray-550 uppercase">Kapsam Oranı</span>
                  <span className="block text-sm font-extrabold text-white mt-1">%{sub.completionRate ?? 100}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Slide 2: 5 DIMENSIONS */}
        {currentSlide === 2 && (
          <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center animate-fade-in-up">
            <div className="flex justify-center bg-white/[0.01] border border-white/5 p-6 rounded-xl relative">
              <RadarChart metrics={metrics} />
            </div>

            <div className="space-y-4">
              <span className="text-[9px] font-bold text-[#e81cff] uppercase tracking-widest block">SLAYT 3 // BOYUTSAL ANALİZ</span>
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                5 Boyutta Teşhis Profilleme
              </h2>
              <p className="text-[11px] text-gray-400 leading-relaxed font-semibold">
                Marka kimliği ve büyüme performansı, huni optimizasyonunu etkileyen 5 temel boyutta ayrı ayrı puanlanmaktadır.
              </p>

              <div className="space-y-3 pt-2">
                {metrics.map((m) => (
                  <div key={m.label} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <div>
                        <span className="font-extrabold text-white">{m.label}</span>
                        <span className="text-[10px] text-gray-550 font-normal ml-2 hidden sm:inline">{m.desc}</span>
                      </div>
                      <span className="font-black text-[#e81cff] tabular-nums">{m.value.toFixed(1)}/10</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#4f20c0] to-[#e81cff] rounded-full"
                        style={{ width: `${m.value * 10}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Slide 3: ACTIVE DIAGNOSES */}
        {currentSlide === 3 && (
          <div className="w-full max-w-4xl space-y-6 animate-fade-in-up">
            <div className="text-center sm:text-left space-y-1">
              <span className="text-[9px] font-bold text-[#e81cff] uppercase tracking-widest block">SLAYT 4 // YAPISAL PROBLEMLER</span>
              <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                Sistem Teşhis & Tespit Bulguları
              </h2>
              <p className="text-xs text-gray-400 font-semibold">
                Markanızın veri kombinasyonlarında tetiklenen aktif yapısal sendromlar ve yapay zeka bulguları.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold text-gray-550 uppercase tracking-wider">Aktif Yapısal Teşhisler</h4>
                {explainability.activeDiagnoses && explainability.activeDiagnoses.length > 0 ? (
                  <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                    {explainability.activeDiagnoses.map((diag: any) => (
                      <div key={diag.key} className="bg-white/[0.02] border border-white/5 rounded-lg p-4 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-extrabold text-white text-xs">{diag.label}</span>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {diag.severity && (
                              <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${SEVERITY_BADGES[diag.severity] || 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'}`}>
                                {RISK_LABELS[diag.severity] || diag.severity.toUpperCase()}
                              </span>
                            )}
                            <span className="text-[9px] font-mono bg-[#4f20c0]/20 text-[#e81cff] border border-[#e81cff]/20 px-2 py-0.5 rounded">
                              {diag.key}
                            </span>
                          </div>
                        </div>
                        {diag.findings && (
                          <ul className="space-y-1 pl-1">
                            {diag.findings.map((finding: string, idx: number) => (
                              <li key={idx} className="text-[10.5px] text-gray-400 leading-relaxed flex items-start gap-1.5">
                                <span className="text-[#e81cff] mt-0.5">•</span>
                                {finding}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center bg-white/[0.01] border border-white/5 rounded-lg text-xs text-gray-500 italic">
                    Belirgin bir yapısal problem bulunmuyor.
                  </div>
                )}
              </div>

              {/* Confidence & Evidence Panel */}
              <div className="space-y-3 bg-white/[0.02] border border-white/5 rounded-xl p-5 relative overflow-hidden flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-gray-550 uppercase">Karar Güven Oranı</span>
                    <span className="text-lg font-black text-emerald-400 font-mono">%{explainability.confidenceDetails?.score ?? 100}</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#4f20c0] to-emerald-400 rounded-full"
                      style={{ width: `${explainability.confidenceDetails?.score ?? 100}%` }}
                    />
                  </div>
                  <div className="pt-2">
                    <span className="text-[9px] font-bold text-gray-550 uppercase tracking-wider block mb-1.5">Tetikleyici Sinyal Kanıtları:</span>
                    <div className="flex flex-wrap gap-1.5 max-h-[160px] overflow-y-auto">
                      {explainability.activeSignals && explainability.activeSignals.length > 0 ? (
                        explainability.activeSignals.map((sig: any) => (
                          <span
                            key={sig.key}
                            title={sig.evidence}
                            className="text-[9px] font-mono bg-white/5 text-gray-400 border border-white/5 px-2 py-0.5 rounded cursor-help hover:text-white transition-all"
                          >
                            {sig.key}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-gray-600 italic">Veri bulunmuyor.</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/5 pt-3 mt-4 text-[10px] text-gray-500 leading-relaxed font-semibold">
                  * Karar güven oranı, markanın beyan ettiği tutarlılık ile ajansın gözlemlediği verilerin eşleşme hassasiyetini temsil eder.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Slide 4: WRONG SEQUENCE WARNINGS */}
        {currentSlide === 4 && (
          <div className="w-full max-w-4xl space-y-6 animate-fade-in-up">
            <div className="text-center sm:text-left space-y-1">
              <span className="text-[9px] font-bold text-[#e81cff] uppercase tracking-widest block">SLAYT 5 // SIRALAMA ENGELLERİ</span>
              <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                Wrong Sequence: Kritik Sıralama Engelleri
              </h2>
              <p className="text-xs text-gray-400 font-semibold">
                Stratejik adımların yanlış sıralanması, bütçe israfına ve operasyonel verimsizliğe yol açar.
              </p>
            </div>

            {treatmentIntelligence?.wrongSequenceWarnings && treatmentIntelligence.wrongSequenceWarnings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {treatmentIntelligence.wrongSequenceWarnings.map((warn: any) => (
                  <div key={warn.key} className="border border-red-500/30 bg-red-500/5 rounded-xl p-5 space-y-3 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/5 rounded-full blur-xl" />
                    
                    <div className="flex items-center gap-2.5 text-red-400 font-black text-xs uppercase tracking-wider">
                      <span className="material-symbols-outlined text-[18px]">warning</span>
                      <span>{warn.title}</span>
                    </div>
                    
                    <p className="text-gray-300 text-xs leading-relaxed font-medium">
                      {warn.warningMessage}
                    </p>
                    
                    <div className="pt-3 border-t border-red-500/10 flex flex-col gap-1 text-[10px]">
                      <span className="text-red-400 font-bold uppercase tracking-wider">Bloke Edilen Hedef Adım:</span>
                      <span className="text-gray-400 font-mono bg-white/5 border border-white/5 rounded px-2.5 py-1 mt-0.5 inline-block self-start">
                        {warn.targetAction}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="max-w-xl mx-auto p-12 text-center bg-white/[0.01] border border-white/5 rounded-xl space-y-3">
                <span className="material-symbols-outlined text-[48px] text-emerald-400">check_circle</span>
                <h3 className="font-extrabold text-white text-sm">Sıralama Blokajı Bulunmuyor</h3>
                <p className="text-xs text-gray-400 leading-relaxed max-w-sm mx-auto">
                  Sistem herhangi bir "Wrong Sequence" uyarısı tetiklemedi. Markanın eylem planı sıralaması yapısal olarak optimize edilmiştir.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Slide 5: ROADMAP */}
        {currentSlide === 5 && (
          <div className="w-full max-w-4xl space-y-6 animate-fade-in-up">
            <div className="text-center sm:text-left space-y-1">
              <span className="text-[9px] font-bold text-[#e81cff] uppercase tracking-widest block">SLAYT 6 // YOL HARİTASI</span>
              <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                Öncelikli Aksiyon Yol Haritası
              </h2>
              <p className="text-xs text-gray-400 font-semibold">
                Sistemin etki, aciliyet ve uygulanabilirlik puanlarına göre optimize ettiği 30 günlük eylem planı adımları.
              </p>
            </div>

            {treatmentIntelligence?.strategicRoadmap && treatmentIntelligence.strategicRoadmap.length > 0 ? (
              <div className="relative border-l-2 border-white/5 ml-4 pl-6 space-y-6 max-h-[340px] overflow-y-auto pr-1">
                {treatmentIntelligence.strategicRoadmap.map((item: any, idx: number) => {
                  const metricsData = treatmentIntelligence.priorityMetrics?.[item.diagnosisKey];
                  const isTop = idx === 0;
                  return (
                    <div key={item.diagnosisKey} className="relative">
                      {/* Timeline dot */}
                      <span className={`absolute -left-[32px] top-1.5 w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                        isTop ? "bg-[#e81cff] text-black shadow-lg shadow-[#e81cff]/30" : "bg-[#07050f] text-gray-500 border border-white/10"
                      }`}>
                        {idx + 1}
                      </span>
                      
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`font-extrabold text-sm ${isTop ? "text-white" : "text-gray-300"}`}>
                            {item.label}
                          </span>
                          {isTop && (
                            <span className="text-[9px] font-bold bg-[#e81cff]/10 text-[#e81cff] border border-[#e81cff]/20 px-2 py-0.5 rounded">
                              İLK ADIM
                            </span>
                          )}
                        </div>
                        
                        {metricsData && (
                          <div className="flex gap-4 text-[9px] text-gray-500 font-bold uppercase tracking-wider font-mono">
                            <span className="flex items-center gap-1">
                              Etki: <strong className="text-white font-mono">{metricsData.impactScore}</strong>
                            </span>
                            <span className="flex items-center gap-1">
                              Aciliyet: <strong className="text-white font-mono">{metricsData.urgencyScore}</strong>
                            </span>
                            <span className="flex items-center gap-1">
                              Hazırlık: <strong className="text-white font-mono">{metricsData.readinessScore}</strong>
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center bg-white/[0.01] border border-white/5 rounded-lg text-xs text-gray-500 italic">
                Aksiyon planı çıkarılmamış.
              </div>
            )}
          </div>
        )}

        {/* Slide 6: NEXT STEPS & CTAs */}
        {currentSlide === 6 && (
          <div className="w-full max-w-4xl space-y-6 text-center animate-fade-in-up">
            <span className="text-[9px] font-bold text-[#e81cff] uppercase tracking-widest block">SLAYT 7 // SONRAKİ ADIMLAR</span>
            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
              Süreç Takibi & Stratejik Entegrasyon
            </h2>
            <p className="text-xs text-gray-400 leading-relaxed font-semibold max-w-md mx-auto">
              Teşhis sonuçlarının gerçek hayatta uygulanması ve 30 günlük gelişim sonuçlarının takip edilmesi.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left max-w-3xl mx-auto pt-4">
              {/* Outcome Target */}
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 space-y-2">
                <span className="material-symbols-outlined text-[#e81cff]">ads_click</span>
                <h4 className="text-xs font-extrabold text-white uppercase tracking-wide">30 Günlük Hedeflenen Sonuç</h4>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  {(diagnosis as any).learning_intelligence?.thirtyDayOutcome ?? 
                   (diagnosis.internal_analysis as any)?.learning_intelligence?.thirtyDayOutcome ?? 
                   '30 gün içerisinde markanın dönüşüm oranlarını optimize etmek ve görsel tutarlılığını artırmak.'}
                </p>
              </div>

              {/* Implementation track */}
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 space-y-2">
                <span className="material-symbols-outlined text-[#e81cff]">lock_open</span>
                <h4 className="text-xs font-extrabold text-white uppercase tracking-wide">Müşteri Paylaşım Ayarları</h4>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Bu teşhis sunumunun detaylı raporunu müşteriye iletmek için, stüdyodan kilit durumunu kaldırabilir veya kilitli tutarak premium danışmanlık paketi satabilirsiniz.
                </p>
              </div>
            </div>

            <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-center gap-3 max-w-md mx-auto">
              <Link
                href={`/studio/marka101/${diagnosis.id}/sonuc`}
                className="bg-gradient-to-r from-[#4f20c0] to-[#e81cff] text-white font-extrabold text-xs px-6 py-3.5 rounded-full flex items-center justify-center gap-1.5 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-[#4f20c0]/20"
              >
                Stüdyo Sonuçlarına Dön
              </Link>
            </div>
          </div>
        )}

      </div>

      {/* Bottom Footer Controls */}
      <div className="relative z-10 flex flex-col sm:flex-row justify-between items-center border-t border-white/5 pt-4 gap-4">
        {/* Navigation Dot Indicators */}
        <div className="flex gap-2">
          {Array.from({ length: totalSlides }).map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentSlide(idx)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                currentSlide === idx ? 'bg-[#e81cff] w-6' : 'bg-white/10 hover:bg-white/25'
              }`}
              title={`Slayt ${idx + 1}`}
            />
          ))}
        </div>

        {/* Prev / Next controls */}
        <div className="flex gap-2.5">
          <button
            onClick={prevSlide}
            disabled={currentSlide === 0}
            type="button"
            className="px-4 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-20 disabled:hover:bg-white/5 border border-white/5 text-xs font-bold rounded-full transition-all text-white flex items-center gap-1"
          >
            ← Önceki
          </button>
          <button
            onClick={nextSlide}
            disabled={currentSlide === totalSlides - 1}
            type="button"
            className="px-5 py-2 bg-[#4f20c0]/40 hover:bg-[#4f20c0]/60 disabled:opacity-20 border border-[#e81cff]/10 text-xs font-bold rounded-full transition-all text-white flex items-center gap-1 shadow-lg shadow-[#4f20c0]/10"
          >
            Sonraki →
          </button>
        </div>
      </div>
    </div>
  );
}
