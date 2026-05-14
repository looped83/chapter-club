interface CardProps {
  children: React.ReactNode
  className?: string
  as?: React.ElementType
}

export function Card({ children, className = '', as: Tag = 'div' }: CardProps) {
  return (
    <Tag
      className={[
        'bg-white/[0.07] backdrop-blur-sm rounded-2xl border border-white/10',
        className,
      ].join(' ')}
    >
      {children}
    </Tag>
  )
}
