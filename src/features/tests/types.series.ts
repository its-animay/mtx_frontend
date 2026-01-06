export type SeriesStatus = "not_started" | "in_progress" | "completed"
export type SeriesDifficulty = "easy" | "medium" | "hard" | "mixed"

export interface UserProgressSummary {
  status: SeriesStatus
  attempted_papers: number
  total_papers: number
  last_activity_at?: string
  active_attempt_id?: string
  best_score?: number
}

export interface TestSeriesItem {
  series_id: string
  title: string
  subtitle?: string
  exam?: string
  stage?: string
  tags?: string[]
  languages?: string[]
  difficulty?: SeriesDifficulty
  papers_count?: number
  total_duration_sec?: number
  total_questions?: number
  published_at?: string
  updated_at?: string
  badges?: { is_new?: boolean; recommended?: boolean }
  user_progress?: UserProgressSummary
}

export interface TestSeriesListResponse {
  page: number
  page_size: number
  total: number
  has_next: boolean
  items: TestSeriesItem[]
}

// Proposed API client (signature only; not implemented)
export interface FetchTestSeriesParams {
  q?: string
  exam?: string
  stage?: string
  type?: string
  difficulty?: SeriesDifficulty | "all"
  language?: string
  status?: SeriesStatus | "all"
  sort?: "newest" | "recent_activity" | "most_attempted" | "highest_score" | "shortest_duration" | "most_papers"
  page?: number
  page_size?: number
}
// export async function fetchTestSeries(params: FetchTestSeriesParams): Promise<TestSeriesListResponse> { ... }
