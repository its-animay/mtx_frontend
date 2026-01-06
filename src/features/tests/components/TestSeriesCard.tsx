import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"
import { Badge } from "@/shared/ui/badge"
import { Button } from "@/shared/ui/button"
import { Progress } from "@/shared/ui/progress"
import { cn } from "@/shared/lib/utils"
import type { TestSeriesItem } from "../types.series"

function statusLabel(item: TestSeriesItem) {
  if (item.badges?.is_new) return "New"
  const status = item.user_progress?.status
  if (status === "in_progress") return "In progress"
  if (status === "completed") return "Completed"
  return "Available"
}

function statusTone(item: TestSeriesItem) {
  if (item.badges?.is_new) return "bg-blue-50 text-blue-700 border-blue-100"
  const status = item.user_progress?.status
  if (status === "in_progress") return "bg-amber-50 text-amber-700 border-amber-100"
  if (status === "completed") return "bg-emerald-50 text-emerald-700 border-emerald-100"
  return "bg-slate-100 text-slate-700 border-slate-200"
}

export function TestSeriesCard({ item, onOpen }: { item: TestSeriesItem; onOpen: (item: TestSeriesItem) => void }) {
  const progress = item.user_progress
  const pct =
    progress && progress.total_papers
      ? Math.round(((progress.attempted_papers || 0) / (progress.total_papers || 1)) * 100)
      : 0
  const primaryLabel = progress?.active_attempt_id ? "Resume" : "Open Series"

  return (
    <Card className="group relative flex h-full flex-col overflow-hidden border bg-white shadow-sm transition hover:-translate-y-[3px] hover:shadow-lg">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/70 via-primary to-primary/60" />
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <CardTitle className="text-lg">{item.title}</CardTitle>
            {item.exam ? <p className="text-xs uppercase tracking-wide text-muted-foreground">{item.exam}</p> : null}
          </div>
          <Badge className={cn("border", statusTone(item))}>{statusLabel(item)}</Badge>
        </div>
        {item.tags?.length ? (
          <div className="flex flex-wrap gap-2 text-xs">
            {item.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="muted" className="rounded-full px-2 py-1">
                {tag}
              </Badge>
            ))}
            {item.tags.length > 3 ? (
              <Badge variant="muted" className="rounded-full px-2 py-1">
                +{item.tags.length - 3}
              </Badge>
            ) : null}
          </div>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <Stat label="Papers" value={item.papers_count ?? "-"} />
          <Stat label="Questions" value={item.total_questions ?? "-"} />
          <Stat label="Duration" value={item.total_duration_sec ? `${Math.round(item.total_duration_sec / 60)} mins` : "-"} />
          <Stat label="Best score" value={item.user_progress?.best_score ? `${item.user_progress.best_score}%` : "-"} />
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-semibold text-foreground">{pct}%</span>
          </div>
          <Progress value={pct} />
        </div>
        <div className="flex gap-2">
          <Button className="flex-1" onClick={() => onOpen(item)}>
            {primaryLabel}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-2 py-2">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold text-foreground">{value}</p>
    </div>
  )
}
