// Environment configuration for AI services
export const ENV_CONFIG = {
  // OpenRouter API configuration
  OPENROUTER_API_KEY: process.env.REACT_APP_OPENROUTER_API_KEY || "",
  OPENROUTER_BASE_URL: "https://openrouter.ai/api/v1",

  // Gemini API configuration
  GEMINI_API_KEY: process.env.REACT_APP_GEMINI_API_KEY || "",
  GEMINI_BASE_URL: "https://generativelanguage.googleapis.com/v1beta",

  // Default AI settings
  DEFAULT_MODEL: "gpt-3.5-turbo",
  MAX_TOKENS: 1000,
  TEMPERATURE: 0.7,

  // Rate limiting
  MAX_REQUESTS_PER_MINUTE: 20,
  REQUEST_TIMEOUT: 30000, // 30 seconds

  // Feature flags
  ENABLE_VOICE_SYNTHESIS: true,
  ENABLE_CONVERSATION_HISTORY: true,
  ENABLE_ANALYTICS: true,

  // Email configuration
  EMAIL_CONFIG: {
    resend: {
      apiKey: process.env.VITE_RESEND_API_KEY || "re_QjyaBsq1_K9vqqApkV1nsap2c3ZoNuwXf",
      fromEmail: process.env.VITE_FROM_EMAIL || "onboarding@resend.dev",
    },
    sendgrid: {
      apiKey: process.env.VITE_SENDGRID_API_KEY || "",
    },
  },
} as const

// Validate required environment variables
export function validateEnvConfig(): { isValid: boolean; missingVars: string[] } {
  const requiredVars = ["REACT_APP_OPENROUTER_API_KEY", "REACT_APP_GEMINI_API_KEY"]

  const missingVars = requiredVars.filter((varName) => !process.env[varName])

  return {
    isValid: missingVars.length === 0,
    missingVars,
  }
}

// Validation for email configuration
export function validateEmailConfig() {
  if (!ENV_CONFIG.EMAIL_CONFIG.resend.apiKey) {
    console.warn("⚠️  VITE_RESEND_API_KEY is not set. Email sending will not work.")
    return false
  }
  return true
}

// Get API configuration based on provider
export function getAPIConfig(provider: "openrouter" | "gemini") {
  switch (provider) {
    case "openrouter":
      return {
        apiKey: ENV_CONFIG.OPENROUTER_API_KEY,
        baseUrl: ENV_CONFIG.OPENROUTER_BASE_URL,
        headers: {
          Authorization: `Bearer ${ENV_CONFIG.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": window.location.origin,
          "X-Title": "Childcare Management System",
        },
      }
    case "gemini":
      return {
        apiKey: ENV_CONFIG.GEMINI_API_KEY,
        baseUrl: ENV_CONFIG.GEMINI_BASE_URL,
        headers: {
          "Content-Type": "application/json",
        },
      }
    default:
      throw new Error(`Unsupported AI provider: ${provider}`)
  }
}
