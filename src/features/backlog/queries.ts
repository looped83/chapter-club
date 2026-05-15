import { supabase } from '@/lib/supabase'
import type { BacklogBookWithProfile, BacklogVote } from './types'

export async function fetchBacklogBooks(): Promise<BacklogBookWithProfile[]> {
  const { data, error } = await supabase
    .from('book_suggestions')
    .select('*, profiles(id, display_name, avatar_emoji)')
    .in('status', ['active', 'selected'])
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data ?? []) as BacklogBookWithProfile[]
}

export async function fetchVotesForMonth(month: number, year: number): Promise<BacklogVote[]> {
  const { data, error } = await supabase
    .from('suggestion_votes')
    .select('id, suggestion_id, user_id, target_month, target_year, created_at, updated_at')
    .eq('target_month', month)
    .eq('target_year', year)
  if (error) throw error
  return (data ?? []) as BacklogVote[]
}

export async function addBacklogBook(input: {
  userId: string
  title: string
  author: string
  description: string | null
  cover_url: string | null
  reason: string | null
}): Promise<void> {
  const { error } = await supabase.from('book_suggestions').insert({
    suggested_by: input.userId,
    title: input.title,
    author: input.author,
    description: input.description,
    cover_url: input.cover_url,
    reason: input.reason,
    status: 'active',
    target_month: null,
    target_year: null,
  })
  if (error) throw error
}

export async function updateBacklogBook(
  id: string,
  input: {
    title: string
    author: string
    description: string | null
    cover_url: string | null
    reason: string | null
  },
): Promise<void> {
  const { error } = await supabase
    .from('book_suggestions')
    .update({
      title: input.title,
      author: input.author,
      description: input.description,
      cover_url: input.cover_url,
      reason: input.reason,
    })
    .eq('id', id)
  if (error) throw error
}

export async function archiveBacklogBook(id: string): Promise<void> {
  const { error } = await supabase
    .from('book_suggestions')
    .update({ status: 'archived' })
    .eq('id', id)
  if (error) throw error
}

export async function castVote(input: {
  userId: string
  bookId: string
  targetMonth: number
  targetYear: number
}): Promise<void> {
  const { data: existing } = await supabase
    .from('suggestion_votes')
    .select('id, suggestion_id')
    .eq('user_id', input.userId)
    .eq('target_month', input.targetMonth)
    .eq('target_year', input.targetYear)
    .maybeSingle()

  const existingVote = existing as { id: string; suggestion_id: string } | null

  if (existingVote) {
    if (existingVote.suggestion_id === input.bookId) {
      const { error } = await supabase
        .from('suggestion_votes')
        .delete()
        .eq('id', existingVote.id)
      if (error) throw error
    } else {
      const { error } = await supabase
        .from('suggestion_votes')
        .update({ suggestion_id: input.bookId, updated_at: new Date().toISOString() })
        .eq('id', existingVote.id)
      if (error) throw error
    }
  } else {
    const { error } = await supabase.from('suggestion_votes').insert({
      user_id: input.userId,
      suggestion_id: input.bookId,
      target_month: input.targetMonth,
      target_year: input.targetYear,
    })
    if (error) throw error
  }
}

export async function setBookSelected(id: string): Promise<void> {
  const { error } = await supabase
    .from('book_suggestions')
    .update({ status: 'selected' })
    .eq('id', id)
  if (error) throw error
}
