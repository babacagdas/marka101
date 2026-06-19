// src/features/diagnoses/scoring/engine.ts
// Deep Brand Diagnosis V2 Lite — skor hesaplama motoru.
// Pure TypeScript, sıfır side-effect, UI bağımlılığı yok.

import {
  CATEGORIES,
  CATEGORY_ORDER,
  CATEGORY_WEIGHTS,
  CORE_QUESTIONS,
  SECTOR_MODULES,
  CORE_TRIGGERS,
  SECTOR_TRIGGERS,
  CORE_TRIGGER_THRESHOLDS,
  SECTOR_TRIGGER_CONDITIONS,
  OPEN_ENDED_QUESTIONS,
  CONTEXT_QUESTIONS,
} from "../data";

import type {
  CategoryKey,
  SectorKey,
  BusinessModel,
  BrandStage,
  BrandContext,
  DiagnosisQuestion,
  DiagnosisAnswerValue,
  DiagnosisAnswers,
  DiagnosisOpenEnded,
  EvidenceAnswer,
  ScaleAnswer,
  RiskLevel,
  BrandType,
  BrandTypeKey,
  CategoryScore,
  RiskLabel,
  ImbalanceAlert,
  ConflictSignal,
  DiagnosisScores,
  LeadSegment,
  Confidence,
  TestFlow,
  DiagnosisInput,
  ActiveSignal,
  ActiveDiagnosis,
  ConfidenceExplanation,
  ExplainableDiagnosisLayer,
  TreatmentStep,
  TreatmentPlan,
  PriorityMetrics,
  WrongSequenceWarning,
  MeetingQuestion,
  TreatmentIntelligence,
} from "../diagnosis-types";

// ── Yardımcılar ─────────────────────────────────────────────────────

function clamp(value: number): number {
  return Math.min(100, Math.max(0, Math.round(value)));
}

function isEvidenceAnswer(v: DiagnosisAnswerValue): v is EvidenceAnswer {
  return v === "evet" || v === "kısmen" || v === "hayır";
}

function isScaleAnswer(v: DiagnosisAnswerValue): v is ScaleAnswer {
  return typeof v === "number" && v >= 1 && v <= 5;
}

// ── 1. Skor dönüşüm ─────────────────────────────────────────────────

export function evidenceToScore(
  value: EvidenceAnswer,
  reverseScored = false,
): number {
  if (!reverseScored) {
    if (value === "evet")   return 5;
    if (value === "kısmen") return 3;
    return 1; // "hayır"
  } else {
    if (value === "evet")   return 1;
    if (value === "kısmen") return 3;
    return 5; // "hayır"
  }
}

export function answerToScore(
  question: DiagnosisQuestion,
  answer: DiagnosisAnswerValue,
): number {
  switch (question.type) {
    case "scale": {
      if (isScaleAnswer(answer)) {
        return question.reverseScored ? (6 - answer) as ScaleAnswer : answer;
      }
      const n = Number(answer);
      if (!isNaN(n) && n >= 1 && n <= 5) {
        return question.reverseScored ? (6 - n) as ScaleAnswer : n as ScaleAnswer;
      }
      return 0;
    }
    case "evidence": {
      if (!isEvidenceAnswer(answer)) return 0;
      return evidenceToScore(answer, question.reverseScored ?? false);
    }
    case "singleSelect": {
      if (question.options) {
        const opt = question.options.find(o => o.value === answer);
        if (opt?.score !== undefined) return opt.score;
      }
      return 0;
    }
    default:
      return 0;
  }
}

export function getQuestionNormalizedScore(
  questionId: string,
  answers: DiagnosisAnswers,
  questions: readonly DiagnosisQuestion[],
): number {
  const question = questions.find(q => q.id === questionId);
  const answer   = answers[questionId];
  if (!question || answer === undefined) return 0;
  return clamp(answerToScore(question, answer) * 20);
}

// ── 2. Kategori skor ─────────────────────────────────────────────────

export function calculateCategoryScores(
  answers: DiagnosisAnswers,
): Record<CategoryKey, CategoryScore> {
  const result = {} as Record<CategoryKey, CategoryScore>;

  for (const catKey of CATEGORY_ORDER) {
    const catQuestions = CORE_QUESTIONS.filter(q => q.category === catKey);
    const meta         = CATEGORIES[catKey];
    let rawScore = 0, maxScore = 0, answered = 0;

    for (const q of catQuestions) {
      const answer = answers[q.id];
      if (answer !== undefined) {
        rawScore += answerToScore(q, answer) * q.weight;
        maxScore += 5 * q.weight;
        answered++;
      }
    }

    const normalizedScore = maxScore > 0 ? clamp((rawScore / maxScore) * 100) : 0;
    result[catKey] = {
      key: catKey, label: meta.label, rawScore, maxScore, normalizedScore,
      riskLevel:         determineRiskLevel(normalizedScore),
      answeredQuestions: answered,
      totalQuestions:    catQuestions.length,
    };
  }
  return result;
}

// ── 3. Brand Health Score ────────────────────────────────────────────

export function calculateBrandHealthScore(
  categoryScores: Record<CategoryKey, CategoryScore>,
): number {
  const weighted = CATEGORY_ORDER.reduce((sum, key) => {
    return sum + categoryScores[key].normalizedScore * CATEGORY_WEIGHTS[key];
  }, 0);
  return clamp(weighted);
}

// ── 4. Risk seviyesi ve marka tipi ──────────────────────────────────

export function determineRiskLevel(score: number): RiskLevel {
  if (score <= 35) return "critical";
  if (score <= 50) return "high";
  if (score <= 70) return "medium";
  if (score <= 85) return "low";
  return "strong";
}

const BRAND_TYPE_MAP: ReadonlyArray<{ max: number; key: BrandTypeKey; label: string }> = [
  { max: 34,  key: "UNPOSITIONED", label: "Konumlandırması Belirsiz Marka" },
  { max: 54,  key: "INVISIBLE",    label: "Görünürlüğü Zayıf Marka"       },
  { max: 74,  key: "INCONSISTENT", label: "Tutarlılık İhtiyacı Olan Marka" },
  { max: 89,  key: "PRIMED",       label: "Gelişime Hazır Marka"          },
  { max: 100, key: "POSITIONED",   label: "Konumlanmış Marka"             },
];

export function determineBrandType(bhs: number): BrandType {
  const found = BRAND_TYPE_MAP.find(t => bhs <= t.max);
  return found ?? { key: "POSITIONED", label: "Konumlanmış Marka" };
}

// ── 5. Risk etiketleri ───────────────────────────────────────────────

export function detectRiskLabels(
  categoryScores: Record<CategoryKey, CategoryScore>,
): RiskLabel {
  const CRITICAL_THRESHOLD = 40;
  const critical = CATEGORY_ORDER
    .map(k => categoryScores[k])
    .filter(c => c.normalizedScore <= CRITICAL_THRESHOLD)
    .sort((a, b) => a.normalizedScore - b.normalizedScore);

  if (critical.length === 0) {
    return { active: false, primary: null, secondary: [], criticalCategories: [] };
  }
  return {
    active:             true,
    primary:            `${critical[0].label} Kritik Uyarılı`,
    secondary:          critical.slice(1).map(c => `${c.label} Kritik Uyarılı`),
    criticalCategories: critical.map(c => c.key),
  };
}

export function detectImbalance(
  categoryScores: Record<CategoryKey, CategoryScore>,
): ImbalanceAlert {
  const scores  = CATEGORY_ORDER.map(k => categoryScores[k]);
  const highest = scores.reduce((a, b) => a.normalizedScore > b.normalizedScore ? a : b);
  const lowest  = scores.reduce((a, b) => a.normalizedScore < b.normalizedScore ? a : b);
  const maxGap  = highest.normalizedScore - lowest.normalizedScore;
  return { active: maxGap >= 30, maxGap, highCategory: highest.key, lowCategory: lowest.key };
}

// ── 6. En güçlü / en zayıf ──────────────────────────────────────────

export function getStrongestCategory(
  categoryScores: Record<CategoryKey, CategoryScore>,
): CategoryScore {
  return CATEGORY_ORDER
    .map(k => categoryScores[k])
    .reduce((a, b) => a.normalizedScore > b.normalizedScore ? a : b);
}

export function getWeakestCategory(
  categoryScores: Record<CategoryKey, CategoryScore>,
  bhs: number,
): CategoryScore {
  const sorted = CATEGORY_ORDER
    .map(k => categoryScores[k])
    .sort((a, b) => {
      if (a.normalizedScore !== b.normalizedScore) return a.normalizedScore - b.normalizedScore;
      return CATEGORY_ORDER.indexOf(a.key) - CATEGORY_ORDER.indexOf(b.key);
    });
  const weakest = sorted[0];

  if (bhs < 55 && weakest.key === "creativeSystem") {
    const foundations: CategoryKey[] = ["brandClarity", "premiumPerception"];
    const weakFoundation = foundations
      .map(k => categoryScores[k])
      .filter(c => c.normalizedScore < 55)
      .sort((a, b) => a.normalizedScore - b.normalizedScore)[0];
    if (weakFoundation) return weakFoundation;
  }
  if (weakest.key === "storytelling" && categoryScores["brandClarity"].normalizedScore <= 40) {
    return categoryScores["brandClarity"];
  }
  return weakest;
}

// ── 7. Sektör Fit Skoru ──────────────────────────────────────────────

export function calculateSectorFit(
  answers: DiagnosisAnswers,
  sector: SectorKey,
  businessModel: BusinessModel,
): number {
  const module = SECTOR_MODULES[sector];
  if (!module) return 0;
  const B2B_BOOST = new Set(["SM-B01","SM-B02","SM-H01","SM-H02","SM-R02","SM-G02"]);
  const b2bMult   = (businessModel === "b2b" || businessModel === "hybrid_b2b") ? 1.15 : 1.0;
  let rawScore = 0, maxScore = 0;
  for (const q of module.questions) {
    const answer = answers[q.id];
    if (answer === undefined) continue;
    const mult = B2B_BOOST.has(q.id) && (businessModel !== "b2c" && businessModel !== "hybrid_b2c") ? b2bMult : 1.0;
    rawScore += answerToScore(q, answer) * q.weight * mult;
    maxScore += 5 * q.weight * mult;
  }
  return maxScore > 0 ? clamp((rawScore / maxScore) * 100) : 0;
}

// ── 8. Satış Hazırlığı ───────────────────────────────────────────────

export function calculateSalesReadiness(
  answers: DiagnosisAnswers,
  categoryScores: Record<CategoryKey, CategoryScore>,
): number {
  const allQ      = [...CORE_QUESTIONS];
  const dgNorm    = categoryScores["digitalTrust"].normalizedScore;
  const paC03Norm = getQuestionNormalizedScore("PA-C03", answers, allQ);
  const mnC02Norm = getQuestionNormalizedScore("MN-C02", answers, allQ);
  const dgC02Norm = getQuestionNormalizedScore("DG-C02", answers, allQ);
  return clamp(dgNorm * 0.35 + paC03Norm * 0.25 + mnC02Norm * 0.25 + dgC02Norm * 0.15);
}

// ── 9. Premium Potansiyel ────────────────────────────────────────────

export function calculatePremiumPotential(
  categoryScores: Record<CategoryKey, CategoryScore>,
  bhs: number,
): number {
  return clamp(
    categoryScores["premiumPerception"].normalizedScore * 0.35 +
    categoryScores["brandClarity"].normalizedScore     * 0.25 +
    categoryScores["storytelling"].normalizedScore      * 0.20 +
    bhs * 0.20,
  );
}

export function calculatePremiumPotentialFromAnswers(
  answers: DiagnosisAnswers,
  categoryScores: Record<CategoryKey, CategoryScore>,
  bhs: number,
): number {
  const allQ = [...CORE_QUESTIONS];
  return clamp(
    categoryScores["premiumPerception"].normalizedScore          * 0.35 +
    getQuestionNormalizedScore("MN-C02", answers, allQ)         * 0.25 +
    categoryScores["storytelling"].normalizedScore               * 0.20 +
    bhs * 0.20,
  );
}

// ── 10. Creative Partnership Fit ─────────────────────────────────────

export function calculateCreativePartnershipFit(
  context: BrandContext,
  bhs: number,
  sectorFit: number,
  openEnded: DiagnosisOpenEnded,
): number {
  let score = 0;
  if (bhs >= 35 && bhs <= 80) score += 30;
  const growthStages: readonly BrandStage[] = ["growth", "premium", "repositioning"];
  if ((growthStages as readonly string[]).includes(context.brandStage)) score += 20;
  if ((openEnded["AUC-01"] ?? "").trim().length >= 20) score += 15;
  if (context.growthGoal.trim().length > 0) score += 15;
  if (sectorFit <= 60) score += 20;
  return clamp(score);
}

// ── 11. Lead Quality ─────────────────────────────────────────────────

export function calculateLeadQuality(
  context: BrandContext,
  bhs: number,
  sectorFit: number,
  openEnded: DiagnosisOpenEnded,
  hasUrlAnswer = false,
): number {
  let score = 0;
  if (bhs >= 35 && bhs <= 75) score += 25;
  if (
    (openEnded["AUC-01"] ?? "").trim().length >= 20 ||
    (openEnded["AUC-02"] ?? "").trim().length >= 20
  ) score += 20;
  if (
    context.sector.trim().length > 0 &&
    context.businessModel.trim().length > 0 &&
    context.brandStage.trim().length > 0
  ) score += 15;
  if (sectorFit <= 60) score += 15;
  if (hasUrlAnswer)    score += 10;
  if (context.mainProblem.trim().length > 0) score += 15;
  return clamp(score);
}

export function determineLeadSegment(leadQuality: number): LeadSegment {
  if (leadQuality >= 80) return "hot";
  if (leadQuality >= 60) return "warm";
  if (leadQuality >= 40) return "nurture";
  return "qualify";
}

// ── 12. Çakışma sinyalleri ───────────────────────────────────────────

export function detectConflictSignals(
  answers: DiagnosisAnswers,
  context?: BrandContext,
  openEnded?: DiagnosisOpenEnded,
  customerProfile?: string,
  postsRegularly?: boolean
): ConflictSignal[] {
  const signals: ConflictSignal[] = [];

  const paC01 = answers["PA-C01"]; const paC02 = answers["PA-C02"];
  if (isScaleAnswer(paC01) && paC01 >= 4 && paC02 !== undefined && Number(paC02) <= 2) {
    signals.push({ id:"CONF-01", label:"Görsel kalite / profesyonel tasarım uyumsuzluğu",
      description:"Görsel kimliği güçlü değerlendiriyor ama profesyonel tasarım çalışması olmadığını belirtiyor." });
  }

  const stC01 = answers["ST-C01"]; const stC02 = answers["ST-C02"];
  if (isScaleAnswer(stC01) && stC01 >= 4 && stC02 !== undefined && Number(stC02) <= 3) {
    signals.push({ id:"CONF-02", label:"Hikâye gücü / ses kılavuzu yokluğu",
      description:"Güçlü hikâye sahibi olduğunu düşünüyor ama yazılı ses kılavuzu yok." });
  }

  const dgC01 = answers["DG-C01"]; const dgC02 = answers["DG-C02"];
  if (isScaleAnswer(dgC01) && dgC01 >= 4 && dgC02 !== undefined && Number(dgC02) <= 2) {
    signals.push({ id:"CONF-03", label:"Dijital güven / sosyal kanıt boşluğu",
      description:"Web sitesinin güçlü olduğunu düşünüyor ama görünür sosyal kanıt yok." });
  }

  // 1. CONTRADICTION_AUDIENCE
  const hasAudienceClarityClaim = answers["MN-C01"] !== undefined && Number(answers["MN-C01"]) >= 4;
  const hasEmptyAudienceText = customerProfile !== undefined
    ? (customerProfile.trim().length < 15)
    : (openEnded?.["AUC-01"] === undefined || openEnded["AUC-01"].trim().length < 15);

  if (hasAudienceClarityClaim && hasEmptyAudienceText) {
    signals.push({
      id: "CONTRADICTION_AUDIENCE",
      label: "Hedef Kitle Çelişkisi",
      description: "Net konumlandırma tanımı beyan edilmesine rağmen, hedef kitle/problem detayları yetersiz veya boş bırakılmış."
    });
  }

  // 2. CONTRADICTION_PREMIUM_PRICE
  const isPremiumIntended = context && (context.brandStage === "premium" || context.growthGoal === "price_increase");
  const hasHighPriceObjections = answers["PA-C03"] !== undefined && Number(answers["PA-C03"]) <= 2;
  if (isPremiumIntended && hasHighPriceObjections) {
    signals.push({
      id: "CONTRADICTION_PREMIUM_PRICE",
      label: "Premium Fiyat Çelişkisi",
      description: "Premium marka hedeflenmesine rağmen, satış görüşmelerinde yoğun fiyat itirazları alınıyor."
    });
  }

  // 3. CONTRADICTION_CONTENT_REGULARITY
  const claimsConsistency = answers["KS-C02"] !== undefined && Number(answers["KS-C02"]) >= 4;
  const isNotRegular = postsRegularly === false || answers["TR-KS"] === "inconsistent" || answers["TR-KS"] === "no_time";
  if (claimsConsistency && isNotRegular) {
    signals.push({
      id: "CONTRADICTION_CONTENT_REGULARITY",
      label: "İçerik Tutarlılık Çelişkisi",
      description: "Platformlar arası görsel bütünlük iddia edilmesine rağmen içerik paylaşımı düzensiz veya üretimde darboğaz var."
    });
  }

  // 4. CONTRADICTION_POSITIONING_VALUE
  const hasValuePropositionGap = answers["MN-C02"] !== undefined && Number(answers["MN-C02"]) <= 3;
  if (hasAudienceClarityClaim && hasValuePropositionGap) {
    signals.push({
      id: "CONTRADICTION_POSITIONING_VALUE",
      label: "Konumlandırma / Vaat Çelişkisi",
      description: "Konumlandırmanın net olduğu belirtilmesine rağmen rakiplerden ayrışan somut bir değer vaadi kanıtlanamıyor."
    });
  }

  return signals;
}

// ── 13. Trigger seçimi ───────────────────────────────────────────────

export function selectCoreTrigger(
  categoryScores: Record<CategoryKey, CategoryScore>,
): DiagnosisQuestion | null {
  const weakest = CATEGORY_ORDER
    .map(k => ({ key: k, score: categoryScores[k].normalizedScore }))
    .sort((a, b) => a.score - b.score)[0];
  if (!weakest) return null;
  if (weakest.score > CORE_TRIGGER_THRESHOLDS[weakest.key]) return null;
  return CORE_TRIGGERS[weakest.key].question;
}

export function selectSectorTrigger(
  answers: DiagnosisAnswers,
  sector: SectorKey,
): DiagnosisQuestion | null {
  const condition    = SECTOR_TRIGGER_CONDITIONS[sector];
  const triggerDef   = SECTOR_TRIGGERS[sector];
  const sectorModule = SECTOR_MODULES[sector];
  if (!condition || !triggerDef || !sectorModule) return null;
  const answer = answers[condition.questionId];
  if (answer === undefined) return null;
  const question = sectorModule.questions.find(q => q.id === condition.questionId);
  if (!question) return null;
  if (answerToScore(question, answer) > condition.threshold) return null;
  return triggerDef.question;
}

export function selectTriggers(
  categoryScores: Record<CategoryKey, CategoryScore>,
  answers: DiagnosisAnswers,
  sector: SectorKey,
  maxTriggers = 2,
): DiagnosisQuestion[] {
  const triggers: DiagnosisQuestion[] = [];
  const core = selectCoreTrigger(categoryScores);
  if (core && triggers.length < maxTriggers) triggers.push(core);
  const sect = selectSectorTrigger(answers, sector);
  if (sect && triggers.length < maxTriggers && !triggers.some(t => t.id === sect.id)) {
    triggers.push(sect);
  }
  return triggers;
}

// ── 14. Test akışı ───────────────────────────────────────────────────

export function buildTestFlow(context: BrandContext): TestFlow {
  return {
    contextQuestions:   [...CONTEXT_QUESTIONS],
    coreQuestions:      [...CORE_QUESTIONS],
    sectorQuestions:    [...SECTOR_MODULES[context.sector].questions],
    triggerQuestions:   [],
    openEndedQuestions: [...OPEN_ENDED_QUESTIONS],
    sector:             context.sector,
  };
}

// ── 15. Confidence ───────────────────────────────────────────────────

export function determineConfidence(
  completionRate: number,
  openEnded: DiagnosisOpenEnded,
): Confidence {
  if (completionRate < 100) return "low";
  const filled = [openEnded["AUC-01"], openEnded["AUC-02"]]
    .filter(v => typeof v === "string" && v.trim().length >= 20).length;
  if (filled >= 2) return "high";
  if (filled === 1) return "medium";
  return "low";
}

// ── 16. Ana orkestrasyon ─────────────────────────────────────────────

export function computeExplainability(
  context: BrandContext,
  answers: DiagnosisAnswers,
  openEnded: DiagnosisOpenEnded,
  categoryScores: Record<CategoryKey, CategoryScore>,
  imbalanceAlert: ImbalanceAlert,
  conflictSignals: readonly ConflictSignal[],
  sectorFit: number,
  customerProfile?: string,
  postsRegularly?: boolean
): ExplainableDiagnosisLayer {
  const activeSignals: ActiveSignal[] = [];

  const getOptLabel = (qId: string, val: any): string => {
    const q = CORE_QUESTIONS.find(c => c.id === qId) || 
              (context.sector && SECTOR_MODULES[context.sector]?.questions.find(s => s.id === qId));
    if (!q || val === undefined) return String(val);
    if (q.options) {
      const opt = q.options.find(o => o.value === val);
      if (opt) return opt.label;
    }
    return String(val);
  };

  // 1. brandClarity
  const mn01 = answers["MN-C01"];
  if (mn01 !== undefined && Number(mn01) <= 3) {
    activeSignals.push({
      key: "POSITIONING_UNCLEAR",
      label: "Konumlandırma tanımı yazılı veya net değil",
      category: "brandClarity",
      evidence: `\"Konumlandırma Tanımı\" sorusuna verilen cevap: \"${getOptLabel("MN-C01", mn01)}\"`
    });
  }

  const mn02 = answers["MN-C02"];
  if (mn02 !== undefined && Number(mn02) <= 3) {
    activeSignals.push({
      key: "VALUE_PROPOSITION_MISSING",
      label: "Rakiplerden ayrışan değer net değil",
      category: "brandClarity",
      evidence: `\"Farklılaşma Kanıtı\" sorusuna verilen cevap: \"${getOptLabel("MN-C02", mn02)}\"`
    });
  }

  const mn03 = answers["MN-C03"];
  if (mn03 !== undefined && Number(mn03) <= 3) {
    activeSignals.push({
      key: "MESSAGE_INCONSISTENT",
      label: "İletişim kanallarında mesaj tutarlılığı zayıf",
      category: "brandClarity",
      evidence: `\"Mesaj Tutarlılığı\" sorusuna verilen cevap: \"${getOptLabel("MN-C03", mn03)}\"`
    });
  }

  const bg02 = context.businessModel;
  const bg05 = context.mainProblem;
  if (bg02 === "hybrid_b2c" || bg02 === "hybrid_b2b" || bg05 === "cant_convert" || bg05 === "no_leads") {
    const reasons: string[] = [];
    if (bg02 === "hybrid_b2c" || bg02 === "hybrid_b2b") reasons.push("B2B ve B2C karma yapısı");
    if (bg05 === "cant_convert") reasons.push("İkna/satış dönüşüm sorunu");
    if (bg05 === "no_leads") reasons.push("Müşteri bulamama problemi");
    activeSignals.push({
      key: "AUDIENCE_CLARITY_LOW",
      label: "Hedef kitle odaklaması belirsiz",
      category: "brandClarity",
      evidence: `İş modeli ve ticari problem kaynaklı: ${reasons.join(", ")}`
    });
  }

  // 2. premiumPerception
  const pa01 = answers["PA-C01"];
  if (pa01 !== undefined && Number(pa01) <= 3) {
    activeSignals.push({
      key: "VISUAL_IDENTITY_WEAK",
      label: "Görsel kimlik hedeflenen algıyı taşıyamıyor",
      category: "premiumPerception",
      evidence: `\"Görsel Kimlik Kalitesi\" sorusuna verilen cevap: \"${getOptLabel("PA-C01", pa01)}\"`
    });
  }

  const pa02 = answers["PA-C02"];
  if (pa02 !== undefined && Number(pa02) <= 3) {
    activeSignals.push({
      key: "NO_PROFESSIONAL_DESIGN",
      label: "Son 3 yıl içinde profesyonel görsel kimlik güncellemesi yapılmamış",
      category: "premiumPerception",
      evidence: `\"Profesyonel Tasarım Kanıtı\" sorusuna verilen cevap: \"${getOptLabel("PA-C02", pa02)}\"`
    });
  }

  const pa03 = answers["PA-C03"];
  if (pa03 !== undefined && Number(pa03) <= 2) {
    activeSignals.push({
      key: "PRICE_OBJECTION_HIGH",
      label: "Görüşmelerde çok sık fiyat itirazı alınıyor",
      category: "premiumPerception",
      evidence: `\"Fiyat İtirazı Sıklığı\" sorusuna verilen cevap: \"${getOptLabel("PA-C03", pa03)}\"`
    });
  }

  // 3. storytelling
  const st01 = answers["ST-C01"];
  if (st01 !== undefined && Number(st01) <= 3) {
    activeSignals.push({
      key: "STORY_MISSING",
      label: "Derinlemesine tanımlanmış bir marka hikâyesi bulunmuyor",
      category: "storytelling",
      evidence: `\"Marka Hikâyesi\" sorusuna verilen cevap: \"${getOptLabel("ST-C01", st01)}\"`
    });
  }

  const st02 = answers["ST-C02"];
  if (st02 !== undefined && Number(st02) < 5) {
    activeSignals.push({
      key: "VOICE_GUIDE_MISSING",
      label: "Marka sesini tanımlayan yazılı bir kılavuz veya ton profili yok",
      category: "storytelling",
      evidence: `\"Marka Sesi Kanıtı\" sorusuna verilen cevap: \"${getOptLabel("ST-C02", st02)}\"`
    });
  }

  // 4. digitalTrust
  const dg01 = answers["DG-C01"];
  if (dg01 !== undefined && Number(dg01) <= 3) {
    activeSignals.push({
      key: "WEBSITE_IMPRESSION_LOW",
      label: "Web sitesi potansiyel müşteride güçlü bir güven oluşturmuyor",
      category: "digitalTrust",
      evidence: `\"Web Sitesi İzlenimi\" sorusuna verilen cevap: \"${getOptLabel("DG-C01", dg01)}\"`
    });
  }

  const dg02 = answers["DG-C02"];
  if (dg02 !== undefined && Number(dg02) <= 3) {
    activeSignals.push({
      key: "SOCIAL_PROOF_GAP",
      label: "Müşteri referansları veya vaka çalışmaları dijitalde yeterince görünür değil",
      category: "digitalTrust",
      evidence: `\"Sosyal Kanıt Görünürlüğü\" sorusuna verilen cevap: \"${getOptLabel("DG-C02", dg02)}\"`
    });
  }

  // 5. creativeSystem
  const ks01 = answers["KS-C01"];
  if (ks01 !== undefined && Number(ks01) <= 3) {
    activeSignals.push({
      key: "GUIDELINES_MISSING",
      label: "Marka kılavuzu (brand guidelines) belgesi bulunmuyor veya güncel değil",
      category: "creativeSystem",
      evidence: `\"Marka Kılavuzu\" sorusuna verilen cevap: \"${getOptLabel("KS-C01", ks01)}\"`
    });
  }

  const ks02 = answers["KS-C02"];
  if (ks02 !== undefined && Number(ks02) <= 3) {
    activeSignals.push({
      key: "IDENTITY_INTEGRITY_WEAK",
      label: "Farklı platformlar arasında görsel/tonal kimlik bütünlüğü zayıf",
      category: "creativeSystem",
      evidence: `\"Platform Kimlik Bütünlüğü\" sorusuna verilen cevap: \"${getOptLabel("KS-C02", ks02)}\"`
    });
  }

  // 6. Sektörel
  if (context.sector === "health") {
    const smh01 = answers["SM-H01"];
    if (smh01 !== undefined && Number(smh01) <= 3) {
      activeSignals.push({
        key: "HEALTH_EXPERTISE_UNCLEAR",
        label: "Uzmanlık ve nitelikler dijitalde yeterince açık sunulmuyor",
        category: "sector",
        evidence: `\"Uzmanlık Görünürlüğü\" sorusuna verilen cevap: \"${getOptLabel("SM-H01", smh01)}\"`
      });
    }
    const smh02 = answers["SM-H02"];
    if (smh02 !== undefined && Number(smh02) <= 3) {
      activeSignals.push({
        key: "HEALTH_SOCIAL_PROOF_GAP",
        label: "Google veya web üzerinde aktif hasta yorum yönetimi yok",
        category: "sector",
        evidence: `\"Müşteri Kanıtı\" sorusuna verilen cevap: \"${getOptLabel("SM-H02", smh02)}\"`
      });
    }
    const smh03 = answers["SM-H03"];
    if (smh03 !== undefined && Number(smh03) <= 3) {
      activeSignals.push({
        key: "HEALTH_BOOKING_FRICTION",
        label: "Dijital randevu/iletişim süreci optimize edilmemiş",
        category: "sector",
        evidence: `\"Randevu / İletişim Akıcılığı\" sorusuna verilen cevap: \"${getOptLabel("SM-H03", smh03)}\"`
      });
    }
  } else if (context.sector === "realestate") {
    const smr01 = answers["SM-R01"];
    if (smr01 !== undefined && Number(smr01) <= 3) {
      activeSignals.push({
        key: "REALESTATE_PORTFOLIO_WEAK",
        label: "Portföy sunumu projelerin gerçek kalitesini yansıtmakta zayıf kalıyor",
        category: "sector",
        evidence: `\"Portföy Kalitesi\" sorusuna verilen cevap: \"${getOptLabel("SM-R01", smr01)}\"`
      });
    }
    const smr02 = answers["SM-R02"];
    if (smr02 !== undefined && Number(smr02) <= 3) {
      activeSignals.push({
        key: "REALESTATE_STORY_GAP",
        label: "Projeler vaka çalışması/hikaye formatında anlatılmıyor",
        category: "sector",
        evidence: `\"Proje Hikâyesi\" sorusuna verilen cevap: \"${getOptLabel("SM-R02", smr02)}\"`
      });
    }
    const smr03 = answers["SM-R03"];
    if (smr03 !== undefined && Number(smr03) <= 3) {
      activeSignals.push({
        key: "REALESTATE_PRO_PHOTO_GAP",
        label: "Son 6 ayda profesyonel fotoğraf veya video çekimi yapılmamış",
        category: "sector",
        evidence: `\"Görsel Üretim Standardı\" sorusuna verilen cevap: \"${getOptLabel("SM-R03", smr03)}\"`
      });
    }
  } else if (context.sector === "b2b_industrial") {
    const smb01 = answers["SM-B01"];
    if (smb01 !== undefined && Number(smb01) <= 3) {
      activeSignals.push({
        key: "B2B_COMMUNICATION_WEAK",
        label: "Uluslararası standartta kurumsal katalog veya sunum materyali eksik",
        category: "sector",
        evidence: `\"Kurumsal İletişim Dili\" sorusuna verilen cevap: \"${getOptLabel("SM-B01", smb01)}\"`
      });
    }
    const smb02 = answers["SM-B02"];
    if (smb02 !== undefined && Number(smb02) <= 3) {
      activeSignals.push({
        key: "B2B_REFERRAL_GAP",
        label: "Referanslar ve tamamlanan işler dijitalde görünür değil",
        category: "sector",
        evidence: `\"Referans Görünürlüğü\" sorusuna verilen cevap: \"${getOptLabel("SM-B02", smb02)}\"`
      });
    }
    const smb03 = answers["SM-B03"];
    if (smb03 !== undefined && Number(smb03) <= 3) {
      activeSignals.push({
        key: "B2B_PRODUCTION_PROOFS_WEAK",
        label: "Tesis ve üretim yetkinliklerini gösteren görsel/video kalitesi yetersiz",
        category: "sector",
        evidence: `\"Teknik Yetkinlik Kanıtı\" sorusuna verilen cevap: \"${getOptLabel("SM-B03", smb03)}\"`
      });
    }
  } else if (context.sector === "general") {
    const smg01 = answers["SM-G01"];
    if (smg01 !== undefined && Number(smg01) <= 3) {
      activeSignals.push({
        key: "GENERAL_DIFFERENTIATION_WEAK",
        label: "Farklılaşma argümanı net değil",
        category: "sector",
        evidence: `\"Hizmet Farklılaşması\" sorusuna verilen cevap: \"${getOptLabel("SM-G01", smg01)}\"`
      });
    }
    const smg02 = answers["SM-G02"];
    if (smg02 !== undefined && Number(smg02) <= 3) {
      activeSignals.push({
        key: "GENERAL_SOCIAL_PROOF_GAP",
        label: "Müşteri referansları ve sonuç örnekleri dijitalde eksik",
        category: "sector",
        evidence: `\"Dijital Sosyal Kanıt\" sorusuna verilen cevap: \"${getOptLabel("SM-G02", smg02)}\"`
      });
    }
    const smg03 = answers["SM-G03"];
    if (smg03 !== undefined && Number(smg03) <= 3) {
      activeSignals.push({
        key: "GENERAL_PROCESS_UNCLEAR",
        label: "Çalışma sürecinin nasıl işlediği potansiyel müşteriye net yansıtılmıyor",
        category: "sector",
        evidence: `\"Süreç Güveni\" sorusuna verilen cevap: \"${getOptLabel("SM-G03", smg03)}\"`
      });
    }
  }

  // ── New Strategic Parameters Signals ──────────────────────────────────
  // Founder Dependence Signals
  const fd01 = answers["FD-C01"];
  if (fd01 !== undefined && fd01 !== "evet") {
    activeSignals.push({
      key: "FOUNDER_SALES_DEPENDENT",
      label: "Satış süreci kurucuya bağımlı",
      category: "creativeSystem",
      evidence: `\"Satışların Sürdürülebilirliği\" sorusuna verilen cevap: \"${getOptLabel("FD-C01", fd01)}\"`
    });
  }
  const fd02 = answers["FD-C02"];
  if (fd02 !== undefined && fd02 !== "evet") {
    activeSignals.push({
      key: "CRM_SYSTEMS_MISSING",
      label: "Müşteri ilişkileri yönetiminde sistem eksikliği",
      category: "creativeSystem",
      evidence: `\"Müşteri İlişkileri Yönetimi\" sorusuna verilen cevap: \"${getOptLabel("FD-C02", fd02)}\"`
    });
  }
  const fd03 = answers["FD-C03"];
  if (fd03 !== undefined && fd03 !== "evet") {
    activeSignals.push({
      key: "OPERATIONS_FOUNDER_DEPENDENT",
      label: "Günlük operasyon kurucuya bağımlı",
      category: "creativeSystem",
      evidence: `\"Operasyonel Bağımlılık\" sorusuna verilen cevap: \"${getOptLabel("FD-C03", fd03)}\"`
    });
  }

  // Offer Clarity Signals
  const mn01_off = answers["MN-C01"];
  if (mn01_off !== undefined && Number(mn01_off) <= 3) {
    activeSignals.push({
      key: "OFFER_UNCLEAR",
      label: "Konumlandırma / teklif net değil",
      category: "brandClarity",
      evidence: `\"Konumlandırma Tanımı\" sorusuna verilen cevap: \"${getOptLabel("MN-C01", mn01_off)}\"`
    });
  }
  const mn02_off = answers["MN-C02"];
  if (mn02_off !== undefined && Number(mn02_off) <= 3) {
    activeSignals.push({
      key: "OFFER_NOT_DIFFERENTIATED",
      label: "Teklif rakiplerden ayrışmıyor",
      category: "brandClarity",
      evidence: `\"Farklılaşma Kanıtı\" sorusuna verilen cevap: \"${getOptLabel("MN-C02", mn02_off)}\"`
    });
  }
  const mn03_off = answers["MN-C03"];
  if (mn03_off !== undefined && Number(mn03_off) <= 3) {
    activeSignals.push({
      key: "OFFER_REASON_UNCLEAR",
      label: "Mesaj tutarlılığı ve ikna ediciliği zayıf",
      category: "brandClarity",
      evidence: `\"Mesaj Tutarlılığı\" sorusuna verilen cevap: \"${getOptLabel("MN-C03", mn03_off)}\"`
    });
  }

  // Trust Architecture Signals
  // Trust Architecture Signals
  const dg02_tr = answers["DG-C02"];
  if (dg02_tr !== undefined && Number(dg02_tr) < 5) {
    activeSignals.push({
      key: "TRUST_PROOF_GAP",
      label: "Sosyal kanıt veya referans görünürlüğü eksik",
      category: "digitalTrust",
      evidence: `\"Sosyal Kanıt Görünürlüğü\" sorusuna verilen cevap: \"${getOptLabel("DG-C02", dg02_tr)}\"`
    });
  }
  const hasSectorSocialProofGap = 
    (context.sector === "health" && answers["SM-H02"] !== undefined && Number(answers["SM-H02"]) < 5) ||
    (context.sector === "realestate" && answers["SM-R02"] !== undefined && Number(answers["SM-R02"]) < 5) ||
    (context.sector === "b2b_industrial" && answers["SM-B02"] !== undefined && Number(answers["SM-B02"]) < 5) ||
    (context.sector === "general" && answers["SM-G02"] !== undefined && Number(answers["SM-G02"]) < 5);
  if (hasSectorSocialProofGap) {
    const activeSectorQId = context.sector === "health" ? "SM-H02" : context.sector === "realestate" ? "SM-R02" : context.sector === "b2b_industrial" ? "SM-B02" : "SM-G02";
    activeSignals.push({
      key: "TRUST_CASE_STUDIES_MISSING",
      label: "Sektörel vaka çalışmaları veya referanslar eksik",
      category: "digitalTrust",
      evidence: `Sektörel sosyal kanıt sorusuna (${activeSectorQId}) verilen cevap: \"${getOptLabel(activeSectorQId, answers[activeSectorQId])}\"`
    });
  }
  const hasAuthorityGap =
    (context.sector === "health" && answers["SM-H01"] !== undefined && Number(answers["SM-H01"]) < 5) ||
    (context.sector === "b2b_industrial" && answers["SM-B01"] !== undefined && Number(answers["SM-B01"]) < 5);
  if (hasAuthorityGap) {
    const activeSectorQId = context.sector === "health" ? "SM-H01" : "SM-B01";
    activeSignals.push({
      key: "TRUST_PRESS_MISSING",
      label: "Otorite kanıtı veya uzmanlık belgeleri eksik",
      category: "digitalTrust",
      evidence: `Güven/Uzmanlık sorusuna (${activeSectorQId}) verilen cevap: \"${getOptLabel(activeSectorQId, answers[activeSectorQId])}\"`
    });
  }

  // Premium Readiness Signals
  const pa01_pr = answers["PA-C01"];
  if (pa01_pr !== undefined && Number(pa01_pr) <= 3) {
    activeSignals.push({
      key: "PREMIUM_VISUAL_GAP",
      label: "Görsel kimlik kalitesi premium algıyı desteklemiyor",
      category: "premiumPerception",
      evidence: `\"Görsel Kimlik Kalitesi\" sorusuna verilen cevap: \"${getOptLabel("PA-C01", pa01_pr)}\"`
    });
  }
  const pa03_pr = answers["PA-C03"];
  if (pa03_pr !== undefined && Number(pa03_pr) <= 2) {
    activeSignals.push({
      key: "PREMIUM_PRICING_CLASH",
      label: "Premium hedeflere rağmen yüksek fiyat itirazı alınıyor",
      category: "premiumPerception",
      evidence: `\"Fiyat İtirazı Sıklığı\" sorusuna verilen cevap: \"${getOptLabel("PA-C03", pa03_pr)}\"`
    });
  }
  const st02_pr = answers["ST-C02"];
  if (st02_pr !== undefined && Number(st02_pr) < 5) {
    activeSignals.push({
      key: "PREMIUM_MESSAGING_WEAK",
      label: "Marka sesini tanımlayan rehber veya ton kılavuzu eksik",
      category: "premiumPerception",
      evidence: `\"Marka Sesi Kanıtı\" sorusuna verilen cevap: \"${getOptLabel("ST-C02", st02_pr)}\"`
    });
  }

  // Conversion Readiness Signals
  const dg01_cr = answers["DG-C01"];
  if (dg01_cr !== undefined && Number(dg01_cr) <= 3) {
    activeSignals.push({
      key: "CONVERSION_LANDING_WEAK",
      label: "Web sitesi güvenilir bir izlenim veya dönüşüm gücü vermiyor",
      category: "digitalTrust",
      evidence: `\"Web Sitesi İzlenimi\" sorusuna verilen cevap: \"${getOptLabel("DG-C01", dg01_cr)}\"`
    });
  }
  const isTryingToConvertAndFailing = context.mainProblem === "cant_convert" || context.mainProblem === "no_leads";
  if (isTryingToConvertAndFailing) {
    activeSignals.push({
      key: "CONVERSION_CTA_WEAK",
      label: "Web sitesi veya kanallarda eyleme çağrı (CTA) dönüşümü zayıf",
      category: "digitalTrust",
      evidence: `Ana ticari problem: \"${context.mainProblem === "cant_convert" ? "Müşterileri ikna edememe/satış yapamama" : "Yeterli talep alamama"}\"`
    });
  }
  const hasSalesFriction =
    (context.sector === "health" && answers["SM-H03"] !== undefined && Number(answers["SM-H03"]) <= 3) ||
    (context.sector === "general" && answers["SM-G03"] !== undefined && Number(answers["SM-G03"]) <= 3) ||
    (context.sector === "realestate" && answers["SM-R01"] !== undefined && Number(answers["SM-R01"]) <= 3) ||
    (context.sector === "b2b_industrial" && answers["SM-B03"] !== undefined && Number(answers["SM-B03"]) <= 3);
  if (hasSalesFriction) {
    const activeSectorQId = context.sector === "health" ? "SM-H03" : context.sector === "general" ? "SM-G03" : context.sector === "realestate" ? "SM-R01" : "SM-B03";
    activeSignals.push({
      key: "CONVERSION_SALES_PROCESS_FRICTION",
      label: "Satış veya randevu alma sürecinde sürtünme mevcut",
      category: "digitalTrust",
      evidence: `Süreç/Akıcılık sorusuna (${activeSectorQId}) verilen cevap: \"${getOptLabel(activeSectorQId, answers[activeSectorQId])}\"`
    });
  }

  // ── Perception Gap Engine ───────────────────────────────────────────
  const isPremiumIntended = context.brandStage === "premium" || context.growthGoal === "price_increase";
  const hasPriceObjections = answers["PA-C03"] !== undefined && Number(answers["PA-C03"]) <= 2;
  const hasWeakSocialProof = answers["DG-C02"] !== undefined && Number(answers["DG-C02"]) <= 3;
  const hasLowBrandClarity = categoryScores["brandClarity"].normalizedScore < 60;
  const hasLowPremiumPerception = categoryScores["premiumPerception"].normalizedScore < 60;

  if (isPremiumIntended) {
    if (hasPriceObjections) {
      activeSignals.push({
        key: "PERCEPTION_GAP_PRICE_OBJECTION",
        label: "Premium hedefe rağmen yüksek fiyat itirazı",
        category: "premiumPerception",
        evidence: "Marka premium algı hedefliyor veya fiyat artışı istiyor fakat çok sık fiyat itirazı alıyor."
      });
    }
    if (hasWeakSocialProof) {
      activeSignals.push({
        key: "PERCEPTION_GAP_WEAK_SOCIAL_PROOF",
        label: "Premium hedefe rağmen yetersiz sosyal kanıt",
        category: "digitalTrust",
        evidence: "Premium konumlanma için gerekli olan güven verici referanslar ve sosyal kanıtlar eksik."
      });
    }
    if (hasLowBrandClarity) {
      activeSignals.push({
        key: "PERCEPTION_GAP_LOW_CLARITY",
        label: "Premium hedefe rağmen zayıf marka netliği",
        category: "brandClarity",
        evidence: "Premium fiyatlandırmayı destekleyecek net bir konumlandırma ve ayrışma vaadi yok."
      });
    }
    if (hasLowPremiumPerception) {
      activeSignals.push({
        key: "PERCEPTION_GAP_VISUAL_WEAKNESS",
        label: "Premium hedefe rağmen yetersiz görsel/algısal kalite",
        category: "premiumPerception",
        evidence: "Görsel kimlik kalitesi premium konumlanma veya fiyat artışı hedefleriyle uyuşmuyor."
      });
    }
  }

  const activeDiagnoses: ActiveDiagnosis[] = [];

  const checkDiag = (
    key: string,
    label: string,
    cat: CategoryKey | "sector",
    relatedSignalKeys: string[],
    minSignalsRequired: number
  ) => {
    const matchingSignals = activeSignals.filter(s => relatedSignalKeys.includes(s.key));
    const active = matchingSignals.length >= minSignalsRequired;

    let severity: RiskLevel = "low";
    if (active) {
      if (key === "DX_PERCEPTION_GAP_PREMIUM") {
        const count = matchingSignals.length;
        if (count >= 4) severity = "critical";
        else if (count === 3) severity = "high";
        else if (count === 2) severity = "medium";
        else severity = "low";
      } else if (cat === "sector") {
        if (sectorFit <= 40) severity = "critical";
        else if (sectorFit <= 60) severity = "high";
        else if (sectorFit <= 75) severity = "medium";
        else severity = "low";
      } else if (categoryScores[cat]) {
        const catScore = categoryScores[cat].normalizedScore;
        if (catScore <= 35) severity = "critical";
        else if (catScore <= 50) severity = "high";
        else if (catScore <= 70) severity = "medium";
        else severity = "low";
      }
    }

    activeDiagnoses.push({
      key,
      label,
      category: cat,
      active,
      findings: matchingSignals.map(s => s.label),
      signals: matchingSignals.map(s => s.key),
      severity
    });
  };

  checkDiag(
    "DX_BRAND_CLARITY",
    "Marka Netliği Problemi",
    "brandClarity",
    ["POSITIONING_UNCLEAR", "VALUE_PROPOSITION_MISSING", "MESSAGE_INCONSISTENT", "AUDIENCE_CLARITY_LOW"],
    2
  );

  checkDiag(
    "DX_PREMIUM_PERCEPTION",
    "Premium Algı Problemi",
    "premiumPerception",
    ["VISUAL_IDENTITY_WEAK", "NO_PROFESSIONAL_DESIGN", "PRICE_OBJECTION_HIGH"],
    2
  );

  checkDiag(
    "DX_STORYTELLING",
    "Hikaye ve Bağ Kurma Eksikliği",
    "storytelling",
    ["STORY_MISSING", "VOICE_GUIDE_MISSING"],
    1
  );

  checkDiag(
    "DX_DIGITAL_TRUST",
    "Dijital Güven ve Satış Kaybı",
    "digitalTrust",
    ["WEBSITE_IMPRESSION_LOW", "SOCIAL_PROOF_GAP"],
    1
  );

  checkDiag(
    "DX_CREATIVE_SYSTEM",
    "Kreatif Tutarsızlık ve Süreç Riski",
    "creativeSystem",
    ["GUIDELINES_MISSING", "IDENTITY_INTEGRITY_WEAK"],
    1
  );

  const sectorSignalKeys = {
    health: ["HEALTH_EXPERTISE_UNCLEAR", "HEALTH_SOCIAL_PROOF_GAP", "HEALTH_BOOKING_FRICTION"],
    realestate: ["REALESTATE_PORTFOLIO_WEAK", "REALESTATE_STORY_GAP", "REALESTATE_PRO_PHOTO_GAP"],
    b2b_industrial: ["B2B_COMMUNICATION_WEAK", "B2B_REFERRAL_GAP", "B2B_PRODUCTION_PROOFS_WEAK"],
    general: ["GENERAL_DIFFERENTIATION_WEAK", "GENERAL_SOCIAL_PROOF_GAP", "GENERAL_PROCESS_UNCLEAR"]
  }[context.sector] || [];

  checkDiag(
    "DX_SECTOR_FIT",
    "Sektörel Güven / Sunum Eksiği",
    "sector",
    sectorSignalKeys,
    2
  );

  checkDiag(
    "DX_PERCEPTION_GAP_PREMIUM",
    "Premium Algı Boşluğu (Perception Gap)",
    "premiumPerception",
    ["PERCEPTION_GAP_PRICE_OBJECTION", "PERCEPTION_GAP_WEAK_SOCIAL_PROOF", "PERCEPTION_GAP_LOW_CLARITY", "PERCEPTION_GAP_VISUAL_WEAKNESS"],
    2
  );

  checkDiag(
    "DX_FOUNDER_DEPENDENCE",
    "Kurucuya Bağımlılık Riski",
    "creativeSystem",
    ["FOUNDER_SALES_DEPENDENT", "CRM_SYSTEMS_MISSING", "OPERATIONS_FOUNDER_DEPENDENT"],
    1
  );

  checkDiag(
    "DX_OFFER_CLARITY_DEFICIT",
    "Teklif Netliği ve Değer Önerisi Eksiği",
    "brandClarity",
    ["OFFER_UNCLEAR", "OFFER_NOT_DIFFERENTIATED", "OFFER_REASON_UNCLEAR"],
    1
  );

  checkDiag(
    "DX_TRUST_GAP",
    "Güven Mimarisi Boşluğu",
    "digitalTrust",
    ["TRUST_PROOF_GAP", "TRUST_CASE_STUDIES_MISSING", "TRUST_PRESS_MISSING"],
    1
  );

  checkDiag(
    "DX_PREMIUM_READINESS_GAP",
    "Premium Hazırlık Eksiği",
    "premiumPerception",
    ["PREMIUM_VISUAL_GAP", "PREMIUM_PRICING_CLASH", "PREMIUM_MESSAGING_WEAK"],
    1
  );

  checkDiag(
    "DX_CONVERSION_READINESS_LOW",
    "Dönüşüm Hazırlığı ve Huni Eksiği",
    "digitalTrust",
    ["CONVERSION_LANDING_WEAK", "CONVERSION_CTA_WEAK", "CONVERSION_SALES_PROCESS_FRICTION"],
    1
  );

  // Confidence explanation details
  const totalCoreQuestions = CORE_QUESTIONS.length;
  const answeredCoreCount = CORE_QUESTIONS.filter(q => answers[q.id] !== undefined).length;
  const totalSectorQuestions = (SECTOR_MODULES[context.sector]?.questions?.length) || 3;
  const answeredSectorCount = (SECTOR_MODULES[context.sector]?.questions?.filter(q => answers[q.id] !== undefined).length) || 0;

  const totalQuestions = totalCoreQuestions + totalSectorQuestions;
  const answeredCount = answeredCoreCount + answeredSectorCount;

  let confidenceScore = 40;
  const reasons: string[] = [];

  const evidenceContribution = Math.round((answeredCount / totalQuestions) * 30);
  confidenceScore += evidenceContribution;
  if (answeredCount === totalQuestions) {
    reasons.push(`Eksiksiz yanıtlanan ${totalQuestions} temel ve sektörel soru (yüksek kanıt miktarı)`);
  } else {
    reasons.push(`${answeredCount}/${totalQuestions} yanıtlanmış soru`);
  }

  let oeFilled = 0;
  if (openEnded["AUC-01"] && openEnded["AUC-01"].trim().length >= 20) {
    confidenceScore += 10;
    oeFilled++;
  }
  if (openEnded["AUC-02"] && openEnded["AUC-02"].trim().length >= 20) {
    confidenceScore += 10;
    oeFilled++;
  }
  if (oeFilled === 2) {
    reasons.push("Detaylı açık uçlu açıklamalar (yüksek cevap güvenilirliği)");
  } else if (oeFilled === 1) {
    reasons.push("Kısmi açık uçlu detaylar (orta cevap güvenilirliği)");
  }

  let conflictContribution = 10;
  const conflictsCount = conflictSignals.length;
  conflictContribution -= conflictsCount * 10;
  conflictContribution = Math.max(0, conflictContribution);
  confidenceScore += conflictContribution;
  if (conflictsCount === 0) {
    reasons.push("Sıfır çelişkili yanıt (yüksek tutarlılık)");
  } else {
    reasons.push(`Bazı çelişkili yanıtlar tespit edildi (güven seviyesi düşürüldü)`);
  }

  if (!imbalanceAlert.active) {
    confidenceScore += 10;
    reasons.push("Kategoriler arası dengeli dağılım (yüksek sinyal tutarlılığı)");
  } else {
    reasons.push("Kategoriler arası yüksek puan dengesizliği");
  }

  const filteredActiveDiagnoses = activeDiagnoses.filter(d => d.active);

  const activeSignalsInCategory = activeSignals.length;
  if (activeSignalsInCategory > 0) {
    reasons.unshift(`${activeSignalsInCategory} destekleyici sinyal tespit edildi`);
  }

  return {
    activeSignals,
    activeDiagnoses: filteredActiveDiagnoses,
    confidenceDetails: {
      score: Math.min(100, Math.max(0, confidenceScore)),
      reasons
    }
  };
}

export function calculateDiagnosisResult(input: DiagnosisInput): DiagnosisScores {
  const { context, answers, openEnded, hasUrlAnswer = false } = input;

  const categoryScores       = calculateCategoryScores(answers);
  const bhs                  = calculateBrandHealthScore(categoryScores);
  const brandType            = determineBrandType(bhs);
  const sectorFit            = calculateSectorFit(answers, context.sector, context.businessModel);
  const salesReadiness       = calculateSalesReadiness(answers, categoryScores);
  const premiumPotential     = calculatePremiumPotentialFromAnswers(answers, categoryScores, bhs);
  const creativePartnershipFit = calculateCreativePartnershipFit(context, bhs, sectorFit, openEnded);
  const leadQuality          = calculateLeadQuality(context, bhs, sectorFit, openEnded, hasUrlAnswer);
  const leadSegment          = determineLeadSegment(leadQuality);
  const riskLabels           = detectRiskLabels(categoryScores);
  const imbalanceAlert       = detectImbalance(categoryScores);
  const conflictSignals      = detectConflictSignals(
    answers,
    context,
    openEnded,
    input.customerProfile,
    input.postsRegularly
  );
  const strongestCategory    = getStrongestCategory(categoryScores);
  const weakestCategory      = getWeakestCategory(categoryScores, bhs);

  const answeredCount  = CORE_QUESTIONS.filter(q => answers[q.id] !== undefined).length;
  const completionRate = Math.round((answeredCount / CORE_QUESTIONS.length) * 100);
  const confidence     = determineConfidence(completionRate, openEnded);

  const explainability = computeExplainability(
    context,
    answers,
    openEnded,
    categoryScores,
    imbalanceAlert,
    conflictSignals,
    sectorFit,
    input.customerProfile,
    input.postsRegularly
  );

  const treatmentIntelligence = generateTreatmentIntelligence(
    context,
    explainability.activeDiagnoses,
    categoryScores,
    imbalanceAlert,
    sectorFit,
    salesReadiness
  );

  return {
    brandHealth: bhs, sectorFit, salesReadiness, premiumPotential,
    creativePartnershipFit, leadQuality, leadSegment,
    categories: categoryScores, brandType, riskLabels, imbalanceAlert,
    conflictSignals, strongestCategory, weakestCategory, confidence,
    explainability,
    treatmentIntelligence,
  };
}

const TREATMENT_PLANS_PROTOCOLS: Record<string, Omit<TreatmentPlan, "diagnosisKey">> = {
  DX_PERCEPTION_GAP_PREMIUM: {
    title: "Premium Algı Boşluğu (Perception Gap) Protokolü",
    steps: [
      { stepNumber: 1, title: "Algı Denetimi ve Fiyat Stratejisi", description: "Hizmet kalitesi ve fiyat arasındaki uyumsuzluğu çözmek için pazar araştırması ve fiyatlandırma revizyonu." },
      { stepNumber: 2, title: "Sosyal Kanıt ve Prestij Kürasyonu", description: "Memnun kalmış en prestijli müşteri logolarının ve yüksek etkili vaka çalışmalarının konumlandırılması." },
      { stepNumber: 3, title: "Premium Kimlik Bütünlüğü", description: "Kreatif tasarımları ve marka sesini premium segmentin beklentilerine göre profesyonelce güncelleme." }
    ]
  },
  DX_BRAND_CLARITY: {
    title: "Marka Netleşmesi Protokolü",
    steps: [
      { stepNumber: 1, title: "Hedef Kitle Odaklaması", description: "İdeal müşteri profili (ICP) ve hedef kitle sınırlarının daraltılarak acı noktalarının netleştirilmesi." },
      { stepNumber: 2, title: "Konumlandırma Atölyesi", description: "Markanın ne iş yaptığını ve sunduğu ana vaadi tek cümlede tanımlayan konumlandırma belgesinin oluşturulması." },
      { stepNumber: 3, title: "Farklılaşma Kanıt Matrisi", description: "\"Neden Biz?\" sorusuna rakiplerin taklit edemeyeceği 3 temel özgün kanıt argümanının hazırlanması." },
      { stepNumber: 4, title: "Bütünleşik Mesajlaşma Sistemi", description: "Web, satış sunumları ve sosyal medyada kullanılacak mesajlaşma rehberinin yazıya dökülmesi." }
    ]
  },
  DX_PREMIUM_PERCEPTION: {
    title: "Premium Algı ve Fiyat Meşrulaştırma Protokolü",
    steps: [
      { stepNumber: 1, title: "Görsel Denetim ve Temizlik", description: "Tüm dijital kanallardaki (web, PDF, Instagram) zayıf ve tutarsız grafik tasarımların elenmesi." },
      { stepNumber: 2, title: "Profesyonel Görsel Revizyon", description: "Premium algıyı destekleyecek modern logo, yazı tipi ve renk paletinin profesyonelce tasarlanması." },
      { stepNumber: 3, title: "Fiyat Savunma Kurgusu", description: "Tekliflerinizdeki fiyatı haklı çıkaracak zengin marka sunumu ve materyal sisteminin kurulması." }
    ]
  },
  DX_STORYTELLING: {
    title: "Hikaye Anlatımı ve Bağ Kurma Protokolü",
    steps: [
      { stepNumber: 1, title: "Çıkış Noktası Hikayesi", description: "Markanın neden kurulduğunu ve müşterinin hayatında neyi çözmek istediğini anlatan samimi hikaye kurgusu." },
      { stepNumber: 2, title: "Marka Ses Kılavuzu", description: "Tüm platform içeriklerinde kullanılacak tonalitenin (örn. kurumsal, samimi, otoriter) rehberleştirilmesi." }
    ]
  },
  DX_DIGITAL_TRUST: {
    title: "Dijital Güven ve Dönüşüm Protokolü",
    steps: [
      { stepNumber: 1, title: "Müşteri Referans & Sosyal Kanıt Sistemi", description: "Kazanılmış müşteri başarı hikayelerinin, Google yorumlarının ve logoların web sitesinde en görünür yere yerleştirilmesi." },
      { stepNumber: 2, title: "Dönüşüm Odaklı Web UX (Sürtünme Temizliği)", description: "Ziyaretçilerin randevu veya teklif talep etmesini engelleyen karışık adımların kaldırılması." }
    ]
  },
  DX_CREATIVE_SYSTEM: {
    title: "Kreatif Sistem ve Standardizasyon Protokolü",
    steps: [
      { stepNumber: 1, title: "Brand Kit & Tasarım Şablonları", description: "Sosyal medya ve pazarlama materyallerinin hızlı üretilmesi için tasarım şablon kütüphanesinin kurulması." },
      { stepNumber: 2, title: "İçerik Üretim İş Akışı", description: "Tasarımcı ve içerik yöneticileri arasındaki onay ve revizyon süreçlerinin standardizasyonu." }
    ]
  },
  DX_SECTOR_FIT: {
    title: "Sektörel İtibar ve Uyum Protokolü",
    steps: [
      { stepNumber: 1, title: "Sektörel Standartların Karşılanması", description: "Sektöre özel kritik görsel ve dökümantasyon (teknik katalog, sertifikalar, uzmanlık profilleri) eksikliklerinin tamamlanması." },
      { stepNumber: 2, title: "Sektörel Sosyal Kanıt", description: "Google Business yorumlarının toplanması, NDA izinli B2B referans logolarının veya portföy görsellerinin premium hale getirilmesi." }
    ]
  },
  DX_FOUNDER_DEPENDENCE: {
    title: "Kurucuya Bağımlılık ve Sistemleşme Protokolü",
    steps: [
      { stepNumber: 1, title: "Satış Sürecinin Dokümantasyonu ve Yetkilendirme", description: "Satış kapama adımlarının, fiyat tekliflerinin ve sıkça sorulan soruların yazılı bir oyun planına (playbook) dönüştürülmesi ve ekibe devredilmesi." },
      { stepNumber: 2, title: "Müşteri İlişkileri ve Takip Altyapısı (CRM)", description: "Potansiyel müşteri takibinin kurucunun hafızasından çıkarılarak dijital bir CRM sistemine aktarılması ve günlük iş akışının otomasyonu." },
      { stepNumber: 3, title: "Operasyonel Yetkilendirme ve Karar Çerçevesi", description: "Operasyonel süreçlerin kurucu onayı olmadan ilerleyebilmesi için net yetki limitleri ve standart çalışma prosedürlerinin (SOP) tanımlanması." }
    ]
  },
  DX_OFFER_CLARITY_DEFICIT: {
    title: "Teklif Netliği ve Farklılaşma Protokolü",
    steps: [
      { stepNumber: 1, title: "Tek Cümlelik Değer Önerisi (One-Sentence Value Prop)", description: "Markanın kimin için, hangi ana problemi çözdüğünü ve bunu nasıl benzersiz biçimde yaptığını anlatan net bir değer önerisinin yazılması." },
      { stepNumber: 2, title: "Ayrıştırıcı Değer Kanıt Matrisi", description: "Rakiplerin kolayca kopyalayamayacağı metodoloji, uzmanlık veya garantilerin tespit edilerek teklif sayfasına eklenmesi." },
      { stepNumber: 3, title: "Satın Alma Nedenleri ve Engel Temizliği", description: "Potansiyel müşterilerin satın alma kararını ertelemesine neden olan belirsizliklerin ve kafa karışıklıklarının teklif dilinden temizlenmesi." }
    ]
  },
  DX_TRUST_GAP: {
    title: "Güven Altyapısı ve Sosyal Kanıt Protokolü",
    steps: [
      { stepNumber: 1, title: "Sosyal Kanıt ve Referans Kürasyonu", description: "Memnun kalmış en prestijli müşteri logolarının ve yüksek etkili vaka çalışmalarının web sitesinin en görünür alanlarına yerleştirilmesi." },
      { stepNumber: 2, title: "Uzmanlık ve Otorite Belgelerinin Sergilenmesi", description: "Ekibin sertifikalarının, başarı hikayelerinin, ödüllerinin veya varsa basın görünürlüklerinin dijital kanallara entegre edilmesi." },
      { stepNumber: 3, title: "Müşteri Geri Bildirim Toplama Sistemi", description: "Tamamlanan işlerin ardından otomatik veya yarı-otomatik olarak Google yorumları ve yazılı referans toplama süreçlerinin kurulması." }
    ]
  },
  DX_PREMIUM_READINESS_GAP: {
    title: "Premium Hazırlık ve Algı Protokolü",
    steps: [
      { stepNumber: 1, title: "Premium Görsel Kimlik ve Tasarım Standardı", description: "Logo, tipografi, renk paleti ve dijital sunum materyallerinin premium hedef kitlenin kalite beklentisini karşılayacak seviyeye çekilmesi." },
      { stepNumber: 2, title: "Değer Odaklı Fiyatlandırma ve Paketleme", description: "Fiyat itirazlarını en aza indirmek için hizmetleri sadece emek değil, çıktı ve değer bazlı paketleme modeline geçirme." },
      { stepNumber: 3, title: "Marka Ses Tonu ve Mesajlaşma Kılavuzu", description: "Premium algıyı yansıtacak, net, özgüvenli ve tutarlı bir iletişim tonunun tüm pazarlama kanallarına entegre edilmesi." }
    ]
  },
  DX_CONVERSION_READINESS_LOW: {
    title: "Dönüşüm Hazırlığı ve Huni Optimizasyon Protokolü",
    steps: [
      { stepNumber: 1, title: "Dönüşüm Odaklı Web UX (Sürtünme Temizliği)", description: "Ziyaretçilerin randevu almasını veya teklif talep etmesini engelleyen karışık formların ve yavaş adımların ortadan kaldırılması." },
      { stepNumber: 2, title: "Net Eyleme Çağrı (CTA) Akışı", description: "Web sitesi genelinde tek bir birincil eyleme çağrı (örn. Ücretsiz Keşif Görüşmesi Ayarla) tanımlanarak dikkat dağınıklığının önlenmesi." },
      { stepNumber: 3, title: "Satış Randevu Süreci Akıcılığı", description: "Toplantı planlama (Calendly vb.) araçlarının web sitesine gömülmesi ve toplantı öncesi hatırlatma otomasyonlarının kurulması." }
    ]
  }
};

const MEETING_QUESTIONS_POOL: readonly MeetingQuestion[] = [
  { id: "MQ-CLARITY-1", questionText: "En karlı ve sizi en iyi anlayan müşteri grubunuz tam olarak kimlerden oluşuyor?", diagnosisKey: "DX_BRAND_CLARITY", objective: "Hedef Kitle Netliğini Değerlendirmek" },
  { id: "MQ-CLARITY-2", questionText: "\"Neden sizi seçmeliyim?\" sorusuna rakiplerinizin söyleyemeyeceği, tamamen size özgü 2 somut sebep nedir?", diagnosisKey: "DX_BRAND_CLARITY", objective: "Değer Önerisi Ayrışmasını Test Etmek" },
  
  { id: "MQ-PREMIUM-1", questionText: "Müşterileriniz fiyat teklifinize itiraz ederken genellikle hangi rakiple kıyaslama yapıyor?", diagnosisKey: "DX_PREMIUM_PERCEPTION", objective: "Fiyat Savunulabilirliğini Ölçmek" },
  { id: "MQ-PREMIUM-2", questionText: "Görsel kimliğinizin veya web sitenizin, sunduğunuz hizmetin kalitesini gölgelediğini düşünüyor musunuz?", diagnosisKey: "DX_PREMIUM_PERCEPTION", objective: "Tasarım Kalitesi Uyumsuzluğunu Tespit Etmek" },
  
  { id: "MQ-STORY-1", questionText: "Markanızın veya kurucularınızın çıkış noktasında, müşteride empati uyandırabilecek nasıl bir hikaye var?", diagnosisKey: "DX_STORYTELLING", objective: "Hikaye Anlatımı Potansiyelini Keşfetmek" },
  { id: "MQ-STORY-2", questionText: "Sosyal medya paylaşımlarınızı hazırlarken ekibe yol gösteren yazılı bir ses tonu rehberiniz var mı?", diagnosisKey: "DX_STORYTELLING", objective: "Marka Sesi Tutarlılığını Sorgulamak" },
  
  { id: "MQ-TRUST-1", questionText: "Web sitenizi ziyaret eden potansiyel müşterilerinize en çok güven veren 3 kanıt unsuru hangileridir?", diagnosisKey: "DX_DIGITAL_TRUST", objective: "Sosyal Kanıt Gücünü Anlamak" },
  { id: "MQ-TRUST-2", questionText: "Web sitenizden randevu/teklif isteme adımında müşterinin yaşadığı en büyük zorluk sizce nerede?", diagnosisKey: "DX_DIGITAL_TRUST", objective: "Web Dönüşüm Sürtünmesini Belirlemek" },
  
  { id: "MQ-SYSTEM-1", questionText: "Yeni bir kreatif içerik veya kampanya hazırlarken onay ve tasarım süreci neden gecikiyor?", diagnosisKey: "DX_CREATIVE_SYSTEM", objective: "Kreatif Üretim Darboğazını Bulmak" },
  { id: "MQ-SYSTEM-2", questionText: "Ekipteki tasarımcılar veya içerik yöneticileri için görsel standartları belirleyen güncel bir marka kılavuzunuz var mı?", diagnosisKey: "DX_CREATIVE_SYSTEM", objective: "Tasarım Rehberi Varlığını Denetlemek" },
  
  { id: "MQ-SECTOR-1", questionText: "Sektörünüzde müşterilerinizin satın alma kararı vermeden önce dijitalde en çok aradığı kritik detay nedir?", diagnosisKey: "DX_SECTOR_FIT", objective: "Sektörel İtibar Eksikliklerini Keşfetmek" },

  { id: "MQ-FOUNDER-1", questionText: "Kurucu olarak günlük operasyonlardan tamamen çekilseniz, işler kaç gün boyunca aksamadan devam eder?", diagnosisKey: "DX_FOUNDER_DEPENDENCE", objective: "Operasyonel Bağımlılığı Tespit Etmek" },
  { id: "MQ-FOUNDER-2", questionText: "Satışlarınızı kurucu ilişkileriyle değil, standart bir pazarlama ve satış hunisiyle kapatabiliyor musunuz?", diagnosisKey: "DX_FOUNDER_DEPENDENCE", objective: "Satış Süreci Bağımsızlığını Sorgulamak" },

  { id: "MQ-OFFER-1", questionText: "Potansiyel bir müşteri sitenize girdikten sonraki ilk 5 saniyede tam olarak ne sattığınızı ve ona ne kazandıracağınızı anlayabiliyor mu?", diagnosisKey: "DX_OFFER_CLARITY_DEFICIT", objective: "İlk İzlenim Teklif Netliğini Ölçmek" },
  { id: "MQ-OFFER-2", questionText: "Rakiplerinizle karşılaştırıldığında, müşterinin neden daha fazla ödemesi gerektiğine dair 3 net ve somut argümanınız var mı?", diagnosisKey: "DX_OFFER_CLARITY_DEFICIT", objective: "Ayrışma Argümanlarını Sorgulamak" },

  { id: "MQ-TRUST-GAP-1", questionText: "Memnun kalmış en büyük 3 müşterinizin başarı hikayesini somut verilerle web sitenizde yayınladınız mı?", diagnosisKey: "DX_TRUST_GAP", objective: "Vaka Çalışması Kalitesini Ölçmek" },
  { id: "MQ-TRUST-GAP-2", questionText: "Sektörünüzde otorite olarak kabul edilmenizi sağlayacak lisans, ödül veya sertifikalarınız dijitalde ne kadar görünür?", diagnosisKey: "DX_TRUST_GAP", objective: "Sektörel Otorite Kanıtını Test Etmek" },

  { id: "MQ-PREMIUM-READY-1", questionText: "Görsel kimliğiniz ve satış sunumlarınız, talep ettiğiniz yüksek fiyatları meşrulaştırmaya yetecek prestije sahip mi?", diagnosisKey: "DX_PREMIUM_READINESS_GAP", objective: "Görsel Güven Seviyesini Belirlemek" },
  { id: "MQ-PREMIUM-READY-2", questionText: "Teklif verdiğiniz müşterilerin yüzde kaçı fiyatı yüksek bulup vazgeçiyor ve bu direnci kırmak için ne yapıyorsunuz?", diagnosisKey: "DX_PREMIUM_READINESS_GAP", objective: "Fiyat Direncini Analiz Etmek" },

  { id: "MQ-CONVERSION-READY-1", questionText: "Web sitenize gelen 100 potansiyel müşteriden kaçı gerçekten randevu veya teklif formunu dolduruyor?", diagnosisKey: "DX_CONVERSION_READINESS_LOW", objective: "Dönüşüm Oranı Farkındalığını Sorgulamak" },
  { id: "MQ-CONVERSION-READY-2", questionText: "Sitenizdeki randevu formunda veya satış hunisinde müşteriyi yoran gereksiz adımlar veya uzun alanlar var mı?", diagnosisKey: "DX_CONVERSION_READINESS_LOW", objective: "Hunideki Sürtünme Noktalarını Bulmak" }
];

export function generateTreatmentIntelligence(
  context: BrandContext,
  activeDiagnoses: readonly ActiveDiagnosis[],
  categoryScores: Record<CategoryKey, CategoryScore>,
  imbalanceAlert: ImbalanceAlert,
  sectorFit: number,
  salesReadiness: number
): TreatmentIntelligence {
  const priorityMetrics: Record<string, PriorityMetrics> = {};
  const strategicRoadmap: { diagnosisKey: string; label: string; priority: number }[] = [];

  const allDiagKeys = [
    "DX_BRAND_CLARITY",
    "DX_PREMIUM_PERCEPTION",
    "DX_STORYTELLING",
    "DX_DIGITAL_TRUST",
    "DX_CREATIVE_SYSTEM",
    "DX_SECTOR_FIT",
    "DX_PERCEPTION_GAP_PREMIUM",
    "DX_FOUNDER_DEPENDENCE",
    "DX_OFFER_CLARITY_DEFICIT",
    "DX_TRUST_GAP",
    "DX_PREMIUM_READINESS_GAP",
    "DX_CONVERSION_READINESS_LOW"
  ];

  for (const diagKey of allDiagKeys) {
    let baseImpact = 60;
    let baseReadiness = 60;
    let catKey: CategoryKey | null = null;
    let label = "";

    switch (diagKey) {
      case "DX_BRAND_CLARITY":
        baseImpact = 90;
        baseReadiness = 85;
        catKey = "brandClarity";
        label = "Marka Netliği";
        break;
      case "DX_PREMIUM_PERCEPTION":
        baseImpact = 80;
        baseReadiness = 50;
        catKey = "premiumPerception";
        label = "Premium Algı";
        break;
      case "DX_DIGITAL_TRUST":
        baseImpact = 85;
        baseReadiness = 60;
        catKey = "digitalTrust";
        label = "Dijital Güven";
        break;
      case "DX_STORYTELLING":
        baseImpact = 70;
        baseReadiness = 80;
        catKey = "storytelling";
        label = "Hikaye Anlatımı";
        break;
      case "DX_CREATIVE_SYSTEM":
        baseImpact = 60;
        baseReadiness = 40;
        catKey = "creativeSystem";
        label = "Kreatif Sistem";
        break;
      case "DX_SECTOR_FIT":
        baseImpact = 75;
        baseReadiness = 70;
        label = "Sektörel Uyum";
        break;
      case "DX_PERCEPTION_GAP_PREMIUM":
        baseImpact = 85;
        baseReadiness = 55;
        catKey = "premiumPerception";
        label = "Premium Algı Boşluğu";
        break;
      case "DX_FOUNDER_DEPENDENCE":
        baseImpact = 75;
        baseReadiness = 65;
        catKey = "creativeSystem";
        label = "Kurucu Bağımlılığı";
        break;
      case "DX_OFFER_CLARITY_DEFICIT":
        baseImpact = 95;
        baseReadiness = 80;
        catKey = "brandClarity";
        label = "Teklif Netliği Eksiği";
        break;
      case "DX_TRUST_GAP":
        baseImpact = 85;
        baseReadiness = 65;
        catKey = "digitalTrust";
        label = "Güven Mimarisi Boşluğu";
        break;
      case "DX_PREMIUM_READINESS_GAP":
        baseImpact = 80;
        baseReadiness = 55;
        catKey = "premiumPerception";
        label = "Premium Hazırlık";
        break;
      case "DX_CONVERSION_READINESS_LOW":
        baseImpact = 90;
        baseReadiness = 70;
        catKey = "digitalTrust";
        label = "Dönüşüm Hazırlığı";
        break;
    }

    // 1. Impact Score Calculation
    let impactScore = baseImpact;
    if (context.growthGoal === "price_increase" && (diagKey === "DX_PREMIUM_PERCEPTION" || diagKey === "DX_PERCEPTION_GAP_PREMIUM" || diagKey === "DX_PREMIUM_READINESS_GAP")) impactScore += 15;
    if (context.growthGoal === "more_customers" && (diagKey === "DX_DIGITAL_TRUST" || diagKey === "DX_CONVERSION_READINESS_LOW" || diagKey === "DX_TRUST_GAP")) impactScore += 15;
    if (context.growthGoal === "systematize" && (diagKey === "DX_CREATIVE_SYSTEM" || diagKey === "DX_FOUNDER_DEPENDENCE")) impactScore += 15;
    if (context.growthGoal === "new_market" && (diagKey === "DX_BRAND_CLARITY" || diagKey === "DX_OFFER_CLARITY_DEFICIT")) impactScore += 15;
    if (context.growthGoal === "brand_awareness" && diagKey === "DX_STORYTELLING") impactScore += 15;
    impactScore = Math.min(100, impactScore);

    // 2. Urgency Score Calculation
    let urgencyScore = 50;
    if (catKey && categoryScores[catKey]) {
      urgencyScore = 100 - categoryScores[catKey].normalizedScore;
    } else if (diagKey === "DX_SECTOR_FIT") {
      const scores = Object.values(categoryScores).map(c => c.normalizedScore);
      const avg = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length) : 50;
      urgencyScore = 100 - avg;
    }
    if (context.mainProblem === "price_objection" && (diagKey === "DX_PREMIUM_PERCEPTION" || diagKey === "DX_BRAND_CLARITY" || diagKey === "DX_PERCEPTION_GAP_PREMIUM" || diagKey === "DX_PREMIUM_READINESS_GAP" || diagKey === "DX_OFFER_CLARITY_DEFICIT")) urgencyScore += 15;
    if (context.mainProblem === "cant_convert" && (diagKey === "DX_DIGITAL_TRUST" || diagKey === "DX_CONVERSION_READINESS_LOW")) urgencyScore += 15;
    if (context.mainProblem === "no_differentiation" && (diagKey === "DX_BRAND_CLARITY" || diagKey === "DX_OFFER_CLARITY_DEFICIT")) urgencyScore += 20;
    if (context.mainProblem === "no_leads" && (diagKey === "DX_DIGITAL_TRUST" || diagKey === "DX_CONVERSION_READINESS_LOW" || diagKey === "DX_TRUST_GAP")) urgencyScore += 15;

    // Severity Layer Urgency Boost
    const diagInfo = activeDiagnoses.find(d => d.key === diagKey);
    const severity = diagInfo?.severity ?? "low";
    if (severity === "critical") urgencyScore += 25;
    else if (severity === "high") urgencyScore += 15;
    else if (severity === "low") urgencyScore -= 10;
    urgencyScore = Math.min(100, Math.max(0, urgencyScore));

    // 3. Readiness Score Calculation
    let readinessScore = baseReadiness;
    if (context.brandStage === "startup") {
      if (diagKey === "DX_BRAND_CLARITY" || diagKey === "DX_OFFER_CLARITY_DEFICIT") readinessScore += 10;
      if (diagKey === "DX_CREATIVE_SYSTEM" || diagKey === "DX_FOUNDER_DEPENDENCE") readinessScore -= 15;
    }
    readinessScore = Math.min(100, Math.max(0, readinessScore));

    const totalPriority = Math.round(impactScore * 0.4 + urgencyScore * 0.4 + readinessScore * 0.2);

    priorityMetrics[diagKey] = {
      impactScore,
      urgencyScore,
      readinessScore,
      totalPriority
    };

    const isActive = activeDiagnoses.some(d => d.key === diagKey && d.active);
    if (isActive) {
      strategicRoadmap.push({
        diagnosisKey: diagKey,
        label,
        priority: totalPriority
      });
    }
  }

  strategicRoadmap.sort((a, b) => b.priority - a.priority);

  const priorityDiagnosisKey = strategicRoadmap.length > 0 ? strategicRoadmap[0].diagnosisKey : null;

  const treatmentPlans: TreatmentPlan[] = [];
  for (const diag of activeDiagnoses) {
    if (diag.active && TREATMENT_PLANS_PROTOCOLS[diag.key]) {
      treatmentPlans.push({
        diagnosisKey: diag.key,
        ...TREATMENT_PLANS_PROTOCOLS[diag.key]
      });
    }
  }

  const wrongSequenceWarnings: WrongSequenceWarning[] = [];
  const activeKeys = new Set(activeDiagnoses.filter(d => d.active).map(d => d.key));

  const isTryingToGetCustomers = context.growthGoal === "more_customers" || context.mainProblem === "no_leads" || context.mainProblem === "cant_convert";

  // 1. BLOCK_PAID_ADS (Paid Ads requested but Offer Clarity and Conversion Readiness are low)
  const hasOfferClarityIssue = activeKeys.has("DX_BRAND_CLARITY") || activeKeys.has("DX_OFFER_CLARITY_DEFICIT") || categoryScores["brandClarity"].normalizedScore < 55;
  const hasConversionReadinessIssue = activeKeys.has("DX_DIGITAL_TRUST") || activeKeys.has("DX_CONVERSION_READINESS_LOW") || categoryScores["digitalTrust"].normalizedScore < 55;
  if (isTryingToGetCustomers && hasOfferClarityIssue && hasConversionReadinessIssue) {
    wrongSequenceWarnings.push({
      key: "BLOCK_PAID_ADS",
      title: "Paid Ads Reklam Engeli (BLOCK_PAID_ADS)",
      warningMessage: "Teklif Netliği (Offer Clarity / DX_OFFER_CLARITY_DEFICIT) ve Dönüşüm Hazırlığı (Conversion Readiness / DX_CONVERSION_READINESS_LOW) seviyeleriniz kritik düzeyde düşükken ücretli reklam (Paid Ads) kampanyaları başlatmak bütçe kaybına yol açar. Reklamdan önce teklifinizi netleştirmeli ve web sitenizin güven altyapısını kurmalısınız.",
      blockers: ["DX_BRAND_CLARITY", "DX_OFFER_CLARITY_DEFICIT", "DX_DIGITAL_TRUST", "DX_CONVERSION_READINESS_LOW"].filter(k => activeKeys.has(k)),
      targetAction: "Paid Ads Ücretli Reklam Kampanyaları"
    });
  }

  // 2. Positioning olmadan Content Scaling
  const isTryingToScaleContent = context.growthGoal === "brand_awareness" || context.growthGoal === "systematize";
  if (isTryingToScaleContent && (activeKeys.has("DX_BRAND_CLARITY") || activeKeys.has("DX_OFFER_CLARITY_DEFICIT"))) {
    wrongSequenceWarnings.push({
      key: "WS_CONTENT_BEFORE_POSITIONING",
      title: "Konumlandırmasız İçerik Ölçekleme Riski",
      warningMessage: "Markanızın net bir pazar konumlandırması, teklif netliği ve hedef kitle tanımı (DX_OFFER_CLARITY_DEFICIT) olmadan içerik üretimini ölçeklemeye çalışmak, hedefsiz ve dönüşüm getirmeyen mesaj yığılmasına yol açacaktır.",
      blockers: ["DX_BRAND_CLARITY", "DX_OFFER_CLARITY_DEFICIT"].filter(k => activeKeys.has(k)),
      targetAction: "İçerik Üretimini Ölçekleme (Content Scaling)"
    });
  }

  // 3. Proof System olmadan Premium Pricing
  const isTryingPremiumPricing = context.growthGoal === "price_increase" || context.brandStage === "premium" || context.mainProblem === "price_objection";
  if (isTryingPremiumPricing && (activeKeys.has("DX_DIGITAL_TRUST") || activeKeys.has("DX_TRUST_GAP") || activeKeys.has("DX_PREMIUM_READINESS_GAP"))) {
    wrongSequenceWarnings.push({
      key: "WS_PREMIUM_BEFORE_PROOF",
      title: "Güven Altyapısız Premium Fiyatlandırma Riski",
      warningMessage: "Hedeflenen premium fiyatlandırmayı (Premium Pricing) ve marka konumunu destekleyecek güçlü bir sosyal kanıt, referans, dijital güven ve premium algı altyapısı (DX_TRUST_GAP / DX_PREMIUM_READINESS_GAP) olmadan fiyat yükseltmek yüksek satış direncine sebep olacaktır.",
      blockers: ["DX_DIGITAL_TRUST", "DX_TRUST_GAP", "DX_PREMIUM_READINESS_GAP"].filter(k => activeKeys.has(k)),
      targetAction: "Premium Fiyatlandırma ve Lüks Konumlandırma"
    });
  }

  // 4. Messaging olmadan Lead Generation
  if (isTryingToGetCustomers && activeKeys.has("DX_STORYTELLING")) {
    wrongSequenceWarnings.push({
      key: "WS_LEAD_BEFORE_MESSAGING",
      title: "Mesajlaşmasız Müşteri Edinme Riski",
      warningMessage: "Markanın ses tonu, vaadi ve net mesajları (Messaging) yazılı hale getirilmeden yeni müşteri edinme (Lead Generation) hunileri kurmak, potansiyel müşterilerle kopuk ve etkisiz iletişim kurulmasına neden olur.",
      blockers: ["DX_STORYTELLING"],
      targetAction: "Müşteri Edinme Hunileri (Lead Generation)"
    });
  }

  // 5. Kurucudan Bağımsızlaşmadan Ölçekleme (Wrong Sequence)
  const isTryingToSystematizeOrScale = context.growthGoal === "systematize" || context.brandStage === "growth";
  if (isTryingToSystematizeOrScale && activeKeys.has("DX_FOUNDER_DEPENDENCE")) {
    wrongSequenceWarnings.push({
      key: "WS_SCALE_BEFORE_DELEGATION",
      title: "Sistemleşme Olmadan Büyüme ve Ölçekleme Riski",
      warningMessage: "Kurucuya bağımlı satış ve operasyonel süreçleri (Founder Dependence) standart sistemlere bağlamadan markayı büyütmeye çalışmak, kurucu üzerinde sürdürülemez bir operasyonel darboğaz (burnout) yaratacaktır.",
      blockers: ["DX_FOUNDER_DEPENDENCE"],
      targetAction: "Operasyonel Büyüme ve Ölçekleme"
    });
  }

  const meetingQuestions = MEETING_QUESTIONS_POOL.filter(q => activeKeys.has(q.diagnosisKey));

  return {
    priorityDiagnosisKey,
    treatmentPlans,
    priorityMetrics,
    wrongSequenceWarnings,
    strategicRoadmap: strategicRoadmap.map(r => ({ diagnosisKey: r.diagnosisKey, label: r.label })),
    meetingQuestions
  };
}
