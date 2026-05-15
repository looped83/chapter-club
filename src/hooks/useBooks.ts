import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { queryKeys, STALE_TIMES } from '@/lib/queryKeys'
import type { BookWithProfile } from '@/types/database'

export function useBooks() {
  return useQuery({
    queryKey: queryKeys.books,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('books')
        .select('*, profiles(id, display_name, avatar_emoji)')
        .order('year', { ascending: false })
        .order('month', { ascending: false })
      if (error) throw error
      return data as BookWithProfile[]
    },
    staleTime: STALE_TIMES.long,
    gcTime: STALE_TIMES.long * 2,
  })
}

export function useBook(bookId: string) {
  return useQuery({
    queryKey: queryKeys.book(bookId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('books')
        .select('*, profiles(id, display_name, avatar_emoji)')
        .eq('id', bookId)
        .single()
      if (error) throw error
      return data as BookWithProfile
    },
    enabled: !!bookId,
    staleTime: STALE_TIMES.long,
    gcTime: STALE_TIMES.long * 2,
  })
}
