import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card"
import { Progress } from "@/shared/ui/progress"

interface TopicStrength {
  label: string
  value: number
}

interface PracticeSummaryPanelProps {
  total: number
  correctPct: number
  topicsStrength: TopicStrength[]
}

export function PracticeSummaryPanel({ total, correctPct, topicsStrength }: PracticeSummaryPanelProps) {
  return (
    <Card className="border bg-white shadow-sm">
      <CardHeader>
        <CardTitle>Practice summary</CardTitle>
        <CardDescription>Quick view of progress</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg bg-muted/50 p-3 text-sm text-foreground">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Total practiced</p>
          <p className="text-2xl font-semibold">{total}</p>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Correct %</span>
            <span className="font-semibold">{Math.round(correctPct)}%</span>
          </div>
          <Progress value={correctPct} className="h-2" />
        </div>
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Strength by topic</p>
          {topicsStrength.length === 0 ? (
            <p className="text-sm text-muted-foreground">Attempt questions to see topic strength.</p>
          ) : (
            topicsStrength.map((topic) => (
              <div key={topic.label} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>{topic.label}</span>
                  <span className="text-muted-foreground">{topic.value}%</span>
                </div>
                <Progress value={topic.value} className="h-2" />
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
