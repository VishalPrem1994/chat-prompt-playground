export interface AIPersonality {
  id: string;
  name: string;
  description: string;
  avatar: string;
  systemPrompt: string;
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
} 