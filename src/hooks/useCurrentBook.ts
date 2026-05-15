import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { queryKeys, STALE_TIMES } from '@/lib/queryKeys'
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
    staleTime: STALE_TIMES.long,
    gcTime: STALE_TIMES.long * 2,
  })
}
