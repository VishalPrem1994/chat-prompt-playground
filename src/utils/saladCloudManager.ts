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

export class SaladCloudManager {
    private readonly apiKey: string;
  private readonly baseUrl: string = '/api/chat'//'https://jujube-spinach-40dapeep3i9p2t75.salad.cloud/v1/chat/completions';
  private readonly model: string = 'hf.co/ArliAI/Mistral-Small-22B-ArliAI-RPMax-v1.1-GGUF:Q5_K_M';

  constructor() {
    const apiKey = import.meta.env.VITE_SALAD_API_KEY;
    if (!apiKey) {
      throw new Error('SALAD_API_KEY is not set in environment variables');
    }
    this.apiKey = apiKey;
  }

   async makeRequest(messages: ChatMessage[], temperature: number = 0.7, maxTokens: number = 150): Promise<ChatResponse> {
    console.log('\n[Salad Cloud API Request]');
    console.log('Messages:', messages);
    console.log('Temperature:', temperature);
    console.log('Max Tokens:', maxTokens);

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature,
        max_tokens: maxTokens
      })
    });

    const rawResponse = await response.text();
    console.log('[Salad Cloud API Raw Response]:', rawResponse);

    if (!response.ok) {
      console.error('[Salad Cloud API Error Status]:', response.status);
      console.error('[Salad Cloud API Error Headers]:', Object.fromEntries(response.headers.entries()));
      throw new Error(`API request failed with status ${response.status}: ${rawResponse}`);
    }

    const data = JSON.parse(rawResponse) as ChatResponse;
    console.log('[Salad Cloud API Parsed Response]:', data);

    return data;
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

      const wantsPicture = response.choices[0].message.content.toLowerCase().includes('true');
      console.log('[Salad Cloud Picture Request Detection Result]:', wantsPicture);
      return wantsPicture;
    } catch (error) {
      console.error('[Salad Cloud Picture Request Detection Error]:', error);
      throw error;
    }
  }

  async detectBoredom(messageHistory: string, boredCount: number, timeSinceLastResponse: number): Promise<boolean> {
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
${messageHistory}

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

      const isBored = response.choices[0].message.content.toLowerCase().includes('true');
      console.log('[Salad Cloud Boredom Detection Result]:', isBored);
      return isBored;
    } catch (error) {
      console.error('[Salad Cloud Boredom Detection Error]:', error);
      throw error;
    }
  }

  async generateScenario(personality: string, conversationContext: string): Promise<string> {
    try {
      const response = await this.makeRequest(
        [
          { role: 'system', content: `You are ${personality}` },
          { role: 'user', content: `Generate a short, engaging roleplay scenario to spice up the conversation. 
            The scenario should match your personality and be flirty but not explicit. 
            Keep it under 100 words and make it feel natural. No childish content or language.
            Previous conversation context: ${conversationContext}` }
        ],
        0.8,
        200
      );

      const scenario = response.choices[0].message.content.trim();
      console.log('[Salad Cloud Scenario Generation Result]:', scenario);
      return scenario;
    } catch (error) {
      console.error('[Salad Cloud Scenario Generation Error]:', error);
      throw error;
    }
  }

  async generateResponse(systemPrompt: string, conversationHistory: ChatMessage[]): Promise<string> {
    try {
      console.log('[Salad Cloud API] Generating response...');
      // Always start with the system prompt to establish personality
      const messages: ChatMessage[] = [
        { role: 'system', content: systemPrompt }
      ];

      // Add conversation history, ensuring each message has proper role
      conversationHistory.forEach(msg => {
        messages.push({
          role: msg.role,
          content: msg.content.trim()
        });
      });

      const response = await this.makeRequest(
        messages,
        0.7,  // temperature for creative responses
        150   // max tokens for response length
      );

      const aiResponse = response.choices[0].message.content.trim();
      console.log('[Salad Cloud Response Generation Result]:', aiResponse);
      return aiResponse;
    } catch (error) {
      console.error('[Salad Cloud Response Generation Error]:', error);
      throw error;
    }
  }

  async generateImageDescription(
    personality: string,
    message: string,
    history: { role: string; content: string }[]
  ): Promise<string> {
    try {
      const response = await this.makeRequest(
        [
          { role: 'system', content: 'You are a picture description generator. Generate only the picture description.' },
          { role: 'user', content: `You are ${personality}. Based on the following chat history and current context, generate a seductive but tasteful description of a picture you would share. The description should match the current mood and conversation flow.

Recent chat history:
${history.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

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
      
      // Ensure proper formatting
      if (!description.startsWith('[If I could send pictures')) {
        description = `[If I could send pictures, I would share: ${description}`;
      }
      if (!description.endsWith(']')) {
        description += ']';
      }

      return description;
    } catch (error) {
      console.error('[Image Description Generation Error]', error);
      return `[If I could send pictures, I would share: A seductive selfie that matches the current mood]`;
    }
  }
}

export const saladCloudManager = new SaladCloudManager(); 