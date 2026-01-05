import { useQuery } from "@tanstack/react-query"

import { masterClient } from "@/shared/lib/http/masterClient"
import { type Subject } from "../api/types"

export function useSubjects() {
  return useQuery<Subject[]>({
    queryKey: ["masters", "subjects"],
    queryFn: async () => {
      const { data } = await masterClient.get<{ data: Subject[] }>("/subjects", {
        params: {
          is_active: true,
          limit: 200,
          sort_by: "name",
          sort_order: "asc",
        },
      })
      const list = (data as any)?.data ?? data
      return Array.isArray(list) ? list : []
    },
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60,
  })
}
