import { Message } from '../types';

interface ChatMessage {
  role: string;
  content: string;
}

interface ChatResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export class GrokManager {
  private readonly baseUrl: string = '/api/call_grok';
  private readonly model: string = 'grok-1';

  trimMessageHistory(messageHistory: ChatMessage[]): ChatMessage[] {
    if (messageHistory.length > 40) {
      return messageHistory.slice(0, 10).concat(messageHistory.slice(-30));
    }
    return messageHistory;
  }

  async makeRequest(messages: ChatMessage[], temperature: number = 0.7, maxTokens: number = 150): Promise<ChatResponse> {
    console.log('\n[Grok API Request]');

    // Keep first 10 and last 20 messages
    let trimmedMessages = this.trimMessageHistory(messages);

    console.log('Messages:', trimmedMessages);
    console.log('Temperature:', temperature);
    console.log('Max Tokens:', maxTokens);

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        messages: trimmedMessages,
        temperature,
        max_tokens: maxTokens
      })
    });

    const rawResponse = await response.text();
    console.log('[Grok API Raw Response]:', rawResponse);

    if (!response.ok) {
      console.error('[Grok API Error Status]:', response.status);
      console.error('[Grok API Error Headers]:', Object.fromEntries(response.headers.entries()));
      throw new Error(`API request failed with status ${response.status}: ${rawResponse}`);
    }

    const data = JSON.parse(rawResponse) as ChatResponse;
    console.log('[Grok API Parsed Response]:', data);

    return data;
  }

  async translateToHindi(text: string): Promise<string> {
    try {
      const response = await this.makeRequest(
        [
          { 
            role: 'system', 
            content: 'You are a Hindi translator. Translate the given text to Hindi using Devanagari script. Keep the translation natural and conversational.' 
          },
          { 
            role: 'user', 
            content: `Translate this text to Hindi: "${text}"` 
          }
        ],
        0.3, // Lower temperature for more consistent translations
        150
      );

      const translation = response.choices[0].message.content.trim();
      console.log('[Hindi Translation Result]:', translation);
      return translation;
    } catch (error) {
      console.error('[Hindi Translation Error]:', error);
      throw error;
    }
  }
}

export const grokManager = new GrokManager();
