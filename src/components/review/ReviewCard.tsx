import { Badge } from '@/components/ui/Badge'
import { StarRating } from '@/components/book/StarRating'
import type { ReviewWithProfile, Pace } from '@/types/database'

interface ReviewCardProps {
  review: ReviewWithProfile
}

const PACE_LABELS: Record<Pace, string> = {
  too_slow: 'Zu langsam',
  just_right: 'Genau richtig',
  too_fast: 'Zu schnell',
}

const IMPACT_LABELS = ['', '😐', '🙂', '😮', '😢', '🤯']

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <div className="flex flex-col gap-3 p-4 bg-stone-50 rounded-2xl border border-stone-100">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xl" aria-hidden="true">{review.profiles?.avatar_emoji ?? '📚'}</span>
          <span className="font-medium text-stone-800 text-sm">{review.profiles?.display_name}</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <StarRating rating={Number(review.rating)} size="sm" />
          <span className="text-sm font-semibold text-stone-700">{Number(review.rating).toFixed(1)}</span>
          {review.contains_spoilers && <Badge variant="warning">Spoiler</Badge>}
        </div>
      </div>

      {/* Wrapped-Felder */}
      {(review.emotional_impact || review.pace || review.would_reread != null || review.one_word) && (
        <div className="flex flex-wrap gap-2">
          {review.one_word && (
            <span className="bg-brand-50 text-brand-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-brand-100">
              „{review.one_word}"
            </span>
          )}
          {review.emotional_impact && (
            <span className="bg-stone-100 text-stone-600 text-xs px-2.5 py-1 rounded-full" title={`Emotionaler Impact: ${review.emotional_impact}/5`}>
              {IMPACT_LABELS[review.emotional_impact]} Impact {review.emotional_impact}/5
            </span>
          )}
          {review.pace && (
            <span className="bg-stone-100 text-stone-600 text-xs px-2.5 py-1 rounded-full">
              ⏱ {PACE_LABELS[review.pace]}
            </span>
          )}
          {review.would_reread != null && (
            <span className={[
              'text-xs px-2.5 py-1 rounded-full',
              review.would_reread
                ? 'bg-green-50 text-green-700'
                : 'bg-stone-100 text-stone-500',
            ].join(' ')}>
              {review.would_reread ? '↩ Nochmal lesen' : '↩ Nicht nochmal'}
            </span>
          )}
        </div>
      )}

      {/* Review Text */}
      {review.review_text && (
        <p className="text-sm text-stone-700 leading-relaxed">{review.review_text}</p>
      )}

      {/* Quote */}
      {review.favorite_quote && (
        <blockquote className="border-l-2 border-brand-300 pl-3 text-sm text-stone-500 italic">
          „{review.favorite_quote}"
        </blockquote>
      )}
    </div>
  )
}
