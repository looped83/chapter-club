import { useState, useId, memo } from 'react'

interface StarPickerProps {
  value: number
  onChange: (value: number) => void
  readOnly?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-10 h-10' }
const STARS = [1, 2, 3, 4, 5] as const

const StarSvg = memo(function StarSvg({ fillAmount, index, instanceId }: { fillAmount: number; index: number; instanceId: string }) {
  const clipId = `${instanceId}-s${index}`
  const fillWidth = Math.round(fillAmount * 24)

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="w-full h-full">
      <defs>
        <clipPath id={clipId}>
          <rect x="0" y="0" width={fillWidth} height="24" />
        </clipPath>
      </defs>
      {/* empty outline */}
      <path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        fill="none"
        stroke="#d6d3d1"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* filled portion */}
      <path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        fill="#e4a84a"
        clipPath={`url(#${clipId})`}
      />
    </svg>
  )
})

export function StarPicker({ value, onChange, readOnly = false, size = 'md' }: StarPickerProps) {
  const [hovered, setHovered] = useState<number | null>(null)
  const instanceId = useId()
  const display = hovered ?? value

  return (
    <div
      className="flex gap-0.5"
      onMouseLeave={() => setHovered(null)}
      role={readOnly ? undefined : 'group'}
      aria-label={readOnly ? `${value} von 5 Sternen` : 'Bewertung wählen'}
    >
      {STARS.map((star) => {
        const fillAmount = Math.min(1, Math.max(0, display - (star - 1)))
        return (
          <div key={star} className={`relative ${sizes[size]} flex-shrink-0`}>
            <StarSvg fillAmount={fillAmount} index={star} instanceId={instanceId} />
            {!readOnly && (
              <>
                {/* left half → half star */}
                <div
                  role="button"
                  tabIndex={0}
                  className="absolute left-0 top-0 w-1/2 h-full cursor-pointer"
                  onMouseEnter={() => setHovered(star - 0.5)}
                  onClick={() => onChange(star - 0.5)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onChange(star - 0.5) } }}
                  aria-label={`${star - 0.5} Sterne`}
                />
                {/* right half → full star */}
                <div
                  role="button"
                  tabIndex={0}
                  className="absolute right-0 top-0 w-1/2 h-full cursor-pointer"
                  onMouseEnter={() => setHovered(star)}
                  onClick={() => onChange(star)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onChange(star) } }}
                  aria-label={`${star} Sterne`}
                />
              </>
            )}
          </div>
        )
      })}
    </div>
  )
}
