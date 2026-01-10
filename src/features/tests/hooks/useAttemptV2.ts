import { useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/shared/lib/http/apiClient"

export interface AttemptQuestionBlueprint {
  question_id: string
  section_id: string
  global_seq: number
  section_seq: number
  question_type: string
  subject_id?: string
  topic_ids?: string[]
  difficulty?: number
  marks?: Record<string, unknown>
  is_bonus?: boolean
  is_optional?: boolean
}

export interface CreateAttemptRequest {
  test_id: string
  series_id?: string
  test_number?: number
  terms_accepted?: boolean
  questions: AttemptQuestionBlueprint[]
  applied_settings_snapshot?: Record<string, unknown>
  test_snapshot?: Record<string, unknown>
  security_context?: Record<string, unknown>
}

export interface CreateAttemptResponse {
  attempt_id: string
  status: "in_progress" | "paused" | "submitted"
  terms_accepted: boolean
  attempt_revision: number
  attempt_question_order: Array<{
    question_id: string
    section_id: string
    global_seq: number
    section_seq: number
  }>
}

export interface SaveResponseRequest {
  action_type:
    | "select_option"
    | "unselect_option"
    | "set_numeric"
    | "set_text"
    | "clear_answer"
    | "finalize_answer"
  payload: Record<string, unknown>
  client_event_id?: string
  source?: string
  latency_ms?: number
  attempt_revision?: number
}

export function useCreateAttemptV2() {
  return useMutation({
    mutationFn: (payload: CreateAttemptRequest) =>
      apiClient.post<CreateAttemptResponse>("/attempts-v2", payload).then((res) => res.data),
  })
}

export function useSaveAttemptResponse(attemptId?: string, questionId?: string, sectionId?: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: SaveResponseRequest) =>
      apiClient
        .put(`/attempts-v2/${attemptId}/questions/${questionId}/response`, payload, {
          params: sectionId ? { section_id: sectionId } : undefined,
        })
        .then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries()
    },
  })
}

export function useSubmitAttemptV2(attemptId?: string) {
  return useMutation({
    mutationFn: () => apiClient.post(`/attempts-v2/${attemptId}/submit`).then((res) => res.data),
  })
}

export interface AttemptQuestionStatus {
  question_id: string
  section_id: string
  global_seq: number
  section_seq: number
  question_type: string
  attempt_status: "unvisited" | "seen" | "answered" | "skipped" | "review" | "answered_review"
  response_summary?: {
    latest_response_id?: string
    latest_version?: number
    is_final_answered?: boolean
  }
  marked_for_review?: boolean
}

export function useAttemptQuestions(attemptId?: string) {
  return useMutation({
    mutationFn: () =>
      apiClient
        .get<AttemptQuestionStatus[]>(`/attempts-v2/${attemptId}/questions`)
        .then((res) => res.data),
  })
}
