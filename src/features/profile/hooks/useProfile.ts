import { useQuery } from "@tanstack/react-query"

import { getProfile } from "../api/profileApi"
import { type Profile } from "../api/types"

export const profileKeys = {
  me: ["profile", "me"] as const,
  stats: ["profile", "stats"] as const,
}

export function useProfileQuery(enabled = true) {
  return useQuery<Profile>({
    queryKey: profileKeys.me,
    queryFn: async () => {
      const { data } = await getProfile()
      return data
    },
    enabled,
    retry: false,
    staleTime: 1000 * 60 * 5,
  })
}
