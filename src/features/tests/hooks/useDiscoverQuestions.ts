import { useQuery } from "@tanstack/react-query"
import { fetchDiscoverQuestions, type DiscoverQueryParams } from "../api/discover"

export const discoverKeys = {
  list: (params: DiscoverQueryParams) => ["discover", params] as const,
}

export function useDiscoverQuestions(params: DiscoverQueryParams) {
  return useQuery({
    queryKey: discoverKeys.list(params),
    queryFn: () => fetchDiscoverQuestions(params),
    staleTime: 1000 * 60,
  })
}
