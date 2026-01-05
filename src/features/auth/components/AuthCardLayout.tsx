import { motion } from "framer-motion"
import type { ReactNode } from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card"
import { Separator } from "@/shared/ui/separator"
import { cn } from "@/shared/lib/utils"

interface AuthCardLayoutProps {
  title: string
  description?: string
  eyebrow?: string
  footer?: ReactNode
  children: ReactNode
  className?: string
}

export function AuthCardLayout({
  title,
  description,
  eyebrow,
  footer,
  children,
  className,
}: AuthCardLayoutProps) {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-50 px-4 py-10">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-10 top-10 h-32 w-32 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-10 right-10 h-24 w-24 rounded-full bg-emerald-200/60 blur-3xl" />
      </div>
      <div className="relative mx-auto flex max-w-3xl flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="w-full"
        >
          <Card className={cn("w-full border-border/60 shadow-lg", className)}>
            <CardHeader className="space-y-2">
              {eyebrow ? (
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{eyebrow}</span>
              ) : null}
              <CardTitle>{title}</CardTitle>
              {description ? <CardDescription className="text-base leading-relaxed">{description}</CardDescription> : null}
            </CardHeader>
            <Separator />
            <CardContent className="pt-6">{children}</CardContent>
            {footer ? <div className="border-t p-6 text-sm text-muted-foreground">{footer}</div> : null}
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
