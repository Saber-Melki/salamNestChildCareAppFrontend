"use client"

import React from "react"
import { type TranslationService, TranslationServiceFactory, type TranslationProvider } from "../services/translation"
import { TranslationCache } from "../services/translation-cache"

type Language = "en" | "ar"

type Translations = {
  [key: string]: {
    en: string
    ar: string
  }
}

const translations: Translations = {
  // Navigation
  "nav.dashboard": {
    en: "Dashboard",
    ar: "لوحة التحكم",
  },
  "nav.attendance": {
    en: "Attendance",
    ar: "الحضور",
  },
  "nav.children": {
    en: "Children",
    ar: "الأطفال",
  },
  "nav.health": {
    en: "Health",
    ar: "الصحة",
  },
  "nav.billing": {
    en: "Billing",
    ar: "الفواتير",
  },
  "nav.scheduling": {
    en: "Scheduling",
    ar: "الجدولة",
  },
  "nav.messages": {
    en: "Messages",
    ar: "الرسائل",
  },
  "nav.media": {
    en: "Media",
    ar: "الوسائط",
  },
  "nav.reports": {
    en: "Reports",
    ar: "التقارير",
  },
  "nav.calendar": {
    en: "Calendar",
    ar: "التقويم",
  },
  "nav.settings": {
    en: "Settings",
    ar: "الإعدادات",
  },
  "nav.staff": {
    en: "Staff",
    ar: "الموظفون",
  },

  // Common
  "common.save": {
    en: "Save",
    ar: "حفظ",
  },
  "common.cancel": {
    en: "Cancel",
    ar: "إلغاء",
  },
  "common.delete": {
    en: "Delete",
    ar: "حذف",
  },
  "common.edit": {
    en: "Edit",
    ar: "تعديل",
  },
  "common.add": {
    en: "Add",
    ar: "إضافة",
  },
  "common.search": {
    en: "Search",
    ar: "بحث",
  },
  "common.loading": {
    en: "Loading...",
    ar: "جاري التحميل...",
  },
  "common.yes": {
    en: "Yes",
    ar: "نعم",
  },
  "common.no": {
    en: "No",
    ar: "لا",
  },
  "common.close": {
    en: "Close",
    ar: "إغلاق",
  },
  "common.submit": {
    en: "Submit",
    ar: "إرسال",
  },
  "common.update": {
    en: "Update",
    ar: "تحديث",
  },
  "common.create": {
    en: "Create",
    ar: "إنشاء",
  },

  // Dashboard
  "dashboard.title": {
    en: "Dashboard Overview",
    ar: "نظرة عامة على لوحة التحكم",
  },
  "dashboard.welcome": {
    en: "Welcome back",
    ar: "مرحباً بعودتك",
  },
  "dashboard.totalChildren": {
    en: "Total Children",
    ar: "إجمالي الأطفال",
  },
  "dashboard.presentToday": {
    en: "Present Today",
    ar: "الحاضرون اليوم",
  },
  "dashboard.staffOnDuty": {
    en: "Staff on Duty",
    ar: "الموظفون المناوبون",
  },
  "dashboard.monthlyRevenue": {
    en: "Monthly Revenue",
    ar: "الإيرادات الشهرية",
  },

  // Children
  "children.title": {
    en: "Child Profiles",
    ar: "ملفات الأطفال",
  },
  "children.description": {
    en: "Family details, authorized pickups, and medical notes.",
    ar: "تفاصيل العائلة والأشخاص المخولين بالاستلام والملاحظات الطبية.",
  },
  "children.addChild": {
    en: "Add Child",
    ar: "إضافة طفل",
  },
  "children.searchPlaceholder": {
    en: "Search children...",
    ar: "البحث عن الأطفال...",
  },
  "children.firstName": {
    en: "First Name",
    ar: "الاسم الأول",
  },
  "children.lastName": {
    en: "Last Name",
    ar: "اسم العائلة",
  },
  "children.age": {
    en: "Age",
    ar: "العمر",
  },
  "children.group": {
    en: "Group",
    ar: "المجموعة",
  },
  "children.family": {
    en: "Family",
    ar: "العائلة",
  },
  "children.allergies": {
    en: "Allergies",
    ar: "الحساسية",
  },
  "children.emergencyContact": {
    en: "Emergency Contact",
    ar: "جهة الاتصال الطارئة",
  },
  "children.parentEmail": {
    en: "Parent Email",
    ar: "بريد الوالدين الإلكتروني",
  },

  // Staff
  "staff.title": {
    en: "Staff Management",
    ar: "إدارة الموظفين",
  },
  "staff.description": {
    en: "Manage staff members, roles, and employment details.",
    ar: "إدارة الموظفين والأدوار وتفاصيل التوظيف.",
  },
  "staff.addStaff": {
    en: "Add Staff",
    ar: "إضافة موظف",
  },
  "staff.totalStaff": {
    en: "Total Staff",
    ar: "إجمالي الموظفين",
  },
  "staff.activeStaff": {
    en: "Active Staff",
    ar: "الموظفون النشطون",
  },
  "staff.onLeave": {
    en: "On Leave",
    ar: "في إجازة",
  },
  "staff.weeklyPayroll": {
    en: "Weekly Payroll",
    ar: "كشف الراتب الأسبوعي",
  },
  "staff.name": {
    en: "Name",
    ar: "الاسم",
  },
  "staff.role": {
    en: "Role",
    ar: "الدور",
  },
  "staff.status": {
    en: "Status",
    ar: "الحالة",
  },
  "staff.hireDate": {
    en: "Hire Date",
    ar: "تاريخ التوظيف",
  },
  "staff.contact": {
    en: "Contact",
    ar: "الاتصال",
  },

  // Calendar
  "calendar.title": {
    en: "Calendar & Scheduling",
    ar: "التقويم والجدولة",
  },
  "calendar.description": {
    en: "Events, closures, field trips, and parent bookings.",
    ar: "الأحداث والإغلاقات والرحلات وحجوزات الوالدين.",
  },
  "calendar.addEvent": {
    en: "Add Event",
    ar: "إضافة حدث",
  },
  "calendar.bookMeeting": {
    en: "Book a Meeting",
    ar: "حجز اجتماع",
  },
  "calendar.eventTitle": {
    en: "Event Title",
    ar: "عنوان الحدث",
  },
  "calendar.eventType": {
    en: "Event Type",
    ar: "نوع الحدث",
  },
  "calendar.date": {
    en: "Date",
    ar: "التاريخ",
  },
  "calendar.time": {
    en: "Time",
    ar: "الوقت",
  },
  "calendar.location": {
    en: "Location",
    ar: "الموقع",
  },
  "calendar.desc": {
    en: "Description",
    ar: "الوصف",
  },

  // Messages
  "messages.title": {
    en: "Messages & Communication",
    ar: "الرسائل والتواصل",
  },
  "messages.description": {
    en: "Secure two-way communication with families.",
    ar: "تواصل آمن ثنائي الاتجاه مع العائلات.",
  },
  "messages.conversations": {
    en: "Conversations",
    ar: "المحادثات",
  },
  "messages.searchConversations": {
    en: "Search conversations...",
    ar: "البحث في المحادثات...",
  },
  "messages.typeMessage": {
    en: "Type your message...",
    ar: "اكتب رسالتك...",
  },
  "messages.send": {
    en: "Send",
    ar: "إرسال",
  },

  // Settings
  "settings.title": {
    en: "Security & Compliance",
    ar: "الأمان والامتثال",
  },
  "settings.branding": {
    en: "Branding",
    ar: "العلامة التجارية",
  },
  "settings.brandingDescription": {
    en: "White-label settings per tenant.",
    ar: "إعدادات العلامة البيضاء لكل مستأجر.",
  },
  "settings.language": {
    en: "Language",
    ar: "اللغة",
  },
  "settings.selectLanguage": {
    en: "Select Language",
    ar: "اختر اللغة",
  },
  "settings.english": {
    en: "English",
    ar: "الإنجليزية",
  },
  "settings.arabic": {
    en: "Arabic",
    ar: "العربية",
  },

  // Auth
  "auth.welcomeBack": {
    en: "Welcome back",
    ar: "مرحباً بعودتك",
  },
  "auth.signInToDashboard": {
    en: "Sign in to your childcare dashboard",
    ar: "تسجيل الدخول إلى لوحة تحكم الحضانة",
  },
  "auth.email": {
    en: "Enter your email",
    ar: "أدخل بريدك الإلكتروني",
  },
  "auth.password": {
    en: "Enter your password",
    ar: "أدخل كلمة المرور",
  },
  "auth.selectRole": {
    en: "Select your role",
    ar: "اختر دورك",
  },
  "auth.admin": {
    en: "Admin",
    ar: "مدير",
  },
  "auth.staff": {
    en: "Staff",
    ar: "موظف",
  },
  "auth.parent": {
    en: "Parent",
    ar: "والد",
  },
  "auth.signIn": {
    en: "Sign in to dashboard",
    ar: "تسجيل الدخول إلى لوحة التحكم",
  },
  "auth.signingIn": {
    en: "Signing in...",
    ar: "جاري تسجيل الدخول...",
  },

  // Roles
  "role.admin": {
    en: "Admin",
    ar: "مدير",
  },
  "role.staff": {
    en: "Staff",
    ar: "موظف",
  },
  "role.parent": {
    en: "Parent",
    ar: "والد",
  },
  "role.director": {
    en: "Director",
    ar: "مدير",
  },
  "role.teacher": {
    en: "Teacher",
    ar: "معلم",
  },
  "role.assistant": {
    en: "Assistant",
    ar: "مساعد",
  },
  "role.substitute": {
    en: "Substitute",
    ar: "بديل",
  },

  // Status
  "status.active": {
    en: "Active",
    ar: "نشط",
  },
  "status.inactive": {
    en: "Inactive",
    ar: "غير نشط",
  },
  "status.onLeave": {
    en: "On Leave",
    ar: "في إجازة",
  },
  "status.pending": {
    en: "Pending",
    ar: "معلق",
  },
  "status.confirmed": {
    en: "Confirmed",
    ar: "مؤكد",
  },
  "status.cancelled": {
    en: "Cancelled",
    ar: "ملغي",
  },

  // Days of week
  "day.sunday": {
    en: "Sunday",
    ar: "الأحد",
  },
  "day.monday": {
    en: "Monday",
    ar: "الاثنين",
  },
  "day.tuesday": {
    en: "Tuesday",
    ar: "الثلاثاء",
  },
  "day.wednesday": {
    en: "Wednesday",
    ar: "الأربعاء",
  },
  "day.thursday": {
    en: "Thursday",
    ar: "الخميس",
  },
  "day.friday": {
    en: "Friday",
    ar: "الجمعة",
  },
  "day.saturday": {
    en: "Saturday",
    ar: "السبت",
  },

  // Months
  "month.january": {
    en: "January",
    ar: "يناير",
  },
  "month.february": {
    en: "February",
    ar: "فبراير",
  },
  "month.march": {
    en: "March",
    ar: "مارس",
  },
  "month.april": {
    en: "April",
    ar: "أبريل",
  },
  "month.may": {
    en: "May",
    ar: "مايو",
  },
  "month.june": {
    en: "June",
    ar: "يونيو",
  },
  "month.july": {
    en: "July",
    ar: "يوليو",
  },
  "month.august": {
    en: "August",
    ar: "أغسطس",
  },
  "month.september": {
    en: "September",
    ar: "سبتمبر",
  },
  "month.october": {
    en: "October",
    ar: "أكتوبر",
  },
  "month.november": {
    en: "November",
    ar: "نوفمبر",
  },
  "month.december": {
    en: "December",
    ar: "ديسمبر",
  },
}

type I18nContextType = {
  language: Language
  setLanguage: (lang: Language) => void
  t: (text: string) => string
  tAsync: (text: string) => Promise<string>
  isRTL: boolean
  isLoading: boolean
  translationProvider: TranslationProvider
  setTranslationProvider: (provider: TranslationProvider) => void
}

const I18nContext = React.createContext<I18nContextType | null>(null)

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = React.useState<Language>(() => {
    const saved = localStorage.getItem("language")
    return (saved as Language) || "en"
  })

  const [translationProvider, setTranslationProvider] = React.useState<TranslationProvider>(() => {
    const saved = localStorage.getItem("translationProvider")
    return (saved as TranslationProvider) || "static"
  })

  const [isLoading, setIsLoading] = React.useState(false)
  const [translationService, setTranslationService] = React.useState<TranslationService>()
  const [translationCache] = React.useState(() => new TranslationCache())

  // Initialize translation service
  React.useEffect(() => {
    const config = {
      // Add your API keys here
      apiKey: process.env.REACT_APP_GOOGLE_TRANSLATE_API_KEY || process.env.REACT_APP_MICROSOFT_TRANSLATOR_KEY,
      region: process.env.REACT_APP_MICROSOFT_TRANSLATOR_REGION,
    }

    const service = TranslationServiceFactory.create(translationProvider, config)
    setTranslationService(service)
    translationCache.loadFromStorage()
  }, [translationProvider, translationCache])

  React.useEffect(() => {
    localStorage.setItem("language", language)
    localStorage.setItem("translationProvider", translationProvider)

    // Update document direction and language
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr"
    document.documentElement.lang = language

    // Update body class for RTL styling
    if (language === "ar") {
      document.body.classList.add("rtl")
    } else {
      document.body.classList.remove("rtl")
    }
  }, [language, translationProvider])

  // Synchronous translation (uses cache or returns original text)
  const t = React.useCallback(
    (text: string): string => {
      if (language === "en") return text

      // Check cache first
      const cached = translationCache.get(text, language)
      if (cached) return cached

      // Return original text if no cache (will be translated async)
      return text
    },
    [language, translationCache],
  )

  // Asynchronous translation (uses API)
  const tAsync = React.useCallback(
    async (text: string): Promise<string> => {
      if (language === "en") return text
      if (!translationService) return text

      // Check cache first
      const cached = translationCache.get(text, language)
      if (cached) return cached

      try {
        setIsLoading(true)
        const translated = await translationService.translate(text, language, "en")

        // Cache the result
        translationCache.set(text, translated, language, "en")

        return translated
      } catch (error) {
        console.error("Translation error:", error)
        return text
      } finally {
        setIsLoading(false)
      }
    },
    [language, translationService, translationCache],
  )

  const isRTL = language === "ar"

  return (
    <I18nContext.Provider
      value={{
        language,
        setLanguage,
        t,
        tAsync,
        isRTL,
        isLoading,
        translationProvider,
        setTranslationProvider,
      }}
    >
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = React.useContext(I18nContext)
  if (!context) {
    throw new Error("useI18n must be used within I18nProvider")
  }
  return context
}
