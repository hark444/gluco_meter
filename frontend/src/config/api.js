const deriveDefaultApiBaseUrl = () => {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}/api`
  }

  return '/api'
}

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || deriveDefaultApiBaseUrl()
export const TOKEN_STORAGE_KEY = 'gluco_meter_token'
