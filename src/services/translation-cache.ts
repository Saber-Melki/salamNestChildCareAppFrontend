interface CacheEntry {
  text: string
  timestamp: number
  ttl: number
}

interface TranslationCacheData {
  [key: string]: CacheEntry
}

export class TranslationCache {
  private cache: TranslationCacheData = {}
  private readonly defaultTTL = 24 * 60 * 60 * 1000 // 24 hours
  private readonly storageKey = "translation-cache"

  constructor(ttl?: number) {
    if (ttl) {
      this.defaultTTL = ttl
    }
  }

  private generateKey(text: string, targetLang: string, sourceLang = "auto"): string {
    return `${sourceLang}-${targetLang}-${btoa(text)}`
  }

  set(text: string, translatedText: string, targetLang: string, sourceLang = "auto"): void {
    const key = this.generateKey(text, targetLang, sourceLang)
    this.cache[key] = {
      text: translatedText,
      timestamp: Date.now(),
      ttl: this.defaultTTL,
    }
    this.saveToStorage()
  }

  get(text: string, targetLang: string, sourceLang = "auto"): string | null {
    const key = this.generateKey(text, targetLang, sourceLang)
    const entry = this.cache[key]

    if (!entry) {
      return null
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      delete this.cache[key]
      this.saveToStorage()
      return null
    }

    return entry.text
  }

  clear(): void {
    this.cache = {}
    this.saveToStorage()
  }

  clearExpired(): void {
    const now = Date.now()
    let hasExpired = false

    for (const [key, entry] of Object.entries(this.cache)) {
      if (now - entry.timestamp > entry.ttl) {
        delete this.cache[key]
        hasExpired = true
      }
    }

    if (hasExpired) {
      this.saveToStorage()
    }
  }

  saveToStorage(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.cache))
    } catch (error) {
      console.warn("Failed to save translation cache to localStorage:", error)
    }
  }

  loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.storageKey)
      if (stored) {
        this.cache = JSON.parse(stored)
        this.clearExpired() // Clean up expired entries on load
      }
    } catch (error) {
      console.warn("Failed to load translation cache from localStorage:", error)
      this.cache = {}
    }
  }

  getStats(): { totalEntries: number; cacheSize: string } {
    const totalEntries = Object.keys(this.cache).length
    const cacheSize = new Blob([JSON.stringify(this.cache)]).size
    const cacheSizeFormatted = cacheSize > 1024 ? `${(cacheSize / 1024).toFixed(2)} KB` : `${cacheSize} bytes`

    return {
      totalEntries,
      cacheSize: cacheSizeFormatted,
    }
  }
}
