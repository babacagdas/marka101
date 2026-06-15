// src/app/(studio)/studio/icgoru-merkezi/page.tsx
'use client';

import { useEffect, useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';

interface DiagnosisItem {
  id: string;
  brand_name: string;
  public_submission: any;
  overall_health_score: number | null;
  premium_potential_score: number | null;
  creative_potential_score: number | null;
  sales_readiness_score: number | null;
  offer_potential_score: number | null;
  learning_intelligence?: any;
  internal_analysis?: any;
}

export default function IcgoruMerkeziPage() {
  const [diagnoses, setDiagnoses] = useState<DiagnosisItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBrandId, setSelectedBrandId] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const SECTOR_LABELS: Record<string, string> = {
    health: 'Sağlık / Klinik / Güzellik',
    realestate: 'Gayrimenkul & Mimarlık',
    b2b_industrial: 'Sanayi & İhracat',
    general: 'Genel Hizmet',
  };

  useEffect(() => {
    async function fetchDiagnoses() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('diagnoses')
          .select('id, brand_name, public_submission, overall_health_score, premium_potential_score, creative_potential_score, sales_readiness_score, offer_potential_score, learning_intelligence, internal_analysis');
        if (data) {
          setDiagnoses(data);
        }
      } catch (err) {
        console.error('Error fetching insights diagnoses:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchDiagnoses();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Compute Global Average
  const globalStats = useMemo(() => {
    const scored = diagnoses.filter(d => d.overall_health_score !== null);
    if (scored.length === 0) {
      return { overall: 0, premium: 0, creative: 0, sales: 0, offer: 0, count: 0 };
    }
    const sum = scored.reduce((acc, curr) => acc + Number(curr.overall_health_score), 0);
    
    let pSum = 0, cSum = 0, sSum = 0, oSum = 0;
    let pCount = 0, cCount = 0, sCount = 0, oCount = 0;
    
    scored.forEach(d => {
      if (d.premium_potential_score !== null) { pSum += Number(d.premium_potential_score); pCount++; }
      if (d.creative_potential_score !== null) { cSum += Number(d.creative_potential_score); cCount++; }
      if (d.sales_readiness_score !== null) { sSum += Number(d.sales_readiness_score); sCount++; }
      if (d.offer_potential_score !== null) { oSum += Number(d.offer_potential_score); oCount++; }
    });

    return {
      overall: sum / scored.length,
      premium: pCount > 0 ? pSum / pCount : 0,
      creative: cCount > 0 ? cSum / cCount : 0,
      sales: sCount > 0 ? sSum / sCount : 0,
      offer: oCount > 0 ? oSum / oCount : 0,
      count: scored.length
    };
  }, [diagnoses]);

  // Find Weakest Global Dimension
  const weakestGlobalDimension = useMemo(() => {
    if (globalStats.count === 0) return { name: 'Veri Yok', score: 0 };
    const dims = [
      { name: 'Premium Algı', score: globalStats.premium },
      { name: 'Kreatif Kapasite', score: globalStats.creative },
      { name: 'Satışa Hazırlık', score: globalStats.sales },
      { name: 'Teklif Gücü', score: globalStats.offer }
    ];
    dims.sort((a, b) => a.score - b.score);
    return dims[0];
  }, [globalStats]);

  // Find Top Performing Brand
  const topPerformer = useMemo(() => {
    const scored = diagnoses.filter(d => d.overall_health_score !== null);
    if (scored.length === 0) return null;
    scored.sort((a, b) => Number(b.overall_health_score) - Number(a.overall_health_score));
    return scored[0];
  }, [diagnoses]);

  // Compute Sectoral stats
  const sectorStats = useMemo(() => {
    const stats: Record<string, { count: number; totalScore: number; scoredCount: number }> = {};
    diagnoses.forEach((d) => {
      const sub = d.public_submission || {};
      const sector = sub.brandContext?.sector || sub.sector || 'general';
      if (!stats[sector]) {
        stats[sector] = { count: 0, totalScore: 0, scoredCount: 0 };
      }
      stats[sector].count += 1;
      if (d.overall_health_score !== null) {
        stats[sector].totalScore += Number(d.overall_health_score);
        stats[sector].scoredCount += 1;
      }
    });

    return Object.entries(stats).map(([key, s]) => ({
      key,
      name: SECTOR_LABELS[key] || 'Genel Hizmet',
      count: s.count,
      avgScore: s.scoredCount > 0 ? s.totalScore / s.scoredCount : 0,
    })).sort((a, b) => b.count - a.count);
  }, [diagnoses]);

  // Selected Brand for Benchmarking
  const selectedBrand = diagnoses.find(d => d.id === selectedBrandId);

  // Compute Sector Average for selected brand's sector
  const selectedBrandSectorAvg = useMemo(() => {
    if (!selectedBrand) return null;
    const sub = selectedBrand.public_submission || {};
    const sectorKey = sub.brandContext?.sector || sub.sector || 'general';
    
    const sameSector = diagnoses.filter(d => {
      const s = d.public_submission || {};
      const sec = s.brandContext?.sector || s.sector || 'general';
      return sec === sectorKey && d.overall_health_score !== null;
    });

    if (sameSector.length === 0) return null;

    let sum = 0, pSum = 0, cSum = 0, sSum = 0, oSum = 0;
    let count = 0, pCount = 0, cCount = 0, sCount = 0, oCount = 0;

    sameSector.forEach(d => {
      sum += Number(d.overall_health_score);
      count++;
      if (d.premium_potential_score !== null) { pSum += Number(d.premium_potential_score); pCount++; }
      if (d.creative_potential_score !== null) { cSum += Number(d.creative_potential_score); cCount++; }
      if (d.sales_readiness_score !== null) { sSum += Number(d.sales_readiness_score); sCount++; }
      if (d.offer_potential_score !== null) { oSum += Number(d.offer_potential_score); oCount++; }
    });

    return {
      overall: sum / count,
      premium: pCount > 0 ? pSum / pCount : 0,
      creative: cCount > 0 ? cSum / cCount : 0,
      sales: sCount > 0 ? sSum / sCount : 0,
      offer: oCount > 0 ? oSum / oCount : 0
    };
  }, [selectedBrand, diagnoses]);

  // Dynamic recommendations for selected brand
  const selectedBrandAdvice = useMemo(() => {
    if (!selectedBrand || !selectedBrandSectorAvg) return [];
    const advice = [];
    
    const pDiff = (selectedBrand.premium_potential_score ?? 5.0) - selectedBrandSectorAvg.premium;
    const cDiff = (selectedBrand.creative_potential_score ?? 5.0) - selectedBrandSectorAvg.creative;
    const sDiff = (selectedBrand.sales_readiness_score ?? 5.0) - selectedBrandSectorAvg.sales;
    const oDiff = (selectedBrand.offer_potential_score ?? 5.0) - selectedBrandSectorAvg.offer;

    if (pDiff < 0) {
      advice.push('Müşterinin **Premium Görsel Algısı** sektör ortalamasının altındadır. Logolar, görsel kimlik şablonları ve font aileleri güncellenmelidir.');
    }
    if (cDiff < 0) {
      advice.push('Müşterinin **Kreatif Kapasite** seviyesi zayıftır. Reels ve video odaklı sosyal medya içerik sistemi (Brand Kit) tasarlanmalıdır.');
    }
    if (sDiff < 0) {
      advice.push('Müşterinin **Satışa Hazırlık** ve web sitesi kullanıcı deneyimi geridedir. Hızlı eylem butonları (CTA) ve mobil hız iyileştirmesi yapılmalıdır.');
    }
    if (oDiff < 0) {
      advice.push('Müşterinin **Teklif Gücü & Değer Vaadi** jenerik kalmıştır. Sunduğu hizmetleri rakiplerden ayıran net bir değer vaadi formüle edilmelidir.');
    }

    return advice;
  }, [selectedBrand, selectedBrandSectorAvg]);

  // Resolve learning intelligence from direct or fallback
  const getLearningIntelligence = (item: DiagnosisItem) => {
    if (item.learning_intelligence && Object.keys(item.learning_intelligence).length > 0) {
      return item.learning_intelligence;
    }
    if (item.internal_analysis?.learning_intelligence) {
      return item.internal_analysis.learning_intelligence;
    }
    return null;
  };

  const learningStats = useMemo(() => {
    const activeTrackers = diagnoses
      .map(d => ({ brandName: d.brand_name, info: getLearningIntelligence(d) }))
      .filter(t => t.info !== null && t.info.activeDiagnoses && t.info.activeDiagnoses.length > 0);

    if (activeTrackers.length === 0) {
      return { successRateByDiagnosis: [], totalEvaluated: 0, successfulCount: 0, activeNotes: [] };
    }

    // Success by Diagnosis key
    const diagnosisStats: Record<string, { label: string; count: number; successCount: number; failedCount: number; pendingCount: number }> = {};
    let successfulCount = 0;
    const notes: { brandName: string; notes: string; status: string; date?: string; plan?: string }[] = [];

    activeTrackers.forEach(t => {
      const info = t.info;
      const status = info.resultStatus;
      
      if (status === 'successful' || status === 'partially_successful') {
        successfulCount++;
      }

      if (info.learningNotes && info.learningNotes.trim().length > 0) {
        notes.push({
          brandName: t.brandName,
          notes: info.learningNotes,
          status: info.resultStatus,
          date: info.updatedAt,
          plan: info.recommendedPlan?.title,
        });
      }

      info.activeDiagnoses.forEach((ad: any) => {
        if (!ad.key) return;
        if (!diagnosisStats[ad.key]) {
          diagnosisStats[ad.key] = {
            label: ad.label || ad.key,
            count: 0,
            successCount: 0,
            failedCount: 0,
            pendingCount: 0,
          };
        }
        diagnosisStats[ad.key].count++;
        if (status === 'successful' || status === 'partially_successful') {
          diagnosisStats[ad.key].successCount++;
        } else if (status === 'failed') {
          diagnosisStats[ad.key].failedCount++;
        } else {
          diagnosisStats[ad.key].pendingCount++;
        }
      });
    });

    const successRateByDiagnosis = Object.entries(diagnosisStats).map(([key, stat]) => ({
      key,
      label: stat.label,
      count: stat.count,
      successCount: stat.successCount,
      rate: stat.count > 0 ? (stat.successCount / stat.count) * 100 : 0,
    })).sort((a, b) => b.rate - a.rate);

    return {
      successRateByDiagnosis,
      totalEvaluated: activeTrackers.length,
      successfulCount,
      activeNotes: notes,
    };
  }, [diagnoses]);

  const STATUS_LABELS: Record<string, string> = {
    not_started: 'Yeni / Başlanmadı',
    in_progress: 'Devam Ediyor',
    successful: 'Başarılı',
    partially_successful: 'Kısmen Başarılı',
    failed: 'Başarısız',
  };

  return (
    <div className="w-full space-y-6 animate-fade-in-up pb-12 px-2 text-gray-700 relative">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-24 right-6 bg-[#0e0b20] border border-[#b5179e]/30 px-5 py-4 rounded-lg shadow-2xl text-xs font-bold text-[#f6f5fa] z-50 flex items-center gap-3 animate-fade-in-up">
          <span className="material-symbols-outlined text-[#b5179e] animate-pulse">analytics</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="border-b border-white/5 pb-5">
        <h1 className="text-xl font-black text-[#f6f5fa] tracking-tight flex items-center gap-2">
          <span className="material-symbols-outlined text-[24px] text-[#b5179e]">analytics</span>
          İçgörü ve Analitik Merkezi
        </h1>
        <p className="text-xs text-[#928ca1] mt-1 font-medium">Başvuran markaların sektörel dağılımları, genel metrik ortalamaları ve pazar kıyaslama verileri.</p>
      </div>

      {/* Overview stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-lg p-5 border-l-4 border-l-[#4f20c0]">
          <span className="text-[10px] font-bold text-[#928ca1] uppercase tracking-wider block">Toplam Analiz</span>
          <h4 className="text-xl font-black text-[#f6f5fa] mt-1.5">{diagnoses.length} adet</h4>
          <span className="text-[9px] text-[#928ca1] font-semibold block mt-1.5">Sistemdeki toplam marka</span>
        </div>

        <div className="glass-card rounded-lg p-5 border-l-4 border-l-[#b5179e]">
          <span className="text-[10px] font-bold text-[#928ca1] uppercase tracking-wider block">Global Sağlık Ort.</span>
          <h4 className="text-xl font-black text-[#f6f5fa] mt-1.5">
            {globalStats.overall > 0 ? `${globalStats.overall.toFixed(1)} / 10` : 'Veri Yok'}
          </h4>
          <span className="text-[9px] text-[#b5179e] font-semibold block mt-1.5">Tüm markaların genel puanı</span>
        </div>

        <div className="glass-card rounded-lg p-5 border-l-4 border-l-amber-500">
          <span className="text-[10px] font-bold text-[#928ca1] uppercase tracking-wider block">En Zayıf Küresel Alan</span>
          <h4 className="text-xl font-black text-[#f6f5fa] mt-1.5 truncate">
            {weakestGlobalDimension.score > 0 ? `${weakestGlobalDimension.name} (${weakestGlobalDimension.score.toFixed(1)})` : 'Veri Yok'}
          </h4>
          <span className="text-[9px] text-[#928ca1] font-semibold block mt-1.5">Ortalaması en düşük boyut</span>
        </div>

        <div className="glass-card rounded-lg p-5 border-l-4 border-l-emerald-500">
          <span className="text-[10px] font-bold text-[#928ca1] uppercase tracking-wider block">En Başarılı Marka</span>
          <h4 className="text-xl font-black text-[#f6f5fa] mt-1.5 truncate">
            {topPerformer ? `${topPerformer.brand_name} (${Number(topPerformer.overall_health_score).toFixed(1)})` : 'Veri Yok'}
          </h4>
          <span className="text-[9px] text-emerald-400 font-semibold block mt-1.5">Sağlık puanı en yüksek marka</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Sectoral Breakdown */}
          <div className="glass-card rounded-lg p-6 space-y-5">
            <h3 className="text-xs font-black uppercase text-[#f6f5fa] tracking-wider border-b border-white/5 pb-3">
              Sektörel Dağılım ve Sağlık Puanları
            </h3>

            <div className="space-y-4">
              {isLoading ? (
                <div className="p-8 text-center text-xs font-bold text-[#928ca1] animate-pulse">Yükleniyor...</div>
              ) : sectorStats.length === 0 ? (
                <div className="p-8 text-center text-xs font-bold text-[#928ca1] border border-dashed border-white/10 rounded-lg">
                  Henüz veri bulunmuyor.
                </div>
              ) : (
                sectorStats.map((item, idx) => {
                  const ratio = diagnoses.length > 0 ? (item.count / diagnoses.length) * 100 : 0;
                  return (
                    <div key={idx} className="space-y-2">
                      <div className="flex justify-between items-center text-xs font-bold text-[#c9c5d8]">
                        <div>
                          <span className="text-[#f6f5fa] font-extrabold">{item.name} Sektörü</span>
                          <span className="text-[9px] text-[#928ca1] ml-2">Ortalama: {item.avgScore.toFixed(1)}/10</span>
                        </div>
                        <span className="text-[#b5179e] font-black">%{Math.round(ratio)} ({item.count} Marka)</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-[#4f20c0] to-[#b5179e]" 
                          style={{ width: `${Math.round(ratio)}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Dimension Benchmarks */}
          <div className="glass-card rounded-lg p-6 space-y-5">
            <h3 className="text-xs font-black uppercase text-[#f6f5fa] tracking-wider border-b border-white/5 pb-3">
              Ana Boyut Küresel Ortalamaları
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-bold text-[#c9c5d8]">
              {/* Premium score */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Premium Algı & Görsel Tasarım</span>
                  <span className="text-[#f6f5fa]">{globalStats.premium.toFixed(1)} / 10</span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-[#4f20c0]" style={{ width: `${globalStats.premium * 10}%` }} />
                </div>
              </div>

              {/* Creative score */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Kreatif Kapasite & Sosyal Medya</span>
                  <span className="text-[#f6f5fa]">{globalStats.creative.toFixed(1)} / 10</span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-[#b5179e]" style={{ width: `${globalStats.creative * 10}%` }} />
                </div>
              </div>

              {/* Sales readiness score */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Satışa Hazırlık & Web Sitesi UX</span>
                  <span className="text-[#f6f5fa]">{globalStats.sales.toFixed(1)} / 10</span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-[#4f20c0]" style={{ width: `${globalStats.sales * 10}%` }} />
                </div>
              </div>

              {/* Offer power score */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Teklif Gücü & Değer Vaadi</span>
                  <span className="text-[#f6f5fa]">{globalStats.offer.toFixed(1)} / 10</span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-[#b5179e]" style={{ width: `${globalStats.offer * 10}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* BIOS Öğrenme & Teşhis Doğruluk Analizi */}
          <div className="glass-card rounded-lg p-6 space-y-5 border-t-2 border-t-[#e81cff]/50">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-xs font-black uppercase text-[#f6f5fa] tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#e81cff]">psychology</span>
                BIOS Öğrenme & Teşhis Doğruluk Analizi
              </h3>
              <span className="text-[9px] font-bold text-gray-450 bg-[#e81cff]/10 text-[#e81cff] border border-[#e81cff]/30 px-2 py-0.5 rounded-sm">
                Feedback Loop
              </span>
            </div>

            {learningStats.totalEvaluated === 0 ? (
              <div className="py-12 text-center text-xs font-bold text-[#928ca1] border border-dashed border-white/5 rounded-lg">
                <span className="material-symbols-outlined text-[32px] text-white/10 mb-2 block">history_edu</span>
                Henüz öğrenme ve müdahale sonucu kaydı bulunmuyor.  
                <p className="text-[10px] text-gray-500 font-semibold mt-1 max-w-xs mx-auto">
                  Teşhis alan markaların sonuç sayfalarındaki "Learning Tracker" bölümünden veri girdikçe bu panel aktifleşecektir.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Stats summary */}
                <div className="grid grid-cols-2 gap-4 bg-[#140e2d]/40 p-4 border border-white/5 rounded-lg text-xs font-bold">
                  <div>
                    <span className="text-[#928ca1] text-[9px] uppercase tracking-wider">Takip Edilen Müdahale</span>
                    <p className="text-[#f6f5fa] text-base font-black mt-0.5">{learningStats.totalEvaluated} adet</p>
                  </div>
                  <div>
                    <span className="text-[#e81cff] text-[9px] uppercase tracking-wider">Ortalama Başarı Oranı</span>
                    <p className="text-[#f6f5fa] text-base font-black mt-0.5">
                      %{Math.round((learningStats.successfulCount / learningStats.totalEvaluated) * 100)}
                    </p>
                  </div>
                </div>

                {/* Success Rates by Diagnosis */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold text-[#f6f5fa] uppercase tracking-wider">Teşhis Bazlı Müdahale Başarı Oranları</h4>
                  <div className="space-y-3">
                    {learningStats.successRateByDiagnosis.map((stat, idx) => (
                      <div key={idx} className="space-y-1.5 text-xs font-bold text-[#c9c5d8]">
                        <div className="flex justify-between items-center">
                          <span>{stat.label} (`{stat.key}`)</span>
                          <span className="text-white">%{Math.round(stat.rate)} ({stat.successCount}/{stat.count} Başarı)</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-[#4f20c0] to-[#e81cff]" 
                            style={{ width: `${stat.rate}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* System insights / recommendations */}
                <div className="p-4 bg-purple-950/10 border border-purple-900/40 rounded-lg text-[10px] text-[#928ca1] leading-relaxed font-semibold">
                  <span className="text-[#e81cff] font-bold text-[11px] flex items-center gap-1 mb-1">
                    <span className="material-symbols-outlined text-[14px]">lightbulb</span>
                    Sistem Karar Önerisi & Çıkarım
                  </span>
                  {learningStats.successRateByDiagnosis.length > 0 && learningStats.successRateByDiagnosis[0].rate >= 75 ? (
                    <p>
                      Teşhis motoru, en başarılı sonuç veren **{learningStats.successRateByDiagnosis[0].label}** müdahale kararlarını yüksek doğrulukla önermektedir (%{Math.round(learningStats.successRateByDiagnosis[0].rate)} başarı oranı).
                      Bu teşhisin tetiklendiği markalarda öncelik aksiyon sırası değişmeksizin korunmalıdır.
                    </p>
                  ) : (
                    <p>
                      Müdahale verileri toplanmaya devam ediyor. BIOS karar motorunun doğruluğu, toplanan eylemlerin başarı durumlarına göre optimize edilecek ve dinamik kararlar güncellenecektir.
                    </p>
                  )}
                </div>

                {/* Learning Notes Timeline */}
                {learningStats.activeNotes.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-bold text-[#f6f5fa] uppercase tracking-wider">Kampanya & Öğrenme Akışı (Learning Feed)</h4>
                    <div className="relative border-l border-white/5 pl-4 space-y-4 ml-2 max-h-[300px] overflow-y-auto pr-2">
                      {learningStats.activeNotes.map((note, idx) => (
                        <div key={idx} className="relative text-xs">
                          <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#e81cff] border border-[#141221]" />
                          <div className="space-y-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-extrabold text-white">{note.brandName}</span>
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                note.status === 'successful' || note.status === 'partially_successful'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              }`}>
                                {STATUS_LABELS[note.status] || note.status}
                              </span>
                            </div>
                            {note.plan && (
                              <p className="text-[9px] text-gray-500 font-bold font-mono">Plan: {note.plan}</p>
                            )}
                            <p className="text-gray-400 font-semibold leading-relaxed mt-1 text-[11px] bg-white/5 p-2 rounded">
                              "{note.notes}"
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right column comparative benchmark dropdown tool */}
        <div className="space-y-6 lg:col-span-1">
          <div className="glass-card rounded-lg p-5 border border-white/5 space-y-4">
            <h3 className="text-xs font-black uppercase text-[#f6f5fa] tracking-wider border-b border-white/5 pb-3">
              Marka Kıyaslama Aracı
            </h3>

            <div>
              <label className="text-[10px] text-[#928ca1] uppercase font-bold block mb-1.5">Marka Seçin</label>
              <select
                value={selectedBrandId}
                onChange={e => setSelectedBrandId(e.target.value)}
                className="w-full text-xs font-bold p-2.5 rounded-lg border border-white/10 bg-[#0e0b1a]/70 text-[#f1ecf9] focus:outline-none focus:border-[#4f20c0]"
              >
                <option value="">-- Marka Seçin --</option>
                {diagnoses.filter(d => d.overall_health_score !== null).map(d => (
                  <option key={d.id} value={d.id}>{d.brand_name}</option>
                ))}
              </select>
            </div>

            {selectedBrand && selectedBrandSectorAvg ? (
              <div className="space-y-4 animate-fade-in-up text-xs font-bold text-[#c9c5d8]">
                <div className="bg-[#140e2d]/60 border border-white/5 rounded-lg p-3 text-[10px] uppercase font-bold text-[#928ca1] text-center">
                  Sektörel Kıyaslama Raporu
                </div>

                <div className="space-y-2.5">
                  {/* Overall */}
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-[#928ca1]">Genel Sağlık:</span>
                    <div className="space-x-2">
                      <span>{Number(selectedBrand.overall_health_score).toFixed(1)}</span>
                      <span className={`text-[10px] ${
                        Number(selectedBrand.overall_health_score) >= selectedBrandSectorAvg.overall ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        ({Number(selectedBrand.overall_health_score) >= selectedBrandSectorAvg.overall ? '+' : ''}
                        {(Number(selectedBrand.overall_health_score) - selectedBrandSectorAvg.overall).toFixed(1)})
                      </span>
                    </div>
                  </div>

                  {/* Premium */}
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-[#928ca1]">Premium Algı:</span>
                    <div className="space-x-2">
                      <span>{Number(selectedBrand.premium_potential_score ?? 5.0).toFixed(1)}</span>
                      <span className={`text-[10px] ${
                        Number(selectedBrand.premium_potential_score ?? 5.0) >= selectedBrandSectorAvg.premium ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        ({Number(selectedBrand.premium_potential_score ?? 5.0) >= selectedBrandSectorAvg.premium ? '+' : ''}
                        {(Number(selectedBrand.premium_potential_score ?? 5.0) - selectedBrandSectorAvg.premium).toFixed(1)})
                      </span>
                    </div>
                  </div>

                  {/* Creative */}
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-[#928ca1]">Kreatif Kapasite:</span>
                    <div className="space-x-2">
                      <span>{Number(selectedBrand.creative_potential_score ?? 5.0).toFixed(1)}</span>
                      <span className={`text-[10px] ${
                        Number(selectedBrand.creative_potential_score ?? 5.0) >= selectedBrandSectorAvg.creative ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        ({Number(selectedBrand.creative_potential_score ?? 5.0) >= selectedBrandSectorAvg.creative ? '+' : ''}
                        {(Number(selectedBrand.creative_potential_score ?? 5.0) - selectedBrandSectorAvg.creative).toFixed(1)})
                      </span>
                    </div>
                  </div>

                  {/* Sales */}
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-[#928ca1]">Satışa Hazırlık:</span>
                    <div className="space-x-2">
                      <span>{Number(selectedBrand.sales_readiness_score ?? 5.0).toFixed(1)}</span>
                      <span className={`text-[10px] ${
                        Number(selectedBrand.sales_readiness_score ?? 5.0) >= selectedBrandSectorAvg.sales ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        ({Number(selectedBrand.sales_readiness_score ?? 5.0) >= selectedBrandSectorAvg.sales ? '+' : ''}
                        {(Number(selectedBrand.sales_readiness_score ?? 5.0) - selectedBrandSectorAvg.sales).toFixed(1)})
                      </span>
                    </div>
                  </div>

                  {/* Offer */}
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-[#928ca1]">Teklif Gücü:</span>
                    <div className="space-x-2">
                      <span>{Number(selectedBrand.offer_potential_score ?? 5.0).toFixed(1)}</span>
                      <span className={`text-[10px] ${
                        Number(selectedBrand.offer_potential_score ?? 5.0) >= selectedBrandSectorAvg.offer ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        ({Number(selectedBrand.offer_potential_score ?? 5.0) >= selectedBrandSectorAvg.offer ? '+' : ''}
                        {(Number(selectedBrand.offer_potential_score ?? 5.0) - selectedBrandSectorAvg.offer).toFixed(1)})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Recommendations */}
                {selectedBrandAdvice.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-white/5">
                    <span className="text-[10px] uppercase font-bold text-[#b5179e] block">Gelişim Eylemleri</span>
                    <div className="space-y-1.5 text-[10px] text-[#928ca1] leading-relaxed font-semibold">
                      {selectedBrandAdvice.map((adv, idx) => (
                        <p key={idx} className="flex gap-1.5 items-start">
                          <span className="text-[#b5179e] shrink-0">•</span>
                          <span dangerouslySetInnerHTML={{ __html: adv.replace(/\*\*([^*]+)\*\*/g, '<strong class="text-[#f6f5fa]">$1</strong>') }} />
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-[#140e2d]/30 border border-white/5 p-4 rounded-lg text-center">
                <span className="material-symbols-outlined text-[36px] text-white/20 mb-2">radar</span>
                <p className="text-[11px] text-[#928ca1] leading-relaxed">
                  Marka seçerek sektörel ortalamalar ile anlık kıyaslamasını inceleyin.
                </p>
              </div>
            )}
          </div>

          {/* Quick Actions Panel */}
          <div className="glass-card rounded-lg p-5 border border-white/5 space-y-3">
            <h3 className="text-xs font-black uppercase text-[#f6f5fa] tracking-wider border-b border-white/5 pb-3">
              Hızlı Aksiyonlar
            </h3>
            <div className="space-y-2 text-xs font-bold text-[#4f20c0]">
              <button 
                onClick={() => showToast('Küresel sektörel trend analiz raporu stüdyo için hazırlandı.')}
                className="w-full text-left p-2.5 bg-white/5 hover:bg-purple-500/10 hover:text-[#b5179e] rounded-lg transition-all text-[#c9c5d8] border border-white/5"
              >
                ✦ Sektörel Trend Raporu Üret
              </button>
              <button 
                onClick={() => showToast('Ajans genel dönüşüm hunisi kıyaslaması paneli güncellendi.')}
                className="w-full text-left p-2.5 bg-white/5 hover:bg-purple-500/10 hover:text-[#b5179e] rounded-lg transition-all text-[#c9c5d8] border border-white/5"
              >
                ✦ Dönüşüm Hunisi Kıyaslaması
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
