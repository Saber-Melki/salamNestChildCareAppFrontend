
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

export interface ChatResponse {
  answer: string;
  timestamp: Date;
  confidence: number;
  sources: string[];
  suggestions: string[];
}

export interface User {
  id: string;
  name: string;
}

export type Entity = 'children' | 'attendance' | 'billing' | 'staff' | 'health' | 'schedule' | 'media' | 'report';
export type QueryType = 'count' | 'list' | 'find' | 'analyze' | 'summary' | 'generate';

export interface QueryIntent {
  entity: Entity;
  type: QueryType;
  filters?: Record<string, any>;
  timeframe?: string;
  aggregation?: string;
}

export interface DataResult {
  data: any;
  count?: number;
  metadata?: {
    source: string;
    timestamp: string;
    filters?: Record<string, any>;
  };
}

export interface HealthNote {
  id: string;
  noteType: string;
  description: string;
  date: string;
  followUp?: string;
  childId: string;
  child?: string;
  createdAt?: string;
  updatedAt?: string;
  priority?: "low" | "medium" | "high";
  status?: "active" | "resolved" | "pending";
}

export interface HealthRecord {
  id: string;
  child: string;
  childId: string;
  allergies: string;
  immunizations: string;
  emergency: string;
  notes: HealthNote[];
  bloodType?: string;
  medications?: string[];
  lastCheckup?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export interface ChildRow {
  id: string;
  firstName: string;
  lastName: string;
}



export type StaffRole = "director" | "teacher" | "assistant" | "substitute" | "admin";
export type StaffStatus = "active" | "inactive" | "on-leave";

export interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: StaffRole;
  status: StaffStatus;
  hireDate: string;
  address: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  certifications: string[];
  hourlyRate: number;
  weeklyHours: number;
  notes: string;
  avatar?: string;
}
