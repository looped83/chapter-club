import type { BacklogBook, BacklogVote } from '../types'

/**
 * Determines the winning book for a given voting month.
 *
 * Rules:
 * 1. Only active books are eligible.
 * 2. Only votes for the specified targetMonth/targetYear are counted.
 * 3. Book with the most votes wins.
 * Tie-breakers (applied in order):
 *   1. Higher vote count
 *   2. Earliest created_at (older suggestion wins)
 *   3. Lexicographically smaller id (deterministic final tie-breaker)
 *
 * Returns null if there are no active books or no votes for the target month.
 */
export function getVotingWinner(
  books: BacklogBook[],
  votes: BacklogVote[],
  targetMonth: number,
  targetYear: number,
): BacklogBook | null {
  const activeBooks = books.filter((b) => b.status === 'active')
  if (activeBooks.length === 0) return null

  const monthVotes = votes.filter(
    (v) => v.target_month === targetMonth && v.target_year === targetYear,
  )
  if (monthVotes.length === 0) return null

  const voteCounts = new Map<string, number>()
  for (const vote of monthVotes) {
    voteCounts.set(vote.suggestion_id, (voteCounts.get(vote.suggestion_id) ?? 0) + 1)
  }

  const candidates = activeBooks.filter((b) => (voteCounts.get(b.id) ?? 0) > 0)
  if (candidates.length === 0) return null

  return candidates.reduce((best, challenger) => {
    const cVotes = voteCounts.get(challenger.id) ?? 0
    const bVotes = voteCounts.get(best.id) ?? 0

    if (cVotes > bVotes) return challenger
    if (cVotes < bVotes) return best

    const cTime = new Date(challenger.created_at).getTime()
    const bTime = new Date(best.created_at).getTime()
    if (cTime < bTime) return challenger
    if (cTime > bTime) return best

    return challenger.id < best.id ? challenger : best
  })
}
