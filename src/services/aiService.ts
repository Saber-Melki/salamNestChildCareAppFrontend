import { GoogleGenAI, Type, Chat } from "@google/genai";
import { AIResponse } from "../types";

// Initialize the Gemini AI client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

// --- Database Context and Mock Data ---

// This interface defines the structure of the data our AI can access.
interface DatabaseContext {
  children: any[];
  staff: any[];
  parents: any[];
  attendance: any[];
  health: any[];
  billing: any[];
  messages: any[];
  events: any[];
}

// In a real app, this would fetch from your actual database.
// For this demo, we use mock data to simulate a real childcare system.
function getDatabaseContext(): DatabaseContext {
  return {
    children: [
      { id: "1", name: "Emma Johnson", age: 4, parentId: "p1", classroom: "Preschool A", allergies: ["Peanuts"], status: "active" },
      { id: "2", name: "Alex Chen", age: 3, parentId: "p2", classroom: "Toddler B", allergies: [], status: "active" },
    ],
    staff: [
      { id: "t1", name: "Ms. Rodriguez", role: "teacher", department: "Preschool", certifications: ["Early Childhood Education", "CPR Certified"] },
      { id: "t2", name: "Mr. Thompson", role: "teacher", department: "Toddler", certifications: ["Child Development", "First Aid"] },
    ],
    parents: [
      { id: "p1", name: "Sarah Johnson", children: ["Emma Johnson"] },
      { id: "p2", name: "Mike Chen", children: ["Alex Chen"] },
    ],
    attendance: [
      { childName: "Emma Johnson", date: new Date().toISOString().split('T')[0], status: "present", checkIn: "8:00 AM", checkOut: "5:30 PM" },
      { childName: "Alex Chen", date: new Date().toISOString().split('T')[0], status: "present", checkIn: "8:30 AM", checkOut: "4:00 PM" },
    ],
    health: [
      { childName: "Emma Johnson", date: "2 days ago", type: "medication", description: "Administered allergy medication as prescribed." },
    ],
    billing: [
      { parentName: "Sarah Johnson", month: "Current Month", amount: 1200, status: "paid" },
      { parentName: "Mike Chen", month: "Current Month", amount: 1100, status: "pending" },
    ],
    messages: [
      { from: "Ms. Rodriguez", to: "Sarah Johnson", subject: "Emma's Progress", content: "Emma is doing wonderfully in reading." },
    ],
    events: [
      { title: "Parent-Teacher Conference", date: "Next week", time: "3:00 PM" },
      { title: "Field Trip to Zoo", date: "In two weeks", time: "9:00 AM" },
    ],
  };
}

// --- AI Configuration ---

// This function creates the detailed system prompt for the AI, injecting the database context.
function createSystemPrompt(context: DatabaseContext): string {
  return `You are a helpful AI assistant for a childcare management system called SalamNest.
Your role is to provide concise and accurate information based on the user's query.
You have access to the following real-time data from the system. Use it to answer questions.

TODAY'S DATE IS ${new Date().toDateString()}.

CHILDREN DATA: ${JSON.stringify(context.children)}
STAFF DATA: ${JSON.stringify(context.staff)}
PARENTS DATA: ${JSON.stringify(context.parents)}
ATTENDANCE DATA: ${JSON.stringify(context.attendance)}
HEALTH RECORDS: ${JSON.stringify(context.health)}
BILLING INFORMATION: ${JSON.stringify(context.billing)}
MESSAGES: ${JSON.stringify(context.messages)}
EVENTS: ${JSON.stringify(context.events)}

Instructions:
1. Answer questions based *only* on the data provided above.
2. If the information is not in the data, state that you do not have access to that information. Do not make things up.
3. Be friendly, professional, and helpful.
4. When asked a generic question, provide relevant suggestions for follow-up questions.
5. You MUST always respond in the JSON format defined by the schema. Do not add any text outside the JSON object.`;
}

// This schema forces the AI to return responses in a structured JSON format.
const responseSchema = {
    type: Type.OBJECT,
    properties: {
        answer: { type: Type.STRING, description: "The direct answer to the user's question, formatted in Markdown." },
        confidence: { type: Type.NUMBER, description: "A score from 0.0 to 1.0 indicating confidence in the answer." },
        sources: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of internal system sources used (e.g., 'Billing Records', 'Attendance Logs')." },
        suggestions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of 3-4 relevant follow-up questions the user might ask." },
    },
    required: ["answer", "confidence", "sources", "suggestions"],
};

// In-memory store for user chat sessions to maintain conversation history.
const chatSessions = new Map<string, Chat>();

async function getOrCreateChatSession(userId: string): Promise<Chat> {
    if (chatSessions.has(userId)) {
        return chatSessions.get(userId)!;
    }

    const context = getDatabaseContext();
    const systemInstruction = createSystemPrompt(context);
    
    const chat = ai.chats.create({
        model: "gemini-2.5-flash",
        config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema,
            temperature: 0.2,
        },
    });

    chatSessions.set(userId, chat);
    return chat;
}

// --- Service Methods ---

async function queryWithGemini(prompt: string, userId: string): Promise<AIResponse> {
    try {
        const chat = await getOrCreateChatSession(userId);
        const response = await chat.sendMessage({ message: prompt });
        
        const jsonText = response.text?.trim() ?? "";
        const parsedResponse = JSON.parse(jsonText);

        return {
            ...parsedResponse,
            timestamp: new Date(),
        };

    } catch (error) {
        console.error("Gemini API error:", error);
        if (error instanceof SyntaxError) {
             return {
                answer: "I'm sorry, I received an unusual response from the AI. Could you please try rephrasing your question?",
                confidence: 0.1,
                sources: ["Error Handler"],
                suggestions: ["Show me today's attendance", "Who are the preschool teachers?"],
                timestamp: new Date(),
            };
        }
        throw new Error("Failed to get response from Gemini API.");
    }
}

function clearHistory(userId: string): void {
    chatSessions.delete(userId);
    console.log(`Cleared conversation history for user ${userId}`);
}

export const aiService = {
    queryWithGemini,
    queryWithOpenRouter: queryWithGemini, // Alias OpenRouter to Gemini for this implementation
    clearHistory,
};
