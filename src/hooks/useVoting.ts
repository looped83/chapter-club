import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { queryKeys } from '@/lib/queryKeys'

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
