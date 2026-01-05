import { Navigate, Outlet, useLocation } from "react-router-dom"

import { APP_ROUTES } from "@/shared/config/env"
import { useAuthStore } from "@/features/auth/store/auth-store"
import { useProfileStore } from "@/features/profile/store/profile-store"

export function ProtectedRoute() {
  const accessToken = useAuthStore((state) => state.accessToken)
  const location = useLocation()

  if (!accessToken) {
    return <Navigate to={APP_ROUTES.login} state={{ from: location }} replace />
  }

  return <Outlet />
}

export function AuthRoute() {
  const accessToken = useAuthStore((state) => state.accessToken)

  if (accessToken) {
    return <Navigate to={APP_ROUTES.dashboard} replace />
  }

  return <Outlet />
}

export function ProfileRequiredRoute() {
  const profile = useProfileStore((state) => state.profile)
  const isDeleted = useProfileStore((state) => state.isDeleted)
  const accessToken = useAuthStore((state) => state.accessToken)
  if (!accessToken) return <Navigate to={APP_ROUTES.login} replace />
  if (isDeleted) return <Navigate to={APP_ROUTES.profileDeleted} replace />
  if (!profile) return <Navigate to={APP_ROUTES.onboardingProfile} replace />

  return <Outlet />
}
