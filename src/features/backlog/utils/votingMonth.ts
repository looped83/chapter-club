export interface VotingTarget {
  month: number
  year: number
}

export function getVotingTarget(): VotingTarget {
  const now = new Date()
  const next = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  return { month: next.getMonth() + 1, year: next.getFullYear() }
}

export function isVotingOpen(): boolean {
  const now = new Date()
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
  return now <= end
}

export function getDaysUntilVotingEnd(): number {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() - now.getDate()
}
