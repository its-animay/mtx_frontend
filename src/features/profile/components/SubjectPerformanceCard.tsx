import { Progress } from "@/shared/ui/progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"

interface SubjectPerformanceCardProps {
  subject: string
  accuracy?: number
  score?: number
  attempts?: number
}

export function SubjectPerformanceCard({ subject, accuracy = 0, score, attempts }: SubjectPerformanceCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">{subject}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Accuracy</span>
          <span className="font-semibold">{Math.round(accuracy)}%</span>
        </div>
        <Progress value={accuracy} />
        {score !== undefined ? (
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Score</span>
            <span className="font-semibold text-foreground">{score}</span>
          </div>
        ) : null}
        {attempts !== undefined ? (
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Attempts</span>
            <span className="font-semibold text-foreground">{attempts}</span>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
