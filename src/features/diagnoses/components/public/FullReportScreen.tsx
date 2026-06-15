// src/features/diagnoses/components/public/FullReportScreen.tsx
"use client";
import type { DiagnosisScores, BrandContext } from "../../diagnosis-types";

function scoreColor(s: number): string {
  if (s <= 34) return "text-error"; if (s <= 54) return "text-orange-500";
  if (s <= 74) return "text-yellow-600"; if (s <= 89) return "text-lime-600";
  return "text-emerald-600";
}
function scoreBg(s: number): string {
  if (s <= 34) return "bg-red-400"; if (s <= 54) return "bg-orange-400";
  if (s <= 74) return "bg-yellow-400"; if (s <= 89) return "bg-lime-400";
  return "bg-emerald-400";
}
function riskLabel(r: string): string {
  return { critical:"Kritik",high:"Yüksek",medium:"Orta",low:"Düşük",strong:"Güçlü" }[r] ?? r;
}
function salesComment(s: number): string {
  if (s <= 40) return "Dijital güven ve satış dönüşümü arasında güçlü kopukluk var.";
  if (s <= 60) return "Satışa destek veren bazı sinyaller var; fakat karar sürecini hızlandıracak güven sistemi eksik.";
  if (s <= 80) return "Satış süreci destekleniyor; iyileştirme daha çok algı ve dönüşüm optimizasyonunda.";
  return "Dijital güven sistemi satış sürecini güçlü biçimde destekliyor.";
}

const SECTOR_COMMENTS: Record<string, string> = {
  health:         "Sağlık markalarında sektörel kritik göstergeler güven sistemi, uzmanlık görünürlüğü ve müşteri kanıtı üzerine yoğunlaşır.",
  realestate:     "Gayrimenkul markalarında portföy kalitesi, proje hikâyesi anlatımı ve görsel üretim standardı kritik göstergelerdir.",
  b2b_industrial: "Üretim markalarında kurumsal iletişim dili, referans görünürlüğü ve teknik yetkinlik kanıtı kritik göstergelerdir.",
  general:        "Hizmet markalarında farklılaşma netliği, dijital sosyal kanıt ve süreç güveni kritik göstergelerdir.",
};

const SEVERITY_COLORS: Record<string, string> = {
  critical: "bg-red-500/10 text-red-550 border border-red-500/20",
  high: "bg-orange-500/10 text-orange-550 border border-orange-500/20",
  medium: "bg-amber-500/10 text-amber-600 border border-amber-500/20",
  low: "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20",
};

const PRIORITY_DESCS: Record<string, string> = {
  brandClarity:      "Konumlandırma ve farklılaşma netliği — diğer tüm alanların temelidir.",
  premiumPerception: "Görsel kimlik ve fiyat-algı uyumu — premium konumlanmanın görünen yüzüdür.",
  storytelling:      "Marka hikâyesi ve ses sistemi — duygusal bağ ve tercih sebebi burada kurulur.",
  digitalTrust:      "Dijital güven ve sosyal kanıt — satış kararlarının en kritik etki noktası.",
  creativeSystem:    "Görsel tutarlılık sistemi — büyüme döneminde kırılganlığı önler.",
};

interface RoadmapItem { week: string; action: string; detail: string }
function buildRoadmap(weakKey: string): RoadmapItem[] {
  const m: Record<string, RoadmapItem[]> = {
    brandClarity: [
      { week:"Hafta 1", action:"Netleştir", detail:"Konumlandırma tanımını, hedef kitleyi ve farklılaşma argümanını yazıya dökün." },
      { week:"Hafta 2", action:"Güçlendir", detail:"Ekip genelinde aynı mesajı tutarlı biçimde kullanmaya başlayın." },
      { week:"Hafta 3–4", action:"Görünür Kıl", detail:"Web ve sosyal medyada konumlandırma dilini güncellemeye başlayın." },
    ],
    premiumPerception: [
      { week:"Hafta 1", action:"Netleştir", detail:"Görsel kimliğin hangi noktalarının fiyatla çeliştiğini tespit edin." },
      { week:"Hafta 2", action:"Güçlendir", detail:"En kritik temas noktasını — web veya sosyal profil — öncelikle iyileştirin." },
      { week:"Hafta 3–4", action:"Görünür Kıl", detail:"Yeni görsel dili tüm kanallara tutarlı biçimde yayın." },
    ],
    storytelling: [
      { week:"Hafta 1", action:"Netleştir", detail:"Marka neden var, kime hitap ediyor, ne için mücadele ediyor — 3 soruyu yanıtlayın." },
      { week:"Hafta 2", action:"Güçlendir", detail:'Bu yanıtları kısa, okunabilir bir "hakkımızda" metnine dönüştürün.' },
      { week:"Hafta 3–4", action:"Görünür Kıl", detail:"Metni web ve sosyal profillere yayın; içerik tonunu buna göre ayarlayın." },
    ],
    digitalTrust: [
      { week:"Hafta 1", action:"Netleştir", detail:"Web sitenizde güven sinyali olmayan 3 kritik noktayı listeleyin." },
      { week:"Hafta 2", action:"Güçlendir", detail:"Mevcut en güçlü 2–3 müşteri referansını görünür hale getirin." },
      { week:"Hafta 3–4", action:"Görünür Kıl", detail:"Sosyal kanıt sistemi kurun; yorum toplama ve yayınlama sürecini tanımlayın." },
    ],
    creativeSystem: [
      { week:"Hafta 1", action:"Netleştir", detail:"Mevcut görsel tutarsızlık noktalarını fotoğraflayın ve listeleyin." },
      { week:"Hafta 2", action:"Güçlendir", detail:"Temel renk, tipografi ve ses kılavuzunu 1 sayfalık belgeye indirin." },
      { week:"Hafta 3–4", action:"Görünür Kıl", detail:"Kılavuzu ekiple paylaşın ve tüm yeni içeriklerde uygulayın." },
    ],
  };
  return m[weakKey] ?? m["brandClarity"];
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-surface-container-lowest rounded-lg premium-shadow border border-surface-container p-6 space-y-4">
      <h3 className="text-label-lg text-primary uppercase tracking-widest">{title}</h3>
      {children}
    </div>
  );
}

interface FullReportScreenProps {
  scores: DiagnosisScores;
  context: BrandContext;
  leadId: string | null;
  onBack: () => void;
}

const CAT_ORDER = ["brandClarity","premiumPerception","storytelling","digitalTrust","creativeSystem"] as const;

export function FullReportScreen({ scores, context, onBack }: FullReportScreenProps) {
  const { brandHealth:bhs, sectorFit, salesReadiness, brandType, categories,
          riskLabels, imbalanceAlert, weakestCategory } = scores;
  const sectorComment = SECTOR_COMMENTS[context.sector] ?? SECTOR_COMMENTS["general"];
  const roadmap = buildRoadmap(weakestCategory.key);

  const sorted = [...CAT_ORDER].map(k => categories[k]).sort((a,b) => a.normalizedScore - b.normalizedScore);
  const priority2Key = sorted[1]?.key ?? "digitalTrust";
  const priority3 = context.growthGoal.includes("lead") ? "Daha Fazla Lead / Müşteri"
    : context.mainProblem.includes("price") ? "Fiyat Savunulabilirliği"
    : "Satış Döngüsü Hızlandırma";

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-5">

      {/* A) MARKA SKORU */}
      <Card title="Marka Sağlığı Skoru">
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center">
            <span className={`text-4xl font-bold tabular-nums ${scoreColor(bhs)}`}>{bhs}</span>
            <span className="text-label-md text-secondary">/ 100</span>
          </div>
          <div>
            <p className="text-headline-md font-bold text-on-background">{brandType.label}</p>
            {riskLabels.active && riskLabels.primary && (
              <p className="text-label-md text-orange-500 mt-0.5">⚠ {riskLabels.primary}</p>
            )}
            {imbalanceAlert.active && (
              <p className="text-label-md text-yellow-600 mt-0.5">◐ Dengesiz Marka Sistemi</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[{ label:"Sektörel Uyum", value:sectorFit }, { label:"Satış Hazırlığı", value:salesReadiness }].map(({ label, value }) => (
            <div key={label} className="bg-surface-container-low rounded-xl p-3">
              <p className="text-label-md text-secondary mb-1">{label}</p>
              <p className={`text-2xl font-bold tabular-nums ${scoreColor(value)}`}>{value}</p>
            </div>
          ))}
        </div>

        <div className="space-y-2 pt-1">
          {CAT_ORDER.map(key => {
            const cat = categories[key];
            return (
              <div key={key} className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-label-md text-secondary">{cat.label}</span>
                  <span className={`text-label-md font-semibold tabular-nums ${scoreColor(cat.normalizedScore)}`}>
                    {cat.normalizedScore}
                    <span className="text-outline font-normal ml-1">{riskLabel(cat.riskLevel)}</span>
                  </span>
                </div>
                <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${scoreBg(cat.normalizedScore)}`}
                    style={{ width:`${cat.normalizedScore}%`, opacity:0.7 }} />
                </div>
              </div>
            );
          })}
        </div>
      </Card>
 
      {/* B) TEŞHİS VE BULGULAR */}
      {scores.explainability && (
        <Card title="Teşhis ve Bulgular">
          <div className="space-y-5">
            {/* Confidence Level */}
            <div className="bg-surface-container-low rounded-xl p-4 space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-label-md text-secondary font-bold">Güven Seviyesi</span>
                <span className="text-headline-sm font-black text-primary tabular-nums">
                  %{scores.explainability.confidenceDetails.score}
                </span>
              </div>
              <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${scores.explainability.confidenceDetails.score}%`, opacity: 0.8 }}
                />
              </div>
              <ul className="text-[11px] text-secondary space-y-1 pt-1.5 border-t border-surface-container/30">
                {scores.explainability.confidenceDetails.reasons.map((r, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-primary" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>

            {/* Active Diagnoses & Findings */}
            {scores.explainability.activeDiagnoses && scores.explainability.activeDiagnoses.length > 0 ? (
              <div className="space-y-4">
                <p className="text-label-md text-secondary uppercase tracking-widest font-bold">Aktif Teşhisler</p>
                <div className="space-y-3">
                  {scores.explainability.activeDiagnoses.map((diag) => (
                    <div key={diag.key} className="border border-surface-container rounded-xl p-4 bg-surface-container-low/40 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-body-md font-extrabold text-on-background">{diag.label}</span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {diag.severity && (
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${SEVERITY_COLORS[diag.severity] || "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"}`}>
                              {riskLabel(diag.severity)}
                            </span>
                          )}
                          <span className="text-[9px] font-mono bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/20">
                            {diag.key}
                          </span>
                        </div>
                      </div>
                      
                      {diag.findings && diag.findings.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          <p className="text-[10px] font-bold text-secondary uppercase tracking-wide">Bu Sonucu Oluşturan Bulgular:</p>
                          <ul className="space-y-1">
                            {diag.findings.map((finding, idx) => (
                              <li key={idx} className="text-xs text-on-surface-variant leading-relaxed flex items-start gap-1.5">
                                <span className="text-primary mt-0.5">•</span>
                                {finding}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-xs text-secondary">
                Belirgin bir yapısal problem teşhisi tetiklenmedi. Markanız dengeli ve gelişim potansiyeli yüksek.
              </div>
            )}

            {/* Active Signals */}
            {scores.explainability.activeSignals && scores.explainability.activeSignals.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-surface-container/30">
                <p className="text-[10px] font-bold text-secondary uppercase tracking-wide">Aktif Sinyaller</p>
                <div className="flex flex-wrap gap-1.5">
                  {scores.explainability.activeSignals.map((sig) => (
                    <span
                      key={sig.key}
                      title={sig.evidence}
                      className="text-[9px] font-mono font-bold bg-surface-container-highest text-secondary border border-surface-container px-2 py-1 rounded cursor-help transition-colors hover:bg-surface-container"
                    >
                      {sig.key}
                    </span>
                  ))}
                </div>
                <p className="text-[9px] text-secondary opacity-65 italic mt-1">Sinyallerin üzerine gelerek detaylı kanıtları görebilirsiniz.</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* WRONG SEQUENCE WARNINGS */}
      {scores.treatmentIntelligence?.wrongSequenceWarnings && 
       scores.treatmentIntelligence.wrongSequenceWarnings.length > 0 && (
        <div className="space-y-3">
          {scores.treatmentIntelligence.wrongSequenceWarnings.map((warn) => (
            <div 
              key={warn.key} 
              className="border-2 border-red-500/20 bg-red-500/5 rounded-2xl p-5 space-y-2 premium-shadow"
            >
              <div className="flex items-center gap-2 text-red-600 font-bold text-body-md">
                <span className="material-symbols-outlined text-[20px]">warning</span>
                <span>{warn.title}</span>
              </div>
              <p className="text-xs text-secondary leading-relaxed font-semibold">
                {warn.warningMessage}
              </p>
              <div className="flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-red-500/10">
                <span className="text-[10px] text-red-600 font-black uppercase">Hedeflenen Hamle:</span>
                <span className="text-[10px] font-bold text-secondary bg-surface-container px-2 py-0.5 rounded">
                  {warn.targetAction}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* STRATEGIC ROADMAP & PRESCRIPTIONS */}
      {scores.treatmentIntelligence?.strategicRoadmap && 
       scores.treatmentIntelligence.strategicRoadmap.length > 0 && (
        <Card title="Stratejik Yol Haritası">
          <div className="space-y-6">
            <p className="text-xs text-secondary leading-relaxed font-semibold">
              Sistemimiz markanızın verilerini, hedeflerini ve ticari engellerini analiz ederek en yüksek etki ve aciliyet derecesine göre öncelik sıranızı oluşturdu:
            </p>
            
            {/* Steps Timeline */}
            <div className="relative border-l border-surface-container-highest ml-3.5 pl-6 space-y-5">
              {scores.treatmentIntelligence.strategicRoadmap.map((item, idx) => {
                const metrics = scores.treatmentIntelligence?.priorityMetrics[item.diagnosisKey];
                const isTop = idx === 0;
                return (
                  <div key={item.diagnosisKey} className="relative">
                    {/* Circle Node */}
                    <span 
                      className={`absolute -left-[31px] top-0.5 w-5 h-5 rounded-full flex items-center justify-center border-2 ${
                        isTop 
                          ? "bg-primary border-primary text-white text-[9px] font-bold shadow-primary-glow" 
                          : "bg-surface-container-low border-surface-container-highest text-secondary text-[9px]"
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className={`text-xs font-bold ${isTop ? "text-primary text-body-sm" : "text-on-background"}`}>
                          {item.label}
                        </h4>
                        {isTop && (
                          <span className="text-[8px] font-black uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded">
                            Birincil Odak
                          </span>
                        )}
                      </div>
                      {metrics && (
                        <div className="flex gap-4 text-[9px] text-secondary font-bold">
                          <span>Etki: <strong className="text-on-background font-black">{metrics.impactScore}</strong></span>
                          <span>Aciliyet: <strong className="text-on-background font-black">{metrics.urgencyScore}</strong></span>
                          <span>Kolaylık: <strong className="text-on-background font-black">{metrics.readinessScore}</strong></span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Prescriptions for Top Priority Diagnosis */}
            {scores.treatmentIntelligence.treatmentPlans && 
             scores.treatmentIntelligence.treatmentPlans.length > 0 && (
              <div className="pt-5 border-t border-surface-container/30 space-y-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-secondary uppercase tracking-wider mb-2">
                    Öncelikli Müdahale Planı
                  </p>
                  {(() => {
                    const topPlan = scores.treatmentIntelligence?.treatmentPlans.find(
                      p => p.diagnosisKey === scores.treatmentIntelligence?.priorityDiagnosisKey
                    );
                    if (!topPlan) return null;
                    return (
                      <div className="space-y-3.5">
                        <h4 className="text-xs font-extrabold text-on-background">{topPlan.title}</h4>
                        <div className="grid grid-cols-1 gap-3">
                          {topPlan.steps.map((step) => (
                            <div key={step.stepNumber} className="bg-surface-container-low rounded-xl p-3.5 border border-surface-container/30 space-y-1">
                              <span className="text-[9px] font-black uppercase tracking-wider text-primary">Adım {step.stepNumber}</span>
                              <h5 className="text-xs font-bold text-on-background">{step.title}</h5>
                              <p className="text-[11px] text-secondary leading-relaxed font-semibold">{step.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* B) SEKTÖREL BAĞLAM */}
      <Card title="Sektörel Bağlam">
        <p className="text-body-md text-on-surface-variant leading-relaxed">{sectorComment}</p>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
          <span className="text-label-md text-secondary">
            Sektör skoru: <span className={`font-semibold ${scoreColor(sectorFit)}`}>{sectorFit} / 100</span>
          </span>
        </div>
      </Card>

      {/* C) İLK 3 ÖNCELİK */}
      {!scores.treatmentIntelligence && (
        <Card title="İlk 3 Öncelik">
          {[
            { n:1, label:weakestCategory.label, detail:PRIORITY_DESCS[weakestCategory.key] ?? "" },
            { n:2, label:categories[priority2Key]?.label ?? "Dijital Güven", detail:PRIORITY_DESCS[priority2Key] ?? "" },
            { n:3, label:priority3, detail:"Büyüme hedefiyle uyumlu — ilk temas noktasında hızlı değer." },
          ].map(({ n, label, detail }) => (
            <div key={n} className="flex gap-3">
              <span className="shrink-0 w-6 h-6 rounded-full bg-surface-container text-on-surface-variant text-label-md font-semibold flex items-center justify-center mt-0.5">{n}</span>
              <div className="space-y-0.5">
                <p className="text-body-md font-semibold text-on-background">{label}</p>
                <p className="text-label-md text-secondary leading-relaxed">{detail}</p>
              </div>
            </div>
          ))}
        </Card>
      )}

      {/* D) SATIŞA ETKİSİ */}
      <Card title="Satışa Etkisi">
        <p className="text-body-md text-on-surface-variant leading-relaxed">{salesComment(salesReadiness)}</p>
        {context.mainProblem && (
          <p className="text-label-md text-secondary leading-relaxed border-t border-surface-container pt-3">
            Belirtilen temel sorun bu tabloyla doğrudan bağlantılı.
          </p>
        )}
      </Card>

      {/* E) 30 GÜNLÜK YOL HARİTASI */}
      {!scores.treatmentIntelligence && (
        <Card title="30 Günlük İlk Yol Haritası">
          <div className="space-y-3">
            {roadmap.map(item => (
              <div key={item.week} className="flex gap-3">
                <div className="shrink-0 space-y-0.5 w-16">
                  <p className="text-label-md text-secondary">{item.week}</p>
                  <p className="text-label-md font-semibold text-primary">{item.action}</p>
                </div>
                <p className="text-label-md text-on-surface-variant leading-relaxed">{item.detail}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* F) GÖRÜŞME BAŞLIKLARI */}
      <Card title="Görüşmede Ele Alınacak Başlıklar">
        <p className="text-label-md text-secondary mb-3">Bu görüşme teklif için değil — aşağıdaki soruları birlikte değerlendirmek için.</p>
        <ul className="space-y-3">
          {scores.treatmentIntelligence?.meetingQuestions && 
           scores.treatmentIntelligence.meetingQuestions.length > 0 ? (
            scores.treatmentIntelligence.meetingQuestions.slice(0, 4).map((mq) => (
              <li key={mq.id} className="flex items-start gap-2 text-body-md text-on-surface-variant">
                <span className="text-primary mt-1 shrink-0">✦</span>
                <div className="space-y-0.5">
                  <p className="font-bold text-on-background text-xs">{mq.questionText}</p>
                  <p className="text-[10px] text-secondary">Amaç: {mq.objective}</p>
                </div>
              </li>
            ))
          ) : (
            ["Markanızın şu anki algısı ile hedeflediği algı arasındaki fark",
             "Satış sürecinde güveni zayıflatan temas noktaları",
             "İlk 30 günde en hızlı değer yaratacak müdahale"].map((t, i) => (
              <li key={i} className="flex items-start gap-2 text-body-md text-on-surface-variant">
                <span className="text-primary mt-0.5 shrink-0">✦</span>{t}
              </li>
            ))
          )}
        </ul>
      </Card>

      {/* G) CTA */}
      <div className="space-y-3 pt-1">
        <p className="text-label-md text-secondary text-center">
          1–2 iş günü içinde Deep Creative ekibi sizinle iletişime geçecektir.
        </p>
        <a href="#"
          className="flex items-center justify-center w-full py-4 rounded-full bg-primary text-on-primary text-label-lg hover:opacity-90 transition-all shadow-primary-glow gap-2">
          <span className="material-symbols-outlined text-[18px]">calendar_today</span>
          Görüşme Planla
        </a>
        <a href="#"
          className="flex items-center justify-center w-full py-3.5 rounded-full border border-surface-container-highest text-label-lg text-secondary hover:border-primary/30 transition-colors gap-2">
          <span className="material-symbols-outlined text-[18px]">chat</span>
          WhatsApp&apos;tan Hızlı İletişim
        </a>
        <button type="button" onClick={onBack}
          className="text-label-md text-secondary hover:text-on-surface transition-colors self-center block w-full text-center py-2">
          ← Geri
        </button>
      </div>
    </div>
  );
}
