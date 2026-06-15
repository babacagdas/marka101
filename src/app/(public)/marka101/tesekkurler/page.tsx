// src/app/(public)/marka101/tesekkurler/page.tsx
import Link from 'next/link'
import { PublicShell } from '@/features/diagnoses/components/public/PublicShell'

export const metadata = { title: 'Başvurunuz Alındı — Deep Creative Marka101' }

const NEXT_STEPS = [
  {
    icon: 'insights',
    title: 'Ön Analiz',
    desc: 'Markanızın pazar konumu veri madenciliğiyle saptanır.',
  },
  {
    icon: 'diversity_3',
    title: 'Uzman Değerlendirme',
    desc: 'Strateji ekibimiz verileri yorumlar ve yol haritası çizer.',
  },
  {
    icon: 'call',
    title: 'Planlama Toplantısı',
    desc: '48 saat içinde özel bir oturum organize ederiz.',
  },
] as const

export default function TesekkurlerPage() {
  return (
    <PublicShell>
      <div className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg">

        {/* ── Ana kart ─────────────────────────────────────────── */}
        <div className="bg-surface-container-lowest rounded-lg premium-shadow overflow-hidden
                        flex flex-col md:flex-row items-stretch max-w-4xl mx-auto">

          {/* Sol — dekoratif */}
          <div className="hidden md:flex md:w-2/5 bg-primary-container items-end p-12">
            <div>
              <span className="text-label-lg text-on-primary-container tracking-widest uppercase mb-4 block opacity-70">
                Success Journey
              </span>
              <h2 className="text-headline-lg text-on-primary-container font-bold leading-tight">
                Creativity<br />in Motion.
              </h2>
            </div>
          </div>

          {/* Sağ — içerik */}
          <div className="flex-1 p-10 md:p-16 flex flex-col items-center md:items-start text-center md:text-left">
            {/* Check circle */}
            <div className="w-16 h-16 bg-primary-fixed rounded-full flex items-center justify-center mb-8">
              <span
                className="material-symbols-outlined text-primary text-4xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                check_circle
              </span>
            </div>

            <h1 className="text-headline-lg font-bold text-on-background mb-stack-sm">
              Başvurunuz alındı.
            </h1>
            <p className="text-body-lg text-secondary mb-stack-md max-w-md leading-relaxed">
              Deep Creative ekibi markanızın ön analizini inceleyerek sizinle
              en kısa sürede iletişime geçecek.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <Link
                href="/marka101"
                className="bg-primary text-on-primary text-label-lg px-8 py-5 rounded-full
                           hover:opacity-90 transition-all text-center inline-block"
              >
                Ana sayfaya dön
              </Link>
            </div>

            <div className="mt-stack-lg pt-stack-sm border-t border-surface-container w-full">
              <p className="text-label-md text-outline">
                En kısa sürede e-posta adresinize geri döneceğiz.
              </p>
            </div>
          </div>
        </div>

        {/* ── Sonraki adımlar bento ─────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter mt-stack-md max-w-4xl mx-auto">
          {NEXT_STEPS.map((s) => (
            <div key={s.title} className="bg-surface-container-lowest premium-shadow p-8 rounded-lg">
              <div className="text-primary mb-4">
                <span className="material-symbols-outlined text-3xl">{s.icon}</span>
              </div>
              <h3 className="text-headline-md font-bold mb-2">{s.title}</h3>
              <p className="text-body-md text-secondary">{s.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </PublicShell>
  )
}
