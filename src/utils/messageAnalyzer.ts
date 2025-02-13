import { Message } from '../types';

export class MessageAnalyzer {
  async detectPictureRequest(message: string): Promise<boolean> {
    const pictureKeywords = [
      'pic', 'picture', 'photo', 'image', 'selfie',
      'look like', 'show me', 'send me', 'share'
    ];
    
    const messageLC = message.toLowerCase();
    return pictureKeywords.some(keyword => messageLC.includes(keyword));
  }

  async detectBoredom(
    messages: Message[], 
    boredCount: number, 
    lastResponseTime: number
  ): Promise<boolean> {
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage) return false;

    // Check for explicit boredom indicators
    const boredPhrases = ['boring', 'bored', 'not interesting', 'meh'];
    const isExplicitlyBored = boredPhrases.some(phrase => 
      lastMessage.content.toLowerCase().includes(phrase)
    );

    // Check for short responses
    const isShortResponse = lastMessage.content.split(' ').length <= 2;

    // Check response time
    const responseDelay = Date.now() - lastResponseTime;
    const isSlowResponse = responseDelay > 30000; // 30 seconds

    return isExplicitlyBored || 
      (isShortResponse && boredCount > 2) ||
      (isSlowResponse && boredCount > 1);
  }

  getEngagementResponse(): string {
    const responses = [
      "I sense you might be looking for something more interesting. What topics fascinate you?",
      "Let's shake things up! What's something you've always wanted to discuss?",
      "I feel our conversation could use a spark. What's on your mind lately?",
      "You know what would be interesting? Tell me about your recent adventures!",
      "I'd love to hear your thoughts on something different. What excites you?"
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }

  getPictureResponse(personality: string): string {
    return `[If I could send pictures, I would share a lovely selfie of me smiling at you. But for now, let's keep chatting and get to know each other better!]`;
  }
} 