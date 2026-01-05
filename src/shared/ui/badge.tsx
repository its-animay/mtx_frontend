import type { HTMLAttributes } from "react"

import { cn } from "@/shared/lib/utils"

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "outline" | "muted"
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        variant === "default" && "bg-primary/10 text-primary border-primary/20",
        variant === "outline" && "bg-white text-foreground border-border",
        variant === "muted" && "bg-muted text-muted-foreground border-transparent",
        className,
      )}
      {...props}
    />
  )
}
