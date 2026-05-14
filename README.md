# 📖 Chapter Club

Eine charmante, private Buddy-Read-App für unsere 4er Lesegruppe.

## Features

- **Dashboard** – aktuelles Monatsbuch, Gruppenfortschritt, Countdown
- **Lesefortschritt** – Slider, Status (not_started → reading → finished), Mood-Emojis
- **Reviews** – Rating 1–10, Text, Lieblingszitat, Spoiler-Flag
- **Bibliothek** – alle bisherigen Bücher als Grid mit Durchschnittsrating
- **Buchdetailseite** – Fortschritte, Reviews, Highlights (begeistert / kritischste Stimme)
- **Voting** – Buchvorschläge einreichen, abstimmen, automatischer Gewinner
- **Auth** – E-Mail-Login via Supabase, nur eingeloggte Nutzerinnen

## Tech Stack

| Bereich       | Technologie                             |
|---------------|-----------------------------------------|
| Frontend      | React 18, Vite, TypeScript              |
| Styling       | Tailwind CSS                            |
| Routing       | React Router v6 (HashRouter)            |
| Server State  | TanStack Query v5                       |
| Formulare     | React Hook Form + Zod                   |
| Backend/DB    | Supabase (PostgreSQL + Auth + RLS)      |
| Hosting       | GitHub Pages                            |

---

## Setup

### 1. Repository klonen

```bash
git clone https://github.com/looped83/chapter-club.git
cd chapter-club
npm install
```

### 2. Supabase-Projekt erstellen

1. Gehe zu [supabase.com](https://supabase.com) und erstelle ein neues Projekt
2. Öffne den **SQL Editor** (linke Sidebar → SQL Editor)
3. Führe das komplette Schema aus: kopiere den Inhalt von `supabase/schema.sql` und klicke **Run**

### 3. Environment Variables setzen

```bash
cp .env.example .env
```

Fülle in `.env` die Werte aus deinem Supabase-Projekt ein:

```env
VITE_SUPABASE_URL=https://dein-projekt.supabase.co
VITE_SUPABASE_ANON_KEY=dein-anon-key
```

Die Werte findest du in Supabase unter **Settings → API**.

### 4. Nutzer:innen anlegen

Gehe in Supabase zu **Authentication → Users** und lege die 4 Nutzerinnen per E-Mail/Passwort an.

Profile werden automatisch beim ersten Login erstellt (via Database Trigger).

### 5. Erstes Buch eintragen

Führe im SQL Editor folgenden INSERT aus (passe die Werte an):

```sql
INSERT INTO books (title, author, description, cover_url, month, year, is_current)
VALUES (
  'Dein Buchtitel',
  'Autorin',
  'Kurze Beschreibung',
  'https://cover-url.jpg',  -- optional
  5, 2026, true
);
```

### 6. Lokal starten

```bash
npm run dev
```

---

## Deployment (GitHub Pages)

### Einmalig in GitHub einrichten

1. Gehe zu deinem GitHub-Repo → **Settings → Secrets and variables → Actions**
2. Füge zwei Repository Secrets hinzu:
   - `VITE_SUPABASE_URL` = deine Supabase-URL
   - `VITE_SUPABASE_ANON_KEY` = dein Supabase Anon Key
3. Gehe zu **Settings → Pages**
4. Wähle **Source: GitHub Actions**

### Deployment

Der Workflow in `.github/workflows/deploy.yml` baut und deployed die App automatisch bei jedem Push auf `main`.

Manuell auslösen: **Actions → Deploy to GitHub Pages → Run workflow**

Die App ist dann erreichbar unter:
```
https://looped83.github.io/chapter-club/
```

---

## Supabase Auth konfigurieren

1. In Supabase → **Authentication → URL Configuration**
2. **Site URL** setzen: `https://looped83.github.io/chapter-club`
3. **Redirect URLs** hinzufügen: `https://looped83.github.io/chapter-club/**`

---

## Projektstruktur

```
src/
├── components/
│   ├── ui/          # Basiskomponenten (Button, Input, Card, Badge, …)
│   ├── layout/      # AppShell (Navigation)
│   ├── book/        # BookCover, StarRating
│   ├── progress/    # ProgressSlider, GroupProgress
│   ├── review/      # ReviewForm, ReviewCard
│   └── voting/      # SuggestionForm, SuggestionCard
├── hooks/           # TanStack Query Hooks
│   ├── useBooks.ts
│   ├── useBookProgress.ts
│   ├── useReviews.ts
│   └── useVoting.ts
├── lib/
│   ├── supabase.ts  # Supabase Client
│   ├── AuthContext.tsx
│   └── queryKeys.ts
├── pages/           # Route-Komponenten
│   ├── DashboardPage.tsx
│   ├── BookDetailPage.tsx
│   ├── LibraryPage.tsx
│   ├── VotingPage.tsx
│   └── ProfilePage.tsx
└── types/
    └── database.ts  # TypeScript Interfaces
```

---

## Lokale Entwicklung

```bash
npm run dev      # Dev Server
npm run build    # Produktions-Build
npm run lint     # ESLint
npm run format   # Prettier
```
