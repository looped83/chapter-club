import { StarPicker } from '@/components/ui/StarPicker'

interface StarRatingProps {
  rating: number
  size?: 'sm' | 'md'
}

export function StarRating({ rating, size = 'md' }: StarRatingProps) {
  return <StarPicker value={rating} onChange={() => undefined} readOnly size={size} />
}

interface AverageRatingProps {
  ratings: number[]
  onDark?: boolean
}

export function AverageRating({ ratings, onDark = false }: AverageRatingProps) {
  if (!ratings.length) return (
    <span className={`text-sm ${onDark ? 'text-white/50' : 'text-stone-400'}`}>
      Noch keine Bewertungen
    </span>
  )
  const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length
  return (
    <span className="flex items-center gap-2">
      <StarPicker value={avg} onChange={() => undefined} readOnly size="sm" />
      <span className={`text-sm font-medium ${onDark ? 'text-white/90' : 'text-stone-600'}`}>
        {avg.toFixed(1)}
      </span>
      <span className={`text-xs ${onDark ? 'text-white/50' : 'text-stone-400'}`}>
        ({ratings.length})
      </span>
    </span>
  )
}
