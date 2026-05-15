import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/lib/AuthContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { useAddBacklogBook } from '../hooks/useBacklog'

const schema = z.object({
  title: z.string().min(1, 'Titel ist erforderlich').max(200),
  author: z.string().min(1, 'Autor:in ist erforderlich').max(200),
  coverUrl: z
    .string()
    .url('Ungültige URL – bitte vollständige URL mit https:// eingeben')
    .optional()
    .or(z.literal(''))
    .default(''),
  description: z.string().max(1000).optional().default(''),
  reason: z.string().max(500).optional().default(''),
})

type FormData = z.infer<typeof schema>

interface BacklogAddFormProps {
  onSubmitted?: () => void
}

export function BacklogAddForm({ onSubmitted }: BacklogAddFormProps) {
  const { user } = useAuth()
  const addBook = useAddBacklogBook()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormData) {
    if (!user) return
    await addBook.mutateAsync({
      userId: user.id,
      title: data.title,
      author: data.author,
      description: data.description || null,
      coverUrl: data.coverUrl || null,
      reason: data.reason || null,
    })
    reset()
    onSubmitted?.()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <Input
        label="Buchtitel *"
        placeholder="z.B. Kleines Leben"
        error={errors.title?.message}
        autoComplete="off"
        {...register('title')}
      />
      <Input
        label="Autor:in *"
        placeholder="z.B. Hanya Yanagihara"
        error={errors.author?.message}
        autoComplete="off"
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
        placeholder="Worum geht es in dem Buch?"
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

      {addBook.isError && (
        <p
          role="alert"
          className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/20 rounded-xl px-3 py-2"
        >
          Fehler beim Hinzufügen. Bitte versuche es erneut.
        </p>
      )}

      <Button type="submit" loading={isSubmitting || addBook.isPending}>
        Zum Backlog hinzufügen
      </Button>
    </form>
  )
}
