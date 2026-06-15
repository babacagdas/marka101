// src/features/diagnoses/components/studio/SubmissionReader.tsx
'use client';

import type { Diagnosis } from '../../types';
import type { DiagnosisPublicSubmission } from '../../diagnosis-types';

interface SubmissionReaderProps {
  readonly diagnosis: Diagnosis;
}

function scoreBg(s: number): string {
  if (s <= 34) return "bg-red-500 shadow-[0_0_6px_#ef4444]";
  if (s <= 54) return "bg-orange-500 shadow-[0_0_6px_#f97316]";
  if (s <= 74) return "bg-amber-500 shadow-[0_0_6px_#f59e0b]";
  if (s <= 89) return "bg-gradient-to-r from-[#4f20c0] to-[#b5179e] shadow-[0_0_6px_#b5179e]";
  return "bg-gradient-to-r from-[#4f20c0] to-[#e81cff] shadow-[0_0_8px_#e81cff]";
}

function scoreText(s: number): string {
  if (s <= 34) return "text-red-400 font-bold";
  if (s <= 54) return "text-orange-400 font-bold";
  if (s <= 74) return "text-amber-400 font-bold";
  if (s <= 89) return "text-indigo-400 font-bold";
  return "text-[#e81cff] font-bold";
}

function riskLabel(r: string): string {
  return { critical: "Kritik", high: "Yüksek", medium: "Orta", low: "Düşük", strong: "Güçlü" }[r] ?? r;
}

const SEVERITY_COLORS: Record<string, string> = {
  critical: "bg-red-500/10 text-red-400 border-red-500/30",
  high: "bg-orange-500/10 text-orange-400 border-orange-500/30",
  medium: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  low: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
};

function Row({ label, value }: { label: string; value?: string | boolean | null }) {
  if (value === undefined || value === null || value === '') return null;
  const display = typeof value === 'boolean' ? (value ? 'Evet' : 'Hayır') : value;
  return (
    <div className="py-3.5 grid grid-cols-5 gap-4 border-b border-gray-800/40 last:border-0 items-start">
      <dt className="col-span-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider">{label}</dt>
      <dd className="col-span-3 text-xs font-semibold text-gray-300 leading-relaxed">{display}</dd>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#141221] border border-[#221e33] rounded-md p-6 shadow-sm space-y-4">
      <h3 className="text-[10px] font-extrabold text-[#e81cff] uppercase tracking-widest border-b border-gray-800/40 pb-2">{title}</h3>
      {children}
    </div>
  );
}

const SECTOR_LABELS: Record<string, string> = {
  health: "Sağlık / Güzellik / Klinik",
  realestate: "Gayrimenkul / Mimari / İç Mimari",
  b2b_industrial: "Üretim / Sanayi / İhracat",
  general: "Genel Hizmet",
};
const BIZ_LABELS: Record<string, string> = {
  b2b: "B2B",
  b2c: "B2C",
  hybrid: "Karma (B2B+B2C)",
};
const STAGE_LABELS: Record<string, string> = {
  startup: "Yeni Başlayan (0-2 Yıl)",
  growth: "Büyüme Dönemi (2-5 Yıl)",
  corporate: "Kurumsallaşan",
  premium: "Premium Segmente Geçen",
  repositioning: "Yeniden Konumlanan",
};
const CAT_ORDER = ["brandClarity", "premiumPerception", "storytelling", "digitalTrust", "creativeSystem"] as const;
const CAT_LABELS: Record<string, string> = {
  brandClarity: "Marka Netliği",
  premiumPerception: "Premium Algı",
  storytelling: "Storytelling Gücü",
  digitalTrust: "Dijital Güven",
  creativeSystem: "Kreatif Sistem",
};

export function SubmissionReader({ diagnosis }: SubmissionReaderProps) {
  const sub = diagnosis.public_submission as DiagnosisPublicSubmission | null;
  const ctx = sub?.brandContext;
  const scores = sub?.scores;
  const oe = sub?.openEndedAnswers;

  return (
    <div className="space-y-6">
      {/* Contact info */}
      <Section title="İletişim Bilgileri">
        <dl className="divide-y divide-gray-800/40">
          <Row label="Marka / Şirket" value={diagnosis.brand_name} />
          <Row label="Ad Soyad" value={diagnosis.submitted_contact_name} />
          <Row label="E-posta" value={diagnosis.submitted_email} />
          <Row label="Telefon" value={diagnosis.submitted_phone} />
          <Row label="Başvuru Tarihi" value={
            diagnosis.submitted_at
              ? new Date(diagnosis.submitted_at).toLocaleString('tr-TR') : null
          } />
          <Row label="Kaynak" value={diagnosis.source === 'public_form' ? 'Web Formu' : 'Manuel Kayıt'} />
        </dl>
      </Section>

      {/* Context info */}
      {ctx && (
        <Section title="Marka Bağlamı">
          <dl className="divide-y divide-gray-800/40">
            <Row label="Sektör" value={SECTOR_LABELS[ctx.sector] ?? ctx.sector} />
            <Row label="İş Modeli" value={BIZ_LABELS[ctx.businessModel] ?? ctx.businessModel} />
            <Row label="Marka Aşaması" value={STAGE_LABELS[ctx.brandStage] ?? ctx.brandStage} />
            <Row label="Büyüme Hedefi" value={ctx.growthGoal} />
            <Row label="Ana Problem" value={ctx.mainProblem} />
          </dl>
        </Section>
      )}

      {/* Brand Health Score */}
      {scores && (
        <Section title="Ön Analiz Sağlık Raporu">
          <div className="flex items-center gap-6 bg-[#1b192c] border border-[#221e33] rounded-md p-5 shadow-inner">
            <div className="flex flex-col items-center shrink-0">
              <span className={`text-4xl font-extrabold tabular-nums ${scoreText(scores.brandHealth)}`}>
                {scores.brandHealth}
              </span>
              <span className="text-[9px] font-bold text-gray-550 uppercase tracking-wide">/ 100</span>
            </div>
            <div>
              <p className="text-xs font-extrabold text-white leading-snug">{scores.brandType.label}</p>
              {scores.riskLabels.active && scores.riskLabels.primary && (
                <p className="text-[10px] font-bold text-orange-400 mt-1 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px]">warning</span> {scores.riskLabels.primary}
                </p>
              )}
            </div>
            <div className="ml-auto text-right">
              <p className="text-[9px] font-bold text-gray-550 uppercase">Segment</p>
              <p className="text-xs font-black text-[#e81cff] capitalize mt-0.5">{scores.leadSegment}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 my-4">
            {[{ l: "Sektörel Uyum", v: scores.sectorFit }, { l: "Satışa Hazırlık", v: scores.salesReadiness }].map(({ l, v }) => (
              <div key={l} className="bg-[#1b192c]/50 border border-[#221e33] rounded-md p-4 flex justify-between items-center shadow-sm">
                <span className="text-xs font-bold text-gray-400">{l}</span>
                <span className={`text-base font-extrabold tabular-nums ${scoreText(v)}`}>
                  {v} <span className="text-[10px] font-normal text-gray-500">/100</span>
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-4 pt-4 border-t border-gray-800/40">
            <h4 className="text-[9px] font-bold text-gray-550 uppercase tracking-wider">Alt Kırılımlar</h4>
            <div className="space-y-3">
              {CAT_ORDER.map(key => {
                const cat = scores.categories[key];
                if (!cat) return null;
                return (
                  <div key={key} className="space-y-1 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-400">{CAT_LABELS[key]}</span>
                      <span className="font-extrabold flex items-center gap-2">
                        <span className={scoreText(cat.normalizedScore)}>{cat.normalizedScore}</span>
                        <span className="text-[9px] font-bold text-gray-455 bg-[#1b192c] px-1.5 py-0.5 rounded-sm border border-[#221e33]">
                          {riskLabel(cat.riskLevel)}
                        </span>
                        {scores.weakestCategory.key === key && (
                          <span className="text-[8px] font-extrabold text-orange-400 bg-orange-950/20 border border-orange-900/50 px-1.5 py-0.2 rounded-sm">
                            En Zayıf
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-[#1b192c] rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-500 ${scoreBg(cat.normalizedScore)}`}
                        style={{ width: `${cat.normalizedScore}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Explainable Diagnosis Details */}
          {scores.explainability && (
            <div className="space-y-4 pt-5 border-t border-gray-800/40 text-xs">
              <h4 className="text-[9px] font-bold text-gray-550 uppercase tracking-wider">
                Teşhis Açıklama Katmanı (Explainable Diagnosis)
              </h4>
              
              {/* Confidence Details */}
              <div className="bg-[#1b192c] border border-[#221e33] rounded-md p-4 space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Teşhis Güven Seviyesi</span>
                  <span className="text-sm font-black text-[#e81cff] tabular-nums">
                    %{scores.explainability.confidenceDetails.score}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-[#141221] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#4f20c0] to-[#e81cff] rounded-full"
                    style={{ width: `${scores.explainability.confidenceDetails.score}%` }}
                  />
                </div>
                <ul className="text-[10px] text-gray-400 space-y-1 pt-1.5 border-t border-gray-800/40">
                  {scores.explainability.confidenceDetails.reasons.map((r, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-[#e81cff]" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Active Diagnoses */}
              {scores.explainability.activeDiagnoses && scores.explainability.activeDiagnoses.length > 0 ? (
                <div className="space-y-3">
                  <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Aktif Teşhisler</h5>
                  {scores.explainability.activeDiagnoses.map((diag) => (
                    <div key={diag.key} className="border border-[#221e33] rounded-md p-4 bg-[#1b192c]/40 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-extrabold text-white">{diag.label}</span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {diag.severity && (
                            <span className={`text-[8px] font-bold border px-1.5 py-0.5 rounded ${SEVERITY_COLORS[diag.severity] || "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"}`}>
                              {riskLabel(diag.severity)}
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
                            {diag.findings.map((finding, idx) => (
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
                <div className="text-center py-2 text-[10px] text-gray-500">
                  Belirgin bir yapısal teşhis tetiklenmedi.
                </div>
              )}

              {/* Active Signals Tag list */}
              {scores.explainability.activeSignals && scores.explainability.activeSignals.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-gray-800/40">
                  <h5 className="text-[9px] font-bold text-gray-550 uppercase tracking-wider">Aktif Sinyaller & Kanıtlar</h5>
                  <div className="flex flex-wrap gap-1.5">
                    {scores.explainability.activeSignals.map((sig) => (
                      <span
                        key={sig.key}
                        title={sig.evidence}
                        className="text-[9px] font-mono font-bold bg-[#1b192c] text-gray-300 border border-[#221e33] px-2 py-1 rounded cursor-help hover:text-white transition-colors"
                      >
                        {sig.key}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Section>
      )}

      {/* Dynamic Treatment & Meeting Intelligence Section */}
      {scores?.treatmentIntelligence && (
        <Section title="Görüşme İstihbaratı ve Yol Haritası">
          <div className="space-y-5">
            {/* Wrong Sequence Alerts */}
            {scores.treatmentIntelligence.wrongSequenceWarnings &&
             scores.treatmentIntelligence.wrongSequenceWarnings.length > 0 && (
              <div className="space-y-3.5">
                <h4 className="text-[9px] font-bold text-red-400 uppercase tracking-wider">Kritik Sıralama Engelleri (Sequence Warnings)</h4>
                <div className="space-y-2.5">
                  {scores.treatmentIntelligence.wrongSequenceWarnings.map((warn) => (
                    <div key={warn.key} className="border border-red-500/30 bg-red-500/5 rounded-md p-4 space-y-2">
                      <div className="flex items-center gap-2 text-red-400 font-extrabold text-xs">
                        <span className="material-symbols-outlined text-[16px]">warning</span>
                        <span>{warn.title}</span>
                      </div>
                      <p className="text-xs text-gray-300 leading-relaxed font-semibold">{warn.warningMessage}</p>
                      <div className="text-[9px] text-gray-400 border-t border-red-500/10 pt-2 flex items-center gap-1.5">
                        <span className="font-bold uppercase text-red-500/70">Engellenen Hamle:</span>
                        <span className="bg-[#1b192c] border border-gray-800 px-2 py-0.5 rounded text-gray-300">{warn.targetAction}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Dynamic Consultation Questions */}
            {scores.treatmentIntelligence.meetingQuestions &&
             scores.treatmentIntelligence.meetingQuestions.length > 0 && (
              <div className="space-y-3 pt-3 border-t border-gray-800/40">
                <h4 className="text-[9px] font-bold text-gray-550 uppercase tracking-wider">İlk Görüşme Soruları (Meeting Intelligence)</h4>
                <div className="grid grid-cols-1 gap-3">
                  {scores.treatmentIntelligence.meetingQuestions.map((mq) => (
                    <div key={mq.id} className="border border-[#221e33] bg-[#1b192c]/40 rounded-md p-3.5 space-y-1.5">
                      <div className="flex justify-between items-center text-[9px] font-mono text-[#e81cff] border-b border-gray-800/30 pb-1.5">
                        <span>Soru Kodu: {mq.id}</span>
                        <span className="text-gray-400">Amaç: {mq.objective}</span>
                      </div>
                      <p className="text-xs text-white font-extrabold leading-relaxed">“{mq.questionText}”</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Strategic Roadmap ordering */}
            {scores.treatmentIntelligence.strategicRoadmap &&
             scores.treatmentIntelligence.strategicRoadmap.length > 0 && (
              <div className="space-y-3 pt-3 border-t border-gray-800/40">
                <h4 className="text-[9px] font-bold text-gray-550 uppercase tracking-wider">Aksiyon Öncelik Sıralaması</h4>
                <div className="space-y-2 text-xs">
                  {scores.treatmentIntelligence.strategicRoadmap.map((item, idx) => {
                    const metrics = scores.treatmentIntelligence?.priorityMetrics[item.diagnosisKey];
                    const isTop = idx === 0;
                    return (
                      <div key={item.diagnosisKey} className="flex justify-between items-center p-3 border border-[#221e33] rounded bg-[#1b192c]/50">
                        <div className="flex items-center gap-2.5">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                            isTop ? "bg-[#e81cff] text-black" : "bg-[#141221] text-gray-500 border border-[#221e33]"
                          }`}>
                            {idx + 1}
                          </span>
                          <span className={`font-extrabold ${isTop ? "text-white" : "text-gray-400"}`}>{item.label}</span>
                        </div>
                        {metrics && (
                          <div className="flex gap-3 text-[9px] text-gray-450 font-bold font-mono">
                            <span>Etki: <strong className="text-white font-black">{metrics.impactScore}</strong></span>
                            <span>Aciliyet: <strong className="text-white font-black">{metrics.urgencyScore}</strong></span>
                            <span>Kolaylık: <strong className="text-white font-black">{metrics.readinessScore}</strong></span>
                            <span className="text-[#e81cff]">Öncelik: <strong className="font-black">#{metrics.totalPriority}</strong></span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </Section>
      )}

      {/* Open Ended Answers */}
      {oe && (oe["AUC-01"] || oe["AUC-02"]) && (
        <Section title="Açık Uçlu Cevaplar">
          <div className="space-y-4">
            {oe["AUC-01"] && (
              <div className="space-y-1">
                <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Şu anki en büyük zorluk</p>
                <p className="text-xs font-semibold text-gray-300 leading-relaxed bg-[#1b192c]/40 border border-[#221e33] rounded-md p-3.5 shadow-sm">
                  {oe["AUC-01"]}
                </p>
              </div>
            )}
            {oe["AUC-02"] && (
              <div className="space-y-1">
                <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Bir yıl sonra nasıl algılanmak istiyor?</p>
                <p className="text-xs font-semibold text-gray-300 leading-relaxed bg-[#1b192c]/40 border border-[#221e33] rounded-md p-3.5 shadow-sm">
                  {oe["AUC-02"]}
                </p>
              </div>
            )}
          </div>
        </Section>
      )}

      {/* Manual fallbacks */}
      {!sub && (
        <div className="bg-[#141221] border border-[#221e33] rounded-md p-6 text-center shadow-sm">
          <p className="text-xs font-bold text-gray-500">
            {diagnosis.source === 'manual'
              ? 'Manuel marka kaydı — form detayları bulunmuyor.'
              : 'Form verisi yüklenemedi.'}
          </p>
        </div>
      )}
    </div>
  );
}
