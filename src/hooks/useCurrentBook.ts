import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { queryKeys } from '@/lib/queryKeys'
import type { BookWithProfile } from '@/types/database'

export function useCurrentBook() {
  return useQuery({
    queryKey: queryKeys.currentBook,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('books')
        .select('*, profiles(id, display_name, avatar_emoji)')
        .eq('is_current', true)
        .maybeSingle()
      if (error) throw error
      return data as BookWithProfile | null
    },
    staleTime: 1000 * 60 * 5,
  })
}
