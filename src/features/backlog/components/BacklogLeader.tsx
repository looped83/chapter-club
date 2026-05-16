import { Card } from '@/components/ui/Card'
import { BookCover } from '@/components/book/BookCover'
import { MONTH_NAMES } from '@/lib/constants'
import type { BacklogBookWithVotes } from '../types'

interface BacklogLeaderProps {
  leader: BacklogBookWithVotes
  targetMonth: number
  targetYear: number
  votingOpen: boolean
}

export function BacklogLeader({ leader, targetMonth, targetYear, votingOpen }: BacklogLeaderProps) {
  return (
    <Card as="section" className="p-4" aria-label={votingOpen ? 'Aktuell führendes Buch' : 'Gewinnerbuch'}>
      <p className="text-xs text-stone-500 dark:text-white/50 font-medium uppercase tracking-wide mb-3">
        <span aria-hidden="true">{votingOpen ? '📊' : '🏆'}</span>{' '}
        {votingOpen ? 'Aktuell führend' : 'Gewinner'} · {MONTH_NAMES[targetMonth]}{' '}
        {targetYear}
      </p>
      <div className="flex items-center gap-3">
        <div className="w-10 flex-shrink-0 rounded-lg overflow-hidden">
          <BookCover title={leader.title} coverUrl={leader.cover_url} className="w-full aspect-[2/3]" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-serif font-bold text-stone-900 dark:text-white truncate">{leader.title}</p>
          <p className="text-sm text-stone-500 dark:text-white/50 truncate">{leader.author}</p>
        </div>
        <div className="flex items-center gap-1 text-brand-600 dark:text-brand-400 font-bold text-lg flex-shrink-0">
          <span aria-hidden="true">🗳️</span>
          <span aria-label={`${leader.vote_count} Stimmen`}>{leader.vote_count}</span>
        </div>
      </div>
      {votingOpen && (
        <p className="text-xs text-stone-500 dark:text-white/60 mt-3">
          Das Ergebnis ist bis Monatsende offen – deine Stimme zählt!
        </p>
      )}
    </Card>
  )
}
