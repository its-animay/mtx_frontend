import { masterClient } from "@/shared/lib/http/masterClient"

export interface TestListQuery {
  skip?: number
  limit?: number
  status?: string
  is_active?: boolean
  series_id?: string
  language?: string
  tags?: string[]
  sort_by?: "created_at" | "name"
  sort_order?: "asc" | "desc"
}

export interface TestListItem {
  test_id: string
  name: string
  description?: string
  language?: string
  status?: string
  tags?: string[]
  pattern?: {
    sections?: Array<{ total_questions?: number }>
    estimated_time_min?: number
  }
  questions?: Array<{ question_id: string }>
}

export interface TestListResponse {
  items: TestListItem[]
  total: number
  skip: number
  limit: number
}

export interface TestPreviewQuestion {
  question_id: string
  question_type?: string
  text: string
  options?: Array<{ option_id?: string; label?: string; text?: string }>
  marks?: number
  section_id?: string
}

export interface TestPreviewResponse {
  test: { test_id: string; name: string }
  questions: TestPreviewQuestion[]
}

export async function fetchTests(params: TestListQuery): Promise<TestListResponse> {
  const { data } = await masterClient.get("/tests", { params })
  return data
}

export async function fetchTestPreview(testId?: string): Promise<TestPreviewResponse> {
  if (!testId) throw new Error("Missing testId")
  const { data } = await masterClient.get(`/tests/${testId}/preview`)
  return data
}
