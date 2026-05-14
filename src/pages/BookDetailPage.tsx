import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useBook } from '@/hooks/useBooks'
import { useBookProgress, useMyProgress } from '@/hooks/useBookProgress'
import { useBookReviews, useMyReview, useDeleteReview } from '@/hooks/useReviews'
import type { ReadingProgress } from '@/types/database'
import { useAuth } from '@/lib/AuthContext'
import { PageSpinner } from '@/components/ui/Spinner'
import { Card } from '@/components/ui/Card'
import { BookCover } from '@/components/book/BookCover'
import { AverageRating } from '@/components/book/StarRating'
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
  const { user } = useAuth()
  const { data: book, isLoading } = useBook(id!)
  const { data: progressList = [] } = useBookProgress(id!)
  const { data: myProgress } = useMyProgress(id!, user?.id ?? '')
  const { data: reviews = [] } = useBookReviews(id!)
  const { data: myReview } = useMyReview(id!, user?.id ?? '')
  const [tab, setTab] = useState<'progress' | 'reviews'>('progress')
  const [descExpanded, setDescExpanded] = useState(false)
  const [editingProgress, setEditingProgress] = useState(false)
  const [editingReview, setEditingReview] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const deleteReview = useDeleteReview()

  if (isLoading) return <PageSpinner />
  if (!book) return (
    <div className="text-center py-16">
      <p className="text-stone-500">Buch nicht gefunden.</p>
      <Link to="/" className="text-brand-600 text-sm mt-2 block">← Zurück</Link>
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
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-white/60 hover:text-white text-xs mb-4 transition-colors"
          >
            ← Zurück
          </Link>

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
                <div className="mt-1">
                  <p className={`text-white/60 text-xs leading-relaxed ${descExpanded ? '' : 'line-clamp-2'}`}>
                    {book.description}
                  </p>
                  <button
                    onClick={() => setDescExpanded((v) => !v)}
                    className="text-white/40 hover:text-white/70 text-xs mt-0.5 transition-colors"
                  >
                    {descExpanded ? 'weniger' : 'mehr'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Highlights ── */}
      {reviews.length >= 2 && (
        <div className="grid grid-cols-3 gap-3">
          {enthusiasticReader && (
            <Card className="p-3">
              <p className="text-xs text-stone-400 mb-2 leading-tight">Am begeistertsten</p>
              <div className="flex flex-col items-center gap-1 text-center">
                <span className="text-2xl">{enthusiasticReader.profiles?.avatar_emoji}</span>
                <p className="text-xs font-medium text-stone-800 truncate w-full">{enthusiasticReader.profiles?.display_name}</p>
                <p className="text-xs text-brand-600 font-bold">{Number(enthusiasticReader.rating).toFixed(1)} ★</p>
              </div>
            </Card>
          )}
          {criticalReader && criticalReader.id !== enthusiasticReader?.id && (
            <Card className="p-3">
              <p className="text-xs text-stone-400 mb-2 leading-tight">Kritischste Stimme</p>
              <div className="flex flex-col items-center gap-1 text-center">
                <span className="text-2xl">{criticalReader.profiles?.avatar_emoji}</span>
                <p className="text-xs font-medium text-stone-800 truncate w-full">{criticalReader.profiles?.display_name}</p>
                <p className="text-xs text-stone-500 font-bold">{Number(criticalReader.rating).toFixed(1)} ★</p>
              </div>
            </Card>
          )}
          {topReader && (
            <Card className="p-3">
              <p className="text-xs text-stone-400 mb-2 leading-tight">Am weitesten gelesen</p>
              <div className="flex flex-col items-center gap-1 text-center">
                <span className="text-2xl">{topReader.profiles?.avatar_emoji}</span>
                <p className="text-xs font-medium text-stone-800 truncate w-full">{topReader.profiles?.display_name}</p>
                <p className="text-xs text-green-600 font-bold">{topReader.progress_percent}%</p>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* ── Tabs ── */}
      <div className="flex gap-1 bg-stone-100 rounded-2xl p-1">
        {(['progress', 'reviews'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={[
              'flex-1 py-2 rounded-xl text-sm font-medium transition-colors',
              tab === t ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700',
            ].join(' ')}
          >
            {t === 'progress' ? 'Fortschritt' : `Reviews${reviews.length > 0 ? ` (${reviews.length})` : ''}`}
          </button>
        ))}
      </div>

      {tab === 'progress' && (
        <div className="flex flex-col gap-4">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-stone-900">Mein Fortschritt</h3>
              {myProgress && !editingProgress && (
                <button
                  onClick={() => setEditingProgress(true)}
                  className="text-sm text-brand-600 hover:text-brand-700 font-medium transition-colors"
                >
                  Bearbeiten
                </button>
              )}
            </div>

            {myProgress && !editingProgress ? (
              <ProgressSummary progress={myProgress} />
            ) : (
              <ProgressSlider
                bookId={book.id}
                current={myProgress ?? null}
                onSaved={() => setEditingProgress(false)}
              />
            )}
          </Card>
          <Card className="p-5">
            <h3 className="font-semibold text-stone-900 mb-4">Gruppe</h3>
            <GroupProgress progressList={progressList} />
          </Card>
        </div>
      )}

      {tab === 'reviews' && (
        <div className="flex flex-col gap-4">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-stone-900">Mein Review</h3>
              {myReview && !editingReview && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => { setEditingReview(true); setConfirmDelete(false) }}
                    className="text-sm text-brand-600 hover:text-brand-700 font-medium transition-colors"
                  >
                    Bearbeiten
                  </button>
                  {confirmDelete ? (
                    <span className="flex items-center gap-2">
                      <span className="text-xs text-stone-500">Wirklich löschen?</span>
                      <button
                        onClick={async () => {
                          await deleteReview.mutateAsync({ reviewId: myReview.id, bookId: book.id, userId: user!.id })
                          setConfirmDelete(false)
                        }}
                        className="text-xs text-red-600 hover:text-red-700 font-medium transition-colors"
                      >
                        Ja, löschen
                      </button>
                      <button
                        onClick={() => setConfirmDelete(false)}
                        className="text-xs text-stone-400 hover:text-stone-600 transition-colors"
                      >
                        Abbrechen
                      </button>
                    </span>
                  ) : (
                    <button
                      onClick={() => setConfirmDelete(true)}
                      className="text-sm text-stone-400 hover:text-red-500 transition-colors"
                    >
                      Löschen
                    </button>
                  )}
                </div>
              )}
            </div>

            {myReview && !editingReview ? (
              <ReviewCard review={{ ...myReview, profiles: null }} />
            ) : (
              <ReviewForm
                bookId={book.id}
                existing={myReview ?? null}
                onSaved={() => setEditingReview(false)}
              />
            )}
          </Card>

          {reviews.length > 0 && (
            <Card className="p-5">
              <h3 className="font-semibold text-stone-900 mb-4">Alle Reviews</h3>
              <div className="flex flex-col gap-3">
                {reviews.map((r) => (
                  <ReviewCard key={r.id} review={r} />
                ))}
              </div>
            </Card>
          )}

          {reviews.length === 0 && (
            <div className="text-center py-8 text-stone-400 text-sm">
              Noch keine Reviews. Schreib das erste!
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
          <span className="text-sm text-stone-600">{STATUS_LABELS[progress.status] ?? progress.status}</span>
          <span className="text-sm font-bold text-brand-600">{progress.progress_percent}%</span>
        </div>
        <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-400 rounded-full transition-all duration-500"
            style={{ width: `${progress.progress_percent}%` }}
          />
        </div>
      </div>
      {progress.mood && (
        <p className="text-sm text-stone-500">
          Mood: <span className="text-xl">{progress.mood}</span>
        </p>
      )}
    </div>
  )
}
