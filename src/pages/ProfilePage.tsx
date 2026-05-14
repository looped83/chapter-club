import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/AuthContext'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

const AVATARS = ['📚', '🌸', '☕', '🌙', '🦋', '🌿', '🎭', '🐝', '🌺', '🦉']

const schema = z.object({
  display_name: z.string().min(1, 'Name ist erforderlich').max(50),
  avatar_emoji: z.string().min(1),
})

type FormData = z.infer<typeof schema>

export function ProfilePage() {
  const { profile, user } = useAuth()
  const [saved, setSaved] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      display_name: profile?.display_name ?? '',
      avatar_emoji: profile?.avatar_emoji ?? '📚',
    },
  })

  const selectedEmoji = watch('avatar_emoji')

  async function onSubmit(data: FormData) {
    if (!user) return
    const { error } = await supabase
      .from('profiles')
      .update({ display_name: data.display_name, avatar_emoji: data.avatar_emoji })
      .eq('id', user.id)
    if (!error) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-sm mx-auto">
      <h1 className="font-serif text-2xl font-bold text-white">Mein Profil</h1>

      <Card className="p-5">
        {/* Avatar preview */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-3xl bg-white/10 border-2 border-white/20 flex items-center justify-center text-4xl">
            {selectedEmoji}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <Input
            label="Anzeigename"
            placeholder="Dein Name"
            error={errors.display_name?.message}
            {...register('display_name')}
          />

          <div>
            <p className="text-sm font-medium text-white/70 mb-2">Avatar</p>
            <div className="flex flex-wrap gap-2">
              {AVATARS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => { setValue('avatar_emoji', emoji, { shouldDirty: true }) }}
                  className={[
                    'w-11 h-11 rounded-xl text-2xl transition-all border',
                    selectedEmoji === emoji
                      ? 'ring-2 ring-brand-400 border-brand-400 scale-110'
                      : 'border-white/20 hover:border-white/30',
                  ].join(' ')}
                  aria-label={`Avatar ${emoji}`}
                  aria-pressed={selectedEmoji === emoji}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <Button type="submit" loading={isSubmitting} disabled={!isDirty} className="w-full">
            {saved ? '✓ Gespeichert' : 'Profil speichern'}
          </Button>
        </form>
      </Card>

      {/* Account info */}
      <Card className="p-5">
        <h2 className="font-semibold text-white mb-3">Account</h2>
        <p className="text-sm text-white/50">{user?.email}</p>
        <Button
          variant="ghost"
          size="sm"
          className="mt-3 text-red-400 hover:text-red-300 hover:bg-red-500/10"
          onClick={() => supabase.auth.signOut()}
        >
          Abmelden
        </Button>
      </Card>
    </div>
  )
}
