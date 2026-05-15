export const queryKeys = {
  currentBook: ['books', 'current'] as const,
  books: ['books'] as const,
  book: (id: string) => ['books', id] as const,
  bookProgress: (bookId: string) => ['reading_progress', bookId] as const,
  myProgress: (bookId: string, userId: string) => ['reading_progress', bookId, userId] as const,
  bookReviews: (bookId: string) => ['reviews', bookId] as const,
  myReview: (bookId: string, userId: string) => ['reviews', bookId, userId] as const,
  profiles: ['profiles'] as const,
  backlog: (month: number, year: number) => ['backlog', month, year] as const,
}
