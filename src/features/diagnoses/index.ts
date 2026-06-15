// src/features/diagnoses/index.ts
// Tek temiz public API. Duplicate export yok.

export * from './types'

export type {
  CategoryKey,
  SectorKey,
  BusinessModel,
  BrandStage,
  Confidence,
  LeadSegment,
  DiagnosisQuestion,
  DiagnosisAnswerValue,
  DiagnosisAnswers,
  DiagnosisOpenEnded,
  DiagnosisScores,
  BrandContext,
  TestFlow,
  DiagnosisInput,
  DiagnosisPublicSubmission,
  RiskLevel as DiagnosisEngineRiskLevel,
  ImplementedAction,
  LearningIntelligence,
} from './diagnosis-types'

export {
  getDiagnosesList,
  getDiagnosisById,
  getSectorBenchmark,
  getLearningIntelligence,
} from './lib/queries'

export {
  submitPublicDiagnosis,
  submitDiagnosisWithContact,
  getAllDiagnoses,
  createManualDiagnosis,
  type ManualDiagnosisInput,
  saveAnalysisProgress,
  saveInternalAnalysis,
  generateClaudeReport,
  updateDiagnosisStatus,
  saveLearningIntelligence,
  updateReportLockStatus,
  deleteDiagnosis,
} from './lib/actions'

export {
  CATEGORIES,
  CATEGORY_ORDER,
  CATEGORY_WEIGHTS,
  CONTEXT_QUESTIONS,
  CORE_QUESTIONS,
  SECTOR_MODULES,
  OPEN_ENDED_QUESTIONS,
} from './data'

export {
  buildTestFlow,
  calculateCategoryScores,
  selectTriggers,
  calculateDiagnosisResult,
  determineRiskLevel,
} from './scoring/engine'
