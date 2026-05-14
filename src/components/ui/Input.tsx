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
          <label htmlFor={inputId} className="text-sm font-medium text-white/70">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={[
            'w-full rounded-xl border px-3.5 py-2.5 text-sm text-white placeholder:text-white/30',
            'bg-white/10 transition-colors duration-150',
            'focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400',
            error
              ? 'border-red-400 focus:ring-red-400 focus:border-red-400'
              : 'border-white/20 hover:border-white/30',
            className,
          ].join(' ')}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          aria-invalid={error ? 'true' : undefined}
          {...props}
        />
        {hint && !error && (
          <p id={`${inputId}-hint`} className="text-xs text-white/40">
            {hint}
          </p>
        )}
        {error && (
          <p id={`${inputId}-error`} role="alert" className="text-xs text-red-400">
            {error}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'
