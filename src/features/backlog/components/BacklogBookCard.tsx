import { useState, memo, useMemo } from 'react'
import { cn } from '@/lib/cn'
import { createBlurredBgStyle } from '@/lib/styles'
import { BookCover } from '@/components/book/BookCover'
import { Button } from '@/components/ui/Button'
import { ExpandableText } from '@/components/ui/ExpandableText'
import { useArchiveBacklogBook } from '../hooks/useBacklog'
import { BacklogEditForm } from './BacklogEditForm'
import { ERROR_MESSAGES } from '@/lib/constants'
import type { BacklogBookWithVotes } from '../types'

interface BacklogBookCardProps {
  book: BacklogBookWithVotes
  currentUserId: string
  myVotedBookId: string | null
  onVote: (bookId: string) => void
  votingOpen: boolean
  isVoting: boolean
  isWinner?: boolean
}

export const BacklogBookCard = memo(function BacklogBookCard({
  book,
  currentUserId,
  myVotedBookId,
  onVote,
  votingOpen,
  isVoting,
  isWinner,
}: BacklogBookCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const archive = useArchiveBacklogBook()

  const bgStyle = useMemo(() => createBlurredBgStyle(book.cover_url, 24), [book.cover_url])

  const isOwner = book.suggested_by === currentUserId
  const isActive = book.status === 'active'
  const hasMyVote = myVotedBookId === book.id
  const hasOtherVote = myVotedBookId !== null && myVotedBookId !== book.id

  if (isEditing) {
    return (
      <div className="rounded-2xl bg-white dark:bg-white/10 border border-stone-100 dark:border-white/10 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-stone-900 dark:text-white text-sm">Buch bearbeiten</h3>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            aria-label="Schließen"
            className="text-stone-400 dark:text-white/40 hover:text-stone-700 dark:hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <BacklogEditForm book={book} onSuccess={() => setIsEditing(false)} />
      </div>
    )
  }

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl transition-all',
        isWinner && 'ring-2 ring-brand-400',
      )}
    >
      {/* Blurred cover background */}
      {book.cover_url ? (
        <div
          className="absolute inset-0 scale-110"
          style={bgStyle}
          aria-hidden="true"
        />
      ) : (
        <div
          className="absolute inset-0 bg-gradient-to-br from-brand-300 via-brand-400 to-stone-500"
          aria-hidden="true"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/80" aria-hidden="true" />

      {/* Content */}
      <div className="relative z-10 p-4 flex gap-4">
        {/* Cover */}
        {book.cover_url && (
          <div className="flex-shrink-0 w-16 rounded-xl overflow-hidden shadow-xl ring-2 ring-white/20 self-start">
            <BookCover title={book.title} coverUrl={book.cover_url} className="w-full aspect-[2/3]" />
          </div>
        )}

        {/* Info */}
        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              {isWinner && (
                <span className="inline-block text-xs font-semibold text-brand-300 mb-1">
                  <span aria-hidden="true">🏆</span> Gewinner
                </span>
              )}
              {isOwner && isActive && !isWinner && (
                <span className="inline-block text-xs font-medium text-white/50 bg-white/10 rounded-full px-2 py-0.5 mb-1">
                  Dein Vorschlag
                </span>
              )}
              <h3 className="font-serif font-bold text-white leading-tight">{book.title}</h3>
              <p className="text-sm text-white/70">{book.author}</p>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <div className="flex items-center gap-1 text-sm font-semibold text-white/80 bg-white/10 rounded-full px-2.5 py-0.5">
                <span aria-hidden="true">🗳️</span>
                <span aria-label={`${book.vote_count} Stimmen`}>{book.vote_count}</span>
              </div>
              {isOwner && isActive && (
                <>
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    aria-label="Bearbeiten"
                    className="flex items-center justify-center w-7 h-7 rounded-full bg-white/10 hover:bg-white/25 text-white/70 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/50"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`„${book.title}" aus der Leseliste entfernen?`)) {
                        archive.mutate(book.id)
                      }
                    }}
                    disabled={archive.isPending}
                    aria-label="Entfernen"
                    className="flex items-center justify-center w-7 h-7 rounded-full bg-white/10 hover:bg-red-500/50 text-white/70 hover:text-white transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/50"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </>
              )}
            </div>
          </div>
          {archive.isError && (
            <p role="alert" className="text-[10px] text-red-400 mt-1">
              {ERROR_MESSAGES.deleteFailed}
            </p>
          )}

          <p className="text-xs text-white/70">
            vorgeschlagen von <span aria-hidden="true">{book.profiles?.avatar_emoji}</span> {book.profiles?.display_name}
          </p>

          {book.reason && (
            <p className="text-sm text-white/70 italic leading-relaxed">„{book.reason}"</p>
          )}

          {book.description && (
            <ExpandableText
              text={book.description}
              lines={2}
              className="text-xs text-white/50 leading-relaxed"
              toggleClassName="text-white/60 hover:text-white/90 text-xs mt-0.5 transition-colors"
            />
          )}

          {votingOpen && isActive && (
            <div className="mt-1">
              <Button
                variant={hasMyVote ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => onVote(book.id)}
                loading={isVoting && hasMyVote}
                className={
                  hasMyVote ? '' : 'bg-white/15 border-white/20 text-white hover:bg-white/25'
                }
              >
                {hasMyVote ? '✓ Meine Stimme' : hasOtherVote ? 'Stimme ändern' : 'Abstimmen'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
})
