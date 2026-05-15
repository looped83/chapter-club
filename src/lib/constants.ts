import type { ReadingStatus, Pace } from '@/types/database'

export const MONTH_NAMES = [
  '', 'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
]

export const MONTH_NAMES_SHORT = [
  '', 'Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun',
  'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez',
]

export const READING_STATUS_LABELS: Record<ReadingStatus, string> = {
  not_started: 'Noch nicht angefangen',
  reading: 'Am Lesen',
  finished: 'Fertig',
  paused: 'Pausiert',
  abandoned: 'Abgebrochen',
}

export const IMPACT_LABELS = ['', '😐', '🙂', '😮', '😢', '🤯']

export const PACE_LABELS: Record<Pace, string> = {
  too_slow: 'Zu langsam',
  just_right: 'Genau richtig',
  too_fast: 'Zu schnell',
}
