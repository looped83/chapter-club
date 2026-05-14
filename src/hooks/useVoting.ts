import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { queryKeys } from '@/lib/queryKeys'
import type { BookSuggestionWithProfile, SuggestionVote } from '@/types/database'

export function useSuggestions(month: number, year: number) {
  return useQuery({
    queryKey: queryKeys.suggestions(month, year),
    queryFn: async () => {
      const { data: suggestions, error: sErr } = await supabase
        .from('book_suggestions')
        .select('*, profiles(id, display_name, avatar_emoji)')
        .eq('target_month', month)
        .eq('target_year', year)
        .order('created_at', { ascending: true })
      if (sErr) throw sErr

      const { data: votes, error: vErr } = await supabase
        .from('suggestion_votes')
        .select('suggestion_id, user_id')
        .eq('target_month', month)
        .eq('target_year', year)
      if (vErr) throw vErr

      const votesArr = (votes ?? []) as { suggestion_id: string; user_id: string }[]

      return ((suggestions ?? []) as BookSuggestionWithProfile[]).map((s) => ({
        ...s,
        vote_count: votesArr.filter((v) => v.suggestion_id === s.id).length,
      }))
    },
    staleTime: 1000 * 30,
  })
}

export function useMyVote(userId: string, month: number, year: number) {
  return useQuery({
    queryKey: queryKeys.votes(month, year),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('suggestion_votes')
        .select('*')
        .eq('user_id', userId)
        .eq('target_month', month)
        .eq('target_year', year)
        .maybeSingle()
      if (error) throw error
      return data as SuggestionVote | null
    },
    enabled: !!userId,
  })
}

export function useCastVote(month: number, year: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ userId, suggestionId }: { userId: string; suggestionId: string }) => {
      const { data: existing } = await supabase
        .from('suggestion_votes')
        .select('id, suggestion_id')
        .eq('user_id', userId)
        .eq('target_month', month)
        .eq('target_year', year)
        .maybeSingle()

      const existingVote = existing as { id: string; suggestion_id: string } | null

      if (existingVote) {
        // Toggle: clicking the already-voted suggestion removes the vote
        if (existingVote.suggestion_id === suggestionId) {
          const { error } = await supabase
            .from('suggestion_votes')
            .delete()
            .eq('id', existingVote.id)
          if (error) throw error
        } else {
          const { error } = await supabase
            .from('suggestion_votes')
            .update({ suggestion_id: suggestionId })
            .eq('id', existingVote.id)
          if (error) throw error
        }
      } else {
        const { error } = await supabase
          .from('suggestion_votes')
          .insert({ user_id: userId, suggestion_id: suggestionId, target_month: month, target_year: year })
        if (error) throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.suggestions(month, year) })
      queryClient.invalidateQueries({ queryKey: queryKeys.votes(month, year) })
    },
  })
}

export function useSubmitSuggestion(month: number, year: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: {
      userId: string
      title: string
      author: string
      description: string
      coverUrl: string
      reason: string
    }) => {
      const { error } = await supabase.from('book_suggestions').insert({
        suggested_by: input.userId,
        title: input.title,
        author: input.author,
        description: input.description || null,
        cover_url: input.coverUrl || null,
        reason: input.reason || null,
        target_month: month,
        target_year: year,
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.suggestions(month, year) })
    },
  })
}
