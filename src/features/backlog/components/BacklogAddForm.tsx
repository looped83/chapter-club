import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '@/lib/AuthContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { useAddBacklogBook } from '../hooks/useBacklog'
import { backlogBookSchema, type BacklogBookFormData } from '../schemas'
import { ERROR_MESSAGES } from '@/lib/constants'

type FormData = BacklogBookFormData

interface BacklogAddFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export function BacklogAddForm({ onSuccess, onCancel }: BacklogAddFormProps) {
  const { user } = useAuth()
  const addBook = useAddBacklogBook()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(backlogBookSchema) })

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
    onSuccess?.()
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
      <Textarea
        label="Warum dieses Buch? (optional)"
        placeholder="Ich schlage es vor, weil…"
        rows={2}
        error={errors.reason?.message}
        {...register('reason')}
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

      {addBook.isError && (
        <p
          role="alert"
          className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/20 rounded-xl px-3 py-2"
        >
          {ERROR_MESSAGES.addFailed}
        </p>
      )}

      <Button type="submit" loading={isSubmitting || addBook.isPending}>
        Zur Leseliste hinzufügen
      </Button>

      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="text-sm text-stone-400 dark:text-white/30 hover:text-stone-600 dark:hover:text-white/60 transition-colors text-center"
        >
          Abbrechen
        </button>
      )}
    </form>
  )
}
