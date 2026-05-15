import { useState, useCallback } from 'react'
import { useUpsertProgress } from '@/hooks/useBookProgress'
import { useAuth } from '@/lib/AuthContext'
import { Button } from '@/components/ui/Button'
import { READING_STATUS_LABELS } from '@/lib/constants'
import type { ReadingProgress, ReadingStatus } from '@/types/database'

const FORM_STATUSES: ReadingStatus[] = ['not_started', 'reading', 'paused', 'abandoned']

interface ProgressSliderProps {
  bookId: string
  current: ReadingProgress | null
  onSaved?: () => void
}

export function ProgressSlider({ bookId, current, onSaved }: ProgressSliderProps) {
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

  async function handleSave() {
    if (!user) return
    await upsert.mutateAsync({ bookId, userId: user.id, progressPercent: percent, status, mood: current?.mood ?? null })
    setSaved(true)
    onSaved?.()
  }

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
              className={[
                'px-3 py-1.5 rounded-xl text-xs font-medium transition-colors border',
                status === s
                  ? 'bg-brand-500 text-white border-brand-500'
                  : 'bg-stone-100 dark:bg-white/10 text-stone-600 dark:text-white/60 border-stone-200 dark:border-white/20 hover:border-stone-300 dark:hover:border-white/30',
              ].join(' ')}
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
          Fehler beim Speichern. Bitte erneut versuchen.
        </p>
      )}
    </div>
  )
}
