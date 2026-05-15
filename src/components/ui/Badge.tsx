import { cn } from '@/lib/cn'

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'brand'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-stone-100 text-stone-500 dark:bg-white/10 dark:text-white/60',
  success: 'bg-green-50 text-green-700 dark:bg-green-500/20 dark:text-green-400',
  warning: 'bg-amber-50 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
  danger: 'bg-red-50 text-red-600 dark:bg-red-500/20 dark:text-red-400',
  brand: 'bg-brand-50 text-brand-600 dark:bg-brand-500/20 dark:text-brand-300',
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}
