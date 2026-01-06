import { useQuery } from "@tanstack/react-query"
import { fetchTestPreview, fetchTests, type TestListQuery } from "../api/tests"

export const testsKeys = {
  list: (params: TestListQuery) => ["tests", params] as const,
  preview: (id?: string) => ["tests", "preview", id] as const,
}

export function useTestsList(params: TestListQuery) {
  return useQuery({
    queryKey: testsKeys.list(params),
    queryFn: () => fetchTests(params),
  })
}

export function useTestPreview(testId?: string) {
  return useQuery({
    queryKey: testsKeys.preview(testId),
    queryFn: () => fetchTestPreview(testId),
    enabled: Boolean(testId),
  })
}
