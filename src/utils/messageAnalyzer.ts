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


} 