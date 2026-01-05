import { Badge } from "@/shared/ui/badge"
import { Button } from "@/shared/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/ui/card"
import type { TestSeries } from "../types"
import { cn } from "@/shared/lib/utils"

interface TestCardProps {
  test: TestSeries
  onPrimary: (test: TestSeries) => void
  onDetails: (test: TestSeries) => void
}

export function TestCard({ test, onPrimary, onDetails }: TestCardProps) {
  const statusLabel =
    test.status === "completed" ? "Review results" : test.status === "in_progress" ? "Continue" : "Start"
  return (
    <Card className="flex h-full flex-col border bg-white shadow-sm transition hover:-translate-y-[2px] hover:shadow-md">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base">{test.name}</CardTitle>
            <CardDescription>{test.subtitle}</CardDescription>
          </div>
          <TypeBadge type={test.type} />
        </div>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-foreground">
        <p className="text-muted-foreground">
          Subjects: <span className="text-foreground">{test.subjects.join(", ")}</span>
        </p>
        <div className="grid grid-cols-2 gap-2 text-muted-foreground">
          <Meta label="Questions" value={test.questions} />
          <Meta label="Time" value={`${test.timeMinutes} mins`} />
          <Meta label="Total Marks" value={test.totalMarks} />
          <Meta label="Attempts" value={test.attempts} />
          <Meta label="Avg Score" value={`${test.avgScore}%`} />
        </div>
      </CardContent>
      <CardFooter className="mt-auto flex flex-wrap gap-2">
        <Button className="flex-1" onClick={() => onPrimary(test)}>
          {statusLabel}
        </Button>
        <Button variant="outline" className="flex-1" onClick={() => onDetails(test)}>
          View details
        </Button>
      </CardFooter>
    </Card>
  )
}

function Meta({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="font-medium text-foreground">{value}</p>
    </div>
  )
}

function TypeBadge({ type }: { type: TestSeries["type"] }) {
  const color =
    type === "full"
      ? "bg-blue-50 text-blue-700 border-blue-100"
      : type === "topic"
        ? "bg-emerald-50 text-emerald-700 border-emerald-100"
        : type === "mock"
          ? "bg-purple-50 text-purple-700 border-purple-100"
          : "bg-amber-50 text-amber-800 border-amber-100"
  const label =
    type === "full" ? "Full Test" : type === "topic" ? "Topic Test" : type === "mock" ? "Mock" : "Practice"
  return <Badge className={cn("border", color)}>{label}</Badge>
}
