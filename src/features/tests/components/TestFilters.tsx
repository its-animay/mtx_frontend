import { useEffect, useState } from "react"

import { Input } from "@/shared/ui/input"
import { Select } from "@/shared/ui/select"
import { Button } from "@/shared/ui/button"

interface TestFiltersProps {
  search: string
  category: string
  sort: string
  difficulty: string
  language: string
  activeCount: number
  onChange: (field: "search" | "category" | "sort" | "difficulty" | "language", value: string) => void
  onReset: () => void
}

export function TestFilters({ search, category, sort, difficulty, language, activeCount, onChange, onReset }: TestFiltersProps) {
  const hasActive = activeCount > 0
  const [mobileOpen, setMobileOpen] = useState(false)
  const [draft, setDraft] = useState({ search, category, sort, difficulty, language })

  useEffect(() => {
    if (mobileOpen) setDraft({ search, category, sort, difficulty, language })
  }, [mobileOpen, search, category, sort, difficulty, language])

  const applyDraft = () => {
    onChange("search", draft.search)
    onChange("category", draft.category)
    onChange("sort", draft.sort)
    onChange("difficulty", draft.difficulty)
    onChange("language", draft.language)
    setMobileOpen(false)
  }

  const resetDraft = () => {
    const cleared = { search: "", category: "all", sort: "newest", difficulty: "all", language: "all" }
    setDraft(cleared)
    onReset()
    setMobileOpen(false)
  }

  return (
    <>
      {/* Desktop / tablet */}
      <div className="sticky top-4 z-20 hidden flex-col gap-3 rounded-xl border border-slate-200 bg-white/95 px-3 py-3 shadow-md ring-1 ring-black/5 md:flex">
        <div className="flex min-w-[240px] flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-inner">
          <Input
            placeholder="Search tests"
            value={search}
            onChange={(e) => onChange("search", e.target.value)}
            className="w-full border-0 p-0 shadow-none focus-visible:ring-0"
          />
          {search ? (
            <button
              aria-label="Clear search"
              className="text-sm text-muted-foreground transition hover:text-destructive"
              onClick={() => onChange("search", "")}
            >
              ×
            </button>
          ) : null}
        </div>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-4">
          <Select
            value={category}
            onChange={(e) => onChange("category", e.target.value)}
            className="min-w-[160px] rounded-lg"
          >
            <option value="all">All categories</option>
            <option value="full">Full Test</option>
            <option value="topic">Topic Test</option>
            <option value="mock">Mock</option>
            <option value="practice">Practice</option>
          </Select>
          <Select value={sort} onChange={(e) => onChange("sort", e.target.value)} className="min-w-[160px] rounded-lg">
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="attempted">Most Attempted</option>
            <option value="score">Highest Score</option>
            <option value="short">Shortest duration</option>
            <option value="questions">Most questions</option>
          </Select>
          <Select value={difficulty} onChange={(e) => onChange("difficulty", e.target.value)} className="min-w-[160px] rounded-lg">
            <option value="all">All difficulty</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </Select>
          <Select value={language} onChange={(e) => onChange("language", e.target.value)} className="min-w-[160px] rounded-lg">
            <option value="all">All languages</option>
            <option value="en">English</option>
            <option value="hi">Hindi</option>
            <option value="regional">Regional</option>
          </Select>
        </div>
        {hasActive ? (
          <div className="flex items-center justify-end">
            <Button variant="ghost" size="sm" aria-label="Clear filters" onClick={onReset}>
              Clear filters
            </Button>
          </div>
        ) : null}
      </div>

      {/* Mobile collapsed */}
      <div className="flex flex-col gap-2 md:hidden">
        <div className="flex items-center gap-2">
          <div className="flex flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-inner">
            <Input
              placeholder="Search tests"
              value={search}
              onChange={(e) => onChange("search", e.target.value)}
              className="w-full border-0 p-0 shadow-none focus-visible:ring-0"
            />
          </div>
          <Button variant="outline" size="sm" className="shrink-0" onClick={() => setMobileOpen(true)} aria-label="Open filters">
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
                <label className="text-xs font-semibold uppercase text-muted-foreground">Category</label>
                <Select value={draft.category} onChange={(e) => setDraft((prev) => ({ ...prev, category: e.target.value }))}>
                  <option value="all">All categories</option>
                  <option value="full">Full Test</option>
                  <option value="topic">Topic Test</option>
                  <option value="mock">Mock</option>
                  <option value="practice">Practice</option>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase text-muted-foreground">Sort</label>
                <Select value={draft.sort} onChange={(e) => setDraft((prev) => ({ ...prev, sort: e.target.value }))}>
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="attempted">Most Attempted</option>
                  <option value="score">Highest Score</option>
                  <option value="short">Shortest duration</option>
                  <option value="questions">Most questions</option>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase text-muted-foreground">Difficulty</label>
                <Select
                  value={draft.difficulty}
                  onChange={(e) => setDraft((prev) => ({ ...prev, difficulty: e.target.value }))}
                >
                  <option value="all">All difficulty</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase text-muted-foreground">Language</label>
                <Select
                  value={draft.language}
                  onChange={(e) => setDraft((prev) => ({ ...prev, language: e.target.value }))}
                >
                  <option value="all">All languages</option>
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="regional">Regional</option>
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
