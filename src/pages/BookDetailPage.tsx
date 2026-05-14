import { useState, useRef } from 'react'
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom'
import { useBook } from '@/hooks/useBooks'
import { useBookProgress, useMyProgress } from '@/hooks/useBookProgress'
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

const MONTH_NAMES = [
  '', 'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
]

export function BookDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const { data: book, isLoading } = useBook(id!)
  const { data: progressList = [] } = useBookProgress(id!)
  const { data: myProgress } = useMyProgress(id!, user?.id ?? '')
  const { data: reviews = [] } = useBookReviews(id!)
  const { data: myReview } = useMyReview(id!, user?.id ?? '')
  const [tab, setTab] = useState<'progress' | 'reviews'>(
    (location.state as { tab?: string } | null)?.tab === 'reviews' ? 'reviews' : 'progress'
  )
  const [editingProgress, setEditingProgress] = useState(false)
  const [editingReview, setEditingReview] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [carouselIndex, setCarouselIndex] = useState(0)
  const carouselRef = useRef<HTMLDivElement>(null)
  const deleteReview = useDeleteReview()

  if (isLoading) return <PageSpinner />
  if (!book) return (
    <div className="text-center py-16">
      <p className="text-stone-500 dark:text-white/50">Buch nicht gefunden.</p>
      <Link to="/" className="text-brand-600 dark:text-brand-400 text-sm mt-2 block">← Zurück</Link>
    </div>
  )

  const ratings = reviews.map((r) => Number(r.rating))

  const topReader = progressList.reduce<typeof progressList[0] | null>((best, p) =>
    (!best || p.progress_percent > best.progress_percent) ? p : best
  , null)

  const criticalReader = reviews.reduce<typeof reviews[0] | null>((worst, r) =>
    (!worst || r.rating < worst.rating) ? r : worst
  , null)

  const enthusiasticReader = reviews.reduce<typeof reviews[0] | null>((best, r) =>
    (!best || r.rating > best.rating) ? r : best
  , null)

  return (
    <div className="flex flex-col gap-5">

      {/* ── Hero ── */}
      <div className="relative overflow-hidden rounded-3xl">
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
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/75" aria-hidden="true" />

        {/* Content */}
        <div className="relative z-10 p-5">
          <button
            onClick={() => navigate(-1)}
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
              <p className="text-white/50 text-xs tracking-widest uppercase">
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
                <p className="text-white/40 text-xs mt-0.5">
                  vorgeschlagen von {book.profiles.avatar_emoji} {book.profiles.display_name}
                </p>
              )}
              {book.description && (
                <ExpandableText
                  text={book.description}
                  lines={2}
                  className="text-white/60 text-xs leading-relaxed mt-1"
                  toggleClassName="text-white/40 hover:text-white/70 text-xs mt-0.5 transition-colors"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Highlights ── */}
      {reviews.length >= 2 && (
        <div className={['grid gap-3', criticalReader && criticalReader.id !== enthusiasticReader?.id ? 'grid-cols-3' : 'grid-cols-2'].join(' ')}>
          {enthusiasticReader && (
            <Card className="p-3">
              <p className="text-xs text-stone-400 dark:text-white/40 mb-2 leading-tight">Am begeistertsten</p>
              <div className="flex flex-col items-center gap-1 text-center">
                <span className="text-2xl">{enthusiasticReader.profiles?.avatar_emoji}</span>
                <p className="text-xs font-medium text-stone-900 dark:text-white truncate w-full">{enthusiasticReader.profiles?.display_name}</p>
                <p className="text-xs text-brand-600 dark:text-brand-400 font-bold">{Number(enthusiasticReader.rating).toFixed(1)} ★</p>
              </div>
            </Card>
          )}
          {criticalReader && criticalReader.id !== enthusiasticReader?.id && (
            <Card className="p-3">
              <p className="text-xs text-stone-400 dark:text-white/40 mb-2 leading-tight">Kritischste Stimme</p>
              <div className="flex flex-col items-center gap-1 text-center">
                <span className="text-2xl">{criticalReader.profiles?.avatar_emoji}</span>
                <p className="text-xs font-medium text-stone-900 dark:text-white truncate w-full">{criticalReader.profiles?.display_name}</p>
                <p className="text-xs text-stone-500 dark:text-white/50 font-bold">{Number(criticalReader.rating).toFixed(1)} ★</p>
              </div>
            </Card>
          )}
          {topReader && (
            <Card className="p-3">
              <p className="text-xs text-stone-400 dark:text-white/40 mb-2 leading-tight">Am weitesten gelesen</p>
              <div className="flex flex-col items-center gap-1 text-center">
                <span className="text-2xl">{topReader.profiles?.avatar_emoji}</span>
                <p className="text-xs font-medium text-stone-900 dark:text-white truncate w-full">{topReader.profiles?.display_name}</p>
                <p className="text-xs text-green-700 dark:text-green-400 font-bold">{topReader.progress_percent}%</p>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* ── Tabs ── */}
      <div className="flex gap-1 bg-stone-100 dark:bg-white/10 rounded-2xl p-1">
        {(['progress', 'reviews'] as const).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setCarouselIndex(0); setConfirmDelete(false) }}
            className={[
              'flex-1 py-2 rounded-xl text-sm font-medium transition-colors',
              tab === t
                ? 'bg-white dark:bg-white/15 text-stone-900 dark:text-white shadow-sm'
                : 'text-stone-400 dark:text-white/40 hover:text-stone-700 dark:hover:text-white/70',
            ].join(' ')}
          >
            {t === 'progress' ? 'Fortschritt' : `Bewertungen${reviews.length > 0 ? ` (${reviews.length})` : ''}`}
          </button>
        ))}
      </div>

      {tab === 'progress' && (
        <div className="flex flex-col gap-4">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-stone-900 dark:text-white">Mein Fortschritt</h3>
              {myProgress && !editingProgress && (
                <button
                  onClick={() => setEditingProgress(true)}
                  className="text-sm text-brand-600 dark:text-brand-400 hover:text-brand-500 dark:hover:text-brand-300 font-medium transition-colors"
                >
                  Bearbeiten
                </button>
              )}
              {editingProgress && (
                <button
                  onClick={() => setEditingProgress(false)}
                  className="text-sm text-stone-400 dark:text-white/40 hover:text-stone-600 dark:hover:text-white/70 transition-colors"
                >
                  Abbrechen
                </button>
              )}
            </div>

            {myProgress && !editingProgress ? (
              <ProgressSummary progress={myProgress} />
            ) : editingProgress ? (
              <ProgressSlider
                bookId={book.id}
                current={myProgress ?? null}
                onSaved={() => setEditingProgress(false)}
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
          <Card className="p-5">
            <h3 className="font-semibold text-stone-900 dark:text-white mb-4">Gruppen Fortschritt</h3>
            <GroupProgress progressList={progressList} />
          </Card>
        </div>
      )}

      {tab === 'reviews' && (
        <div className="flex flex-col gap-4">
          {/* ── Meine Bewertung ── */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-stone-900 dark:text-white">Meine Bewertung</h3>
              {myReview && !editingReview && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="text-sm text-stone-400 dark:text-white/30 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                  >
                    Löschen
                  </button>
                  <button
                    onClick={() => { setEditingReview(true); setConfirmDelete(false) }}
                    className="text-sm text-brand-600 dark:text-brand-400 hover:text-brand-500 dark:hover:text-brand-300 font-medium transition-colors"
                  >
                    Bearbeiten
                  </button>
                </div>
              )}
              {editingReview && (
                <button
                  onClick={() => { setEditingReview(false); setConfirmDelete(false) }}
                  className="text-sm text-stone-400 dark:text-white/40 hover:text-stone-600 dark:hover:text-white/70 transition-colors"
                >
                  Abbrechen
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
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-xs text-stone-400 dark:text-white/50">Wirklich löschen?</span>
                    <button
                      onClick={async () => {
                        await deleteReview.mutateAsync({ reviewId: myReview.id, bookId: book.id, userId: user!.id })
                        setConfirmDelete(false)
                      }}
                      className="text-xs text-red-500 dark:text-red-400 hover:text-red-400 dark:hover:text-red-300 font-medium transition-colors"
                    >
                      Ja
                    </button>
                    <button
                      onClick={() => setConfirmDelete(false)}
                      className="text-xs text-stone-400 dark:text-white/30 hover:text-stone-600 dark:hover:text-white/60 transition-colors"
                    >
                      Nein
                    </button>
                  </div>
                )}
              </div>
            ) : editingReview ? (
              <ReviewForm
                bookId={book.id}
                existing={myReview ?? null}
                onSaved={() => setEditingReview(false)}
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

          {/* ── Alle Reviews ── eigene zuerst */}
          {reviews.length > 0 && (() => {
            const sorted = [...reviews].sort((a, b) => {
              if (a.user_id === user?.id) return -1
              if (b.user_id === user?.id) return 1
              return 0
            })
            return (
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
                  onKeyDown={(e) => {
                    const el = carouselRef.current
                    if (!el) return
                    if (e.key === 'ArrowRight') { e.preventDefault(); el.scrollBy({ left: el.clientWidth, behavior: 'smooth' }) }
                    if (e.key === 'ArrowLeft')  { e.preventDefault(); el.scrollBy({ left: -el.clientWidth, behavior: 'smooth' }) }
                  }}
                  className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide md:flex-col md:overflow-x-visible md:gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 rounded-xl"
                >
                  {sorted.map((r) => (
                    <div key={r.id} className="snap-start flex-shrink-0 w-full md:w-auto">
                      <ReviewCard review={r} />
                    </div>
                  ))}
                </div>
                {/* Dot indicators — mobile only */}
                {sorted.length > 1 && (
                  <div className="flex justify-center gap-1.5 mt-3 md:hidden" role="group" aria-label="Bewertung auswählen">
                    {sorted.map((r, i) => (
                      <button
                        key={i}
                        type="button"
                        aria-label={`Bewertung von ${r.profiles?.display_name ?? i + 1}`}
                        aria-current={i === carouselIndex ? 'true' : undefined}
                        onClick={() => {
                          carouselRef.current?.scrollTo({ left: i * carouselRef.current.clientWidth, behavior: 'smooth' })
                        }}
                        className={[
                          'rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400',
                          i === carouselIndex
                            ? 'w-4 h-1.5 bg-brand-400'
                            : 'w-1.5 h-1.5 bg-stone-300 dark:bg-white/20',
                        ].join(' ')}
                      />
                    ))}
                  </div>
                )}
              </Card>
            )
          })()}

          {reviews.length === 0 && (
            <div className="text-center py-8 text-stone-400 dark:text-white/40 text-sm">
              Noch keine Bewertungen. Schreib die erste!
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const STATUS_LABELS: Record<string, string> = {
  not_started: 'Noch nicht angefangen',
  reading: 'Am Lesen',
  finished: 'Fertig ✓',
  paused: 'Pausiert',
  abandoned: 'Abgebrochen',
}

function ProgressSummary({ progress }: { progress: ReadingProgress }) {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-sm text-stone-600 dark:text-white/60">{STATUS_LABELS[progress.status] ?? progress.status}</span>
          <span className="text-sm font-bold text-brand-600 dark:text-brand-400">{progress.progress_percent}%</span>
        </div>
        <div className="h-2 bg-stone-100 dark:bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-400 rounded-full transition-all duration-500"
            style={{ width: `${progress.progress_percent}%` }}
          />
        </div>
      </div>
    </div>
  )
}
