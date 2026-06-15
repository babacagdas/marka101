// src/app/(studio)/studio/marka101/[id]/sonuc/page.tsx
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getDiagnosisById, getSectorBenchmark } from '@/features/diagnoses';
import { recalculateDiagnosis } from '@/features/diagnoses/lib/actions';
import { ScoreCard } from '@/features/diagnoses/components/studio/ScoreCard';
import { LearningTracker } from '@/features/diagnoses/components/studio/LearningTracker';
import { GenerateReportButton } from './GenerateReportButton';
import { StatusSelector } from './StatusSelector';
import { PrintReportButton } from './PrintReportButton';
import { ReportSharingPanel } from './ReportSharingPanel';

interface Props { readonly params: { readonly id: string } }

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Sonuç — Studio' };

function parseMarkdown(md: string): string {
  if (!md) return '';
  
  return md
    .split('\n')
    .map(line => {
      const trimmed = line.trim();
      
      if (trimmed.startsWith('# ')) {
        return `<h1 class="text-2xl font-black text-white mt-2 mb-6 tracking-tight border-b border-[#221e33] pb-4">${trimmed.slice(2)}</h1>`;
      }
      if (trimmed.startsWith('## ')) {
        return `<h2 class="text-base font-black text-white mt-8 mb-4 border-b border-[#221e33] pb-2">${trimmed.slice(3)}</h2>`;
      }
      if (trimmed.startsWith('### ')) {
        return `<h3 class="text-xs font-black text-[#e81cff] mt-5 mb-2">${trimmed.slice(4)}</h3>`;
      }
      
      if (trimmed.startsWith('> ')) {
        return `<div class="border-l-4 border-[#e81cff] bg-purple-950/20 p-4 rounded-r italic my-4 text-[#c9c5d8] leading-relaxed font-semibold">${trimmed.slice(2)}</div>`;
      }
      
      if (trimmed === '---') {
        return `<hr class="my-6 border-[#221e33]" />`;
      }
      
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        return `<li class="ml-5 list-disc text-xs text-[#c9c5d8] leading-relaxed mb-1.5">${trimmed.slice(2)}</li>`;
      }
      
      if (/^\d+\.\s/.test(trimmed)) {
        const index = trimmed.indexOf(' ');
        return `<li class="ml-5 list-decimal text-xs text-[#c9c5d8] leading-relaxed mb-1.5">${trimmed.slice(index + 1)}</li>`;
      }

      if (trimmed.length === 0) {
        return '<div class="h-3"></div>';
      }
      
      return `<p class="text-xs text-[#c9c5d8] leading-relaxed mb-3 font-semibold">${trimmed}</p>`;
    })
    .join('\n')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-black text-white">$1</strong>');
}

export default async function StudioSonucPage({ params }: Props) {
  let diagnosis = await getDiagnosisById(params.id);
  if (!diagnosis) notFound();

  const sub = (diagnosis.public_submission ?? {}) as any;
  if (sub.scores && (!sub.scores.explainability || !sub.scores.treatmentIntelligence)) {
    await recalculateDiagnosis(params.id);
    const updated = await getDiagnosisById(params.id);
    if (updated) {
      diagnosis = updated;
    }
  }

  const subCurrent = (diagnosis.public_submission ?? {}) as any;
  const sector = subCurrent.brandContext?.sector ?? subCurrent.sector ?? 'general';
  const benchmark = await getSectorBenchmark(sector);

  const systemOutput = diagnosis.system_output as { markdownReport?: string; generatedAt?: string } | null;
  const hasOutput = systemOutput !== null && !!systemOutput.markdownReport;
  const formattedHtml = hasOutput ? parseMarkdown(systemOutput.markdownReport!) : '';

  const internal = (diagnosis.internal_analysis ?? {}) as any;
  const isLocked = internal.is_locked === true;

  return (
    <div className="max-w-5xl mx-auto w-full space-y-6 animate-fade-in-up pb-12 text-[#f6f5fa]">
      <Link
        href={`/studio/marka101/${diagnosis.id}`}
        className="no-print text-xs font-bold text-gray-400 hover:text-gray-200 mb-4 inline-flex items-center gap-1 transition-colors"
      >
        ← Başvuruya Dön
      </Link>
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-white">
            {diagnosis.brand_name} — Teşhis Sonucu
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Ajans değerlendirmesi ve stratejik teşhis özeti.
          </p>
        </div>
        <PrintReportButton id={diagnosis.id} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left/Sidebar: Score Card & Status */}
        <div className="space-y-6">
          <ScoreCard diagnosis={diagnosis} benchmark={benchmark} />
          <StatusSelector id={diagnosis.id} currentStatus={diagnosis.status} />
          <ReportSharingPanel id={diagnosis.id} initialIsLocked={isLocked} />
        </div>

        {/* Right: AI Report & Actions */}
        <div className="lg:col-span-2 space-y-6">
          {!hasOutput ? (
            <div className="bg-[#141221] border border-[#221e33] rounded-md p-6 md:p-8 shadow-sm space-y-4">
              <h2 className="font-black text-white text-sm">Claude Stratejik Analiz Raporu</h2>
              <p className="text-xs text-gray-400 leading-relaxed font-semibold">
                İç değerlendirme tamamlandı. Markanın form yanıtları ile ajans puanlarınızı harmanlayarak kişiselleştirilmiş ve derinlemesine bir marka strateji raporu oluşturun.
              </p>
              <GenerateReportButton id={diagnosis.id} />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-[#141221] border border-[#221e33] rounded-md p-6 md:p-8 shadow-sm text-[#c9c5d8]">
                <div 
                  className="prose prose-sm max-w-none prose-headings:text-white prose-a:text-[#e81cff] dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: formattedHtml }}
                />
              </div>

              {/* Re-generate option */}
              <div className="flex items-center justify-between bg-[#141221] border border-[#221e33] rounded-md px-5 py-4">
                <div>
                  <p className="text-xs font-bold text-white">Rapor Güncelle</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    Değerlendirmeyi değiştirdiyseniz raporu yeniden oluşturabilirsiniz.
                  </p>
                </div>
                <GenerateReportButton id={diagnosis.id} />
              </div>
            </div>
          )}

          {/* Learning Intelligence outcome tracker */}
          <div className="no-print">
            <LearningTracker diagnosis={diagnosis} />
          </div>
        </div>
      </div>
    </div>
  );
}
