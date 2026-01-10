import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"
import { Badge } from "@/shared/ui/badge"
import { Button } from "@/shared/ui/button"
import { Progress } from "@/shared/ui/progress"
import { cn } from "@/shared/lib/utils"
import type { TestSeriesItem } from "../types.series"
import { Clock, FileText, ListChecks, Star } from "lucide-react"

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

function primaryCta(item: TestSeriesItem) {
  const status = item.user_progress?.status
  if (status === "in_progress") return "Resume"
  if (status === "completed") return "View report"
  return "Start Series"
}

export function TestSeriesCard({
  item,
  onOpen,
  onPreview,
}: {
  item: TestSeriesItem
  onOpen: (item: TestSeriesItem) => void
  onPreview?: (item: TestSeriesItem) => void
}) {
  const progress = item.user_progress
  const pct =
    progress && progress.total_papers
      ? Math.round(((progress.attempted_papers || 0) / (progress.total_papers || 1)) * 100)
      : 0
  const primaryLabel = primaryCta(item)
  const status = statusLabel(item)
  const showProgressLabel =
    progress && progress.total_papers ? `${pct || "Not"}${pct ? "%" : " started"} • ${progress.attempted_papers}/${progress.total_papers} papers` : "Not started"
  const questions = item.total_questions ?? "-"
  const durationMins = item.total_duration_sec ? Math.round(item.total_duration_sec / 60) : "-"
  const bestScore = item.user_progress?.best_score ? `${item.user_progress.best_score}%` : "-"
  const paperCount = item.papers_count ?? "-"
  const tags = item.tags || []

  return (
    <Card
      className="group relative flex h-full cursor-pointer flex-col overflow-hidden border bg-white shadow-sm transition hover:-translate-y-[3px] hover:shadow-lg"
      onClick={() => onPreview?.(item)}
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/70 via-primary to-primary/60" />
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <CardTitle className="text-lg">{item.title}</CardTitle>
            <p className="text-xs text-muted-foreground">
              {item.exam ? item.exam : "—"} {item.stage ? ` • ${item.stage}` : null}
            </p>
          </div>
          <Badge className={cn("border", statusTone(item))}>{status}</Badge>
        </div>
        {tags.length ? (
          <div className="flex flex-wrap gap-2 text-xs">
            {tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="muted" className="rounded-full px-2 py-1">
                {tag}
              </Badge>
            ))}
            {tags.length > 3 ? (
              <Badge variant="muted" className="rounded-full px-2 py-1">
                +{tags.length - 3}
              </Badge>
            ) : null}
          </div>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-foreground">
          <Stat icon={<ListChecks className="h-4 w-4 text-primary" />} label="Papers" value={paperCount} />
          <Stat icon={<FileText className="h-4 w-4 text-primary" />} label="Questions" value={questions} />
          <Stat icon={<Clock className="h-4 w-4 text-primary" />} label="Duration" value={durationMins} suffix="mins" />
          <Stat icon={<Star className="h-4 w-4 text-primary" />} label="Best" value={bestScore} />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-semibold text-foreground">{pct ? `${pct}%` : "Not started"}</span>
          </div>
          <Progress value={pct} />
          <p className="text-xs text-muted-foreground">{showProgressLabel}</p>
          {item.user_progress?.status === "in_progress" && item.user_progress.last_activity_at ? (
            <p className="text-xs font-medium text-foreground">
              Last attempted: {new Date(item.user_progress.last_activity_at).toLocaleString()}
            </p>
          ) : null}
        </div>
        <div className="flex gap-2">
          <Button className="flex-1" onClick={(e) => { e.stopPropagation(); onOpen(item) }}>
            {primaryLabel}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function Stat({ label, value, icon, suffix }: { label: string; value: string | number; icon?: React.ReactNode; suffix?: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-2 py-1.5">
      {icon}
      <div>
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold text-foreground">
          {value} {suffix}
        </p>
      </div>
    </div>
  )
}
