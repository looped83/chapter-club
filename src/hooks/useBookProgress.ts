import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { queryKeys, STALE_TIMES } from '@/lib/queryKeys'
import type { ReadingProgress, ReadingProgressWithProfile, ReadingStatus, Mood } from '@/types/database'

export function useBookProgress(bookId: string) {
  return useQuery({
    queryKey: queryKeys.bookProgress(bookId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reading_progress')
        .select('*, profiles(id, display_name, avatar_emoji)')
        .eq('book_id', bookId)
        .order('updated_at', { ascending: false })
      if (error) throw error
      return (data ?? []) as ReadingProgressWithProfile[]
    },
    enabled: !!bookId,
    staleTime: STALE_TIMES.progress,
    gcTime: STALE_TIMES.progress * 2,
  })
}

export function useMyProgress(bookId: string, userId: string) {
  return useQuery({
    queryKey: queryKeys.myProgress(bookId, userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reading_progress')
        .select('id, book_id, user_id, progress_percent, status, mood, updated_at')
        .eq('book_id', bookId)
        .eq('user_id', userId)
        .maybeSingle()
      if (error) throw error
      return data as ReadingProgress | null
    },
    enabled: !!bookId && !!userId,
    staleTime: STALE_TIMES.progress,
    gcTime: STALE_TIMES.progress * 2,
  })
}

interface UpsertProgressInput {
  bookId: string
  userId: string
  progressPercent: number
  status: ReadingStatus
  mood: Mood | null
}

export function useUpsertProgress() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: UpsertProgressInput) => {
      const { data, error } = await supabase
        .from('reading_progress')
        .upsert(
          {
            book_id: input.bookId,
            user_id: input.userId,
            progress_percent: input.progressPercent,
            status: input.status,
            mood: input.mood,
          },
          { onConflict: 'book_id,user_id' }
        )
        .select()
        .single()
      if (error) throw error
      return data as ReadingProgress
    },
    onSuccess: (_data, input) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookProgress(input.bookId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.myProgress(input.bookId, input.userId) })
    },
  })
}
