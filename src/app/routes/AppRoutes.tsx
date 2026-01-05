import { AnimatePresence } from "framer-motion"
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom"

import { AppShell } from "@/app/layouts/app-shell"
import { APP_ROUTES } from "@/shared/config/env"
import { AuthRoute, ProfileRequiredRoute, ProtectedRoute } from "./guards"
import { ChangePasswordPage } from "@/features/auth/pages/ChangePasswordPage"
import { DashboardPage } from "@/features/auth/pages/DashboardPage"
import { ForgotPasswordPage } from "@/features/auth/pages/ForgotPasswordPage"
import { LoginPage } from "@/features/auth/pages/LoginPage"
import { RegisterPage } from "@/features/auth/pages/RegisterPage"
import { ResetPasswordPage } from "@/features/auth/pages/ResetPasswordPage"
import { SessionsPage } from "@/features/auth/pages/SessionsPage"
import { VerifyEmailPage } from "@/features/auth/pages/VerifyEmailPage"
import { ProfileGate } from "@/features/profile/components/ProfileGate"
import { CreateProfilePage } from "@/features/profile/pages/CreateProfilePage"
import { ProfileViewPage } from "@/features/profile/pages/ProfileViewPage"
import { ProfileEditPage } from "@/features/profile/pages/ProfileEditPage"
import { PreferencesPage } from "@/features/profile/pages/PreferencesPage"
import { DeletedProfilePage } from "@/features/profile/pages/DeletedProfilePage"
import { DevMastersPage } from "@/features/masters/pages/DevMastersPage"
import { TestSeriesPage } from "@/features/tests/pages/TestSeriesPage"
import { TestAttemptPage } from "@/features/tests/pages/TestAttemptPage"
import { PracticePage } from "@/features/tests/pages/PracticePage"

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Navigate to={APP_ROUTES.dashboard} replace />} />

        <Route element={<AuthRoute />}>
          <Route path={APP_ROUTES.login} element={<LoginPage />} />
          <Route path={APP_ROUTES.register} element={<RegisterPage />} />
          <Route path={APP_ROUTES.verify} element={<VerifyEmailPage />} />
          <Route path={APP_ROUTES.forgot} element={<ForgotPasswordPage />} />
          <Route path={APP_ROUTES.reset} element={<ResetPasswordPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route
            element={
              <ProfileGate>
                <Outlet />
              </ProfileGate>
            }
          >
            <Route path={APP_ROUTES.onboardingProfile} element={<CreateProfilePage />} />
            <Route path={APP_ROUTES.profileDeleted} element={<DeletedProfilePage />} />

            <Route element={<AppShell />}>
              <Route element={<ProfileRequiredRoute />}>
                <Route path={APP_ROUTES.dashboard} element={<DashboardPage />} />
                <Route path={APP_ROUTES.profile} element={<ProfileViewPage />} />
                <Route path={APP_ROUTES.profileEdit} element={<ProfileEditPage />} />
                <Route path={APP_ROUTES.profilePreferences} element={<PreferencesPage />} />
                <Route path={APP_ROUTES.tests} element={<TestSeriesPage />} />
                <Route path={APP_ROUTES.practice} element={<PracticePage />} />
                <Route path={APP_ROUTES.testAttempt()} element={<TestAttemptPage />} />
              </Route>
              <Route path={APP_ROUTES.sessions} element={<SessionsPage />} />
              <Route path={APP_ROUTES.changePassword} element={<ChangePasswordPage />} />
              <Route path={APP_ROUTES.devMasters} element={<DevMastersPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to={APP_ROUTES.login} replace />} />
      </Routes>
    </AnimatePresence>
  )
}

export function AppRoutes() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  )
}
