import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { queryKeys, STALE_TIMES } from '@/lib/queryKeys'
import type { Review, ReviewWithProfile } from '@/types/database'

export function useBookReviews(bookId: string) {
  return useQuery({
    queryKey: queryKeys.bookReviews(bookId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('*, profiles(id, display_name, avatar_emoji)')
        .eq('book_id', bookId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []) as ReviewWithProfile[]
    },
    enabled: !!bookId,
    staleTime: STALE_TIMES.medium,
  })
}

export function useMyReview(bookId: string, userId: string) {
  return useQuery({
    queryKey: queryKeys.myReview(bookId, userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('id, book_id, user_id, rating, review_text, favorite_quote, contains_spoilers, emotional_impact, would_reread, pace, one_word, created_at, updated_at')
        .eq('book_id', bookId)
        .eq('user_id', userId)
        .maybeSingle()
      if (error) throw error
      return data as Review | null
    },
    enabled: !!bookId && !!userId,
    staleTime: STALE_TIMES.medium,
  })
}

interface UpsertReviewInput {
  bookId: string
  userId: string
  rating: number
  reviewText: string
  favoriteQuote: string
  containsSpoilers: boolean
  emotionalImpact: number | null
  wouldReread: boolean | null
  pace: string | null
  oneWord: string
}

export function useUpsertReview() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: UpsertReviewInput) => {
      const { data, error } = await supabase
        .from('reviews')
        .upsert(
          {
            book_id: input.bookId,
            user_id: input.userId,
            rating: input.rating,
            review_text: input.reviewText || null,
            favorite_quote: input.favoriteQuote || null,
            contains_spoilers: input.containsSpoilers,
            emotional_impact: input.emotionalImpact,
            would_reread: input.wouldReread,
            pace: input.pace,
            one_word: input.oneWord || null,
          },
          { onConflict: 'book_id,user_id' }
        )
        .select()
        .single()
      if (error) throw error
      return data as Review
    },
    onSuccess: (_data, input) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookReviews(input.bookId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.myReview(input.bookId, input.userId) })
    },
  })
}

export function useDeleteReview() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ reviewId, bookId, userId }: { reviewId: string; bookId: string; userId: string }) => {
      const { error } = await supabase.from('reviews').delete().eq('id', reviewId)
      if (error) throw error
      return { bookId, userId }
    },
    onSuccess: (_data, input) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookReviews(input.bookId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.myReview(input.bookId, input.userId) })
    },
  })
}
