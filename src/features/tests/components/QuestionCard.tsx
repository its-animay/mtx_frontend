import { Checkbox } from "@/shared/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card"
import { cn } from "@/shared/lib/utils"

interface QuestionOption {
  id: string
  label: string
  text: string
}

interface QuestionCardProps {
  number: number
  total: number
  text: string
  mediaUrl?: string
  options: QuestionOption[]
  multiple?: boolean
  selected: string[]
  markedForReview?: boolean
  onSelect: (optionId: string) => void
  onToggleMark: () => void
  onClearSelection?: () => void
}

export function QuestionCard({
  number,
  total,
  text,
  mediaUrl,
  options,
  multiple,
  selected,
  markedForReview,
  onSelect,
  onToggleMark,
  onClearSelection,
}: QuestionCardProps) {
  return (
    <Card className="border bg-white shadow-sm">
      <CardHeader className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-base">Question {number}</CardTitle>
          <CardDescription>
            Q {number} of {total}
          </CardDescription>
        </div>
        <button
          onClick={onToggleMark}
          className={cn(
            "rounded-full border px-3 py-1 text-xs font-medium",
            markedForReview ? "border-amber-200 bg-amber-50 text-amber-800" : "border-muted bg-muted/60",
          )}
        >
          {markedForReview ? "Marked for review" : "Mark for review"}
        </button>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-base text-foreground">{text}</p>
        {mediaUrl ? (
          <img src={mediaUrl} alt="" className="max-h-48 w-full rounded-lg border object-contain" />
        ) : null}
        <div className="space-y-2">
          {options.map((option) => {
            const isSelected = selected.includes(option.id)
            return (
              <div
                key={option.id}
                onClick={() => onSelect(option.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    onSelect(option.id)
                  }
                }}
                className={cn(
                  "flex w-full items-start gap-3 rounded-lg border px-3 py-2 text-left transition",
                  isSelected ? "border-primary bg-primary/5" : "border-muted bg-white hover:bg-muted/60",
                )}
              >
                <Checkbox checked={isSelected} onCheckedChange={() => onSelect(option.id)} />
                <div>
                  <p className="text-sm font-semibold text-foreground">{option.label}</p>
                  <p className="text-sm text-muted-foreground">{option.text}</p>
                </div>
              </div>
            )
          })}
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <p>{multiple ? "Multiple answers possible" : "Single answer"}</p>
          {onClearSelection ? (
            <button className="text-xs text-primary underline" onClick={onClearSelection}>
              Clear selection
            </button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
