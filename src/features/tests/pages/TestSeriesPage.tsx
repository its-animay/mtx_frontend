import { useMemo, useState } from "react"

import { PageTransition } from "@/shared/components/PageTransition"
import { TestFilters } from "../components/TestFilters"
import { TestCard } from "../components/TestCard"
import { TestDetailModal } from "../components/TestDetailModal"
import type { TestSeries } from "../types"

const MOCK_TESTS: TestSeries[] = [
  {
    id: "1",
    name: "JEE Full Mock 01",
    subtitle: "Full length mock test",
    subjects: ["Physics", "Chemistry", "Math"],
    questions: 75,
    timeMinutes: 180,
    totalMarks: 300,
    attempts: 2,
    avgScore: 68,
    type: "mock",
    status: "not_started",
  },
  {
    id: "2",
    name: "Mechanics Topic Test",
    subtitle: "Focused on Newtonian mechanics",
    subjects: ["Physics"],
    questions: 30,
    timeMinutes: 60,
    totalMarks: 120,
    attempts: 1,
    avgScore: 72,
    type: "topic",
    status: "in_progress",
  },
  {
    id: "3",
    name: "Organic Chemistry Drill",
    subtitle: "Practice reactions & mechanisms",
    subjects: ["Chemistry"],
    questions: 25,
    timeMinutes: 45,
    totalMarks: 100,
    attempts: 3,
    avgScore: 74,
    type: "practice",
    status: "completed",
  },
  {
    id: "4",
    name: "Algebra Full Test",
    subtitle: "Mixed algebra + quadratic equations",
    subjects: ["Math"],
    questions: 40,
    timeMinutes: 90,
    totalMarks: 160,
    attempts: 0,
    avgScore: 0,
    type: "full",
    status: "not_started",
  },
]

export function TestSeriesPage() {
  const [filters, setFilters] = useState({ search: "", category: "all", sort: "newest" })
  const [detailTest, setDetailTest] = useState<TestSeries | undefined>()

  const filtered = useMemo(() => {
    let list = [...MOCK_TESTS]
    if (filters.search) {
      const needle = filters.search.toLowerCase()
      list = list.filter((t) => t.name.toLowerCase().includes(needle) || t.subtitle.toLowerCase().includes(needle))
    }
    if (filters.category !== "all") {
      list = list.filter((t) => t.type === filters.category)
    }
    if (filters.sort === "attempted") {
      list = list.sort((a, b) => b.attempts - a.attempts)
    } else if (filters.sort === "score") {
      list = list.sort((a, b) => b.avgScore - a.avgScore)
    } else {
      list = list.sort((a, b) => Number(b.id) - Number(a.id))
    }
    return list
  }, [filters])

  const handleChange = (field: "search" | "category" | "sort", value: string) =>
    setFilters((prev) => ({ ...prev, [field]: value }))

  const handleReset = () => setFilters({ search: "", category: "all", sort: "newest" })

  const handlePrimary = (test: TestSeries) => {
    // UI-only: could navigate or show toast; here open details as placeholder
    setDetailTest(test)
  }

  return (
    <PageTransition className="space-y-4">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Test Series</h1>
        <p className="text-sm text-muted-foreground">Browse tests and start or continue where you left off.</p>
      </div>

      <TestFilters search={filters.search} category={filters.category} sort={filters.sort} onChange={handleChange} onReset={handleReset} />

      <div className="grid gap-3 lg:grid-cols-3 md:grid-cols-2">
        {filtered.length === 0 ? (
          <div className="col-span-full rounded-lg border border-dashed bg-slate-50 p-6 text-center text-sm text-muted-foreground">
            No tests found. Broaden filters.
          </div>
        ) : (
          filtered.map((test) => (
            <TestCard key={test.id} test={test} onPrimary={handlePrimary} onDetails={setDetailTest} />
          ))
        )}
      </div>

      <TestDetailModal open={Boolean(detailTest)} test={detailTest} onClose={() => setDetailTest(undefined)} onStart={() => setDetailTest(undefined)} />
    </PageTransition>
  )
}
