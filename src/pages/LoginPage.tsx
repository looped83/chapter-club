import { useState } from 'react'
import { cn } from '@/lib/cn'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

const schema = z.object({
  email: z.string().email('Bitte eine gültige E-Mail-Adresse eingeben'),
  password: z.string().min(6, 'Passwort muss mindestens 6 Zeichen haben'),
})

type FormData = z.infer<typeof schema>

export function LoginPage() {
  const [authError, setAuthError] = useState<string | null>(null)
  const [mode, setMode] = useState<'login' | 'signup'>('login')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormData) {
    setAuthError(null)
    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword(data)
      if (error) setAuthError(error.message)
    } else {
      const { error } = await supabase.auth.signUp(data)
      if (error) setAuthError(error.message)
      else setAuthError('Bestätigungs-E-Mail gesendet. Bitte E-Mail bestätigen.')
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3" aria-hidden="true">📖</div>
          <h1 className="font-serif text-2xl font-bold text-stone-900 dark:text-white">Chapter Club</h1>
          <p className="text-stone-500 dark:text-white/50 text-sm mt-1">Unser privater Bücher-Kreis</p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-white/[0.07] backdrop-blur-sm rounded-3xl border border-stone-200 dark:border-white/10 p-6">
          <h2 className="text-lg font-semibold text-stone-900 dark:text-white mb-6">
            {mode === 'login' ? 'Willkommen zurück' : 'Konto erstellen'}
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
            <Input
              label="E-Mail"
              type="email"
              autoComplete="email"
              placeholder="deine@email.de"
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Passwort"
              type="password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />

            {authError && (
              <p
                role="alert"
                className={cn(
                  'text-sm rounded-xl px-3 py-2',
                  authError.startsWith('Bestätigung')
                    ? 'bg-green-50 dark:bg-green-500/20 text-green-700 dark:text-green-400'
                    : 'bg-red-50 dark:bg-red-500/20 text-red-600 dark:text-red-400',
                )}
              >
                {authError}
              </p>
            )}

            <Button type="submit" loading={isSubmitting} size="lg" className="w-full mt-1">
              {mode === 'login' ? 'Einloggen' : 'Registrieren'}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'signup' : 'login')
                setAuthError(null)
              }}
              className="text-sm text-stone-400 dark:text-white/40 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
            >
              {mode === 'login'
                ? 'Noch kein Konto? Registrieren'
                : 'Bereits ein Konto? Einloggen'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
