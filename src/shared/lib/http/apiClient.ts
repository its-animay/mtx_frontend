import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from "axios"

import { API_BASE_URL, APP_ROUTES, USER_API_BASE_URL } from "@/shared/config/env"
import { useAuthStore } from "@/features/auth/store/auth-store"
import { type AuthTokens } from "@/shared/lib/axios"

interface AuthenticatedRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
  skipAuth?: boolean
}

const client: AxiosInstance = axios.create({
  baseURL: USER_API_BASE_URL,
  headers: { "Content-Type": "application/json" },
})

const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
})

let isRefreshing = false
let requestQueue: Array<{ resolve: (value: unknown) => void; reject: (reason?: unknown) => void; config: AuthenticatedRequestConfig }> = []

const processQueue = (error: unknown, token: string | null = null) => {
  requestQueue.forEach(({ resolve, reject, config }) => {
    if (error) {
      reject(error)
      return
    }

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    resolve(client(config))
  })
  requestQueue = []
}

const redirectToLogin = () => {
  if (typeof window !== "undefined" && window.location.pathname !== APP_ROUTES.login) {
    window.location.href = APP_ROUTES.login
  }
}

client.interceptors.request.use((config) => {
  const typed = config as AuthenticatedRequestConfig
  const token = useAuthStore.getState().accessToken

  if (token && !typed.skipAuth) {
    typed.headers = typed.headers || {}
    typed.headers.Authorization = `Bearer ${token}`
  }

  return typed
})

client.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status
    const original = error.config as AuthenticatedRequestConfig

    if (!original) return Promise.reject(error)

    // Attempt refresh once on 401 for user service calls
    const refreshToken = useAuthStore.getState().refreshToken
    const shouldRefresh = status === 401 && refreshToken && !original._retry

    if (shouldRefresh) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          requestQueue.push({ resolve, reject, config: original })
        })
      }

      original._retry = true
      isRefreshing = true

      try {
        const { data } = await refreshClient.post<AuthTokens>("/refresh", {
          refresh_token: refreshToken,
        })

        useAuthStore.getState().setTokens(data.access_token, data.refresh_token)
        processQueue(null, data.access_token)

        original.headers = original.headers || {}
        original.headers.Authorization = `Bearer ${data.access_token}`

        return client(original)
      } catch (refreshErr) {
        processQueue(refreshErr, null)
        useAuthStore.getState().clear()
        redirectToLogin()
        return Promise.reject(refreshErr)
      } finally {
        isRefreshing = false
      }
    }

    if (status === 401) {
      useAuthStore.getState().clear()
      redirectToLogin()
    }

    return Promise.reject(error)
  },
)

export { client as apiClient }
