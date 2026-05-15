import { useState, useMemo, useCallback } from 'react'

const DOT_PATTERN_STYLE = {
  backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
  backgroundSize: '20px 20px',
} as const
import { useAuth } from '@/lib/AuthContext'
import { PageSpinner } from '@/components/ui/Spinner'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ERROR_MESSAGES, MONTH_NAMES } from '@/lib/constants'
import { useBacklogBooks, useCastBacklogVote } from '@/features/backlog/hooks/useBacklog'
import { BacklogBookCard } from '@/features/backlog/components/BacklogBookCard'
import { BacklogAddForm } from '@/features/backlog/components/BacklogAddForm'
import { BacklogEmptyState } from '@/features/backlog/components/BacklogEmptyState'
import { BacklogLeader } from '@/features/backlog/components/BacklogLeader'
import {
  getVotingTarget,
  isVotingOpen,
  getDaysUntilVotingEnd,
} from '@/features/backlog/utils/votingMonth'

export function VotingPage() {
  const { user } = useAuth()
  const { month, year } = getVotingTarget()
  const votingOpen = isVotingOpen()
  const daysLeft = getDaysUntilVotingEnd()

  const { data: books = [], isLoading } = useBacklogBooks(user?.id ?? '')
  const castVote = useCastBacklogVote()

  const [showAddForm, setShowAddForm] = useState(false)

  const activeBooks = useMemo(() => books.filter((b) => b.status === 'active'), [books])

  const sortedBooks = useMemo(
    () =>
      [...activeBooks].sort(
        (a, b) =>
          b.vote_count - a.vote_count ||
          a.created_at.localeCompare(b.created_at) ||
          a.id.localeCompare(b.id),
      ),
    [activeBooks],
  )

  const myVotedBookId = activeBooks.find((b) => b.is_my_vote)?.id ?? null
  const leader = sortedBooks.find((b) => b.vote_count > 0) ?? null
  const winner = !votingOpen && sortedBooks[0]?.vote_count ? sortedBooks[0] : null

  const handleVote = useCallback(async (bookId: string) => {
    if (!user || !votingOpen) return
    try {
      await castVote.mutateAsync({
        userId: user.id,
        bookId,
        targetMonth: month,
        targetYear: year,
      })
    } catch {
      // error shown via castVote.isError below
    }
  }, [user, votingOpen, castVote, month, year])

  if (isLoading) return <PageSpinner />

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl font-bold text-stone-900 dark:text-white">
          Leseliste
        </h1>
        <p className="text-stone-500 dark:text-white/50 text-sm mt-0.5">
          Gemeinsame Wunschliste · Voting für {MONTH_NAMES[month]} {year}
        </p>
      </div>

      {/* Status Banner */}
      {votingOpen ? (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 p-5 shadow-lg shadow-brand-500/25">
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={DOT_PATTERN_STYLE}
            aria-hidden="true"
          />
          <div className="relative flex items-center gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl" aria-hidden="true">
              🗳️
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-60" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                </span>
                <p className="font-bold text-white text-base">Voting läuft!</p>
              </div>
              <p className="text-white/75 text-xs">
                Welches Buch lesen wir im {MONTH_NAMES[month]} {year}?
              </p>
            </div>
            <div className="flex-shrink-0 text-right" aria-label={`${daysLeft} Tage verbleibend`}>
              <p className="font-serif text-4xl font-bold text-white leading-none">{daysLeft}</p>
              <p className="text-white/60 text-[11px] mt-0.5">
                {daysLeft === 1 ? 'Tag' : 'Tage'}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl" aria-hidden="true">🏁</span>
            <div>
              <p className="font-medium text-stone-900 dark:text-white text-sm">Voting beendet</p>
              {winner ? (
                <p className="text-xs text-brand-600 dark:text-brand-400">
                  Gewinner: <strong>{winner.title}</strong>
                </p>
              ) : (
                <p className="text-xs text-stone-500 dark:text-white/50">
                  Keine Stimmen abgegeben
                </p>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Current Leader (during voting) */}
      {votingOpen && leader && (
        <BacklogLeader
          leader={leader}
          targetMonth={month}
          targetYear={year}
          votingOpen={true}
        />
      )}

      {/* Winner (after voting ends) */}
      {!votingOpen && winner && (
        <BacklogLeader
          leader={winner}
          targetMonth={month}
          targetYear={year}
          votingOpen={false}
        />
      )}

      {/* Add Book */}
      <div>
        {!showAddForm && (
          <Button variant="primary" onClick={() => setShowAddForm(true)}>
            + Buch hinzufügen
          </Button>
        )}

        {showAddForm && (
          <Card className="p-5">
            <h2 className="font-semibold text-stone-900 dark:text-white mb-4">
              Buch zur Leseliste hinzufügen
            </h2>
            <BacklogAddForm
              onSuccess={() => setShowAddForm(false)}
              onCancel={() => setShowAddForm(false)}
            />
          </Card>
        )}
      </div>

      {/* Book List */}
      {activeBooks.length === 0 ? (
        <BacklogEmptyState onAddClick={() => setShowAddForm(true)} />
      ) : (
        <div className="flex flex-col gap-4">
          <h2 className="font-semibold text-stone-900 dark:text-white">
            Leseliste ({activeBooks.length})
          </h2>
          <ul className="flex flex-col gap-4 list-none m-0 p-0">
            {sortedBooks.map((book) => (
              <li key={book.id}>
                <BacklogBookCard
                  book={book}
                  currentUserId={user?.id ?? ''}
                  myVotedBookId={myVotedBookId}
                  onVote={handleVote}
                  votingOpen={votingOpen}
                  isVoting={castVote.isPending}
                  isWinner={!votingOpen && winner?.id === book.id}
                />
              </li>
            ))}
          </ul>
        </div>
      )}

      {castVote.isError && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400 text-center">
          {ERROR_MESSAGES.voteFailed}
        </p>
      )}
    </div>
  )
}
