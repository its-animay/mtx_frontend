import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { APP_ROUTES } from "@/shared/config/env"
import { useAuthStore } from "@/features/auth/store/auth-store"
import { getFriendlyError } from "@/shared/lib/errors"
import { createProfile } from "../api/profileApi"
import { type Profile } from "../api/types"
import { profileKeys } from "./useProfile"
import { useProfileStore } from "../store/profile-store"
import { useNavigate } from "react-router-dom"

export function useCreateProfileMutation() {
  const queryClient = useQueryClient()
  const setProfile = useProfileStore((state) => state.setProfile)
  const navigate = useNavigate()
  const clearAuth = useAuthStore((state) => state.clear)

  return useMutation({
    mutationFn: async (payload: Profile) => {
      const { data } = await createProfile(payload)
      return data
    },
    onSuccess: (data) => {
      setProfile(data)
      queryClient.setQueryData(profileKeys.me, data)
      toast.success("Profile created")
      navigate(APP_ROUTES.dashboard)
    },
    onError: (error: unknown) => {
      toast.error(getFriendlyError(error))
      // In case backend invalidates token
      if ((error as any)?.response?.status === 401) {
        clearAuth()
      }
    },
  })
}
