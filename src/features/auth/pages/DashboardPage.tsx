import { Gauge, KeyRound, Settings, ShieldCheck, Sparkles, UserRound } from "lucide-react"
import { Link } from "react-router-dom"

import { APP_ROUTES } from "@/shared/config/env"
import { PageTransition } from "@/shared/components/PageTransition"
import { Button } from "@/shared/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card"
import { Skeleton } from "@/shared/ui/skeleton"
import { Badge } from "@/shared/ui/badge"
import { EmptyState } from "@/shared/ui/empty/EmptyState"
import { useMeQuery } from "../hooks/use-auth"
import { useProfileStatsQuery } from "@/features/profile/hooks/useProfileStats"
import { useProfileStore } from "@/features/profile/store/profile-store"
import { SubjectPerformanceCard } from "@/features/profile/components/SubjectPerformanceCard"
import { TimeFilterBar } from "../components/dashboard/TimeFilterBar"
import { HeroKPICards } from "../components/dashboard/HeroKPICards"
import { TrendChart } from "../components/dashboard/TrendChart"
import { SubjectBreakdown } from "../components/dashboard/SubjectBreakdown"
import { WeakTopicsPanel } from "../components/dashboard/WeakTopicsPanel"
import { RecentAttemptsTable } from "../components/dashboard/RecentAttemptsTable"
import { DashboardSkeleton } from "../components/dashboard/DashboardSkeleton"

export function DashboardPage() {
  const { data: user } = useMeQuery()
  const profile = useProfileStore((state) => state.profile)
  const { data: stats, isLoading: statsLoading } = useProfileStatsQuery(Boolean(profile))
  const displayName = profile?.display_name || user?.email || "there"
  const targetExams = profile?.target_exams ?? []
  const totalTests = stats?.total_tests ?? 0
  const totalHours = stats?.total_hours ?? 0
  const streak = stats?.streak_days ?? 0
  const subjects = stats?.subject_performance ?? []
  const weakTopics = stats?.weak_topics ?? []
  const averageAccuracy = subjects.length
    ? subjects.reduce((sum, s) => sum + (s.accuracy ?? 0), 0) / subjects.length
    : 0
  const averageScore = subjects.length ? subjects.reduce((sum, s) => sum + (s.score ?? 0), 0) / subjects.length : 0

  return (
    <PageTransition className="space-y-6">
      <TimeFilterBar />

      <div className="rounded-xl border bg-white/90 p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Welcome back</p>
            <h1 className="text-2xl font-bold text-foreground">Hi, {displayName}</h1>
            <p className="text-sm text-muted-foreground">
              Stay on top of your prep and account at a glance.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {targetExams.map((exam) => (
              <Badge key={exam} variant="outline" className="bg-primary/5 text-primary">
                {exam}
              </Badge>
            ))}
            {profile?.target_year ? (
              <Badge variant="outline">Target Year: {profile.target_year}</Badge>
            ) : null}
          </div>
        </div>
      </div>

      {statsLoading ? (
        <DashboardSkeleton />
      ) : (
        <>
          <HeroKPICards
            totalTests={totalTests}
            accuracy={averageAccuracy}
            averageScore={averageScore}
            totalHours={totalHours}
            streak={streak}
          />

          <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
            <TrendChart hasData={Boolean(totalTests)} />
            <QuickActionsCard />
          </div>

          <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
            <AccountSummaryCard
              email={user?.email ?? "-"}
              name={profile?.full_name ?? displayName}
              targetYear={profile?.target_year}
              targetExams={targetExams}
              timezone={profile?.preferences?.timezone ?? "Asia/Kolkata"}
            />
            <WeakTopicsPanel topics={weakTopics} />
          </div>

          <SubjectBreakdown subjects={subjects} />

          <PerformanceCard statsLoading={statsLoading} stats={stats} />

          <RecentAttemptsTable />
        </>
      )}
    </PageTransition>
  )
}

function AccountSummaryCard({
  name,
  email,
  targetExams,
  targetYear,
  timezone,
}: {
  name: string
  email: string
  targetExams: string[]
  targetYear?: number
  timezone?: string
}) {
  return (
    <Card className="h-full border-primary/20">
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle>Account summary</CardTitle>
          <CardDescription>Signed in as {email}</CardDescription>
        </div>
        <Badge variant="outline" className="flex items-center gap-1">
          <ShieldCheck className="h-4 w-4 text-primary" />
          Secure
        </Badge>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        <Info label="Name" value={name} />
        <Info label="Target year" value={targetYear ?? "-"} />
        <Info label="Target exams" value={targetExams.length ? targetExams.join(", ") : "-"} />
        <Info label="Timezone" value={timezone ?? "-"} />
      </CardContent>
    </Card>
  )
}

function QuickActionsCard() {
  return (
    <Card className="h-full border-primary/20">
      <CardHeader>
        <CardTitle>Quick actions</CardTitle>
        <CardDescription>Manage profile and security</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Button
          asChild
          variant="secondary"
          className="flex h-12 min-w-0 justify-start gap-2 overflow-hidden text-sm"
        >
          <Link to={APP_ROUTES.profile}>
            <UserRound className="h-4 w-4" />
            <span className="min-w-0 truncate">Profile</span>
          </Link>
        </Button>
        <Button
          asChild
          variant="secondary"
          className="flex h-12 min-w-0 justify-start gap-2 overflow-hidden text-sm"
        >
          <Link to={APP_ROUTES.profilePreferences}>
            <Settings className="h-4 w-4" />
            <span className="min-w-0 truncate">Preferences</span>
          </Link>
        </Button>
        <Button
          asChild
          variant="secondary"
          className="flex h-12 min-w-0 justify-start gap-2 overflow-hidden text-sm"
        >
          <Link to={APP_ROUTES.sessions}>
            <Gauge className="h-4 w-4" />
            <span className="min-w-0 truncate">Active sessions</span>
          </Link>
        </Button>
        <Button
          asChild
          variant="secondary"
          className="flex h-12 min-w-0 justify-start gap-2 overflow-hidden text-sm"
        >
          <Link to={APP_ROUTES.changePassword}>
            <KeyRound className="h-4 w-4" />
            <span className="min-w-0 truncate">Change password</span>
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

function PerformanceCard({ stats, statsLoading }: { stats: any; statsLoading: boolean }) {
  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <CardTitle>Performance</CardTitle>
        </div>
        <CardDescription>Subject strengths and weak topics from /users/me/stats</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {statsLoading ? (
          <div className="grid gap-3 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-28 w-full" />
            ))}
          </div>
        ) : stats?.subject_performance && stats.subject_performance.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-3">
            {stats.subject_performance.map((item: any) => (
              <SubjectPerformanceCard
                key={item.subject_id}
                subject={item.subject_name || item.subject_id}
                accuracy={item.accuracy ?? 0}
                score={item.score}
                attempts={item.attempts}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No performance data yet"
            description="Attempt a test to see accuracy and weak topics."
          />
        )}

        <div className="space-y-2">
          <p className="text-sm font-semibold text-foreground">Weak topics</p>
          {statsLoading ? (
            <Skeleton className="h-6 w-48" />
          ) : stats?.weak_topics && stats.weak_topics.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {stats.weak_topics.map((topic: any) => (
                <span
                  key={topic.topic_id}
                  className="rounded-full bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive"
                >
                  {topic.topic_name || topic.topic_id}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Attempt a test to surface your focus areas.</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function Info({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border bg-white p-3 shadow-[0_1px_0_rgba(0,0,0,0.02)]">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-base font-semibold text-foreground">{value}</p>
    </div>
  )
}
