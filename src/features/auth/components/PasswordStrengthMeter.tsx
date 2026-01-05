import { motion } from "framer-motion"
import { CheckCircle2, Circle } from "lucide-react"

import { cn } from "@/shared/lib/utils"
import { getPasswordStrength, passwordPolicy } from "../utils/password"

const getTone = (score: number) => {
  if (score > 80) return { label: "Strong", color: "bg-emerald-500" }
  if (score > 50) return { label: "Medium", color: "bg-amber-500" }
  if (score > 0) return { label: "Weak", color: "bg-destructive" }
  return { label: "Waiting", color: "bg-muted" }
}

interface PasswordStrengthMeterProps {
  password: string
  className?: string
}

export function PasswordStrengthMeter({ password, className }: PasswordStrengthMeterProps) {
  const { score } = getPasswordStrength(password)
  const tone = getTone(score)

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Password strength</span>
        <span className="font-medium text-foreground">{tone.label}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.max(score, password ? 12 : 0)}%` }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className={cn("h-full", tone.color)}
        />
      </div>
      <div className="grid gap-1.5 text-xs text-muted-foreground">
        {passwordPolicy.map((rule) => {
          const passed = rule.test(password)
          return (
            <div key={rule.label} className="flex items-center gap-2">
              {passed ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              ) : (
                <Circle className="h-4 w-4" />
              )}
              <span className={cn(passed ? "text-foreground" : "")}>{rule.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
