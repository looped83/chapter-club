export function createBlurredBgStyle(coverUrl: string | null | undefined, blurPx = 28) {
  if (!coverUrl) return undefined
  return {
    backgroundImage: `url(${coverUrl})`,
    backgroundSize: 'cover' as const,
    backgroundPosition: 'center' as const,
    filter: `blur(${blurPx}px)`,
  }
}
