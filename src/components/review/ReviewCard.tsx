import { Badge } from '@/components/ui/Badge'
import { StarRating } from '@/components/book/StarRating'
import type { ReviewWithProfile } from '@/types/database'

interface ReviewCardProps {
  review: ReviewWithProfile
}

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <div className="flex flex-col gap-2 p-4 bg-stone-50 rounded-2xl border border-stone-100">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xl" aria-hidden="true">{review.profiles?.avatar_emoji ?? '📚'}</span>
          <span className="font-medium text-stone-800 text-sm">{review.profiles?.display_name}</span>
        </div>
        <div className="flex items-center gap-2">
          <StarRating rating={review.rating} size="sm" />
          <span className="text-sm font-semibold text-stone-700">{review.rating}/10</span>
          {review.contains_spoilers && (
            <Badge variant="warning">Spoiler</Badge>
          )}
        </div>
      </div>

      {review.review_text && (
        <p className="text-sm text-stone-700 leading-relaxed">{review.review_text}</p>
      )}

      {review.favorite_quote && (
        <blockquote className="border-l-2 border-brand-300 pl-3 text-sm text-stone-500 italic">
          „{review.favorite_quote}"
        </blockquote>
      )}
    </div>
  )
}
