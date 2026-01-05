import { Input } from "@/shared/ui/input"
import { Select } from "@/shared/ui/select"
import { Button } from "@/shared/ui/button"

interface PracticeFilterBarProps {
  subject: string
  topic: string
  difficulty: string
  search: string
  sort: string
  onChange: (field: "subject" | "topic" | "difficulty" | "search" | "sort", value: string) => void
  onClear: () => void
}

export function PracticeFilterBar({
  subject,
  topic,
  difficulty,
  search,
  sort,
  onChange,
  onClear,
}: PracticeFilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-white/90 p-4 shadow-sm">
      <Select value={subject} onChange={(e) => onChange("subject", e.target.value)} className="min-w-[160px]">
        <option value="all">All subjects</option>
        <option value="subject_math">Math</option>
        <option value="subject_physics">Physics</option>
        <option value="subject_chemistry">Chemistry</option>
      </Select>
      <Select value={topic} onChange={(e) => onChange("topic", e.target.value)} className="min-w-[160px]">
        <option value="all">All topics</option>
        <option value="topic_arithmetic">Arithmetic</option>
        <option value="topic_mechanics">Mechanics</option>
        <option value="topic_organic">Organic</option>
      </Select>
      <Select value={difficulty} onChange={(e) => onChange("difficulty", e.target.value)} className="min-w-[140px]">
        <option value="all">All difficulty</option>
        <option value="easy">Easy</option>
        <option value="medium">Medium</option>
        <option value="hard">Hard</option>
      </Select>
      <Input
        placeholder="Search keywords"
        value={search}
        onChange={(e) => onChange("search", e.target.value)}
        className="flex-1 min-w-[180px]"
      />
      <Select value={sort} onChange={(e) => onChange("sort", e.target.value)} className="min-w-[140px]">
        <option value="newest">Newest</option>
        <option value="attempted">Most Attempted</option>
        <option value="incorrect">Least Correct</option>
      </Select>
      <Button variant="outline" onClick={onClear}>
        Clear filters
      </Button>
    </div>
  )
}
