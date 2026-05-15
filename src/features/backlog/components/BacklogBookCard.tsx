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

      {/* Owner actions – absolute bottom-right */}
      {isOwner && isActive && (
        <div className="absolute bottom-3 right-3 z-10 flex flex-col items-end gap-1">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="text-xs text-white/40 hover:text-white/70 transition-colors underline underline-offset-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/50 rounded"
            >
              Bearbeiten
            </button>
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`„${book.title}" aus der Leseliste entfernen?`)) {
                  archive.mutate(book.id)
                }
              }}
              disabled={archive.isPending}
              className="text-xs text-white/30 hover:text-red-400 transition-colors underline underline-offset-2 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/50 rounded"
            >
              Entfernen
            </button>
          </div>
          {archive.isError && (
            <p role="alert" className="text-[10px] text-red-400">
              {ERROR_MESSAGES.deleteFailed}
            </p>
          )}
        </div>
      )}

      {/* Content */}
      <div className={cn('relative z-10 p-4 flex gap-4', isOwner && isActive && (archive.isError ? 'pb-12' : 'pb-9'))}>
        {/* Cover */}
        <div className="flex-shrink-0 w-16 rounded-xl overflow-hidden shadow-xl ring-2 ring-white/20 self-start">
          <BookCover title={book.title} coverUrl={book.cover_url} className="w-full aspect-[2/3]" />
        </div>

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
            <div className="flex items-center gap-1 flex-shrink-0 text-sm font-semibold text-white/80 bg-white/10 rounded-full px-2.5 py-0.5">
              <span aria-hidden="true">🗳️</span>
              <span aria-label={`${book.vote_count} Stimmen`}>{book.vote_count}</span>
            </div>
          </div>

          <p className="text-xs text-white/50">
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
              toggleClassName="text-white/30 hover:text-white/60 text-xs mt-0.5 transition-colors"
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
