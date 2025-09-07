"use client"

import { useState, useEffect } from "react"
import { TranslationServiceFactory } from "../services/translation"

export function useTranslation() {
  const [currentLang, setCurrentLang] = useState<string>("en")
  const [translationService, setTranslationService] = useState(() => {
    const googleApiKey = process.env.REACT_APP_GOOGLE_TRANSLATE_API_KEY
    const microsoftKey = process.env.REACT_APP_MICROSOFT_TRANSLATOR_KEY
    const microsoftRegion = process.env.REACT_APP_MICROSOFT_TRANSLATOR_REGION

    if (googleApiKey) {
      return TranslationServiceFactory.create("google", { apiKey: googleApiKey })
    } else if (microsoftKey && microsoftRegion) {
      return TranslationServiceFactory.create("microsoft", {
        apiKey: microsoftKey,
        region: microsoftRegion,
      })
    } else {
      return TranslationServiceFactory.create("static", {})
    }
  })

  const translate = async (text: string, targetLang: string = currentLang) => {
    try {
      return await translationService.translate(text, targetLang)
    } catch (error) {
      console.error("Translation failed:", error)
      return text // Return original text on error
    }
  }

  const switchLanguage = (lang: string) => {
    setCurrentLang(lang)
    localStorage.setItem("preferred-language", lang)
  }

  useEffect(() => {
    const savedLang = localStorage.getItem("preferred-language")
    if (savedLang) {
      setCurrentLang(savedLang)
    }
  }, [])

  return {
    currentLang,
    translate,
    switchLanguage,
    isTranslationAvailable: translationService.constructor.name !== "StaticTranslationService",
  }
}
