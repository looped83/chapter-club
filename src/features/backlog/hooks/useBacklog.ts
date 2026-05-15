import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
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

export function useBacklogBooks(userId: string) {
  const { month, year } = getVotingTarget()
  return useQuery({
    queryKey: queryKeys.backlog(month, year),
    queryFn: async () => {
      const [books, votes] = await Promise.all([
        fetchBacklogBooks(),
        fetchVotesForMonth(month, year),
      ])
      const myVote = votes.find((v) => v.user_id === userId)
      return books.map((book) => ({
        ...book,
        vote_count: votes.filter((v) => v.suggestion_id === book.id).length,
        is_my_vote: myVote?.suggestion_id === book.id,
      })) as BacklogBookWithVotes[]
    },
    staleTime: 1000 * 30,
    enabled: !!userId,
  })
}

export function useCastBacklogVote() {
  const queryClient = useQueryClient()
  const { month, year } = getVotingTarget()
  return useMutation({
    mutationFn: castVote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.backlog(month, year) })
    },
  })
}

export function useAddBacklogBook() {
  const queryClient = useQueryClient()
  const { month, year } = getVotingTarget()
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.backlog(month, year) })
    },
  })
}

export function useUpdateBacklogBook() {
  const queryClient = useQueryClient()
  const { month, year } = getVotingTarget()
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.backlog(month, year) })
    },
  })
}

export function useArchiveBacklogBook() {
  const queryClient = useQueryClient()
  const { month, year } = getVotingTarget()
  return useMutation({
    mutationFn: archiveBacklogBook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.backlog(month, year) })
    },
  })
}

export function useSetBookSelected() {
  const queryClient = useQueryClient()
  const { month, year } = getVotingTarget()
  return useMutation({
    mutationFn: setBookSelected,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.backlog(month, year) })
    },
  })
}
