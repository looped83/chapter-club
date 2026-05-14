import { Link } from 'react-router-dom'
import { useBooks } from '@/hooks/useBooks'
import { useBookReviews } from '@/hooks/useReviews'
import { PageSpinner } from '@/components/ui/Spinner'
import { BookCover } from '@/components/book/BookCover'
import { AverageRating } from '@/components/book/StarRating'
import { Badge } from '@/components/ui/Badge'
import type { BookWithProfile } from '@/types/database'

const MONTH_NAMES = [
  '', 'Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun',
  'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez',
]

export function LibraryPage() {
  const { data: books = [], isLoading, error } = useBooks()

  if (isLoading) return <PageSpinner />

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-stone-500">Fehler beim Laden.</p>
      </div>
    )
  }

  if (!books.length) {
    return (
      <div className="flex flex-col items-center py-20 gap-4 text-center">
        <div className="text-5xl">📚</div>
        <h2 className="font-serif text-xl font-bold text-stone-900">Noch keine Bücher</h2>
        <p className="text-stone-500 text-sm max-w-xs">
          Sobald das erste Buch eingetragen ist, erscheint es hier.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-serif text-2xl font-bold text-stone-900">Unsere Bibliothek</h1>
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
    <Link
      to={`/book/${book.id}`}
      className="group flex flex-col bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden hover:shadow-md hover:border-stone-200 transition-all"
    >
      {/* Cover */}
      <div className="w-full aspect-[2/3] overflow-hidden">
        <BookCover
          title={book.title}
          coverUrl={book.cover_url}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="text-xs text-stone-400">
            {MONTH_NAMES[book.month]} {book.year}
          </span>
          {book.is_current && <Badge variant="brand">Aktuell</Badge>}
        </div>
        <h3 className="text-sm font-semibold text-stone-900 leading-tight line-clamp-2">
          {book.title}
        </h3>
        <p className="text-xs text-stone-500 truncate">{book.author}</p>
        {ratings.length > 0 && (
          <AverageRating ratings={ratings} />
        )}
        {book.profiles && (
          <p className="text-xs text-stone-400 truncate">
            {book.profiles.avatar_emoji} {book.profiles.display_name}
          </p>
        )}
      </div>
    </Link>
  )
}
