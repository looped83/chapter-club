interface StarRatingProps {
  rating: number
  max?: number
  size?: 'sm' | 'md'
}

export function StarRating({ rating, max = 10, size = 'md' }: StarRatingProps) {
  const stars = Math.round((rating / max) * 5)
  const sizeClass = size === 'sm' ? 'text-sm' : 'text-base'
  return (
    <span className={sizeClass} aria-label={`${rating} von ${max}`} title={`${rating}/10`}>
      {'★'.repeat(stars)}
      <span className="text-stone-300">{'★'.repeat(5 - stars)}</span>
    </span>
  )
}

export function AverageRating({ ratings }: { ratings: number[] }) {
  if (!ratings.length) return <span className="text-stone-400 text-sm">Noch keine Bewertungen</span>
  const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length
  return (
    <span className="flex items-center gap-1.5">
      <StarRating rating={avg} />
      <span className="text-stone-600 text-sm font-medium">{avg.toFixed(1)}</span>
      <span className="text-stone-400 text-xs">({ratings.length})</span>
    </span>
  )
}
