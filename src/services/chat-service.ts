// Types for chat service
export interface ChatQuery {
  question: string
  context?: string
  userId: string
  timestamp: Date
}

export interface ChatResponse {
  answer: string
  confidence: number
  sources?: string[]
  suggestions?: string[]
  timestamp: Date
}

export interface DatabaseContext {
  children: any[]
  staff: any[]
  parents: any[]
  attendance: any[]
  health: any[]
  billing: any[]
  messages: any[]
  events: any[]
}

class ChatService {
  private conversationHistory: Map<string, Array<{ role: string; content: string }>> = new Map()

  async queryWithOpenRouter(query: string, userId: string): Promise<ChatResponse> {
    // Get conversation history for this user
    const history = this.conversationHistory.get(userId) || []

    // Add current query to history
    history.push({ role: "user", content: query })

    // Simulate AI response with childcare-specific knowledge
    const response = await this.simulateAIResponse(query, "openrouter")

    // Add response to history
    history.push({ role: "assistant", content: response.answer })
    this.conversationHistory.set(userId, history.slice(-10)) // Keep last 10 messages

    return response
  }

  async queryWithGemini(query: string, userId: string): Promise<ChatResponse> {
    // Get conversation history for this user
    const history = this.conversationHistory.get(userId) || []

    // Add current query to history
    history.push({ role: "user", content: query })

    // Simulate AI response with childcare-specific knowledge
    const response = await this.simulateAIResponse(query, "gemini")

    // Add response to history
    history.push({ role: "assistant", content: response.answer })
    this.conversationHistory.set(userId, history.slice(-10)) // Keep last 10 messages

    return response
  }

  private async simulateAIResponse(query: string, provider: "openrouter" | "gemini"): Promise<ChatResponse> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500 + Math.random() * 1000))

    const lowerQuery = query.toLowerCase()

    // Childcare-specific responses
    if (lowerQuery.includes("attendance")) {
      return {
        answer: `Based on our attendance records, here's what I found:

📊 **Today's Attendance Summary:**
- Total enrolled: 45 children
- Present today: 38 children (84.4%)
- Absent: 7 children
- Late arrivals: 3 children

**Recent Trends:**
- Average attendance this week: 86.2%
- Most common absence reason: Minor illness
- Peak arrival time: 8:00-8:30 AM

**Notable:**
- Emma Johnson has perfect attendance this month
- The Toddler room has the highest attendance rate (92%)

Would you like me to generate a detailed attendance report or check specific children?`,
        confidence: 0.95,
        sources: ["Attendance Database", "Daily Reports"],
        suggestions: [
          "Show me attendance by classroom",
          "Which children have been absent frequently?",
          "Generate weekly attendance report",
          "Check attendance patterns by day of week",
        ],
        timestamp: new Date(),
      }
    }

    if (lowerQuery.includes("billing") || lowerQuery.includes("payment") || lowerQuery.includes("revenue")) {
      return {
        answer: `Here's your billing and payment overview:

💰 **Financial Summary (This Month):**
- Total revenue: $28,450
- Outstanding invoices: $3,200 (6 families)
- Payment collection rate: 94.2%
- Average monthly fee per child: $850

**Payment Status:**
- ✅ Paid in full: 39 families
- ⏳ Partial payment: 4 families  
- ❌ Overdue: 2 families

**Recent Transactions:**
- Mike Chen: $850 (paid today)
- Sarah Johnson: $425 (partial payment)
- The Williams family: $1,700 (paid in advance)

**Upcoming:**
- Next billing cycle: March 1st
- Late fee notices: 2 families due

Would you like me to generate invoices or send payment reminders?`,
        confidence: 0.92,
        sources: ["Billing System", "Payment Records"],
        suggestions: [
          "Show me overdue accounts",
          "Generate monthly financial report",
          "Send payment reminder emails",
          "Check scholarship recipients",
        ],
        timestamp: new Date(),
      }
    }

    if (lowerQuery.includes("health") || lowerQuery.includes("medical") || lowerQuery.includes("allerg")) {
      return {
        answer: `Here's the health and medical information summary:

🏥 **Health Overview:**
- Children with allergies: 12 (26.7%)
- Medication administration: 5 children daily
- Recent incident reports: 2 (minor scrapes)
- Health forms up to date: 41/45 children

**Allergy Alerts:**
- Peanut allergies: 4 children
- Dairy intolerance: 3 children  
- Seasonal allergies: 5 children

**Outstanding Health Forms:**
- Emma Thompson: Annual physical due
- Jake Miller: Immunization update needed
- Lily Chen: Allergy action plan renewal
- Sam Wilson: Emergency contact update

**Recent Health Notes:**
- No current illness outbreaks
- Hand sanitizer stations restocked
- Temperature checks: All normal today

**Safety Compliance:** ✅ 98% compliant

Need me to send health form reminders or check specific medical information?`,
        confidence: 0.94,
        sources: ["Health Records", "Medical Forms", "Incident Reports"],
        suggestions: [
          "Send health form reminders",
          "Check allergy protocols",
          "Review incident reports",
          "Update emergency contacts",
        ],
        timestamp: new Date(),
      }
    }

    if (lowerQuery.includes("staff") || lowerQuery.includes("teacher") || lowerQuery.includes("schedule")) {
      return {
        answer: `Here's your staff and scheduling information:

👥 **Staff Overview:**
- Total staff: 12 members
- Teachers: 8 (2 lead, 6 assistant)
- Support staff: 4 (admin, kitchen, maintenance)
- Staff-to-child ratio: 1:5.6 (exceeds requirements)

**Today's Schedule:**
- Morning shift: 6 staff (6:30 AM - 2:30 PM)
- Afternoon shift: 4 staff (10:30 AM - 6:30 PM)
- Full-day coverage: ✅ Adequate

**Staff Highlights:**
- Ms. Sarah (Lead Teacher): 8 years experience
- Mr. James (Assistant): Recently completed CPR certification
- Ms. Maria (Kitchen): Preparing healthy lunch menu

**Upcoming:**
- Staff meeting: Friday 3:00 PM
- Professional development: Next Tuesday
- New hire orientation: March 15th

**Schedule Conflicts:** None detected for this week

Would you like me to check specific staff schedules or plan coverage?`,
        confidence: 0.91,
        sources: ["Staff Database", "Schedule System", "HR Records"],
        suggestions: [
          "Show me next week's schedule",
          "Check staff certifications",
          "Plan substitute coverage",
          "Review staff performance",
        ],
        timestamp: new Date(),
      }
    }

    if (lowerQuery.includes("children") || lowerQuery.includes("enrollment") || lowerQuery.includes("student")) {
      return {
        answer: `Here's information about our enrolled children:

👶 **Enrollment Summary:**
- Total enrolled: 45 children
- Age distribution:
  - Infants (6-18 months): 8 children
  - Toddlers (18 months-3 years): 15 children  
  - Preschool (3-5 years): 22 children

**Recent Enrollments (This Month):**
- Oliver Martinez (2 years old) - Started Feb 15th
- Zoe Kim (4 years old) - Started Feb 22nd
- Twin brothers Alex & Ben Taylor (3 years old) - Starting March 1st

**Classroom Distribution:**
- Infant Room: 8/10 capacity
- Toddler Room A: 8/8 capacity (full)
- Toddler Room B: 7/8 capacity
- Preschool Room: 22/25 capacity

**Special Needs Support:** 3 children receiving individualized care plans

**Waiting List:** 6 families (mostly for toddler spots)

**Upcoming Transitions:**
- 4 children moving from toddler to preschool in March
- 2 infants ready for toddler room

Would you like details about specific children or classroom information?`,
        confidence: 0.93,
        sources: ["Enrollment Database", "Classroom Records", "Child Profiles"],
        suggestions: [
          "Show me waiting list details",
          "Check developmental milestones",
          "Review individual care plans",
          "Plan classroom transitions",
        ],
        timestamp: new Date(),
      }
    }

    if (lowerQuery.includes("services") || lowerQuery.includes("program") || lowerQuery.includes("curriculum")) {
      return {
        answer: `Here are the childcare services and programs we offer:

🌟 **Core Services:**
- Full-day childcare (6:30 AM - 6:30 PM)
- Part-time programs (half-day options)
- Drop-in care (subject to availability)
- Extended hours for working parents

**Educational Programs:**
- 📚 Early literacy development
- 🔢 Math readiness activities  
- 🎨 Creative arts and crafts
- 🎵 Music and movement
- 🌱 Nature exploration
- 👥 Social skills development

**Specialized Services:**
- Nutritious meals and snacks (organic options)
- Potty training support
- Nap time coordination
- Special needs accommodation
- Bilingual education support

**Enrichment Activities:**
- Weekly library visits
- Seasonal field trips
- Holiday celebrations
- Parent-child events
- Summer camp programs

**Age-Specific Curricula:**
- **Infants:** Sensory play, tummy time, language exposure
- **Toddlers:** Independence skills, parallel play, vocabulary building
- **Preschool:** School readiness, letter recognition, social cooperation

**Additional Support:**
- Parent education workshops
- Developmental assessments
- Transition planning to kindergarten

Would you like more details about any specific program or service?`,
        confidence: provider === "openrouter" ? 0.88 : 0.82,
        sources: ["System Database", "Knowledge Base"],
        suggestions: [
          "Tell me about the preschool curriculum",
          "What meals do you provide?",
          "How do you handle special needs?",
          "What are your holiday programs?",
        ],
        timestamp: new Date(),
      }
    }

    // Default response for general queries
    return {
      answer: `I'm here to help you with your childcare management system! I can assist you with:

🏢 **Childcare Operations:**
- Attendance tracking and reporting
- Billing and payment management  
- Health records and medical information
- Staff scheduling and management
- Child enrollment and profiles

📊 **Reports & Analytics:**
- Generate detailed reports
- Analyze attendance patterns
- Financial summaries
- Compliance tracking

🎯 **Services Information:**
- Educational programs and curriculum
- Meal plans and nutrition
- Special needs support
- Enrichment activities

💡 **Quick Actions:**
- Send reminders to parents
- Update child information
- Schedule staff meetings
- Plan activities

What specific information would you like to know about your childcare center? I have access to all your data and can provide detailed insights!`,
      confidence: provider === "openrouter" ? 0.88 : 0.82,
      sources: ["System Database", "Knowledge Base"],
      suggestions: [
        "Show me today's attendance",
        "What's our monthly revenue?",
        "Which children need health form updates?",
        "Tell me about our educational programs",
        "Check staff schedules for next week",
      ],
      timestamp: new Date(),
    }
  }

  clearHistory(userId: string): void {
    this.conversationHistory.delete(userId)
  }

  getHistory(userId: string): Array<{ role: string; content: string }> {
    return this.conversationHistory.get(userId) || []
  }
}

export const chatService = new ChatService()
