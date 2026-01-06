import { Badge } from "@/shared/ui/badge"
import { Button } from "@/shared/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/ui/card"
import type { TestSeries } from "../types"
import { cn } from "@/shared/lib/utils"

interface TestCardProps {
  test: TestSeries
  onPrimary: (test: TestSeries) => void
  onDetails: (test: TestSeries) => void
}

export function TestCard({ test, onPrimary, onDetails }: TestCardProps) {
  const statusLabel =
    test.status === "completed" ? "Review results" : test.status === "in_progress" ? "Continue" : "Start"
  const statusTone =
    test.status === "completed"
      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
      : test.status === "in_progress"
        ? "bg-blue-50 text-blue-700 border-blue-100"
        : "bg-slate-100 text-slate-700 border-slate-200"
  const primaryLabel =
    test.status === "completed" && (test.attempts || 0) > 0 ? "Retake" : test.status === "in_progress" ? "Resume" : "Start"
  const subjects = test.subjects?.slice(0, 3) || []
  const overflowSubjects = test.subjects && test.subjects.length > 3 ? test.subjects.length - 3 : 0

  const metaLine = `${test.questions ?? "-"} Questions • ${test.timeMinutes ?? "-"} mins${
    subjects[0] ? ` • ${subjects[0]}` : ""
  }`
  return (
    <Card className="group relative flex h-full flex-col overflow-hidden border bg-white shadow-sm transition hover:-translate-y-[4px] hover:shadow-lg">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/80 via-primary to-primary/70" />
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <CardTitle className="text-lg">{test.name}</CardTitle>
            {test.subtitle ? <CardDescription>{test.subtitle}</CardDescription> : null}
          </div>
          <TypeBadge type={test.type} />
        </div>
        <p className="text-sm text-muted-foreground">{metaLine}</p>
        {subjects.length ? (
          <div className="flex flex-wrap gap-2 text-xs">
            {subjects.map((tag) => (
              <Badge key={tag} variant="muted" className="rounded-full px-2 py-1">
                {tag}
              </Badge>
            ))}
            {overflowSubjects ? (
              <Badge variant="muted" className="rounded-full px-2 py-1">
                +{overflowSubjects}
              </Badge>
            ) : null}
          </div>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-foreground">
        <div className="grid grid-cols-4 gap-2 text-center text-xs text-muted-foreground">
          <StatPill label="Qs" value={test.questions ?? "-"} />
          <StatPill label="Time" value={test.timeMinutes ? `${test.timeMinutes} mins` : "-"} />
          <StatPill label="Marks" value={test.totalMarks ?? "-"} />
          <StatPill label="Tries" value={test.attempts ?? 0} />
        </div>
        <div className="flex items-center justify-between rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>⭐</span>
            <span>Avg Score: {test.avgScore ?? 0}%</span>
          </div>
          {test.status ? <span className={cn("rounded-full border px-2 py-1 text-[11px]", statusTone)}>{statusLabel}</span> : null}
        </div>
      </CardContent>
      <CardFooter className="mt-auto flex flex-wrap gap-2">
        <Button className="flex-1" onClick={() => onPrimary(test)}>
          {primaryLabel} →
        </Button>
        <Button variant="ghost" className="flex-1" onClick={() => onDetails(test)}>
          View details
        </Button>
      </CardFooter>
    </Card>
  )
}

function TypeBadge({ type }: { type: TestSeries["type"] }) {
  const color =
    type === "full"
      ? "bg-blue-50 text-blue-700 border-blue-100"
      : type === "topic"
        ? "bg-emerald-50 text-emerald-700 border-emerald-100"
        : type === "mock"
          ? "bg-purple-50 text-purple-700 border-purple-100"
          : "bg-amber-50 text-amber-800 border-amber-100"
  const label =
    type === "full" ? "Full Test" : type === "topic" ? "Topic Test" : type === "mock" ? "Mock" : "Practice"
  return <Badge className={cn("border", color)}>{label}</Badge>
}

function StatPill({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-2 py-2 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold text-foreground">{value}</p>
    </div>
  )
}
