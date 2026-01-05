import { ShieldOff } from "lucide-react"
import { Link } from "react-router-dom"

import { APP_ROUTES } from "@/shared/config/env"
import { PageTransition } from "@/shared/components/PageTransition"
import { Button } from "@/shared/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card"
import { useProfileStore } from "../store/profile-store"

export function DeletedProfilePage() {
  const markDeleted = useProfileStore((state) => state.markDeleted)

  return (
    <PageTransition>
      <div className="mx-auto max-w-2xl">
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <ShieldOff className="h-5 w-5" /> Profile deleted
            </CardTitle>
            <CardDescription>
              Your profile has been removed. Contact support if this was a mistake.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              You need a new account to continue.
            </p>
            <Button asChild variant="outline" onClick={() => markDeleted(true)}>
              <Link to={APP_ROUTES.login}>Back to login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  )
}
