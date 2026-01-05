import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

import { APP_ROUTES } from "@/shared/config/env"
import { PageTransition } from "@/shared/components/PageTransition"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card"
import { useCreateProfileMutation } from "../hooks/useCreateProfile"
import { useProfileStore } from "../store/profile-store"
import { OnboardingStepperForm } from "../components/OnboardingStepperForm"
import { type ProfileCreateInput } from "../schemas/profile.schemas"
import { type Profile } from "../api/types"

export function CreateProfilePage() {
  const navigate = useNavigate()
  const existingProfile = useProfileStore((state) => state.profile)
  const createProfile = useCreateProfileMutation()

  useEffect(() => {
    if (existingProfile) {
      navigate(APP_ROUTES.profile, { replace: true })
    }
  }, [existingProfile, navigate])

  const handleSubmit = (values: ProfileCreateInput) => {
    const payload = {
      ...values,
      preferences: {
        language: values.preferences?.language || "en",
        timezone: values.preferences?.timezone || "Asia/Kolkata",
        theme: values.preferences?.theme,
        notification_preferences: values.preferences?.notification_preferences,
        test_preferences: values.preferences?.test_preferences,
      },
    }
    createProfile.mutate(payload as Profile)
  }

  return (
    <PageTransition>
      <div className="mx-auto max-w-5xl">
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle>Welcome aboard</CardTitle>
            <CardDescription>3 quick steps to personalize your journey. You can refine details later.</CardDescription>
          </CardHeader>
          <CardContent>
            <OnboardingStepperForm onSubmit={handleSubmit} isSubmitting={createProfile.isPending} />
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  )
}
