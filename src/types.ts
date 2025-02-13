export interface AIPersonality {
  id: string;
  name: string;
  description: string;
  avatar: string;
}

export interface Message {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
  created_at?: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  personality_id: string;
  created_at: string;
  updated_at: string;
}

export interface RejectedPersonality {
  id?: string;
  user_id?: string;
  personality_id: string;
  rejected_at: string;
} 