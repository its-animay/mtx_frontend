import { cn } from "@/shared/lib/utils"

type Status = "answered" | "unanswered" | "review"

interface TestPaletteProps {
  total: number
  current: number
  statuses: Record<number, Status>
  onJump: (index: number) => void
}

export function TestPalette({ total, current, statuses, onJump }: TestPaletteProps) {
  const items = Array.from({ length: total }, (_, i) => i + 1)
  return (
    <div className="rounded-lg border bg-white p-3 shadow-sm">
      <p className="mb-2 text-sm font-semibold text-foreground">Question navigator</p>
      <div className="grid grid-cols-10 gap-2 sm:grid-cols-8">
        {items.map((n) => {
          const status = statuses[n] || "unanswered"
          return (
            <button
              key={n}
              onClick={() => onJump(n - 1)}
              className={cn(
                "flex h-9 w-full items-center justify-center rounded-md border text-sm font-semibold transition",
                current === n
                  ? "border-primary bg-primary text-primary-foreground shadow"
                  : status === "answered"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : status === "review"
                      ? "border-amber-200 bg-amber-50 text-amber-700"
                      : "border-muted bg-muted/60 text-muted-foreground hover:bg-muted",
              )}
            >
              {n}
            </button>
          )
        })}
      </div>
      <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-muted-foreground">
        <Legend color="bg-primary" label="Current" />
        <Legend color="bg-emerald-400" label="Answered" />
        <Legend color="bg-amber-400" label="Marked" />
        <Legend color="bg-muted-foreground" label="Unanswered" />
      </div>
    </div>
  )
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1">
      <span className={cn("h-2 w-2 rounded-full", color)} />
      {label}
    </span>
  )
}
