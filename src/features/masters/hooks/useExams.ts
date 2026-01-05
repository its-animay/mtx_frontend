import { useQuery } from "@tanstack/react-query"
import { masterClient } from "@/shared/lib/http/masterClient"
import { type Exam } from "../api/types"

export function useExams() {
  return useQuery<Exam[]>({
    queryKey: ["masters", "exams"],
    queryFn: async () => {
      const { data } = await masterClient.get<{ data: Exam[] }>("/exams", {
        params: { active_only: true },
      })
      const list = (data as any)?.data ?? data
      return Array.isArray(list) ? list : []
    },
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
  })
}
