// src/features/diagnoses/components/studio/DiagnosisCard.tsx
import Link from 'next/link';
import type { Diagnosis } from '../../types';
import { STATUS_LABELS, STATUS_COLORS } from '../../constants';
import { Badge } from '@/components/ui/Badge';

interface DiagnosisCardProps {
  diagnosis: Diagnosis;
}

const SECTOR_LABELS: Record<string, string> = {
  health: 'Sağlık / Klinik',
  realestate: 'Gayrimenkul',
  b2b_industrial: 'B2B / Sanayi',
  general: 'Genel Hizmet',
};

const SCORE_BADGE_COLORS = (score: number) => {
  if (score < 4) return 'bg-red-50 text-red-700 border-red-200';
  if (score < 6.5) return 'bg-orange-50 text-orange-700 border-orange-200';
  if (score < 8.5) return 'bg-yellow-50 text-yellow-750 border-yellow-250';
  return 'bg-emerald-50 text-emerald-700 border-emerald-200';
};

export function DiagnosisCard({ diagnosis }: DiagnosisCardProps) {
  const submittedAt = diagnosis.submitted_at
    ? new Date(diagnosis.submitted_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })
    : new Date(diagnosis.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });

  const hasScore = diagnosis.overall_health_score !== null;
  const score = diagnosis.overall_health_score ?? 0;
  
  const sub = diagnosis.public_submission as any;
  const sector = sub?.brandContext?.sector ?? diagnosis.public_submission?.sector;
  const sectorName = SECTOR_LABELS[sector] ?? 'Genel';

  return (
    <div className="group bg-white border border-gray-150 rounded-md p-5 hover:border-gray-300 hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-full animate-fade-in-up">
      <div className="space-y-4">
        {/* Top bar: Source and Date */}
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-gray-400 uppercase">
            {diagnosis.source === 'manual' ? (
              <>
                <span className="material-symbols-outlined text-[14px] text-gray-500">edit_note</span> Manuel Kayıt
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[14px] text-blue-500">language</span> Web Formu
              </>
            )}
          </span>
          <span className="text-[10px] font-medium text-gray-400">{submittedAt}</span>
        </div>

        {/* Brand Details */}
        <div>
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-bold text-gray-900 text-base leading-snug group-hover:text-gray-950 transition-colors truncate">
              {diagnosis.brand_name}
            </h3>
            
            {hasScore && (
              <span className={`shrink-0 inline-flex items-center px-2 py-0.5 border text-xs font-bold rounded-sm ${SCORE_BADGE_COLORS(score)}`}>
                <span className="material-symbols-outlined text-[10px] mr-1">star</span> {score.toFixed(1)}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="inline-block bg-gray-50 text-gray-500 text-[10px] font-medium px-2 py-0.5 rounded-sm border border-gray-100">
              {sectorName}
            </span>
            {diagnosis.submitted_contact_name && (
              <span className="text-xs text-gray-400 truncate max-w-[150px]" title={diagnosis.submitted_contact_name}>
                {diagnosis.submitted_contact_name}
              </span>
            )}
          </div>
        </div>
        
        {/* Contact info snippets if present */}
        {diagnosis.submitted_email && (
          <div className="text-[11px] text-gray-400 truncate pt-1 border-t border-gray-50">
            {diagnosis.submitted_email}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="mt-5 pt-3 border-t border-gray-100 flex items-center gap-2">
        <Link
          href={`/studio/marka101/${diagnosis.id}`}
          className="flex-1 text-center text-xs text-gray-650 hover:text-gray-800 font-semibold border border-gray-200 rounded py-2 hover:bg-gray-50 transition-all"
        >
          Detay Gör
        </Link>
        
        {hasScore ? (
          <Link
            href={`/studio/marka101/${diagnosis.id}/sonuc`}
            className="flex-1 text-center text-xs text-emerald-700 hover:text-emerald-800 font-semibold bg-emerald-50 border border-emerald-150 rounded py-2 hover:bg-emerald-100 transition-all"
          >
            Sonuçları Gör
          </Link>
        ) : (
          <Link
            href={`/studio/marka101/${diagnosis.id}/analiz`}
            className="flex-1 text-center text-xs text-white bg-gray-900 hover:bg-gray-800 font-semibold rounded py-2 transition-all shadow-sm"
          >
            Analiz Yap
          </Link>
        )}
      </div>
    </div>
  );
}
