// src/app/(studio)/studio/marka101/validation/page.tsx
import Link from 'next/link';
import { getDiagnosesList } from '@/features/diagnoses';
import type { Diagnosis } from '@/features/diagnoses';
import { ValidationDashboard } from '@/features/diagnoses/components/studio/ValidationDashboard';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Doğrulama Paneli — Deep Creative Studio' };

export default async function ValidationPage() {
  let diagnoses: Diagnosis[] = [];
  try {
    diagnoses = await getDiagnosesList();
  } catch (err) {
    console.error('[ValidationPage] Error loading diagnoses:', err);
    diagnoses = [];
  }

  return (
    <div className="w-full space-y-6 animate-fade-in-up pb-12 text-gray-700 px-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <Link
            href="/studio/marka101"
            className="text-xs font-bold text-gray-400 hover:text-gray-600 mb-1 inline-flex items-center gap-1 transition-colors"
          >
            ← Başvurulara Dön
          </Link>
          <h1 className="text-xl font-black text-gray-800 tracking-tight">Ürün Doğrulama ve Sonuç Paneli (Validation)</h1>
          <p className="text-xs text-gray-400 mt-1">
            Önerilen müdahalelerin ve teşhislerin gerçek hayattaki 30 günlük başarı durumlarının takibi.
          </p>
        </div>
      </div>

      <ValidationDashboard diagnoses={diagnoses} />
    </div>
  );
}
