// src/app/(studio)/studio/marka101/page.tsx
import Link from 'next/link';
import { getDiagnosesList } from '@/features/diagnoses';
import type { Diagnosis } from '@/features/diagnoses';
import { BrandListManager } from '@/features/diagnoses/components/studio/BrandListManager';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Marka101 — Deep Creative Studio' };

export default async function StudioMarka101Page() {
  let diagnoses: Diagnosis[] = [];
  try {
    diagnoses = await getDiagnosesList();
  } catch {
    diagnoses = [];
  }

  // Automatic Cleanup of Orphaned CRM Records
  try {
    const supabase = createClient();
    const activeBrandNames = new Set(diagnoses.map(d => d.brand_name.toLowerCase().trim()));

    // 1. Clean up clients that don't match any active brand name
    const { data: dbClients } = await supabase.from('clients').select('id, company_name');
    const orphanedClients = (dbClients ?? []).filter(c => !activeBrandNames.has(c.company_name.toLowerCase().trim()));
    
    if (orphanedClients.length > 0) {
      const clientIds = orphanedClients.map(c => c.id);
      const clientNames = orphanedClients.map(c => c.company_name);

      // Fetch projects for these clients
      const { data: projectsData } = await supabase
        .from('projects')
        .select('id, name')
        .in('client_id', clientIds);
      const projectNames = projectsData?.map(p => p.name) || [];

      // Delete visual library records
      await supabase.from('visual_library').delete().in('client_id', clientIds);
      // Delete finances
      await supabase.from('finances').delete().in('client_id', clientIds);
      // Delete documents
      await supabase.from('documents').delete().in('client_id', clientIds);
      // Delete meetings
      await supabase.from('meetings').delete().in('client_id', clientIds);
      
      // Delete tasks
      if (projectNames.length > 0) {
        await supabase.from('tasks').delete().in('project_name', projectNames);
      }
      for (const name of clientNames) {
        await supabase.from('tasks').delete().ilike('project_name', `%${name}%`);
      }

      // Delete projects
      await supabase.from('projects').delete().in('client_id', clientIds);
      for (const name of clientNames) {
        await supabase.from('projects').delete().eq('client_name', name);
      }

      // Delete clients
      await supabase.from('clients').delete().in('id', clientIds);
    }

    // 2. Clean up potentials/proposals that don't match active diagnoses
    const { data: potentials } = await supabase.from('potentials').select('id, diagnosis_id');
    const orphanedPotentials = (potentials ?? []).filter(p => !p.diagnosis_id || !diagnoses.some(d => d.id === p.diagnosis_id));
    if (orphanedPotentials.length > 0) {
      const potentialIds = orphanedPotentials.map(p => p.id);
      await supabase.from('proposals').delete().in('potential_id', potentialIds);
      await supabase.from('potentials').delete().in('id', potentialIds);
    }
  } catch (err) {
    console.error('[Auto Cleanup] Error:', err);
  }

  return (
    <div className="w-full space-y-6 animate-fade-in-up pb-12 text-gray-700 px-2">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h1 className="text-xl font-black text-gray-800 tracking-tight">Marka Başvuruları</h1>
          <p className="text-xs text-gray-400 mt-1">
            Ön analiz formundan gelen ve ajansınız tarafından manuel eklenen teşhis kayıtları.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/studio/marka101/validation"
            className="inline-flex items-center justify-center gap-1.5 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50 px-5 py-2.5 rounded font-bold text-xs shadow-sm transition-all"
          >
            <span className="material-symbols-outlined text-[16px]">fact_check</span> Doğrulama Paneli
          </Link>
          <Link
            href="/studio/marka101/yeni"
            className="inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-[#4f20c0] to-[#b5179e] hover:scale-[1.02] text-white px-5 py-2.5 rounded font-bold text-xs shadow-lg shadow-purple-500/10 transition-all"
          >
            <span className="material-symbols-outlined text-[16px]">add</span> Manuel Ekle
          </Link>
        </div>
      </div>

      {diagnoses.length === 0 ? (
        <div className="bg-white/20 border border-dashed border-gray-200 rounded-md py-24 text-center shadow-sm">
          <div className="flex justify-center mb-4 text-[#4f20c0]">
            <span className="material-symbols-outlined text-[48px]">assignment_turned_in</span>
          </div>
          <h3 className="font-black text-gray-800 text-base">Henüz Başvuru Bulunmuyor</h3>
          <p className="text-xs text-gray-450 mt-1 max-w-sm mx-auto px-4 leading-relaxed font-bold">
            Ziyaretçileriniz ön analiz formunu doldurduğunda veya siz manuel marka eklediğinizde kayıtlar burada listelenir.
          </p>
          <div className="mt-6 flex items-center justify-center gap-4">
            <Link
              href="/marka101"
              target="_blank"
              className="text-xs font-black text-[#4f20c0] hover:text-[#b5179e] bg-purple-50 border border-purple-100/30 px-4 py-2 rounded transition-all"
            >
              Kamuya Açık Formu Görüntüle →
            </Link>
          </div>
        </div>
      ) : (
        <BrandListManager diagnoses={diagnoses} />
      )}
    </div>
  );
}
