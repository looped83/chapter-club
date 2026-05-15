import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { useUpdateBacklogBook } from '../hooks/useBacklog'
import type { BacklogBook } from '../types'
import { backlogBookSchema, type BacklogBookFormData } from '../schemas'
import { ERROR_MESSAGES } from '@/lib/constants'

type FormData = BacklogBookFormData

interface BacklogEditFormProps {
  book: BacklogBook
  onSuccess: () => void
}

export function BacklogEditForm({ book, onSuccess }: BacklogEditFormProps) {
  const updateBook = useUpdateBacklogBook()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(backlogBookSchema),
    defaultValues: {
      title: book.title,
      author: book.author,
      coverUrl: book.cover_url ?? '',
      description: book.description ?? '',
      reason: book.reason ?? '',
    },
  })

  async function onSubmit(data: FormData) {
    await updateBook.mutateAsync({
      id: book.id,
      title: data.title,
      author: data.author,
      description: data.description || null,
      coverUrl: data.coverUrl || null,
      reason: data.reason || null,
    })
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <Input
        label="Buchtitel *"
        error={errors.title?.message}
        autoComplete="off"
        {...register('title')}
      />
      <Input
        label="Autor:in *"
        error={errors.author?.message}
        autoComplete="off"
        {...register('author')}
      />
      <Textarea
        label="Warum dieses Buch? (optional)"
        rows={2}
        error={errors.reason?.message}
        {...register('reason')}
      />
      <Input
        label="Cover-URL (optional)"
        type="url"
        error={errors.coverUrl?.message}
        {...register('coverUrl')}
      />
      <Textarea
        label="Kurzbeschreibung (optional)"
        rows={3}
        error={errors.description?.message}
        {...register('description')}
      />

      {updateBook.isError && (
        <p
          role="alert"
          className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/20 rounded-xl px-3 py-2"
        >
          {ERROR_MESSAGES.saveFailed}
        </p>
      )}

      <div className="flex gap-2">
        <Button type="submit" loading={isSubmitting || updateBook.isPending}>
          Speichern
        </Button>
        <Button type="button" variant="secondary" onClick={onSuccess}>
          Abbrechen
        </Button>
      </div>
    </form>
  )
}
