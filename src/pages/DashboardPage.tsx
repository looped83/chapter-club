import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCurrentBook } from '@/hooks/useCurrentBook'
import { useBookProgress, useMyProgress } from '@/hooks/useBookProgress'
import { useBookReviews } from '@/hooks/useReviews'
import { useAuth } from '@/lib/AuthContext'
import { PageSpinner } from '@/components/ui/Spinner'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { BookCover } from '@/components/book/BookCover'
import { AverageRating } from '@/components/book/StarRating'
import { GroupProgress } from '@/components/progress/GroupProgress'
import { ProgressSlider } from '@/components/progress/ProgressSlider'

const MONTH_NAMES = [
  '', 'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
]

function daysLeftInMonth() {
  const now = new Date()
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  return lastDay.getDate() - now.getDate()
}

export function DashboardPage() {
  const { user } = useAuth()
  const { data: book, isLoading, error } = useCurrentBook()
  const { data: progressList = [] } = useBookProgress(book?.id ?? '')
  const { data: myProgress } = useMyProgress(book?.id ?? '', user?.id ?? '')
  const { data: reviews = [] } = useBookReviews(book?.id ?? '')
  const [showProgress, setShowProgress] = useState(false)

  if (isLoading) return <PageSpinner />

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-stone-500">Fehler beim Laden. Bitte Seite neu laden.</p>
      </div>
    )
  }

  if (!book) {
    return <EmptyState />
  }

  const ratings = reviews.map((r) => r.rating)
  const daysLeft = daysLeftInMonth()

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-bold text-stone-900">
          {MONTH_NAMES[book.month]} {book.year}
        </h1>
        <Badge variant="brand">
          {daysLeft > 0 ? `${daysLeft} Tage` : 'Letzter Tag'}
        </Badge>
      </div>

      {/* Book hero card */}
      <Card className="overflow-hidden">
        <div className="flex gap-4 p-5">
          {/* Cover */}
          <div className="flex-shrink-0 w-24 md:w-32 rounded-xl overflow-hidden shadow-md self-start">
            <BookCover
              title={book.title}
              coverUrl={book.cover_url}
              className="w-full aspect-[2/3]"
            />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 flex flex-col gap-2">
            <div>
              <h2 className="font-serif text-xl md:text-2xl font-bold text-stone-900 leading-tight">
                {book.title}
              </h2>
              <p className="text-stone-500 text-sm mt-0.5">{book.author}</p>
            </div>

            {book.profiles && (
              <p className="text-xs text-stone-400">
                vorgeschlagen von {book.profiles.avatar_emoji} {book.profiles.display_name}
              </p>
            )}

            <div className="mt-1">
              <AverageRating ratings={ratings} />
            </div>

            {book.description && (
              <p className="text-sm text-stone-600 leading-relaxed line-clamp-3 mt-1">
                {book.description}
              </p>
            )}

            <div className="flex gap-2 mt-2 flex-wrap">
              <Button
                size="sm"
                variant={showProgress ? 'secondary' : 'primary'}
                onClick={() => setShowProgress((v) => !v)}
              >
                {showProgress ? 'Schließen' : 'Fortschritt eintragen'}
              </Button>
              <Link to={`/book/${book.id}`}>
                <Button size="sm" variant="ghost">Details →</Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Inline progress editor */}
        {showProgress && (
          <div className="border-t border-stone-100 px-5 py-4">
            <ProgressSlider
              bookId={book.id}
              current={myProgress ?? null}
              onSaved={() => setShowProgress(false)}
            />
          </div>
        )}
      </Card>

      {/* Group progress */}
      <Card className="p-5">
        <h3 className="font-semibold text-stone-900 mb-4">Gruppenfortschritt</h3>
        <GroupProgress progressList={progressList} />
      </Card>

      {/* Quick reviews teaser */}
      {reviews.length > 0 && (
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-stone-900">Bewertungen</h3>
            <Link to={`/book/${book.id}`} className="text-sm text-brand-600 hover:underline">
              Alle ansehen
            </Link>
          </div>
          <div className="flex flex-wrap gap-3">
            {reviews.map((r) => (
              <div key={r.id} className="flex items-center gap-2 bg-stone-50 rounded-xl px-3 py-2">
                <span className="text-lg">{r.profiles?.avatar_emoji}</span>
                <span className="text-sm font-semibold text-stone-700">{r.rating}/10</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
      <div className="text-6xl" aria-hidden="true">📚</div>
      <h2 className="font-serif text-xl font-bold text-stone-900">Noch kein aktuelles Buch</h2>
      <p className="text-stone-500 text-sm max-w-sm">
        Für diesen Monat wurde noch kein Buch eingetragen. Schaut im Voting nach, welches Buch als
        nächstes dran ist.
      </p>
      <Link to="/voting">
        <Button variant="primary">Zum Voting</Button>
      </Link>
    </div>
  )
}
