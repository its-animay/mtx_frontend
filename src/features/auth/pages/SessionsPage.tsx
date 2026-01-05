import { useState } from "react"
import { Shield } from "lucide-react"
import { useNavigate } from "react-router-dom"

import { APP_ROUTES } from "@/shared/config/env"
import { PageTransition } from "@/shared/components/PageTransition"
import { Button } from "@/shared/ui/button"
import { Checkbox } from "@/shared/ui/checkbox"
import { Skeleton } from "@/shared/ui/skeleton"
import { SessionListItem } from "../components/SessionListItem"
import {
  useRevokeAllSessionsMutation,
  useRevokeSessionMutation,
  useSessionsQuery,
} from "../hooks/use-auth"
import { useAuthStore } from "../store/auth-store"

export function SessionsPage() {
  const navigate = useNavigate()
  const { data: sessions, isLoading, isError } = useSessionsQuery()
  const revokeSession = useRevokeSessionMutation()
  const revokeAll = useRevokeAllSessionsMutation()
  const clear = useAuthStore((state) => state.clear)
  const [includeCurrent, setIncludeCurrent] = useState(false)
  const [revokingId, setRevokingId] = useState<string | null>(null)

  const handleRevoke = (tokenId: string) => {
    setRevokingId(tokenId)
    revokeSession.mutate(tokenId, {
      onSettled: () => setRevokingId(null),
    })
  }

  const handleRevokeAll = () => {
    revokeAll.mutate(includeCurrent, {
      onSuccess: () => {
        if (includeCurrent) {
          clear()
          navigate(APP_ROUTES.login)
        }
      },
    })
  }

  return (
    <PageTransition className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-primary">Session control</p>
          <h1 className="text-3xl font-bold text-foreground">Active sessions</h1>
          <p className="text-muted-foreground">Track devices linked to your account and revoke access instantly.</p>
        </div>
        <Shield className="h-10 w-10 text-primary" />
      </div>

      <div className="flex flex-col gap-3 rounded-lg border bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-foreground">Revoke all sessions</p>
            <p className="text-xs text-muted-foreground">Optionally include this device.</p>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <Checkbox
                checked={includeCurrent}
                onCheckedChange={(checked) => setIncludeCurrent(checked === true)}
              />
              Include current session
            </label>
            <Button
              variant="destructive"
              onClick={handleRevokeAll}
              disabled={revokeAll.isPending}
              className="gap-2"
            >
              {revokeAll.isPending ? "Working..." : "Revoke all"}
            </Button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-3">
          {[1, 2, 3].map((key) => (
            <Skeleton key={key} className="h-20 w-full" />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          Unable to fetch sessions. Try again in a moment.
        </div>
      ) : sessions && sessions.length > 0 ? (
        <div className="grid gap-3">
          {sessions.map((session) => (
            <SessionListItem
              key={session.token_id}
              session={session}
              onRevoke={handleRevoke}
              isRevoking={revokingId === session.token_id}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/40 px-6 py-10 text-center text-sm text-muted-foreground">
          <p>No active sessions to display.</p>
          <p className="mt-1">Sign in from another device to see it here.</p>
        </div>
      )}
    </PageTransition>
  )
}
