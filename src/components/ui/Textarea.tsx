import { forwardRef } from 'react'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, id, className = '', ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-stone-700">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          rows={4}
          className={[
            'w-full rounded-xl border px-3.5 py-2.5 text-sm text-stone-900 placeholder-stone-400',
            'bg-white transition-colors duration-150 resize-none',
            'focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400',
            error
              ? 'border-red-400 focus:ring-red-400'
              : 'border-stone-200 hover:border-stone-300',
            className,
          ].join(' ')}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          aria-invalid={error ? 'true' : undefined}
          {...props}
        />
        {hint && !error && (
          <p id={`${inputId}-hint`} className="text-xs text-stone-500">
            {hint}
          </p>
        )}
        {error && (
          <p id={`${inputId}-error`} role="alert" className="text-xs text-red-600">
            {error}
          </p>
        )}
      </div>
    )
  }
)
Textarea.displayName = 'Textarea'
