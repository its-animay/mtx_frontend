interface ProgressBarProps {
  current: number
  total: number
  reviewedCount?: number
}

export function ProgressBar({ current, total, reviewedCount = 0 }: ProgressBarProps) {
  const percent = total ? (current / total) * 100 : 0
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Q {current} / {total}
        </span>
        <span>{reviewedCount} marked for review</span>
      </div>
      <div className="relative h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full bg-primary" style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}
