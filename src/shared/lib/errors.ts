import { AxiosError } from "axios"

interface ErrorBody {
  message?: string
  detail?: string
  error?: string
}

export function getFriendlyError(error: unknown) {
  const err = error as AxiosError<ErrorBody>
  const status = err.response?.status
  const detail = err.response?.data?.detail || err.response?.data?.message || err.response?.data?.error

  if (!status) return detail || "Something went wrong."

  if (status === 401) return detail || "Invalid credentials."
  if (status === 403) {
    const text = detail?.toLowerCase() || ""
    if (text.includes("verify")) return "Your account is not verified yet. Check your email or resend the link."
    if (text.includes("lock")) return "This account is locked. Please contact support."
    return detail || "You don't have access."
  }
  if (status === 429) return detail || "You're sending too many requests. Please wait and try again."

  return detail || "Something went wrong."
}
