import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/lib/AuthContext'

const navItems = [
  { to: '/', label: 'Home', icon: HomeIcon },
  { to: '/library', label: 'Bibliothek', icon: LibraryIcon },
  { to: '/voting', label: 'Voting', icon: VotingIcon },
]

function isNavActive(to: string, pathname: string): boolean {
  if (pathname === to) return true
  if (to === '/library' && pathname.startsWith('/book/')) return true
  return false
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { profile } = useAuth()
  const location = useLocation()

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex flex-col">
      {/* Top bar – desktop */}
      <header className="hidden md:flex sticky top-0 z-40 bg-white/90 dark:bg-stone-950/90 backdrop-blur border-b border-stone-200 dark:border-white/10">
        <div className="max-w-4xl mx-auto w-full px-6 h-16 flex items-center justify-between">
          <Link to="/" className="font-serif text-xl font-bold text-stone-900 dark:text-white tracking-tight hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
            📖 Chapter Club
          </Link>
          <nav className="flex items-center gap-1" aria-label="Hauptnavigation">
            {navItems.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={[
                  'px-4 py-2 rounded-xl text-sm font-medium transition-colors',
                  isNavActive(to, location.pathname)
                    ? 'bg-brand-50 text-brand-700 dark:bg-white/10 dark:text-white'
                    : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100 dark:text-white/50 dark:hover:text-white dark:hover:bg-white/10',
                ].join(' ')}
              >
                {label}
              </Link>
            ))}
          </nav>
          <Link
            to="/profile"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-stone-100 dark:hover:bg-white/10 transition-colors"
            aria-label="Profil bearbeiten"
          >
            <span className="text-lg leading-none">{profile?.avatar_emoji}</span>
            <span className="text-sm text-stone-500 dark:text-white/60 font-medium">{profile?.display_name}</span>
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 md:px-6 pb-24 md:pb-8 pt-6">
        {children}
      </main>

      {/* Bottom nav – mobile */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-stone-950/95 backdrop-blur border-t border-stone-200 dark:border-white/10"
        aria-label="Mobile Navigation"
      >
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map(({ to, label, icon: Icon }) => {
            const active = isNavActive(to, location.pathname)
            return (
              <Link
                key={to}
                to={to}
                className={[
                  'flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-colors min-w-0',
                  active ? 'text-brand-600 dark:text-brand-400' : 'text-stone-400 hover:text-stone-700 dark:text-white/40 dark:hover:text-white',
                ].join(' ')}
                aria-current={active ? 'page' : undefined}
              >
                <Icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                <span className="text-[10px] font-medium truncate">{label}</span>
              </Link>
            )
          })}
          {/* Avatar als Profil-Link */}
          <Link
            to="/profile"
            className={[
              'flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-colors min-w-0',
              location.pathname === '/profile' ? 'text-brand-600 dark:text-brand-400' : 'text-stone-400 hover:text-stone-700 dark:text-white/40 dark:hover:text-white',
            ].join(' ')}
            aria-current={location.pathname === '/profile' ? 'page' : undefined}
            aria-label="Profil"
          >
            <span className="text-xl leading-none h-5 flex items-center">{profile?.avatar_emoji ?? '👤'}</span>
            <span className="text-[10px] font-medium truncate">{profile?.display_name?.split(' ')[0] ?? 'Profil'}</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline strokeLinecap="round" strokeLinejoin="round" points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}

function LibraryIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  )
}

function VotingIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 6H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1z" />
    </svg>
  )
}
