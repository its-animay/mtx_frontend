import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"

import { PageTransition } from "@/shared/components/PageTransition"
import { TimerHeader } from "../components/TimerHeader"
import { QuestionCard } from "../components/QuestionCard"
import { NavigationFooter } from "../components/NavigationFooter"
import { ConfirmationModal } from "../components/ConfirmationModal"
import { useTestPreview } from "../hooks/useTests"
import { TestPalette } from "../components/TestPalette"
import { APP_ROUTES } from "@/shared/config/env"
import { Breadcrumbs } from "@/shared/ui/breadcrumbs"
import { useCreateAttemptV2, useSaveAttemptResponse, useSubmitAttemptV2 } from "../hooks/useAttemptV2"

export function TestAttemptPage() {
  const { testId } = useParams()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const seriesId = searchParams.get("seriesId")
  const urlAttemptId = searchParams.get("attemptId")
  const [attemptId, setAttemptId] = useState<string | null>(urlAttemptId)
  const [attemptError, setAttemptError] = useState<string | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selected, setSelected] = useState<Record<string, string[]>>({})
  const [marked, setMarked] = useState<Record<string, boolean>>({})
  const [showExit, setShowExit] = useState(false)
  const [showSubmit, setShowSubmit] = useState(false)
  const createRequested = useRef(false)

  const preview = useTestPreview(testId)

  const question = useMemo(() => preview.data?.questions?.[currentIndex], [preview.data, currentIndex])
  const total = preview.data?.questions?.length ?? 0
  const current = currentIndex + 1
  const answeredCount = Object.values(selected).filter((arr) => arr.length > 0).length
  const reviewedCount = Object.values(marked).filter(Boolean).length
  const statuses = useMemo(() => {
    const statusMap: Record<number, "answered" | "unanswered" | "review"> = {}
    preview.data?.questions?.forEach((q, idx) => {
      const key = q.question_id
      if (marked[key]) {
        statusMap[idx + 1] = "review"
      } else if (selected[key]?.length) {
        statusMap[idx + 1] = "answered"
      } else {
        statusMap[idx + 1] = "unanswered"
      }
    })
    return statusMap
  }, [preview.data?.questions, marked, selected])

  const createAttempt = useCreateAttemptV2()
  const submitAttempt = useSubmitAttemptV2(attemptId || undefined)
  const saveResponse = useSaveAttemptResponse(attemptId || undefined, question?.question_id, question?.section_id)

  // Reset create request flag when test changes
  useEffect(() => {
    createRequested.current = false
    setAttemptError(null)
    setAttemptId(urlAttemptId)
  }, [testId, urlAttemptId])

  // Create attempt if not provided
  useEffect(() => {
    if (!testId || attemptId || preview.isLoading || !preview.data?.questions?.length || createRequested.current)
      return
    createRequested.current = true
    const normalizeQuestionType = (qt: string | undefined) => {
      if (!qt) return "single_choice"
      const lower = qt.toLowerCase()
      if (lower.includes("multi")) return "multi_choice"
      if (lower.includes("true") || lower === "tf") return "true_false"
      if (lower.includes("integer") || lower === "numeric") return "integer"
      if (lower.includes("short")) return "short_text"
      return "single_choice"
    }

    const blueprint =
      preview.data.questions?.map((q, idx) => ({
        question_id: q.question_id,
        section_id: (q as any).section_id || "default",
        global_seq: idx + 1,
        section_seq: idx + 1,
        question_type: normalizeQuestionType(q.question_type),
        subject_id: (q as any).subject_id || "subject_general",
        topic_ids: (q as any).topic_ids || [],
        difficulty: (q as any).difficulty ?? 0,
        marks: typeof (q as any).marks === "object" && (q as any).marks !== null ? (q as any).marks : {},
        is_bonus: (q as any).is_bonus || false,
        is_optional: (q as any).is_optional || false,
      })) || []

    createAttempt
      .mutateAsync({
        test_id: testId,
        series_id: seriesId || undefined,
        test_number: 1,
        terms_accepted: true,
        questions: blueprint,
        applied_settings_snapshot: {},
        test_snapshot: {},
        security_context: {},
      })
      .then((res) => {
        setAttemptId(res.attempt_id)
        setSearchParams((sp) => {
          const next = new URLSearchParams(sp)
          next.set("attemptId", res.attempt_id)
          return next
        })
      })
      .catch((err: any) => {
        setAttemptError(err?.response?.data?.detail || "Could not start attempt")
      })
  }, [attemptId, testId, preview.isLoading, preview.data?.questions, createAttempt, seriesId, setSearchParams])

  const handleSaveResponse = async () => {
    if (!attemptId || !question) return
    const choice = selected[question.question_id]?.[0]
    if (!choice) return
    await saveResponse.mutateAsync({
      action_type: "finalize_answer",
      payload: { selected_option_id: choice },
      source: "web",
    })
  }

  const handleSelect = (optionId: string) => {
    if (!question) return
    setSelected((prev) => ({
      ...prev,
      [question.question_id]: prev[question.question_id]?.includes(optionId)
        ? prev[question.question_id].filter((id) => id !== optionId)
        : [optionId],
    }))
  }

  const handleMark = () => {
    if (!question) return
    setMarked((prev) => ({ ...prev, [question.question_id]: !prev[question.question_id] }))
  }

  const handlePrev = () => setCurrentIndex((i) => Math.max(0, i - 1))
  const handleNext = async () => {
    await handleSaveResponse()
    setCurrentIndex((i) => Math.min(Math.max(0, total - 1), i + 1))
  }

  return (
    <PageTransition className="space-y-4">
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: APP_ROUTES.dashboard },
          { label: "Test Series", href: APP_ROUTES.testSeriesCatalog },
          seriesId ? { label: seriesId, href: APP_ROUTES.testSeriesDetail(seriesId) } : null,
          { label: preview.data?.test?.name || `Test ${testId || ""}`, isCurrent: true },
        ].filter(Boolean) as any}
      />
      <TimerHeader
        testName={preview.data?.test?.name || `Test ${testId || ""}`}
        timeRemaining={62 * 60}
        totalTime={90 * 60}
        onExit={() => setShowExit(true)}
      />

      {preview.isLoading ? (
        <div className="rounded-lg border bg-muted/40 p-6 text-sm text-muted-foreground">Loading test...</div>
      ) : preview.isError || attemptError ? (
        <div className="rounded-lg border border-dashed bg-slate-50 p-6 text-center text-sm text-destructive">
          Unable to load test or start attempt.{" "}
          <button
            className="text-primary underline"
            onClick={() => {
              createRequested.current = false
              setAttemptError(null)
              setAttemptId(null)
            }}
          >
            Retry
          </button>
        </div>
      ) : !question ? (
        <div className="rounded-lg border border-dashed bg-slate-50 p-6 text-center text-sm text-muted-foreground">
          No questions found.
        </div>
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
            <QuestionCard
              number={current}
              total={total}
              text={question.text}
              mediaUrl={undefined}
              options={(question.options || []).map((opt, idx) => ({
                id: opt.option_id || `${idx}`,
                label: opt.label || opt.option_id || `Option ${idx + 1}`,
                text: opt.text || "",
              }))}
              multiple={question.question_type === "multi_choice"}
              selected={selected[question.question_id] || []}
              markedForReview={marked[question.question_id]}
              onClearSelection={() =>
                setSelected((prev) => ({
                  ...prev,
                  [question.question_id]: [],
                }))
              }
              onSelect={handleSelect}
              onToggleMark={handleMark}
            />

            <TestPalette total={total} current={current} statuses={statuses} onJump={(idx) => setCurrentIndex(idx)} />
          </div>

          <NavigationFooter
            current={current}
            total={total}
            reviewedCount={reviewedCount}
            onPrev={handlePrev}
            onNext={() => {
              if (current === total) {
                setShowSubmit(true)
              } else {
                handleNext()
              }
            }}
          />
        </>
      )}

      <ConfirmationModal
        open={showExit}
        type="exit"
        answered={answeredCount}
        total={total}
        onCancel={() => setShowExit(false)}
        onConfirm={() => {
          setShowExit(false)
          if (seriesId) {
            navigate(APP_ROUTES.testSeriesDetail(seriesId))
          } else {
            navigate(APP_ROUTES.testSeriesCatalog)
          }
        }}
      />

      <ConfirmationModal
        open={showSubmit}
        type="submit"
        answered={answeredCount}
        total={total}
        onCancel={() => setShowSubmit(false)}
        onConfirm={async () => {
          setShowSubmit(false)
          if (attemptId) {
            await submitAttempt.mutateAsync()
          }
        }}
      />
    </PageTransition>
  )
}
