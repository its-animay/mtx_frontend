import { z } from "zod"

export const EDUCATION_LEVELS = [
  "10th_studying",
  "10th_pass",
  "11th_studying",
  "12th_studying",
  "12th_pass",
  "undergraduate",
  "graduate",
  "postgraduate",
] as const

export const STREAMS = ["science_pcm", "science_pcb", "commerce", "arts"] as const

export const genderOptions = ["male", "female", "other", "prefer_not_to_say"] as const
const genderSchema = z.union([
  z.literal("male"),
  z.literal("female"),
  z.literal("other"),
  z.literal("prefer_not_to_say"),
])

const educationSchema = z.union([
  z.literal("10th_studying"),
  z.literal("10th_pass"),
  z.literal("11th_studying"),
  z.literal("12th_studying"),
  z.literal("12th_pass"),
  z.literal("undergraduate"),
  z.literal("graduate"),
  z.literal("postgraduate"),
])

const streamSchema = z.union([
  z.literal("science_pcm"),
  z.literal("science_pcb"),
  z.literal("commerce"),
  z.literal("arts"),
])

const currentYear = new Date().getFullYear()

const preferencesSchema = z.object({
  language: z.string().trim().default("en"),
  timezone: z.string().trim().default("Asia/Kolkata"),
  theme: z.enum(["light", "dark", "system"]).optional(),
  notification_preferences: z.record(z.string(), z.boolean()).optional(),
  test_preferences: z.record(z.string(), z.boolean()).optional(),
})

export const profileCreateSchema = z.object({
  full_name: z.string().trim().min(2, "Full name must be at least 2 characters"),
  display_name: z.string().trim().min(2, "Display name must be at least 2 characters"),
  date_of_birth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/g, "Use YYYY-MM-DD format"),
  gender: genderSchema.optional(),
  country: z.string().trim().length(2, "Use 2-letter country code"),
  pincode: z.string().trim().length(6, "Pincode must be 6 characters"),
  education_level: educationSchema,
  stream: streamSchema.optional(),
  institution: z.string().trim().optional(),
  target_exams: z.array(z.string().trim()).min(1, "Select at least one exam"),
  target_year: z.number().int().min(currentYear).max(currentYear + 10),
  preferences: preferencesSchema.default({
    language: "en",
    timezone: "Asia/Kolkata",
  }),
})

export const profileUpdateSchema = profileCreateSchema.partial()

export const preferencesPatchSchema = z.object({
  notification_preferences: z.record(z.string(), z.boolean()).optional(),
  test_preferences: z.record(z.string(), z.boolean()).optional(),
  language: z.string().trim().default("en"),
  timezone: z.string().trim().default("Asia/Kolkata"),
  theme: z.enum(["light", "dark", "system"]).optional(),
})

export type ProfileCreateInput = z.infer<typeof profileCreateSchema>
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>
export type PreferencesPatchInput = z.infer<typeof preferencesPatchSchema>
