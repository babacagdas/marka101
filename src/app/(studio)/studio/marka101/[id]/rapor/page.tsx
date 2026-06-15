// src/app/(studio)/studio/marka101/[id]/rapor/page.tsx
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getDiagnosisById, getSectorBenchmark } from '@/features/diagnoses';
import { PrintActionButton } from './PrintActionButton';


interface Props { readonly params: { readonly id: string } }

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Rapor Yazdır — Studio' };

const SECTOR_LABELS: Record<string, string> = {
  health: 'Sağlık / Klinik / Güzellik',
  realestate: 'Gayrimenkul / Mimari',
  b2b_industrial: 'B2B / Sanayi / Üretim',
  general: 'Genel Hizmet',
};

const RISK_LABELS: Record<string, string> = {
  critical: 'Kritik Risk',
  high: 'Yüksek Risk',
  medium: 'Orta Risk',
  low: 'Düşük Risk',
};

function parseMarkdown(md: string): string {
  if (!md) return '';
  
  return md
    .split('\n')
    .map(line => {
      const trimmed = line.trim();
      
      if (trimmed.startsWith('# ')) {
        return `<h1 class="text-xl font-bold text-slate-900 mt-6 mb-4 pb-2 border-b border-slate-200 tracking-tight break-after-avoid">${trimmed.slice(2)}</h1>`;
      }
      if (trimmed.startsWith('## ')) {
        return `<h2 class="text-base font-bold text-slate-800 mt-5 mb-3 pb-1 border-b border-slate-100 break-after-avoid">${trimmed.slice(3)}</h2>`;
      }
      if (trimmed.startsWith('### ')) {
        return `<h3 class="text-sm font-bold text-slate-800 mt-4 mb-2 break-after-avoid">${trimmed.slice(4)}</h3>`;
      }
      
      if (trimmed.startsWith('> ')) {
        return `<div class="border-l-4 border-slate-700 bg-slate-50 p-4 rounded-r italic my-4 text-slate-700 text-xs leading-relaxed font-medium break-inside-avoid">${trimmed.slice(2)}</div>`;
      }
      
      if (trimmed === '---') {
        return `<hr class="my-6 border-slate-200 break-inside-avoid" />`;
      }
      
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        return `<li class="ml-5 list-disc text-xs text-slate-700 leading-relaxed mb-1">${trimmed.slice(2)}</li>`;
      }
      
      if (/^\d+\.\s/.test(trimmed)) {
        const index = trimmed.indexOf(' ');
        return `<li class="ml-5 list-decimal text-xs text-slate-700 leading-relaxed mb-1">${trimmed.slice(index + 1)}</li>`;
      }

      if (trimmed.length === 0) {
        return '<div class="h-2"></div>';
      }
      
      return `<p class="text-xs text-slate-800 leading-relaxed mb-2.5 font-medium">${trimmed}</p>`;
    })
    .join('\n')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900">$1</strong>');
}

export default async function BrandReportPrintPage({ params }: Props) {
  const diagnosis = await getDiagnosisById(params.id);
  if (!diagnosis) notFound();

  const sub = (diagnosis.public_submission ?? {}) as any;
  const sector = sub.brandContext?.sector ?? sub.sector ?? 'general';
  const benchmark = await getSectorBenchmark(sector);

  const systemOutput = diagnosis.system_output as { markdownReport?: string; generatedAt?: string } | null;
  const hasOutput = systemOutput !== null && !!systemOutput.markdownReport;
  const formattedHtml = hasOutput ? parseMarkdown(systemOutput.markdownReport!) : '';

  const overall = diagnosis.overall_health_score ?? 0;

  const metrics = [
    { label: 'Premium Potansiyeli', value: diagnosis.premium_potential_score ?? 0 },
    { label: 'Satışa Hazırlık', value: diagnosis.sales_readiness_score ?? 0 },
    { label: 'Kreatif Potansiyel', value: diagnosis.creative_potential_score ?? 0 },
    { label: 'Teklif Gücü', value: diagnosis.offer_potential_score ?? 0 },
    { label: 'Müşteri Kalitesi', value: diagnosis.lead_quality_score ?? 0 },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 p-0 sm:p-8 md:p-12 print:p-0 print-container relative z-50">
      
      {/* Print Controls Header - Invisible on Paper */}
      <div className="no-print bg-slate-900 text-white rounded-md p-4 mb-8 flex justify-between items-center max-w-3xl mx-auto shadow-md">
        <div>
          <h4 className="text-xs font-bold">Rapor Baskı Ön İzleme</h4>
          <p className="text-[10px] text-slate-400 mt-0.5">Lütfen tarayıcınızın yazdırma ayarlarından "Arka plan grafikleri" seçeneğini aktif yapın.</p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/studio/marka101/${diagnosis.id}/sonuc`}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded text-xs transition-all border border-slate-700"
          >
            ← Sonuçlara Dön
          </Link>
          <PrintActionButton />
        </div>
      </div>

      {/* Printable Area Wrapper */}
      <div className="max-w-3xl mx-auto bg-white p-8 sm:p-12 border border-slate-200 print:border-0 print:p-0 shadow-lg print:shadow-none min-h-[297mm]">
        
        {/* PAGE 1: COVER PAGE */}
        <div className="flex flex-col justify-between h-[250mm] page-break print:h-[265mm]">
          {/* Cover Header */}
          <div className="flex justify-between items-center border-b-2 border-slate-900 pb-6">
            <div className="flex items-center gap-2">
              <img src="/studio-logo.png" alt="Logo" className="w-8 h-8 object-contain" />
              <span className="font-extrabold text-sm tracking-wider text-slate-950">DEEP CREATIVE</span>
            </div>
            <span className="text-[9px] font-bold text-slate-450 tracking-widest uppercase">Studio Output v1.0</span>
          </div>

          {/* Cover Title */}
          <div className="my-auto space-y-4 text-left py-12">
            <span className="text-[10px] font-extrabold tracking-widest text-[#4f20c0] bg-purple-50 border border-purple-100 px-3 py-1 rounded-full uppercase">
              Brand Diagnostics
            </span>
            <h1 className="text-3xl font-black text-slate-950 tracking-tight leading-tight uppercase pt-2">
              Stratejik Marka<br />Teşhis Raporu
            </h1>
            <div className="h-1.5 w-24 bg-gradient-to-r from-[#4f20c0] to-[#b5179e] rounded-full" />
            <p className="text-xs text-slate-500 font-semibold max-w-md">
              Ön analiz form verileri, ajans değerlendirme skorları ve büyüme hunisi optimizasyonu için hazırlanan detaylı marka yol haritası.
            </p>
          </div>

          {/* Cover Footer / Info Metadata */}
          <div className="grid grid-cols-2 gap-8 bg-slate-50 border border-slate-100 rounded-md p-6 mb-4 text-xs">
            <div className="space-y-3">
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Hazırlanan Marka</span>
                <span className="font-black text-slate-900 mt-0.5 block">{diagnosis.brand_name}</span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Sektör</span>
                <span className="font-bold text-slate-700 mt-0.5 block">{SECTOR_LABELS[sector] ?? 'Genel Hizmet'}</span>
              </div>
              {diagnosis.submitted_contact_name && (
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Yetkili İrtibat</span>
                  <span className="font-semibold text-slate-700 mt-0.5 block">{diagnosis.submitted_contact_name}</span>
                </div>
              )}
            </div>
            <div className="space-y-3 border-l border-slate-200 pl-8">
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Teşhis Tarihi</span>
                <span className="font-bold text-slate-700 mt-0.5 block">
                  {diagnosis.created_at ? new Date(diagnosis.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
                </span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Değerlendiren Ajans</span>
                <span className="font-black text-slate-900 mt-0.5 block">Deep Creative Agency</span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Ajans Temsilcisi</span>
                <span className="font-semibold text-slate-700 mt-0.5 block">Elena Creative (Senior Auditor)</span>
              </div>
            </div>
          </div>
        </div>

        {/* PAGE 2: METRICS & SCORECARD */}
        <div className="py-8 page-break flex flex-col justify-between h-[250mm] print:h-[265mm]">
          <div>
            <div className="flex justify-between items-center border-b border-slate-200 pb-3 mb-6">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">DEEP CREATIVE | MARKA TEŞHİS RAPORU</span>
              <span className="text-[9px] font-bold text-[#4f20c0] bg-purple-50 px-2 py-0.5 rounded">TEŞHİS SKORLARI</span>
            </div>

            <h2 className="text-lg font-black text-slate-900 tracking-tight uppercase">
              Genel Teşhis Skorları
            </h2>
            
            <div className="grid grid-cols-3 gap-8 items-center mt-6">
              {/* Overall Score Circle */}
              <div className="col-span-1 flex flex-col items-center justify-center p-6 bg-slate-50 border border-slate-200 rounded-lg text-center">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Marka Sağlığı</span>
                <div className="text-4xl font-black text-[#4f20c0] mt-2 leading-none tracking-tighter tabular-nums">
                  {overall.toFixed(1)}
                </div>
                <span className="text-[9px] text-slate-500 font-semibold mt-1">/ 10.0 Puan</span>
                
                {diagnosis.risk_level && (
                  <span className="mt-3 inline-block px-2.5 py-0.5 bg-slate-900 text-white rounded text-[8px] font-extrabold uppercase tracking-wider">
                    {RISK_LABELS[diagnosis.risk_level]}
                  </span>
                )}
              </div>

              {/* Metrics Breakdown Grid */}
              <div className="col-span-2 space-y-3.5 text-xs font-semibold text-slate-700">
                {metrics.map((m) => (
                  <div key={m.label} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-700">{m.label}</span>
                      <span className="font-black text-slate-900 tabular-nums">
                        {m.value.toFixed(1)} / 10
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#4f20c0] to-[#b5179e] rounded-full"
                        style={{ width: `${m.value * 10}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Benchmark */}
            {benchmark && benchmark.avgScore > 0 && (
              <div className="mt-6 bg-slate-50 border border-slate-100 rounded-lg p-4 text-xs font-semibold text-slate-600 leading-relaxed">
                <h4 className="font-bold text-slate-950 mb-1">Sektörel Karşılaştırma</h4>
                <p>
                  Markanızın genel teşhis skoru ({overall.toFixed(1)}), aynı sektördeki diğer marka başvurularının ortalaması ({benchmark.avgScore.toFixed(1)}) ile kıyaslandığında 
                  <span className="font-bold text-slate-900">
                    {overall >= benchmark.avgScore ? ' sektör ortalamasının üzerindedir.' : ' sektör ortalamasının altındadır.'}
                  </span> 
                  Bu durum, ilgili pazar koşullarında kreatif ve operasyonel sıçrama potansiyeline işaret etmektedir.
                </p>
              </div>
            )}

            {/* Active Diagnoses / Strategic Warnings */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              {/* Active Diagnoses Column */}
              <div className="space-y-2.5">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Sistem Yapısal Teşhisleri</h4>
                {sub.scores?.explainability?.activeDiagnoses && sub.scores.explainability.activeDiagnoses.length > 0 ? (
                  <div className="space-y-2">
                    {sub.scores.explainability.activeDiagnoses.slice(0, 2).map((diag: any) => (
                      <div key={diag.key} className="p-3 bg-purple-50/30 border border-purple-100 rounded-md text-xs">
                        <span className="font-bold text-slate-900 block">{diag.label}</span>
                        <span className="text-[9px] font-mono text-[#4f20c0] mt-0.5 block">{diag.key}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-md text-xs text-slate-400 italic">
                    Belirgin bir yapısal problem bulunmuyor.
                  </div>
                )}
              </div>

              {/* Warnings Column */}
              <div className="space-y-2.5">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Kritik Sıralama Engelleri</h4>
                {sub.scores?.treatmentIntelligence?.wrongSequenceWarnings && sub.scores.treatmentIntelligence.wrongSequenceWarnings.length > 0 ? (
                  <div className="space-y-2">
                    {sub.scores.treatmentIntelligence.wrongSequenceWarnings.slice(0, 1).map((warn: any) => (
                      <div key={warn.key} className="p-3 bg-red-50/30 border border-red-100 rounded-md text-xs text-slate-700">
                        <span className="font-bold text-red-700 flex items-center gap-1">
                          ⚠️ {warn.title}
                        </span>
                        <p className="text-[10px] leading-relaxed text-slate-600 mt-1">{warn.warningMessage}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-md text-xs text-slate-400 italic">
                    Kritik sıralama engeli tetiklenmedi.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Page Footer */}
          <div className="border-t border-slate-200 pt-3 flex justify-between text-[9px] text-slate-400 font-bold uppercase tracking-wider">
            <span>Deep Creative Studio</span>
            <span>Sayfa 2</span>
          </div>
        </div>

        {/* PAGE 3+: STRATEGIC REPORT DETAILS */}
        {hasOutput ? (
          <div className="py-8 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3 mb-6">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">DEEP CREATIVE | MARKA TEŞHİS RAPORU</span>
              <span className="text-[9px] font-bold text-[#4f20c0] bg-purple-50 px-2 py-0.5 rounded">DETAYLI ANALİZ</span>
            </div>

            <h2 className="text-lg font-black text-slate-900 tracking-tight uppercase break-after-avoid">
              Stratejik Yol Haritası & Tavsiyeler
            </h2>
            <div 
              className="prose prose-sm max-w-none text-slate-800 print:text-black mt-4 print-markdown"
              dangerouslySetInnerHTML={{ __html: formattedHtml }}
            />
          </div>
        ) : (
          <div className="py-16 text-center border border-slate-150 rounded bg-slate-50 mt-8 text-xs font-bold text-slate-400">
            Henüz detaylı strateji raporu oluşturulmamış. Stüdyodaki marka teşhis ekranından "Rapor Üret" butonuna tıklayarak raporu oluşturabilirsiniz.
          </div>
        )}

      </div>

      {/* Embedded Style Overrides for Page Print Layout */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body, .studio-root {
            background: #ffffff !important;
            color: #000000 !important;
          }
          .no-print, aside, header {
            display: none !important;
          }
          main, .flex-grow {
            padding: 0 !important;
            margin: 0 !important;
            max-width: 100% !important;
            width: 100% !important;
          }
          .print-container {
            padding: 0 !important;
            margin: 0 !important;
          }
          .page-break {
            page-break-after: always !important;
          }
          .break-inside-avoid {
            break-inside: avoid !important;
          }
          .break-after-avoid {
            break-after: avoid !important;
          }
        }
      ` }} />

      {/* Auto-Trigger Print Dialog script */}
      <script dangerouslySetInnerHTML={{ __html: `
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 800);
        }
      ` }} />

    </div>
  );
}
