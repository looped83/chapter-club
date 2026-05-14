interface CardProps {
  children: React.ReactNode
  className?: string
  as?: React.ElementType
}

export function Card({ children, className = '', as: Tag = 'div' }: CardProps) {
  return (
    <Tag
      className={[
        'bg-white rounded-2xl border border-stone-100 shadow-sm',
        className,
      ].join(' ')}
    >
      {children}
    </Tag>
  )
}
