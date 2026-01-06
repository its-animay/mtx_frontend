import { useEffect, useMemo, useState } from "react"

import { PageTransition } from "@/shared/components/PageTransition"
import { PracticeFilterBar } from "../components/PracticeFilterBar"
import { PracticeQuestionCard } from "../components/PracticeQuestionCard"
import { PracticeSummaryPanel } from "../components/PracticeSummaryPanel"
import { useDiscoverQuestions } from "../hooks/useDiscoverQuestions"
import { useSubmitPracticeAttempt } from "../hooks/useSubmitPracticeAttempt"
import { type PracticeAnswer } from "../api/practice"
import { usePracticeSummary } from "../hooks/usePracticeSummary"
import { QuickFilterPills } from "../components/QuickFilterPills"

export function PracticePage() {
  const [filters, setFilters] = useState({
    subject: "all",
    topic: "all",
    difficulty: "all",
    search: "",
    sort: "newest",
  })
  const [searchInput, setSearchInput] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [quickFilter, setQuickFilter] = useState<"all" | "incorrect" | "bookmarked" | "unattempted" | "flagged">("all")
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
    sort_by: filters.sort.includes("difficulty") ? "difficulty" : "created_at",
    sort_order:
      filters.sort === "oldest" || filters.sort === "difficulty_asc"
        ? "asc"
        : "desc",
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

  useEffect(() => {
    setIsSearching(true)
    const t = setTimeout(() => {
      handleChange("search", searchInput)
      setIsSearching(false)
    }, 300)
    return () => clearTimeout(t)
  }, [searchInput])

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

  const handleClearAll = () => {
    setFilters({ subject: "all", topic: "all", difficulty: "all", search: "", sort: "newest" })
    setSearchInput("")
    setQuickFilter("all")
  }

  const labelForSubject = (val: string) =>
    val === "subject_math" ? "Math" : val === "subject_physics" ? "Physics" : val === "subject_chemistry" ? "Chemistry" : "All subjects"
  const labelForTopic = (val: string) =>
    val === "topic_arithmetic" ? "Arithmetic" : val === "topic_mechanics" ? "Mechanics" : val === "topic_organic" ? "Organic" : "All topics"
  const labelForDifficulty = (val: string) =>
    val === "easy" ? "Easy" : val === "medium" ? "Medium" : val === "hard" ? "Hard" : "All difficulty"
  const labelForQuick = (val: typeof quickFilter) =>
    val === "incorrect"
      ? "Incorrect only"
      : val === "bookmarked"
        ? "Bookmarked"
        : val === "unattempted"
          ? "Unattempted"
          : val === "flagged"
            ? "Flagged"
            : ""

  const activeChips = [
    filters.subject !== "all" ? { key: "subject", label: "Subject", value: labelForSubject(filters.subject) } : null,
    filters.topic !== "all" ? { key: "topic", label: "Topic", value: labelForTopic(filters.topic) } : null,
    filters.difficulty !== "all" ? { key: "difficulty", label: "Difficulty", value: labelForDifficulty(filters.difficulty) } : null,
    filters.search ? { key: "search", label: "Search", value: `“${filters.search}”` } : null,
    quickFilter !== "all" ? { key: "quick", label: "Quick", value: labelForQuick(quickFilter) } : null,
  ].filter(Boolean) as { key: string; label: string; value: string }[]

  const hasActive = activeChips.length > 0
  const showingCount = questions.length
  const quickCounts = {
    all: data?.total ?? questions.length,
    incorrect: 8,
    bookmarked: 12,
    unattempted: data?.total ?? 0,
    flagged: 5,
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
        search={searchInput}
        onSearchChange={setSearchInput}
        isSearching={isSearching}
        subject={filters.subject}
        topic={filters.topic}
        difficulty={filters.difficulty}
        sort={filters.sort}
        onChange={handleChange}
        onClear={handleClearAll}
        activeCount={activeChips.length + (quickFilter !== "all" ? 1 : 0)}
        showingCount={showingCount}
      />

      <QuickFilterPills active={quickFilter} counts={quickCounts} onChange={setQuickFilter} />

      {/* Inline chip row under the filter bar */}
      {hasActive ? (
        <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white/90 px-3 py-2 shadow-sm">
          {activeChips.map((chip) => (
            <button
              key={chip.key}
              onClick={() => {
                if (chip.key === "subject") handleChange("subject", "all")
                if (chip.key === "topic") handleChange("topic", "all")
                if (chip.key === "difficulty") handleChange("difficulty", "all")
                if (chip.key === "search") {
                  handleChange("search", "")
                  setSearchInput("")
                }
                if (chip.key === "quick") setQuickFilter("all")
              }}
              className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary transition hover:bg-primary/15"
            >
              {chip.value}
              <span className="text-xs text-primary/80">×</span>
            </button>
          ))}
        </div>
      ) : null}

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
