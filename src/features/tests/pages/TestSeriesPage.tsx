import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"

import { PageTransition } from "@/shared/components/PageTransition"
import { TestFilters } from "../components/TestFilters"
import { TestCard } from "../components/TestCard"
import { TestDetailModal } from "../components/TestDetailModal"
import type { TestSeries } from "../types"
import { useTestsList } from "../hooks/useTests"
import { APP_ROUTES } from "@/shared/config/env"
import { Button } from "@/shared/ui/button"
import { cn } from "@/shared/lib/utils"

export function TestSeriesPage() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState({ search: "", category: "all", sort: "newest", difficulty: "all", language: "all" })
  const [detailTest, setDetailTest] = useState<TestSeries | undefined>()
  const [quickFilter, setQuickFilter] = useState<"all" | "mock" | "practice" | "completed" | "in_progress">("all")

  const testsQuery = useTestsList({
    skip: 0,
    limit: 12,
    status: "published",
    is_active: true,
    sort_by: filters.sort === "name" ? "name" : "created_at",
    sort_order: filters.sort === "oldest" ? "asc" : "desc",
    language: undefined,
  })

  const mappedTests: TestSeries[] = useMemo(() => {
    const items = testsQuery.data?.items ?? []
    return items.map((t) => ({
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
      type: "mock",
      tags: t.tags,
      language: t.language,
      status: "not_started",
    }))
  }, [testsQuery.data])

  const filtered = useMemo(() => {
    let list = [...mappedTests]
    if (filters.search) {
      const needle = filters.search.toLowerCase()
      list = list.filter((t) => t.name.toLowerCase().includes(needle) || t.subtitle?.toLowerCase().includes(needle))
    }
    if (filters.category !== "all") {
      list = list.filter((t) => t.type === filters.category)
    }
    if (quickFilter === "mock") {
      list = list.filter((t) => t.type === "mock")
    } else if (quickFilter === "practice") {
      list = list.filter((t) => t.type === "practice")
    } else if (quickFilter === "completed") {
      list = list.filter((t) => t.status === "completed")
    } else if (quickFilter === "in_progress") {
      list = list.filter((t) => t.status === "in_progress")
    }
    // quick sorting extras
    if (filters.sort === "attempted") {
      list = list.sort((a, b) => (b.attempts || 0) - (a.attempts || 0))
    } else if (filters.sort === "score") {
      list = list.sort((a, b) => (b.avgScore || 0) - (a.avgScore || 0))
    } else if (filters.sort === "short") {
      list = list.sort((a, b) => (a.timeMinutes || 0) - (b.timeMinutes || 0))
    } else if (filters.sort === "questions") {
      list = list.sort((a, b) => (b.questions || 0) - (a.questions || 0))
    }
    return list
  }, [filters, mappedTests])

  const handleChange = (field: "search" | "category" | "sort" | "difficulty" | "language", value: string) =>
    setFilters((prev) => ({ ...prev, [field]: value }))

  const handleReset = () => {
    setFilters({ search: "", category: "all", sort: "newest", difficulty: "all", language: "all" })
    setQuickFilter("all")
  }

  const startTest = (test: TestSeries) => {
    navigate(APP_ROUTES.testInstructions(test.id))
  }

  return (
    <PageTransition className="space-y-6">
      <div className="mx-auto flex max-w-5xl flex-col gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📚</span>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Test Papers</h1>
              <p className="text-sm text-muted-foreground">Browse individual papers and start or continue where you left off.</p>
            </div>
          </div>
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

        <QuickFilterRow quickFilter={quickFilter} onChange={setQuickFilter} counts={getQuickCounts(mappedTests)} />

        <ActiveChipsBar
          filters={filters}
          quickFilter={quickFilter}
          onChange={handleChange}
          onResetQuick={() => setQuickFilter("all")}
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
              <p className="text-base font-semibold text-foreground">No tests found</p>
              <p className="text-sm text-muted-foreground">Try adjusting filters.</p>
              <Button variant="outline" className="mt-3" onClick={handleReset}>
                Clear Filters
              </Button>
            </div>
          ) : testsQuery.isError ? (
            <div className="col-span-full rounded-lg border border-dashed bg-slate-50 p-8 text-center text-sm text-destructive">
              Could not load tests. Please retry.
              <div className="mt-3 flex justify-center">
                <Button variant="outline" onClick={() => testsQuery.refetch()}>
                  Retry
                </Button>
              </div>
            </div>
          ) : (
            filtered.map((test) => (
              <TestCard key={test.id} test={test} onPrimary={startTest} onDetails={setDetailTest} />
            ))
          )}
        </div>

        <TestDetailModal
          open={Boolean(detailTest)}
          test={detailTest}
          onClose={() => setDetailTest(undefined)}
          onStart={() => {
            if (detailTest) {
              startTest(detailTest)
            }
          }}
        />
      </div>
    </PageTransition>
  )
}

function QuickFilterRow({
  quickFilter,
  onChange,
  counts,
}: {
  quickFilter: "all" | "mock" | "practice" | "completed" | "in_progress"
  onChange: (val: "all" | "mock" | "practice" | "completed" | "in_progress") => void
  counts: Record<string, number>
}) {
  const opts = [
    { key: "all", label: "All" },
    { key: "mock", label: "Mock" },
    { key: "practice", label: "Practice" },
    { key: "in_progress", label: "In progress" },
    { key: "completed", label: "Completed" },
  ] as const
  return (
    <div className="flex flex-wrap gap-2 rounded-xl bg-white/80 px-2 py-2">
      {opts.map((o) => (
        <Button
          key={o.key}
          variant={quickFilter === o.key ? "default" : "outline"}
          size="sm"
          className={cn(
            "rounded-full px-3",
            quickFilter === o.key ? "shadow-sm" : "border-slate-200 text-foreground",
          )}
          onClick={() => onChange(o.key)}
        >
          {o.label} ({counts[o.key] ?? 0})
        </Button>
      ))}
    </div>
  )
}

function getQuickCounts(list: TestSeries[]) {
  return {
    all: list.length,
    mock: list.filter((t) => t.type === "mock").length,
    practice: list.filter((t) => t.type === "practice").length,
    in_progress: list.filter((t) => t.status === "in_progress").length,
    completed: list.filter((t) => t.status === "completed").length,
  }
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

function ActiveChipsBar({
  filters,
  quickFilter,
  onChange,
  onResetQuick,
}: {
  filters: { search: string; category: string; sort: string; difficulty: string; language: string }
  quickFilter: string
  onChange: (field: "search" | "category" | "sort" | "difficulty" | "language", value: string) => void
  onResetQuick: () => void
}) {
  const chips = [
    filters.search ? { key: "search", label: `Search: “${filters.search}”`, onClear: () => onChange("search", "") } : null,
    filters.category !== "all" ? { key: "category", label: `Category: ${filters.category}`, onClear: () => onChange("category", "all") } : null,
    filters.difficulty !== "all"
      ? { key: "difficulty", label: `Difficulty: ${filters.difficulty}`, onClear: () => onChange("difficulty", "all") }
      : null,
    filters.language !== "all"
      ? { key: "language", label: `Language: ${filters.language}`, onClear: () => onChange("language", "all") }
      : null,
    quickFilter !== "all" ? { key: "quick", label: `Quick: ${quickFilter}`, onClear: onResetQuick } : null,
  ].filter(Boolean) as { key: string; label: string; onClear: () => void }[]

  if (chips.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2 rounded-xl bg-white/80 px-2 py-2">
      {chips.map((chip) => (
        <button
          key={chip.key}
          onClick={chip.onClear}
          className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary transition hover:bg-primary/15"
        >
          {chip.label} <span className="text-xs text-primary/80">×</span>
        </button>
      ))}
    </div>
  )
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
