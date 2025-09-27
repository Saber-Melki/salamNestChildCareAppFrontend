// Environment configuration for AI services
export const config = {
  openRouter: {
    apiKey: process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || "",
    baseUrl: "https://openrouter.ai/api/v1",
  },
  gemini: {
    apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || "",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta",
  },
  ai: {
    defaultProvider: "openrouter" as "openrouter" | "gemini",
    maxTokens: 1000,
    temperature: 0.7,
    maxHistoryLength: 10,
  },
}

// Validation function to check if API keys are configured
export function validateApiKeys(): { isValid: boolean; missing: string[] } {
  const missing: string[] = []

  if (!config.openRouter.apiKey) {
    missing.push("NEXT_PUBLIC_OPENROUTER_API_KEY")
  }

  if (!config.gemini.apiKey) {
    missing.push("NEXT_PUBLIC_GEMINI_API_KEY")
  }

  return {
    isValid: missing.length === 0,
    missing,
  }
}
