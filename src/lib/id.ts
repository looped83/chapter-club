export function slugifyId(text: string): string {
  return text.toLowerCase().replace(/\s+/g, '-')
}
