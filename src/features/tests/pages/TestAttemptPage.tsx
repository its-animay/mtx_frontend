import { useMemo, useState } from "react"
import { useParams } from "react-router-dom"

import { PageTransition } from "@/shared/components/PageTransition"
import { TimerHeader } from "../components/TimerHeader"
import { QuestionCard } from "../components/QuestionCard"
import { NavigationFooter } from "../components/NavigationFooter"
import { ConfirmationModal } from "../components/ConfirmationModal"
import type { Question } from "../types"

const MOCK_QUESTIONS: Question[] = [
  {
    id: "q1",
    text: "A particle moves with uniform acceleration. Which graph best represents its velocity-time relationship?",
    options: [
      { id: "a", label: "A", text: "Straight line with positive slope" },
      { id: "b", label: "B", text: "Horizontal line" },
      { id: "c", label: "C", text: "Parabolic curve" },
      { id: "d", label: "D", text: "Exponential curve" },
    ],
  },
  {
    id: "q2",
    text: "Evaluate the integral ∫x e^x dx.",
    options: [
      { id: "a", label: "A", text: "x e^x + C" },
      { id: "b", label: "B", text: "e^x (x - 1) + C" },
      { id: "c", label: "C", text: "e^x (x + 1) + C" },
      { id: "d", label: "D", text: "e^x + C" },
    ],
  },
]

export function TestAttemptPage() {
  const { testId } = useParams()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selected, setSelected] = useState<Record<string, string[]>>({})
  const [marked, setMarked] = useState<Record<string, boolean>>({})
  const [showExit, setShowExit] = useState(false)
  const [showSubmit, setShowSubmit] = useState(false)

  const question = useMemo(() => MOCK_QUESTIONS[currentIndex], [currentIndex])
  const total = MOCK_QUESTIONS.length
  const current = currentIndex + 1
  const answeredCount = Object.values(selected).filter((arr) => arr.length > 0).length
  const reviewedCount = Object.values(marked).filter(Boolean).length

  const handleSelect = (optionId: string) => {
    setSelected((prev) => ({
      ...prev,
      [question.id]: prev[question.id]?.includes(optionId)
        ? prev[question.id].filter((id) => id !== optionId)
        : [optionId],
    }))
  }

  const handleMark = () => setMarked((prev) => ({ ...prev, [question.id]: !prev[question.id] }))

  const handlePrev = () => setCurrentIndex((i) => Math.max(0, i - 1))
  const handleNext = () => setCurrentIndex((i) => Math.min(total - 1, i + 1))

  return (
    <PageTransition className="space-y-4">
      <TimerHeader testName={`Test ${testId || ""}`} timeRemaining={62 * 60} totalTime={90 * 60} onExit={() => setShowExit(true)} />

      <QuestionCard
        number={current}
        total={total}
        text={question.text}
        mediaUrl={question.mediaUrl}
        options={question.options}
        multiple={question.multiple}
        selected={selected[question.id] || []}
        markedForReview={marked[question.id]}
        onSelect={handleSelect}
        onToggleMark={handleMark}
      />

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
