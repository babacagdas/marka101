// src/app/(public)/marka101/page.tsx
import Link from 'next/link'
import { PublicShell } from '@/features/diagnoses/components/public/PublicShell'
import { Logo } from '@/features/diagnoses/components/public/Logo'

export const metadata = {
  title: 'Marka Teşhis Analizi — Deep Creative Marka101',
  description: 'Markanızın algı, konumlandırma ve dijital güven seviyesini ölçün.',
}

const BENTO_CARDS = [
  {
    icon: 'lightbulb',
    title: 'Marka Netliği',
    desc: 'Hedef kitledeki mesaj berraklığı.',
  },
  {
    icon: 'diamond',
    title: 'Premium Algı',
    desc: 'Yüksek değer hissiyatı ve konumlama.',
  },
  {
    icon: 'auto_stories',
    title: 'Storytelling Gücü',
    desc: 'Hikayenin duygusal bağ etkisi.',
  },
  {
    icon: 'verified_user',
    title: 'Dijital Güven',
    desc: 'Güvenlik sinyali ve itibar analizi.',
  },
] as const

export default function Marka101LandingPage() {
  return (
    <PublicShell>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop pt-stack-lg pb-stack-lg">
        <div className="flex flex-col md:flex-row items-center gap-gutter">

          {/* Sol kolon */}
          <div className="w-full md:w-1/2 flex flex-col items-start space-y-6">
            {/* Logo */}
            <div className="mb-2">
              <Logo width={160} height={48} className="h-10 w-auto" />
            </div>

            {/* Eyebrow */}
            <span className="text-label-lg uppercase tracking-[0.1em] text-primary">
              Deep Creative Marka101
            </span>

            {/* Başlık */}
            <h1 className="text-[32px] md:text-display-md font-bold text-on-background leading-tight tracking-tight">
              Markanızın algı, konumlandırma ve dijital güven seviyesini ölçün.
            </h1>

            {/* Açıklama */}
            <p className="text-body-lg text-on-surface-variant max-w-xl">
              Bu kısa analiz, markanızın netliğini, premium algısını, hikaye gücünü,
              dijital güvenini ve kreatif sistemini değerlendirmek için tasarlanmıştır.
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pt-4">
              <Link
                href="/marka101/form"
                className="bg-primary text-on-primary text-label-lg py-4 px-10 rounded-full
                           hover:opacity-90 transition-all hover:scale-105 active:scale-95
                           shadow-primary-glow inline-block"
              >
                Analize Başla
              </Link>
              <div className="flex items-center gap-2 text-secondary opacity-70">
                <span className="material-symbols-outlined text-xl">schedule</span>
                <span className="text-label-md">Yaklaşık 6–8 dakika sürer.</span>
              </div>
            </div>
          </div>

          {/* Sağ kolon — Bento kartlar */}
          <div className="w-full md:w-1/2 mt-12 md:mt-0 relative">
            {/* Arka plan parıltısı */}
            <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                            w-[120%] h-[120%] bg-primary/5 rounded-full blur-3xl" />

            <div
              className="bg-surface-container-lowest rounded-lg p-4 md:p-8
                         premium-shadow border border-surface-container
                         flex flex-col gap-4 transition-transform duration-500 ease-out
                         hover:[transform:perspective(1000px)_rotateY(-3deg)_rotateX(2deg)]"
              style={{ transform: 'perspective(1000px) rotateY(5deg) rotateX(3deg)' }}
            >
              {/* 2×2 grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {BENTO_CARDS.map((card) => (
                  <div key={card.title} className="glass-panel p-6 rounded-md transition-transform hover:-translate-y-1">
                    <div className="text-primary mb-4">
                      <span className="material-symbols-outlined text-3xl">{card.icon}</span>
                    </div>
                    <h3 className="text-[18px] font-bold text-on-background mb-1">{card.title}</h3>
                    <p className="text-label-md text-secondary">{card.desc}</p>
                  </div>
                ))}
              </div>

              {/* Kreatif Sistem — wide */}
              <div className="glass-panel p-6 rounded-md flex items-center justify-between transition-transform hover:-translate-y-1">
                <div>
                  <div className="text-primary mb-4">
                    <span className="material-symbols-outlined text-3xl">grid_view</span>
                  </div>
                  <h3 className="text-[18px] font-bold text-on-background mb-1">Kreatif Sistem</h3>
                  <p className="text-label-md text-secondary">Tasarım bütünlüğü ve vizyon.</p>
                </div>
                {/* Dönen halka dekorasyonu */}
                <div className="hidden sm:block shrink-0 ml-6">
                  <div className="w-14 h-14 rounded-full border-4 border-primary/20 border-t-primary animate-spin-slow" />
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>
    </PublicShell>
  )
}
