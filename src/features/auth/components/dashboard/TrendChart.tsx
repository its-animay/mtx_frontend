import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card"

interface TrendChartProps {
  hasData: boolean
}

export function TrendChart({ hasData }: TrendChartProps) {
  return (
    <Card className="border bg-white shadow-sm">
      <CardHeader className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Performance over time</CardTitle>
          <CardDescription>Score & accuracy trend</CardDescription>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-primary" />
            Accuracy
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            Score
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <div className="relative h-56 overflow-hidden rounded-lg border border-dashed bg-slate-50">
            {/* Placeholder “chart” bars for UI only */}
            <div className="absolute inset-0 flex items-end justify-between px-4 pb-4">
              {[40, 60, 30, 70, 55, 80].map((h, i) => (
                <div key={i} className="flex w-full flex-col items-center gap-2">
                  <div className="h-full w-[10px] bg-transparent" />
                  <div
                    className="w-10 rounded-t-md bg-primary/70"
                    style={{ height: `${h}%`, minHeight: "40px" }}
                    aria-hidden
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex h-56 flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-slate-50 text-sm text-muted-foreground">
            <span>No data yet</span>
            <span className="text-xs">Complete a test to see trends here.</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
