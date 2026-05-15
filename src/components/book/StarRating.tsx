import { memo, useMemo } from 'react'
import { StarPicker } from '@/components/ui/StarPicker'

interface StarRatingProps {
  rating: number
  size?: 'sm' | 'md'
}

const noop = () => undefined

export const StarRating = memo(function StarRating({ rating, size = 'md' }: StarRatingProps) {
  return <StarPicker value={rating} onChange={noop} readOnly size={size} />
})

interface AverageRatingProps {
  ratings: number[]
  onDark?: boolean
}

export const AverageRating = memo(function AverageRating({ ratings, onDark = false }: AverageRatingProps) {
  const avg = useMemo(
    () => ratings.reduce((a, b) => a + b, 0) / ratings.length,
    [ratings],
  )

  if (!ratings.length) return (
    <span className={`text-sm ${onDark ? 'text-white/50' : 'text-stone-400'}`}>
      Noch keine Bewertungen
    </span>
  )
  return (
    <span className="flex items-center gap-2">
      <StarPicker value={avg} onChange={noop} readOnly size="sm" />
      <span className={`text-sm font-medium ${onDark ? 'text-white/90' : 'text-stone-600'}`}>
        {avg.toFixed(1)}
      </span>
      <span className={`text-xs ${onDark ? 'text-white/50' : 'text-stone-400'}`}>
        ({ratings.length})
      </span>
    </span>
  )
})
