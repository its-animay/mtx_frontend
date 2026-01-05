import { useMemo, useState } from "react"

import { PageTransition } from "@/shared/components/PageTransition"
import { PracticeFilterBar } from "../components/PracticeFilterBar"
import { PracticeQuestionCard } from "../components/PracticeQuestionCard"
import { PracticeSummaryPanel } from "../components/PracticeSummaryPanel"
import { useDiscoverQuestions } from "../hooks/useDiscoverQuestions"
import { useSubmitPracticeAttempt } from "../hooks/useSubmitPracticeAttempt"
import { type PracticeAnswer } from "../api/practice"
import { usePracticeSummary } from "../hooks/usePracticeSummary"

export function PracticePage() {
  const [filters, setFilters] = useState({
    subject: "all",
    topic: "all",
    difficulty: "all",
    search: "",
    sort: "newest",
  })
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<Record<string, string[]>>({})
  const [showAnswer, setShowAnswer] = useState<Record<string, boolean>>({})
  const [responses, setResponses] = useState<Record<string, string>>({})

  const { data, isLoading } = useDiscoverQuestions({
    subject_id: filters.subject !== "all" ? filters.subject : undefined,
    topic_ids: filters.topic !== "all" ? [filters.topic] : undefined,
    difficulty_min: filters.difficulty === "easy" ? 1 : filters.difficulty === "medium" ? 2 : filters.difficulty === "hard" ? 3 : undefined,
    difficulty_max: filters.difficulty === "easy" ? 2 : filters.difficulty === "medium" ? 3 : undefined,
    search: filters.search || undefined,
    sort_by: "created_at",
    sort_order: filters.sort === "newest" ? "desc" : "desc",
    skip: 0,
    limit: 20,
  })

  const questions = useMemo(() => data?.items ?? [], [data])
  const question = questions[index]
  const submitAttempt = useSubmitPracticeAttempt(question?.question_id)
  const summary = usePracticeSummary({
    range: "30d",
    subject_id: filters.subject !== "all" ? filters.subject : undefined,
    topic_id: filters.topic !== "all" ? filters.topic : undefined,
  })

  const handleChange = (field: "subject" | "topic" | "difficulty" | "search" | "sort", value: string) =>
    setFilters((prev) => ({ ...prev, [field]: value }))

  const handleSelect = (id: string) => {
    if (!question) return
    setSelected((prev) => ({
      ...prev,
      [question.question_id]: prev[question.question_id]?.includes(id)
        ? prev[question.question_id].filter((opt) => opt !== id)
        : [id],
    }))
  }

  const handleToggleAnswer = () => {
    if (!question) return
    setShowAnswer((prev) => ({ ...prev, [question.question_id]: !prev[question.question_id] }))
  }

  const handleResponseChange = (value: string) => {
    if (!question) return
    setResponses((prev) => ({ ...prev, [question.question_id]: value }))
  }

  const handleNext = () => setIndex((i) => Math.min(Math.max(0, questions.length - 1), i + 1))
  const handlePrev = () => setIndex((i) => Math.max(0, i - 1))

  const handleSubmit = () => {
    if (!question) return
    const hasOptions = (question.options || []).length > 0
    let answer: PracticeAnswer | null = null

    if (hasOptions) {
      const optionSelections = selected[question.question_id] || []
      if (optionSelections.length === 0) return
      answer = { type: "single", option_id: optionSelections[0] }
    } else {
      const value = responses[question.question_id] || ""
      if (!value.trim()) return
      answer = { type: "value", value }
    }

    submitAttempt.mutate({
      question_id: question.question_id,
      answer,
      time_ms: 0,
      context: { source: "practice" },
    })
  }

  return (
    <PageTransition className="space-y-4">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Practice Questions</h1>
        <p className="text-sm text-muted-foreground">
          Drill questions by subject/topic with flexible controls and explanations.
        </p>
      </div>

      <PracticeFilterBar
        subject={filters.subject}
        topic={filters.topic}
        difficulty={filters.difficulty}
        search={filters.search}
        sort={filters.sort}
        onChange={handleChange}
        onClear={() =>
          setFilters({ subject: "all", topic: "all", difficulty: "all", search: "", sort: "newest" })
        }
      />

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-3">
          {isLoading ? (
            <div className="rounded-lg border bg-muted/40 p-6 text-sm text-muted-foreground">Loading questions...</div>
          ) : !question ? (
            <div className="rounded-lg border border-dashed bg-slate-50 p-6 text-center text-sm text-muted-foreground">
              No questions found. Adjust filters.
            </div>
          ) : (
            <PracticeQuestionCard
              number={index + 1}
              text={question.text}
              options={(question.options || []).map((opt, idx) => ({
                id: opt.value || opt.label || `${idx}`,
                label: opt.label || opt.value || `Option ${idx + 1}`,
                text: opt.text || opt.value || "",
              }))}
              selected={selected[question.question_id] || []}
              showAnswer={Boolean(showAnswer[question.question_id])}
              explanation={question.solution?.explanation}
              answerValue={question.answer_key?.value}
              responseText={responses[question.question_id]}
              onChangeResponse={handleResponseChange}
              onSelect={handleSelect}
              onToggleAnswer={handleToggleAnswer}
              onSubmitAnswer={handleSubmit}
              onNext={handleNext}
              onPrev={handlePrev}
            />
          )}
        </div>
        <div className="space-y-3">
          <PracticeSummaryPanel
            total={summary.data?.attempts ?? 0}
            correctPct={summary.data?.accuracy_pct ?? 0}
            topicsStrength={
              summary.data?.by_topic?.map((t) => ({
                label: t.topic_id,
                value: t.accuracy_pct,
              })) ?? []
            }
          />
        </div>
      </div>
    </PageTransition>
  )
}
