import type { ReadingProgressWithProfile } from '@/types/database'

interface GroupProgressProps {
  progressList: ReadingProgressWithProfile[]
}

const STATUS_EMOJI: Record<string, string> = {
  not_started: '📋',
  reading: '📖',
  finished: '✅',
  paused: '⏸️',
  abandoned: '❌',
}

export function GroupProgress({ progressList }: GroupProgressProps) {
  if (!progressList.length) {
    return (
      <p className="text-sm text-white/40 italic">Noch keine Fortschritte eingetragen.</p>
    )
  }

  const avg =
    progressList.reduce((sum, p) => sum + p.progress_percent, 0) / progressList.length

  return (
    <div className="flex flex-col gap-3">
      {/* Group average bar */}
      <div>
        <div className="flex justify-between mb-1.5">
          <span className="text-xs text-white/50 font-medium">Gruppenfortschritt</span>
          <span className="text-xs font-semibold text-brand-400">{Math.round(avg)}%</span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brand-400 to-brand-500 rounded-full transition-all duration-500"
            style={{ width: `${avg}%` }}
          />
        </div>
      </div>

      {/* Per-person progress */}
      <div className="flex flex-col gap-2">
        {progressList.map((p) => (
          <div key={p.id} className="flex items-center gap-3">
            <span className="text-lg w-8 text-center flex-shrink-0" aria-hidden="true">
              {p.profiles?.avatar_emoji ?? '📚'}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-medium text-white/70 truncate">
                  {p.profiles?.display_name ?? 'Unbekannt'}
                </span>
                <span className="flex items-center gap-1 text-xs text-white/40 flex-shrink-0">
                  {STATUS_EMOJI[p.status]} {p.progress_percent}%
                  {p.mood && <span className="ml-1">{p.mood}</span>}
                </span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-300 rounded-full transition-all duration-500"
                  style={{ width: `${p.progress_percent}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
