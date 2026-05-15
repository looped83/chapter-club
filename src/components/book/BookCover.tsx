import { memo } from 'react'

interface BookCoverProps {
  title: string
  coverUrl: string | null
  className?: string
}

const FALLBACK_COLORS = [
  'from-brand-200 to-brand-400',
  'from-stone-200 to-stone-400',
  'from-amber-200 to-amber-400',
  'from-orange-200 to-orange-400',
]

function colorForTitle(title: string) {
  return FALLBACK_COLORS[title.charCodeAt(0) % FALLBACK_COLORS.length]
}

export const BookCover = memo(function BookCover({ title, coverUrl, className = '' }: BookCoverProps) {
  if (coverUrl) {
    return (
      <img
        src={coverUrl}
        alt={`Cover: ${title}`}
        loading="lazy"
        className={['object-cover', className].join(' ')}
      />
    )
  }
  const gradient = colorForTitle(title)
  return (
    <div
      className={[
        'flex items-end justify-center bg-gradient-to-b p-2',
        gradient,
        className,
      ].join(' ')}
      aria-hidden="true"
    >
      <span className="text-white/80 text-xs font-serif font-bold text-center leading-tight line-clamp-3">
        {title}
      </span>
    </div>
  )
})
