// src/features/diagnoses/data/index.ts
export { CATEGORIES, CATEGORY_ORDER, CATEGORY_WEIGHTS } from './categories'
export type { CategoryMetadata } from './categories'
export { CONTEXT_QUESTIONS } from './contextQuestions'
export { CORE_QUESTIONS, getCoreQuestionsByCategory } from './coreQuestions'
export { SECTOR_MODULES } from './sectorModules'
export {
  CORE_TRIGGERS, SECTOR_TRIGGERS,
  CORE_TRIGGER_THRESHOLDS, SECTOR_TRIGGER_CONDITIONS,
} from './triggerQuestions'
export type { SectorTriggerCondition } from './triggerQuestions'
export { OPEN_ENDED_QUESTIONS } from './openEndedQuestions'
