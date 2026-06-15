// src/features/diagnoses/types.ts
import type { LearningIntelligence } from './diagnosis-types';

// ── Enum Tipleri ──────────────────────────────────────────────

export type DiagnosisStatus =
  | 'new'
  | 'in_review'
  | 'analyzed'
  | 'output_ready'
  | 'completed'
  | 'archived';

export type DiagnosisSource = 'public_form' | 'manual';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

// ── Public Form Verisi (marka doldurdu) ───────────────────────
// Bu tip ASLA studio-only alanlarla karışmaz.

export interface PublicSubmission {
  // Adım 1 — Temel Bilgiler
  sector?: string;
  city?: string;
  website_url?: string;
  instagram_url?: string;
  tiktok_url?: string;
  youtube_url?: string;
  linkedin_url?: string;
  google_business_url?: string;
  // Adım 2 — Markanız Hakkında
  what_they_sell?: string;
  main_promise?: string;
  self_description?: string;
  // Adım 3 — Hedef Kitle
  sells_to?: 'b2b' | 'b2c' | 'both';
  customer_profile?: string;
  customer_purchase_consideration?: string;
  // Adım 4 — Dijital Varlık
  has_website?: boolean;
  website_up_to_date?: 'yes' | 'no' | 'unknown';
  social_media_active?: boolean;
  posts_regularly?: boolean;
  // Adım 5 — Rakipler (opsiyonel)
  competitors?: string[];
  // Adım 6 — Beklentiler
  expectations?: string[];
  primary_goal?: string;
  monthly_budget_range?: string;
}

// Public form React state tipi (iletişim bilgilerini içerir)
export interface PublicFormData extends PublicSubmission {
  brand_name: string;         // zorunlu
  contact_name: string;       // zorunlu
  contact_email: string;      // zorunlu
  contact_phone?: string;
}

// ── Ana Veritabanı Kaydı ──────────────────────────────────────

export interface Diagnosis {
  id: string;
  status: DiagnosisStatus;
  source: DiagnosisSource;
  brand_name: string;
  submitted_email: string | null;
  submitted_phone: string | null;
  submitted_contact_name: string | null;
  submitted_at: string | null;
  public_submission: PublicSubmission | null;
  reviewed_by: string | null;
  internal_analysis: Record<string, unknown>;
  scores_detail: Record<string, unknown>;
  overall_health_score: number | null;
  lead_quality_score: number | null;
  sales_readiness_score: number | null;
  premium_potential_score: number | null;
  creative_potential_score: number | null;
  offer_potential_score: number | null;
  risk_level: RiskLevel | null;
  scores_override: Record<string, unknown> | null;
  scores_override_note: string | null;
  scores_overridden_at: string | null;
  system_output: Record<string, unknown> | null;
  learning_intelligence?: LearningIntelligence | null;
  analysis_completed_steps: number[];
  analysis_current_step: number;
  created_at: string;
  updated_at: string;
}

// Patch 02'de kullanılacak submit action için dönüş tipi
export interface SubmitResult {
  success: boolean;
  id?: string;
  error?: string;
}

// ── Diagnosis Public Submission ───────────────────────────────
// public_submission JSONB kolonuna yazılan tam diagnosis payload'u

export interface DiagnosisPublicSubmission {
  brandContext: {
    sector:        string
    businessModel: string
    brandStage:    string
    growthGoal:    string
    mainProblem:   string
  }
  contextAnswers:   Record<string, unknown>
  coreAnswers:      Record<string, unknown>
  sectorAnswers:    Record<string, unknown>
  triggerAnswers:   Record<string, unknown>
  openEndedAnswers: { 'AUC-01'?: string; 'AUC-02'?: string }
  scores: {
    brandHealth:           number
    sectorFit:             number
    salesReadiness:        number
    premiumPotential:      number
    leadQuality:           number
    leadSegment:           string
    brandType:             { key: string; label: string }
    weakestCategory:       { key: string; label: string; normalizedScore: number }
    strongestCategory:     { key: string; label: string; normalizedScore: number }
    categories:            Record<string, { normalizedScore: number; riskLevel: string }>
    riskLabels:            { active: boolean; primary: string | null }
    imbalanceAlert:        { active: boolean; maxGap: number }
    conflictSignals:       Array<{ id: string; label: string }>
  }
  questionsServed: number
  completionRate:  number
  confidence:      string
  completedAt:     string
}

