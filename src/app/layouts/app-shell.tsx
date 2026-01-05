import { Outlet, NavLink, Link } from "react-router-dom"
import {
  BadgeCheck,
  ClipboardList,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  ShieldCheck,
  SlidersHorizontal,
  Target,
  UserRound,
} from "lucide-react"

import { APP_ROUTES } from "@/shared/config/env"
import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/shared/ui/avatar"
import { Badge } from "@/shared/ui/badge"
import { Separator } from "@/shared/ui/separator"
import { useLogoutMutation } from "@/features/auth/hooks/use-auth"
import { useAuthStore } from "@/features/auth/store/auth-store"
import { useProfileStore } from "@/features/profile/store/profile-store"

const productNav = [
  { to: APP_ROUTES.dashboard, label: "Dashboard", icon: LayoutDashboard },
  { to: APP_ROUTES.tests, label: "Tests", icon: ClipboardList },
  { to: APP_ROUTES.practice, label: "Practice", icon: Target },
]

const accountLinks = [
  { to: APP_ROUTES.profile, label: "Profile", icon: UserRound },
  { to: APP_ROUTES.profilePreferences, label: "Preferences", icon: SlidersHorizontal },
  { to: APP_ROUTES.sessions, label: "Active Sessions", icon: ShieldCheck },
  { to: APP_ROUTES.changePassword, label: "Change Password", icon: BadgeCheck },
]

export function AppShell() {
  const { mutate: logout, isPending } = useLogoutMutation()
  const user = useAuthStore((state) => state.user)
  const profile = useProfileStore((state) => state.profile)
  const displayName = profile?.display_name || user?.email || "User"
  const targetExam = profile?.target_exams?.[0]

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
            <Link to={APP_ROUTES.dashboard} className="flex items-center gap-2 font-semibold">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <span className="text-base">Test App</span>
            </Link>
            <nav className="hidden items-center gap-2 md:flex">
              {productNav.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )
                  }
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>

          <ProfileDropdown
            displayName={displayName}
            email={user?.email}
            targetExam={targetExam}
            onLogout={() => logout(false)}
            isLoggingOut={isPending}
          />
        </div>
      </header>
      <Separator />
      <div className="mx-auto flex w-full max-w-6xl gap-6 px-4 py-8">
        <aside className="sticky top-20 hidden h-fit w-56 shrink-0 rounded-xl border bg-white p-4 shadow-sm md:block">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Navigation</p>
          <div className="space-y-2">
            {productNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )
                }
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
          </div>
        </aside>
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function ProfileDropdown({
  displayName,
  email,
  targetExam,
  onLogout,
  isLoggingOut,
}: {
  displayName: string
  email?: string
  targetExam?: string
  onLogout: () => void
  isLoggingOut: boolean
}) {
  const initials = displayName?.slice(0, 2)?.toUpperCase() || "U"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-3 px-2">
          <Avatar className="h-9 w-9">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="hidden text-left md:block">
            <p className="text-sm font-semibold leading-tight text-foreground">{displayName}</p>
            <p className="text-xs text-muted-foreground">{email || "Signed in"}</p>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-72 rounded-xl border border-slate-200 bg-white/95 p-2 shadow-xl backdrop-blur"
      >
        <div className="flex items-start gap-3 rounded-lg px-2 py-1.5">
          <Avatar className="h-10 w-10">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">{displayName}</p>
            {email ? <p className="text-xs text-muted-foreground">{email}</p> : null}
            {targetExam ? (
              <Badge variant="outline" className="text-[11px]">
                Target: {targetExam}
              </Badge>
            ) : null}
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs uppercase text-muted-foreground">Account</DropdownMenuLabel>
        {accountLinks.map((item) => (
          <DropdownMenuItem key={item.to} asChild className="gap-2 rounded-md px-2 py-2">
            <Link to={item.to} className="flex items-center gap-2">
              <item.icon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{item.label}</span>
            </Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs uppercase text-muted-foreground">Danger</DropdownMenuLabel>
        <DropdownMenuItem
          className="gap-2 rounded-md px-2 py-2 text-destructive focus:text-destructive"
          onSelect={(e) => {
            e.preventDefault()
            onLogout()
          }}
        >
          {isLoggingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
          <span className="text-sm font-medium">Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
