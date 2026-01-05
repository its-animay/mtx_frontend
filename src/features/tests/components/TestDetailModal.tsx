import { X } from "lucide-react"

import { Button } from "@/shared/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card"
import { Badge } from "@/shared/ui/badge"
import type { TestSeries } from "../types"
import { cn } from "@/shared/lib/utils"

interface TestDetailModalProps {
  open: boolean
  test?: TestSeries
  onClose: () => void
  onStart?: () => void
}

export function TestDetailModal({ open, test, onClose, onStart }: TestDetailModalProps) {
  if (!open || !test) return null
  const typeBadge =
    test.type === "full"
      ? "bg-blue-50 text-blue-700 border-blue-100"
      : test.type === "topic"
        ? "bg-emerald-50 text-emerald-700 border-emerald-100"
        : test.type === "mock"
          ? "bg-purple-50 text-purple-700 border-purple-100"
          : "bg-amber-50 text-amber-800 border-amber-100"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <Card className="relative w-full max-w-lg">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 text-muted-foreground"
          onClick={onClose}
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </Button>
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle>{test.name}</CardTitle>
              <CardDescription>{test.subtitle}</CardDescription>
            </div>
            <Badge className={cn("border", typeBadge)}>{test.type}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>Subjects: {test.subjects.join(", ")}</p>
          <p>Questions: {test.questions} • Time: {test.timeMinutes} mins • Total Marks: {test.totalMarks}</p>
          <p>Attempts: {test.attempts} • Avg Score: {test.avgScore}%</p>
          <div className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
            <p className="font-semibold text-foreground">Rules (summary)</p>
            <ul className="list-disc space-y-1 pl-4">
              <li>No negative marking placeholder (edit as needed).</li>
              <li>Submit before time to avoid auto-submit.</li>
              <li>Ensure stable internet during the test.</li>
            </ul>
          </div>
          <div className="flex flex-wrap justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button onClick={onStart}>Start test</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
