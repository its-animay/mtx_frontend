import { QueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios"
import { toast } from "sonner"

import { getFriendlyError } from "@/shared/lib/errors"

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        const status = (error as AxiosError)?.response?.status
        if (status && [400, 401, 403].includes(status)) return false
        return failureCount < 2
      },
    },
    mutations: {
      onError: (error) => {
        const message = getFriendlyError(error)
        if (message) {
          toast.error(message)
        }
      },
    },
  },
})
