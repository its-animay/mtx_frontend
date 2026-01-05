import { Button } from "@/shared/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card"
import { Checkbox } from "@/shared/ui/checkbox"
import { cn } from "@/shared/lib/utils"

interface PracticeOption {
  id: string
  label: string
  text: string
}

interface PracticeQuestionCardProps {
  number: number
  text: string
  options: PracticeOption[]
  selected: string[]
  showAnswer: boolean
  explanation?: string
  answerValue?: string
  responseText?: string
  onChangeResponse?: (value: string) => void
  onSelect: (id: string) => void
  onToggleAnswer: () => void
  onNext: () => void
  onPrev: () => void
  onSubmitAnswer?: () => void
}

export function PracticeQuestionCard({
  number,
  text,
  options,
  selected,
  showAnswer,
  explanation,
  answerValue,
  responseText,
  onChangeResponse,
  onSelect,
  onToggleAnswer,
  onNext,
  onPrev,
  onSubmitAnswer,
}: PracticeQuestionCardProps) {
  return (
    <Card className="border bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">Question {number}</CardTitle>
        <CardDescription>Practice mode (no timer)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-base text-foreground">{text}</p>
        {options.length > 0 ? (
          <div className="space-y-2">
            {options.map((option) => {
              const isSelected = selected.includes(option.id)
              return (
                <button
                  key={option.id}
                  onClick={() => onSelect(option.id)}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-lg border px-3 py-2 text-left transition",
                    isSelected ? "border-primary bg-primary/5" : "border-muted bg-white hover:bg-muted/60",
                  )}
                >
                  <Checkbox checked={isSelected} onCheckedChange={() => onSelect(option.id)} />
                  <div>
                    <p className="text-sm font-semibold">{option.label}</p>
                    <p className="text-sm text-muted-foreground">{option.text}</p>
                  </div>
                </button>
              )
            })}
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Open response. Type your answer and reveal to check.</p>
            <textarea
              value={responseText || ""}
              onChange={(e) => onChangeResponse?.(e.target.value)}
              placeholder="Type your answer..."
              className="min-h-[120px] w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/60"
            />
          </div>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="default" onClick={onSubmitAnswer}>
            Submit answer
          </Button>
          <Button variant="outline" onClick={onToggleAnswer}>
            {showAnswer ? "Hide answer" : "Show answer / explanation"}
          </Button>
          <div className="ml-auto flex gap-2">
            <Button variant="outline" onClick={onPrev}>
              Previous
            </Button>
            <Button onClick={onNext}>Next</Button>
          </div>
        </div>
        {showAnswer ? (
          <div className="rounded-lg border bg-muted/50 p-3 text-sm text-foreground">
            <p className="font-semibold">Explanation</p>
            {answerValue ? <p className="text-muted-foreground">Answer: {answerValue}</p> : null}
            <p className="text-muted-foreground">{explanation || "Explanation goes here."}</p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
