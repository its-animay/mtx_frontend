import { useMemo, useState } from "react"
import { useParams } from "react-router-dom"

import { PageTransition } from "@/shared/components/PageTransition"
import { TimerHeader } from "../components/TimerHeader"
import { QuestionCard } from "../components/QuestionCard"
import { NavigationFooter } from "../components/NavigationFooter"
import { ConfirmationModal } from "../components/ConfirmationModal"
import { useTestPreview } from "../hooks/useTests"
import { TestPalette } from "../components/TestPalette"

export function TestAttemptPage() {
  const { testId } = useParams()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selected, setSelected] = useState<Record<string, string[]>>({})
  const [marked, setMarked] = useState<Record<string, boolean>>({})
  const [showExit, setShowExit] = useState(false)
  const [showSubmit, setShowSubmit] = useState(false)

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
  const handleNext = () => setCurrentIndex((i) => Math.min(Math.max(0, total - 1), i + 1))

  return (
    <PageTransition className="space-y-4">
      <TimerHeader
        testName={preview.data?.test?.name || `Test ${testId || ""}`}
        timeRemaining={62 * 60}
        totalTime={90 * 60}
        onExit={() => setShowExit(true)}
      />

      {preview.isLoading ? (
        <div className="rounded-lg border bg-muted/40 p-6 text-sm text-muted-foreground">Loading test...</div>
      ) : preview.isError ? (
        <div className="rounded-lg border border-dashed bg-slate-50 p-6 text-center text-sm text-destructive">
          Unable to load test. Please check access or try again.
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
        onConfirm={() => setShowExit(false)}
      />

      <ConfirmationModal
        open={showSubmit}
        type="submit"
        answered={answeredCount}
        total={total}
        onCancel={() => setShowSubmit(false)}
        onConfirm={() => setShowSubmit(false)}
      />
    </PageTransition>
  )
}
