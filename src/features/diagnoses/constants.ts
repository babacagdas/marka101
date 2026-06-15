// src/features/diagnoses/constants.ts

import type { DiagnosisStatus, RiskLevel } from './types';

export const STATUS_LABELS: Record<DiagnosisStatus, string> = {
  new:          'Yeni Başvuru',
  in_review:    'İncelemede',
  analyzed:     'Analiz Edildi',
  output_ready: 'Çıktı Hazır',
  completed:    'Tamamlandı',
  archived:     'Arşivlendi',
};

export const STATUS_COLORS: Record<DiagnosisStatus, string> = {
  new:          'bg-blue-100 text-blue-700',
  in_review:    'bg-yellow-100 text-yellow-700',
  analyzed:     'bg-purple-100 text-purple-700',
  output_ready: 'bg-green-100 text-green-700',
  completed:    'bg-emerald-100 text-emerald-700',
  archived:     'bg-gray-100 text-gray-500',
};

export const RISK_LABELS: Record<RiskLevel, string> = {
  low:      'Düşük Risk',
  medium:   'Orta Risk',
  high:     'Yüksek Risk',
  critical: 'Kritik Risk',
};

export const RISK_COLORS: Record<RiskLevel, string> = {
  low:      'text-green-600',
  medium:   'text-yellow-600',
  high:     'text-orange-600',
  critical: 'text-red-600',
};

export const PUBLIC_FORM_STEPS = [
  { number: 1, label: 'Temel Bilgiler' },
  { number: 2, label: 'Markanız Hakkında' },
  { number: 3, label: 'Hedef Kitle' },
  { number: 4, label: 'Dijital Varlık' },
  { number: 5, label: 'Rakipler' },
  { number: 6, label: 'Beklentiler' },
] as const;

export const PUBLIC_FORM_TOTAL_STEPS = PUBLIC_FORM_STEPS.length;
