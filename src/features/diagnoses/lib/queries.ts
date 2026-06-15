// src/features/diagnoses/lib/queries.ts
// Server-side sorgular — sadece authenticated kullanıcı erişebilir

import { createClient } from '@/lib/supabase/server';
import type { Diagnosis } from '../types';

export async function getDiagnosesList(): Promise<Diagnosis[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('diagnoses')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as Diagnosis[];
}

export async function getDiagnosisById(id: string): Promise<Diagnosis | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('diagnoses')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(error.message);
  }
  return data as unknown as Diagnosis;
}

// ── getSectorBenchmark ─────────────────────────────────────────────

export async function getSectorBenchmark(
  sector: string
): Promise<{ avgScore: number; count: number }> {
  const supabase = createClient();

  // Fetch all diagnoses that have an overall health score
  const { data: allScored, error } = await supabase
    .from('diagnoses')
    .select('overall_health_score, public_submission')
    .not('overall_health_score', 'is', null);

  if (error || !allScored) {
    console.error('[getSectorBenchmark]', error);
    return { avgScore: 0, count: 0 };
  }

  // Filter in memory for maximum robustness across different public_submission structures
  const sectorMatches = allScored.filter((d) => {
    const sub = d.public_submission as any;
    const s = sub?.brandContext?.sector ?? sub?.sector;
    return s === sector;
  });

  const count = sectorMatches.length;

  if (count === 0) {
    // Fallback: Global average of all scored diagnoses
    const globalCount = allScored.length;
    if (globalCount === 0) return { avgScore: 0, count: 0 };
    const globalSum = allScored.reduce((acc, curr) => acc + (Number(curr.overall_health_score) || 0), 0);
    return {
      avgScore: Math.round((globalSum / globalCount) * 10) / 10,
      count: 0, // 0 competitors in the same sector
    };
  }

  const sum = sectorMatches.reduce((acc, curr) => acc + (Number(curr.overall_health_score) || 0), 0);
  return {
    avgScore: Math.round((sum / count) * 10) / 10,
    count,
  };
}

import type { LearningIntelligence } from '../diagnosis-types';

export function getLearningIntelligence(diagnosis: Diagnosis): LearningIntelligence | null {
  if (diagnosis.learning_intelligence && Object.keys(diagnosis.learning_intelligence).length > 0) {
    return diagnosis.learning_intelligence;
  }
  const internal = diagnosis.internal_analysis as any;
  if (internal && internal.learning_intelligence) {
    return internal.learning_intelligence as LearningIntelligence;
  }
  return null;
}
