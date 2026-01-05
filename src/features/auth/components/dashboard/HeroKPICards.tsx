import { Clock3, Flame, LineChart, Target, TestTube2 } from "lucide-react"

import { Card, CardContent } from "@/shared/ui/card"
import { Progress } from "@/shared/ui/progress"
import { cn } from "@/shared/lib/utils"

interface HeroKPICardsProps {
  totalTests: number
  accuracy: number
  averageScore: number
  totalHours: number
  streak: number
}

export function HeroKPICards({ totalTests, accuracy, averageScore, totalHours, streak }: HeroKPICardsProps) {
  const timeLabel = formatHours(totalHours)
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <KpiCard icon={<TestTube2 className="h-4 w-4 text-primary" />} label="Total tests" value={totalTests} />

      <KpiCard icon={<Target className="h-4 w-4 text-primary" />} label="Accuracy" value={`${Math.round(accuracy)}%`}>
        <div className="mt-3">
          <Progress value={accuracy} className="h-2" />
        </div>
      </KpiCard>

      <KpiCard icon={<LineChart className="h-4 w-4 text-primary" />} label="Avg score" value={`${Math.round(averageScore)}%`}>
        <div className="mt-3">
          <Progress value={averageScore} className="h-2 bg-primary/10" />
        </div>
      </KpiCard>

      <KpiCard icon={<Clock3 className="h-4 w-4 text-primary" />} label="Time spent" value={timeLabel} />

      <KpiCard icon={<Flame className="h-4 w-4 text-primary" />} label="Current streak" value={`${streak} days`} />
    </div>
  )
}

function KpiCard({
  icon,
  label,
  value,
  children,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  children?: React.ReactNode
}) {
  return (
    <Card className="border bg-white shadow-sm">
      <CardContent className="space-y-2 p-4">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
          {icon}
          <span>{label}</span>
        </div>
        <div className={cn("text-2xl font-bold text-foreground", typeof value === "number" ? "tabular-nums" : "")}>
          {value}
        </div>
        {children}
      </CardContent>
    </Card>
  )
}

function formatHours(hours: number) {
  if (!hours || hours <= 0) return "—"
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}
