import { dataIntegrationService } from "./data-integration-service"
import { aiAssistantService } from "./ai-assistant-service"
import type { ChatResponse } from "./chat-service"

const OPENROUTER_API_KEY = "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"
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"
const GEMINI_MODEL = "google/gemini-2.0-flash-lite-001"

interface QueryIntent {
  entity: "children" | "attendance" | "billing" | "health" | "media" | "report" | "shift" | "booking" | "event" | "album" | "staff"
  type: "list" | "analyze" | "generate"
  filters?: Record<string, any>
  timeframe?: string
}

interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

class EnhancedChatService {
  private conversationHistory: Map<string, any[]> = new Map()

  async query(prompt: string, userId: string, history: any[] = []): Promise<ChatResponse & { reportData?: any }> {
    console.log("Chat query received:", prompt)

    try {
      const intent = await aiAssistantService.interpretQuery(prompt)
      console.log("Detected intent:", intent)

      console.log(`Fetching data from backend API...`)
      const result = await dataIntegrationService.fetchData(intent)
      console.log(`Data fetched successfully:`, result)

      const aiResponse = await aiAssistantService.generateResponse(result, prompt, intent)

      const reportData =
        result.data && result.data.length > 0
          ? {
              data: result.data,
              entity: intent.entity,
              metadata: result.metadata,
            }
          : undefined

      return {
        answer: aiResponse,
        confidence: 0.95,
        timestamp: new Date(),
        sources: [result.metadata.source],
        suggestions: this.generateSuggestions(intent.entity),
        reportData,
      }
    } catch (error) {
      console.error(`Error processing query:`, error)

      const errorMessage = error instanceof Error ? error.message : "Unknown error"

      return {
        answer: `I'm having trouble processing your request. Please try again later.`,
        confidence: 0,
        timestamp: new Date(),
        sources: ["System"],
        suggestions: ["Check backend status", "Verify API endpoints", "Review CORS configuration"],
      }
    }
  }

  private generateSuggestions(entity: string): string[] {
    const suggestions: Record<string, string[]> = {
      report: [
        "Generate a PDF report for this data",
        "Show me the high-priority health alerts",
        "Which classrooms are fully staffed today?",
      ],
      children: ["Generate children report PDF", "Show classroom distribution", "List all children by age"],
      attendance: [
        "Generate attendance report PDF",
        "Show attendance by classroom",
        "List children with frequent absences",
      ],
      billing: ["Generate billing report PDF", "Show overdue accounts", "Generate monthly revenue report"],
      staff: ["Generate staff report PDF", "Show today's staff schedule", "List all teachers"],
      health: [
        "Generate health report PDF",
        "List all high-severity health alerts",
        "Which children have nut allergies?",
      ],
      schedule: ["Generate schedule report PDF", "Show this week's schedule", "Add a new event"],
      media: ["Generate media report PDF", "Show recent photos", "List all albums"],
    }

    return (
      suggestions[entity] || [
        "Generate a comprehensive daily report",
        "Show me today's attendance",
        "What's our monthly revenue?",
      ]
    )
  }

  clearHistory(userId: string): void {
    this.conversationHistory.delete(userId)
  }
}

export const enhancedChatService = new EnhancedChatService()
