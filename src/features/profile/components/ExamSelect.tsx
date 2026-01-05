import { useMemo, useState } from "react"
import { Search } from "lucide-react"

import { Input } from "@/shared/ui/input"
import { Checkbox } from "@/shared/ui/checkbox"
import { useExams } from "@/features/masters/hooks/useExams"
import { type Exam } from "@/features/masters/api/types"
import { cn } from "@/shared/lib/utils"

interface ExamSelectProps {
  value: string[]
  onChange: (values: string[]) => void
  className?: string
}

export function ExamSelect({ value, onChange, className }: ExamSelectProps) {
  const { data: exams = [], isLoading } = useExams()
  const [search, setSearch] = useState("")

  const filtered = useMemo(() => {
    if (!search) return exams
    const needle = search.toLowerCase()
    return exams.filter((exam) => exam.name.toLowerCase().includes(needle) || exam.code.toLowerCase().includes(needle))
  }, [exams, search])

  const toggleExam = (code: string) => {
    if (value.includes(code)) {
      onChange(value.filter((c) => c !== code))
    } else {
      onChange([...value, code])
    }
  }

  return (
    <div className={cn("space-y-3 rounded-lg border bg-white p-4", className)}>
      <div className="flex items-center gap-2 rounded-md border bg-muted/50 px-3 py-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search exams"
          className="border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
        />
      </div>
      <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading exams...</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground">No exams found.</p>
        ) : (
          filtered.map((exam: Exam) => {
            const selected = value.includes(exam.code)
            return (
              <label
                key={exam.code}
                className={cn(
                  "flex cursor-pointer items-center justify-between rounded-md border px-3 py-2 text-left text-sm transition",
                  selected
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-border bg-white hover:border-primary/30",
                )}
              >
                <div className="space-y-0.5">
                  <p className="font-semibold">{exam.name}</p>
                  <p className="text-xs text-muted-foreground">{exam.code}</p>
                </div>
                <Checkbox checked={selected} onCheckedChange={() => toggleExam(exam.code)} />
              </label>
            )
          })
        )}
      </div>
    </div>
  )
}
