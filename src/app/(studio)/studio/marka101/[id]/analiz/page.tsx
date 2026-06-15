// src/app/(studio)/studio/marka101/[id]/analiz/page.tsx
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getDiagnosisById } from '@/features/diagnoses';
import { AnalysisWizard } from '@/features/diagnoses/components/studio/AnalysisWizard';

interface Props { readonly params: { readonly id: string } }

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Analiz — Studio' };

export default async function StudioAnalizPage({ params }: Props) {
  const diagnosis = await getDiagnosisById(params.id);
  if (!diagnosis) notFound();

  return (
    <div className="max-w-3xl mx-auto w-full space-y-6 animate-fade-in-up pb-12 text-gray-700">
      <div className="border-b border-gray-100 pb-5 mb-4">
        <Link
          href={`/studio/marka101/${diagnosis.id}`}
          className="text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors mb-1 inline-flex items-center gap-1"
        >
          ← Başvuruya Dön
        </Link>
        <h1 className="text-xl font-black text-gray-800 mt-2">
          {diagnosis.brand_name} — İç Değerlendirme
        </h1>
        <p className="text-xs text-gray-400 mt-1">Ajans iç puanlama ve analiz sihirbazı.</p>
      </div>
      <AnalysisWizard diagnosis={diagnosis} />
    </div>
  );
}
