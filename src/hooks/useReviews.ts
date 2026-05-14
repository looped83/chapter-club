import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { queryKeys } from '@/lib/queryKeys'
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
    staleTime: 1000 * 60,
  })
}

export function useMyReview(bookId: string, userId: string) {
  return useQuery({
    queryKey: queryKeys.myReview(bookId, userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('book_id', bookId)
        .eq('user_id', userId)
        .maybeSingle()
      if (error) throw error
      return data as Review | null
    },
    enabled: !!bookId && !!userId,
  })
}

interface UpsertReviewInput {
  bookId: string
  userId: string
  rating: number
  reviewText: string
  favoriteQuote: string
  containsSpoilers: boolean
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
