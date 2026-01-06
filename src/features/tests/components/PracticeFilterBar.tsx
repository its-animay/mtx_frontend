import { useEffect, useMemo, useState } from "react"

import { Input } from "@/shared/ui/input"
import { Select } from "@/shared/ui/select"
import { Button } from "@/shared/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/shared/ui/dropdown-menu"

interface PracticeFilterBarProps {
  subject: string
  topic: string
  difficulty: string
  search: string
  sort: string
  isSearching?: boolean
  activeCount: number
  showingCount?: number
  onChange: (field: "subject" | "topic" | "difficulty" | "search" | "sort", value: string) => void
  onSearchChange: (value: string) => void
  onClear: () => void
}

export function PracticeFilterBar({
  subject,
  topic,
  difficulty,
  search,
  sort,
  isSearching,
  activeCount,
  showingCount,
  onChange,
  onSearchChange,
  onClear,
}: PracticeFilterBarProps) {
  const [open, setOpen] = useState(false)
  const [mobileSheet, setMobileSheet] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768)
    handler()
    window.addEventListener("resize", handler)
    return () => window.removeEventListener("resize", handler)
  }, [])

  const filtersApplied = useMemo(
    () => (subject !== "all" ? 1 : 0) + (topic !== "all" ? 1 : 0) + (difficulty !== "all" ? 1 : 0),
    [subject, topic, difficulty],
  )

  const filterButtonLabel = `+ Filters${filtersApplied ? ` (${filtersApplied})` : ""}`

  const filterContent = (
    <div className="space-y-3">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase text-muted-foreground">Subject</p>
        <Select value={subject} onChange={(e) => onChange("subject", e.target.value)} className="w-full">
          <option value="all">All subjects</option>
          <option value="subject_math">Math</option>
          <option value="subject_physics">Physics</option>
          <option value="subject_chemistry">Chemistry</option>
        </Select>
      </div>
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase text-muted-foreground">Topic</p>
        <Select value={topic} onChange={(e) => onChange("topic", e.target.value)} className="w-full">
          <option value="all">All topics</option>
          <option value="topic_arithmetic">Arithmetic</option>
          <option value="topic_mechanics">Mechanics</option>
          <option value="topic_organic">Organic</option>
        </Select>
      </div>
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase text-muted-foreground">Difficulty</p>
        <Select value={difficulty} onChange={(e) => onChange("difficulty", e.target.value)} className="w-full">
          <option value="all">All difficulty</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </Select>
      </div>
      <div className="flex items-center justify-end gap-2 pt-1">
        <Button variant="ghost" onClick={() => {
          onChange("subject", "all")
          onChange("topic", "all")
          onChange("difficulty", "all")
        }}>
          Clear
        </Button>
        <Button onClick={() => {
          setOpen(false)
          setMobileSheet(false)
        }}>
          Apply
        </Button>
      </div>
    </div>
  )

  return (
    <div className="space-y-3">
      <div className="relative flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white/95 px-4 py-3 shadow-md ring-1 ring-black/5">
        <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-lg border border-slate-200 px-3 py-2">
          <span className="text-muted-foreground">{isSearching ? "⏳" : "🔍"}</span>
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search questions..."
            className="border-0 p-0 shadow-none focus-visible:ring-0"
          />
          {search ? (
            <button
              aria-label="Clear search"
              className="text-xs text-muted-foreground transition hover:text-destructive"
              onClick={() => onSearchChange("")}
            >
              ×
            </button>
          ) : null}
        </div>

        {isMobile ? (
          <Button variant="outline" onClick={() => setMobileSheet(true)} className="rounded-lg">
            Filters{filtersApplied ? ` (${filtersApplied})` : ""}
          </Button>
        ) : (
          <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="rounded-lg">
                {filterButtonLabel}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              sideOffset={8}
              align="end"
              className="z-50 w-80 rounded-xl border border-slate-200 bg-white p-4 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <DropdownMenuLabel className="text-sm font-semibold text-foreground">Filters</DropdownMenuLabel>
                <button
                  aria-label="Close filters"
                  className="text-muted-foreground transition hover:text-destructive"
                  onClick={() => setOpen(false)}
                >
                  ×
                </button>
              </div>
              <DropdownMenuSeparator />
              <div className="pt-2">{filterContent}</div>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <Select value={sort} onChange={(e) => onChange("sort", e.target.value)} className="min-w-[160px] rounded-lg">
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="difficulty_asc">Difficulty (Easy to Hard)</option>
          <option value="difficulty_desc">Difficulty (Hard to Easy)</option>
        </Select>

        {activeCount > 0 ? (
          <Button
            variant="ghost"
            onClick={onClear}
            className="rounded-full text-muted-foreground transition hover:text-destructive"
            aria-label="Clear all filters"
          >
            Clear All
          </Button>
        ) : null}
      </div>

      {isMobile && mobileSheet ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full rounded-t-2xl bg-white p-5 shadow-2xl">
            <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-slate-200" />
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Filters</p>
              <button
                aria-label="Close filters"
                className="text-muted-foreground transition hover:text-destructive"
                onClick={() => setMobileSheet(false)}
              >
                ×
              </button>
            </div>
            {filterContent}
          </div>
        </div>
      ) : null}

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Showing {showingCount ?? 0} {showingCount === 1 ? "question" : "questions"}
        </span>
        {filtersApplied ? <span>{filtersApplied} filters applied</span> : <span>No filters applied</span>}
      </div>
    </div>
  )
}
