// src/features/diagnoses/components/studio/ScoreCard.tsx
'use client';

import { useEffect, useState } from 'react';
import type { Diagnosis } from '../../types';
import { RadarChart } from './RadarChart';

interface ScoreCardProps {
  readonly diagnosis: Diagnosis;
  readonly benchmark?: {
    readonly avgScore: number;
    readonly count: number;
  };
}

const RISK_LABELS: Record<string, string> = {
  critical: 'Kritik Risk',
  high: 'Yüksek Risk',
  medium: 'Orta Risk',
  low: 'Düşük Risk',
};

const RISK_COLORS: Record<string, string> = {
  critical: 'bg-red-500/10 text-red-400 border-red-500/30',
  high: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  medium: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
};

const SCORE_COLORS = (score: number) => {
  if (score < 4) return 'text-red-400';
  if (score < 6.5) return 'text-orange-400';
  if (score < 8.5) return 'text-amber-400';
  return 'text-[#e81cff]';
};

const SCORE_PROGRESS_COLORS = (score: number) => {
  if (score < 4) return '#ef4444';
  if (score < 6.5) return '#f97316';
  if (score < 8.5) return '#f59e0b';
  return '#e81cff';
};

export function ScoreCard({ diagnosis, benchmark }: ScoreCardProps) {
  const sub = diagnosis.public_submission as any;
  const explainability = sub?.scores?.explainability;
  const treatmentIntelligence = sub?.scores?.treatmentIntelligence;

  const hasScores = diagnosis.overall_health_score !== null;
  const overall = diagnosis.overall_health_score ?? 0;
  
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  
  const [strokeDashoffset, setStrokeDashoffset] = useState(circumference);

  useEffect(() => {
    if (hasScores) {
      const targetOffset = circumference - (overall / 10) * circumference;
      const timer = setTimeout(() => {
        setStrokeDashoffset(targetOffset);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [overall, hasScores, circumference]);

  if (!hasScores) {
    return (
      <div className="bg-[#141221] border border-[#221e33] rounded-md p-6 text-center shadow-sm">
        <h3 className="font-extrabold text-white mb-2">Değerlendirme Skorları</h3>
        <p className="text-xs text-gray-500">Ajans iç analizi tamamlanmadan skor hesaplanamaz.</p>
      </div>
    );
  }

  const metrics = [
    { label: 'Premium Potansiyeli', value: diagnosis.premium_potential_score ?? 0 },
    { label: 'Satış Hazırlığı', value: diagnosis.sales_readiness_score ?? 0 },
    { label: 'Kreatif Potansiyel', value: diagnosis.creative_potential_score ?? 0 },
    { label: 'Teklif Gücü', value: diagnosis.offer_potential_score ?? 0 },
    { label: 'Müşteri Kalitesi', value: diagnosis.lead_quality_score ?? 0 },
  ];

  return (
    <div className="bg-[#141221] border border-[#221e33] rounded-md p-6 shadow-sm space-y-6">
      <div className="text-center">
        <h3 className="font-extrabold text-white text-xs uppercase tracking-wider mb-4">Genel Marka Sağlığı</h3>
        
        {/* Circular Progress Ring */}
        <div className="relative inline-flex items-center justify-center">
          <svg className="w-32 h-32 transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r={radius}
              className="text-[#211e35]"
              strokeWidth="9"
              stroke="currentColor"
              fill="transparent"
            />
            <circle
              cx="64"
              cy="64"
              r={radius}
              strokeWidth="9"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              stroke={SCORE_PROGRESS_COLORS(overall)}
              fill="transparent"
              className="transition-all duration-[1200ms] ease-out score-ring shadow-[0_0_8px_#e81cff]"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className={`text-3xl font-black tabular-nums ${SCORE_COLORS(overall)}`}>
              {overall.toFixed(1)}
            </span>
            <span className="text-[9px] font-bold text-gray-550 uppercase tracking-wider">
              Skor / 10
            </span>
          </div>
        </div>
 
        {/* Risk Badge */}
        {diagnosis.risk_level && (
          <div className="mt-4">
            <span className={`inline-flex items-center px-3 py-1 rounded text-xs font-bold border ${RISK_COLORS[diagnosis.risk_level]}`}>
              {RISK_LABELS[diagnosis.risk_level]}
            </span>
          </div>
        )}

        {/* Sector Benchmark comparison */}
        {benchmark && benchmark.avgScore > 0 && (
          <div className="mt-4 bg-[#1b192c]/40 border border-[#221e33] rounded-md p-3 text-center no-print max-w-[200px] mx-auto">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Sektörel Kıyaslama</p>
            <p className="text-xs font-semibold text-gray-300 mt-1">
              Sektör Ortalaması: <span className="font-extrabold text-white">{benchmark.avgScore.toFixed(1)}</span>
            </p>
            <p className="text-[10px] font-bold mt-1.5 flex items-center justify-center gap-1">
              {overall >= benchmark.avgScore ? (
                <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-sm border border-emerald-500/20 leading-none">
                  ▲ Üzerinde
                </span>
              ) : (
                <span className="text-red-400 bg-red-500/10 px-2 py-0.5 rounded-sm border border-red-500/20 leading-none">
                  ▼ Altında
                </span>
              )}
            </p>
          </div>
        )}
      </div>

      <hr className="border-gray-800/40" />

      {/* Radar Chart */}
      <RadarChart metrics={metrics} />

      <hr className="border-gray-800/40 no-print" />

      {/* Detail Metrics */}
      <div className="space-y-4 no-print text-xs">
        <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Alt Kırılım Analizi</h4>
        <div className="space-y-3">
          {metrics.map(m => (
            <div key={m.label} className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-400">{m.label}</span>
                <span className={`font-extrabold tabular-nums ${SCORE_COLORS(m.value)}`}>
                  {m.value.toFixed(1)} <span className="text-[10px] text-gray-500 font-normal">/10</span>
                </span>
              </div>
              <div className="h-1.5 w-full bg-[#1b192c] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_4px_#e81cff]"
                  style={{
                    width: `${m.value * 10}%`,
                    backgroundColor: SCORE_PROGRESS_COLORS(m.value)
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Explainable Diagnosis Details */}
      {explainability && (
        <div className="space-y-4 pt-4 border-t border-gray-800/40 no-print text-xs text-gray-400">
          <h4 className="text-[10px] font-bold text-gray-550 uppercase tracking-wider">Teşhis ve Bulgular</h4>
          
          {/* Confidence Score */}
          <div className="bg-[#1b192c] border border-[#221e33] rounded-md p-3.5 space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-gray-450 uppercase tracking-wider">Güven Seviyesi</span>
              <span className="text-sm font-black text-[#e81cff] tabular-nums">
                %{explainability.confidenceDetails.score}
              </span>
            </div>
            <div className="h-1.5 w-full bg-[#141221] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#4f20c0] to-[#e81cff] rounded-full"
                style={{ width: `${explainability.confidenceDetails.score}%` }}
              />
            </div>
            <ul className="text-[10px] text-gray-500 space-y-1 pt-1.5 border-t border-gray-800/40">
              {explainability.confidenceDetails.reasons.map((r: string, i: number) => (
                <li key={i} className="flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-[#e81cff]" />
                  {r}
                </li>
              ))}
            </ul>
          </div>

          {/* Active Diagnoses */}
          {explainability.activeDiagnoses && explainability.activeDiagnoses.length > 0 ? (
            <div className="space-y-3">
              <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Aktif Teşhisler</p>
              {explainability.activeDiagnoses.map((diag: any) => (
                <div key={diag.key} className="border border-[#221e33] rounded-md p-3.5 bg-[#1b192c]/40 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-extrabold text-white">{diag.label}</span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {diag.severity && (
                        <span className={`text-[8px] font-bold border px-1.5 py-0.5 rounded ${RISK_COLORS[diag.severity] || RISK_COLORS.low}`}>
                          {RISK_LABELS[diag.severity] || diag.severity.toUpperCase()}
                        </span>
                      )}
                      <span className="text-[9px] font-mono bg-purple-950/20 text-[#e81cff] border border-purple-900/50 px-2 py-0.5 rounded">
                        {diag.key}
                      </span>
                    </div>
                  </div>
                  
                  {diag.findings && diag.findings.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <p className="text-[9px] font-bold text-gray-550 uppercase tracking-wider">Bulgular:</p>
                      <ul className="space-y-1">
                        {diag.findings.map((finding: string, idx: number) => (
                          <li key={idx} className="text-[11px] text-gray-300 leading-relaxed flex items-start gap-1.5">
                            <span className="text-[#e81cff] mt-0.5">•</span>
                            {finding}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-2 text-[10px] text-gray-500 bg-[#1b192c]/20 border border-[#221e33] rounded-md">
              Belirgin bir yapısal problem teşhisi tetiklenmedi.
            </div>
          )}

          {/* Active Signals */}
          {explainability.activeSignals && explainability.activeSignals.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-gray-800/40">
              <p className="text-[9px] font-bold text-gray-550 uppercase tracking-wider">Sinyaller ve Kanıtlar</p>
              <div className="flex flex-wrap gap-1.5">
                {explainability.activeSignals.map((sig: any) => (
                  <span
                    key={sig.key}
                    title={sig.evidence}
                    className="text-[9px] font-mono font-bold bg-[#1b192c] text-gray-400 border border-[#221e33] px-2 py-1 rounded cursor-help hover:text-white transition-colors"
                  >
                    {sig.key}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      {/* Wrong Sequence Warnings */}
      {treatmentIntelligence?.wrongSequenceWarnings && 
       treatmentIntelligence.wrongSequenceWarnings.length > 0 && (
        <div className="space-y-3.5 pt-4 border-t border-gray-800/40 no-print">
          <h4 className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Kritik Sıralama Engelleri</h4>
          <div className="space-y-2">
            {treatmentIntelligence.wrongSequenceWarnings.map((warn: any) => (
              <div key={warn.key} className="border border-red-500/30 bg-red-500/5 rounded-md p-3.5 space-y-1.5 text-xs">
                <div className="flex items-center gap-1.5 text-red-400 font-extrabold text-[11px]">
                  <span className="material-symbols-outlined text-[14px]">warning</span>
                  <span>{warn.title}</span>
                </div>
                <p className="text-gray-300 text-[11px] leading-relaxed">{warn.warningMessage}</p>
                <div className="text-[9px] border-t border-red-500/10 pt-1.5 flex flex-wrap gap-1">
                  <span className="text-red-400/80 font-bold">Engellenen:</span>
                  <span className="text-gray-400 font-mono">{warn.targetAction}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Strategic Roadmap */}
      {treatmentIntelligence?.strategicRoadmap && 
       treatmentIntelligence.strategicRoadmap.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-gray-800/40 no-print text-xs text-gray-400">
          <h4 className="text-[10px] font-bold text-gray-550 uppercase tracking-wider">Aksiyon Yol Haritası</h4>
          <div className="relative border-l border-gray-800 ml-2.5 pl-4 space-y-4">
            {treatmentIntelligence.strategicRoadmap.map((item: any, idx: number) => {
              const metrics = treatmentIntelligence.priorityMetrics[item.diagnosisKey];
              const isTop = idx === 0;
              return (
                <div key={item.diagnosisKey} className="relative">
                  <span className={`absolute -left-[21px] top-0.5 w-4 h-4 rounded-full flex items-center justify-center font-bold text-[9px] ${
                    isTop ? "bg-[#e81cff] text-black" : "bg-[#141221] text-gray-500 border border-gray-800"
                  }`}>
                    {idx + 1}
                  </span>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`font-extrabold text-[11px] ${isTop ? "text-white" : "text-gray-400"}`}>{item.label}</span>
                      {isTop && <span className="text-[8px] bg-purple-950/20 text-[#e81cff] border border-purple-900/50 px-1 rounded">Öncelikli</span>}
                    </div>
                    {metrics && (
                      <div className="text-[9px] text-gray-500 font-bold flex gap-3 font-mono">
                        <span>Etki: {metrics.impactScore}</span>
                        <span>Aciliyet: {metrics.urgencyScore}</span>
                        <span>Kolaylık: {metrics.readinessScore}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
