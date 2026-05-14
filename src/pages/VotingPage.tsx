import { useState } from 'react'
import { useSuggestions, useMyVote, useCastVote } from '@/hooks/useVoting'
import { useAuth } from '@/lib/AuthContext'
import { PageSpinner } from '@/components/ui/Spinner'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { SuggestionCard } from '@/components/voting/SuggestionCard'
import { SuggestionForm } from '@/components/voting/SuggestionForm'
import type { BookSuggestionWithProfile } from '@/types/database'

function getVotingMonth(): { month: number; year: number } {
  const now = new Date()
  const next = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  return { month: next.getMonth() + 1, year: next.getFullYear() }
}

function isVotingOpen(): boolean {
  return new Date() <= new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59)
}

function getWinner(suggestions: BookSuggestionWithProfile[]): BookSuggestionWithProfile | null {
  if (!suggestions.length) return null
  return suggestions.reduce((best, s) => {
    if (s.vote_count > best.vote_count) return s
    if (s.vote_count === best.vote_count) {
      return new Date(s.created_at) < new Date(best.created_at) ? s : best
    }
    return best
  })
}

const MONTH_NAMES = [
  '', 'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
]

export function VotingPage() {
  const { user } = useAuth()
  const { month, year } = getVotingMonth()
  const votingOpen = isVotingOpen()

  const { data: suggestions = [], isLoading } = useSuggestions(month, year)
  const { data: myVote } = useMyVote(user?.id ?? '', month, year)
  const castVote = useCastVote(month, year)

  const [showForm, setShowForm] = useState(false)
  const hasMysuggestion = suggestions.some((s) => s.suggested_by === user?.id)

  const winner = getWinner(suggestions)

  if (isLoading) return <PageSpinner />

  const myVoteId = myVote?.suggestion_id ?? null

  async function handleVote(suggestionId: string) {
    if (!user || !votingOpen) return
    await castVote.mutateAsync({ userId: user.id, suggestionId })
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl font-bold text-stone-900">Voting</h1>
        <p className="text-stone-500 text-sm mt-0.5">
          Nächster Monat: {MONTH_NAMES[month]} {year}
        </p>
      </div>

      {/* Status banner */}
      <Card className="p-4">
        {votingOpen ? (
          <div className="flex items-center gap-3">
            <span className="text-2xl">🗳️</span>
            <div>
              <p className="font-medium text-stone-900 text-sm">Voting läuft</p>
              <p className="text-xs text-stone-500">Bis Monatsende abstimmen</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏁</span>
            <div>
              <p className="font-medium text-stone-900 text-sm">Voting beendet</p>
              {winner && (
                <p className="text-xs text-brand-600">
                  Gewinner: <strong>{winner.title}</strong>
                </p>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* Vorschlag einreichen */}
      {votingOpen && !hasMysuggestion && (
        <div>
          <Button
            variant={showForm ? 'secondary' : 'primary'}
            onClick={() => setShowForm((v) => !v)}
          >
            {showForm ? 'Abbrechen' : '+ Buch vorschlagen'}
          </Button>

          {showForm && (
            <Card className="p-5 mt-4">
              <h2 className="font-semibold text-stone-900 mb-4">Buch vorschlagen</h2>
              <SuggestionForm month={month} year={year} onSubmitted={() => setShowForm(false)} />
            </Card>
          )}
        </div>
      )}

      {hasMysuggestion && votingOpen && (
        <p className="text-sm text-stone-500 bg-stone-50 rounded-xl px-4 py-3">
          ✓ Du hast bereits einen Vorschlag eingereicht.
        </p>
      )}

      {/* Suggestions list */}
      {suggestions.length === 0 ? (
        <div className="text-center py-12 text-stone-400">
          <div className="text-4xl mb-3">📬</div>
          <p className="text-sm">Noch keine Vorschläge für {MONTH_NAMES[month]}.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <h2 className="font-semibold text-stone-900">
            Vorschläge ({suggestions.length})
          </h2>
          {[...suggestions]
            .sort((a, b) => b.vote_count - a.vote_count)
            .map((s) => (
              <SuggestionCard
                key={s.id}
                suggestion={s}
                isWinner={!votingOpen && winner?.id === s.id}
                myVoteId={myVoteId}
                onVote={handleVote}
                votingOpen={votingOpen}
                isVoting={castVote.isPending}
              />
            ))}
        </div>
      )}
    </div>
  )
}
