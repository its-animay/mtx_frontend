export type TestType = "full" | "topic" | "mock" | "practice"

export interface TestSeries {
  id: string
  name: string
  subtitle?: string
  subjects: string[]
  questions?: number
  timeMinutes?: number
  totalMarks?: number
  attempts?: number
  avgScore?: number
  type: TestType
  status?: "not_started" | "in_progress" | "completed"
  tags?: string[]
  language?: string
}

export interface QuestionOption {
  id: string
  label: string
  text: string
}

export interface Question {
  id: string
  text: string
  mediaUrl?: string
  options: QuestionOption[]
  multiple?: boolean
}

export interface DiscoverQuestion {
  text: string
  type: string
  options: Array<{ label?: string; text?: string; value?: string }>
  answer_key?: { type: string; value?: string }
  solution?: { explanation?: string; steps?: string[] }
  taxonomy?: {
    subject_id?: string
    topic_ids?: string[]
    target_exam_ids?: string[]
  }
  difficulty?: number
  tags?: string[]
  language?: string
  usage?: { status?: string; is_active?: boolean }
  meta?: { estimated_time_sec?: number; source?: string }
  question_id: string
  created_at?: string
}

export interface DiscoverQuestionResponse {
  items: DiscoverQuestion[]
  total: number
  skip: number
  limit: number
}
