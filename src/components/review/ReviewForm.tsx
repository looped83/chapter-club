import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useUpsertReview } from '@/hooks/useReviews'
import { useAuth } from '@/lib/AuthContext'
import { Button } from '@/components/ui/Button'
import { StarPicker } from '@/components/ui/StarPicker'
import { Textarea } from '@/components/ui/Textarea'
import { Input } from '@/components/ui/Input'
import type { Review, Pace } from '@/types/database'

const schema = z.object({
  rating: z.number().min(0).max(5).multipleOf(0.5),
  reviewText: z.string().max(2000, 'Max. 2000 Zeichen').optional().default(''),
  favoriteQuote: z.string().max(500, 'Max. 500 Zeichen').optional().default(''),
  containsSpoilers: z.boolean().default(false),
  emotionalImpact: z.number().int().min(1).max(5).nullable().default(null),
  wouldReread: z.boolean().nullable().default(null),
  pace: z.enum(['too_slow', 'just_right', 'too_fast']).nullable().default(null),
  oneWord: z.string().max(30, 'Max. 30 Zeichen').optional().default(''),
})

type FormData = z.infer<typeof schema>

const PACE_LABELS: Record<Pace, string> = {
  too_slow: 'Zu langsam',
  just_right: 'Genau richtig',
  too_fast: 'Zu schnell',
}

const IMPACT_LABELS = ['', '😐', '🙂', '😮', '😢', '🤯']

interface ReviewFormProps {
  bookId: string
  existing: Review | null
  onSaved?: () => void
}

export function ReviewForm({ bookId, existing, onSaved }: ReviewFormProps) {
  const { user } = useAuth()
  const upsert = useUpsertReview()

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      rating: existing?.rating ?? 0,
      reviewText: existing?.review_text ?? '',
      favoriteQuote: existing?.favorite_quote ?? '',
      containsSpoilers: existing?.contains_spoilers ?? false,
      emotionalImpact: existing?.emotional_impact ?? null,
      wouldReread: existing?.would_reread ?? null,
      pace: existing?.pace ?? null,
      oneWord: existing?.one_word ?? '',
    },
  })

  useEffect(() => {
    if (existing) {
      reset({
        rating: Number(existing.rating),
        reviewText: existing.review_text ?? '',
        favoriteQuote: existing.favorite_quote ?? '',
        containsSpoilers: existing.contains_spoilers,
        emotionalImpact: existing.emotional_impact ?? null,
        wouldReread: existing.would_reread ?? null,
        pace: existing.pace ?? null,
        oneWord: existing.one_word ?? '',
      })
    }
  }, [existing, reset])

  const ratingValue = watch('rating')
  const emotionalImpact = watch('emotionalImpact')
  const wouldReread = watch('wouldReread')
  const pace = watch('pace')

  async function onSubmit(data: FormData) {
    if (!user) return
    await upsert.mutateAsync({
      bookId,
      userId: user.id,
      rating: data.rating,
      reviewText: data.reviewText ?? '',
      favoriteQuote: data.favoriteQuote ?? '',
      containsSpoilers: data.containsSpoilers,
      emotionalImpact: data.emotionalImpact,
      wouldReread: data.wouldReread,
      pace: data.pace,
      oneWord: data.oneWord ?? '',
    })
    onSaved?.()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      {/* Rating */}
      <div>
        <p className="text-sm font-medium text-white/70 mb-2">
          Bewertung:{' '}
          <span className="text-brand-400 font-bold">
            {ratingValue > 0 ? `${ratingValue} / 5` : 'noch nicht vergeben'}
          </span>
        </p>
        <Controller
          name="rating"
          control={control}
          render={({ field }) => (
            <StarPicker value={field.value} onChange={field.onChange} size="lg" />
          )}
        />
        {errors.rating && <p className="text-xs text-red-400 mt-1">{errors.rating.message}</p>}
      </div>

      {/* Emotional Impact */}
      <div>
        <p className="text-sm font-medium text-white/70 mb-2">Emotionaler Impact</p>
        <div className="flex gap-2" role="group" aria-label="Emotionaler Impact">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setValue('emotionalImpact', emotionalImpact === n ? null : n, { shouldDirty: true })}
              className={[
                'flex flex-col items-center gap-1 px-3 py-2 rounded-xl border transition-all',
                emotionalImpact === n
                  ? 'border-brand-400 bg-brand-500/20 scale-105'
                  : 'border-white/20 hover:border-white/30',
              ].join(' ')}
              aria-pressed={emotionalImpact === n}
              aria-label={`Impact ${n}`}
            >
              <span className="text-xl">{IMPACT_LABELS[n]}</span>
              <span className="text-xs text-white/40">{n}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Pace */}
      <div>
        <p className="text-sm font-medium text-white/70 mb-2">Lesetempo</p>
        <div className="flex gap-2 flex-wrap" role="group" aria-label="Lesetempo">
          {(['too_slow', 'just_right', 'too_fast'] as Pace[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setValue('pace', pace === p ? null : p, { shouldDirty: true })}
              className={[
                'px-3 py-1.5 rounded-xl text-sm font-medium border transition-all',
                pace === p
                  ? 'bg-brand-500 text-white border-brand-500'
                  : 'bg-white/10 text-white/60 border-white/20 hover:border-white/30',
              ].join(' ')}
              aria-pressed={pace === p}
            >
              {PACE_LABELS[p]}
            </button>
          ))}
        </div>
      </div>

      {/* Would Reread */}
      <div>
        <p className="text-sm font-medium text-white/70 mb-2">Würdest du es nochmal lesen?</p>
        <div className="flex gap-2" role="group" aria-label="Nochmal lesen">
          {([true, false] as const).map((val) => (
            <button
              key={String(val)}
              type="button"
              onClick={() => setValue('wouldReread', wouldReread === val ? null : val, { shouldDirty: true })}
              className={[
                'px-4 py-1.5 rounded-xl text-sm font-medium border transition-all',
                wouldReread === val
                  ? 'bg-brand-500 text-white border-brand-500'
                  : 'bg-white/10 text-white/60 border-white/20 hover:border-white/30',
              ].join(' ')}
              aria-pressed={wouldReread === val}
            >
              {val ? '✓ Ja' : '✗ Nein'}
            </button>
          ))}
        </div>
      </div>

      {/* One Word */}
      <Input
        label="Ein Wort für dieses Buch"
        placeholder="z.B. unvergesslich"
        error={errors.oneWord?.message}
        {...register('oneWord')}
      />

      {/* Divider */}
      <hr className="border-white/10" />

      {/* Review Text */}
      <Textarea
        label="Meine Meinung (optional)"
        placeholder="Was habe ich gedacht…"
        rows={4}
        error={errors.reviewText?.message}
        {...register('reviewText')}
      />

      <Textarea
        label="Lieblingszitat (optional)"
        placeholder="Ein Satz, der mich berührt hat…"
        rows={2}
        error={errors.favoriteQuote?.message}
        {...register('favoriteQuote')}
      />

      <label className="flex items-center gap-2.5 cursor-pointer">
        <input
          type="checkbox"
          className="rounded border-white/30 accent-brand-500 w-4 h-4"
          {...register('containsSpoilers')}
        />
        <span className="text-sm text-white/70">Enthält Spoiler</span>
      </label>

      <Button type="submit" loading={isSubmitting} disabled={!isDirty && !!existing} className="self-start">
        {existing ? 'Bewertung aktualisieren' : 'Bewertung speichern'}
      </Button>

      {upsert.isError && (
        <p role="alert" className="text-sm text-red-400">
          Fehler beim Speichern. Bitte erneut versuchen.
        </p>
      )}

      {upsert.isSuccess && !isDirty && (
        <p className="text-sm text-green-400">✓ Review gespeichert</p>
      )}
    </form>
  )
}
