import { Input } from "@/shared/ui/input"
import { Select } from "@/shared/ui/select"
import { Button } from "@/shared/ui/button"

interface TestFiltersProps {
  search: string
  category: string
  sort: string
  onChange: (field: "search" | "category" | "sort", value: string) => void
  onReset: () => void
}

export function TestFilters({ search, category, sort, onChange, onReset }: TestFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-white/90 p-4 shadow-sm">
      <div className="flex min-w-[220px] flex-1 items-center gap-2">
        <Input
          placeholder="Search tests"
          value={search}
          onChange={(e) => onChange("search", e.target.value)}
          className="w-full"
        />
      </div>
      <Select
        value={category}
        onChange={(e) => onChange("category", e.target.value)}
        className="min-w-[160px] flex-1 sm:flex-none"
      >
        <option value="all">All categories</option>
        <option value="full">Full Test</option>
        <option value="topic">Topic Test</option>
        <option value="mock">Mock</option>
        <option value="practice">Practice</option>
      </Select>
      <Select
        value={sort}
        onChange={(e) => onChange("sort", e.target.value)}
        className="min-w-[160px] flex-1 sm:flex-none"
      >
        <option value="newest">Newest</option>
        <option value="attempted">Most Attempted</option>
        <option value="score">Highest Score</option>
      </Select>
      <Button variant="outline" onClick={onReset}>
        Reset filters
      </Button>
    </div>
  )
}
