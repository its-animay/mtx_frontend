import { useNavigate } from "react-router-dom"
import { Settings2 } from "lucide-react"

import { APP_ROUTES } from "@/shared/config/env"
import { PageTransition } from "@/shared/components/PageTransition"
import { Button } from "@/shared/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card"
import { PreferencesForm } from "../components/PreferencesForm"
import { useUpdatePreferencesMutation } from "../hooks/useUpdatePreferences"
import { useProfileStore } from "../store/profile-store"
import { type PreferencesPatchInput } from "../schemas/profile.schemas"

export function PreferencesPage() {
  const profile = useProfileStore((state) => state.profile)
  const navigate = useNavigate()
  const mutation = useUpdatePreferencesMutation()

  const handleSubmit = (values: PreferencesPatchInput) => {
    mutation.mutate({
      language: values.language ?? "en",
      timezone: values.timezone ?? "Asia/Kolkata",
      theme: values.theme,
      notification_preferences: values.notification_preferences as Record<string, boolean> | undefined,
      test_preferences: values.test_preferences as Record<string, boolean> | undefined,
    })
  }

  return (
    <PageTransition className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-primary">Preferences</p>
          <h1 className="text-3xl font-bold text-foreground">Personalization</h1>
          <p className="text-muted-foreground">Control notifications and study experience.</p>
        </div>
        <Settings2 className="h-8 w-8 text-primary" />
      </div>

      <Card className="max-w-4xl border-primary/20">
        <CardHeader>
          <CardTitle>Update preferences</CardTitle>
          <CardDescription>These apply across your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <PreferencesForm
            defaultValues={profile?.preferences}
            onSubmit={handleSubmit}
            isSubmitting={mutation.isPending}
          />
        </CardContent>
      </Card>

      <Button variant="outline" onClick={() => navigate(APP_ROUTES.profile)}>
        Back to profile
      </Button>
    </PageTransition>
  )
}
