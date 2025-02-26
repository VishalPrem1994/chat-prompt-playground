import { Message, MessageContent } from '../types';
import { grokManager } from './grokManager';
import { saladCloudManager } from './saladCloudManager';

interface GrokManager {
  translateToEnglish(text: string): Promise<string>;
}

export class LanguageManager {
  
  private userPreferredLanguage: 'english' | 'hindi' = 'english';


   private async isHindi(text: string): Promise<boolean> {
    // Basic Hindi detection - checks for Devanagari Unicode range
    return await saladCloudManager.checkIfHindiNeeded(text);
  }

  private createMultilingualMessage(content: string, detectedLanguage: string): MessageContent[] {
    return [{
      language: detectedLanguage,
      content: content
    }];
  }

  private getEnglishContent(content: string | MessageContent[]): string {
    if (typeof content === 'string') {
      return content;
    }
    const englishContent = content.find(c => c.language === 'english');
    return englishContent ? englishContent.content : content[0].content;
  }

  setUserPreferredLanguage(language: 'english' | 'hindi') {
    this.userPreferredLanguage = language;
  }

  async processUserMessage(message: string): Promise<MessageContent[]> {
    console.log('[Language Manager] Processing User Message:', message);
    if (await this.isHindi(message)) {
      // If Hindi is detected, translate to English and store both versions
      this.userPreferredLanguage = 'hindi';
      console.log('[Language Manager] Hindi Detected:', message);
      const englishTranslation = await grokManager.translateToEnglish(message);
      return [
        {
          language: 'hindi',
          content: message
        },
        {
          language: 'english',
          content: englishTranslation
        }
      ];
    }

    console.log('[Language Manager] Only English :', message);
    // Default to English if no other language is detected
    this.userPreferredLanguage = 'english';
    return this.createMultilingualMessage(message, 'english');
  }

  private convertToSaladCloudFormat(messages: Message[]): { role: 'user' | 'assistant'; content: string }[] {
    return messages.map(message => ({
      role: message.role,
      content: this.getEnglishContent(message.content)
    }));
  }

  async processAssistantResponse(response: string): Promise<MessageContent[]> {
    console.log('[Language Manager] Assistant Response In English:', response);
    // If user's preferred language is Hindi, translate the response
    if (this.userPreferredLanguage === 'hindi') {
      
      const hindiTranslation = await grokManager.translateToHindi(response);
      console.log('[Language Manager] Hindi Added:', hindiTranslation);
      return [
        {
          language: 'hindi',
          content: hindiTranslation
        },
        {
          language: 'english',
          content: response
        }
      ];
    }

    console.log('[Language Manager] Only English :', response);
    // Default to English response
    return this.createMultilingualMessage(response, 'english');
  }

  async detectPictureRequest(messages: Message): Promise<boolean> {
    const saladCloudMessages = this.convertToSaladCloudFormat([messages]);
    return grokManager.detectPictureRequest(saladCloudMessages.map(msg => msg.content).join('\n'));
  }

  async detectBoredom(messages: Message[], boredCount: number, timeSinceLastResponse: number): Promise<boolean> {
    const saladCloudMessages = this.convertToSaladCloudFormat(messages);
    return grokManager.detectBoredom(saladCloudMessages, boredCount, timeSinceLastResponse);
  }

  async generateScenario(personality: string, messages: Message[]): Promise<string> {
    const saladCloudMessages = this.convertToSaladCloudFormat(messages);
    return grokManager.generateScenario(personality, saladCloudMessages);
  }

  async generateResponse(systemPrompt: string, messages: Message[]): Promise<string> {
    const saladCloudMessages = this.convertToSaladCloudFormat(messages);
    return grokManager.generateResponse(systemPrompt, saladCloudMessages);
  }

  async generateImageDescription(personality: string, message: Message, messages: Message[]): Promise<string> {
    const saladCloudMessages = this.convertToSaladCloudFormat(messages);
    const englishMessage = this.getEnglishContent(message.content);
    return grokManager.generateImageDescription(personality, englishMessage, saladCloudMessages);
  }
} 