import { useState, useRef, useMemo, useCallback, useEffect } from 'react'
import { cn } from '@/lib/cn'
import { createBlurredBgStyle } from '@/lib/styles'
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom'
import { useBook } from '@/hooks/useBooks'
import { useBookProgress, useMyProgress, useDeleteProgress } from '@/hooks/useBookProgress'
import { useBookReviews, useMyReview, useDeleteReview } from '@/hooks/useReviews'
import type { ReadingProgress } from '@/types/database'
import { ExpandableText } from '@/components/ui/ExpandableText'
import { useAuth } from '@/lib/AuthContext'
import { PageSpinner } from '@/components/ui/Spinner'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { BookCover } from '@/components/book/BookCover'
import { AverageRating, StarRating } from '@/components/book/StarRating'
import { GroupProgress } from '@/components/progress/GroupProgress'
import { ProgressSlider } from '@/components/progress/ProgressSlider'
import { ReviewForm } from '@/components/review/ReviewForm'
import { ReviewCard } from '@/components/review/ReviewCard'
import { MONTH_NAMES, READING_STATUS_LABELS, ERROR_MESSAGES } from '@/lib/constants'

export function BookDetailPage() {
  const { id = '' } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const { data: book, isLoading, error } = useBook(id)
  const { data: progressList = [] } = useBookProgress(id)
  const { data: myProgress } = useMyProgress(id, user?.id ?? '')
  const { data: reviews = [] } = useBookReviews(id)
  const { data: myReview } = useMyReview(id, user?.id ?? '')
  const [tab, setTab] = useState<'progress' | 'reviews'>(
    (location.state as { tab?: string } | null)?.tab === 'reviews' ? 'reviews' : 'progress'
  )
  const [editingProgress, setEditingProgress] = useState(false)
  const [confirmDeleteProgress, setConfirmDeleteProgress] = useState(false)
  const [editingReview, setEditingReview] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const deleteProgress = useDeleteProgress()
  const [carouselIndex, setCarouselIndex] = useState(0)
  const carouselRef = useRef<HTMLDivElement>(null)
  const progressCardRef = useRef<HTMLDivElement>(null)
  const reviewCardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (editingProgress) progressCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [editingProgress])

  useEffect(() => {
    if (editingReview) reviewCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [editingReview])
  const deleteReview = useDeleteReview()

  const ratings = useMemo(() => reviews.map((r) => Number(r.rating)), [reviews])

  const sortedReviews = useMemo(
    () => [...reviews].sort((a, b) => {
      if (a.user_id === user?.id) return -1
      if (b.user_id === user?.id) return 1
      return 0
    }),
    [reviews, user?.id]
  )

  const { topReader, criticalReader, enthusiasticReader } = useMemo(() => {
    let topReader: typeof progressList[0] | null = null
    for (const p of progressList) {
      if (!topReader || p.progress_percent > topReader.progress_percent) topReader = p
    }
    let criticalReader: typeof reviews[0] | null = null
    let enthusiasticReader: typeof reviews[0] | null = null
    for (const r of reviews) {
      if (!criticalReader || r.rating < criticalReader.rating) criticalReader = r
      if (!enthusiasticReader || r.rating > enthusiasticReader.rating) enthusiasticReader = r
    }
    return { topReader, criticalReader, enthusiasticReader }
  }, [progressList, reviews])

  const handleCarouselKeyDown = useCallback((e: React.KeyboardEvent) => {
    const el = carouselRef.current
    if (!el) return
    if (e.key === 'ArrowRight') { e.preventDefault(); el.scrollBy({ left: el.clientWidth, behavior: 'smooth' }) }
    if (e.key === 'ArrowLeft')  { e.preventDefault(); el.scrollBy({ left: -el.clientWidth, behavior: 'smooth' }) }
  }, [])

  const handleTabClick = useCallback((t: 'progress' | 'reviews') => {
    setTab(t)
    setCarouselIndex(0)
    setConfirmDelete(false)
  }, [])

  const handleCarouselDotClick = useCallback((i: number) => {
    carouselRef.current?.scrollTo({ left: i * (carouselRef.current.clientWidth || 0), behavior: 'smooth' })
  }, [])

  const bgStyle = useMemo(() => createBlurredBgStyle(book?.cover_url), [book?.cover_url])

  if (isLoading) return <PageSpinner />
  if (error || !book) return (
    <div className="text-center py-16">
      <p className="text-stone-500 dark:text-white/50">
        {error ? 'Fehler beim Laden.' : 'Buch nicht gefunden.'}
      </p>
      <Link to="/" className="text-brand-600 dark:text-brand-400 text-sm mt-2 block">← Zurück</Link>
    </div>
  )

  return (
    <div className="flex flex-col gap-5">

      {/* ── Hero ── */}
      <div className="relative overflow-hidden rounded-3xl">
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
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/75" aria-hidden="true" />

        {/* Content */}
        <div className="relative z-10 p-5">
          <button
            onClick={() => navigate(-1)}
            aria-label="Zur vorherigen Seite"
            className="inline-flex items-center gap-1 text-white/60 hover:text-white text-xs mb-4 transition-colors"
          >
            ← Zurück
          </button>

          <div className="flex gap-4 items-start">
            {/* Cover */}
            <div className="flex-shrink-0 w-20 rounded-xl overflow-hidden shadow-xl ring-2 ring-white/20">
              <BookCover title={book.title} coverUrl={book.cover_url} className="w-full aspect-[2/3]" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 flex flex-col gap-1.5">
              <p className="text-white/70 text-xs tracking-widest uppercase">
                {MONTH_NAMES[book.month]} {book.year}
              </p>
              <h1 className="font-serif text-xl font-bold text-white leading-tight">
                {book.title}
              </h1>
              <p className="text-white/70 text-sm">{book.author}</p>
              <div className="mt-1">
                <AverageRating ratings={ratings} onDark />
              </div>
              {book.profiles && (
                <p className="text-white/60 text-xs mt-0.5">
                  vorgeschlagen von <span aria-hidden="true">{book.profiles.avatar_emoji}</span> {book.profiles.display_name}
                </p>
              )}
              {book.description && (
                <ExpandableText
                  text={book.description}
                  lines={2}
                  className="text-white/60 text-xs leading-relaxed mt-1"
                  toggleClassName="text-white/60 hover:text-white/90 text-xs mt-0.5 transition-colors"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Highlights ── */}
      {reviews.length >= 2 && (
        <div className={cn('grid gap-3', criticalReader && criticalReader.id !== enthusiasticReader?.id ? 'grid-cols-3' : 'grid-cols-2')}>
          {enthusiasticReader && (
            <Card className="p-3">
              <p className="text-xs text-stone-500 dark:text-white/60 mb-2 leading-tight">Am begeistertsten</p>
              <div className="flex flex-col items-center gap-1 text-center">
                <span className="text-2xl" aria-hidden="true">{enthusiasticReader.profiles?.avatar_emoji}</span>
                <p className="text-xs font-medium text-stone-900 dark:text-white truncate w-full">{enthusiasticReader.profiles?.display_name}</p>
                <p className="text-xs text-brand-600 dark:text-brand-400 font-bold">{Number(enthusiasticReader.rating).toFixed(1)} ★</p>
              </div>
            </Card>
          )}
          {criticalReader && criticalReader.id !== enthusiasticReader?.id && (
            <Card className="p-3">
              <p className="text-xs text-stone-500 dark:text-white/60 mb-2 leading-tight">Kritischste Stimme</p>
              <div className="flex flex-col items-center gap-1 text-center">
                <span className="text-2xl" aria-hidden="true">{criticalReader.profiles?.avatar_emoji}</span>
                <p className="text-xs font-medium text-stone-900 dark:text-white truncate w-full">{criticalReader.profiles?.display_name}</p>
                <p className="text-xs text-stone-500 dark:text-white/50 font-bold">{Number(criticalReader.rating).toFixed(1)} ★</p>
              </div>
            </Card>
          )}
          {topReader && (
            <Card className="p-3">
              <p className="text-xs text-stone-500 dark:text-white/60 mb-2 leading-tight">Am weitesten gelesen</p>
              <div className="flex flex-col items-center gap-1 text-center">
                <span className="text-2xl" aria-hidden="true">{topReader.profiles?.avatar_emoji}</span>
                <p className="text-xs font-medium text-stone-900 dark:text-white truncate w-full">{topReader.profiles?.display_name}</p>
                <p className="text-xs text-green-700 dark:text-green-400 font-bold">{topReader.progress_percent}%</p>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* ── Tabs ── */}
      <div
        role="tablist"
        aria-label="Buchdetails"
        className="flex gap-1 bg-stone-100 dark:bg-white/10 rounded-2xl p-1"
      >
        {(['progress', 'reviews'] as const).map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            aria-controls={`tabpanel-${t}`}
            id={`tab-${t}`}
            onClick={() => handleTabClick(t)}
            className={cn(
              'flex-1 py-2 rounded-xl text-sm font-medium transition-colors',
              tab === t
                ? 'bg-white dark:bg-white/15 text-stone-900 dark:text-white shadow-sm'
                : 'text-stone-500 dark:text-white/60 hover:text-stone-700 dark:hover:text-white/70',
            )}
          >
            {t === 'progress' ? 'Fortschritt' : `Bewertungen${reviews.length > 0 ? ` (${reviews.length})` : ''}`}
          </button>
        ))}
      </div>

      {tab === 'progress' && (
        <div id="tabpanel-progress" role="tabpanel" aria-labelledby="tab-progress" className="flex flex-col gap-4">
          <div ref={progressCardRef}>
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-stone-900 dark:text-white">Mein Fortschritt</h3>
              {myProgress && !editingProgress && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setConfirmDeleteProgress(true)}
                    aria-label="Löschen"
                    className="flex items-center justify-center w-7 h-7 rounded-full bg-stone-100 hover:bg-red-50 text-stone-500 hover:text-red-500 dark:bg-white/10 dark:hover:bg-red-500/30 dark:text-white/60 dark:hover:text-red-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setEditingProgress(true)}
                    aria-label="Bearbeiten"
                    className="flex items-center justify-center w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-700 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white/60 dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                    </svg>
                  </button>
                </div>
              )}
              {editingProgress && (
                <button
                  onClick={() => setEditingProgress(false)}
                  aria-label="Schließen"
                  className="text-stone-400 dark:text-white/40 hover:text-stone-700 dark:hover:text-white transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {confirmDeleteProgress && (
              <div role="alertdialog" aria-label="Fortschritt löschen bestätigen" className="flex flex-col gap-1.5 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-stone-500 dark:text-white/60">Fortschritt wirklich löschen?</span>
                  <button
                    onClick={async () => {
                      if (!user || !myProgress) return
                      try {
                        await deleteProgress.mutateAsync({ progressId: myProgress.id, bookId: book.id, userId: user.id })
                        setConfirmDeleteProgress(false)
                      } catch {
                        // error shown below
                      }
                    }}
                    aria-label="Fortschritt endgültig löschen"
                    className="text-xs text-red-500 dark:text-red-400 hover:text-red-400 dark:hover:text-red-300 font-medium transition-colors"
                  >
                    Ja
                  </button>
                  <button
                    onClick={() => setConfirmDeleteProgress(false)}
                    aria-label="Löschen abbrechen"
                    className="text-xs text-stone-500 dark:text-white/60 hover:text-stone-700 dark:hover:text-white transition-colors"
                  >
                    Nein
                  </button>
                </div>
                {deleteProgress.isError && (
                  <p role="alert" className="text-xs text-red-600 dark:text-red-400">
                    {ERROR_MESSAGES.deleteFailed}
                  </p>
                )}
              </div>
            )}

            {myProgress && !editingProgress ? (
              <ProgressSummary progress={myProgress} />
            ) : editingProgress ? (
              <ProgressSlider
                bookId={book.id}
                current={myProgress ?? null}
                onSaved={() => setEditingProgress(false)}
                onCancel={() => setEditingProgress(false)}
              />
            ) : (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setEditingProgress(true)}
              >
                + Fortschritt eintragen
              </Button>
            )}
          </Card>
          </div>
          <Card className="p-5">
            <h3 className="font-semibold text-stone-900 dark:text-white mb-4">Gruppen-Fortschritt</h3>
            <GroupProgress progressList={progressList} />
          </Card>
        </div>
      )}

      {tab === 'reviews' && (
        <div id="tabpanel-reviews" role="tabpanel" aria-labelledby="tab-reviews" className="flex flex-col gap-4">
          {/* ── Meine Bewertung ── */}
          <div ref={reviewCardRef}>
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-stone-900 dark:text-white">Meine Bewertung</h3>
              {myReview && !editingReview && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setConfirmDelete(true)}
                    aria-label="Löschen"
                    className="flex items-center justify-center w-7 h-7 rounded-full bg-stone-100 hover:bg-red-50 text-stone-500 hover:text-red-500 dark:bg-white/10 dark:hover:bg-red-500/30 dark:text-white/60 dark:hover:text-red-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                  <button
                    onClick={() => { setEditingReview(true); setConfirmDelete(false) }}
                    aria-label="Bearbeiten"
                    className="flex items-center justify-center w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-700 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white/60 dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                    </svg>
                  </button>
                </div>
              )}
              {editingReview && (
                <button
                  onClick={() => { setEditingReview(false); setConfirmDelete(false) }}
                  aria-label="Schließen"
                  className="text-stone-400 dark:text-white/40 hover:text-stone-700 dark:hover:text-white transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {myReview && !editingReview ? (
              <div className="flex flex-col gap-3 min-h-[2.125rem]">
                <div className="flex items-center gap-2">
                  <StarRating rating={Number(myReview.rating)} size="sm" />
                  <span className="font-serif text-xl font-bold text-brand-600 dark:text-brand-400 leading-none">
                    {Number(myReview.rating).toFixed(1)}
                  </span>
                </div>
                {confirmDelete && (
                  <div role="alertdialog" aria-label="Bewertung löschen bestätigen" className="flex flex-col gap-1.5 pt-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-stone-500 dark:text-white/60">Wirklich löschen?</span>
                      <button
                        onClick={async () => {
                          if (!user) return
                          try {
                            await deleteReview.mutateAsync({ reviewId: myReview.id, bookId: book.id, userId: user.id })
                            setConfirmDelete(false)
                          } catch {
                            // error shown below via deleteReview.isError
                          }
                        }}
                        aria-label="Bewertung endgültig löschen"
                        className="text-xs text-red-500 dark:text-red-400 hover:text-red-400 dark:hover:text-red-300 font-medium transition-colors"
                      >
                        Ja
                      </button>
                      <button
                        onClick={() => setConfirmDelete(false)}
                        aria-label="Löschen abbrechen"
                        className="text-xs text-stone-500 dark:text-white/60 hover:text-stone-600 dark:hover:text-white/80 transition-colors"
                      >
                        Nein
                      </button>
                    </div>
                    {deleteReview.isError && (
                      <p role="alert" className="text-xs text-red-600 dark:text-red-400">
                        {ERROR_MESSAGES.deleteFailed}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ) : editingReview ? (
              <ReviewForm
                bookId={book.id}
                existing={myReview ?? null}
                onSaved={() => setEditingReview(false)}
                onCancel={() => { setEditingReview(false); setConfirmDelete(false) }}
              />
            ) : (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setEditingReview(true)}
              >
                + Bewertung schreiben
              </Button>
            )}
          </Card>
          </div>

          {/* ── Alle Reviews ── eigene zuerst */}
          {reviews.length > 0 && (
            <Card className="p-5">
              <h3 className="font-semibold text-stone-900 dark:text-white mb-4">Alle Bewertungen</h3>
              {/* Mobile: horizontal snap carousel; Desktop: vertical list */}
              <div
                ref={carouselRef}
                role="group"
                aria-label="Bewertungen"
                tabIndex={0}
                onScroll={() => {
                  if (!carouselRef.current) return
                  const { scrollLeft, clientWidth } = carouselRef.current
                  setCarouselIndex(Math.round(scrollLeft / clientWidth))
                }}
                onKeyDown={handleCarouselKeyDown}
                className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide md:flex-col md:overflow-x-visible md:gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 rounded-xl"
              >
                {sortedReviews.map((r) => (
                  <div key={r.id} className="snap-start flex-shrink-0 w-full md:w-auto">
                    <ReviewCard review={r} />
                  </div>
                ))}
              </div>
              {/* Dot indicators — mobile only */}
              {sortedReviews.length > 1 && (
                <div className="flex justify-center gap-1.5 mt-3 md:hidden" role="group" aria-label="Bewertung auswählen">
                  {sortedReviews.map((r, i) => (
                    <button
                      key={r.id}
                      type="button"
                      aria-label={`Bewertung von ${r.profiles?.display_name ?? i + 1}`}
                      aria-current={i === carouselIndex ? 'true' : undefined}
                      onClick={() => handleCarouselDotClick(i)}
                      className={cn(
                        'rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400',
                        i === carouselIndex
                          ? 'w-4 h-1.5 bg-brand-400'
                          : 'w-1.5 h-1.5 bg-stone-300 dark:bg-white/20',
                      )}
                    />
                  ))}
                </div>
              )}
            </Card>
          )}

          {reviews.length === 0 && (
            <div className="text-center py-8 text-stone-500 dark:text-white/60 text-sm">
              Noch keine Bewertungen. Schreib die erste!
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ProgressSummary({ progress }: { progress: ReadingProgress }) {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-sm text-stone-600 dark:text-white/60">{READING_STATUS_LABELS[progress.status] ?? progress.status}</span>
          <span className="text-sm font-bold text-brand-600 dark:text-brand-400">{progress.progress_percent}%</span>
        </div>
        <div
          className="h-2 bg-stone-100 dark:bg-white/10 rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={progress.progress_percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Lesefortschritt: ${progress.progress_percent}%`}
        >
          <div
            className="h-full bg-brand-400 rounded-full transition-all duration-500"
            style={{ width: `${progress.progress_percent}%` }}
          />
        </div>
      </div>
    </div>
  )
}
