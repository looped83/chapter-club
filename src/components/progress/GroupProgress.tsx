import { useMemo } from 'react'
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
  not_started: 'text-stone-400 dark:text-white/40 bg-stone-100 dark:bg-white/10',
  reading: 'text-brand-600 dark:text-brand-300 bg-brand-50 dark:bg-brand-500/20',
  finished: 'text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-500/20',
  paused: 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/20',
  abandoned: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/20',
}

const BAR_COLOR: Record<string, string> = {
  not_started: 'bg-stone-300 dark:bg-white/20',
  reading: 'bg-gradient-to-r from-brand-400 to-brand-500',
  finished: 'bg-gradient-to-r from-green-400 to-green-500',
  paused: 'bg-gradient-to-r from-amber-400 to-amber-500',
  abandoned: 'bg-gradient-to-r from-red-400 to-red-500',
}

export function GroupProgress({ progressList }: GroupProgressProps) {
  if (!progressList.length) {
    return (
      <p className="text-sm text-stone-400 dark:text-white/40 italic">
        Noch keine Fortschritte eingetragen.
      </p>
    )
  }

  const { avg, sorted } = useMemo(() => {
    const sorted = [...progressList].sort((a, b) => b.progress_percent - a.progress_percent)
    const avg = progressList.reduce((sum, p) => sum + p.progress_percent, 0) / progressList.length
    return { avg, sorted }
  }, [progressList])

  return (
    <div className="flex flex-col gap-4">
      {/* Group average */}
      <div className="flex items-end gap-3">
        <p className="font-serif text-4xl font-bold text-stone-900 dark:text-white leading-none" aria-label={`Gruppendurchschnitt: ${Math.round(avg)} Prozent`}>
          {Math.round(avg)}
          <span className="text-2xl font-bold text-brand-500 dark:text-brand-400" aria-hidden="true">%</span>
        </p>
        <div className="flex-1 pb-1.5">
          <div
            className="h-2.5 bg-stone-100 dark:bg-white/10 rounded-full overflow-hidden"
            role="progressbar"
            aria-valuenow={Math.round(avg)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Gruppenfortschritt"
          >
            <div
              className="h-full bg-gradient-to-r from-brand-400 to-brand-500 rounded-full transition-all duration-700"
              style={{ width: `${avg}%` }}
            />
          </div>
        </div>
        <p className="text-xs text-stone-400 dark:text-white/40 pb-1.5 flex-shrink-0" aria-hidden="true">Ø Gruppe</p>
      </div>

      {/* Per-person rows – all in one tile */}
      <div className="flex flex-col gap-3">
        {sorted.map((p) => (
          <div key={p.id} className="flex items-center gap-3">
            {/* Avatar + name */}
            <div className="flex items-center gap-2 w-24 flex-shrink-0">
              <span className="text-xl leading-none flex-shrink-0" aria-hidden="true">
                {p.profiles?.avatar_emoji ?? '📚'}
              </span>
              <span className="text-xs font-semibold text-stone-800 dark:text-white/90 truncate">
                {p.profiles?.display_name?.split(' ')[0] ?? '–'}
              </span>
            </div>

            {/* Status pill */}
            <span
              className={[
                'text-[10px] font-medium px-1.5 py-0.5 rounded-full flex-shrink-0',
                STATUS_COLOR[p.status] ??
                  'text-stone-500 dark:text-white/40 bg-stone-100 dark:bg-white/10',
              ].join(' ')}
            >
              {STATUS_LABEL[p.status] ?? p.status}
            </span>

            {/* Progress bar */}
            <div
              className="flex-1 h-2.5 bg-stone-100 dark:bg-white/10 rounded-full overflow-hidden"
              role="progressbar"
              aria-valuenow={p.progress_percent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${p.profiles?.display_name?.split(' ')[0] ?? 'Person'}: ${p.progress_percent}%`}
            >
              <div
                className={[
                  'h-full rounded-full transition-all duration-500',
                  BAR_COLOR[p.status] ?? 'bg-brand-400',
                ].join(' ')}
                style={{ width: `${p.progress_percent}%` }}
              />
            </div>

            {/* Percentage */}
            <div className="w-10 text-right flex-shrink-0">
              <span className="font-serif text-sm font-bold text-brand-600 dark:text-brand-400 leading-none">
                {p.progress_percent}
              </span>
              <span className="text-xs font-bold text-brand-500 dark:text-brand-400">%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
