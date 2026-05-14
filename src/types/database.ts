export type ReadingStatus = 'not_started' | 'reading' | 'finished' | 'paused' | 'abandoned'
export type Mood = '😍' | '😭' | '🤯' | '💤' | '🔥' | '😐'

export interface Profile {
  id: string
  display_name: string
  avatar_emoji: string
  created_at: string
}

export interface Book {
  id: string
  title: string
  author: string
  description: string | null
  cover_url: string | null
  month: number
  year: number
  suggested_by: string | null
  is_current: boolean
  created_at: string
}

export interface BookWithProfile extends Book {
  profiles: Profile | null
}

export interface ReadingProgress {
  id: string
  book_id: string
  user_id: string
  progress_percent: number
  status: ReadingStatus
  mood: Mood | null
  updated_at: string
}

export interface ReadingProgressWithProfile extends ReadingProgress {
  profiles: Profile | null
}

export interface Review {
  id: string
  book_id: string
  user_id: string
  rating: number
  review_text: string | null
  favorite_quote: string | null
  contains_spoilers: boolean
  created_at: string
  updated_at: string
}

export interface ReviewWithProfile extends Review {
  profiles: Profile | null
}

export interface BookSuggestion {
  id: string
  title: string
  author: string
  description: string | null
  cover_url: string | null
  reason: string | null
  suggested_by: string
  target_month: number
  target_year: number
  created_at: string
}

export interface BookSuggestionWithProfile extends BookSuggestion {
  profiles: Profile | null
  vote_count: number
  user_vote?: string | null
}

export interface SuggestionVote {
  id: string
  suggestion_id: string
  user_id: string
  target_month: number
  target_year: number
  created_at: string
  updated_at: string
}

// Supabase Database type (matches Supabase codegen format)
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: { id: string; display_name: string; avatar_emoji?: string; created_at?: string }
        Update: { display_name?: string; avatar_emoji?: string }
        Relationships: []
      }
      books: {
        Row: Book
        Insert: {
          id?: string; title: string; author: string; description?: string | null
          cover_url?: string | null; month: number; year: number
          suggested_by?: string | null; is_current?: boolean; created_at?: string
        }
        Update: {
          title?: string; author?: string; description?: string | null
          cover_url?: string | null; month?: number; year?: number
          suggested_by?: string | null; is_current?: boolean
        }
        Relationships: []
      }
      reading_progress: {
        Row: ReadingProgress
        Insert: {
          id?: string; book_id: string; user_id: string
          progress_percent?: number; status?: string; mood?: string | null; updated_at?: string
        }
        Update: {
          progress_percent?: number; status?: string; mood?: string | null; updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: Review
        Insert: {
          id?: string; book_id: string; user_id: string; rating: number
          review_text?: string | null; favorite_quote?: string | null
          contains_spoilers?: boolean; created_at?: string; updated_at?: string
        }
        Update: {
          rating?: number; review_text?: string | null; favorite_quote?: string | null
          contains_spoilers?: boolean; updated_at?: string
        }
        Relationships: []
      }
      book_suggestions: {
        Row: BookSuggestion
        Insert: {
          id?: string; title: string; author: string; description?: string | null
          cover_url?: string | null; reason?: string | null; suggested_by: string
          target_month: number; target_year: number; created_at?: string
        }
        Update: {
          title?: string; author?: string; description?: string | null
          cover_url?: string | null; reason?: string | null
        }
        Relationships: []
      }
      suggestion_votes: {
        Row: SuggestionVote
        Insert: {
          id?: string; suggestion_id: string; user_id: string
          target_month: number; target_year: number; created_at?: string; updated_at?: string
        }
        Update: { suggestion_id?: string; updated_at?: string }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
