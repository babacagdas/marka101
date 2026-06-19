// src/features/diagnoses/components/public/DiagnosisWizard.tsx
// Tam diagnosis akışı: intro → context → core → sectorIntro → sector
//   → trigger → openEnded → loading → preScore → leadForm → fullReport
"use client";

import { useRouter } from "next/navigation";

import { useState, useRef, useEffect, useCallback } from "react";
import { CONTEXT_QUESTIONS, CORE_QUESTIONS, SECTOR_MODULES, OPEN_ENDED_QUESTIONS } from "../../data";
import { buildTestFlow, calculateCategoryScores, selectTriggers, calculateDiagnosisResult } from "../../scoring/engine";
import type {
  BrandContext, DiagnosisAnswerValue, DiagnosisQuestion,
  DiagnosisScores, DiagnosisOpenEnded, SectorKey, BusinessModel, BrandStage,
} from "../../diagnosis-types";
import { DiagnosisProgress } from "./DiagnosisProgress";
import { QuestionCard }       from "./QuestionCard";
import { LoadingScreen }      from "./LoadingScreen";
import { PreScoreScreen }     from "./PreScoreScreen";
import { LeadFormScreen }     from "./LeadFormScreen";
import { FullReportScreen }   from "./FullReportScreen";

type WizardScreen =
  | "intro" | "context" | "core" | "sectorIntro" | "sector"
  | "trigger" | "openEnded" | "loading" | "preScore" | "leadForm" | "fullReport";

const VALID_SECTORS      = ["health","realestate","b2b_industrial","general"] as const;
const VALID_BIZ_MODELS   = ["b2b","b2c","hybrid_b2c","hybrid_b2b"] as const;
const VALID_BRAND_STAGES = ["startup","growth","corporate","premium","repositioning"] as const;

function isSectorKey(v: unknown): v is SectorKey {
  return typeof v === "string" && (VALID_SECTORS as readonly string[]).includes(v);
}
function isBusinessModel(v: unknown): v is BusinessModel {
  return typeof v === "string" && (VALID_BIZ_MODELS as readonly string[]).includes(v);
}
function isBrandStage(v: unknown): v is BrandStage {
  return typeof v === "string" && (VALID_BRAND_STAGES as readonly string[]).includes(v);
}

function getSectorKey(v: unknown): SectorKey {
  if (v === "health" || v === "realestate" || v === "b2b_industrial") return v;
  return "general";
}

function getBusinessModel(v: unknown): BusinessModel {
  if (v === "b2b" || v === "b2c" || v === "hybrid_b2c" || v === "hybrid_b2b") return v as BusinessModel;
  return "b2c";
}

function buildBrandContext(ca: Readonly<Record<string, DiagnosisAnswerValue>>): BrandContext | null {
  const sector = getSectorKey(ca["BG-01"]);
  const businessModel = getBusinessModel(ca["BG-02"]);
  const brandStage = ca["BG-03"] as BrandStage;
  const growthGoal = ca["BG-04"];
  const mainProblem = ca["BG-05"];
  if (!isSectorKey(sector) || !isBusinessModel(businessModel) || !isBrandStage(brandStage) ||
      typeof growthGoal !== "string" || typeof mainProblem !== "string") return null;
  return { sector, businessModel, brandStage, growthGoal, mainProblem };
}

function isAutoAdvanceType(q: DiagnosisQuestion): boolean {
  return q.type === "scale" || q.type === "evidence" || q.type === "singleSelect";
}

const CORE_CAT_LABELS: Record<string, string> = {
  brandClarity:"Marka Netliği", premiumPerception:"Premium Algı",
  storytelling:"Storytelling Gücü", digitalTrust:"Dijital Güven", creativeSystem:"Kreatif Sistem",
};
function getCoreLabel(idx: number): string {
  return CORE_CAT_LABELS[CORE_QUESTIONS[idx]?.category ?? ""] ?? "Soru";
}

// ── Wrapper container ─────────────────────────────────────────
function Container({ children }: { children: React.ReactNode }) {
  return <div className="max-w-2xl mx-auto px-4 py-10">{children}</div>;
}

export function DiagnosisWizard() {
  const router = useRouter();
  const [screen, setScreen] = useState<WizardScreen>("context");
  const [contextIdx,   setContextIdx]   = useState(0);
  const [coreIdx,      setCoreIdx]      = useState(0);
  const [sectorIdx,    setSectorIdx]    = useState(0);
  const [triggerIdx,   setTriggerIdx]   = useState(0);
  const [openEndedIdx, setOpenEndedIdx] = useState(0);
  const [contextAnswers, setContextAnswers] = useState<Record<string, DiagnosisAnswerValue>>({});
  const [answers, setAnswers]               = useState<Record<string, DiagnosisAnswerValue>>({});
  const [openEndedAnswers, setOpenEndedAnswers] = useState<DiagnosisOpenEnded>({});
  const [brandContext,     setBrandContext]     = useState<BrandContext | null>(null);
  const [sectorQuestions,  setSectorQuestions]  = useState<DiagnosisQuestion[]>([]);
  const [triggerQuestions, setTriggerQuestions] = useState<DiagnosisQuestion[]>([]);
  const [scores,   setScores]   = useState<DiagnosisScores | null>(null);
  const [leadId,   setLeadId]   = useState<string | null>(null);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);
  const schedule = useCallback((fn: () => void, delay = 250) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(fn, delay);
  }, []);

  const countQuestionsServed = useCallback((tqs: DiagnosisQuestion[]): number =>
    CORE_QUESTIONS.length + sectorQuestions.length + tqs.length + OPEN_ENDED_QUESTIONS.length,
    [sectorQuestions.length]);

  function getHasUrlAnswer(ans: Record<string, DiagnosisAnswerValue>): boolean {
    const v = ans["TR-DG"];
    return typeof v === "string" && v.trim().length > 0;
  }

  const runScoring = useCallback((
    ctx: BrandContext, finalAns: Record<string, DiagnosisAnswerValue>,
    finalOE: DiagnosisOpenEnded, tqs: DiagnosisQuestion[]
  ) => {
    setScreen("loading");
    timerRef.current = setTimeout(() => {
      const result = calculateDiagnosisResult({
        context: ctx, answers: finalAns, openEnded: finalOE,
        questionsServed: countQuestionsServed(tqs), hasUrlAnswer: getHasUrlAnswer(finalAns),
      });
      setScores(result);
      setScreen("preScore");
    }, 1500);
  }, [countQuestionsServed]);

  // ── Handlers ─────────────────────────────────────────────────
  const handleContextChange = useCallback((value: DiagnosisAnswerValue) => {
    const q = CONTEXT_QUESTIONS[contextIdx]; if (!q) return;
    const newCA = { ...contextAnswers, [q.id]: value };
    setContextAnswers(newCA);
    if (!isAutoAdvanceType(q)) return;
    schedule(() => {
      if (contextIdx < CONTEXT_QUESTIONS.length - 1) { setContextIdx(p => p + 1); return; }
      const ctx = buildBrandContext(newCA);
      if (!ctx) { console.warn("BrandContext oluşturulamadı."); return; }
      const flow = buildTestFlow(ctx);
      setBrandContext(ctx); setSectorQuestions([...flow.sectorQuestions]);
      setScreen("core"); setCoreIdx(0);
    });
  }, [contextIdx, contextAnswers, schedule]);

  const handleContextNext = useCallback(() => {
    if (contextIdx < CONTEXT_QUESTIONS.length - 1) { setContextIdx(p => p + 1); return; }
    const ctx = buildBrandContext(contextAnswers); if (!ctx) return;
    const flow = buildTestFlow(ctx);
    setBrandContext(ctx); setSectorQuestions([...flow.sectorQuestions]);
    setScreen("core"); setCoreIdx(0);
  }, [contextIdx, contextAnswers]);

  const handleCoreChange = useCallback((value: DiagnosisAnswerValue) => {
    const q = CORE_QUESTIONS[coreIdx]; if (!q) return;
    const newAns = { ...answers, [q.id]: value };
    setAnswers(newAns);
    if (!isAutoAdvanceType(q)) return;
    schedule(() => {
      if (coreIdx < CORE_QUESTIONS.length - 1) setCoreIdx(p => p + 1);
      else setScreen("sectorIntro");
    });
  }, [coreIdx, answers, schedule]);

  const handleCoreNext = useCallback(() => {
    if (coreIdx < CORE_QUESTIONS.length - 1) setCoreIdx(p => p + 1);
    else setScreen("sectorIntro");
  }, [coreIdx]);

  const advanceFromSector = useCallback((currentAnswers: Record<string, DiagnosisAnswerValue>) => {
    if (!brandContext) return;
    const catScores = calculateCategoryScores(currentAnswers);
    const tqs = selectTriggers(catScores, currentAnswers, brandContext.sector, 2);
    setTriggerQuestions(tqs); setTriggerIdx(0);
    if (tqs.length > 0) setScreen("trigger");
    else { setOpenEndedIdx(0); setScreen("openEnded"); }
  }, [brandContext]);

  const handleSectorChange = useCallback((value: DiagnosisAnswerValue) => {
    const q = sectorQuestions[sectorIdx]; if (!q) return;
    const newAns = { ...answers, [q.id]: value };
    setAnswers(newAns);
    if (!isAutoAdvanceType(q)) return;
    schedule(() => {
      if (sectorIdx < sectorQuestions.length - 1) setSectorIdx(p => p + 1);
      else advanceFromSector(newAns);
    });
  }, [sectorIdx, sectorQuestions, answers, schedule, advanceFromSector]);

  const handleSectorNext = useCallback(() => {
    if (sectorIdx < sectorQuestions.length - 1) setSectorIdx(p => p + 1);
    else advanceFromSector(answers);
  }, [sectorIdx, sectorQuestions.length, answers, advanceFromSector]);

  const handleTriggerChange = useCallback((value: DiagnosisAnswerValue) => {
    const q = triggerQuestions[triggerIdx]; if (!q) return;
    const newAns = { ...answers, [q.id]: value };
    setAnswers(newAns);
    if (!isAutoAdvanceType(q)) return;
    schedule(() => {
      if (triggerIdx < triggerQuestions.length - 1) setTriggerIdx(p => p + 1);
      else { setOpenEndedIdx(0); setScreen("openEnded"); }
    });
  }, [triggerIdx, triggerQuestions, answers, schedule]);

  const handleTriggerNext = useCallback(() => {
    if (triggerIdx < triggerQuestions.length - 1) setTriggerIdx(p => p + 1);
    else { setOpenEndedIdx(0); setScreen("openEnded"); }
  }, [triggerIdx, triggerQuestions.length]);

  const handleOpenEndedChange = useCallback((value: DiagnosisAnswerValue) => {
    const q = OPEN_ENDED_QUESTIONS[openEndedIdx]; if (!q) return;
    const key = q.id as keyof DiagnosisOpenEnded;
    if (key !== "AUC-01" && key !== "AUC-02") return;
    setOpenEndedAnswers(prev => ({ ...prev, [key]: typeof value === "string" ? value : "" }));
  }, [openEndedIdx]);

  const handleOpenEndedNext = useCallback(() => {
    if (openEndedIdx < OPEN_ENDED_QUESTIONS.length - 1) { setOpenEndedIdx(p => p + 1); return; }
    if (!brandContext) return;
    runScoring(brandContext, answers, openEndedAnswers, triggerQuestions);
  }, [openEndedIdx, brandContext, answers, openEndedAnswers, triggerQuestions, runScoring]);

  function getOpenEndedValue(): DiagnosisAnswerValue | undefined {
    const q = OPEN_ENDED_QUESTIONS[openEndedIdx]; if (!q) return undefined;
    return openEndedAnswers[q.id as keyof DiagnosisOpenEnded];
  }

  const handleBack = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    switch (screen) {
      case "context":
        if (contextIdx > 0) setContextIdx(p => p - 1); else { void router.push('/marka101'); } break;
      case "core":
        if (coreIdx > 0) setCoreIdx(p => p - 1);
        else { setContextIdx(CONTEXT_QUESTIONS.length - 1); setScreen("context"); } break;
      case "sectorIntro": setCoreIdx(CORE_QUESTIONS.length - 1); setScreen("core"); break;
      case "sector":
        if (sectorIdx > 0) setSectorIdx(p => p - 1); else setScreen("sectorIntro"); break;
      case "trigger":
        if (triggerIdx > 0) setTriggerIdx(p => p - 1);
        else { setSectorIdx(sectorQuestions.length - 1); setScreen("sector"); } break;
      case "openEnded":
        if (openEndedIdx > 0) setOpenEndedIdx(p => p - 1);
        else if (triggerQuestions.length > 0) { setTriggerIdx(triggerQuestions.length - 1); setScreen("trigger"); }
        else { setSectorIdx(sectorQuestions.length - 1); setScreen("sector"); } break;
      case "preScore": setOpenEndedIdx(OPEN_ENDED_QUESTIONS.length - 1); setScreen("openEnded"); break;
      case "leadForm": setScreen("preScore"); break;
      case "fullReport": setScreen("preScore"); break;
      default: break;
    }
  }, [screen, contextIdx, coreIdx, sectorIdx, triggerIdx, openEndedIdx, triggerQuestions.length, sectorQuestions.length]);

  // ── Renders ───────────────────────────────────────────────────


  if (screen === "context") {
    const q = CONTEXT_QUESTIONS[contextIdx]; if (!q) return null;
    return (
      <Container>
        <div className="mb-8"><DiagnosisProgress current={contextIdx + 1} total={CONTEXT_QUESTIONS.length} label="Bağlam Soruları" /></div>
        <QuestionCard question={q} value={contextAnswers[q.id]} onChange={handleContextChange}
          onNext={handleContextNext} onBack={handleBack} canGoBack={true}
          isLast={contextIdx === CONTEXT_QUESTIONS.length - 1} />
      </Container>
    );
  }

  if (screen === "core") {
    const q = CORE_QUESTIONS[coreIdx]; if (!q) return null;
    return (
      <Container>
        <div className="mb-8"><DiagnosisProgress current={coreIdx + 1} total={CORE_QUESTIONS.length} label={getCoreLabel(coreIdx)} /></div>
        <QuestionCard question={q} value={answers[q.id]} onChange={handleCoreChange}
          onNext={handleCoreNext} onBack={handleBack} canGoBack={true}
          isLast={coreIdx === CORE_QUESTIONS.length - 1} />
      </Container>
    );
  }

  if (screen === "sectorIntro") {
    const sector = brandContext?.sector ?? "general";
    const mod = SECTOR_MODULES[sector];
    return (
      <Container>
        <div className="bg-surface-container-lowest rounded-lg premium-shadow border border-surface-container p-8 md:p-12">
          <span className="text-label-lg text-primary uppercase tracking-widest block mb-4">Sektör Değerlendirmesi</span>
          <h2 className="text-headline-lg font-bold text-on-background mb-4">{mod.label}</h2>
          <p className="text-body-md text-secondary mb-6 leading-relaxed">{mod.contextComment}</p>
          <div className="mb-6">
            <p className="text-label-md text-outline uppercase tracking-widest mb-3">Bu bölümde ölçülecek</p>
            <ul className="space-y-2">
              {(mod.criticalIndicators as readonly string[]).map((ind: string, i: number) => (
                <li key={i} className="flex items-start gap-3 text-body-md text-on-surface-variant">
                  <span className="text-primary mt-0.5">◈</span>{ind}
                </li>
              ))}
            </ul>
          </div>
          <p className="text-label-md text-secondary opacity-60 mb-6">3 soru · 1–2 dakika</p>
          <div className="flex gap-3">
            <button type="button" onClick={handleBack}
              className="px-6 py-3 rounded-full border border-primary text-primary text-label-lg hover:bg-primary-fixed transition-colors">
              ← Geri
            </button>
            <button type="button" onClick={() => { setSectorIdx(0); setScreen("sector"); }}
              className="flex-1 py-3 rounded-full bg-primary text-on-primary text-label-lg hover:opacity-90 transition-all">
              Devam Et →
            </button>
          </div>
        </div>
      </Container>
    );
  }

  if (screen === "sector") {
    const q = sectorQuestions[sectorIdx]; if (!q) return null;
    const mod = SECTOR_MODULES[brandContext?.sector ?? "general"];
    return (
      <Container>
        <div className="mb-8"><DiagnosisProgress current={sectorIdx + 1} total={sectorQuestions.length} label={mod.label} /></div>
        <QuestionCard question={q} value={answers[q.id]} onChange={handleSectorChange}
          onNext={handleSectorNext} onBack={handleBack} canGoBack={true}
          isLast={sectorIdx === sectorQuestions.length - 1} />
      </Container>
    );
  }

  if (screen === "trigger") {
    const q = triggerQuestions[triggerIdx]; if (!q) return null;
    return (
      <Container>
        <div className="mb-8"><DiagnosisProgress current={triggerIdx + 1} total={triggerQuestions.length} label="Derinleştirici Sorular" /></div>
        <QuestionCard question={q} value={answers[q.id]} onChange={handleTriggerChange}
          onNext={handleTriggerNext} onBack={handleBack} canGoBack={true}
          isLast={triggerIdx === triggerQuestions.length - 1} />
      </Container>
    );
  }

  if (screen === "openEnded") {
    const q = OPEN_ENDED_QUESTIONS[openEndedIdx]; if (!q) return null;
    return (
      <Container>
        <div className="mb-6 space-y-2">
          <DiagnosisProgress current={openEndedIdx + 1} total={OPEN_ENDED_QUESTIONS.length} label="Kişisel Yönelim" />
          <p className="text-label-md text-secondary">Bu sorular skorunuzu değiştirmiyor; analizinizin derinliğini belirliyor.</p>
        </div>
        <QuestionCard question={q} value={getOpenEndedValue()} onChange={handleOpenEndedChange}
          onNext={handleOpenEndedNext} onBack={handleBack} canGoBack={true}
          isLast={openEndedIdx === OPEN_ENDED_QUESTIONS.length - 1} />
      </Container>
    );
  }

  if (screen === "loading") {
    return <Container><LoadingScreen /></Container>;
  }

  if (screen === "preScore" && scores !== null) {
    return <PreScoreScreen scores={scores} onContinue={() => setScreen("leadForm")} onBack={handleBack} />;
  }

  if (screen === "leadForm" && scores !== null && brandContext !== null) {
    return (
      <LeadFormScreen
        context={brandContext} answers={answers} openEnded={openEndedAnswers}
        scores={scores} questionsServed={countQuestionsServed(triggerQuestions)}
        onSuccess={(id) => { setLeadId(id); setScreen("fullReport"); }}
        onBack={handleBack}
      />
    );
  }

  if (screen === "fullReport" && scores !== null && brandContext !== null) {
    return <FullReportScreen scores={scores} context={brandContext} leadId={leadId} onBack={handleBack} />;
  }

  return null;
}
