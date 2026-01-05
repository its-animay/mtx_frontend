import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { submitPracticeAttempt, type SubmitPracticeAttemptRequest } from "../api/practice"
import { discoverKeys } from "./useDiscoverQuestions"
import { practiceSummaryKeys } from "./usePracticeSummary"
import { questionStatsKeys } from "./useQuestionStats"

export function useSubmitPracticeAttempt(questionId?: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: SubmitPracticeAttemptRequest) => submitPracticeAttempt(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: discoverKeys.list({}) })
      queryClient.invalidateQueries({ queryKey: practiceSummaryKeys.summary({ range: "30d" }) })
      if (questionId) {
        queryClient.invalidateQueries({ queryKey: questionStatsKeys.stats(questionId) })
      }
      toast.success("Attempt submitted")
    },
    onError: (error: any) => {
      const message = error?.response?.data?.detail || "Could not submit attempt"
      toast.error(message)
    },
  })
}
