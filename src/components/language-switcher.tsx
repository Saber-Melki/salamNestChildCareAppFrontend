"use client"

import React from "react"
import { Globe, Check } from "lucide-react"
import { Button } from "./ui/button"
import { useI18n } from "../contexts/i18n"
import { cn } from "../lib/utils"

export function LanguageSwitcher() {
  const { language, setLanguage, isRTL } = useI18n()
  const [isOpen, setIsOpen] = React.useState(false)

  const languages = [
    { code: "en", name: "English", nativeName: "English" },
    { code: "ar", name: "Arabic", nativeName: "العربية" },
  ]

  const currentLanguage = languages.find((lang) => lang.code === language)

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className={cn("gap-2", isRTL && "flex-row-reverse")}
      >
        <Globe className="h-4 w-4" />
        <span className="hidden sm:inline">{currentLanguage?.nativeName}</span>
      </Button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div
            className={cn(
              "absolute top-full mt-1 z-20 min-w-[150px] rounded-md border bg-background shadow-lg",
              isRTL ? "left-0" : "right-0",
            )}
          >
            <div className="p-1">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code as "en" | "ar")
                    setIsOpen(false)
                  }}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm hover:bg-accent",
                    language === lang.code && "bg-accent",
                    isRTL && "flex-row-reverse text-right",
                  )}
                >
                  <span className="flex-1">{lang.nativeName}</span>
                  {language === lang.code && <Check className="h-4 w-4" />}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
