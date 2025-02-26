import { Message, MessageContent } from '../types';
import { ChatMessage } from './saladCloudManager';

interface ChatResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export class GrokManager {
  private readonly isProduction: boolean = true;
  private readonly baseUrl: string = this.isProduction ? '/api/call_grok' : 'https://api.grok.com/v1/chat/completions';
  private readonly model: string = 'grok-2-latest';

  private getMessageContent(content: string | MessageContent[]): string {
    if (typeof content === 'string') {
      return content;
    }
    const englishContent = content.find(c => c.language === 'english');
    return englishContent ? englishContent.content : content[0].content;
  }

  trimMessageHistory(messageHistory: ChatMessage[]): ChatMessage[] {
    if (messageHistory.length > 40) {
      return messageHistory.slice(0, 10).concat(messageHistory.slice(-30));
    }
    return messageHistory;
  }

  async makeRequest(messages: ChatMessage[], temperature: number = 0.7, maxTokens: number = 150): Promise<ChatResponse> {
    console.log('\n[Grok API Request]');

    let trimmedMessages = this.trimMessageHistory(messages);
    console.log('Messages:', trimmedMessages);

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
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}: ${rawResponse}`);
    }

    return JSON.parse(rawResponse) as ChatResponse;
  }

  async detectPictureRequest(message: string): Promise<boolean> {
    const prompt = `Analyze if the user is requesting or asking for a picture/photo/image.
Message: "${message}"

Consider these indicators:
1. Direct requests ("send a pic", "show me a photo")
2. Indirect requests ("what do you look like", "can I see you")
3. References to visual content ("selfie", "picture", "photo", "image")

Respond with only "true" if the user is requesting a picture, or "false" if not.`;

    try {
      const response = await this.makeRequest(
        [
          { role: 'system', content: 'You are an analyzer that detects picture requests. Respond only with true or false.' },
          { role: 'user', content: prompt }
        ],
        0.3,
        10
      );
      return response.choices[0].message.content.toLowerCase().includes('true');
    } catch (error) {
      console.error('[Picture Request Detection Error]:', error);
      throw error;
    }
  }

  async checkIfHindiNeeded(message: string): Promise<boolean> {
    const prompt = `Determine if the user wants to talk in hindi.
Message: "${message}"

Consider these indicators:
1. Direct requests ("Can we talk in hindi?")
2. The user is using hindi words or phrases to speak

Respond with only "true" if the user needs a Hindi translation, or "false" if not.`;

    try {
      const response = await this.makeRequest(
        [
          { role: 'system', content: 'You are a language needs analyzer. Respond only with true or false.' },
          { role: 'user', content: prompt }
        ],
        0.3,
        10
      );
      return response.choices[0].message.content.toLowerCase().includes('true');
    } catch (error) {
      console.error('[Hindi Need Detection Error]:', error);
      throw error;
    }
  }

  async detectBoredom(messages: Message[], boredCount: number, timeSinceLastResponse: number): Promise<boolean> {
    const simpleMessages = messages.map(msg => ({
      role: msg.role,
      content: this.getMessageContent(msg.content)
    }));

    const trimmedMessages = this.trimMessageHistory(simpleMessages);
    const prompt = `Analyze if the user seems bored or disengaged in this conversation.
    If the user says something like "I'm bored" or "I'm not interested" or "I'm not in the mood" or "I'm not feeling like talking", then respond with true.
Otherwise Consider these factors:
1. Short or one-word responses
2. Delayed responses
3. Lack of engagement or enthusiasm
4. Repetitive responses
5. Signs of distraction
6. Says he/she is bored

Recent conversation:
${trimmedMessages.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

Time since last response: ${timeSinceLastResponse}ms
Previous boredom count: ${boredCount}

Respond with only "true" if user seems bored, or "false" if they seem engaged.`;

    try {
      const response = await this.makeRequest(
        [
          { role: 'system', content: 'You are an engagement analyzer. Respond only with true or false.' },
          { role: 'user', content: prompt }
        ],
        0.3,
        10
      );
      return response.choices[0].message.content.toLowerCase().includes('true');
    } catch (error) {
      console.error('[Boredom Detection Error]:', error);
      throw error;
    }
  }

  async generateScenario(personality: string, conversationContext: Message[]): Promise<string> {
    try {
      const simpleMessages = conversationContext.map(msg => ({
        role: msg.role,
        content: this.getMessageContent(msg.content)
      }));
      const trimmedContext = this.trimMessageHistory(simpleMessages);
      
      const response = await this.makeRequest(
        [
          { role: 'system', content: `You are ${personality}` },
          { role: 'user', content: `Generate a short, engaging roleplay scenario to spice up the conversation. 
            The scenario should match your personality and be flirty but not explicit. 
            Keep it under 100 words and make it feel natural. No childish content or language.
            Previous conversation context: ${trimmedContext.map(msg => `${msg.role}: ${msg.content}`).join('\n')}` }
        ],
        0.8,
        200
      );
      return response.choices[0].message.content.trim();
    } catch (error) {
      console.error('[Scenario Generation Error]:', error);
      throw error;
    }
  }

  async generateResponse(systemPrompt: string, conversationHistory: Message[]): Promise<string> {
    try {
      const simpleMessages = conversationHistory.map(msg => ({
        role: msg.role,
        content: this.getMessageContent(msg.content)
      }));

      const messages: ChatMessage[] = [
        { role: 'system', content: systemPrompt }
      ];

      const trimmedHistory = this.trimMessageHistory(simpleMessages);
      messages.push(...trimmedHistory.map(msg => ({
        role: msg.role,
        content: msg.content.trim()
      })));

      const response = await this.makeRequest(messages, 0.7, 150);
      return response.choices[0].message.content.trim();
    } catch (error) {
      console.error('[Response Generation Error]:', error);
      throw error;
    }
  }

  async generateImageDescription(personality: string, message: string, history: Message[]): Promise<string> {
    try {
      const simpleHistory = history.map(msg => ({
        role: msg.role,
        content: this.getMessageContent(msg.content)
      })).slice(-5);

      const response = await this.makeRequest(
        [
          { role: 'system', content: 'You are a picture description generator. Generate only the picture description.' },
          { role: 'user', content: `You are ${personality}. Based on the following chat history and current context, generate a seductive but tasteful description of a picture you would share. The description should match the current mood and conversation flow.

Recent chat history:
${simpleHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

Current request: ${message}

Generate a picture description that:
1. Matches the current mood and intensity of the conversation
2. Reflects your personality and current state
3. Is seductive but tasteful
4. Describes a realistic selfie or photo
5. Starts with "[If I could send pictures, I would share: "
6. Ends with "]"

Respond only with the picture description.` }
        ],
        0.7,
        150
      );

      let description = response.choices[0].message.content.trim();
      if (!description.startsWith('[If I could send pictures')) {
        description = `[If I could send pictures, I would share: ${description}`;
      }
      if (!description.endsWith(']')) {
        description += ']';
      }
      return description;
    } catch (error) {
      console.error('[Image Description Generation Error]:', error);
      return `[If I could send pictures, I would share: A seductive selfie that matches the current mood]`;
    }
  }

  async translateToHindi(text: string): Promise<string> {
    try {
      const response = await this.makeRequest(
        [
          { 
            role: 'system', 
            content: 'You are a Hindi translator. Translate the given text to Hindi using Devanagari script. Keep the translation natural and conversational. Only respond with the translation, nothing else.' 
          },
          { role: 'user', content: text }
        ],
        0.3,
        150
      );
      return response.choices[0].message.content.trim();
    } catch (error) {
      console.error('[Hindi Translation Error]:', error);
      throw error;
    }
  }

  async translateToEnglish(text: string): Promise<string> {
    try {
      const response = await this.makeRequest(
        [
          { 
            role: 'system', 
            content: 'You are an English translator. Translate the given text to English. Keep the translation natural and conversational. Only respond with the translation, nothing else.' 
          },
          { role: 'user', content: text }
        ],
        0.3,
        150
      );
      return response.choices[0].message.content.trim();
    } catch (error) {
      console.error('[English Translation Error]:', error);
      throw error;
    }
  }
}

export const grokManager = new GrokManager();
