interface CardProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType
}

export function Card({ children, className = '', as: Tag = 'div', ...rest }: CardProps) {
  return (
    <Tag
      className={[
        'bg-white border border-stone-100 shadow-sm rounded-2xl',
        'dark:bg-white/[0.07] dark:border-white/10 dark:shadow-none dark:backdrop-blur-sm',
        className,
      ].join(' ')}
      {...rest}
    >
      {children}
    </Tag>
  )
}
