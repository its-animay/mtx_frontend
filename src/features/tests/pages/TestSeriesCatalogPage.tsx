import { useEffect, useMemo, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"

import { PageTransition } from "@/shared/components/PageTransition"
import { useTestSeriesList } from "../hooks/useTestSeriesList"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Select } from "@/shared/ui/select"
import { Badge } from "@/shared/ui/badge"
import { Progress } from "@/shared/ui/progress"
import { TestSeriesCard } from "../components/TestSeriesCard"
import type { FetchTestSeriesParams, TestSeriesItem } from "../types.series"
import { APP_ROUTES } from "@/shared/config/env"
import { Breadcrumbs } from "@/shared/ui/breadcrumbs"

const tabs = [
  { key: "all", label: "All" },
  { key: "new", label: "New" },
  { key: "in_progress", label: "In Progress" },
  { key: "completed", label: "Completed" },
] as const

export function TestSeriesCatalogPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [openSeries, setOpenSeries] = useState<TestSeriesItem | null>(null)
  const [filters, setFilters] = useState<FetchTestSeriesParams>({
    q: searchParams.get("q") || "",
    exam: searchParams.get("exam") || "",
    difficulty: (searchParams.get("difficulty") as any) || "all",
    language: searchParams.get("language") || "all",
    sort: (searchParams.get("sort") as any) || "newest",
    page: parseInt(searchParams.get("page") || "1", 10),
    page_size: 12,
  })
  const [searchInput, setSearchInput] = useState(filters.q || "")
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]["key"]>(
    ((searchParams.get("tab") as any) || "all") as any,
  )

  const query = useTestSeriesList(filters)
  const series = query.data?.items || []

  const continueSeries = useMemo(() => series.find((s) => s.user_progress?.active_attempt_id), [series])
  const counts = useMemo(() => {
    const all = series.length
    const newer = series.filter((s) => s.badges?.is_new).length
    const inprog = series.filter((s) => s.user_progress?.status === "in_progress").length
    const completed = series.filter((s) => s.user_progress?.status === "completed").length
    return { all, new: newer, inprog, completed }
  }, [series])

  const filteredByTab = useMemo(() => {
    if (activeTab === "new") return series.filter((s) => s.badges?.is_new)
    if (activeTab === "in_progress") return series.filter((s) => s.user_progress?.status === "in_progress")
    if (activeTab === "completed") return series.filter((s) => s.user_progress?.status === "completed")
    return series
  }, [series, activeTab])

  const showing = filteredByTab

  const updateParams = (next: Partial<FetchTestSeriesParams>, nextTab?: string) => {
    const merged = { ...filters, ...next, page: 1 }
    setFilters(merged)
    const sp = new URLSearchParams()
    if (merged.q) sp.set("q", merged.q)
    if (merged.exam) sp.set("exam", merged.exam)
    if (merged.difficulty && merged.difficulty !== "all") sp.set("difficulty", merged.difficulty as string)
    if (merged.language && merged.language !== "all") sp.set("language", merged.language as string)
    if (merged.sort) sp.set("sort", merged.sort)
    sp.set("page", String(merged.page ?? 1))
    sp.set("tab", nextTab || activeTab)
    setSearchParams(sp)
  }

  const handleClear = () => {
    setFilters({ q: "", exam: "", difficulty: "all", language: "all", sort: "newest", page: 1, page_size: 12 })
    setSearchInput("")
    setSearchParams({})
  }

  // debounce search input into filters.q
  useEffect(() => {
    const t = setTimeout(() => {
      updateParams({ q: searchInput })
    }, 250)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput])

  const loadMore = () => {
    const nextPage = (filters.page || 1) + 1
    updateParams({ page: nextPage })
  }

  return (
    <PageTransition className="space-y-4">
      <div className="mx-auto flex max-w-5xl flex-col gap-4">
        <Breadcrumbs items={[{ label: "Dashboard", href: APP_ROUTES.dashboard }, { label: "Test Series", isCurrent: true }]} />
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-foreground">Test Series</h1>
          <p className="text-sm text-muted-foreground">Find your exam series and continue where you left off.</p>
        </div>

        <HeroStats series={series} />

        {continueSeries ? <ContinueCard item={continueSeries} onOpen={(item) => navigate(APP_ROUTES.testSeriesDetail(item.series_id))} /> : null}

        <FilterToolbar
          filters={{ ...filters, q: searchInput }}
          onChange={(next) => {
            if (next.q !== undefined) setSearchInput(next.q || "")
            else updateParams(next)
          }}
          onClear={handleClear}
          activeCount={getActiveCount(filters)}
        />

        <TabRow
          active={activeTab}
          counts={counts}
          onChange={(tab) => {
            setActiveTab(tab)
            updateParams({}, tab)
          }}
        />

        <ActiveChips
          filters={filters}
          activeTab={activeTab}
          onChange={(next) => updateParams(next)}
          onClearTab={() => setActiveTab("all")}
          onClearAll={handleClear}
          showingCount={showing.length}
          searchText={filters.q}
        />

        <SeriesGrid
          loading={query.isLoading}
          error={query.isError}
          series={showing}
          onOpen={(item) => navigate(APP_ROUTES.testSeriesDetail(item.series_id))}
          onPreview={(item) => setOpenSeries(item)}
          onRetry={() => query.refetch()}
          onClear={handleClear}
        />

        {query.data?.has_next ? (
          <div className="flex justify-center">
            <Button variant="outline" onClick={loadMore} disabled={query.isFetching}>
              {query.isFetching ? "Loading..." : "Load more"}
            </Button>
          </div>
        ) : null}
        <SeriesDrawer open={!!openSeries} item={openSeries} onClose={() => setOpenSeries(null)} onOpenDetail={(id) => {
          setOpenSeries(null)
          navigate(APP_ROUTES.testSeriesDetail(id))
        }} />
      </div>
    </PageTransition>
  )
}

function FilterToolbar({
  filters,
  onChange,
  onClear,
  activeCount,
}: {
  filters: FetchTestSeriesParams
  onChange: (next: Partial<FetchTestSeriesParams>) => void
  onClear: () => void
  activeCount: number
}) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [draft, setDraft] = useState(filters)

  useEffect(() => {
    if (mobileOpen) setDraft(filters)
  }, [mobileOpen, filters])

  const applyDraft = () => {
    onChange(draft)
    setMobileOpen(false)
  }

  const resetDraft = () => {
    const cleared: FetchTestSeriesParams = { q: "", exam: "", difficulty: "all", language: "all", sort: "newest", page: 1, page_size: 12 }
    setDraft(cleared)
    onClear()
    setMobileOpen(false)
  }

  return (
    <>
      {/* Desktop / tablet toolbar */}
      <div className="sticky top-4 z-20 hidden flex-col gap-3 rounded-xl border border-slate-200 bg-white/95 px-3 py-3 shadow-md ring-1 ring-black/5 md:flex">
        <div className="flex min-w-[240px] flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-inner">
          <Input
            placeholder="Search series"
            value={filters.q || ""}
            onChange={(e) => onChange({ q: e.target.value })}
            className="w-full border-0 p-0 shadow-none focus-visible:ring-0"
          />
          {filters.q ? (
            <button
              aria-label="Clear search"
              className="text-sm text-muted-foreground transition hover:text-destructive"
              onClick={() => onChange({ q: "" })}
            >
              ×
            </button>
          ) : null}
        </div>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-5">
          <Select value={filters.exam || ""} onChange={(e) => onChange({ exam: e.target.value })} className="min-w-[140px] rounded-lg">
            <option value="">All exams</option>
            <option value="upsc">UPSC</option>
            <option value="jee">JEE</option>
            <option value="neet">NEET</option>
            <option value="cat">CAT</option>
          </Select>
          <Select value={filters.difficulty || "all"} onChange={(e) => onChange({ difficulty: e.target.value as any })} className="min-w-[140px] rounded-lg">
            <option value="all">All difficulty</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
            <option value="mixed">Mixed</option>
          </Select>
          <Select value={filters.language || "all"} onChange={(e) => onChange({ language: e.target.value })} className="min-w-[140px] rounded-lg">
            <option value="all">All languages</option>
            <option value="en">English</option>
            <option value="hi">Hindi</option>
          </Select>
          <Select value={(filters.sort as string) || "newest"} onChange={(e) => onChange({ sort: e.target.value as any })} className="min-w-[140px] rounded-lg">
            <option value="newest">Newest</option>
            <option value="recent_activity">Recent activity</option>
            <option value="most_attempted">Most attempted</option>
            <option value="highest_score">Highest score</option>
            <option value="shortest_duration">Shortest duration</option>
            <option value="most_papers">Most papers</option>
          </Select>
          {activeCount > 0 ? (
            <Button variant="ghost" size="sm" aria-label="Clear filters" onClick={onClear}>
              Clear filters
            </Button>
          ) : null}
        </div>
      </div>

      {/* Mobile collapsed controls */}
      <div className="flex flex-col gap-2 md:hidden">
        <div className="flex items-center gap-2">
          <div className="flex flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-inner">
            <Input
              placeholder="Search series"
              value={filters.q || ""}
              onChange={(e) => onChange({ q: e.target.value })}
              className="w-full border-0 p-0 shadow-none focus-visible:ring-0"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            aria-label="Open filters"
            onClick={() => setMobileOpen(true)}
            className="shrink-0"
          >
            Filters{activeCount ? ` (${activeCount})` : ""}
          </Button>
        </div>
      </div>

      {mobileOpen ? (
        <div
          className="fixed inset-0 z-40 flex flex-col bg-black/50 backdrop-blur-sm md:hidden"
          role="dialog"
          aria-modal="true"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="mt-auto max-h-[80vh] w-full rounded-t-2xl bg-white p-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-muted" />
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-foreground">Filters</h3>
              <Button variant="ghost" size="sm" onClick={() => setMobileOpen(false)}>
                Close
              </Button>
            </div>
            <div className="mt-3 space-y-3 overflow-y-auto pb-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase text-muted-foreground">Exam</label>
                <Select value={draft.exam || ""} onChange={(e) => setDraft((prev) => ({ ...prev, exam: e.target.value }))}>
                  <option value="">All exams</option>
                  <option value="upsc">UPSC</option>
                  <option value="jee">JEE</option>
                  <option value="neet">NEET</option>
                  <option value="cat">CAT</option>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase text-muted-foreground">Difficulty</label>
                <Select
                  value={draft.difficulty || "all"}
                  onChange={(e) => setDraft((prev) => ({ ...prev, difficulty: e.target.value as any }))}
                >
                  <option value="all">All difficulty</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                  <option value="mixed">Mixed</option>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase text-muted-foreground">Language</label>
                <Select
                  value={draft.language || "all"}
                  onChange={(e) => setDraft((prev) => ({ ...prev, language: e.target.value }))}
                >
                  <option value="all">All languages</option>
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase text-muted-foreground">Sort</label>
                <Select
                  value={(draft.sort as string) || "newest"}
                  onChange={(e) => setDraft((prev) => ({ ...prev, sort: e.target.value as any }))}
                >
                  <option value="newest">Newest</option>
                  <option value="recent_activity">Recent activity</option>
                  <option value="most_attempted">Most attempted</option>
                  <option value="highest_score">Highest score</option>
                  <option value="shortest_duration">Shortest duration</option>
                  <option value="most_papers">Most papers</option>
                </Select>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <Button variant="outline" className="flex-1" onClick={resetDraft}>
                Reset
              </Button>
              <Button className="flex-1" onClick={applyDraft}>
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}

function TabRow({
  active,
  onChange,
  counts,
}: {
  active: string
  onChange: (tab: typeof tabs[number]["key"]) => void
  counts: { all: number; new: number; inprog: number; completed: number }
}) {
  return (
    <div className="sticky top-2 z-10 flex flex-wrap gap-2 rounded-xl bg-white/90 px-2 py-2 shadow-sm">
      {tabs.map((tab) => (
        <Button
          key={tab.key}
          variant={active === tab.key ? "default" : "outline"}
          size="sm"
          className="rounded-full px-3"
          onClick={() => onChange(tab.key)}
        >
          {tab.label}{" "}
          <span className="text-[11px] font-normal text-muted-foreground">
            (
            {tab.key === "all"
              ? counts.all
              : tab.key === "new"
                ? counts.new
                : tab.key === "in_progress"
                  ? counts.inprog
                  : counts.completed}
            )
          </span>
        </Button>
      ))}
    </div>
  )
}

function ActiveChips({
  filters,
  activeTab,
  onChange,
  onClearTab,
  onClearAll,
  showingCount,
  searchText,
}: {
  filters: FetchTestSeriesParams
  activeTab: string
  onChange: (next: Partial<FetchTestSeriesParams>) => void
  onClearTab: () => void
  onClearAll: () => void
  showingCount: number
  searchText?: string | null
}) {
  const chips = [
    filters.q ? { key: "q", label: `Search: “${filters.q}”`, onClear: () => onChange({ q: "" }) } : null,
    filters.exam ? { key: "exam", label: `Exam: ${filters.exam}`, onClear: () => onChange({ exam: "" }) } : null,
    filters.difficulty && filters.difficulty !== "all"
      ? { key: "difficulty", label: `Difficulty: ${filters.difficulty}`, onClear: () => onChange({ difficulty: "all" }) }
      : null,
    filters.language && filters.language !== "all"
      ? { key: "language", label: `Language: ${filters.language}`, onClear: () => onChange({ language: "all" }) }
      : null,
    activeTab !== "all" ? { key: "tab", label: `Tab: ${activeTab}`, onClear: onClearTab } : null,
  ].filter(Boolean) as { key: string; label: string; onClear: () => void }[]

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl bg-white/90 px-3 py-2 shadow-sm">
      <span className="text-xs text-muted-foreground">
        Showing {showingCount} {searchText ? `results for “${searchText}”` : "series"}
      </span>
      {chips.map((chip) => (
        <button
          key={chip.key}
          onClick={chip.onClear}
          className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary transition hover:bg-primary/15"
        >
          {chip.label} <span className="text-xs text-primary/80">×</span>
        </button>
      ))}
      {chips.length > 0 ? (
        <button
          onClick={onClearAll}
          className="ml-auto text-xs font-semibold text-primary underline decoration-dotted underline-offset-4"
        >
          Clear all
        </button>
      ) : null}
    </div>
  )
}

function SeriesGrid({
  loading,
  error,
  series,
  onOpen,
  onPreview,
  onRetry,
  onClear,
}: {
  loading: boolean
  error: boolean
  series: TestSeriesItem[]
  onOpen: (item: TestSeriesItem) => void
  onPreview: (item: TestSeriesItem) => void
  onRetry: () => void
  onClear: () => void
}) {
  if (loading) {
    return (
      <div className="grid gap-5 md:grid-cols-2">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    )
  }
  if (error) {
    return (
      <div className="rounded-lg border border-dashed bg-slate-50 p-8 text-center text-sm text-destructive">
        Could not load series. Please retry.
        <div className="mt-3 flex justify-center gap-2">
          <Button variant="outline" onClick={onRetry}>
            Retry
          </Button>
          <Button variant="ghost" onClick={onClear}>
            Clear filters
          </Button>
        </div>
      </div>
    )
  }
  if (!series.length) {
    return (
      <div className="rounded-lg border border-dashed bg-slate-50 p-8 text-center text-sm text-muted-foreground">
        <div className="mb-2 text-3xl">📚</div>
        <p className="text-base font-semibold text-foreground">No series found</p>
        <p className="text-sm text-muted-foreground">Try adjusting filters.</p>
        <Button variant="outline" className="mt-3" onClick={onClear}>
          Clear Filters
        </Button>
      </div>
    )
  }
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {series.map((item) => (
        <TestSeriesCard key={item.series_id} item={item} onOpen={onOpen} onPreview={onPreview} />
      ))}
    </div>
  )
}

function HeroStats({ series }: { series: TestSeriesItem[] }) {
  const total = series.length
  const inProgress = series.filter((s) => s.user_progress?.status === "in_progress").length
  const completed = series.filter((s) => s.user_progress?.status === "completed").length
  const pct = total ? Math.round((completed / total) * 100) : 0
  return (
    <div className="grid gap-3 rounded-xl border bg-white p-4 shadow-sm sm:grid-cols-3">
      <StatBlock label="Series" value={total} />
      <StatBlock label="In progress" value={inProgress} />
      <div className="space-y-1">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Completed</span>
          <span className="font-semibold text-foreground">{pct}%</span>
        </div>
        <Progress value={pct} />
      </div>
    </div>
  )
}

function SeriesDrawer({
  open,
  item,
  onClose,
  onOpenDetail,
}: {
  open: boolean
  item: TestSeriesItem | null
  onClose: () => void
  onOpenDetail: (id: string) => void
}) {
  if (!open || !item) return null
  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="h-full w-full max-w-xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-semibold text-foreground">{item.title}</h3>
            {item.subtitle ? <p className="text-sm text-muted-foreground">{item.subtitle}</p> : null}
            <p className="text-xs text-muted-foreground">
              {item.exam || "—"} {item.stage ? `• ${item.stage}` : null}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => onClose()}>
            Close
          </Button>
        </div>
        <div className="mt-4 space-y-2 text-sm text-foreground">
          {item.tags?.length ? (
            <div className="flex flex-wrap gap-2">
              {item.tags.map((tag) => (
                <Badge key={tag} variant="muted" className="rounded-full px-2 py-1">
                  {tag}
                </Badge>
              ))}
            </div>
          ) : null}
          {item.languages?.length ? (
            <p className="text-xs text-muted-foreground">Languages: {item.languages.join(", ")}</p>
          ) : null}
          <p className="text-sm text-muted-foreground">
            Papers: {item.papers_count ?? "-"} • Questions: {item.total_questions ?? "-"} • Duration:{" "}
            {item.total_duration_sec ? `${Math.round(item.total_duration_sec / 60)} mins` : "-"}
          </p>
        </div>
        <div className="mt-4 flex gap-2">
          <Button onClick={() => onOpenDetail(item.series_id)} className="flex-1">
            Open series
          </Button>
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Back
          </Button>
        </div>
      </div>
    </div>
  )
}

function StatBlock({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border bg-muted/40 p-3">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold text-foreground">{value}</p>
    </div>
  )
}

function ContinueCard({ item, onOpen }: { item: TestSeriesItem; onOpen: (item: TestSeriesItem) => void }) {
  const progress = item.user_progress
  const pct =
    progress && progress.total_papers
      ? Math.round(((progress.attempted_papers || 0) / (progress.total_papers || 1)) * 100)
      : 0
  return (
    <div className="flex flex-col gap-2 rounded-xl border bg-gradient-to-r from-primary/5 via-white to-white p-4 shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Continue where you left off</p>
          <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
          <p className="text-sm text-muted-foreground">Exam: {item.exam || "N/A"}</p>
        </div>
        <Badge variant="muted" className="rounded-full">
          In progress
        </Badge>
      </div>
      <div className="space-y-1">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Progress</span>
          <span className="font-semibold text-foreground">{pct}%</span>
        </div>
        <Progress value={pct} />
      </div>
      <div className="flex gap-2">
        <Button onClick={() => onOpen(item)}>Resume</Button>
      </div>
    </div>
  )
}

function getActiveCount(filters: FetchTestSeriesParams) {
  let count = 0
  if (filters.q) count++
  if (filters.exam) count++
  if (filters.difficulty && filters.difficulty !== "all") count++
  if (filters.language && filters.language !== "all") count++
  if (filters.sort && filters.sort !== "newest") count++
  return count
}

function SkeletonCard() {
  return (
    <div className="h-[240px] rounded-xl border bg-white shadow-sm">
      <div className="h-full animate-pulse space-y-3 p-4">
        <div className="h-4 w-2/3 rounded bg-muted" />
        <div className="h-3 w-1/2 rounded bg-muted" />
        <div className="h-3 w-1/3 rounded bg-muted" />
        <div className="h-12 rounded bg-muted" />
      </div>
    </div>
  )
}
