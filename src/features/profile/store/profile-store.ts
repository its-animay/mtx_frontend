import { create } from "zustand"

import { type Profile } from "../api/types"

interface ProfileState {
  profile: Profile | null
  isDeleted: boolean
  setProfile: (profile: Profile | null) => void
  clear: () => void
  markDeleted: (value: boolean) => void
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  isDeleted: false,
  setProfile: (profile) => set({ profile, isDeleted: false }),
  clear: () => set({ profile: null, isDeleted: false }),
  markDeleted: (value) => set({ isDeleted: value, profile: null }),
}))
