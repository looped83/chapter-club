interface CardProps {
  children: React.ReactNode
  className?: string
  as?: React.ElementType
}

export function Card({ children, className = '', as: Tag = 'div' }: CardProps) {
  return (
    <Tag
      className={[
        'bg-white border border-stone-100 shadow-sm rounded-2xl',
        'dark:bg-white/[0.07] dark:border-white/10 dark:shadow-none dark:backdrop-blur-sm',
        className,
      ].join(' ')}
    >
      {children}
    </Tag>
  )
}
