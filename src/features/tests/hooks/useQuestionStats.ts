import { useQuery } from "@tanstack/react-query"
import { getQuestionStats } from "../api/practice"

export const questionStatsKeys = {
  stats: (questionId: string) => ["practice-question-stats", questionId] as const,
}

export function useQuestionStats(questionId?: string) {
  return useQuery({
    queryKey: questionId ? questionStatsKeys.stats(questionId) : ["practice-question-stats", "none"],
    queryFn: () => getQuestionStats(questionId as string),
    enabled: Boolean(questionId),
    staleTime: 60 * 1000,
  })
}
