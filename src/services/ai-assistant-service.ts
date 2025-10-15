import { DataResult } from "../types"

const OPENROUTER_API_KEY = "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"
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"
const GEMINI_MODEL = "google/gemini-2.0-flash-lite-001"

interface QueryIntent {
  entity: "children" | "attendance" | "billing" | "health" | "media" | "report" | "shift" | "booking" | "event" | "album" | "staff" | "user"
  type: "count" | "list" | "find" | "analyze" | "summary"
  filters?: Record<string, any>
  timeframe?: string
  aggregation?: string
}

interface ChatMessage {
  role: "system" | "user" | "assistant"
  content: string
}

class AIAssistantService {
  private async callAI(systemPrompt: string, userPrompt: string): Promise<string> {
    try {
      const response = await fetch(OPENROUTER_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "HTTP-Referer": window.location.origin,
          "X-Title": "SalamNest Childcare Assistant",
        },
        body: JSON.stringify({
          model: GEMINI_MODEL,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.2,
        }),
      })

      if (!response.ok) {
        throw new Error(`AI API error: ${response.status}`)
      }

      const data = await response.json()
      return data.choices?.[0]?.message?.content?.trim() || ""
    } catch (error) {
      console.error("AI API error:", error)
      throw error
    }
  }

  async interpretQuery(userQuery: string): Promise<QueryIntent> {
    const systemPrompt = `You are an AI assistant that extracts childcare management query intents in structured JSON format.`
    const userPrompt = `
Analyze this user query and extract the intent for a childcare database query.
Return a JSON object with the following structure:

{
  "type": "count|list|find|analyze|summary",
  entity: "children" | "attendance" | "billing" | "health" | "media" | "report" | "shift" | "booking" | "event" | "album" | "staff" | "user",
  "filters": {},
  "aggregation": "sum|avg|max|min|count",
  "timeframe": "today|yesterday|week|month|quarter|year"
}

Examples:
- "How many children are enrolled?" → {"type": "count", "entity": "children"}
- "Show me today's attendance" → {"type": "list", "entity": "attendance", "timeframe": "today"}
- "Generate a comprehensive report" → {"type": "summary", "entity": "report"}
- "What's our monthly revenue?" → {"type": "analyze", "entity": "billing", "timeframe": "month"}
- "List health alerts" → {"type": "list", "entity": "health"}
- "Find all media from last month" → {"type": "find", "entity": "media", "timeframe": "month"}
- "Show me the staff schedule for this week" → {"type": "list", "entity": "shift", "timeframe": "week"}
- "List all upcoming events" → {"type": "list", "entity": "event"}
- "Find all bookings for next month" → {"type": "find", "entity": "booking", "timeframe": "month"}
- "Show me all photo albums" → {"type": "list", "entity": "album"}



User query: "${userQuery}"

Return only the JSON object.
`

    try {
      const response = await this.callAI(systemPrompt, userPrompt)
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
      throw new Error("Invalid AI response")
    } catch (error) {
      console.error("interpretQuery fallback:", error)
      return this.fallbackInterpretation(userQuery)
    }
  }

  private fallbackInterpretation(query: string): QueryIntent {
    const lowerQuery = query.toLowerCase()

    // Determine entity
    let entity: QueryIntent["entity"] = "children"
    if (lowerQuery.includes("report") || lowerQuery.includes("comprehensive") || lowerQuery.includes("daily report")) {
      entity = "report"
    } else if (lowerQuery.includes("health") || lowerQuery.includes("medication") || lowerQuery.includes("allergy")) {
      entity = "health"
    } else if (
      lowerQuery.includes("schedule") ||
      lowerQuery.includes("calendar") ||
      lowerQuery.includes("booking") ||
      lowerQuery.includes("tour") ||
      lowerQuery.includes("event")
    ) {
      entity = "event"
    } else if (
      lowerQuery.includes("media") ||
      lowerQuery.includes("photo") ||
      lowerQuery.includes("picture") ||
      lowerQuery.includes("video") ||
      lowerQuery.includes("album") ||
      lowerQuery.includes("gallery")

    ) {
      entity = "media"
    } else if (
      lowerQuery.includes("staff") ||
      lowerQuery.includes("teacher") ||
      lowerQuery.includes("employee") ||
      lowerQuery.includes("staff") ||
      lowerQuery.includes("personnel") ||
      lowerQuery.includes("worker") ||
      lowerQuery.includes("work") ||
      lowerQuery.includes("shift")
    ) {
      entity = "shift"
    } else if (
      lowerQuery.includes("attendance") ||
      lowerQuery.includes("present") ||
      lowerQuery.includes("absent") ||

      lowerQuery.includes("check-in")
    ) {
      entity = "attendance"
    } else if (
      lowerQuery.includes("billing") ||
      lowerQuery.includes("payment") ||
      lowerQuery.includes("invoice") ||
      lowerQuery.includes("revenue") ||

      lowerQuery.includes("financial")
    ) {
      entity = "billing"
    }
    else if (lowerQuery.includes("child") || lowerQuery.includes("kid") || lowerQuery.includes("student") || lowerQuery.includes("toddler") || lowerQuery.includes("infant") ) {
      entity = "children"
    }
    else if (lowerQuery.includes("meeting") || lowerQuery.includes("phone call") || lowerQuery.includes("video call") || lowerQuery.includes("appointment") || lowerQuery.includes("tour") ) {
      entity = "booking"
    } else if (lowerQuery.includes("health") || lowerQuery.includes("medication") || lowerQuery.includes("allergy") || lowerQuery.includes("illness") || lowerQuery.includes("injury")) {
      entity = "health"
    } else if (lowerQuery.includes("staff") || lowerQuery.includes("employee") || lowerQuery.includes("teacher") || lowerQuery.includes("personnel") || lowerQuery.includes("worker") || lowerQuery.includes("work") || lowerQuery.includes("shift")) {
      entity = "staff"
    }
    else if (lowerQuery.includes("user") || lowerQuery.includes("account") || lowerQuery.includes("login") || lowerQuery.includes("profile") || lowerQuery.includes("administrator") || lowerQuery.includes("admin") || lowerQuery.includes("users")) {
      entity = "user"
    }

    

    // Determine type
    let type: QueryIntent["type"] = "list"
    if (lowerQuery.includes("how many") || lowerQuery.includes("count") || lowerQuery.includes("number of")) {
      type = "count"
    } else if (lowerQuery.includes("find") || lowerQuery.includes("search") || lowerQuery.includes("show me")) {
      type = "find"
    } else if (lowerQuery.includes("analyze") || lowerQuery.includes("summary") || lowerQuery.includes("overview")) {
      type = "analyze"
    }

    // Determine filters
    const filters: Record<string, any> = {}
    if (lowerQuery.includes("active")) filters.status = "active"
    if (lowerQuery.includes("unpaid") || lowerQuery.includes("outstanding")) filters.status = "unpaid"
    if (lowerQuery.includes("high priority") || lowerQuery.includes("severe")) filters.severity = "high"

    // Determine timeframe
    let timeframe: QueryIntent["timeframe"] | undefined
    if (lowerQuery.includes("today")) timeframe = "today"
    else if (lowerQuery.includes("yesterday")) timeframe = "yesterday"
    else if (lowerQuery.includes("week") || lowerQuery.includes("this week")) timeframe = "week"
    else if (lowerQuery.includes("month") || lowerQuery.includes("this month")) timeframe = "month"
    else if (lowerQuery.includes("quarter")) timeframe = "quarter"
    else if (lowerQuery.includes("year")) timeframe = "year"

    return { type, entity, filters, timeframe }
  }

  async generateResponse(data: DataResult, query: string, intent: QueryIntent): Promise<string> {
    const systemPrompt = `You are a helpful assistant for Salam Nest childcare management system. Write friendly, clear summaries of query results.`
    const userPrompt = `
User Query: "${query}"
Intent: ${JSON.stringify(intent)}
Data: ${JSON.stringify(data.data, null, 2)}

Guidelines:
- Be helpful and conversational
- Highlight specific figures and details
- Use bullet points or lists for clarity
- Suggest relevant follow-up actions
- If there's no data, mention it and suggest alternatives

Generate a friendly response:
`

    try {
      const response = await this.callAI(systemPrompt, userPrompt)
      return response
    } catch (error) {
      console.error("generateResponse fallback:", error)
      return this.generateFallbackResponse(data, intent)
    }
  }

  private generateFallbackResponse(result: DataResult, intent: QueryIntent): string {
    const { data } = result

    if (!data || (Array.isArray(data) && data.length === 0)) {
      return `No results found for your search on ${intent.entity}.`
    }

    if (intent.type === "count") {
      const count = data.count || (Array.isArray(data) ? data.length : 0)
      return `I found ${count} ${intent.entity} matching your search.`
    }

    if (intent.type === "list" || intent.type === "find") {
      const count = Array.isArray(data) ? data.length : 0
      return `Here are the ${count} ${intent.entity} found:\n${JSON.stringify(data, null, 2)}`
    }

    return `Here is the information you requested:\n${JSON.stringify(data, null, 2)}`
  }
}

export const aiAssistantService = new AIAssistantService()
