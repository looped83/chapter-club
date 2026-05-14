import { Badge } from '@/components/ui/Badge'
import { StarRating } from '@/components/book/StarRating'
import { ExpandableText } from '@/components/ui/ExpandableText'
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
    <div className="flex flex-col gap-3 bg-white/[0.06] rounded-2xl p-4 border border-white/10">

      {/* Header: Avatar + Rating */}
      <div className="flex items-start justify-between gap-2">
        <span className="text-3xl leading-none">{review.profiles?.avatar_emoji ?? '📚'}</span>
        <div className="flex flex-col items-end gap-0.5">
          <span className="font-serif text-2xl font-bold text-brand-400 leading-none">
            {Number(review.rating).toFixed(1)}
          </span>
          <StarRating rating={Number(review.rating)} size="sm" />
        </div>
      </div>

      {/* Name + spoiler */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-white">
          {review.profiles?.display_name}
        </span>
        {review.contains_spoilers && <Badge variant="warning">Spoiler</Badge>}
      </div>

      {/* One word — spotlight */}
      {review.one_word && (
        <p className="text-center text-sm font-semibold text-brand-300 bg-brand-500/15 rounded-xl py-2 border border-brand-500/20">
          „{review.one_word}"
        </p>
      )}

      {/* Wrapped chips */}
      {(review.emotional_impact || review.pace || review.would_reread != null) && (
        <div className="flex flex-wrap gap-1.5">
          {review.emotional_impact && (
            <span className="bg-white/10 text-white/60 text-xs px-2 py-0.5 rounded-full" title={`Emotionaler Impact: ${review.emotional_impact}/5`}>
              {IMPACT_LABELS[review.emotional_impact]} {review.emotional_impact}/5
            </span>
          )}
          {review.pace && (
            <span className="bg-white/10 text-white/60 text-xs px-2 py-0.5 rounded-full">
              ⏱ {PACE_LABELS[review.pace]}
            </span>
          )}
          {review.would_reread != null && (
            <span className={[
              'text-xs px-2 py-0.5 rounded-full',
              review.would_reread ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/40',
            ].join(' ')}>
              {review.would_reread ? '↩ Nochmal' : '↩ Nicht nochmal'}
            </span>
          )}
        </div>
      )}

      {/* Review text — expandable */}
      {review.review_text && (
        <ExpandableText
          text={review.review_text}
          lines={3}
          className="text-sm text-white/70 leading-relaxed"
          toggleClassName="text-white/30 hover:text-white/60 text-xs mt-0.5 transition-colors"
        />
      )}

      {/* Quote — decorative + expandable */}
      {review.favorite_quote && (
        <div className="relative pl-5">
          <span className="absolute top-0 left-0 text-3xl text-brand-500/30 font-serif leading-none select-none" aria-hidden="true">"</span>
          <ExpandableText
            text={review.favorite_quote}
            lines={2}
            className="text-sm text-white/50 italic leading-relaxed"
            toggleClassName="text-white/30 hover:text-white/60 text-xs mt-0.5 transition-colors"
          />
        </div>
      )}
    </div>
  )
}
