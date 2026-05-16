import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { createBlurredBgStyle } from '@/lib/styles'
import { useCurrentBook } from '@/hooks/useCurrentBook'
import { useBookProgress, useMyProgress } from '@/hooks/useBookProgress'
import { useBookReviews, useMyReview } from '@/hooks/useReviews'
import { useAuth } from '@/lib/AuthContext'
import { PageSpinner } from '@/components/ui/Spinner'
import { MONTH_NAMES } from '@/lib/constants'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { BookCover } from '@/components/book/BookCover'
import { AverageRating, StarRating } from '@/components/book/StarRating'
import { GroupProgress } from '@/components/progress/GroupProgress'
import { ProgressSlider } from '@/components/progress/ProgressSlider'
import { ReviewForm } from '@/components/review/ReviewForm'


export function DashboardPage() {
  const { user } = useAuth()
  const { data: book, isLoading, error } = useCurrentBook()
  const { data: progressList = [] } = useBookProgress(book?.id ?? '')
  const { data: myProgress } = useMyProgress(book?.id ?? '', user?.id ?? '')
  const { data: reviews = [] } = useBookReviews(book?.id ?? '')
  const { data: myReview } = useMyReview(book?.id ?? '', user?.id ?? '')
  const [showProgress, setShowProgress] = useState(false)
  const [showReview, setShowReview] = useState(false)
  const progressRef = useRef<HTMLDivElement>(null)
  const reviewRef = useRef<HTMLDivElement>(null)

  const ratings = useMemo(() => reviews.map((r) => Number(r.rating)), [reviews])

  const bgStyle = useMemo(() => createBlurredBgStyle(book?.cover_url), [book?.cover_url])

  useEffect(() => {
    if (showProgress) progressRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [showProgress])

  useEffect(() => {
    if (showReview) reviewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [showReview])

  const handleOpenProgress = useCallback(() => {
    setShowProgress(true)
    setShowReview(false)
  }, [])

  const handleOpenReview = useCallback(() => {
    setShowReview(true)
    setShowProgress(false)
  }, [])

  if (isLoading) return <PageSpinner />

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-stone-500 dark:text-white/50">Fehler beim Laden. Bitte Seite neu laden.</p>
      </div>
    )
  }

  if (!book) return <EmptyState />

  return (
    <div className="flex flex-col gap-5">

      {/* ── Hero ── */}
      <div className="relative overflow-hidden rounded-3xl min-h-[420px] flex flex-col">

        {/* Blurred background */}
        {book.cover_url ? (
          <div
            className="absolute inset-0 scale-110"
            style={bgStyle}
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
            Buch des Monats · {book.year}
          </p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-6 leading-none">
            {MONTH_NAMES[book.month]}
          </h1>

          {/* Cover */}
          <div className="w-36 md:w-44 rounded-2xl overflow-hidden shadow-2xl ring-4 ring-white/20 mb-6 flex-shrink-0">
            <BookCover title={book.title} coverUrl={book.cover_url} className="w-full aspect-[2/3]" />
          </div>

          {/* Title & author */}
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-white leading-tight max-w-xs">
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
            <p className="text-white/70 text-xs mt-2">
              vorgeschlagen von <span aria-hidden="true">{book.profiles.avatar_emoji}</span> {book.profiles.display_name}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 mt-5 flex-wrap justify-center">
            <button
              onClick={handleOpenProgress}
              aria-expanded={showProgress}
              aria-controls="dashboard-progress-editor"
              className="px-5 py-2 bg-brand-700 text-white rounded-xl text-sm font-semibold shadow hover:bg-brand-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-400"
            >
              Fortschritt eintragen
            </button>
            <button
              onClick={handleOpenReview}
              aria-expanded={showReview}
              aria-controls="dashboard-review-editor"
              className="px-4 py-2 border border-white/25 text-white/75 rounded-xl text-sm font-medium hover:bg-white/10 hover:border-white/40 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            >
              {myReview ? 'Bearbeiten' : 'Bewerten'}
            </button>
            <Link
              to={`/book/${book.id}`}
              aria-label={`Details: ${book.title}`}
              className="px-1 text-sm text-white/60 font-medium hover:text-white/90 transition-colors"
            >
              Details →
            </Link>
          </div>
        </div>

      </div>

      {/* ── Inline progress editor ── */}
      {showProgress && (
        <div ref={progressRef}>
          <Card id="dashboard-progress-editor" className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-stone-900 dark:text-white">Mein Fortschritt</h3>
              <button
                type="button"
                onClick={() => setShowProgress(false)}
                aria-label="Schließen"
                className="text-stone-400 dark:text-white/40 hover:text-stone-700 dark:hover:text-white transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <ProgressSlider
              bookId={book.id}
              current={myProgress ?? null}
              onSaved={() => setShowProgress(false)}
              onCancel={() => setShowProgress(false)}
            />
          </Card>
        </div>
      )}

      {/* ── Inline review editor ── */}
      {showReview && (
        <div ref={reviewRef}>
          <Card id="dashboard-review-editor" className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-stone-900 dark:text-white">Meine Bewertung</h3>
              <button
                type="button"
                onClick={() => setShowReview(false)}
                aria-label="Schließen"
                className="text-stone-400 dark:text-white/40 hover:text-stone-700 dark:hover:text-white transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <ReviewForm
              bookId={book.id}
              existing={myReview ?? null}
              onSaved={() => setShowReview(false)}
              onCancel={() => setShowReview(false)}
            />
          </Card>
        </div>
      )}

      {/* ── Group progress ── */}
      <Card className="p-5">
        <h3 className="font-semibold text-stone-900 dark:text-white mb-4">Gruppen-Fortschritt</h3>
        <GroupProgress progressList={progressList} />
      </Card>

      {/* ── Reviews teaser ── */}
      {reviews.length > 0 && (
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-stone-900 dark:text-white">Bewertungen</h3>
            <Link to={`/book/${book.id}`} className="text-sm text-brand-600 dark:text-brand-400 hover:text-brand-500 dark:hover:text-brand-300 transition-colors">
              Alle ansehen
            </Link>
          </div>
          <ul className="grid grid-cols-2 gap-3 list-none m-0 p-0">
            {reviews.map((r) => (
              <li key={r.id}>
                <Link
                  to={`/book/${book.id}`}
                  state={{ tab: 'reviews' }}
                  aria-label={`Bewertung von ${r.profiles?.display_name ?? 'Unbekannt'}: ${Number(r.rating).toFixed(1)} von 5 Sternen`}
                  className="flex flex-col items-center gap-2 bg-stone-100 dark:bg-white/10 rounded-2xl px-3 py-4 hover:bg-stone-200 dark:hover:bg-white/15 transition-colors"
                >
                  <span className="text-3xl leading-none" aria-hidden="true">{r.profiles?.avatar_emoji ?? '📚'}</span>
                  <span className="text-xs font-medium text-stone-600 dark:text-white/70 truncate w-full text-center">
                    {r.profiles?.display_name}
                  </span>
                  <StarRating rating={Number(r.rating)} size="sm" />
                  <span className="text-sm font-bold text-brand-600 dark:text-brand-400" aria-hidden="true">
                    {Number(r.rating).toFixed(1)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
      <div className="text-6xl" aria-hidden="true">📚</div>
      <h2 className="font-serif text-xl font-bold text-stone-900 dark:text-white">Noch kein aktuelles Buch</h2>
      <p className="text-stone-500 dark:text-white/50 text-sm max-w-sm">
        Für diesen Monat wurde noch kein Buch eingetragen. Schaut im Voting nach, welches Buch als
        nächstes dran ist.
      </p>
      <Link to="/voting">
        <Button variant="primary">Zum Voting</Button>
      </Link>
    </div>
  )
}
