import { Button } from "@/shared/ui/button"
import { Progress } from "@/shared/ui/progress"

interface TimerHeaderProps {
  testName: string
  timeRemaining: number // seconds
  totalTime: number // seconds
  onExit: () => void
}

export function TimerHeader({ testName, timeRemaining, totalTime, onExit }: TimerHeaderProps) {
  const minutes = Math.max(0, Math.floor(timeRemaining / 60))
  const seconds = Math.max(0, timeRemaining % 60)
  const percent = totalTime ? (timeRemaining / totalTime) * 100 : 0

  return (
    <div className="sticky top-[64px] z-10 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-white/95 p-3 shadow-sm">
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Test</p>
        <p className="text-sm font-semibold">{testName}</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex flex-col items-end">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Time remaining</p>
          <p className="text-lg font-semibold tabular-nums">
            {minutes}:{seconds.toString().padStart(2, "0")}
          </p>
          <div className="mt-1 w-32">
            <Progress value={percent} className="h-2" />
          </div>
        </div>
        <Button variant="outline" onClick={onExit}>
          Exit test
        </Button>
      </div>
    </div>
  )
}
