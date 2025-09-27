"use client"

import React from "react"
import { aiService, type AIResponse } from "../services/ai-service"
import { useRBAC } from "../contexts/rbac"

interface UseAIAssistantOptions {
  provider?: "openrouter" | "gemini"
  autoSpeak?: boolean
}

export function useAIAssistant(options: UseAIAssistantOptions = {}) {
  const { user } = useRBAC()
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [provider, setProvider] = React.useState<"openrouter" | "gemini">(options.provider || "openrouter")

  const query = React.useCallback(
    async (question: string): Promise<AIResponse | null> => {
      if (!question.trim()) return null

      setIsLoading(true)
      setError(null)

      try {
        let response: AIResponse

        if (provider === "openrouter") {
          response = await aiService.queryWithOpenRouter(question, user?.id || "anonymous")
        } else {
          response = await aiService.queryWithGemini(question, user?.id || "anonymous")
        }

        // Auto-speak if enabled
        if (options.autoSpeak && "speechSynthesis" in window) {
          const utterance = new SpeechSynthesisUtterance(response.answer)
          utterance.rate = 0.9
          utterance.pitch = 1
          speechSynthesis.speak(utterance)
        }

        return response
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An error occurred"
        setError(errorMessage)
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [provider, user?.id, options.autoSpeak],
  )

  const clearHistory = React.useCallback(() => {
    aiService.clearHistory(user?.id || "anonymous")
  }, [user?.id])

  const getHistory = React.useCallback(() => {
    return aiService.getHistory(user?.id || "anonymous")
  }, [user?.id])

  return {
    query,
    clearHistory,
    getHistory,
    isLoading,
    error,
    provider,
    setProvider,
  }
}
