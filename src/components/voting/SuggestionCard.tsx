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
    <div
      className={[
        'bg-white rounded-2xl border p-4 flex gap-4 transition-all',
        isWinner ? 'border-brand-300 ring-2 ring-brand-200 shadow-md' : 'border-stone-100 shadow-sm',
      ].join(' ')}
    >
      {/* Cover */}
      <div className="flex-shrink-0 w-16 rounded-xl overflow-hidden shadow-sm self-start">
        <BookCover title={suggestion.title} coverUrl={suggestion.cover_url} className="w-full aspect-[2/3]" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            {isWinner && (
              <span className="inline-block text-xs font-semibold text-brand-700 bg-brand-100 rounded-full px-2 py-0.5 mb-1">
                🏆 Gewinner
              </span>
            )}
            <h3 className="font-semibold text-stone-900 leading-tight">{suggestion.title}</h3>
            <p className="text-sm text-stone-500">{suggestion.author}</p>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0 text-sm font-medium text-stone-600">
            <span>🗳️</span>
            <span>{suggestion.vote_count}</span>
          </div>
        </div>

        <p className="text-xs text-stone-500">
          vorgeschlagen von {suggestion.profiles?.avatar_emoji} {suggestion.profiles?.display_name}
        </p>

        {suggestion.reason && (
          <p className="text-sm text-stone-600 italic leading-relaxed">„{suggestion.reason}"</p>
        )}

        {suggestion.description && (
          <p className="text-xs text-stone-500 leading-relaxed line-clamp-2">{suggestion.description}</p>
        )}

        {votingOpen && (
          <Button
            variant={hasMyVote ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => onVote(suggestion.id)}
            loading={isVoting && hasMyVote}
            className="self-start mt-1"
          >
            {hasMyVote ? '✓ Meine Stimme' : 'Abstimmen'}
          </Button>
        )}
      </div>
    </div>
  )
}
