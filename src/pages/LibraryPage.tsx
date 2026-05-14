import { Link } from 'react-router-dom'
import { useBooks } from '@/hooks/useBooks'
import { useBookReviews } from '@/hooks/useReviews'
import { PageSpinner } from '@/components/ui/Spinner'
import { BookCover } from '@/components/book/BookCover'
import { AverageRating } from '@/components/book/StarRating'
import { Badge } from '@/components/ui/Badge'
import type { BookWithProfile } from '@/types/database'
import { MONTH_NAMES_SHORT } from '@/lib/constants'

export function LibraryPage() {
  const { data: books = [], isLoading, error } = useBooks()

  if (isLoading) return <PageSpinner />

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-stone-500 dark:text-white/50">Fehler beim Laden.</p>
      </div>
    )
  }

  if (!books.length) {
    return (
      <div className="flex flex-col items-center py-20 gap-4 text-center">
        <div className="text-5xl">📚</div>
        <h2 className="font-serif text-xl font-bold text-stone-900 dark:text-white">Noch keine Bücher</h2>
        <p className="text-stone-500 dark:text-white/50 text-sm max-w-xs">
          Sobald das erste Buch eingetragen ist, erscheint es hier.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-serif text-2xl font-bold text-stone-900 dark:text-white">Bibliothek</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {books.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
    </div>
  )
}

function BookCard({ book }: { book: BookWithProfile }) {
  const { data: reviews = [] } = useBookReviews(book.id)
  const ratings = reviews.map((r) => Number(r.rating))

  return (
    <div className="flex flex-col gap-1.5">
      {/* Month label — above the cover, always readable */}
      <div className="flex items-center justify-between gap-1 px-0.5">
        <span className="text-xs font-semibold text-stone-500 dark:text-white/50 tracking-wide">
          {MONTH_NAMES_SHORT[book.month]} {book.year}
        </span>
        {book.is_current && <Badge variant="brand">Aktuell</Badge>}
      </div>

      {/* Cover card */}
      <Link
        to={`/book/${book.id}`}
        className="group relative rounded-2xl overflow-hidden aspect-[2/3] block ring-1 ring-black/10 dark:ring-white/10 hover:ring-black/20 dark:hover:ring-white/20 transition-all"
      >
        <BookCover
          title={book.title}
          coverUrl={book.cover_url}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-3 flex flex-col gap-1">
          <h3 className="text-white text-sm font-semibold leading-tight line-clamp-2">
            {book.title}
          </h3>
          <p className="text-white/60 text-xs truncate">{book.author}</p>
          {ratings.length > 0 && (
            <AverageRating ratings={ratings} onDark />
          )}
        </div>
      </Link>
    </div>
  )
}
