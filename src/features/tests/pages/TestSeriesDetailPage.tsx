import { useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"

import { useTestsList } from "../hooks/useTests"
import { TestCard } from "../components/TestCard"
import { TestFilters } from "../components/TestFilters"
import { APP_ROUTES } from "@/shared/config/env"
import { Button } from "@/shared/ui/button"
import type { TestSeries } from "../types"
import { PageTransition } from "@/shared/components/PageTransition"
import { Breadcrumbs } from "@/shared/ui/breadcrumbs"

const KNOWN_EXAMS = ["upsc", "jee", "neet", "cat", "ssc", "banking"]

export function TestSeriesDetailPage() {
  const { seriesId } = useParams()
  const navigate = useNavigate()
  const [filters, setFilters] = useState({ search: "", category: "all", sort: "newest", difficulty: "all", language: "all" })

  const testsQuery = useTestsList({
    skip: 0,
    limit: 100,
    status: "published",
    is_active: true,
  })

  const papers = useMemo(() => {
    const items = testsQuery.data?.items ?? []
    return items
      .filter((t) => belongsToSeries(t, seriesId))
      .map((t) => ({
        id: t.test_id,
        name: t.name,
        subtitle: t.description || "",
        subjects: t.tags || [],
        questions:
          t.pattern?.sections?.reduce((sum, sec) => sum + (sec.total_questions || 0), 0) || t.questions?.length || 0,
        timeMinutes: t.pattern?.estimated_time_min || 0,
        totalMarks: t.questions?.length || 0,
        attempts: 0,
        avgScore: 0,
        type: "mock" as const,
        tags: t.tags,
        language: t.language,
        status: "not_started" as const,
      }))
  }, [testsQuery.data, seriesId])

  const filtered = useMemo(() => {
    let list = [...papers]
    if (filters.search) {
      const needle = filters.search.toLowerCase()
      list = list.filter((t) => t.name.toLowerCase().includes(needle) || t.subtitle?.toLowerCase().includes(needle))
    }
    if (filters.category !== "all") list = list.filter((t) => t.type === filters.category)
    if (filters.sort === "attempted") list = list.sort((a, b) => (b.attempts || 0) - (a.attempts || 0))
    else if (filters.sort === "score") list = list.sort((a, b) => (b.avgScore || 0) - (a.avgScore || 0))
    else if (filters.sort === "short") list = list.sort((a, b) => (a.timeMinutes || 0) - (b.timeMinutes || 0))
    else if (filters.sort === "questions") list = list.sort((a, b) => (b.questions || 0) - (a.questions || 0))
    return list
  }, [papers, filters])

  const seriesName = useMemo(() => {
    if (!seriesId) return "Series"
    if (seriesId === "general") return "General Practice Series"
    return `${seriesId.toUpperCase()} Test Series`
  }, [seriesId])

  const handleChange = (field: "search" | "category" | "sort" | "difficulty" | "language", value: string) =>
    setFilters((prev) => ({ ...prev, [field]: value }))

  const handleReset = () => setFilters({ search: "", category: "all", sort: "newest", difficulty: "all", language: "all" })

  const openPaper = (test: TestSeries) => {
    if (!seriesId) return
    navigate(APP_ROUTES.testPaperInfo(seriesId, test.id))
  }

  return (
    <PageTransition className="space-y-4">
      <div className="mx-auto flex max-w-5xl flex-col gap-4">
        <Breadcrumbs
          items={[
            { label: "Dashboard", href: APP_ROUTES.dashboard },
            { label: "Test Series", href: APP_ROUTES.testSeriesCatalog },
            { label: seriesName, isCurrent: true },
          ]}
        />
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-foreground">{seriesName}</h1>
          <p className="text-sm text-muted-foreground">Showing {papers.length} papers in this series.</p>
        </div>

        <TestFilters
          search={filters.search}
          category={filters.category}
          sort={filters.sort}
          difficulty={filters.difficulty}
          language={filters.language}
          onChange={handleChange}
          onReset={handleReset}
          activeCount={getActiveCount(filters)}
        />

        <div className="grid gap-5 md:grid-cols-2">
          {testsQuery.isLoading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : filtered.length === 0 ? (
            <div className="col-span-full rounded-lg border border-dashed bg-slate-50 p-8 text-center text-sm text-muted-foreground">
              <div className="mb-2 text-3xl">📚</div>
              <p className="text-base font-semibold text-foreground">No papers found</p>
              <p className="text-sm text-muted-foreground">Try adjusting filters.</p>
              <Button variant="outline" className="mt-3" onClick={handleReset}>
                Clear Filters
              </Button>
            </div>
          ) : (
            filtered.map((test) => (
              <TestCard key={test.id} test={test} onPrimary={openPaper} onDetails={openPaper} />
            ))
          )}
        </div>
      </div>
    </PageTransition>
  )
}

function belongsToSeries(
  test: any,
  seriesId?: string,
) {
  if (!seriesId) return false
  const examFamily = test.exam_family?.toLowerCase()
  const tagMatch = (test.tags || []).map((t: string) => t.toLowerCase()).find((t: string) => KNOWN_EXAMS.includes(t))
  const derivedId = examFamily || tagMatch || "general"
  return derivedId === seriesId
}

function getActiveCount(filters: { search: string; category: string; sort: string; difficulty: string; language: string }) {
  let count = 0
  if (filters.search) count++
  if (filters.category !== "all") count++
  if (filters.sort !== "newest") count++
  if (filters.difficulty !== "all") count++
  if (filters.language !== "all") count++
  return count
}

function SkeletonCard() {
  return (
    <div className="h-[280px] rounded-xl border bg-white shadow-sm">
      <div className="h-full animate-pulse space-y-3 p-4">
        <div className="h-4 w-2/3 rounded bg-muted" />
        <div className="h-3 w-1/2 rounded bg-muted" />
        <div className="h-3 w-1/3 rounded bg-muted" />
        <div className="h-20 rounded bg-muted" />
      </div>
    </div>
  )
}
