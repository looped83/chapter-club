import { Button } from '@/components/ui/Button'

interface BacklogEmptyStateProps {
  onAddClick: () => void
}

export function BacklogEmptyState({ onAddClick }: BacklogEmptyStateProps) {
  return (
    <div className="text-center py-16">
      <div className="text-5xl mb-4" aria-hidden="true">
        📚
      </div>
      <h3 className="font-serif font-bold text-stone-900 dark:text-white text-lg mb-2">
        Noch keine Bücher in der Leseliste
      </h3>
      <p className="text-stone-500 dark:text-white/50 text-sm mb-6 max-w-xs mx-auto">
        Fügt Bücher hinzu, die ihr zusammen lesen möchtet. Sie bleiben dauerhaft gespeichert und
        können in jedem Monat gewählt werden.
      </p>
      <Button variant="primary" onClick={onAddClick}>
        + Erstes Buch hinzufügen
      </Button>
    </div>
  )
}
