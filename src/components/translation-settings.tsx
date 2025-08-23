"use client"

import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { useI18n } from "../contexts/i18n"
import type { TranslationProvider } from "../services/translation"
import { Settings, Globe, Shield, Database } from "lucide-react"
import { cn } from "../lib/utils"

export function TranslationSettings() {
  const { translationProvider, setTranslationProvider, isRTL } = useI18n()

  const providers: Array<{
    id: TranslationProvider
    name: string
    description: string
    icon: React.ReactNode
    features: string[]
    requiresApi: boolean
  }> = [
    {
      id: "static",
      name: "Static Translations",
      description: "Pre-defined translations for common UI elements",
      icon: <Database className="h-5 w-5" />,
      features: ["Fast", "Offline", "Limited vocabulary", "No API costs"],
      requiresApi: false,
    },
    {
      id: "google",
      name: "Google Translate",
      description: "Google's powerful translation API",
      icon: <Globe className="h-5 w-5" />,
      features: ["High accuracy", "Large vocabulary", "Auto-detection", "Requires API key"],
      requiresApi: true,
    },
    {
      id: "microsoft",
      name: "Microsoft Translator",
      description: "Microsoft's Azure Translator service",
      icon: <Shield className="h-5 w-5" />,
      features: ["Enterprise grade", "Custom models", "Real-time", "Requires API key"],
      requiresApi: true,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
          <Settings className="h-5 w-5" />
          Translation Settings
        </CardTitle>
        <CardDescription>
          Choose your preferred translation service. API-based services provide better translations but require API
          keys.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          {providers.map((provider) => (
            <div
              key={provider.id}
              className={cn(
                "relative rounded-lg border p-4 cursor-pointer transition-colors",
                translationProvider === provider.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:bg-accent/50",
              )}
              onClick={() => setTranslationProvider(provider.id)}
            >
              <div className={cn("flex items-start gap-3", isRTL && "flex-row-reverse")}>
                <div className="flex-shrink-0 mt-1">{provider.icon}</div>
                <div className={cn("flex-1", isRTL && "text-right")}>
                  <div className={cn("flex items-center gap-2 mb-1", isRTL && "flex-row-reverse")}>
                    <h3 className="font-medium">{provider.name}</h3>
                    {provider.requiresApi && (
                      <span className="text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded">API Required</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{provider.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {provider.features.map((feature) => (
                      <span
                        key={feature}
                        className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <div
                    className={cn(
                      "w-4 h-4 rounded-full border-2",
                      translationProvider === provider.id ? "border-primary bg-primary" : "border-muted-foreground",
                    )}
                  >
                    {translationProvider === provider.id && (
                      <div className="w-full h-full rounded-full bg-white scale-50" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {translationProvider !== "static" && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">API Configuration Required</h4>
            <p className="text-sm text-blue-800 mb-3">
              To use {providers.find((p) => p.id === translationProvider)?.name}, you need to add your API key to the
              environment variables:
            </p>
            <div className="bg-blue-100 p-2 rounded font-mono text-sm">
              {translationProvider === "google" && "REACT_APP_GOOGLE_TRANSLATE_API_KEY=your_api_key"}
              {translationProvider === "microsoft" && (
                <>
                  REACT_APP_MICROSOFT_TRANSLATOR_KEY=your_api_key
                  <br />
                  REACT_APP_MICROSOFT_TRANSLATOR_REGION=your_region
                </>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
