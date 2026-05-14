import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { queryKeys } from '@/lib/queryKeys'
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
    staleTime: 1000 * 60 * 5,
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
    staleTime: 1000 * 60 * 5,
  })
}
