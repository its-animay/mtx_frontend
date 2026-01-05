import { formatDistanceToNow } from "date-fns"
import { motion } from "framer-motion"
import { Laptop, Smartphone, Loader2, Power } from "lucide-react"

import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/button"
import { type Session } from "../api/auth-api"

interface SessionListItemProps {
  session: Session
  onRevoke: (tokenId: string) => void
  isRevoking?: boolean
}

const deviceIcon = (deviceType: Session["device_type"]) => {
  if (deviceType === "android" || deviceType === "ios") return <Smartphone className="h-5 w-5" />
  return <Laptop className="h-5 w-5" />
}

export function SessionListItem({ session, onRevoke, isRevoking }: SessionListItemProps) {
  const relativeLastUsed = formatDistanceToNow(new Date(session.last_used_at), { addSuffix: true })
  const expires = formatDistanceToNow(new Date(session.expires_at), { addSuffix: true })

  return (
    <motion.div
      layout
      className={cn(
        "flex flex-col gap-2 rounded-lg border bg-card p-4 shadow-sm",
        session.is_current && "border-primary/50 ring-1 ring-primary/30",
      )}
    >
      <div className="flex flex-wrap items-center gap-3">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground",
            session.is_current && "bg-primary/10 text-primary",
          )}
        >
          {deviceIcon(session.device_type)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-semibold text-foreground">{session.device_name}</p>
            {session.is_current ? (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                Current
              </span>
            ) : null}
          </div>
          <p className="truncate text-xs text-muted-foreground">{session.user_agent}</p>
        </div>
        <Button
          variant={session.is_current ? "secondary" : "outline"}
          size="sm"
          onClick={() => onRevoke(session.token_id)}
          disabled={isRevoking}
          className="gap-2"
        >
          {isRevoking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Power className="h-4 w-4" />}
          Revoke
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span className="rounded-full bg-muted px-2 py-1">{session.ip_address}</span>
        <span className="rounded-full bg-muted px-2 py-1">Last used {relativeLastUsed}</span>
        <span className="rounded-full bg-muted px-2 py-1">Expires {expires}</span>
      </div>
    </motion.div>
  )
}
