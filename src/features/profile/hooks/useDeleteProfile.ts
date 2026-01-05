import { useMutation } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { APP_ROUTES } from "@/shared/config/env"
import { useAuthStore } from "@/features/auth/store/auth-store"
import { getFriendlyError } from "@/shared/lib/errors"
import { deleteProfile } from "../api/profileApi"
import { useProfileStore } from "../store/profile-store"

export function useDeleteProfileMutation() {
  const navigate = useNavigate()
  const clearAuth = useAuthStore((state) => state.clear)
  const clearProfile = useProfileStore((state) => state.clear)
  const markDeleted = useProfileStore((state) => state.markDeleted)

  return useMutation({
    mutationFn: async (reason?: string) => deleteProfile(reason ? { reason } : undefined),
    onSuccess: () => {
      toast.success("Profile deleted")
      clearProfile()
      clearAuth()
      markDeleted(true)
      navigate(APP_ROUTES.profileDeleted)
    },
    onError: (error) => {
      toast.error(getFriendlyError(error))
    },
  })
}
