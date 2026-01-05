import { useQuery } from "@tanstack/react-query"

import { masterClient } from "@/shared/lib/http/masterClient"
import { type Topic } from "../api/types"

export function useTopics(subjectId?: string) {
  return useQuery<Topic[]>({
    queryKey: ["masters", "topics", subjectId],
    queryFn: async () => {
      const { data } = await masterClient.get<{ data: Topic[] }>("/topics", {
        params: { subject_id: subjectId },
      })
      const list = (data as any)?.data ?? data
      return Array.isArray(list) ? list : []
    },
    enabled: Boolean(subjectId),
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
  })
}
