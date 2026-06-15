// src/features/diagnoses/components/studio/ValidationDashboard.tsx
'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { Diagnosis } from '../../types';
import type { LearningIntelligence } from '../../diagnosis-types';
import { LearningTracker } from './LearningTracker';

interface ValidationDashboardProps {
  readonly diagnoses: Diagnosis[];
}

const SECTOR_LABELS: Record<string, string> = {
  health: 'Sağlık / Klinik',
  realestate: 'Gayrimenkul',
  b2b_industrial: 'Sanayi / B2B',
  general: 'Genel Hizmet',
};

const BIZ_LABELS: Record<string, string> = {
  b2b: 'B2B',
  b2c: 'B2C',
  hybrid: 'Karma (B2B+B2C)',
};

const STATUS_LABELS: Record<string, string> = {
  not_started: 'Yeni / Başlanmadı',
  in_progress: 'Devam Ediyor',
  successful: 'Başarılı',
  partially_successful: 'Kısmen Başarılı',
  failed: 'Başarısız',
};

const STATUS_BADGE_CLASSES: Record<string, string> = {
  not_started: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  in_progress: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  successful: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  partially_successful: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  failed: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export function ValidationDashboard({ diagnoses }: ValidationDashboardProps) {
  const router = useRouter();

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [sectorFilter, setSectorFilter] = useState('');
  const [bizFilter, setBizFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [overdueFilter, setOverdueFilter] = useState(false);

  // Quick-edit Drawer State
  const [selectedDiagForEdit, setSelectedDiagForEdit] = useState<Diagnosis | null>(null);

  // Helper to resolve learning intelligence data
  const getLearningData = (d: Diagnosis): LearningIntelligence | null => {
    if (d.learning_intelligence && Object.keys(d.learning_intelligence).length > 0) {
      return d.learning_intelligence as LearningIntelligence;
    }
    const internal = d.internal_analysis as any;
    if (internal?.learning_intelligence) {
      return internal.learning_intelligence as LearningIntelligence;
    }
    return null;
  };

  // Helper to calculate overdue status (>30 days since submission & no outcome feedback yet)
  const isOverdue = (d: Diagnosis) => {
    if (!d.submitted_at) return false;
    const submissionDate = new Date(d.submitted_at);
    const diffTime = Math.abs(new Date().getTime() - submissionDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const tracking = getLearningData(d);
    const hasOutcome = tracking?.thirtyDayOutcome && tracking.thirtyDayOutcome.trim().length > 0;
    
    return diffDays >= 30 && !hasOutcome;
  };

  // 1. Process and Filter data
  const filteredData = useMemo(() => {
    return diagnoses.filter(d => {
      // Search
      const matchesSearch = d.brand_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (d.submitted_contact_name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
      
      // Sector
      const sub = d.public_submission as any;
      const sector = sub?.brandContext?.sector || sub?.sector || 'general';
      const matchesSector = sectorFilter === '' || sector === sectorFilter;

      // Business Model
      const model = sub?.brandContext?.businessModel || sub?.sells_to || 'b2c';
      const matchesBiz = bizFilter === '' || model === bizFilter;

      // Status
      const tracking = getLearningData(d);
      const status = tracking?.resultStatus || 'not_started';
      const matchesStatus = statusFilter === '' || status === statusFilter;

      // Overdue
      const matchesOverdue = !overdueFilter || isOverdue(d);

      return matchesSearch && matchesSector && matchesBiz && matchesStatus && matchesOverdue;
    });
  }, [diagnoses, searchTerm, sectorFilter, bizFilter, statusFilter, overdueFilter]);

  // 2. Aggregate metrics based on filtered results
  const metrics = useMemo(() => {
    const total = filteredData.length;
    let successful = 0;
    let feedbackCompleted = 0;
    let totalStepsCount = 0;
    let completedStepsCount = 0;

    filteredData.forEach(d => {
      const tracking = getLearningData(d);
      const status = tracking?.resultStatus;
      if (status === 'successful' || status === 'partially_successful') {
        successful++;
      }

      if (tracking?.thirtyDayOutcome && tracking.thirtyDayOutcome.trim().length > 0) {
        feedbackCompleted++;
      }

      if (tracking?.implementedActions && tracking.implementedActions.length > 0) {
        totalStepsCount += tracking.implementedActions.length;
        completedStepsCount += tracking.implementedActions.filter(a => a.implemented).length;
      }
    });

    const averageProgress = totalStepsCount > 0 ? (completedStepsCount / totalStepsCount) * 100 : 0;
    const feedbackRate = total > 0 ? (feedbackCompleted / total) * 100 : 0;

    return {
      total,
      successful,
      feedbackRate,
      averageProgress,
    };
  }, [filteredData]);

  // Close Quick-edit drawer & refresh
  const handleDrawerClose = () => {
    setSelectedDiagForEdit(null);
    router.refresh();
  };

  return (
    <div className="space-y-6 text-gray-300 relative">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#141221] border border-[#221e33] rounded-lg p-5 border-l-4 border-l-[#4f20c0]">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Doğrulanan Marka</span>
          <h4 className="text-xl font-black text-white mt-1.5">{metrics.total} Adet</h4>
          <span className="text-[9px] text-gray-500 font-semibold block mt-1.5">Filtrelenen teşhis kayıtları</span>
        </div>

        <div className="bg-[#141221] border border-[#221e33] rounded-lg p-5 border-l-4 border-l-emerald-500">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Başarılı Kampanyalar</span>
          <h4 className="text-xl font-black text-white mt-1.5">{metrics.successful} Müdahale</h4>
          <span className="text-[9px] text-emerald-400 font-semibold block mt-1.5">Pozitif / Kısmi sonuç veren</span>
        </div>

        <div className="bg-[#141221] border border-[#221e33] rounded-lg p-5 border-l-4 border-l-[#b5179e]">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">30G Geri Bildirim Oranı</span>
          <h4 className="text-xl font-black text-white mt-1.5">%{Math.round(metrics.feedbackRate)}</h4>
          <span className="text-[9px] text-gray-500 font-semibold block mt-1.5">30 Günlük sonuç girişi yapılan</span>
        </div>

        <div className="bg-[#141221] border border-[#221e33] rounded-lg p-5 border-l-4 border-l-amber-500">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Eylem İlerleme Ort.</span>
          <h4 className="text-xl font-black text-white mt-1.5">%{Math.round(metrics.averageProgress)}</h4>
          <span className="text-[9px] text-gray-500 font-semibold block mt-1.5">Uygulanan treatment adımları</span>
        </div>
      </div>

      {/* Interactive Filters Bar */}
      <div className="bg-[#141221] border border-[#221e33] rounded-lg p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-center">
        {/* Search */}
        <div>
          <input
            type="text"
            placeholder="Marka / Yetkili ara..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full text-xs font-semibold p-2.5 rounded-lg border border-[#221e33] bg-[#0e0b1a]/50 text-[#f1ecf9] focus:outline-none focus:border-[#4f20c0]"
          />
        </div>

        {/* Sector */}
        <div>
          <select
            value={sectorFilter}
            onChange={e => setSectorFilter(e.target.value)}
            className="w-full text-xs font-bold p-2.5 rounded-lg border border-[#221e33] bg-[#0e0b1a]/50 text-[#f1ecf9] focus:outline-none focus:border-[#4f20c0]"
          >
            <option value="">Tüm Sektörler</option>
            {Object.entries(SECTOR_LABELS).map(([k, l]) => (
              <option key={k} value={k}>{l}</option>
            ))}
          </select>
        </div>

        {/* Business Model */}
        <div>
          <select
            value={bizFilter}
            onChange={e => setBizFilter(e.target.value)}
            className="w-full text-xs font-bold p-2.5 rounded-lg border border-[#221e33] bg-[#0e0b1a]/50 text-[#f1ecf9] focus:outline-none focus:border-[#4f20c0]"
          >
            <option value="">Tüm Modeller</option>
            {Object.entries(BIZ_LABELS).map(([k, l]) => (
              <option key={k} value={k}>{l}</option>
            ))}
          </select>
        </div>

        {/* Result Status */}
        <div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full text-xs font-bold p-2.5 rounded-lg border border-[#221e33] bg-[#0e0b1a]/50 text-[#f1ecf9] focus:outline-none focus:border-[#4f20c0]"
          >
            <option value="">Tüm Sonuçlar</option>
            {Object.entries(STATUS_LABELS).map(([k, l]) => (
              <option key={k} value={k}>{l}</option>
            ))}
          </select>
        </div>

        {/* Overdue Checkbox */}
        <div className="flex items-center gap-2 px-1">
          <input
            type="checkbox"
            id="overdue"
            checked={overdueFilter}
            onChange={e => setOverdueFilter(e.target.checked)}
            className="rounded border-[#221e33] bg-[#0e0b1a]/50 text-[#4f20c0] focus:ring-0 w-4 h-4 cursor-pointer"
          />
          <label htmlFor="overdue" className="text-xs font-bold text-red-400 select-none cursor-pointer flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">warning</span>
            Gözden Geçirme Günü Gelenler
          </label>
        </div>
      </div>

      {/* Validation Grid */}
      <div className="bg-[#141221] border border-[#221e33] rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-semibold text-gray-400 border-collapse">
            <thead>
              <tr className="bg-[#1b192c]/50 text-gray-500 uppercase tracking-wider text-[10px] border-b border-[#221e33]">
                <th className="p-4">Marka / Model</th>
                <th className="p-4">Aktif Teşhisler</th>
                <th className="p-4">Önerilen Müdahale</th>
                <th className="p-4 text-center">Uygulama İlerlemesi</th>
                <th className="p-4">30 Günlük Sonuç / Durum</th>
                <th className="p-4 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#221e33]/50">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500 italic">
                    Arama kriterlerine uygun doğrulanacak kayıt bulunamadı.
                  </td>
                </tr>
              ) : (
                filteredData.map(d => {
                  const sub = d.public_submission as any;
                  const sector = sub?.brandContext?.sector || sub?.sector || 'general';
                  const model = sub?.brandContext?.businessModel || sub?.sells_to || 'b2c';
                  const tracking = getLearningData(d);
                  
                  const activeDiags = tracking?.activeDiagnoses || [];
                  const recommendedPlan = tracking?.recommendedPlan;
                  const actions = tracking?.implementedActions || [];
                  const status = tracking?.resultStatus || 'not_started';
                  const hasNotes = tracking?.learningNotes && tracking.learningNotes.trim().length > 0;
                  const hasOutcome = tracking?.thirtyDayOutcome && tracking.thirtyDayOutcome.trim().length > 0;

                  const totalSteps = actions.length;
                  const completedSteps = actions.filter(a => a.implemented).length;
                  const progressPct = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
                  const overdue = isOverdue(d);

                  return (
                    <tr key={d.id} className="hover:bg-[#1b192c]/20 transition-colors">
                      {/* Name / Model */}
                      <td className="p-4">
                        <div className="font-extrabold text-white">{d.brand_name}</div>
                        <div className="text-[10px] text-gray-500 mt-1 flex items-center gap-1.5 flex-wrap">
                          <span>{SECTOR_LABELS[sector] || sector}</span>
                          <span className="w-1 h-1 rounded-full bg-gray-700" />
                          <span>{BIZ_LABELS[model] || model}</span>
                        </div>
                      </td>

                      {/* Active Diagnoses */}
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {activeDiags.length > 0 ? (
                            activeDiags.map((ad: any) => (
                              <span key={ad.key} className="text-[9px] font-bold bg-[#1b192c] text-purple-400 border border-purple-950 px-1.5 py-0.5 rounded">
                                {ad.label}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-600 italic">Bulunamadı</span>
                          )}
                        </div>
                      </td>

                      {/* Recommended Intervention */}
                      <td className="p-4">
                        {recommendedPlan ? (
                          <div>
                            <div className="font-bold text-gray-300">{recommendedPlan.title}</div>
                            <div className="text-[9px] font-mono text-gray-500 mt-0.5">{recommendedPlan.diagnosisKey}</div>
                          </div>
                        ) : (
                          <span className="text-gray-600 italic">Bulunamadı</span>
                        )}
                      </td>

                      {/* Implementation Progress */}
                      <td className="p-4 text-center">
                        {totalSteps > 0 ? (
                          <div className="space-y-1.5 max-w-[100px] mx-auto">
                            <div className="flex justify-between items-center text-[9px] font-mono text-gray-400">
                              <span>%{progressPct}</span>
                              <span>{completedSteps}/{totalSteps} Adım</span>
                            </div>
                            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-[#4f20c0] to-[#b5179e]" 
                                style={{ width: `${progressPct}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-600 italic">-</span>
                        )}
                      </td>

                      {/* 30-Day outcome & status */}
                      <td className="p-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded border ${STATUS_BADGE_CLASSES[status]}`}>
                              {STATUS_LABELS[status] || status}
                            </span>
                            {overdue && (
                              <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/25 flex items-center gap-0.5 animate-pulse">
                                ⚠️ Gözden Geçir (30G)
                              </span>
                            )}
                          </div>
                          {hasOutcome ? (
                            <p className="text-[10px] text-gray-300 leading-relaxed font-medium italic max-w-[220px] line-clamp-2" title={tracking.thirtyDayOutcome}>
                              "{tracking.thirtyDayOutcome}"
                            </p>
                          ) : hasNotes ? (
                            <p className="text-[10px] text-gray-550 leading-relaxed font-medium italic max-w-[220px] line-clamp-2" title={tracking.learningNotes}>
                              Öğrenme Notu: "{tracking.learningNotes}"
                            </p>
                          ) : (
                            <span className="text-gray-600 italic text-[10px]">Henüz sonuç girilmemiş</span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right space-y-1.5">
                        <button
                          onClick={() => setSelectedDiagForEdit(d)}
                          className="text-[10px] font-bold text-[#e81cff] hover:text-[#b5179e] bg-[#e81cff]/5 hover:bg-[#e81cff]/10 border border-[#e81cff]/20 px-2.5 py-1.5 rounded transition-all inline-flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[13px]">rate_review</span>
                          Doğrula / Düzenle
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sliding Side-Drawer for Inline Quick Edit */}
      {selectedDiagForEdit && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end animate-fade-in no-print">
          {/* Backdrop Click */}
          <div className="absolute inset-0" onClick={handleDrawerClose} />
          
          {/* Drawer Body */}
          <div className="relative w-full max-w-2xl bg-[#0b0a14] border-l border-[#221e33] h-full shadow-2xl overflow-y-auto flex flex-col animate-slide-in-right p-6">
            <div className="flex justify-between items-center border-b border-[#221e33] pb-4 mb-6">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-gray-550">Inline Quick Edit</span>
                <h3 className="font-extrabold text-white text-base">
                  {selectedDiagForEdit.brand_name}
                </h3>
              </div>
              <button 
                onClick={handleDrawerClose}
                className="text-gray-400 hover:text-white material-symbols-outlined text-[20px]"
              >
                close
              </button>
            </div>

            <div className="flex-1">
              <LearningTracker diagnosis={selectedDiagForEdit} />
            </div>

            <div className="border-t border-[#221e33] pt-4 mt-6 flex justify-end">
              <button
                onClick={handleDrawerClose}
                className="bg-white/5 hover:bg-white/10 border border-[#221e33] text-white font-bold text-xs px-5 py-2.5 rounded transition-all"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
