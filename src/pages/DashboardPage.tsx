import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCurrentBook } from '@/hooks/useCurrentBook'
import { useBookProgress, useMyProgress } from '@/hooks/useBookProgress'
import { useBookReviews } from '@/hooks/useReviews'
import { useAuth } from '@/lib/AuthContext'
import { PageSpinner } from '@/components/ui/Spinner'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
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

  if (!book) return <EmptyState />

  const ratings = reviews.map((r) => Number(r.rating))
  const daysLeft = daysLeftInMonth()

  return (
    <div className="flex flex-col gap-5">

      {/* ── Hero ── */}
      <div className="relative overflow-hidden rounded-3xl min-h-[420px] flex flex-col">

        {/* Blurred background */}
        {book.cover_url ? (
          <div
            className="absolute inset-0 scale-110"
            style={{
              backgroundImage: `url(${book.cover_url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(28px)',
            }}
            aria-hidden="true"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-brand-300 via-brand-400 to-stone-500" aria-hidden="true" />
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/80" aria-hidden="true" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center text-center px-6 pt-8 pb-6 flex-1">

          {/* Month label */}
          <p className="text-white/60 text-xs font-semibold tracking-[0.2em] uppercase mb-1">
            Buch des Monats
          </p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-6 leading-none">
            {MONTH_NAMES[book.month]}
            <span className="block text-lg md:text-xl font-normal text-white/60 mt-1 tracking-wide">
              {book.year}
            </span>
          </h1>

          {/* Cover */}
          <div className="w-36 md:w-44 rounded-2xl overflow-hidden shadow-2xl ring-4 ring-white/20 mb-6 flex-shrink-0">
            <BookCover title={book.title} coverUrl={book.cover_url} className="w-full aspect-[2/3]" />
          </div>

          {/* Title & author */}
          <h2 className="font-serif text-xl md:text-2xl font-bold text-white leading-tight max-w-xs">
            {book.title}
          </h2>
          <p className="text-white/70 text-sm mt-1">{book.author}</p>

          {/* Rating */}
          {ratings.length > 0 && (
            <div className="mt-3 flex justify-center">
              <AverageRating ratings={ratings} onDark />
            </div>
          )}

          {/* Suggested by */}
          {book.profiles && (
            <p className="text-white/50 text-xs mt-2">
              vorgeschlagen von {book.profiles.avatar_emoji} {book.profiles.display_name}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-2 mt-5 flex-wrap justify-center">
            <Button
              size="md"
              variant={showProgress ? 'secondary' : 'primary'}
              onClick={() => setShowProgress((v) => !v)}
            >
              {showProgress ? 'Schließen' : 'Fortschritt eintragen'}
            </Button>
            <Link to={`/book/${book.id}`}>
              <Button size="md" variant="ghost" className="text-white hover:bg-white/20 border border-white/20">
                Details →
              </Button>
            </Link>
          </div>
        </div>

        {/* Countdown strip */}
        <div className="relative z-10 border-t border-white/10 px-6 py-3 flex items-center justify-center gap-1.5">
          <span className="text-xs text-white/50">
            {daysLeft > 0
              ? `Noch ${daysLeft} ${daysLeft === 1 ? 'Tag' : 'Tage'} im Monat`
              : 'Letzter Tag des Monats'}
          </span>
          <span className="text-white/20">·</span>
          <span className="text-xs text-white/50">{progressList.length} von 4 lesen mit</span>
        </div>
      </div>

      {/* ── Inline progress editor ── */}
      {showProgress && (
        <Card className="p-5">
          <h3 className="font-semibold text-stone-900 mb-4">Mein Fortschritt</h3>
          <ProgressSlider
            bookId={book.id}
            current={myProgress ?? null}
            onSaved={() => setShowProgress(false)}
          />
        </Card>
      )}

      {/* ── Group progress ── */}
      <Card className="p-5">
        <h3 className="font-semibold text-stone-900 mb-4">Gruppenfortschritt</h3>
        <GroupProgress progressList={progressList} />
      </Card>

      {/* ── Reviews teaser ── */}
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
                <span className="text-sm font-semibold text-stone-700">
                  {Number(r.rating).toFixed(1)}
                </span>
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
