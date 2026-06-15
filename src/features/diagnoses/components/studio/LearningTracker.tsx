// src/features/diagnoses/components/studio/LearningTracker.tsx
'use client';

import { useState } from 'react';
import type { Diagnosis } from '../../types';
import type { LearningIntelligence, ImplementedAction } from '../../diagnosis-types';
import { saveLearningIntelligence } from '../../lib/actions';

interface LearningTrackerProps {
  readonly diagnosis: Diagnosis;
}

const STATUS_LABELS: Record<string, string> = {
  not_started: 'Yeni / Başlanmadı',
  in_progress: 'Devam Ediyor',
  successful: 'Başarılı',
  partially_successful: 'Kısmen Başarılı',
  failed: 'Başarısız',
};

const STATUS_CLASSES: Record<string, string> = {
  not_started: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  in_progress: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  successful: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  partially_successful: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  failed: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export function LearningTracker({ diagnosis }: LearningTrackerProps) {
  const sub = diagnosis.public_submission as any;
  const explainability = sub?.scores?.explainability;
  const treatmentIntelligence = sub?.scores?.treatmentIntelligence;

  // Resolve current state (Direct column or fallback internal_analysis)
  const getInitialData = (): LearningIntelligence => {
    const direct = diagnosis.learning_intelligence;
    if (direct && Object.keys(direct).length > 0) return direct;
    
    const internal = (diagnosis.internal_analysis ?? {}) as any;
    if (internal.learning_intelligence && Object.keys(internal.learning_intelligence).length > 0) {
      return internal.learning_intelligence;
    }

    // Default initialization based on diagnostic results
    const activeDiags = (explainability?.activeDiagnoses ?? []).map((d: any) => ({
      key: d.key,
      label: d.label,
    }));

    const primaryKey = treatmentIntelligence?.priorityDiagnosisKey;
    const topPlan = treatmentIntelligence?.treatmentPlans?.find((p: any) => p.diagnosisKey === primaryKey);
    
    const recommendedPlan = topPlan ? {
      diagnosisKey: topPlan.diagnosisKey,
      title: topPlan.title,
    } : undefined;

    const implementedActions: ImplementedAction[] = (topPlan?.steps ?? []).map((step: any) => ({
      stepNumber: step.stepNumber,
      title: step.title,
      implemented: false,
    }));

    return {
      activeDiagnoses: activeDiags,
      recommendedPlan,
      implementedActions,
      resultStatus: 'not_started',
      learningNotes: '',
    };
  };

  const [trackerData, setTrackerData] = useState<LearningIntelligence>(getInitialData);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleActionToggle = (idx: number) => {
    const updatedActions = [...trackerData.implementedActions];
    updatedActions[idx] = {
      ...updatedActions[idx],
      implemented: !updatedActions[idx].implemented,
      implementedAt: !updatedActions[idx].implemented ? new Date().toISOString() : undefined,
    };
    setTrackerData({
      ...trackerData,
      implementedActions: updatedActions,
    });
  };

  const handleStatusChange = (status: any) => {
    setTrackerData({
      ...trackerData,
      resultStatus: status,
    });
  };

  const handleNotesChange = (notes: string) => {
    setTrackerData({
      ...trackerData,
      learningNotes: notes,
    });
  };

  const handleThirtyDayChange = (outcome: string) => {
    setTrackerData({
      ...trackerData,
      thirtyDayOutcome: outcome,
      thirtyDayCompletedAt: outcome.trim().length > 0 ? (trackerData.thirtyDayCompletedAt || new Date().toISOString()) : undefined,
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('idle');
    try {
      const payload: LearningIntelligence = {
        ...trackerData,
        updatedAt: new Date().toISOString(),
      };
      const res = await saveLearningIntelligence(diagnosis.id, payload);
      if (res.success) {
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        setSaveStatus('error');
      }
    } catch (err) {
      console.error(err);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-[#141221] border border-[#221e33] rounded-md p-6 shadow-sm space-y-6 text-gray-300">
      <div className="border-b border-[#221e33] pb-4 flex items-center justify-between">
        <div>
          <h3 className="font-extrabold text-white text-sm">Learning Intelligence Tracker</h3>
          <p className="text-[10px] text-gray-500 mt-0.5">
            Müdahale sonuçları, uygulanan adımlar ve sistemin karar kalitesini artıran öğrenme notları.
          </p>
        </div>
        <span className="text-[9px] font-bold text-gray-500 bg-[#1b192c] border border-[#221e33] px-2 py-1 rounded">
          FAZ 3
        </span>
      </div>

      {/* Active Diagnoses Info */}
      <div className="space-y-2">
        <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Takip Edilen Aktif Teşhisler</h4>
        {trackerData.activeDiagnoses.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {trackerData.activeDiagnoses.map(d => (
              <span 
                key={d.key} 
                className="text-[10px] font-extrabold bg-purple-950/20 text-[#e81cff] border border-purple-900/40 px-2.5 py-1 rounded flex items-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#e81cff] animate-pulse" />
                {d.label}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-500 font-semibold italic">Aktif teşhis bulunmuyor.</p>
        )}
      </div>

      {/* Recommended Treatment steps checkboxes */}
      {trackerData.recommendedPlan ? (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              Uygulanan Eylem Adımları ({trackerData.recommendedPlan.title})
            </h4>
            <span className="text-[9px] font-mono text-[#e81cff] border border-[#e81cff]/20 bg-[#e81cff]/5 px-1.5 rounded">
              Öncelikli Protokol
            </span>
          </div>

          <div className="bg-[#1b192c]/30 border border-[#221e33] rounded-md p-4 space-y-3">
            {trackerData.implementedActions.map((action, idx) => (
              <div 
                key={action.stepNumber} 
                onClick={() => handleActionToggle(idx)}
                className={`flex items-start gap-3 p-2.5 rounded border transition-all cursor-pointer select-none ${
                  action.implemented 
                    ? 'bg-purple-950/10 border-purple-900/40 text-white shadow-[0_0_6px_rgba(232,28,255,0.03)]' 
                    : 'bg-[#141221]/40 border-[#221e33] text-gray-400 hover:border-gray-800'
                }`}
              >
                <div className="pt-0.5">
                  <span className={`material-symbols-outlined text-[18px] leading-none ${
                    action.implemented ? 'text-[#e81cff]' : 'text-gray-600'
                  }`}>
                    {action.implemented ? 'check_box' : 'check_box_outline_blank'}
                  </span>
                </div>
                <div className="space-y-0.5">
                  <span className={`text-xs font-bold ${action.implemented ? 'text-white' : 'text-gray-300'}`}>
                    Adım {action.stepNumber}: {action.title}
                  </span>
                  {action.implementedAt && (
                    <p className="text-[8px] font-mono text-gray-500 font-bold">
                      Uygulandı: {new Date(action.implementedAt).toLocaleDateString('tr-TR')}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-xs text-gray-500 font-semibold italic">Uygulanacak öncelikli bir eylem planı bulunmuyor.</p>
      )}

      {/* Outcome Status Dropdown Selector */}
      <div className="space-y-2">
        <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Müdahale Sonuç Durumu (Result Status)</h4>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {Object.entries(STATUS_LABELS).map(([status, label]) => {
            const isSelected = trackerData.resultStatus === status;
            return (
              <button
                key={status}
                onClick={() => handleStatusChange(status)}
                className={`text-[10px] font-extrabold px-3 py-2.5 rounded border text-center transition-all ${
                  isSelected 
                    ? `${STATUS_CLASSES[status]} border-current shadow-lg` 
                    : 'bg-[#1b192c]/20 border-[#221e33] text-gray-500 hover:text-gray-400'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Learning Notes Textarea */}
      <div className="space-y-2">
        <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Öğrenme ve Kampanya Geri Bildirim Notları</h4>
        <textarea
          value={trackerData.learningNotes}
          onChange={e => handleNotesChange(e.target.value)}
          placeholder="Örn: Dijital Güven referans sistemi kurulduktan sonra form dönüşüm oranı %12 arttı, fiyat itirazları büyük ölçüde azaldı..."
          rows={3}
          className="w-full text-xs font-semibold p-3.5 rounded-lg border border-[#221e33] bg-[#0e0b1a]/50 text-[#f1ecf9] focus:outline-none focus:border-[#4f20c0] placeholder-gray-650 leading-relaxed"
        />
      </div>

      {/* 30-Day Outcome Feedback */}
      <div className="space-y-2 border-t border-[#221e33] pt-4">
        <div className="flex items-center justify-between">
          <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">30 Günlük Gerçek Dünya Sonucu (Validation)</h4>
          {trackerData.thirtyDayCompletedAt && (
            <span className="text-[8px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 rounded">
              Giriş: {new Date(trackerData.thirtyDayCompletedAt).toLocaleDateString('tr-TR')}
            </span>
          )}
        </div>
        <textarea
          value={trackerData.thirtyDayOutcome || ''}
          onChange={e => handleThirtyDayChange(e.target.value)}
          placeholder="Kampanyadan 30 gün sonra markanın net sonucunu yazın (Örn: Web sitesi dönüşüm oranları %25 arttı, aylık nitelikli kurumsal lead sayısı 12'ye çıktı...)"
          rows={3}
          className="w-full text-xs font-semibold p-3.5 rounded-lg border border-[#221e33] bg-[#0e0b1a]/50 text-[#f1ecf9] focus:outline-none focus:border-[#4f20c0] placeholder-gray-650 leading-relaxed"
        />
      </div>

      {/* Action Save Bar */}
      <div className="flex items-center justify-between pt-2 border-t border-[#221e33]">
        <div className="text-[9px] font-mono text-gray-550">
          {trackerData.updatedAt && (
            <span>Son Güncelleme: {new Date(trackerData.updatedAt).toLocaleString('tr-TR')}</span>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          {saveStatus === 'success' && (
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              Kaydedildi
            </span>
          )}
          {saveStatus === 'error' && (
            <span className="text-xs font-bold text-red-400 flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">error</span>
              Hata Oluştu
            </span>
          )}
          
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-gradient-to-r from-[#4f20c0] to-[#b5179e] text-white px-5 py-2.5 rounded font-bold text-xs hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center gap-1.5 shadow-lg shadow-purple-500/10"
          >
            {isSaving ? (
              <>
                <span className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full" />
                Kaydediliyor
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[14px]">save</span>
                Değişiklikleri Kaydet
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
