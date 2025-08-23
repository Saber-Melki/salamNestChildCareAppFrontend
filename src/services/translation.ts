export type TranslationProvider = "google" | "microsoft" | "static"

export interface TranslationConfig {
  apiKey?: string
  region?: string
}

export interface TranslationService {
  translate(text: string, targetLang: string, sourceLang?: string): Promise<string>
  translateBatch(texts: string[], targetLang: string, sourceLang?: string): Promise<string[]>
  detectLanguage(text: string): Promise<string>
}

class GoogleTranslateService implements TranslationService {
  private apiKey: string

  constructor(config: TranslationConfig) {
    if (!config.apiKey) {
      throw new Error("Google Translate API key is required")
    }
    this.apiKey = config.apiKey
  }

  async translate(text: string, targetLang: string, sourceLang = "auto"): Promise<string> {
    try {
      const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${this.apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          q: text,
          target: targetLang,
          source: sourceLang === "auto" ? undefined : sourceLang,
          format: "text",
        }),
      })

      if (!response.ok) {
        throw new Error(`Google Translate API error: ${response.statusText}`)
      }

      const data = await response.json()
      return data.data.translations[0].translatedText
    } catch (error) {
      console.error("Google Translate error:", error)
      throw error
    }
  }

  async translateBatch(texts: string[], targetLang: string, sourceLang = "auto"): Promise<string[]> {
    try {
      const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${this.apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          q: texts,
          target: targetLang,
          source: sourceLang === "auto" ? undefined : sourceLang,
          format: "text",
        }),
      })

      if (!response.ok) {
        throw new Error(`Google Translate API error: ${response.statusText}`)
      }

      const data = await response.json()
      return data.data.translations.map((t: any) => t.translatedText)
    } catch (error) {
      console.error("Google Translate batch error:", error)
      throw error
    }
  }

  async detectLanguage(text: string): Promise<string> {
    try {
      const response = await fetch(
        `https://translation.googleapis.com/language/translate/v2/detect?key=${this.apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            q: text,
          }),
        },
      )

      if (!response.ok) {
        throw new Error(`Google Translate API error: ${response.statusText}`)
      }

      const data = await response.json()
      return data.data.detections[0][0].language
    } catch (error) {
      console.error("Google Translate detect error:", error)
      throw error
    }
  }
}

class MicrosoftTranslatorService implements TranslationService {
  private apiKey: string
  private region: string

  constructor(config: TranslationConfig) {
    if (!config.apiKey || !config.region) {
      throw new Error("Microsoft Translator API key and region are required")
    }
    this.apiKey = config.apiKey
    this.region = config.region
  }

  async translate(text: string, targetLang: string, sourceLang?: string): Promise<string> {
    try {
      const params = new URLSearchParams({
        "api-version": "3.0",
        to: targetLang,
      })

      if (sourceLang && sourceLang !== "auto") {
        params.append("from", sourceLang)
      }

      const response = await fetch(`https://api.cognitive.microsofttranslator.com/translate?${params}`, {
        method: "POST",
        headers: {
          "Ocp-Apim-Subscription-Key": this.apiKey,
          "Ocp-Apim-Subscription-Region": this.region,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([{ text }]),
      })

      if (!response.ok) {
        throw new Error(`Microsoft Translator API error: ${response.statusText}`)
      }

      const data = await response.json()
      return data[0].translations[0].text
    } catch (error) {
      console.error("Microsoft Translator error:", error)
      throw error
    }
  }

  async translateBatch(texts: string[], targetLang: string, sourceLang?: string): Promise<string[]> {
    try {
      const params = new URLSearchParams({
        "api-version": "3.0",
        to: targetLang,
      })

      if (sourceLang && sourceLang !== "auto") {
        params.append("from", sourceLang)
      }

      const body = texts.map((text) => ({ text }))

      const response = await fetch(`https://api.cognitive.microsofttranslator.com/translate?${params}`, {
        method: "POST",
        headers: {
          "Ocp-Apim-Subscription-Key": this.apiKey,
          "Ocp-Apim-Subscription-Region": this.region,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        throw new Error(`Microsoft Translator API error: ${response.statusText}`)
      }

      const data = await response.json()
      return data.map((item: any) => item.translations[0].text)
    } catch (error) {
      console.error("Microsoft Translator batch error:", error)
      throw error
    }
  }

  async detectLanguage(text: string): Promise<string> {
    try {
      const response = await fetch("https://api.cognitive.microsofttranslator.com/detect?api-version=3.0", {
        method: "POST",
        headers: {
          "Ocp-Apim-Subscription-Key": this.apiKey,
          "Ocp-Apim-Subscription-Region": this.region,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([{ text }]),
      })

      if (!response.ok) {
        throw new Error(`Microsoft Translator API error: ${response.statusText}`)
      }

      const data = await response.json()
      return data[0].language
    } catch (error) {
      console.error("Microsoft Translator detect error:", error)
      throw error
    }
  }
}

class StaticTranslationService implements TranslationService {
  async translate(text: string, targetLang: string): Promise<string> {
    // Return original text for static service
    return text
  }

  async translateBatch(texts: string[], targetLang: string): Promise<string[]> {
    // Return original texts for static service
    return texts
  }

  async detectLanguage(text: string): Promise<string> {
    // Simple language detection based on character patterns
    const arabicPattern = /[\u0600-\u06FF]/
    return arabicPattern.test(text) ? "ar" : "en"
  }
}

export class TranslationServiceFactory {
  static create(provider: TranslationProvider, config: TranslationConfig): TranslationService {
    switch (provider) {
      case "google":
        return new GoogleTranslateService(config)
      case "microsoft":
        return new MicrosoftTranslatorService(config)
      case "static":
      default:
        return new StaticTranslationService()
    }
  }
}
