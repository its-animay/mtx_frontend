import axios, { type AxiosError, type AxiosRequestConfig, type AxiosResponse } from "axios"

import { API_BASE_URL, APP_ROUTES } from "@/shared/config/env"
import { useAuthStore } from "@/features/auth/store/auth-store"

export interface AuthTokens {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
}

export interface AuthAxiosRequestConfig extends AxiosRequestConfig {
  skipAuth?: boolean
  _retry?: boolean
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

let isRefreshing = false
let failedQueue: Array<{
  resolve: (value: AxiosResponse | PromiseLike<AxiosResponse>) => void
  reject: (error: unknown) => void
  config: AuthAxiosRequestConfig
}> = []

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject, config }) => {
    if (error) {
      reject(error)
      return
    }

    if (token) {
      config.headers = {
        ...(config.headers ?? {}),
        Authorization: `Bearer ${token}`,
      }
    }

    api(config).then(resolve).catch(reject)
  })

  failedQueue = []
}

const redirectToLogin = () => {
  if (typeof window !== "undefined" && window.location.pathname !== APP_ROUTES.login) {
    window.location.href = APP_ROUTES.login
  }
}

api.interceptors.request.use((config) => {
  const typedConfig = config as AuthAxiosRequestConfig
  const token = useAuthStore.getState().accessToken

  if (token && !typedConfig.skipAuth) {
    const headers = (typedConfig.headers ?? {}) as Record<string, string>
    headers.Authorization = `Bearer ${token}`
    typedConfig.headers = headers
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AuthAxiosRequestConfig
    const status = error.response?.status

    if (!originalRequest) {
      return Promise.reject(error)
    }

    const refreshToken = useAuthStore.getState().refreshToken

    const shouldRefresh =
      status === 401 &&
      refreshToken &&
      !originalRequest._retry &&
      originalRequest.url !== "/refresh"

    if (shouldRefresh) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, config: originalRequest })
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const { data } = await refreshClient.post<AuthTokens>("/refresh", {
          refresh_token: refreshToken,
        })

        useAuthStore.getState().setTokens(data.access_token, data.refresh_token)
        processQueue(null, data.access_token)

        originalRequest.headers = {
          ...(originalRequest.headers ?? {}),
          Authorization: `Bearer ${data.access_token}`,
        }

        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        useAuthStore.getState().clear()
        redirectToLogin()
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    if (status === 401 || status === 403) {
      useAuthStore.getState().clear()
      redirectToLogin()
    }

    return Promise.reject(error)
  },
)

export { api }
