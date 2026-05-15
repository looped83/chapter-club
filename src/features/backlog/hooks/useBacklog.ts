import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys, STALE_TIMES } from '@/lib/queryKeys'
import {
  fetchBacklogBooks,
  fetchVotesForMonth,
  addBacklogBook,
  updateBacklogBook,
  archiveBacklogBook,
  castVote,
  setBookSelected,
} from '../queries'
import type { BacklogBookWithVotes } from '../types'
import { getVotingTarget } from '../utils/votingMonth'

function voteQueryKey() {
  const { month, year } = getVotingTarget()
  return queryKeys.backlog(month, year)
}

export function useBacklogBooks(userId: string) {
  const { month, year } = getVotingTarget()
  const queryKey = queryKeys.backlog(month, year)
  return useQuery({
    queryKey,
    queryFn: async () => {
      const [books, votes] = await Promise.all([fetchBacklogBooks(), fetchVotesForMonth(month, year)])
      const voteCounts = new Map<string, number>()
      for (const v of votes) voteCounts.set(v.suggestion_id, (voteCounts.get(v.suggestion_id) ?? 0) + 1)
      const myVote = votes.find((v) => v.user_id === userId)
      return books.map((book) => ({
        ...book,
        vote_count: voteCounts.get(book.id) ?? 0,
        is_my_vote: myVote?.suggestion_id === book.id,
      })) as BacklogBookWithVotes[]
    },
    staleTime: STALE_TIMES.short,
    enabled: !!userId,
  })
}

export function useCastBacklogVote() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: castVote,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: voteQueryKey() }),
  })
}

export function useAddBacklogBook() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: {
      userId: string
      title: string
      author: string
      description: string | null
      coverUrl: string | null
      reason: string | null
    }) =>
      addBacklogBook({
        userId: input.userId,
        title: input.title,
        author: input.author,
        description: input.description,
        cover_url: input.coverUrl,
        reason: input.reason,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: voteQueryKey() }),
  })
}

export function useUpdateBacklogBook() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: {
      id: string
      title: string
      author: string
      description: string | null
      coverUrl: string | null
      reason: string | null
    }) =>
      updateBacklogBook(input.id, {
        title: input.title,
        author: input.author,
        description: input.description,
        cover_url: input.coverUrl,
        reason: input.reason,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: voteQueryKey() }),
  })
}

export function useArchiveBacklogBook() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: archiveBacklogBook,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: voteQueryKey() }),
  })
}

export function useSetBookSelected() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: setBookSelected,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: voteQueryKey() }),
  })
}
