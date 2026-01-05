import { masterClient } from "@/shared/lib/http/masterClient"
import type { DiscoverQuestion, DiscoverQuestionResponse } from "../types"

export interface DiscoverQueryParams {
  subject_id?: string
  topic_ids?: string[]
  target_exam_ids?: string[]
  difficulty_min?: number
  difficulty_max?: number
  tags?: string[]
  status_value?: string
  is_active?: boolean
  search?: string
  skip?: number
  limit?: number
  sort_by?: string
  sort_order?: "asc" | "desc"
}

export async function fetchDiscoverQuestions(params: DiscoverQueryParams): Promise<DiscoverQuestionResponse> {
  const { data } = await masterClient.get<{ items: DiscoverQuestion[]; total: number; skip: number; limit: number }>(
    "/list/questions/discover",
    {
      params: {
        status_value: "published",
        is_active: true,
        sort_by: "created_at",
        sort_order: "desc",
        ...params,
        topic_ids: params.topic_ids && params.topic_ids.length ? params.topic_ids.join(",") : undefined,
        target_exam_ids:
          params.target_exam_ids && params.target_exam_ids.length ? params.target_exam_ids.join(",") : undefined,
        tags: params.tags && params.tags.length ? params.tags.join(",") : undefined,
      },
    },
  )
  return data
}
