import axios from 'axios';
import { Message } from '../types';
import { MessageAnalyzer } from './messageAnalyzer';

interface SaladCloudResponse {
  choices: Array<{
    message: {
      content: string;
    }
  }>;
}

export class SaladCloudService {
  private readonly apiKey: string;
  private readonly baseURL: string = 'https://jujube-spinach-40dapeep3i9p2t75.salad.cloud/v1/chat/completions';
  private readonly model: string = 'hf.co/ArliAI/Mistral-Small-22B-ArliAI-RPMax-v1.1-GGUF:Q5_K_M';
  private readonly messageAnalyzer: MessageAnalyzer;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.messageAnalyzer = new MessageAnalyzer();
  }

  async generateResponse(systemPrompt: string, messages: Message[]): Promise<string> {
    try {
      const lastMessage = messages[messages.length - 1];
      if (!lastMessage) return '';

      // Check for picture request
      const isPictureRequest = await this.messageAnalyzer.detectPictureRequest(lastMessage.content);
      if (isPictureRequest) {
        return this.messageAnalyzer.getPictureResponse(systemPrompt);
      }

      // Create messages array with system prompt first
      const allMessages = [
        { role: 'system', content: systemPrompt },
        ...messages
      ];

      const response = await axios.post<SaladCloudResponse>(
        this.baseURL,
        {
          model: this.model,
          messages: allMessages,
          temperature: 0.7,
          max_tokens: 500
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      let aiResponse = response.data.choices[0].message.content;

      // Post-process the response
      aiResponse = this.processResponse(aiResponse);

      return aiResponse;
    } catch (error) {
      console.error('[SaladCloud] API error:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response:', error.response?.data);
      }
      throw error;
    }
  }

  private processResponse(response: string): string {
    // Remove any markdown code blocks
    response = response.replace(/```[\s\S]*?```/g, '');

    // Remove excessive newlines
    response = response.replace(/\n{3,}/g, '\n\n');

    // Remove any HTML tags
    response = response.replace(/<[^>]*>/g, '');

    // Ensure response isn't too long
    const maxLength = 500;
    if (response.length > maxLength) {
      response = response.substring(0, maxLength) + '...';
    }

    // Ensure response isn't empty
    if (!response.trim()) {
      response = "I'm not sure how to respond to that. Could you rephrase or ask something else?";
    }

    return response.trim();
  }

  async detectScenarioNeeded(messages: Message[]): Promise<boolean> {
    if (messages.length < 3) return false;

    const recentMessages = messages.slice(-3);
    const shortResponses = recentMessages.filter(
      msg => msg.content.split(' ').length <= 3
    ).length;

    return shortResponses >= 2;
  }

  async generateScenario(personality: string, context: string): Promise<string> {
    const scenarios = [
      "How about we imagine we're at a cozy café? I just noticed you walk in...",
      "Picture us meeting at a sunset beach. The waves are gentle...",
      "What if we ran into each other at an art gallery? I'm admiring this fascinating piece...",
      "Imagine we're both at a rooftop party, enjoying the city lights...",
    ];

    return scenarios[Math.floor(Math.random() * scenarios.length)];
  }
} 