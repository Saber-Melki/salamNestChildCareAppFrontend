"use client"

import { useState, useEffect } from "react"
import { useI18n } from "../contexts/i18n"

export function useAsyncTranslation(text: string) {
  const { tAsync, language } = useI18n()
  const [translatedText, setTranslatedText] = useState(text)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    let isCancelled = false

    const translateText = async () => {
      setIsLoading(true)
      try {
        const result = await tAsync(text)
        if (!isCancelled) {
          setTranslatedText(result)
        }
      } catch (error) {
        console.error("Translation error:", error)
        if (!isCancelled) {
          setTranslatedText(text) // Fallback to original
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false)
        }
      }
    }

    translateText()

    return () => {
      isCancelled = true
    }
  }, [text, tAsync, language])

  return { translatedText, isLoading }
}
