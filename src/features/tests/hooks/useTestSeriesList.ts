import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"

import { masterClient } from "@/shared/lib/http/masterClient"
import type { FetchTestSeriesParams, TestSeriesItem, TestSeriesListResponse } from "../types.series"
import { useTestsList } from "./useTests"

async function fetchTestSeries(params: FetchTestSeriesParams): Promise<TestSeriesListResponse> {
  const { data } = await masterClient.get("/test-series", { params })
  return data
}

// Fallback mock adapter: derive series from existing /tests list until backend is ready.
function useTestSeriesMock(params: FetchTestSeriesParams): TestSeriesListResponse {
  // Seeded mock series to exercise filters and tabs
  const seeded: TestSeriesItem[] = [
    {
      series_id: "jee_main_full",
      title: "JEE Main Full Tests 2026",
      subtitle: "12 full-length mocks for Jan/Apr",
      exam: "jee",
      stage: "mock",
      tags: ["physics", "chemistry", "math"],
      languages: ["en", "hi"],
      difficulty: "mixed",
      papers_count: 12,
      total_duration_sec: 12 * 180 * 60,
      total_questions: 12 * 75,
      badges: { is_new: true },
      user_progress: { status: "in_progress", attempted_papers: 3, total_papers: 12, active_attempt_id: "att_j1" },
    },
    {
      series_id: "neet_practice",
      title: "NEET Practice Series",
      exam: "neet",
      stage: "practice",
      tags: ["biology", "chemistry", "physics"],
      languages: ["en"],
      difficulty: "medium",
      papers_count: 20,
      total_questions: 20 * 90,
      badges: { recommended: true },
      user_progress: { status: "not_started", attempted_papers: 0, total_papers: 20 },
    },
    {
      series_id: "upsc_gs",
      title: "UPSC GS Test Series",
      exam: "upsc",
      stage: "prelims",
      tags: ["polity", "history", "economy"],
      languages: ["en"],
      difficulty: "hard",
      papers_count: 10,
      user_progress: { status: "completed", attempted_papers: 10, total_papers: 10, best_score: 78 },
    },
    {
      series_id: "cat_mocks",
      title: "CAT Mocks 2026",
      exam: "cat",
      stage: "mock",
      tags: ["dilr", "qa", "varc"],
      languages: ["en"],
      difficulty: "medium",
      papers_count: 8,
      user_progress: { status: "in_progress", attempted_papers: 2, total_papers: 8, active_attempt_id: "att_cat" },
    },
    {
      series_id: "ssc_practice",
      title: "SSC CGL Practice",
      exam: "ssc",
      stage: "practice",
      tags: ["quant", "reasoning", "english"],
      languages: ["en", "hi"],
      difficulty: "easy",
      papers_count: 15,
      user_progress: { status: "not_started", attempted_papers: 0, total_papers: 15 },
    },
    {
      series_id: "general",
      title: "General Practice Series",
      exam: "general",
      stage: "practice",
      tags: ["mixed"],
      languages: ["en"],
      difficulty: "mixed",
      papers_count: 5,
      user_progress: { status: "completed", attempted_papers: 5, total_papers: 5, best_score: 88 },
    },
  ]

  const testsQuery = useTestsList({
    skip: ((params.page ?? 1) - 1) * (params.page_size ?? 12),
    limit: params.page_size ?? 12,
    status: "published",
    is_active: true,
    sort_by: "created_at",
    sort_order: "desc",
  })

  const items: TestSeriesItem[] = useMemo(() => {
    const KNOWN_EXAMS = ["upsc", "jee", "neet", "cat", "ssc", "banking"]
    const tests = testsQuery.data?.items ?? []
    const grouped: Record<string, TestSeriesItem> = {}

    tests.forEach((t) => {
      const examFamily = (t as any).exam_family?.toLowerCase?.()
      const tagMatch = (t.tags || []).map((tag) => tag.toLowerCase()).find((tag) => KNOWN_EXAMS.includes(tag))
      const derivedId = examFamily || tagMatch || "general"
      const seriesId = derivedId
      const seriesName = derivedId === "general" ? "General Practice Series" : `${derivedId.toUpperCase()} Test Series`
      if (!grouped[seriesId]) {
        grouped[seriesId] = {
          series_id: seriesId,
          title: seriesName,
          exam: derivedId,
          tags: t.tags || [],
          languages: t.language ? [t.language] : [],
          difficulty: "mixed",
          papers_count: 0,
          total_duration_sec: 0,
          total_questions: 0,
          badges: { is_new: false, recommended: false },
          user_progress: {
            status: "not_started",
            attempted_papers: 0,
            total_papers: 0,
          },
        }
      }
      const paperQuestions =
        t.pattern?.sections?.reduce((sum, sec) => sum + (sec.total_questions || 0), 0) || t.questions?.length || 0
      const paperDuration = t.pattern?.estimated_time_min ? t.pattern.estimated_time_min * 60 : 0
      grouped[seriesId].papers_count = (grouped[seriesId].papers_count || 0) + 1
      grouped[seriesId].total_questions = (grouped[seriesId].total_questions || 0) + paperQuestions
      grouped[seriesId].total_duration_sec = (grouped[seriesId].total_duration_sec || 0) + paperDuration
      grouped[seriesId].user_progress = {
        status: "not_started",
        attempted_papers: 0,
        total_papers: grouped[seriesId].papers_count,
      }
    })

    return Object.values(grouped)
  }, [testsQuery.data])

  // merge seeded + derived, apply simple filters
  // merge seeded + derived, dedupe by series_id
  const mergedMap = new Map<string, TestSeriesItem>()
  ;[...seeded, ...items].forEach((s) => {
    if (!mergedMap.has(s.series_id)) mergedMap.set(s.series_id, s)
  })
  const merged = Array.from(mergedMap.values())

  const filtered = merged.filter((s) => {
    if (params.q && !s.title.toLowerCase().includes(params.q.toLowerCase())) return false
    if (params.exam && s.exam !== params.exam) return false
    if (params.difficulty && params.difficulty !== "all" && s.difficulty !== params.difficulty) return false
    if (params.language && params.language !== "all" && !(s.languages || []).includes(params.language)) return false
    return true
  })

  return {
    page: params.page ?? 1,
    page_size: params.page_size ?? 12,
    total: filtered.length,
    has_next: false,
    items: filtered,
  }
}

export function useTestSeriesList(params: FetchTestSeriesParams, useMockFallback = true) {
  const query = useQuery({
    queryKey: ["test-series", params],
    queryFn: () => fetchTestSeries(params),
    enabled: true,
    retry: 1,
  })

  if (!useMockFallback) return query

  const testsQuery = useTestsList({
    skip: 0,
    limit: 100,
    status: "published",
    is_active: true,
  })

  const mockData = useTestSeriesMock(params)
  const shouldUseMock = query.isError || (query.data?.items?.length ?? 0) === 0

  return {
    ...query,
    data: shouldUseMock ? mockData : query.data,
    isError: query.isError,
    mockUsed: shouldUseMock,
    mockLoading: testsQuery.isLoading,
  }
}
