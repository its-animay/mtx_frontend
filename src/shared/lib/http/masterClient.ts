import axios from "axios"
import { toast } from "sonner"

import { MASTER_API_BASE_URL, MASTER_API_KEY, MASTER_ADMIN_API_KEY } from "@/shared/config/env"

const LOCAL_STORAGE_KEY = "master-api-key"
let runtimeMasterApiKey = MASTER_API_KEY?.trim() || ""

async function ensureApiKey(): Promise<string> {
  // If an explicit key is set in env, prefer it and skip generation/local cache.
  if (MASTER_API_KEY?.trim()) {
    runtimeMasterApiKey = MASTER_API_KEY.trim()
    return runtimeMasterApiKey
  }

  if (typeof window !== "undefined") {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (cached) {
      runtimeMasterApiKey = cached
      return runtimeMasterApiKey
    }
  }

  if (!MASTER_ADMIN_API_KEY) {
    toast.error("Master API key missing. Set VITE_MASTER_API_KEY or VITE_MASTER_ADMIN_API_KEY.")
    throw new Error("Missing master API key configuration")
  }

  try {
    const { data } = await axios.post(
      `${MASTER_API_BASE_URL}/admin/generate-key`,
      null,
      {
        params: { register: true },
        headers: { "x-admin-key": MASTER_ADMIN_API_KEY },
      },
    )
    const apiKey = data?.api_key
    if (!apiKey) {
      throw new Error("api_key not returned from master admin")
    }
    runtimeMasterApiKey = apiKey
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCAL_STORAGE_KEY, apiKey)
    }
    return apiKey
  } catch (error) {
    toast.error("Unable to generate master API key")
    throw error
  }
}

const masterClient = axios.create({
  baseURL: MASTER_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

masterClient.interceptors.request.use(async (config) => {
  try {
    const key = await ensureApiKey()
    config.headers = config.headers ?? {}
    config.headers["x-api-key"] = key
    if (import.meta.env.DEV) {
      // Helpful debug to verify key is attached (masked).
      // eslint-disable-next-line no-console
      console.debug("[masterClient] using x-api-key", key ? `${key.slice(0, 4)}****` : "missing")
    }
  } catch (e) {
    // propagate error; downstream will see the 403/401
  }
  return config
})

masterClient.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status
    if (status === 403) {
      toast.error("Master data access denied. Check API key.")
    }
    if (status === 429) {
      toast.error("Rate limit hit. Please wait and retry.")
    }
    return Promise.reject(error)
  },
)

export { masterClient }
