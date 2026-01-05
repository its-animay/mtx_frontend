import { TrendingDown, TrendingUp } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card"
import { Progress } from "@/shared/ui/progress"

interface SubjectPerformance {
  subject_id: string
  subject_name?: string
  accuracy?: number
  score?: number
  attempts?: number
}

interface SubjectBreakdownProps {
  subjects?: SubjectPerformance[]
}

export function SubjectBreakdown({ subjects = [] }: SubjectBreakdownProps) {
  const ordered = [...subjects].sort((a, b) => (a.accuracy ?? 0) - (b.accuracy ?? 0))

  return (
    <Card className="border bg-white shadow-sm">
      <CardHeader>
        <CardTitle>Subject breakdown</CardTitle>
        <CardDescription>Compare attempts, score, and accuracy</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        {ordered.length === 0 ? (
          <div className="col-span-full rounded-lg border border-dashed bg-slate-50 p-4 text-sm text-muted-foreground">
            No subject performance yet. Complete a test to see insights.
          </div>
        ) : (
          ordered.map((subject) => (
            <div
              key={subject.subject_id}
              className="rounded-lg border bg-white p-4 shadow-[0_1px_0_rgba(0,0,0,0.02)]"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">{subject.subject_name || subject.subject_id}</p>
                  <p className="text-xs text-muted-foreground">
                    Attempts: {subject.attempts ?? 0}
                  </p>
                </div>
                <TrendPill value={subject.accuracy ?? 0} />
              </div>
              <div className="mt-3 space-y-2">
                <Metric label="Avg score" value={`${Math.round(subject.score ?? 0)}%`} percent={subject.score ?? 0} />
                <Metric label="Accuracy" value={`${Math.round(subject.accuracy ?? 0)}%`} percent={subject.accuracy ?? 0} />
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}

function Metric({ label, value, percent }: { label: string; value: string; percent: number }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value}</span>
      </div>
      <Progress value={percent} className="h-2" />
    </div>
  )
}

function TrendPill({ value }: { value: number }) {
  const Icon = value >= 50 ? TrendingUp : TrendingDown
  const tone = value >= 50 ? "text-emerald-600 bg-emerald-50 border-emerald-100" : "text-amber-700 bg-amber-50 border-amber-100"
  return (
    <span className={`flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-medium ${tone}`}>
      <Icon className="h-3 w-3" />
      {Math.round(value)}%
    </span>
  )
}
