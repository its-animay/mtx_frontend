## Test Series Catalog Revamp (Specification)

### Objective
Present a premium, exam-prep landing page for Test Series (not individual papers). Emphasize “Continue” UX, clear status (New / In Progress / Completed / All), and meaningful filters/sorting/pagination. This spec proposes minimal backend enhancements to avoid guessing from weak fields.

### Proposed Backend/Data Contract Enhancements

**New/Enhanced Endpoints**

- `GET /test-series` (paginated) – returns series list + per-user progress summary.
- `GET /test-series/:seriesId` – returns series metadata + paper list summary (optional but recommended).

**Suggested Query Params**
```
q, exam, stage, type (mock|practice), difficulty, language, status (not_started|in_progress|completed),
sort (newest|recent_activity|most_attempted|highest_score|shortest_duration|most_papers),
page (or cursor), page_size
```

**Response Shapes**
```jsonc
// GET /test-series
{
  "page": 1,
  "page_size": 12,
  "total": 120,
  "has_next": true,
  "items": [
    {
      "series_id": "jee_main_2026_full",
      "title": "JEE Main Full Tests 2026",
      "subtitle": "12 full-length mocks for Jan/Apr attempts",
      "exam": "JEE",
      "stage": "practice",
      "tags": ["physics", "chemistry", "math"],
      "languages": ["en", "hi"],
      "difficulty": "mixed",
      "papers_count": 12,
      "total_duration_sec": 12 * 180 * 60,
      "total_questions": 12 * 75,
      "published_at": "2026-01-01T00:00:00Z",
      "updated_at": "2026-01-10T00:00:00Z",
      "badges": { "is_new": true, "recommended": false },
      "user_progress": {
        "status": "in_progress",
        "attempted_papers": 3,
        "total_papers": 12,
        "last_activity_at": "2026-01-09T12:00:00Z",
        "active_attempt_id": "att_xxx",
        "best_score": 82.5
      }
    }
  ]
}
```

```jsonc
// GET /test-series/:seriesId (optional)
{
  "series_id": "jee_main_2026_full",
  "title": "JEE Main Full Tests 2026",
  "subtitle": "12 full-length mocks",
  "exam": "JEE",
  "stage": "practice",
  "tags": ["physics", "chemistry", "math"],
  "languages": ["en", "hi"],
  "difficulty": "mixed",
  "papers_count": 12,
  "total_duration_sec": 12 * 180 * 60,
  "total_questions": 12 * 75,
  "user_progress": {
    "status": "in_progress",
    "attempted_papers": 3,
    "total_papers": 12,
    "last_activity_at": "2026-01-09T12:00:00Z",
    "active_attempt_id": "att_xxx",
    "best_score": 82.5
  },
  "papers": [
    { "test_id": "t1", "name": "Mock 1", "duration_sec": 180*60, "questions": 75, "status": "completed" },
    { "test_id": "t2", "name": "Mock 2", "duration_sec": 180*60, "questions": 75, "status": "in_progress", "active_attempt_id": "att_123" }
  ]
}
```

### TypeScript Interfaces (proposed)
```ts
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
```

**API client signature (proposed)**
```ts
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

// Not implemented yet, but recommended:
// export async function fetchTestSeries(params: FetchTestSeriesParams): Promise<TestSeriesListResponse> { ... }
```

### UI/UX Plan (for next implementation)
- Hero header with title/subtitle + small stats pills (series count, in progress, completed).
- Pinned “Continue where you left off” card when active_attempt_id exists.
- Sticky filters toolbar: Search, Exam, Difficulty, Language, Sort, Clear.
- Tabs: All / New / In Progress / Completed (frontend filter from user_progress.status).
- Grid: 2 columns desktop, status badge, progress bar, key stats, CTA (Start/Resume/Retake).
- Pagination: page numbers or Load more.
- States: skeletons, empty, error.

### Notes
- This spec is frontend-driven; backend changes are proposed to remove guesswork.
- The UI should prioritize “continue/resume” when user_progress.active_attempt_id is present.
