import { useState, useRef, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/AuthContext'
import { useTheme, type Theme } from '@/lib/ThemeContext'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

const AVATARS = ['📚', '🌸', '☕', '🌙', '🦋', '🌿', '🎭', '🐝', '🌺', '🦉']

const schema = z.object({
  display_name: z.string().min(1, 'Name ist erforderlich').max(50),
  avatar_emoji: z.string().min(1),
})

type FormData = z.infer<typeof schema>

const THEME_OPTIONS: { value: Theme; label: string; icon: string }[] = [
  { value: 'light', label: 'Hell', icon: '☀️' },
  { value: 'system', label: 'System', icon: '🖥' },
  { value: 'dark', label: 'Dunkel', icon: '🌙' },
]

export function ProfilePage() {
  const { profile, user } = useAuth()
  const { theme, setTheme } = useTheme()
  const [saved, setSaved] = useState(false)
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => { if (savedTimerRef.current) clearTimeout(savedTimerRef.current) }
  }, [])

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

  const handleAvatarSelect = useCallback((emoji: string) => {
    setValue('avatar_emoji', emoji, { shouldDirty: true })
  }, [setValue])

  async function onSubmit(data: FormData) {
    if (!user) return
    const { error } = await supabase
      .from('profiles')
      .update({ display_name: data.display_name, avatar_emoji: data.avatar_emoji })
      .eq('id', user.id)
    if (!error) {
      setSaved(true)
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current)
      savedTimerRef.current = setTimeout(() => setSaved(false), 2500)
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-sm mx-auto">
      <h1 className="font-serif text-2xl font-bold text-stone-900 dark:text-white">Mein Profil</h1>

      <Card className="p-5">
        {/* Avatar preview */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-3xl bg-stone-100 dark:bg-white/10 border-2 border-stone-200 dark:border-white/20 flex items-center justify-center text-4xl">
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
            <p className="text-sm font-medium text-stone-600 dark:text-white/70 mb-2">Avatar</p>
            <div className="flex flex-wrap gap-2">
              {AVATARS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleAvatarSelect(emoji)}
                  className={[
                    'w-11 h-11 rounded-xl text-2xl transition-all border',
                    selectedEmoji === emoji
                      ? 'ring-2 ring-brand-400 border-brand-400 scale-110'
                      : 'border-stone-200 dark:border-white/20 hover:border-stone-300 dark:hover:border-white/30',
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

      {/* Theme switcher */}
      <Card className="p-5">
        <h2 className="font-semibold text-stone-900 dark:text-white mb-3">Erscheinungsbild</h2>
        <div className="flex gap-1 bg-stone-100 dark:bg-white/10 rounded-2xl p-1" role="group" aria-label="Theme auswählen">
          {THEME_OPTIONS.map(({ value, label, icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setTheme(value)}
              className={[
                'flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl text-xs font-medium transition-colors',
                theme === value
                  ? 'bg-white dark:bg-white/15 text-stone-900 dark:text-white shadow-sm'
                  : 'text-stone-400 dark:text-white/40 hover:text-stone-700 dark:hover:text-white/70',
              ].join(' ')}
              aria-pressed={theme === value}
            >
              <span className="text-base leading-none">{icon}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Account info */}
      <Card className="p-5">
        <h2 className="font-semibold text-stone-900 dark:text-white mb-3">Account</h2>
        <p className="text-sm text-stone-500 dark:text-white/50">{user?.email}</p>
        <Button
          variant="ghost"
          size="sm"
          className="mt-3 text-red-500 dark:text-red-400 hover:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10"
          onClick={() => { supabase.auth.signOut().catch((err) => console.error('Sign out failed:', err)) }}
        >
          Abmelden
        </Button>
      </Card>
    </div>
  )
}
