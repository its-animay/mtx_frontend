import { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"

import { PageTransition } from "@/shared/components/PageTransition"
import { APP_ROUTES } from "@/shared/config/env"
import { Button } from "@/shared/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card"
import { Badge } from "@/shared/ui/badge"
import { Separator } from "@/shared/ui/separator"
import { Checkbox } from "@/shared/ui/checkbox"
import { useTestInstructions } from "../hooks/useTestInstructions"
import { cn } from "@/shared/lib/utils"
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert"
const isDev = () => import.meta.env.MODE !== "production"
import { Breadcrumbs } from "@/shared/ui/breadcrumbs"

type InstructionsData = NonNullable<ReturnType<typeof useTestInstructions>["data"]>
type SecurityRules = InstructionsData["security_and_proctoring"]
type SupportData = InstructionsData["support"]

export function TestInstructionsPage() {
  const { testId, seriesId } = useParams()
  const navigate = useNavigate()
  const [consent, setConsent] = useState(false)

  const instructionsQuery = useTestInstructions(testId)

  useEffect(() => {
    setConsent(false)
  }, [testId])

  const totalQuestions = useMemo(() => {
    const papers = (instructionsQuery.data || MOCK_INSTRUCTIONS)?.structure?.papers || []
    return papers.reduce((sum, p) => sum + (p.question_pool?.total_questions || 0), 0)
  }, [instructionsQuery.data])

  const totalDurationSec = useMemo(() => {
    const papers = (instructionsQuery.data || MOCK_INSTRUCTIONS)?.structure?.papers || []
    return papers.reduce((sum, p) => sum + (p.duration?.total_seconds || 0), 0)
  }, [instructionsQuery.data])

  const totalPapers = instructionsQuery.data?.structure?.papers?.length || MOCK_INSTRUCTIONS.structure?.papers?.length || 0
  const maxAttempts = instructionsQuery.data?.attempt_rules?.max_attempts ?? MOCK_INSTRUCTIONS.attempt_rules?.max_attempts ?? "-"

  const onStart = async () => {
    if (!testId || !consent) return
    navigate(`${APP_ROUTES.testAttempt(testId)}${seriesId ? `?seriesId=${seriesId}` : ""}`)
  }

  const resolvedData = instructionsQuery.data || (isDev() ? MOCK_INSTRUCTIONS : undefined)
  const content = resolvedData?.instructions?.content || {}
  const sections = [
    { label: "General", items: content.general },
    { label: "Time", items: content.time },
    { label: "Navigation", items: content.navigation },
    { label: "Marking", items: content.marking },
    { label: "Conduct", items: content.conduct },
    { label: "Technical", items: content.technical },
    { label: "Submission", items: content.submission },
  ].filter((s) => s.items && s.items.length)

  return (
    <PageTransition className="space-y-4">
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: APP_ROUTES.dashboard },
          { label: "Test Series", href: APP_ROUTES.testSeriesCatalog },
          seriesId ? { label: seriesId, href: APP_ROUTES.testSeriesDetail(seriesId) } : { label: "Series" },
          { label: resolvedData?.test?.name || "Test", isCurrent: true },
        ].filter(Boolean) as any}
      />

      {instructionsQuery.isError ? (
        <Alert variant="destructive">
          <AlertTitle>Unable to load instructions from server</AlertTitle>
          <AlertDescription>
            {isDev()
              ? "You can use fallback instructions in development."
              : "Please retry. Fallback is disabled in production."}
          </AlertDescription>
          <div className="mt-2 flex gap-2">
            <Button variant="outline" onClick={() => instructionsQuery.refetch()}>
              Retry
            </Button>
            {!resolvedData && (
              <Button variant="ghost" onClick={() => navigate(APP_ROUTES.testSeriesCatalog)}>
                Back
              </Button>
            )}
          </div>
        </Alert>
      ) : null}

      {instructionsQuery.isLoading ? (
        <Card className="border bg-white shadow-sm">
          <CardHeader>
            <CardTitle>Loading instructions...</CardTitle>
            <CardDescription>Please wait</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="h-4 w-40 rounded bg-muted animate-pulse" />
            <div className="h-4 w-48 rounded bg-muted animate-pulse" />
            <div className="h-4 w-32 rounded bg-muted animate-pulse" />
          </CardContent>
        </Card>
      ) : (
        <>
          {resolvedData ? (
            <>
              <HeaderCard data={resolvedData} />
              <SummaryStrip totalQuestions={totalQuestions} totalDurationSec={totalDurationSec} totalPapers={totalPapers} maxAttempts={maxAttempts} />
              <PaperList papers={resolvedData?.structure?.papers || []} />
              <InstructionsPanel sections={sections} paperSpecific={content.paper_specific} />
              <SecurityPanel security={resolvedData?.security_and_proctoring} />
              <SupportCard support={resolvedData?.support} />

              <Card className="border bg-white shadow-sm">
                <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <label className="flex items-start gap-2 text-sm text-foreground">
                    <Checkbox checked={consent} onCheckedChange={(v) => setConsent(Boolean(v))} />
                    <span>
                      {resolvedData.instructions?.display?.acknowledgement_text ||
                        "I have read and understood the instructions and agree to follow the rules."}
                    </span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={() =>
                    navigate(seriesId ? APP_ROUTES.testSeriesDetail(seriesId) : APP_ROUTES.testSeriesCatalog)
                  }
                >
                  Back
                </Button>
                <Button onClick={onStart} disabled={!consent}>
                  Start Test
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
          ) : null}
        </>
      )}
    </PageTransition>
  )
}

function HeaderCard({ data }: { data?: ReturnType<typeof useTestInstructions>["data"] | typeof MOCK_INSTRUCTIONS }) {
  return (
    <Card className="border bg-white shadow-sm">
      <CardHeader className="space-y-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="space-y-1">
            <CardTitle className="text-xl text-foreground">{data?.test?.name || "Test"}</CardTitle>
            <CardDescription>{data?.test?.description}</CardDescription>
            <p className="text-sm text-muted-foreground">
              {data?.test?.exam_family ? `${data.test.exam_family}` : ""}{" "}
              {data?.test?.exam_stage ? `• ${data.test.exam_stage}` : ""}
            </p>
          </div>
          {data?.test?.attempt_type ? <Badge variant="outline">{data.test.attempt_type}</Badge> : null}
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          {data?.test?.tags?.map((tag) => (
            <Badge key={tag} variant="muted">
              {tag}
            </Badge>
          ))}
          {data?.test?.language?.primary ? (
            <span className="text-xs text-muted-foreground">
              Language: {data.test.language.primary}
              {data.test.language.available?.length ? ` (+${data.test.language.available.length} more)` : ""}
            </span>
          ) : null}
        </div>
      </CardHeader>
    </Card>
  )
}

function SummaryStrip({
  totalQuestions,
  totalDurationSec,
  totalPapers,
  maxAttempts,
}: {
  totalQuestions: number
  totalDurationSec: number
  totalPapers: number
  maxAttempts: number | string
}) {
  const mins = Math.ceil(totalDurationSec / 60)
  return (
    <Card className="border bg-white shadow-sm">
      <CardContent className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryItem label="Total Questions" value={totalQuestions || "-"} />
        <SummaryItem label="Total Duration" value={mins ? `${mins} mins` : "-"} />
        <SummaryItem label="Papers / Sections" value={totalPapers || "-"} />
        <SummaryItem label="Max Attempts" value={maxAttempts} />
      </CardContent>
    </Card>
  )
}

function SummaryItem({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border bg-muted/40 p-3">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold text-foreground">{value}</p>
    </div>
  )
}

function PaperList({ papers }: { papers: any[] }) {
  if (!papers || papers.length === 0) return null
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">Papers / Sections</h3>
      <div className="grid gap-3 lg:grid-cols-2">
        {papers.map((p: any) => (
          <Card key={p.paper_id} className="border bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">{p.title}</CardTitle>
              {p.description ? <CardDescription>{p.description}</CardDescription> : null}
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <div className="flex flex-wrap gap-3">
                <Pill label="Questions" value={p.question_pool?.total_questions ?? "-"} />
                <Pill
                  label="Duration"
                  value={
                    p.duration?.total_seconds ? `${Math.ceil((p.duration.total_seconds || 0) / 60)} mins` : "-"
                  }
                />
              </div>
              <div className="space-y-1">
                <p className="text-[12px] uppercase tracking-wide text-muted-foreground">Navigation</p>
                <NavFlag label="Jump" value={p.navigation?.allow_jump} />
                <NavFlag label="Back" value={p.navigation?.allow_back} />
                <NavFlag label="Answer change" value={p.navigation?.allow_answer_change} />
                <NavFlag label="Mark for review" value={p.navigation?.allow_mark_for_review} />
              </div>
              {p.marking?.default_scheme ? (
                <div className="space-y-1">
                  <p className="text-[12px] uppercase tracking-wide text-muted-foreground">Marking (default)</p>
                  <p className="text-sm text-foreground">
                    Correct: {p.marking.default_scheme.correct ?? "-"} • Incorrect:{" "}
                    {p.marking.default_scheme.incorrect ?? "-"} • Unattempted: {p.marking.default_scheme.unattempted ?? "-"}
                  </p>
                </div>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function Pill({ label, value }: { label: string; value: string | number }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-muted bg-muted/60 px-3 py-1 text-xs text-foreground">
      <span className="font-semibold text-foreground">{value}</span>
      <span className="text-muted-foreground">{label}</span>
    </span>
  )
}

function NavFlag({ label, value }: { label: string; value?: boolean }) {
  const color = value ? "text-emerald-600" : "text-muted-foreground"
  return (
    <div className="text-xs">
      <span className={cn("font-semibold", color)}>{value ? "Allowed" : "Not allowed"}</span>
      <span className="text-muted-foreground"> — {label}</span>
    </div>
  )
}

function InstructionsPanel({
  sections,
  paperSpecific,
}: {
  sections: { label: string; items?: string[] }[]
  paperSpecific?: Record<string, string[]>
}) {
  if ((!sections || sections.length === 0) && (!paperSpecific || Object.keys(paperSpecific).length === 0)) return null
  return (
    <Card className="border bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">Instructions</CardTitle>
        <CardDescription>Read carefully before starting the test.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-foreground">
        {sections.map((section) => (
          <div key={section.label} className="space-y-2">
            <p className="text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">{section.label}</p>
            <ul className="list-disc space-y-1 pl-5">
              {section.items?.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
            <Separator className="mt-2" />
          </div>
        ))}
        {paperSpecific && Object.keys(paperSpecific).length
          ? Object.entries(paperSpecific).map(([paperId, items]) => (
              <div key={paperId} className="space-y-2">
                <p className="text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Paper {paperId} Instructions
                </p>
                <ul className="list-disc space-y-1 pl-5">
                  {items?.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
                <Separator className="mt-2" />
              </div>
            ))
          : null}
      </CardContent>
    </Card>
  )
}

function SecurityPanel({
  security,
}: {
  security?: SecurityRules | typeof MOCK_INSTRUCTIONS.security_and_proctoring
}) {
  if (!security) return null
  const hasRules = Object.values(security).some((v) => Boolean(v))
  if (!hasRules) return null
  return (
    <Card className="border bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">Security & Proctoring</CardTitle>
        <CardDescription>Requirements before you start.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2 text-sm text-foreground sm:grid-cols-2">
        <Rule label="Proctoring mode" value={security.proctoring_mode || "none"} />
        <Rule label="Fullscreen required" value={security.fullscreen_required ? "Yes" : "No"} />
        <Rule label="Tab switch limit" value={security.tab_switch_limit ?? "Not enforced"} />
        <Rule label="Copy/Paste" value={security.copy_paste_allowed ? "Allowed" : "Not allowed"} />
        <Rule label="Right click" value={security.right_click_allowed ? "Allowed" : "Not allowed"} />
        <Rule label="Camera" value={security.camera_required ? "Required" : "Not required"} />
        <Rule label="Microphone" value={security.microphone_required ? "Required" : "Not required"} />
        <Rule label="Identity verification" value={security.identity_verification ? "Required" : "Not required"} />
      </CardContent>
    </Card>
  )
}

function Rule({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-[12px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold text-foreground">{value}</p>
    </div>
  )
}

function SupportCard({
  support,
}: {
  support?: SupportData | typeof MOCK_INSTRUCTIONS.support
}) {
  const helpdesk = support?.helpdesk as { email?: string; phone?: string; chat_url?: string } | undefined
  const incident = support?.incident_policy
  if (!helpdesk && !incident) return null
  return (
    <Card className="border bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">Support</CardTitle>
        <CardDescription>Need help? Reach out.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-foreground">
        {helpdesk ? (
          <div className="space-y-1">
            <p className="text-muted-foreground">Helpdesk</p>
            {helpdesk.email ? <p>Email: {helpdesk.email}</p> : null}
            {helpdesk.phone ? <p>Phone: {helpdesk.phone}</p> : null}
            {helpdesk.chat_url ? (
              <p>
                Chat:{" "}
                <a className="text-primary underline" href={helpdesk.chat_url} target="_blank" rel="noreferrer">
                  Open chat
                </a>
              </p>
            ) : null}
          </div>
        ) : null}
        {incident ? (
          <div className="space-y-1">
            <p className="text-muted-foreground">Incident policy</p>
            <p>{incident}</p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

// Fallback mock instructions to render UI when backend is unavailable
const MOCK_INSTRUCTIONS = {
  schema_version: "1.0",
  test: {
    test_id: "test_mock",
    name: "Physics MCQ Practice Set 01",
    description: "50-question physics practice on mechanics and waves",
    exam_family: "JEE",
    exam_stage: "Practice",
    attempt_type: "Mock",
    tags: ["physics", "mock", "jee"],
    language: { primary: "en", available: ["hi"] },
  },
  availability: {
    mode: "always",
    time_zone: "Asia/Kolkata",
  },
  structure: {
    papers: [
      {
        paper_id: "paper1",
        title: "Physics",
        description: "Mechanics and Waves",
        question_pool: { total_questions: 50 },
        duration: { total_seconds: 90 * 60 },
        navigation: {
          allow_jump: true,
          allow_back: true,
          allow_answer_change: true,
          allow_mark_for_review: true,
        },
        marking: {
          default_scheme: { correct: 4, incorrect: -1, unattempted: 0 },
        },
      },
    ],
  },
  attempt_rules: {
    max_attempts: 1,
    auto_submit_on_timeup: true,
    allow_review_before_submit: true,
    allow_section_navigation: true,
    allow_question_jump: true,
    allow_answer_change: true,
  },
  security_and_proctoring: {
    proctoring_mode: "none",
    fullscreen_required: false,
    tab_switch_limit: 3,
    copy_paste_allowed: false,
    right_click_allowed: false,
    camera_required: false,
    microphone_required: false,
    identity_verification: false,
  },
  instructions: {
    display: {
      acknowledgement_text: "I have read and understood the instructions and agree to follow the rules.",
    },
    content: {
      general: ["Read all questions carefully.", "Do not refresh/close the window during the test."],
      time: ["Total duration: 90 minutes.", "Test auto-submits when time is over."],
      navigation: ["Use Next/Prev to move; palette to jump to any question.", "Mark for review is allowed."],
      marking: ["Correct: +4, Incorrect: -1, Unattempted: 0."],
      conduct: ["No unfair means. Your activity may be monitored."],
      technical: ["Ensure stable internet and power backup."],
      submission: ["Click Submit when done. Auto-submit on time up."],
      paper_specific: {
        paper1: ["Physics section only; calculators not allowed."],
      },
    },
  },
  support: {
    helpdesk: { email: "support@example.com", phone: "+91-9000000000" },
    incident_policy: "If you face issues, contact support with your test_id.",
  },
  ui_hints: {},
}
