import { StarPicker } from '@/components/ui/StarPicker'

interface StarRatingProps {
  rating: number
  size?: 'sm' | 'md'
}

export function StarRating({ rating, size = 'md' }: StarRatingProps) {
  return <StarPicker value={rating} onChange={() => undefined} readOnly size={size} />
}

export function AverageRating({ ratings }: { ratings: number[] }) {
  if (!ratings.length) return <span className="text-stone-400 text-sm">Noch keine Bewertungen</span>
  const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length
  return (
    <span className="flex items-center gap-2">
      <StarPicker value={avg} onChange={() => undefined} readOnly size="sm" />
      <span className="text-stone-600 text-sm font-medium">{avg.toFixed(1)}</span>
      <span className="text-stone-400 text-xs">({ratings.length})</span>
    </span>
  )
}
