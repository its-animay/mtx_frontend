import { useEffect } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { APP_ROUTES } from "@/shared/config/env"
import { getFriendlyError } from "@/shared/lib/errors"
import { getDeviceInfo } from "@/shared/lib/device"
import {
  changePasswordRequest,
  forgotPasswordRequest,
  loginRequest,
  logoutRequest,
  meRequest,
  registerRequest,
  resendVerificationRequest,
  resetPasswordRequest,
  revokeAllSessionsRequest,
  revokeSessionRequest,
  sessionsRequest,
  verifyEmailRequest,
  type RegisterResponse,
  type Session,
} from "../api/auth-api"
import {
  type ChangePasswordInput,
  type ForgotPasswordInput,
  type LoginInput,
  type RegisterInput,
  type ResetPasswordInput,
  type ResendVerificationInput,
  type VerifyEmailInput,
} from "../schemas/auth-schemas"
import { useAuthStore, type AuthUser } from "../store/auth-store"
import { useProfileStore } from "@/features/profile/store/profile-store"

export const authKeys = {
  me: ["auth", "me"] as const,
  sessions: ["auth", "sessions"] as const,
}

export function useRegisterMutation() {
  return useMutation({
    mutationFn: async (payload: RegisterInput) => {
      const { data } = await registerRequest(payload)
      return data
    },
  })
}

export function useVerifyEmailMutation() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const setTokens = useAuthStore((state) => state.setTokens)

  return useMutation({
    mutationFn: async (payload: VerifyEmailInput) => {
      const { data } = await verifyEmailRequest(payload)
      return data
    },
    onSuccess: (data) => {
      setTokens(data.access_token, data.refresh_token)
      queryClient.invalidateQueries({ queryKey: authKeys.me })
      toast.success("Email verified. You're in.")
      navigate(APP_ROUTES.dashboard)
    },
    onError: (error) => toast.error(getFriendlyError(error)),
  })
}

export function useResendVerificationMutation() {
  return useMutation({
    mutationFn: async (payload: ResendVerificationInput) => resendVerificationRequest(payload),
    onSuccess: () => toast.success("If the account exists, a new verification link is on the way."),
    onError: (error) => toast.error(getFriendlyError(error)),
  })
}

export function useLoginMutation() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const setTokens = useAuthStore((state) => state.setTokens)

  return useMutation({
    mutationFn: async (payload: LoginInput) => {
      const device_info = getDeviceInfo()
      const { data } = await loginRequest(payload, device_info)
      return data
    },
    onSuccess: (data) => {
      setTokens(data.access_token, data.refresh_token)
      queryClient.invalidateQueries({ queryKey: authKeys.me })
      toast.success("Welcome back")
      navigate(APP_ROUTES.dashboard)
    },
    onError: (error) => toast.error(getFriendlyError(error)),
  })
}

export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: async (payload: ForgotPasswordInput) => forgotPasswordRequest(payload),
    onSuccess: () =>
      toast.success("If the email exists, you'll get reset instructions shortly."),
    onError: (error) => toast.error(getFriendlyError(error)),
  })
}

export function useResetPasswordMutation() {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async (payload: ResetPasswordInput) => resetPasswordRequest(payload),
    onSuccess: () => {
      toast.success("Password updated. Sign in with your new password.")
      navigate(APP_ROUTES.login)
    },
    onError: (error) => toast.error(getFriendlyError(error)),
  })
}

export function useChangePasswordMutation() {
  return useMutation({
    mutationFn: async (payload: ChangePasswordInput) => changePasswordRequest(payload),
    onSuccess: (_, variables) => {
      toast.success("Password changed successfully")
      if (variables.logout_other_devices) {
        toast.message("Other sessions will need to sign in again.")
      }
    },
    onError: (error) => toast.error(getFriendlyError(error)),
  })
}

export function useLogoutMutation() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const clear = useAuthStore((state) => state.clear)
  const clearProfile = useProfileStore((state) => state.clear)

  return useMutation({
    mutationFn: async (logout_all_devices: boolean) => logoutRequest(logout_all_devices),
    onSettled: () => {
      clear()
      clearProfile()
      queryClient.clear()
      navigate(APP_ROUTES.login)
    },
  })
}

export function useMeQuery() {
  const accessToken = useAuthStore((state) => state.accessToken)
  const setUser = useAuthStore((state) => state.setUser)

  const query = useQuery<AuthUser>({
    queryKey: authKeys.me,
    queryFn: async () => {
      const { data } = await meRequest()
      return data
    },
    enabled: Boolean(accessToken),
    staleTime: 5 * 60 * 1000,
  })

  useEffect(() => {
    if (query.data) {
      setUser(query.data)
    }
  }, [query.data, setUser])

  return query
}

export function useSessionsQuery() {
  const accessToken = useAuthStore((state) => state.accessToken)

  return useQuery<Session[]>({
    queryKey: authKeys.sessions,
    queryFn: async () => {
      const { data } = await sessionsRequest()
      return data.sessions
    },
    enabled: Boolean(accessToken),
  })
}

export function useRevokeSessionMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (tokenId: string) => revokeSessionRequest(tokenId),
    onSuccess: () => {
      toast.success("Session revoked")
      queryClient.invalidateQueries({ queryKey: authKeys.sessions })
    },
    onError: (error) => toast.error(getFriendlyError(error)),
  })
}

export function useRevokeAllSessionsMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (revokeCurrent: boolean) => revokeAllSessionsRequest(revokeCurrent),
    onSuccess: (_, revokeCurrent) => {
      toast.success("All sessions revoked")
      if (revokeCurrent) {
        toast.message("You'll be logged out on this device shortly.")
      }
      queryClient.invalidateQueries({ queryKey: authKeys.sessions })
    },
    onError: (error) => toast.error(getFriendlyError(error)),
  })
}

export type { RegisterResponse }
