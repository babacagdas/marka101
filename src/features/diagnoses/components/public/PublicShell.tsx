// src/features/diagnoses/components/public/PublicShell.tsx
// Shared wrapper: sticky header, logo, bg-mesh, footer

import Link from 'next/link'
import { Logo } from './Logo'

interface PublicShellProps {
  readonly children: React.ReactNode
}

export function PublicShell({ children }: PublicShellProps) {
  return (
    <div className="min-h-screen bg-mesh overflow-x-hidden flex flex-col">
      {/* Dekoratif arka plan blobu */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute -bottom-32 -left-32 w-[700px] h-[700px] rounded-full bg-primary/3 blur-[140px]" />
      </div>

      {/* ── Header ───────────────────────────────────────────── */}
      <header className="w-full sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-surface-container/60 transition-all duration-300">
        <div className="max-w-container mx-auto px-margin-mobile md:px-margin-desktop flex items-center justify-between py-stack-sm">
          <Link href="/marka101" className="flex items-center">
            {/* Desktop 150–180px, mobile 120–140px */}
            <Logo
              width={160}
              height={48}
              className="h-8 md:h-10"
            />
          </Link>
          {/* İleride studio link veya nav buraya gelebilir */}
        </div>
      </header>

      {/* ── İçerik ───────────────────────────────────────────── */}
      <main className="flex-1">
        {children}
      </main>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="w-full py-stack-md border-t border-surface-container bg-background/60">
        <div className="max-w-container mx-auto flex flex-col md:flex-row items-center justify-between px-margin-mobile md:px-margin-desktop gap-6">
          <div className="flex flex-col items-center md:items-start gap-1">
            <span className="text-label-lg font-bold text-on-background">Deep Creative Marka101</span>
            <p className="text-label-md text-secondary opacity-70">
              © 2024 Deep Creative. Tüm hakları saklıdır.
            </p>
          </div>
          <nav className="flex flex-wrap justify-center gap-8">
            <span className="text-label-md text-secondary opacity-60">Gizlilik Politikası</span>
            <span className="text-label-md text-secondary opacity-60">İletişim</span>
          </nav>
        </div>
      </footer>
    </div>
  )
}
