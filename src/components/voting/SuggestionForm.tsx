import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useSubmitSuggestion } from '@/hooks/useVoting'
import { useAuth } from '@/lib/AuthContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'

const schema = z.object({
  title: z.string().min(1, 'Titel ist erforderlich').max(200),
  author: z.string().min(1, 'Autor:in ist erforderlich').max(200),
  description: z.string().max(1000).optional().default(''),
  coverUrl: z.string().url('Ungültige URL').optional().or(z.literal('')).default(''),
  reason: z.string().max(500).optional().default(''),
})

type FormData = z.infer<typeof schema>

interface SuggestionFormProps {
  month: number
  year: number
  onSubmitted?: () => void
}

export function SuggestionForm({ month, year, onSubmitted }: SuggestionFormProps) {
  const { user } = useAuth()
  const submit = useSubmitSuggestion(month, year)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormData) {
    if (!user) return
    await submit.mutateAsync({
      userId: user.id,
      title: data.title,
      author: data.author,
      description: data.description ?? '',
      coverUrl: data.coverUrl ?? '',
      reason: data.reason ?? '',
    })
    reset()
    onSubmitted?.()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Input
        label="Buchtitel"
        placeholder="z.B. Kleines Leben"
        error={errors.title?.message}
        {...register('title')}
      />
      <Input
        label="Autor:in"
        placeholder="z.B. Hanya Yanagihara"
        error={errors.author?.message}
        {...register('author')}
      />
      <Input
        label="Cover-URL (optional)"
        type="url"
        placeholder="https://…"
        error={errors.coverUrl?.message}
        {...register('coverUrl')}
      />
      <Textarea
        label="Kurzbeschreibung (optional)"
        placeholder="Worum geht es?"
        rows={3}
        error={errors.description?.message}
        {...register('description')}
      />
      <Textarea
        label="Warum dieses Buch? (optional)"
        placeholder="Ich schlage es vor, weil…"
        rows={2}
        error={errors.reason?.message}
        {...register('reason')}
      />

      {submit.isError && (
        <p role="alert" className="text-sm text-red-400 bg-red-500/20 rounded-xl px-3 py-2">
          Fehler beim Einreichen. Hast du bereits einen Vorschlag für diesen Monat?
        </p>
      )}

      <Button type="submit" loading={isSubmitting}>
        Vorschlag einreichen
      </Button>
    </form>
  )
}
