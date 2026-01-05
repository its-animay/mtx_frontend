export type DeviceInfoPayload = {
  device_type: "web" | "ios" | "android"
  device_name: string
  device_id?: string
}

const detectBrowser = (ua: string) => {
  if (ua.includes("Edg")) return "Edge"
  if (ua.includes("Chrome")) return "Chrome"
  if (ua.includes("Firefox")) return "Firefox"
  if (ua.includes("Safari")) return "Safari"
  return "Web"
}

export function getDeviceInfo(): DeviceInfoPayload {
  if (typeof window === "undefined") {
    return { device_type: "web", device_name: "Web" }
  }
  const ua = navigator.userAgent
  const browser = detectBrowser(ua)
  const platform = navigator.platform || "Web"

  return {
    device_type: "web",
    device_name: `${browser} on ${platform}`,
  }
}
