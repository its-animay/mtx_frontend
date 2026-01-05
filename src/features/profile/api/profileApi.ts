import { apiClient } from "@/shared/lib/http/apiClient"

import {
  type DeleteProfileParams,
  type Preferences,
  type Profile,
  type ProfileStats,
} from "./types"

export const getProfile = async () => apiClient.get<Profile>("/users/me")

export const createProfile = async (payload: Profile) => apiClient.post<Profile>("/users/me", payload)

export const updateProfile = async (payload: Partial<Profile>) => apiClient.put<Profile>("/users/me", payload)

export const updatePreferences = async (payload: Preferences) =>
  apiClient.patch<Profile>("/users/me/preferences", payload)

export const getProfileStats = async () => apiClient.get<ProfileStats>("/users/me/stats")

export const deleteProfile = async (params?: DeleteProfileParams) =>
  apiClient.delete("/users/me", { params })
