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
        Noch keine Bücher im Backlog
      </h3>
      <p className="text-stone-500 dark:text-white/50 text-sm mb-6 max-w-xs mx-auto">
        Fügt Bücher hinzu, die ihr zusammen lesen möchtet. Sie bleiben dauerhaft als gemeinsame
        Wunschliste gespeichert und können in jedem Monat gewählt werden.
      </p>
      <button
        type="button"
        onClick={onAddClick}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2"
      >
        + Erstes Buch hinzufügen
      </button>
    </div>
  )
}
