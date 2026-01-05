import { apiClient } from "@/shared/lib/http/apiClient"

export type PracticeAnswer =
  | { type: "single"; option_id: string }
  | { type: "multi"; option_ids: string[] }
  | { type: "value"; value: string }

export interface SubmitPracticeAttemptRequest {
  question_id: string
  answer: PracticeAnswer
  time_ms: number
  context?: {
    client_session_id?: string
    device?: string
    app_version?: string
  }
}

export interface SubmitPracticeAttemptResponse {
  event_id: string
  question_id: string
  is_correct: boolean
  correct_answer: PracticeAnswer
  attempt_no_for_question: number
  user_question_stats: {
    attempts: number
    correct_attempts: number
    incorrect_attempts: number
    avg_time_ms: number
    last_is_correct: boolean
    last_attempted_at: string
  }
}

export async function submitPracticeAttempt(payload: SubmitPracticeAttemptRequest) {
  const { data } = await apiClient.post<SubmitPracticeAttemptResponse>("/practice/attempts", payload)
  return data
}

export interface QuestionStatsResponse {
  user_id: string
  question_id: string
  attempts: number
  correct_attempts: number
  incorrect_attempts: number
  avg_time_ms: number
  best_time_ms: number
  worst_time_ms: number
  last_is_correct: boolean
  last_attempted_at: string
}

export async function getQuestionStats(questionId: string) {
  const { data } = await apiClient.get<QuestionStatsResponse>(`/practice/questions/${questionId}/stats`)
  return data
}

export interface PracticeSummaryResponse {
  attempts: number
  correct: number
  incorrect: number
  accuracy_pct: number
  avg_time_ms: number
  by_subject: Array<{ subject_id: string; attempts: number; accuracy_pct: number }>
  by_topic: Array<{ topic_id: string; attempts: number; accuracy_pct: number }>
  by_difficulty: Array<{ difficulty: number; attempts: number; accuracy_pct: number }>
}

export async function getPracticeSummary(params: {
  range?: "7d" | "30d" | "90d" | "all"
  subject_id?: string
  topic_id?: string
  difficulty_min?: number
  difficulty_max?: number
}) {
  const { data } = await apiClient.get<PracticeSummaryResponse>("/practice/analytics/summary", {
    params: { range: "30d", ...params },
  })
  return data
}

export interface WeakTopicsResponse {
  items: Array<{ topic_id: string; attempts: number; accuracy_pct: number }>
}

export async function getWeakTopics() {
  const { data } = await apiClient.get<WeakTopicsResponse>("/practice/analytics/weak-topics")
  return data
}
