import { useMemo } from "react"
import { useNavigate } from "react-router-dom"

import { APP_ROUTES } from "@/shared/config/env"
import { PageTransition } from "@/shared/components/PageTransition"
import { Button } from "@/shared/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card"
import { Skeleton } from "@/shared/ui/skeleton"
import { ProfileForm } from "../components/ProfileForm"
import { useProfileQuery } from "../hooks/useProfile"
import { useUpdateProfileMutation } from "../hooks/useUpdateProfile"
import { type ProfileCreateInput } from "../schemas/profile.schemas"
import { useProfileStore } from "../store/profile-store"
import { diffProfilePayload } from "../utils/diff"

export function ProfileEditPage() {
  const navigate = useNavigate()
  const storedProfile = useProfileStore((state) => state.profile)
  const { data, isLoading } = useProfileQuery(!storedProfile)
  const profile = storedProfile || data
  const updateProfile = useUpdateProfileMutation()

  const defaults = useMemo(() => profile, [profile])

  const handleSubmit = (values: ProfileCreateInput) => {
    const diff = diffProfilePayload(values, profile || undefined)
    updateProfile.mutate(diff)
  }

  if (!profile && isLoading) {
    return <Skeleton className="h-24 w-full" />
  }

  if (!profile) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">No profile found.</p>
        <Button onClick={() => navigate(APP_ROUTES.onboardingProfile)}>Create profile</Button>
      </div>
    )
  }

  return (
    <PageTransition>
      <div className="mx-auto max-w-5xl space-y-4">
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle>Edit profile</CardTitle>
            <CardDescription>Update your personal details and goals.</CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm
              defaultValues={defaults}
              onSubmit={handleSubmit}
              submitLabel="Save changes"
              isSubmitting={updateProfile.isPending}
              secondaryAction={() => navigate(APP_ROUTES.profile)}
              secondaryLabel="Cancel"
            />
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  )
}
