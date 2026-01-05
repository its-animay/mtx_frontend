import { useQuery } from "@tanstack/react-query"

import { getProfileStats } from "../api/profileApi"
import { type ProfileStats } from "../api/types"
import { profileKeys } from "./useProfile"

export function useProfileStatsQuery(enabled = true) {
  return useQuery<ProfileStats>({
    queryKey: profileKeys.stats,
    queryFn: async () => {
      const { data } = await getProfileStats()
      return data
    },
    enabled,
    staleTime: 1000 * 60 * 5,
  })
}
