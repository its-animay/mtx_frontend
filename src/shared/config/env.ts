export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.trim() && import.meta.env.VITE_API_BASE_URL !== ""
    ? import.meta.env.VITE_API_BASE_URL
    : "/auth"

export const USER_API_BASE_URL =
  import.meta.env.VITE_USER_API_BASE_URL?.trim() && import.meta.env.VITE_USER_API_BASE_URL !== ""
    ? import.meta.env.VITE_USER_API_BASE_URL
    : "http://localhost:8002/api/v1"

export const MASTER_API_BASE_URL =
  import.meta.env.VITE_MASTER_API_BASE_URL?.trim() && import.meta.env.VITE_MASTER_API_BASE_URL !== ""
    ? import.meta.env.VITE_MASTER_API_BASE_URL
    : "http://localhost:8000/api/v1"

export const MASTER_API_KEY = import.meta.env.VITE_MASTER_API_KEY || ""
export const MASTER_ADMIN_API_KEY = import.meta.env.VITE_MASTER_ADMIN_API_KEY || ""

export const APP_ROUTES = {
  root: "/",
  login: "/login",
  register: "/register",
  verify: "/verify-email",
  forgot: "/forgot-password",
  reset: "/reset-password",
  dashboard: "/dashboard",
  sessions: "/sessions",
  changePassword: "/change-password",
  onboardingProfile: "/onboarding/profile",
  profile: "/profile",
  profileEdit: "/profile/edit",
  profilePreferences: "/profile/preferences",
  profileDeleted: "/profile/deleted",
  devMasters: "/dev/masters",
  tests: "/tests",
  testAttempt: (id = ":testId") => `/tests/${id}/attempt`,
  practice: "/practice",
}
