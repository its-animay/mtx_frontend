import { Button } from "@/shared/ui/button"
import { ProgressBar } from "./ProgressBar"

interface NavigationFooterProps {
  current: number
  total: number
  reviewedCount?: number
  onPrev: () => void
  onNext: () => void
}

export function NavigationFooter({ current, total, reviewedCount, onPrev, onNext }: NavigationFooterProps) {
  return (
    <div className="sticky bottom-0 z-10 flex flex-wrap items-center gap-3 rounded-xl border bg-white/95 p-3 shadow-sm">
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={onPrev} disabled={current <= 1}>
          Prev
        </Button>
        <Button onClick={onNext} disabled={current >= total}>
          Next
        </Button>
      </div>
      <div className="flex-1 min-w-[200px]">
        <ProgressBar current={current} total={total} reviewedCount={reviewedCount} />
      </div>
    </div>
  )
}
