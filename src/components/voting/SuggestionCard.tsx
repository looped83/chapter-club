import { BookCover } from '@/components/book/BookCover'
import { Button } from '@/components/ui/Button'
import type { BookSuggestionWithProfile } from '@/types/database'

interface SuggestionCardProps {
  suggestion: BookSuggestionWithProfile
  isWinner?: boolean
  myVoteId: string | null
  onVote: (id: string) => void
  votingOpen: boolean
  isVoting: boolean
}

export function SuggestionCard({
  suggestion,
  isWinner,
  myVoteId,
  onVote,
  votingOpen,
  isVoting,
}: SuggestionCardProps) {
  const hasMyVote = myVoteId === suggestion.id

  return (
    <div className={[
      'relative overflow-hidden rounded-2xl transition-all',
      isWinner ? 'ring-2 ring-brand-400' : '',
    ].join(' ')}>

      {/* Blurred cover background */}
      {suggestion.cover_url ? (
        <div
          className="absolute inset-0 scale-110"
          style={{
            backgroundImage: `url(${suggestion.cover_url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(24px)',
          }}
          aria-hidden="true"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-brand-300 via-brand-400 to-stone-500" aria-hidden="true" />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/80" aria-hidden="true" />

      {/* Content */}
      <div className="relative z-10 p-4 flex gap-4">
        {/* Cover */}
        <div className="flex-shrink-0 w-16 rounded-xl overflow-hidden shadow-xl ring-2 ring-white/20 self-start">
          <BookCover title={suggestion.title} coverUrl={suggestion.cover_url} className="w-full aspect-[2/3]" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              {isWinner && (
                <span className="inline-block text-xs font-semibold text-brand-300 mb-1">
                  🏆 Gewinner
                </span>
              )}
              <h3 className="font-serif font-bold text-white leading-tight">{suggestion.title}</h3>
              <p className="text-sm text-white/70">{suggestion.author}</p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0 text-sm font-semibold text-white/80 bg-white/10 rounded-full px-2.5 py-0.5">
              <span>🗳️</span>
              <span>{suggestion.vote_count}</span>
            </div>
          </div>

          <p className="text-xs text-white/50">
            vorgeschlagen von {suggestion.profiles?.avatar_emoji} {suggestion.profiles?.display_name}
          </p>

          {suggestion.reason && (
            <p className="text-sm text-white/70 italic leading-relaxed">„{suggestion.reason}"</p>
          )}

          {suggestion.description && (
            <p className="text-xs text-white/50 leading-relaxed line-clamp-2">{suggestion.description}</p>
          )}

          {votingOpen && (
            <div className="mt-1">
              <Button
                variant={hasMyVote ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => onVote(suggestion.id)}
                loading={isVoting && hasMyVote}
                className={hasMyVote ? '' : 'bg-white/15 border-white/20 text-white hover:bg-white/25'}
              >
                {hasMyVote ? '✓ Meine Stimme' : 'Abstimmen'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
