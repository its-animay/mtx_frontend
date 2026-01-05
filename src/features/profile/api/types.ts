export type Gender = "male" | "female" | "other" | "prefer_not_to_say"

export type EducationLevel =
  | "10th_studying"
  | "10th_pass"
  | "11th_studying"
  | "12th_studying"
  | "12th_pass"
  | "undergraduate"
  | "graduate"
  | "postgraduate"

export type Stream = "science_pcm" | "science_pcb" | "commerce" | "arts"

export interface Preferences {
  language: string
  timezone: string
  theme?: "light" | "dark" | "system"
  notification_preferences?: Record<string, boolean>
  test_preferences?: Record<string, boolean>
}

export interface Profile {
  id?: string
  full_name: string
  display_name: string
  date_of_birth: string
  gender?: Gender
  country: string
  pincode: string
  education_level: EducationLevel
  stream?: Stream
  institution?: string
  target_exams: string[]
  target_year: number
  preferences?: Preferences
  created_at?: string
  updated_at?: string
}

export interface ProfileStats {
  total_tests?: number
  total_hours?: number
  streak_days?: number
  subject_performance?: Array<{
    subject_id: string
    subject_name?: string
    accuracy?: number
    score?: number
    attempts?: number
  }>
  weak_topics?: Array<{
    topic_id: string
    topic_name?: string
    subject_id: string
  }>
}

export interface DeleteProfileParams {
  reason?: string
}
