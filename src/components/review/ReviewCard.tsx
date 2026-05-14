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
    <div className="flex flex-col gap-2.5 bg-stone-50 dark:bg-white/[0.06] rounded-2xl p-3 border border-stone-100 dark:border-white/10">

      {/* Avatar + rating — mirrors emoji | mood in GroupProgress */}
      <div className="flex items-start justify-between">
        <span className="text-3xl leading-none">{review.profiles?.avatar_emoji ?? '📚'}</span>
        <div className="flex flex-col items-end gap-0.5">
          <span className="font-serif text-xl font-bold text-brand-600 dark:text-brand-400 leading-none">
            {Number(review.rating).toFixed(1)}
          </span>
          <StarRating rating={Number(review.rating)} size="sm" />
        </div>
      </div>

      {/* Name + one_word pill — mirrors name | status pill in GroupProgress */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-semibold text-stone-900 dark:text-white">
            {review.profiles?.display_name}
          </span>
          {review.contains_spoilers && <Badge variant="warning">Spoiler</Badge>}
        </div>
        {review.one_word && (
          <span className="self-start text-[10px] font-medium text-brand-500 dark:text-brand-300 bg-brand-50 dark:bg-brand-500/15 rounded-full px-1.5 py-0.5 border border-brand-200 dark:border-brand-500/20">
            „{review.one_word}"
          </span>
        )}
      </div>

      {/* Chips — mirrors the bar+% row */}
      {(review.emotional_impact || review.pace || review.would_reread != null) && (
        <div className="flex flex-wrap gap-1">
          {review.emotional_impact && (
            <span className="bg-stone-100 dark:bg-white/10 text-stone-500 dark:text-white/60 text-[10px] px-1.5 py-0.5 rounded-full">
              {IMPACT_LABELS[review.emotional_impact]} {review.emotional_impact}/5
            </span>
          )}
          {review.pace && (
            <span className="bg-stone-100 dark:bg-white/10 text-stone-500 dark:text-white/60 text-[10px] px-1.5 py-0.5 rounded-full">
              ⏱ {PACE_LABELS[review.pace]}
            </span>
          )}
          {review.would_reread != null && (
            <span className={[
              'text-[10px] px-1.5 py-0.5 rounded-full',
              review.would_reread
                ? 'bg-green-50 dark:bg-green-500/20 text-green-700 dark:text-green-400'
                : 'bg-stone-100 dark:bg-white/10 text-stone-400 dark:text-white/40',
            ].join(' ')}>
              {review.would_reread ? '↩ Nochmal' : '↩ Einmal reicht'}
            </span>
          )}
        </div>
      )}

      {/* Review text — expandable */}
      {review.review_text && (
        <ExpandableText
          text={review.review_text}
          lines={3}
          className="text-xs text-stone-600 dark:text-white/70 leading-relaxed"
          toggleClassName="text-stone-300 dark:text-white/30 hover:text-stone-500 dark:hover:text-white/60 text-[10px] mt-0.5 transition-colors"
        />
      )}

      {/* Quote — expandable */}
      {review.favorite_quote && (
        <div className="relative pl-4">
          <span className="absolute top-0 left-0 text-2xl text-brand-300 dark:text-brand-500/30 font-serif leading-none select-none" aria-hidden="true">"</span>
          <ExpandableText
            text={review.favorite_quote}
            lines={2}
            className="text-xs text-stone-500 dark:text-white/50 italic leading-relaxed"
            toggleClassName="text-stone-300 dark:text-white/30 hover:text-stone-500 dark:hover:text-white/60 text-[10px] mt-0.5 transition-colors"
          />
        </div>
      )}
    </div>
  )
}
