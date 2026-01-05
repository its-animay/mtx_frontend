import { useQuery } from "@tanstack/react-query"
import { getPracticeSummary } from "../api/practice"

export const practiceSummaryKeys = {
  summary: (params: {
    range?: "7d" | "30d" | "90d" | "all"
    subject_id?: string
    topic_id?: string
    difficulty_min?: number
    difficulty_max?: number
  }) => ["practice-summary", params] as const,
}

export function usePracticeSummary(params: {
  range?: "7d" | "30d" | "90d" | "all"
  subject_id?: string
  topic_id?: string
  difficulty_min?: number
  difficulty_max?: number
}) {
  return useQuery({
    queryKey: practiceSummaryKeys.summary(params),
    queryFn: () => getPracticeSummary(params),
    staleTime: 60 * 1000,
  })
}
