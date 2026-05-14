import { useEffect, useRef, useState } from 'react'

interface ExpandableTextProps {
  text: string
  lines?: number
  className?: string
  toggleClassName?: string
}

export function ExpandableText({
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
    // Compare full scrollHeight to clamped clientHeight
    setOverflows(el.scrollHeight > el.clientHeight + 2)
  }, [text])

  return (
    <div>
      <p
        ref={ref}
        className={[
          className,
          !expanded ? `line-clamp-${lines}` : '',
        ].join(' ')}
      >
        {text}
      </p>
      {overflows && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className={toggleClassName}
        >
          {expanded ? 'weniger' : 'mehr'}
        </button>
      )}
    </div>
  )
}
