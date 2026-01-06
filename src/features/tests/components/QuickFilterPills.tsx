import { cn } from "@/shared/lib/utils"

type QuickKey = "all" | "incorrect" | "bookmarked" | "unattempted" | "flagged"

interface QuickFilterPillsProps {
  active: QuickKey
  counts: Record<QuickKey, number>
  onChange: (key: QuickKey) => void
}

const pills: { key: QuickKey; label: string; icon?: string }[] = [
  { key: "all", label: "All" },
  { key: "incorrect", label: "Incorrect", icon: "❌" },
  { key: "bookmarked", label: "Bookmarked", icon: "📌" },
  { key: "unattempted", label: "Unattempted", icon: "⏭️" },
  { key: "flagged", label: "Flagged", icon: "⭐" },
]

export function QuickFilterPills({ active, counts, onChange }: QuickFilterPillsProps) {
  return (
    <div className="flex w-full items-center gap-2 overflow-x-auto rounded-xl bg-white/95 px-1 py-2 shadow-sm ring-1 ring-black/5">
      {pills.map((pill) => (
        <button
          key={pill.key}
          onClick={() => onChange(pill.key)}
          className={cn(
            "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition shadow-sm",
            active === pill.key
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-white text-foreground hover:shadow-md",
          )}
        >
          <span className="flex items-center gap-2">
            {pill.icon ? <span>{pill.icon}</span> : null}
            <span>
              {pill.label} ({counts[pill.key] ?? 0})
            </span>
          </span>
        </button>
      ))}
    </div>
  )
}
