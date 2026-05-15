import { useState, useCallback, memo } from 'react'
import { cn } from '@/lib/cn'
import { useUpsertProgress } from '@/hooks/useBookProgress'
import { useAuth } from '@/lib/AuthContext'
import { Button } from '@/components/ui/Button'
import { READING_STATUS_LABELS, ERROR_MESSAGES } from '@/lib/constants'
import type { ReadingProgress, ReadingStatus } from '@/types/database'

const FORM_STATUSES: ReadingStatus[] = ['not_started', 'reading', 'finished', 'paused', 'abandoned']

interface ProgressSliderProps {
  bookId: string
  current: ReadingProgress | null
  onSaved?: () => void
}

export const ProgressSlider = memo(function ProgressSlider({ bookId, current, onSaved }: ProgressSliderProps) {
  const { user } = useAuth()
  const [percent, setPercent] = useState(current?.progress_percent ?? 0)
  const [status, setStatus] = useState<ReadingStatus>(current?.status ?? 'not_started')
  const [saved, setSaved] = useState(false)

  const upsert = useUpsertProgress()

  const handlePercentChange = useCallback((val: number) => {
    setPercent(val)
    if (val > 0 && status === 'not_started') setStatus('reading')
    setSaved(false)
  }, [status])

  const handleSave = useCallback(async () => {
    if (!user) return
    try {
      await upsert.mutateAsync({ bookId, userId: user.id, progressPercent: percent, status, mood: current?.mood ?? null })
      setSaved(true)
      onSaved?.()
    } catch {
      // error displayed via upsert.isError
    }
  }, [user, upsert, bookId, percent, status, current?.mood, onSaved])

  return (
    <div className="flex flex-col gap-4">
      {/* Percent slider */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label htmlFor="progress-slider" className="text-sm font-medium text-stone-700 dark:text-white/70">
            Lesefortschritt
          </label>
          <span className="text-sm font-semibold text-brand-600 dark:text-brand-400">{percent}%</span>
        </div>
        <input
          id="progress-slider"
          type="range"
          min={0}
          max={100}
          step={5}
          value={percent}
          onChange={(e) => handlePercentChange(Number(e.target.value))}
          className="w-full h-2 rounded-full accent-brand-500 cursor-pointer"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          aria-label="Lesefortschritt in Prozent"
        />
        {/* Visual bar */}
        <div className="mt-1.5 h-1.5 rounded-full bg-stone-100 dark:bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-brand-400 transition-all duration-300"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Status */}
      <div>
        <p className="text-sm font-medium text-stone-700 dark:text-white/70 mb-2">Status</p>
        <div className="flex flex-wrap gap-2">
          {FORM_STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => { setStatus(s); setSaved(false) }}
              className={cn(
                'px-3 py-1.5 rounded-xl text-xs font-medium transition-colors border',
                status === s
                  ? 'bg-brand-500 text-white border-brand-500'
                  : 'bg-stone-100 dark:bg-white/10 text-stone-600 dark:text-white/60 border-stone-200 dark:border-white/20 hover:border-stone-300 dark:hover:border-white/30',
              )}
              aria-pressed={status === s}
            >
              {READING_STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      <Button
        onClick={handleSave}
        loading={upsert.isPending}
        variant={saved ? 'secondary' : 'primary'}
        className="self-start"
      >
        {saved ? '✓ Gespeichert' : 'Fortschritt speichern'}
      </Button>

      {upsert.isError && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {ERROR_MESSAGES.saveFailed}
        </p>
      )}
    </div>
  )
})
