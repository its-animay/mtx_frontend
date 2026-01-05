import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { getFriendlyError } from "@/shared/lib/errors"
import { updatePreferences } from "../api/profileApi"
import { type Preferences } from "../api/types"
import { useProfileStore } from "../store/profile-store"
import { profileKeys } from "./useProfile"

export function useUpdatePreferencesMutation() {
  const queryClient = useQueryClient()
  const setProfile = useProfileStore((state) => state.setProfile)

  return useMutation({
    mutationFn: async (payload: Preferences) => {
      const { data } = await updatePreferences(payload)
      return data
    },
    onSuccess: (data) => {
      setProfile(data)
      queryClient.setQueryData(profileKeys.me, data)
      toast.success("Preferences updated")
    },
    onError: (error) => {
      toast.error(getFriendlyError(error))
    },
  })
}
