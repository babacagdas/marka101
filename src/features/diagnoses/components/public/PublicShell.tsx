import Link from 'next/link'
import { Logo } from './Logo'

interface PublicShellProps {
  readonly children: React.ReactNode
  readonly hideFooter?: boolean
}

export function PublicShell({ children, hideFooter = false }: PublicShellProps) {
  return (
    <div className="public-site-shell">
      <header className="public-header">
        <div className="public-header-inner">
          <Link href="/marka101" aria-label="Deep ana sayfa"><Logo /></Link>
          <div className="public-header-actions">
            <a className="public-login" href="#giris">Giriş Yap</a>
          </div>
        </div>
      </header>
      <main className="public-main">{children}</main>
      {!hideFooter && (
        <footer className="public-footer">
          <span>Deep Creative Marka101</span>
          <span>© 2026 Deep Creative. Tüm hakları saklıdır.</span>
        </footer>
      )}
    </div>
  )
}
