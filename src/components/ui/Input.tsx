import { forwardRef } from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, id, className = '', ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-stone-600 dark:text-white/70">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={[
            'w-full rounded-xl border px-3.5 py-2.5 text-sm',
            'text-stone-900 dark:text-white',
            'placeholder:text-stone-400 dark:placeholder:text-white/30',
            'bg-white dark:bg-white/10 transition duration-150',
            'focus:outline-none focus:border-brand-400 focus:shadow-focus-brand dark:focus:shadow-focus-brand-dark',
            error
              ? 'border-red-400 focus:border-red-400 focus:shadow-focus-red dark:focus:shadow-focus-red-dark'
              : 'border-stone-200 dark:border-white/20 hover:border-stone-300 dark:hover:border-white/30',
            className,
          ].join(' ')}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          aria-invalid={error ? 'true' : undefined}
          {...props}
        />
        {hint && !error && (
          <p id={`${inputId}-hint`} className="text-xs text-stone-400 dark:text-white/40">
            {hint}
          </p>
        )}
        {error && (
          <p id={`${inputId}-error`} role="alert" className="text-xs text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'
