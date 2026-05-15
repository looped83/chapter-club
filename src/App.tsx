import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './lib/AuthContext'
import { AppShell } from './components/layout/AppShell'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { BookDetailPage } from './pages/BookDetailPage'
import { LibraryPage } from './pages/LibraryPage'
import { VotingPage } from './pages/VotingPage'
import { ProfilePage } from './pages/ProfilePage'
import { PageSpinner } from './components/ui/Spinner'
import { ErrorBoundary } from './components/ui/ErrorBoundary'

export default function App() {
  const { session, loading } = useAuth()

  if (loading) return <PageSpinner />

  if (!session) return <LoginPage />

  return (
    <ErrorBoundary>
      <AppShell>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/book/:id" element={<BookDetailPage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/voting" element={<VotingPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppShell>
    </ErrorBoundary>
  )
}
