export const env = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://localhost:7001',
  SIGNALR_HUB_URL: import.meta.env.VITE_SIGNALR_HUB_URL || 'https://localhost:7001/chatHub',
  GOOGLE_MAPS_API_KEY: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
} as const

// Validate required environment variables (none required for now since we use OpenStreetMap)
const requiredEnvVars = [] as const

export const validateEnv = () => {
  const missing = requiredEnvVars.filter(key => !env[key])
  
  if (missing.length > 0) {
    console.warn('Missing environment variables:', missing)
    console.warn('Some features may not work correctly. Please check your .env.local file.')
  }
}

// Call validation on module load
validateEnv()