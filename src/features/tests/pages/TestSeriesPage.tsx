import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"

import { PageTransition } from "@/shared/components/PageTransition"
import { TestFilters } from "../components/TestFilters"
import { TestCard } from "../components/TestCard"
import { TestDetailModal } from "../components/TestDetailModal"
import type { TestSeries } from "../types"
import { useTestsList } from "../hooks/useTests"
import { APP_ROUTES } from "@/shared/config/env"

export function TestSeriesPage() {
  const navigate = useNavigate()
  const [filters, setFilters] = useState({ search: "", category: "all", sort: "newest" })
  const [detailTest, setDetailTest] = useState<TestSeries | undefined>()

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
    return list
  }, [filters, mappedTests])

  const handleChange = (field: "search" | "category" | "sort", value: string) =>
    setFilters((prev) => ({ ...prev, [field]: value }))

  const handleReset = () => setFilters({ search: "", category: "all", sort: "newest" })

  const startTest = (test: TestSeries) => {
    navigate(APP_ROUTES.testInstructions(test.id))
  }

  return (
    <PageTransition className="space-y-4">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Test Series</h1>
        <p className="text-sm text-muted-foreground">Browse tests and start or continue where you left off.</p>
      </div>

      <TestFilters search={filters.search} category={filters.category} sort={filters.sort} onChange={handleChange} onReset={handleReset} />

      <div className="grid gap-3 lg:grid-cols-3 md:grid-cols-2">
        {testsQuery.isLoading ? (
          <div className="col-span-full rounded-lg border bg-muted/40 p-6 text-center text-sm text-muted-foreground">
            Loading tests...
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full rounded-lg border border-dashed bg-slate-50 p-6 text-center text-sm text-muted-foreground">
            No tests found. Broaden filters.
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
    </PageTransition>
  )
}
