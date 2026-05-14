import type { ReadingProgressWithProfile } from '@/types/database'

interface GroupProgressProps {
  progressList: ReadingProgressWithProfile[]
}

const STATUS_LABEL: Record<string, string> = {
  not_started: 'Noch nicht',
  reading: 'Am Lesen',
  finished: 'Fertig',
  paused: 'Pausiert',
  abandoned: 'Abgebrochen',
}

const STATUS_COLOR: Record<string, string> = {
  not_started: 'text-stone-500 dark:text-white/40 bg-stone-100 dark:bg-white/10',
  reading: 'text-brand-600 dark:text-brand-300 bg-brand-50 dark:bg-brand-500/20',
  finished: 'text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-500/20',
  paused: 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/20',
  abandoned: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/20',
}

export function GroupProgress({ progressList }: GroupProgressProps) {
  if (!progressList.length) {
    return (
      <p className="text-sm text-stone-400 dark:text-white/40 italic">Noch keine Fortschritte eingetragen.</p>
    )
  }

  const avg =
    progressList.reduce((sum, p) => sum + p.progress_percent, 0) / progressList.length

  return (
    <div className="flex flex-col gap-5">
      {/* Group average — prominent */}
      <div className="flex items-end gap-4">
        <div>
          <p className="text-xs text-stone-400 dark:text-white/40 font-medium uppercase tracking-widest mb-0.5">Gruppe</p>
          <p className="font-serif text-4xl font-bold text-stone-900 dark:text-white leading-none">{Math.round(avg)}<span className="text-2xl text-stone-400 dark:text-white/50">%</span></p>
        </div>
        <div className="flex-1 pb-1">
          <div className="h-2.5 bg-stone-100 dark:bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-400 to-brand-500 rounded-full transition-all duration-700"
              style={{ width: `${avg}%` }}
            />
          </div>
        </div>
      </div>

      {/* Per-person tiles */}
      <div className="grid grid-cols-2 gap-3">
        {progressList.map((p) => (
          <div key={p.id} className="flex flex-col gap-2.5 bg-stone-50 dark:bg-white/[0.06] rounded-2xl p-3">
            {/* Avatar + mood */}
            <div className="flex items-start justify-between">
              <span className="text-3xl leading-none">{p.profiles?.avatar_emoji ?? '📚'}</span>
              {p.mood && <span className="text-xl leading-none">{p.mood}</span>}
            </div>

            {/* Name + status */}
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-stone-900 dark:text-white truncate">
                {p.profiles?.display_name ?? 'Unbekannt'}
              </span>
              <span className={[
                'self-start text-[10px] font-medium px-1.5 py-0.5 rounded-full',
                STATUS_COLOR[p.status] ?? 'text-stone-500 dark:text-white/40 bg-stone-100 dark:bg-white/10',
              ].join(' ')}>
                {STATUS_LABEL[p.status] ?? p.status}
              </span>
            </div>

            {/* Progress bar + percent */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <div className="h-2 flex-1 bg-stone-100 dark:bg-white/10 rounded-full overflow-hidden mr-2">
                  <div
                    className="h-full bg-brand-400 rounded-full transition-all duration-500"
                    style={{ width: `${p.progress_percent}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-brand-600 dark:text-brand-400 flex-shrink-0 w-8 text-right">
                  {p.progress_percent}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
