import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useUpsertReview } from '@/hooks/useReviews'
import { useAuth } from '@/lib/AuthContext'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import type { Review } from '@/types/database'

const schema = z.object({
  rating: z.number().int().min(1).max(10),
  reviewText: z.string().max(2000, 'Max. 2000 Zeichen').optional().default(''),
  favoriteQuote: z.string().max(500, 'Max. 500 Zeichen').optional().default(''),
  containsSpoilers: z.boolean().default(false),
})

type FormData = z.infer<typeof schema>

interface ReviewFormProps {
  bookId: string
  existing: Review | null
  onSaved?: () => void
}

export function ReviewForm({ bookId, existing, onSaved }: ReviewFormProps) {
  const { user } = useAuth()
  const upsert = useUpsertReview()

  const { register, handleSubmit, control, watch, reset, formState: { errors, isSubmitting, isDirty } } =
    useForm<FormData>({
      resolver: zodResolver(schema),
      defaultValues: {
        rating: existing?.rating ?? 7,
        reviewText: existing?.review_text ?? '',
        favoriteQuote: existing?.favorite_quote ?? '',
        containsSpoilers: existing?.contains_spoilers ?? false,
      },
    })

  useEffect(() => {
    if (existing) {
      reset({
        rating: existing.rating,
        reviewText: existing.review_text ?? '',
        favoriteQuote: existing.favorite_quote ?? '',
        containsSpoilers: existing.contains_spoilers,
      })
    }
  }, [existing, reset])

  const ratingValue = watch('rating')

  async function onSubmit(data: FormData) {
    if (!user) return
    await upsert.mutateAsync({
      bookId,
      userId: user.id,
      rating: data.rating,
      reviewText: data.reviewText ?? '',
      favoriteQuote: data.favoriteQuote ?? '',
      containsSpoilers: data.containsSpoilers,
    })
    onSaved?.()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      {/* Rating selector */}
      <div>
        <p className="text-sm font-medium text-stone-700 mb-2">
          Bewertung: <span className="text-brand-600 font-bold">{ratingValue}/10</span>
        </p>
        <Controller
          name="rating"
          control={control}
          render={({ field }) => (
            <div className="flex gap-1 flex-wrap" role="group" aria-label="Bewertung wählen">
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => field.onChange(n)}
                  className={[
                    'w-9 h-9 rounded-xl text-sm font-semibold transition-all border',
                    field.value === n
                      ? 'bg-brand-500 text-white border-brand-500 scale-110'
                      : 'bg-stone-50 text-stone-600 border-stone-200 hover:border-brand-300',
                  ].join(' ')}
                  aria-pressed={field.value === n}
                  aria-label={`${n} von 10`}
                >
                  {n}
                </button>
              ))}
            </div>
          )}
        />
        {errors.rating && <p className="text-xs text-red-600 mt-1">{errors.rating.message}</p>}
      </div>

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
          className="rounded border-stone-300 accent-brand-500 w-4 h-4"
          {...register('containsSpoilers')}
        />
        <span className="text-sm text-stone-700">Enthält Spoiler</span>
      </label>

      <Button type="submit" loading={isSubmitting} disabled={!isDirty && !!existing} className="self-start">
        {existing ? 'Review aktualisieren' : 'Review speichern'}
      </Button>

      {upsert.isError && (
        <p role="alert" className="text-sm text-red-600">
          Fehler beim Speichern. Bitte erneut versuchen.
        </p>
      )}

      {upsert.isSuccess && !isDirty && (
        <p className="text-sm text-green-600">✓ Review gespeichert</p>
      )}
    </form>
  )
}
