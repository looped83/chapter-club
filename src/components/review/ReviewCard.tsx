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
    <div className="flex flex-col gap-3 p-4 bg-white/[0.05] rounded-2xl border border-white/10">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xl" aria-hidden="true">{review.profiles?.avatar_emoji ?? '📚'}</span>
          <span className="font-medium text-white text-sm">{review.profiles?.display_name}</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <StarRating rating={Number(review.rating)} size="sm" />
          <span className="text-sm font-semibold text-white/60">{Number(review.rating).toFixed(1)}</span>
          {review.contains_spoilers && <Badge variant="warning">Spoiler</Badge>}
        </div>
      </div>

      {/* Wrapped-Felder */}
      {(review.emotional_impact || review.pace || review.would_reread != null || review.one_word) && (
        <div className="flex flex-wrap gap-2">
          {review.one_word && (
            <span className="bg-brand-500/20 text-brand-300 text-xs font-semibold px-2.5 py-1 rounded-full border border-brand-500/30">
              „{review.one_word}"
            </span>
          )}
          {review.emotional_impact && (
            <span className="bg-white/10 text-white/60 text-xs px-2.5 py-1 rounded-full" title={`Emotionaler Impact: ${review.emotional_impact}/5`}>
              {IMPACT_LABELS[review.emotional_impact]} Impact {review.emotional_impact}/5
            </span>
          )}
          {review.pace && (
            <span className="bg-white/10 text-white/60 text-xs px-2.5 py-1 rounded-full">
              ⏱ {PACE_LABELS[review.pace]}
            </span>
          )}
          {review.would_reread != null && (
            <span className={[
              'text-xs px-2.5 py-1 rounded-full',
              review.would_reread
                ? 'bg-green-500/20 text-green-400'
                : 'bg-white/10 text-white/40',
            ].join(' ')}>
              {review.would_reread ? '↩ Nochmal lesen' : '↩ Nicht nochmal'}
            </span>
          )}
        </div>
      )}

      {/* Review Text */}
      {review.review_text && (
        <p className="text-sm text-white/70 leading-relaxed">{review.review_text}</p>
      )}

      {/* Quote */}
      {review.favorite_quote && (
        <blockquote className="border-l-2 border-brand-400/50 pl-3 text-sm text-white/50 italic">
          „{review.favorite_quote}"
        </blockquote>
      )}
    </div>
  )
}
