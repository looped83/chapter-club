import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-6 text-center">
          <div className="text-5xl" aria-hidden="true">⚠️</div>
          <h1 className="font-serif text-xl font-bold text-stone-900 dark:text-white">
            Etwas ist schiefgelaufen
          </h1>
          <p className="text-stone-500 dark:text-white/50 text-sm max-w-xs">
            Bitte lade die Seite neu. Sollte das Problem weiterhin bestehen, wende dich an den Administrator.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-brand-700 text-white rounded-xl text-sm font-medium hover:bg-brand-800 transition-colors"
          >
            Seite neu laden
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
