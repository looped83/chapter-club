import { useState, useCallback } from 'react'
import { useUpsertProgress } from '@/hooks/useBookProgress'
import { useAuth } from '@/lib/AuthContext'
import { Button } from '@/components/ui/Button'
import type { ReadingProgress, ReadingStatus, Mood } from '@/types/database'

const STATUS_LABELS: Record<ReadingStatus, string> = {
  not_started: 'Noch nicht angefangen',
  reading: 'Am Lesen',
  finished: 'Fertig',
  paused: 'Pausiert',
  abandoned: 'Abgebrochen',
}

const MOODS: Mood[] = ['😍', '😭', '🤯', '💤', '🔥', '😐']

interface ProgressSliderProps {
  bookId: string
  current: ReadingProgress | null
  onSaved?: () => void
}

export function ProgressSlider({ bookId, current, onSaved }: ProgressSliderProps) {
  const { user } = useAuth()
  const [percent, setPercent] = useState(current?.progress_percent ?? 0)
  const [status, setStatus] = useState<ReadingStatus>(current?.status ?? 'not_started')
  const [mood, setMood] = useState<Mood | null>(current?.mood ?? null)
  const [saved, setSaved] = useState(false)

  const upsert = useUpsertProgress()

  const handlePercentChange = useCallback((val: number) => {
    setPercent(val)
    if (val > 0 && status === 'not_started') setStatus('reading')
    if (val === 100) setStatus('finished')
    setSaved(false)
  }, [status])

  async function handleSave() {
    if (!user) return
    await upsert.mutateAsync({ bookId, userId: user.id, progressPercent: percent, status, mood })
    setSaved(true)
    onSaved?.()
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Percent slider */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label htmlFor="progress-slider" className="text-sm font-medium text-stone-700">
            Lesefortschritt
          </label>
          <span className="text-sm font-semibold text-brand-600">{percent}%</span>
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
        <div className="mt-1.5 h-1.5 rounded-full bg-stone-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-brand-400 transition-all duration-300"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Status */}
      <div>
        <p className="text-sm font-medium text-stone-700 mb-2">Status</p>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(STATUS_LABELS) as ReadingStatus[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => { setStatus(s); setSaved(false) }}
              className={[
                'px-3 py-1.5 rounded-xl text-xs font-medium transition-colors border',
                status === s
                  ? 'bg-brand-500 text-white border-brand-500'
                  : 'bg-stone-50 text-stone-600 border-stone-200 hover:border-stone-300',
              ].join(' ')}
              aria-pressed={status === s}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Mood */}
      <div>
        <p className="text-sm font-medium text-stone-700 mb-2">Mood</p>
        <div className="flex gap-2 flex-wrap">
          {MOODS.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => { setMood(mood === m ? null : m); setSaved(false) }}
              className={[
                'w-10 h-10 rounded-xl text-xl transition-all border',
                mood === m
                  ? 'ring-2 ring-brand-400 border-brand-400 scale-110'
                  : 'border-stone-200 hover:border-stone-300 hover:scale-105',
              ].join(' ')}
              aria-label={`Mood: ${m}`}
              aria-pressed={mood === m}
            >
              {m}
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
        <p role="alert" className="text-sm text-red-600">
          Fehler beim Speichern. Bitte erneut versuchen.
        </p>
      )}
    </div>
  )
}
