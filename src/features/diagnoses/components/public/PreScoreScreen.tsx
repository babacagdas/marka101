// src/features/diagnoses/components/public/PreScoreScreen.tsx
"use client";
import type { DiagnosisScores } from "../../diagnosis-types";

function scoreColor(s: number): string {
  if (s <= 34) return "text-error";
  if (s <= 54) return "text-orange-500";
  if (s <= 74) return "text-yellow-500";
  if (s <= 89) return "text-lime-600";
  return "text-emerald-600";
}
function scoreBg(s: number): string {
  if (s <= 34) return "bg-red-400";
  if (s <= 54) return "bg-orange-400";
  if (s <= 74) return "bg-yellow-400";
  if (s <= 89) return "bg-lime-400";
  return "bg-emerald-400";
}
function riskLabel(r: string): string {
  return { critical:"Kritik", high:"Yüksek", medium:"Orta", low:"Düşük", strong:"Güçlü" }[r] ?? r;
}

interface PreScoreScreenProps {
  scores: DiagnosisScores;
  onContinue: () => void;
  onBack: () => void;
}

const CAT_ORDER = ["brandClarity","premiumPerception","storytelling","digitalTrust","creativeSystem"] as const;

export function PreScoreScreen({ scores, onContinue, onBack }: PreScoreScreenProps) {
  const bhs = scores.brandHealth;
  const circ = 282.7;
  const offset = circ - (bhs / 100) * circ;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="bg-surface-container-lowest rounded-lg premium-shadow border border-surface-container p-8 md:p-12 flex flex-col gap-8">

        {/* Başlık */}
        <div className="text-center">
          <span className="text-label-lg text-primary uppercase tracking-widest block mb-2">Deep Brand Diagnosis</span>
          <h1 className="text-headline-lg font-bold text-on-background">Ön Skor</h1>
        </div>

        {/* SVG ring + skor */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-44 h-44">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="transparent" stroke="#ebeef3" strokeWidth="6"/>
              <circle className="score-ring" cx="50" cy="50" r="45" fill="transparent"
                stroke="#6741d9" strokeWidth="6" strokeLinecap="round"
                strokeDasharray={circ} strokeDashoffset={offset}/>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-4xl font-bold tabular-nums ${scoreColor(bhs)}`}>{bhs}</span>
              <span className="text-label-md text-secondary">/ 100</span>
            </div>
          </div>
          <p className="text-headline-md font-bold text-on-background text-center">{scores.brandType.label}</p>

          {/* Uyarı rozetleri */}
          <div className="flex flex-col items-center gap-2">
            {scores.riskLabels.active && scores.riskLabels.primary && (
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-label-md text-orange-700">
                <span>⚠</span>{scores.riskLabels.primary}
              </span>
            )}
            {scores.imbalanceAlert.active && (
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-50 border border-yellow-200 text-label-md text-yellow-700">
                <span>◐</span>Dengesiz Marka Sistemi ({scores.imbalanceAlert.maxGap} puan fark)
              </span>
            )}
          </div>
        </div>

        {/* Güçlü / Zayıf */}
        <div className="bg-surface-container-low rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-label-md text-secondary">✦ En Güçlü Alan</span>
            <span className="text-label-md font-semibold text-emerald-600">{scores.strongestCategory.label}</span>
          </div>
          <div className="h-px bg-surface-container" />
          <div className="flex items-center justify-between gap-3">
            <span className="text-label-md text-secondary">✦ Öncelikli Alan</span>
            <span className="text-label-md font-semibold text-orange-500">{scores.weakestCategory.label}</span>
          </div>
        </div>

        {/* Kategori bar'ları */}
        <div className="space-y-3">
          {CAT_ORDER.map(key => {
            const cat = scores.categories[key];
            return (
              <div key={key} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-label-md text-secondary">{cat.label}</span>
                  <span className={`text-label-md font-semibold tabular-nums ${scoreColor(cat.normalizedScore)}`}>
                    {cat.normalizedScore}
                    <span className="text-outline font-normal ml-1">{riskLabel(cat.riskLevel)}</span>
                  </span>
                </div>
                <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${scoreBg(cat.normalizedScore)}`}
                    style={{ width: `${cat.normalizedScore}%`, opacity: 0.7 }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Şeffaflık notu */}
        <p className="text-label-md text-outline text-center leading-relaxed">
          Bu otomatik bir ön skordur. Kategori detayları ve önerilen adımlar bir sonraki ekranda sunulmaktadır.
        </p>

        {/* CTA */}
        <div className="flex flex-col gap-3">
          <button type="button" onClick={onContinue}
            className="w-full py-4 rounded-full bg-primary text-on-primary text-label-lg hover:opacity-90 transition-all shadow-primary-glow flex items-center justify-center gap-2">
            Detaylı Ön Analizi Gör
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
          <button type="button" onClick={onBack}
            className="w-full py-3 rounded-full border border-surface-container-highest text-label-lg text-secondary hover:border-primary/30 transition-colors">
            ← Geri
          </button>
        </div>
      </div>
    </div>
  );
}
