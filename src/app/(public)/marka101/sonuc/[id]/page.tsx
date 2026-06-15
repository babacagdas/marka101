// src/app/(public)/marka101/sonuc/[id]/page.tsx
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getDiagnosisById } from '@/features/diagnoses';
import { PublicShell } from '@/features/diagnoses/components/public/PublicShell';
import { FullReportScreen } from '@/features/diagnoses/components/public/FullReportScreen';

export const dynamic = 'force-dynamic';

interface Props {
  readonly params: { readonly id: string };
}

export async function generateMetadata({ params }: Props) {
  const d = await getDiagnosisById(params.id);
  return { title: d ? `${d.brand_name} — Teşhis Sonucu` : 'Teşhis Raporu' };
}

function scoreColor(s: number): string {
  if (s <= 34) return "text-red-500";
  if (s <= 54) return "text-orange-500";
  if (s <= 74) return "text-yellow-600";
  if (s <= 89) return "text-lime-600";
  return "text-emerald-600";
}

function scoreBg(s: number): string {
  if (s <= 34) return "bg-red-500";
  if (s <= 54) return "bg-orange-500";
  if (s <= 74) return "bg-yellow-500";
  if (s <= 89) return "bg-lime-500";
  return "bg-emerald-500";
}

export default async function PublicBrandSonucPage({ params }: Props) {
  const diagnosis = await getDiagnosisById(params.id);
  if (!diagnosis) notFound();

  const sub = (diagnosis.public_submission ?? {}) as any;
  const scores = sub.scores;
  const context = sub.brandContext;

  // Fallback if brand context wasn't saved in wizard
  const brandContext = context || {
    sector: 'general',
    businessModel: 'b2c',
    brandStage: 'growth',
    growthGoal: 'more_customers',
    mainProblem: 'low_awareness'
  };

  const internal = (diagnosis.internal_analysis ?? {}) as any;
  const isLocked = internal.is_locked === true;

  if (!scores) {
    // If not calculated yet (older manual registrations or errors)
    return (
      <PublicShell>
        <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
          <span className="material-symbols-outlined text-[48px] text-[#4f20c0] animate-pulse">pending</span>
          <h2 className="text-xl font-bold text-on-background">Analiz Sürüyor</h2>
          <p className="text-xs text-secondary leading-relaxed">
            Markanız için stratejik teşhis değerlendirmesi devam ediyor. Tamamlandığında sonuçlar bu bağlantı üzerinden erişilebilir olacaktır.
          </p>
        </div>
      </PublicShell>
    );
  }

  if (isLocked) {
    const bhs = scores.brandHealth ?? 0;
    const sectorFit = scores.sectorFit ?? 0;
    const salesReadiness = scores.salesReadiness ?? 0;
    const whatsappMsg = encodeURIComponent(`Merhaba, ${diagnosis.brand_name} markamız için tamamlanan BIOS teşhis raporunun kilidini açtırmak ve strateji oturumu planlamak istiyoruz. (Rapor ID: ${diagnosis.id})`);

    return (
      <PublicShell>
        <div className="max-w-2xl mx-auto px-4 py-10 space-y-6 animate-fade-in-up">
          {/* Main Locked Score Container */}
          <div className="bg-surface-container-lowest rounded-lg premium-shadow border border-surface-container p-8 space-y-6 text-center">
            <span className="text-[10px] font-extrabold tracking-widest text-[#4f20c0] bg-purple-50 border border-purple-100 px-3 py-1 rounded-full uppercase">
              Brand Health Summary
            </span>
            
            <h1 className="text-2xl font-bold text-on-background tracking-tight leading-tight uppercase">
              {diagnosis.brand_name} Teşhis Özeti
            </h1>

            {/* Score gauge */}
            <div className="flex flex-col items-center justify-center space-y-2 pt-2">
              <span className={`text-5xl font-black tracking-tighter tabular-nums ${scoreColor(bhs)}`}>
                {bhs}
              </span>
              <span className="text-[10px] font-bold text-secondary uppercase tracking-wider">
                Genel Sağlık Skoru / 100
              </span>
              <div className="w-48 h-2 bg-surface-container rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${scoreBg(bhs)}`} style={{ width: `${bhs}%` }} />
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto pt-2">
              <div className="bg-surface-container-low rounded-xl p-4 text-center">
                <span className="text-[10px] font-bold text-secondary block">Sektörel Uyum</span>
                <span className={`text-xl font-bold block mt-1 ${scoreColor(sectorFit)}`}>%{sectorFit}</span>
              </div>
              <div className="bg-surface-container-low rounded-xl p-4 text-center">
                <span className="text-[10px] font-bold text-secondary block">Satış Hazırlığı</span>
                <span className={`text-xl font-bold block mt-1 ${scoreColor(salesReadiness)}`}>%{salesReadiness}</span>
              </div>
            </div>
          </div>

          {/* Paywall Container */}
          <div className="bg-gradient-to-br from-[#141221] to-[#0e0b1a] border border-[#221e33] rounded-lg p-8 shadow-2xl relative overflow-hidden text-[#f6f5fa]">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#e81cff]/10 rounded-full blur-3xl -z-10" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#4f20c0]/10 rounded-full blur-3xl -z-10" />

            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-12 h-12 rounded-full bg-[#e81cff]/10 border border-[#e81cff]/30 flex items-center justify-center text-[#e81cff] animate-pulse">
                <span className="material-symbols-outlined text-[24px]">lock</span>
              </div>

              <div className="space-y-2">
                <h2 className="text-lg font-black tracking-tight text-white uppercase">Stratejik Raporunuz Kilitli</h2>
                <p className="text-xs text-gray-400 leading-relaxed font-semibold max-w-md mx-auto">
                  Tebrikler! Markanız için BIOS teşhis değerlendirmesi başarıyla tamamlandı. Ancak bu skorları oluşturan;
                </p>
                <div className="flex flex-wrap justify-center gap-1.5 pt-2 text-[9px] font-bold text-gray-300">
                  <span className="bg-white/5 border border-white/10 px-2.5 py-1 rounded">Aktif Sinyaller</span>
                  <span className="bg-white/5 border border-white/10 px-2.5 py-1 rounded">Yapısal Teşhis Bulguları</span>
                  <span className="bg-white/5 border border-white/10 px-2.5 py-1 rounded">Wrong Sequence Sıralama Engelleri</span>
                  <span className="bg-white/5 border border-white/10 px-2.5 py-1 rounded">30 Günlük Aksiyon Planı</span>
                </div>
              </div>

              <div className="w-full border-t border-white/5 pt-5 space-y-4">
                <p className="text-xs text-gray-400 font-semibold max-w-sm mx-auto">
                  Detaylı analiz raporunun kilidini açtırmak ve kıdemli marka stratejistimizle 30 dakikalık ücretsiz planlama görüşmesi yapmak için hemen randevu alın.
                </p>

                <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
                  <a
                    href={`https://wa.me/905300000000?text=${whatsappMsg}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-6 py-3.5 rounded-full flex items-center justify-center gap-1.5 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-emerald-500/10"
                  >
                    <span className="material-symbols-outlined text-[16px]">chat</span>
                    WhatsApp ile Kilidi Aç
                  </a>
                  <a
                    href="https://calendly.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white hover:bg-gray-100 text-slate-950 font-bold text-xs px-6 py-3.5 rounded-full flex items-center justify-center gap-1.5 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                    Analiz Görüşmesi Planla
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Blurred Placeholder Simulation */}
          <div className="opacity-20 pointer-events-none select-none space-y-5">
            <div className="bg-surface-container-lowest border rounded-lg p-6 space-y-3 blur-[2px]">
              <div className="h-4 w-32 bg-gray-400 rounded" />
              <div className="h-3 w-full bg-gray-300 rounded" />
              <div className="h-3 w-5/6 bg-gray-300 rounded" />
            </div>
            <div className="bg-surface-container-lowest border rounded-lg p-6 space-y-3 blur-[2px]">
              <div className="h-4 w-48 bg-gray-400 rounded" />
              <div className="h-3 w-full bg-gray-300 rounded" />
              <div className="h-3 w-4/5 bg-gray-300 rounded" />
            </div>
          </div>
        </div>
      </PublicShell>
    );
  }

  return (
    <PublicShell>
      <FullReportScreen
        scores={scores}
        context={brandContext}
        leadId={diagnosis.id}
        onBack={() => {}}
      />
    </PublicShell>
  );
}
