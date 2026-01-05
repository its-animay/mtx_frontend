import { useEffect, type ReactNode } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { AxiosError } from "axios"

import { APP_ROUTES } from "@/shared/config/env"
import { FullScreenLoader } from "@/shared/ui/loaders/FullScreenLoader"
import { useAuthStore } from "@/features/auth/store/auth-store"
import { useProfileQuery } from "../hooks/useProfile"
import { useProfileStore } from "../store/profile-store"

interface ProfileGateProps {
  children: ReactNode
}

export function ProfileGate({ children }: ProfileGateProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const accessToken = useAuthStore((state) => state.accessToken)
  const clearAuth = useAuthStore((state) => state.clear)
  const { data, isLoading, error } = useProfileQuery(Boolean(accessToken))
  const setProfile = useProfileStore((state) => state.setProfile)
  const clearProfile = useProfileStore((state) => state.clear)
  const existingProfile = useProfileStore((state) => state.profile)
  const markDeleted = useProfileStore((state) => state.markDeleted)
  const status = (error as AxiosError | undefined)?.response?.status

  useEffect(() => {
    if (!data) return
    if (existingProfile?.id && data.id && existingProfile.id === data.id) return
    setProfile(data)
  }, [data, existingProfile?.id, setProfile])

  useEffect(() => {
    const hasProfile = Boolean(data || existingProfile)
    if (hasProfile && location.pathname === APP_ROUTES.onboardingProfile) {
      navigate(APP_ROUTES.dashboard, { replace: true })
    }
  }, [data, existingProfile, location.pathname, navigate])

  useEffect(() => {
    if (!status) return

    if (status === 404) {
      if (existingProfile) {
        clearProfile()
      }
      if (location.pathname !== APP_ROUTES.onboardingProfile) {
        navigate(APP_ROUTES.onboardingProfile, { replace: true })
      }

      return
    }

    if (status === 403) {
      if (!existingProfile) {
        markDeleted(true)
      }
      if (location.pathname !== APP_ROUTES.profileDeleted) {
        navigate(APP_ROUTES.profileDeleted, { replace: true })
      }
      return
    }

    if (status === 401) {
      clearAuth()
      navigate(APP_ROUTES.login, { replace: true })
    }
  }, [status, navigate, clearAuth, location.pathname, markDeleted, clearProfile, existingProfile])

  if (isLoading || (!data && !error && !existingProfile)) {
    return <FullScreenLoader />
  }

  return <>{children}</>
}
