import type { Profile, BacklogStatus } from '@/types/database'

export type { BacklogStatus }

export interface BacklogBook {
  id: string
  title: string
  author: string
  description: string | null
  cover_url: string | null
  reason: string | null
  suggested_by: string
  status: BacklogStatus
  target_month: number | null
  target_year: number | null
  created_at: string
  updated_at: string
}

export interface BacklogBookWithProfile extends BacklogBook {
  profiles: Profile | null
}

export interface BacklogVote {
  id: string
  suggestion_id: string
  user_id: string
  target_month: number
  target_year: number
  created_at: string
  updated_at: string
}

export interface BacklogBookWithVotes extends BacklogBookWithProfile {
  vote_count: number
  is_my_vote: boolean
}
