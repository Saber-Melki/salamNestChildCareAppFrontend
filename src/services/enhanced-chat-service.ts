import { dataIntegrationService } from "./data-integration-service"
import type { ChatResponse } from "./chat-service"

const OPENROUTER_API_KEY = "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"
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"
const GEMINI_MODEL = "google/gemini-2.0-flash-lite-001"

interface QueryIntent {
  entity: "children" | "attendance" | "billing" | "staff" | "health" | "schedule" | "media" | "report"
  type: "list" | "analyze" | "generate"
  filters?: Record<string, any>
  timeframe?: string
}

interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

class EnhancedChatService {
  private conversationHistory: Map<string, ChatMessage[]> = new Map()

  private determineIntent(prompt: string): QueryIntent | null {
    const lowerQuery = prompt.toLowerCase()

    if (lowerQuery.includes("report") || lowerQuery.includes("comprehensive") || lowerQuery.includes("daily report")) {
      return { entity: "report", type: "generate" }
    }
    if (lowerQuery.includes("health") || lowerQuery.includes("medication") || lowerQuery.includes("allergy")) {
      return { entity: "health", type: "analyze" }
    }
    if (
      lowerQuery.includes("calendar") ||
      lowerQuery.includes("schedule") ||
      lowerQuery.includes("booking") ||
      lowerQuery.includes("tour")
    ) {
      return { entity: "schedule", type: "analyze" }
    }
    if (
      lowerQuery.includes("media") ||
      lowerQuery.includes("photo") ||
      lowerQuery.includes("picture") ||
      lowerQuery.includes("video")
    ) {
      return { entity: "media", type: "analyze" }
    }
    if (lowerQuery.includes("staff") || lowerQuery.includes("teacher") || lowerQuery.includes("shift")) {
      return { entity: "staff", type: "analyze" }
    }
    if (lowerQuery.includes("children") || lowerQuery.includes("enrollment") || lowerQuery.includes("student")) {
      return { entity: "children", type: "analyze" }
    }
    if (lowerQuery.includes("attendance")) {
      return { entity: "attendance", type: "analyze", timeframe: "today" }
    }
    if (
      lowerQuery.includes("billing") ||
      lowerQuery.includes("payment") ||
      lowerQuery.includes("invoice") ||
      lowerQuery.includes("revenue") ||
      lowerQuery.includes("financial")
    ) {
      return { entity: "billing", type: "analyze" }
    }

    return null
  }

  private formatResponse(intent: QueryIntent, result: any): Omit<ChatResponse, "timestamp"> & { reportData?: any } {
    const { data } = result

    switch (intent.entity) {
      case "report":
        return {
          answer: `Here is the comprehensive daily report you requested:

### 📈 **Overall Summary**
- **${data.totalChildren}** children enrolled
- **${data.presentToday} / ${data.totalAttendanceRecords}** children present today
- **$${data.totalRevenue.toLocaleString()}** in total revenue this month
- **${data.totalStaff}** total staff members
- **${data.highPriorityAlerts}** high-priority health alerts
- **${data.upcomingEvents}** upcoming events on the schedule

### 📊 **Today's Attendance**
- **Present:** ${data.presentToday}
- **Absent:** ${data.absentToday}

### ❤️ **Health & Safety**
- **High-Severity Alerts:** ${data.highPriorityAlerts}
- **Medications Due Today:** ${data.medicationsDue}

### 💰 **Monthly Billing Overview**
- **Total Revenue:** $${data.totalRevenue.toLocaleString()}
- **Outstanding Invoices:** ${data.outstandingInvoices}

### 🗓️ **Schedule**
- **Today's Events:** ${data.todayEventsCount}
- **Upcoming Tours:** ${data.upcomingTours}

**You can download this report as a beautifully formatted PDF using the download button below.**`,
          confidence: 0.98,
          sources: ["Children API", "Attendance API", "Billing API", "Staff API", "Health API", "Schedule API"],
          suggestions: [
            "Email this report to administration",
            "Show me the high-priority health alerts",
            "Which classrooms are fully staffed today?",
          ],
          reportData: data,
        }

      case "health":
        return {
          answer: `Here is a summary of the health records:

❤️ **Health Overview:**
- **${data.totalRecords}** total health records on file
- **${data.highPriority}** high-priority alerts (severe allergies, critical medications)
- **${data.allergies}** children with allergies noted
- **${data.medications}** children requiring medication

Would you like to see a specific child's record or a list of all high-priority alerts?`,
          confidence: 0.95,
          sources: ["Health API"],
          suggestions: [
            "List all high-severity health alerts",
            "Which children have nut allergies?",
            "Show me today's medication schedule",
          ],
        }

      case "attendance":
        return {
          answer: `📊 **Today's Attendance Summary:**
- **${data.present}** children are present
- **${data.absent}** children are absent
- **${data.total}** total attendance records for today

Would you like me to generate a detailed weekly attendance report?`,
          confidence: 0.96,
          sources: ["Attendance API"],
          suggestions: [
            "Show attendance by classroom",
            "List children with frequent absences",
            "Generate weekly report",
          ],
        }

      case "billing":
        return {
          answer: `💰 **Billing Summary:**
- **$${data.revenue.toLocaleString()}** total revenue this month
- **${data.outstanding}** outstanding (unpaid) invoices

Would you like a breakdown of overdue accounts or a full financial report?`,
          confidence: 0.94,
          sources: ["Billing API"],
          suggestions: ["Show overdue accounts", "Generate monthly revenue report", "Send payment reminders"],
        }

      default:
        return {
          answer: `I found some information, but I'm not sure how to display it for the entity '${intent.entity}'.`,
          confidence: 0.7,
          sources: ["Local DB"],
          suggestions: ["Try rephrasing your question", "Ask for a full report"],
        }
    }
  }

  private async queryAI(prompt: string, history: ChatMessage[]): Promise<string> {
    try {
      const messages = [
        {
          role: "system",
          content: `You are a helpful AI assistant for Salam Nest, a childcare management system. 
You help staff with questions about childcare operations, child development, health and safety, 
educational activities, and general childcare best practices. 

Be friendly, professional, and concise. Provide actionable advice when possible.
If asked about specific data (attendance, billing, health records, etc.), remind users they can ask for reports.`,
        },
        ...history.slice(-6),
        { role: "user", content: prompt },
      ]

      console.log("[v0] Sending request to OpenRouter with model:", GEMINI_MODEL)

      const response = await fetch(OPENROUTER_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "HTTP-Referer": window.location.origin,
          "X-Title": "Salam Nest Childcare Assistant",
        },
        body: JSON.stringify({
          model: GEMINI_MODEL,
          messages: messages,
          temperature: 0.7,
          max_tokens: 1000,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("[v0] OpenRouter API error:", response.status, errorText)
        throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      console.log("[v0] OpenRouter response received:", data)

      const aiMessage = data.choices?.[0]?.message?.content

      if (!aiMessage) {
        throw new Error("No content in AI response")
      }

      return aiMessage
    } catch (error) {
      console.error("[v0] Error querying AI:", error)
      throw error
    }
  }

  async query(
    prompt: string,
    userId: string,
    history: ChatMessage[] = [],
  ): Promise<ChatResponse & { reportData?: any }> {
    const intent = this.determineIntent(prompt)

    // Handle data queries (reports, attendance, billing, etc.)
    if (intent) {
      try {
        console.log(`[v0] Matched local intent: ${intent.entity} (${intent.type})`)
        const result = await dataIntegrationService.fetchData(intent)
        const formattedResponse = this.formatResponse(intent, result)

        return {
          ...formattedResponse,
          timestamp: new Date(),
        }
      } catch (error) {
        console.error(`[v0] Error handling local intent '${intent.entity}':`, error)

        // Try AI fallback for data query errors
        try {
          const aiResponse = await this.queryAI(
            `The user asked: "${prompt}". I tried to fetch ${intent.entity} data but got an error. Please provide a helpful response explaining this might be a connection issue and suggest they check if the backend service is running on port 8080.`,
            history,
          )

          return {
            answer: aiResponse,
            confidence: 0.6,
            timestamp: new Date(),
            sources: ["AI Assistant"],
            suggestions: ["Check backend connection", "Try again later", "Ask a different question"],
          }
        } catch (aiError) {
          return {
            answer: `I'm having trouble connecting to the ${intent.entity} data service. Please ensure your backend is running on http://localhost:8080 and try again.`,
            confidence: 0.3,
            timestamp: new Date(),
            sources: ["System"],
            suggestions: ["Check backend status", "Verify API endpoints", "Contact support"],
          }
        }
      }
    }

    // Handle general questions with AI
    try {
      console.log("[v0] Using AI to answer general question")
      const aiResponse = await this.queryAI(prompt, history)

      return {
        answer: aiResponse,
        confidence: 0.9,
        sources: ["AI Assistant (Gemini 2.0 Flash)"],
        suggestions: [
          "Generate a comprehensive daily report",
          "Show me today's attendance",
          "What's our monthly revenue?",
        ],
        timestamp: new Date(),
      }
    } catch (error) {
      console.error("[v0] Error querying AI:", error)

      // Provide helpful fallback
      return {
        answer: `I'm currently having trouble connecting to the AI service. However, I can still help you with:

**Data & Reports:**
- "Generate a comprehensive daily report" - Get a full overview with PDF download
- "Show me today's attendance" - See who's present/absent
- "What's our monthly revenue?" - View billing summary
- "List health alerts" - Check medical information

**What would you like to know?**`,
        confidence: 0.7,
        sources: ["System"],
        suggestions: [
          "Generate a comprehensive daily report",
          "Show me today's attendance",
          "What's our monthly revenue?",
          "List health alerts",
        ],
        timestamp: new Date(),
      }
    }
  }

  clearHistory(userId: string): void {
    this.conversationHistory.delete(userId)
  }
}

export const enhancedChatService = new EnhancedChatService()
