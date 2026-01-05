import { z } from "zod"

import { passwordRegex } from "../utils/password"

const emailSchema = z.string().trim().toLowerCase().email("Enter a valid email")

const phoneSchema = z
  .string()
  .trim()
  .nullable()
  .transform((val) => (val === "" || val === null ? null : val))
  .refine((val) => val === null || /^\+[1-9]\d{1,14}$/.test(val), {
    message: "Use E.164 format (+123...)",
  })

const passwordSchema = z.string().regex(passwordRegex, {
  message: "Min 8 chars with upper, lower, digit, and special",
})

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  phone: phoneSchema,
  agree_to_terms: z.boolean().refine((val) => val === true, {
    message: "Please accept the terms to continue",
  }),
})

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
})

export const verifyEmailSchema = z.object({
  token: z.string().min(1, "Verification token is required"),
})

export const resendVerificationSchema = z.object({
  email: emailSchema,
})

export const forgotPasswordSchema = z.object({
  email: emailSchema,
})

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  new_password: passwordSchema,
})

export const changePasswordSchema = z.object({
  current_password: z.string().min(1, "Current password is required"),
  new_password: passwordSchema,
  logout_other_devices: z.boolean(),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>
export type ResendVerificationInput = z.infer<typeof resendVerificationSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
