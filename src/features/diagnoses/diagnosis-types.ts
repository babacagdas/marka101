// src/features/diagnoses/diagnosis-types.ts
// Diagnosis soru ve skor sistemi tipleri.
// DB kayıt tipleri için: ./types.ts

export type CategoryKey =
  | "brandClarity"
  | "premiumPerception"
  | "storytelling"
  | "digitalTrust"
  | "creativeSystem";

export type QuestionType =
  | "scale" | "evidence" | "singleSelect"
  | "multiSelect" | "url" | "openEnded";

export type QuestionLayer =
  | "context" | "core" | "sector" | "trigger" | "openEnded";

export type SectorKey =
  | "health" | "realestate" | "b2b_industrial" | "general";

export type BusinessModel = "b2b" | "b2c" | "hybrid";

export type BrandStage =
  | "startup" | "growth" | "corporate" | "premium" | "repositioning";

export type RiskLevel = "critical" | "high" | "medium" | "low" | "strong";

export type BrandTypeKey =
  | "UNPOSITIONED" | "INVISIBLE" | "INCONSISTENT" | "PRIMED" | "POSITIONED";

export type LeadSegment = "hot" | "warm" | "nurture" | "qualify";

export type Confidence = "high" | "medium" | "low";

export type EvidenceAnswer = "evet" | "kısmen" | "hayır";
export type ScaleAnswer = 1 | 2 | 3 | 4 | 5;

export type DiagnosisAnswerValue =
  | ScaleAnswer | EvidenceAnswer | string | string[];

export type DiagnosisAnswers = Readonly<Record<string, DiagnosisAnswerValue>>;

export interface DiagnosisOpenEnded {
  readonly "AUC-01"?: string;
  readonly "AUC-02"?: string;
}

export interface BrandContext {
  readonly sector: SectorKey;
  readonly businessModel: BusinessModel;
  readonly brandStage: BrandStage;
  readonly growthGoal: string;
  readonly mainProblem: string;
}

export interface QuestionOption {
  readonly value: string | number;
  readonly label: string;
  readonly score?: number;
  readonly sectorKey?: SectorKey;
}

export interface DiagnosisQuestion {
  readonly id: string;
  readonly layer: QuestionLayer;
  readonly category?: CategoryKey;
  readonly type: QuestionType;
  readonly weight: 1 | 2 | 3;
  readonly title: string;
  readonly text: string;
  readonly tooltip: string;
  readonly options?: readonly QuestionOption[];
  readonly reverseScored?: boolean;
  readonly maxSelect?: number;
  readonly optional?: boolean;
  readonly contributesToScore?: boolean;
  readonly scoreCategory?: CategoryKey;
}

export interface SectorModule {
  readonly sector: SectorKey;
  readonly label: string;
  readonly contextComment: string;
  readonly criticalIndicators: readonly string[];
  readonly questions: readonly DiagnosisQuestion[];
}

export type TriggerConditionOperator = "lte" | "gte";

export interface TriggerCondition {
  readonly target: string;
  readonly threshold: number;
  readonly operator: TriggerConditionOperator;
  readonly targetType: "category_normalized" | "answer_value";
}

export interface TriggerQuestionDef {
  readonly triggerType: "core" | "sector";
  readonly forCategory?: CategoryKey;
  readonly forSector?: SectorKey;
  readonly condition: TriggerCondition;
  readonly contributesToScore: boolean;
  readonly scoreCategory?: CategoryKey;
  readonly question: DiagnosisQuestion;
}

export interface CategoryScore {
  readonly key: CategoryKey;
  readonly label: string;
  readonly rawScore: number;
  readonly maxScore: number;
  readonly normalizedScore: number;
  readonly riskLevel: RiskLevel;
  readonly answeredQuestions: number;
  readonly totalQuestions: number;
}

export interface BrandType {
  readonly key: BrandTypeKey;
  readonly label: string;
}

export interface RiskLabel {
  readonly active: boolean;
  readonly primary: string | null;
  readonly secondary: readonly string[];
  readonly criticalCategories: readonly CategoryKey[];
}

export interface ImbalanceAlert {
  readonly active: boolean;
  readonly maxGap: number;
  readonly highCategory: CategoryKey | null;
  readonly lowCategory: CategoryKey | null;
}

export interface ConflictSignal {
  readonly id: string;
  readonly label: string;
  readonly description: string;
}

export interface ActiveSignal {
  readonly key: string;
  readonly label: string;
  readonly category: CategoryKey | "sector";
  readonly evidence: string;
}

export interface ActiveDiagnosis {
  readonly key: string;
  readonly label: string;
  readonly category: CategoryKey | "sector";
  readonly active: boolean;
  readonly findings: readonly string[];
  readonly signals: readonly string[];
  readonly severity?: RiskLevel;
}

export interface ConfidenceExplanation {
  readonly score: number; // 0-100
  readonly reasons: readonly string[];
}

export interface ExplainableDiagnosisLayer {
  readonly activeSignals: readonly ActiveSignal[];
  readonly activeDiagnoses: readonly ActiveDiagnosis[];
  readonly confidenceDetails: ConfidenceExplanation;
}

export interface TreatmentStep {
  readonly stepNumber: number;
  readonly title: string;
  readonly description: string;
}

export interface TreatmentPlan {
  readonly diagnosisKey: string;
  readonly title: string;
  readonly steps: readonly TreatmentStep[];
}

export interface PriorityMetrics {
  readonly impactScore: number;    // 0-100
  readonly urgencyScore: number;   // 0-100
  readonly readinessScore: number; // 0-100
  readonly totalPriority: number;  // Combined sorting score
}

export interface WrongSequenceWarning {
  readonly key: string;
  readonly title: string;
  readonly warningMessage: string;
  readonly blockers: readonly string[]; // Active diagnoses keys
  readonly targetAction: string;
}

export interface MeetingQuestion {
  readonly id: string;
  readonly questionText: string;
  readonly diagnosisKey: string;
  readonly objective: string;
}

export interface TreatmentIntelligence {
  readonly priorityDiagnosisKey: string | null;
  readonly treatmentPlans: readonly TreatmentPlan[];
  readonly priorityMetrics: Record<string, PriorityMetrics>;
  readonly wrongSequenceWarnings: readonly WrongSequenceWarning[];
  readonly strategicRoadmap: readonly { readonly diagnosisKey: string; readonly label: string }[];
  readonly meetingQuestions: readonly MeetingQuestion[];
}

export interface DiagnosisScores {
  readonly brandHealth: number;
  readonly sectorFit: number;
  readonly salesReadiness: number;
  readonly premiumPotential: number;
  readonly creativePartnershipFit: number;
  readonly leadQuality: number;
  readonly leadSegment: LeadSegment;
  readonly categories: Readonly<Record<CategoryKey, CategoryScore>>;
  readonly brandType: BrandType;
  readonly riskLabels: RiskLabel;
  readonly imbalanceAlert: ImbalanceAlert;
  readonly conflictSignals: readonly ConflictSignal[];
  readonly strongestCategory: CategoryScore;
  readonly weakestCategory: CategoryScore;
  readonly confidence: Confidence;
  readonly explainability?: ExplainableDiagnosisLayer;
  readonly treatmentIntelligence?: TreatmentIntelligence;
}

export interface TestFlow {
  readonly contextQuestions: readonly DiagnosisQuestion[];
  readonly coreQuestions: readonly DiagnosisQuestion[];
  readonly sectorQuestions: readonly DiagnosisQuestion[];
  triggerQuestions: DiagnosisQuestion[];
  readonly openEndedQuestions: readonly DiagnosisQuestion[];
  readonly sector: SectorKey;
}

export interface ImplementedAction {
  stepNumber: number;
  title: string;
  implemented: boolean;
  implementedAt?: string;
}

export interface LearningIntelligence {
  activeDiagnoses: { key: string; label: string }[];
  recommendedPlan?: {
    diagnosisKey: string;
    title: string;
  };
  implementedActions: ImplementedAction[];
  resultStatus: 'not_started' | 'in_progress' | 'successful' | 'partially_successful' | 'failed';
  learningNotes: string;
  thirtyDayOutcome?: string;
  thirtyDayCompletedAt?: string;
  updatedAt?: string;
}

export interface DiagnosisInput {
  readonly context: BrandContext;
  readonly answers: DiagnosisAnswers;
  readonly openEnded: DiagnosisOpenEnded;
  readonly questionsServed: number;
  readonly hasUrlAnswer?: boolean;
  readonly customerProfile?: string;
  readonly postsRegularly?: boolean;
  readonly socialMediaActive?: boolean;
}

// public_submission jsonb yapısı — anon form submit'ten yazılır
export interface DiagnosisPublicSubmission {
  readonly brandContext: BrandContext;
  readonly contextAnswers:   Record<string, DiagnosisAnswerValue>;
  readonly coreAnswers:      Record<string, DiagnosisAnswerValue>;
  readonly sectorAnswers:    Record<string, DiagnosisAnswerValue>;
  readonly triggerAnswers:   Record<string, DiagnosisAnswerValue>;
  readonly openEndedAnswers: DiagnosisOpenEnded;
  readonly scores: {
    readonly brandHealth:         number;
    readonly sectorFit:           number;
    readonly salesReadiness:      number;
    readonly premiumPotential:    number;
    readonly leadQuality:         number;
    readonly leadSegment:         string;
    readonly brandType:           { key: string; label: string };
    readonly weakestCategory:     { key: string; label: string; normalizedScore: number };
    readonly strongestCategory:   { key: string; label: string; normalizedScore: number };
    readonly categories:          Record<string, { normalizedScore: number; riskLevel: string }>;
    readonly riskLabels:          { active: boolean; primary: string | null };
    readonly imbalanceAlert:      { active: boolean; maxGap: number };
    readonly conflictSignals:     ReadonlyArray<{ id: string; label: string }>;
    readonly explainability?:     ExplainableDiagnosisLayer;
    readonly treatmentIntelligence?: TreatmentIntelligence;
  };
  readonly questionsServed: number;
  readonly completionRate:  number;
  readonly confidence:      string;
  readonly completedAt:     string;
}
