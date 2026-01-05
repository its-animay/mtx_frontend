import { type ReactNode, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Calendar, GraduationCap, MapPin, PenSquare, Settings, Target } from "lucide-react"

import { APP_ROUTES } from "@/shared/config/env"
import { PageTransition } from "@/shared/components/PageTransition"
import { Button } from "@/shared/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card"
import { Skeleton } from "@/shared/ui/skeleton"
import { Textarea } from "@/shared/ui/textarea"
import { useDeleteProfileMutation } from "../hooks/useDeleteProfile"
import { useProfileQuery } from "../hooks/useProfile"
import { useProfileStore } from "../store/profile-store"

export function ProfileViewPage() {
  const navigate = useNavigate()
  const storedProfile = useProfileStore((state) => state.profile)
  const { data, isLoading } = useProfileQuery(!storedProfile)
  const profile = storedProfile || data
  const deleteProfile = useDeleteProfileMutation()
  const [reason, setReason] = useState("")

  if (isLoading && !profile) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-24 w-full" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">No profile found.</p>
        <Button asChild>
          <Link to={APP_ROUTES.onboardingProfile}>Create profile</Link>
        </Button>
      </div>
    )
  }

  return (
    <PageTransition className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-primary">Profile</p>
          <h1 className="text-3xl font-bold text-foreground">{profile.display_name}</h1>
          <p className="text-muted-foreground">Manage your personal details and goals.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => navigate(APP_ROUTES.profilePreferences)} className="gap-2">
            <Settings className="h-4 w-4" /> Preferences
          </Button>
          <Button onClick={() => navigate(APP_ROUTES.profileEdit)} className="gap-2">
            <PenSquare className="h-4 w-4" /> Edit profile
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Personal</CardTitle>
            <CardDescription>Who you are</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <Field label="Full name" value={profile.full_name} icon={<PenSquare className="h-4 w-4" />} />
            <Field label="Date of birth" value={profile.date_of_birth} icon={<Calendar className="h-4 w-4" />} />
            <Field label="Gender" value={profile.gender ?? "-"} />
            <Field label="Country" value={profile.country} icon={<MapPin className="h-4 w-4" />} />
            <Field label="Pincode" value={profile.pincode} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>Language & timezone</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Field label="Language" value={profile.preferences?.language ?? "en"} />
            <Field label="Timezone" value={profile.preferences?.timezone ?? "Asia/Kolkata"} />
            <Field label="Theme" value={profile.preferences?.theme ?? "system"} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Education</CardTitle>
            <CardDescription>Current stage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Field label="Level" value={profile.education_level.replace(/_/g, " ")} icon={<GraduationCap className="h-4 w-4" />} />
            <Field label="Stream" value={profile.stream?.replace(/_/g, " ") ?? "-"} />
            <Field label="Institution" value={profile.institution || "-"} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Goals</CardTitle>
            <CardDescription>Exam plan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Field
              label="Target exams"
              value={profile.target_exams.join(", ")}
              icon={<Target className="h-4 w-4" />}
            />
            <Field label="Target year" value={profile.target_year} />
          </CardContent>
        </Card>
      </div>

      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle className="text-destructive">Delete profile</CardTitle>
          <CardDescription>Soft-delete your profile across services.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            placeholder="Optional reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <Button
            variant="destructive"
            onClick={() => deleteProfile.mutate(reason || undefined)}
            disabled={deleteProfile.isPending}
          >
            {deleteProfile.isPending ? "Deleting..." : "Delete profile"}
          </Button>
        </CardContent>
      </Card>
    </PageTransition>
  )
}

function Field({ label, value, icon }: { label: string; value: string | number; icon?: ReactNode }) {
  return (
    <div className="flex items-center gap-2 rounded-md border px-3 py-2">
      {icon ? <span className="text-muted-foreground">{icon}</span> : null}
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold text-foreground">{value}</p>
      </div>
    </div>
  )
}
