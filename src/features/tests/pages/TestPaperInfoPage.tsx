import { useMemo } from "react"
import { useNavigate, useParams } from "react-router-dom"

import { PageTransition } from "@/shared/components/PageTransition"
import { useTestPreview } from "../hooks/useTests"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"
import { Badge } from "@/shared/ui/badge"
import { Button } from "@/shared/ui/button"
import { Separator } from "@/shared/ui/separator"
import { APP_ROUTES } from "@/shared/config/env"
import { Breadcrumbs } from "@/shared/ui/breadcrumbs"

export function TestPaperInfoPage() {
  const { seriesId, testId } = useParams()
  const navigate = useNavigate()
  const preview = useTestPreview(testId)

  const totalQuestions = preview.data?.questions?.length ?? 0
  const sections = useMemo(() => {
    // If preview doesn't provide sections, fallback to a single group summary
    return [
      {
        title: "Questions",
        description: "This paper contains all questions fetched from preview.",
        count: totalQuestions,
      },
    ]
  }, [totalQuestions])

  const summaryItems = [
    { label: "Questions", value: totalQuestions || "-" },
    { label: "Time", value: "-" },
    { label: "Marks", value: "-" },
    { label: "Attempts", value: "-" },
  ]

  return (
    <PageTransition className="space-y-4">
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: APP_ROUTES.dashboard },
          { label: "Test Series", href: APP_ROUTES.testSeriesCatalog },
          seriesId ? { label: seriesId, href: APP_ROUTES.testSeriesDetail(seriesId) } : { label: "Series" },
          { label: preview.data?.test?.name || "Paper", isCurrent: true },
        ].filter(Boolean) as any}
      />
      <div className="space-y-1">
        <p className="text-sm uppercase tracking-wide text-muted-foreground">Test Paper</p>
        <h1 className="text-3xl font-bold text-foreground">{preview.data?.test?.name || "Paper"}</h1>
        <p className="text-sm text-muted-foreground">{preview.data ? "Preview loaded" : "Loading preview…"}</p>
        {seriesId ? (
          <Badge variant="muted" className="mt-2 rounded-full">
            Series: {seriesId}
          </Badge>
        ) : null}
      </div>

      <Card className="border bg-white shadow-sm">
        <CardContent className="grid gap-3 p-4 sm:grid-cols-4">
          {summaryItems.map((item) => (
            <div key={item.label} className="rounded-lg border bg-muted/40 p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{item.label}</p>
              <p className="text-lg font-semibold text-foreground">{item.value}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">What you’ll face</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm text-foreground md:grid-cols-2">
          <div className="space-y-1">
            <p className="font-semibold">Timing</p>
            <p className="text-muted-foreground">Total time and per-section limits are shown on the instructions page.</p>
          </div>
          <div className="space-y-1">
            <p className="font-semibold">Marking</p>
            <p className="text-muted-foreground">Marking schemes (if provided) will be listed in instructions.</p>
          </div>
          <div className="space-y-1">
            <p className="font-semibold">Navigation</p>
            <p className="text-muted-foreground">Navigation, review, and submit rules are covered in instructions.</p>
          </div>
          <div className="space-y-1">
            <p className="font-semibold">Content</p>
            <p className="text-muted-foreground">This paper contains {totalQuestions || "the"} questions fetched from preview.</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Sections / Pattern</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-foreground">
          {sections.map((sec, idx) => (
            <div key={idx} className="rounded-lg border bg-muted/40 p-3">
              <p className="font-semibold text-foreground">{sec.title}</p>
              <p className="text-muted-foreground">{sec.description}</p>
              <Separator className="my-2" />
              <p className="text-xs text-muted-foreground">Questions: {sec.count}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Button variant="ghost" onClick={() => seriesId && navigate(APP_ROUTES.testSeriesDetail(seriesId))}>
          Back to Series
        </Button>
        <Button
          onClick={() => seriesId && testId && navigate(APP_ROUTES.testPaperInstructions(seriesId, testId))}
          disabled={preview.isLoading}
        >
          Proceed to Instructions
        </Button>
      </div>
    </PageTransition>
  )
}
