import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/lib/AuthContext'
import { supabase } from '@/lib/supabase'

const navItems = [
  { to: '/', label: 'Home', icon: HomeIcon },
  { to: '/library', label: 'Bibliothek', icon: LibraryIcon },
  { to: '/voting', label: 'Voting', icon: VotingIcon },
  { to: '/profile', label: 'Profil', icon: ProfileIcon },
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const { profile } = useAuth()
  const location = useLocation()

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      {/* Top bar – desktop */}
      <header className="hidden md:flex sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-stone-100">
        <div className="max-w-4xl mx-auto w-full px-6 h-16 flex items-center justify-between">
          <Link to="/" className="font-serif text-xl font-bold text-stone-900 tracking-tight hover:text-brand-600 transition-colors">
            📖 Chapter Club
          </Link>
          <nav className="flex items-center gap-1" aria-label="Hauptnavigation">
            {navItems.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={[
                  'px-4 py-2 rounded-xl text-sm font-medium transition-colors',
                  location.pathname === to
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100',
                ].join(' ')}
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <span className="text-sm text-stone-500">{profile?.avatar_emoji} {profile?.display_name}</span>
            <button
              onClick={() => supabase.auth.signOut()}
              className="text-xs text-stone-400 hover:text-stone-700 transition-colors"
            >
              Abmelden
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 md:px-6 pb-24 md:pb-8 pt-6">
        {children}
      </main>

      {/* Bottom nav – mobile */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur border-t border-stone-100"
        aria-label="Mobile Navigation"
      >
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to
            return (
              <Link
                key={to}
                to={to}
                className={[
                  'flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-colors min-w-0',
                  active ? 'text-brand-600' : 'text-stone-400 hover:text-stone-700',
                ].join(' ')}
                aria-current={active ? 'page' : undefined}
              >
                <Icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                <span className="text-[10px] font-medium truncate">{label}</span>
              </Link>
            )
          })}
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

function ProfileIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
