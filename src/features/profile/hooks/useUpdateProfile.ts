import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { getFriendlyError } from "@/shared/lib/errors"
import { updateProfile } from "../api/profileApi"
import { type Profile } from "../api/types"
import { useProfileStore } from "../store/profile-store"
import { profileKeys } from "./useProfile"

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient()
  const setProfile = useProfileStore((state) => state.setProfile)

  return useMutation({
    mutationFn: async (payload: Partial<Profile>) => {
      const { data } = await updateProfile(payload)
      return data
    },
    onSuccess: (data) => {
      setProfile(data)
      queryClient.setQueryData(profileKeys.me, data)
      toast.success("Saved changes")
    },
    onError: (error) => {
      toast.error(getFriendlyError(error))
    },
  })
}
