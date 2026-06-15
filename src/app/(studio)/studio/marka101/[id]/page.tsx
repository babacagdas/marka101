// src/app/(studio)/studio/marka101/[id]/page.tsx
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getDiagnosisById, DiagnosisStatus } from '@/features/diagnoses';
import { SubmissionReader } from '@/features/diagnoses/components/studio/SubmissionReader';

export const dynamic = 'force-dynamic';

interface Props { readonly params: { readonly id: string } }

export async function generateMetadata({ params }: Props) {
  const d = await getDiagnosisById(params.id);
  return { title: d ? `${d.brand_name} — Studio` : 'Başvuru' };
}

const STATUS_LABELS: Record<string, string> = {
  new: 'Yeni Başvuru',
  in_review: 'İncelemede',
  analyzed: 'Analiz Edildi',
  completed: 'Tamamlandı',
  archived: 'Arşivlendi',
};

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
  in_review: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30',
  analyzed: 'bg-purple-500/10 text-purple-600 border-purple-500/30',
  completed: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
  archived: 'bg-gray-150 text-gray-500 border-gray-200',
};

export default async function StudioDetailPage({ params }: Props) {
  const diagnosis = await getDiagnosisById(params.id);
  if (!diagnosis) notFound();

  const hasScore = diagnosis.overall_health_score !== null;

  return (
    <div className="max-w-3xl mx-auto w-full space-y-6 animate-fade-in-up pb-12 text-gray-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <Link
            href="/studio/marka101"
            className="text-xs font-bold text-gray-400 hover:text-gray-600 mb-1 inline-flex items-center gap-1 transition-colors"
          >
            ← Başvurulara Dön
          </Link>
          <h1 className="text-xl font-black text-gray-800 tracking-tight">{diagnosis.brand_name}</h1>
          <div className="flex items-center gap-2 mt-2 flex-wrap text-xs">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-sm font-bold border ${STATUS_COLORS[diagnosis.status]}`}>
              {STATUS_LABELS[diagnosis.status] ?? diagnosis.status}
            </span>
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider bg-white border border-gray-150 rounded-sm px-1.5 py-0.5">
              {diagnosis.source === 'public_form' ? 'Web Formu' : 'Manuel Giriş'}
            </span>
          </div>
        </div>
        
        {hasScore ? (
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href={`/studio/marka101/${diagnosis.id}/analiz`}
              className="text-xs text-gray-500 hover:text-gray-800 font-bold border border-gray-200 bg-white rounded px-4 py-2.5 hover:bg-gray-50 transition-all text-center"
            >
              Analizi Düzenle
            </Link>
            <Link
              href={`/studio/marka101/${diagnosis.id}/sonuc`}
              className="text-xs text-white bg-gradient-to-r from-[#4f20c0] to-[#b5179e] font-bold rounded px-4 py-2.5 transition-all shadow-lg shadow-purple-500/10 text-center"
            >
              Sonuçları Gör →
            </Link>
          </div>
        ) : (
          <Link
            href={`/studio/marka101/${diagnosis.id}/analiz`}
            className="shrink-0 text-xs text-white bg-gradient-to-r from-[#4f20c0] to-[#b5179e] font-bold rounded px-5 py-2.5 transition-all shadow-md shadow-purple-500/10 text-center"
          >
            Analiz Başlat →
          </Link>
        )}
      </div>

      <SubmissionReader diagnosis={diagnosis} />
    </div>
  );
}
