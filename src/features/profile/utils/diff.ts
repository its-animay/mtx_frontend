import { type Profile } from "../api/types"
import { type ProfileCreateInput } from "../schemas/profile.schemas"

const shallowEqual = (a: unknown, b: unknown) => {
  try {
    return JSON.stringify(a) === JSON.stringify(b)
  } catch (error) {
    return false
  }
}

export function diffProfilePayload(values: ProfileCreateInput, original?: Profile): Partial<Profile> {
  if (!original) return values as unknown as Profile

  const changed: Partial<Profile> = {}
  const keys: Array<keyof ProfileCreateInput> = [
    "full_name",
    "display_name",
    "date_of_birth",
    "gender",
    "country",
    "pincode",
    "education_level",
    "stream",
    "institution",
    "target_exams",
    "target_year",
    "preferences",
  ]

  keys.forEach((key) => {
    const newVal = values[key]
    const oldVal = (original as unknown as Record<string, unknown>)[key]
    if (!shallowEqual(newVal, oldVal)) {
      ;(changed as Record<string, unknown>)[key] = newVal
    }
  })

  return changed as Partial<Profile>
}
