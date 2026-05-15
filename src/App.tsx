import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './lib/AuthContext'
import { AppShell } from './components/layout/AppShell'
import { PageSpinner } from './components/ui/Spinner'
import { ErrorBoundary } from './components/ui/ErrorBoundary'

const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })))
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })))
const BookDetailPage = lazy(() => import('./pages/BookDetailPage').then(m => ({ default: m.BookDetailPage })))
const LibraryPage = lazy(() => import('./pages/LibraryPage').then(m => ({ default: m.LibraryPage })))
const VotingPage = lazy(() => import('./pages/VotingPage').then(m => ({ default: m.VotingPage })))
const ProfilePage = lazy(() => import('./pages/ProfilePage').then(m => ({ default: m.ProfilePage })))

export default function App() {
  const { session, loading } = useAuth()

  if (loading) return <PageSpinner />

  if (!session) return (
    <Suspense fallback={<PageSpinner />}>
      <LoginPage />
    </Suspense>
  )

  return (
    <ErrorBoundary>
      <AppShell>
        <Suspense fallback={<PageSpinner />}>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/book/:id" element={<BookDetailPage />} />
            <Route path="/library" element={<LibraryPage />} />
            <Route path="/voting" element={<VotingPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AppShell>
    </ErrorBoundary>
  )
}
