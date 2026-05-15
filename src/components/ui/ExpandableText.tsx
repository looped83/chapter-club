import { useEffect, useRef, useState, memo } from 'react'
import { cn } from '@/lib/cn'

interface ExpandableTextProps {
  text: string
  lines?: number
  className?: string
  toggleClassName?: string
}

const CLAMP: Record<number, string> = {
  1: 'line-clamp-1', 2: 'line-clamp-2', 3: 'line-clamp-3',
  4: 'line-clamp-4', 5: 'line-clamp-5', 6: 'line-clamp-6',
}

export const ExpandableText = memo(function ExpandableText({
  text,
  lines = 2,
  className = '',
  toggleClassName = '',
}: ExpandableTextProps) {
  const ref = useRef<HTMLParagraphElement>(null)
  const [overflows, setOverflows] = useState(false)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    setOverflows(el.scrollHeight > el.clientHeight + 2)
  }, [text])

  return (
    <div>
      <p
        ref={ref}
        className={cn(className, !expanded && (CLAMP[lines] ?? 'line-clamp-2'))}
      >
        {text}
      </p>
      {overflows && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          aria-label={expanded ? 'Text einklappen' : 'Text vollständig anzeigen'}
          className={toggleClassName}
        >
          {expanded ? 'weniger' : 'mehr'}
        </button>
      )}
    </div>
  )
})
