import { getDiagnosesList, type Diagnosis } from '@/features/diagnoses';
import { PanelManager } from '@/features/diagnoses/components/studio/PanelManager';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Panel — Deep Creative Studio' };

export default async function StudioPanelPage() {
  let diagnoses: Diagnosis[] = [];
  try {
    diagnoses = await getDiagnosesList();
  } catch (err) {
    console.error('[StudioPanelPage] Error fetching diagnoses:', err);
  }

  return (
    <div className="w-full px-2 py-4 relative">
      <div className="mb-6 no-print">
        <h1 className="text-2xl font-black text-gray-800 tracking-tight">Yönetici Paneli</h1>
        <p className="text-xs text-gray-400 mt-1">
          Marka Teşhis Merkezi, Kök Sebep Analizi, Tedavi Planı ve Teklif Motoru yönetim modülleri
        </p>
      </div>
      <PanelManager diagnoses={diagnoses} />
    </div>
  );
}
