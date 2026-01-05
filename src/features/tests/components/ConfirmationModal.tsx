import { Button } from "@/shared/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card"

interface ConfirmationModalProps {
  open: boolean
  type: "exit" | "submit"
  answered: number
  total: number
  onCancel: () => void
  onConfirm: () => void
}

export function ConfirmationModal({ open, type, answered, total, onCancel, onConfirm }: ConfirmationModalProps) {
  if (!open) return null
  const title = type === "exit" ? "Exit test?" : "Submit test?"
  const description =
    type === "exit"
      ? "You can resume later. Make sure your progress is saved."
      : "Once submitted, you cannot change your answers."

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
            Answered: {answered}/{total}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onCancel}>
              Go back
            </Button>
            <Button variant={type === "exit" ? "secondary" : "default"} onClick={onConfirm}>
              {type === "exit" ? "Confirm exit" : "Submit"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
