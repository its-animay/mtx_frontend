import { api } from "@/shared/lib/axios"
import { type DeviceInfoPayload } from "@/shared/lib/device"
import {
  type ChangePasswordInput,
  type ForgotPasswordInput,
  type LoginInput,
  type RegisterInput,
  type ResetPasswordInput,
  type ResendVerificationInput,
  type VerifyEmailInput,
} from "../schemas/auth-schemas"
import { type AuthUser } from "../store/auth-store"

export interface TokensResponse {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
}

export interface RegisterResponse {
  message: string
  user_id: string
  email: string
  dev_verification_token?: string
}

export interface Session {
  token_id: string
  device_type: "web" | "ios" | "android"
  device_name: string
  ip_address: string
  user_agent: string
  last_used_at: string
  expires_at: string
  is_current: boolean
}

export const registerRequest = async (payload: RegisterInput) =>
  api.post<RegisterResponse>("/register", payload)

export const verifyEmailRequest = async (payload: VerifyEmailInput) =>
  api.post<TokensResponse>("/verify-email", payload)

export const resendVerificationRequest = async (payload: ResendVerificationInput) =>
  api.post("/resend-verification", payload)

export const loginRequest = async (payload: LoginInput, device_info: DeviceInfoPayload) =>
  api.post<TokensResponse>("/login", { ...payload, device_info })

export const forgotPasswordRequest = async (payload: ForgotPasswordInput) =>
  api.post("/forgot-password", payload)

export const resetPasswordRequest = async (payload: ResetPasswordInput) =>
  api.post("/reset-password", payload)

export const changePasswordRequest = async (payload: ChangePasswordInput) =>
  api.post("/change-password", payload)

export const logoutRequest = async (logout_all_devices: boolean) =>
  api.post("/logout", { logout_all_devices })

export const meRequest = async () => api.get<AuthUser>("/me")

export const sessionsRequest = async () => api.get<{ sessions: Session[] }>("/sessions")

export const revokeSessionRequest = async (tokenId: string) =>
  api.delete(`/sessions/${tokenId}`)

export const revokeAllSessionsRequest = async (revoke_current: boolean) =>
  api.delete("/sessions", { data: { revoke_current } })
