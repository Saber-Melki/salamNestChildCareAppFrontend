
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  confidence?: number;
  sources?: string[];
  suggestions?: string[];
  isLoading?: boolean;
}

export interface AIResponse {
  answer: string;
  timestamp: Date;
  confidence?: number;
  sources?: string[];
  suggestions?: string[];
}
