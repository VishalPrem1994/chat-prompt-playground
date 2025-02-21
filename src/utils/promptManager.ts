 import { Message } from "../types";
 import { ChatMessage } from "../utils/saladCloudManager";
 class PromptManager {
    

    public getDetectPictureResponsePrompt(message: string) {
        return  `Analyze if the user is requesting or asking for a picture/photo/image.
        Message: "${message}"
        
        Consider these indicators:
        1. Direct requests ("send a pic", "show me a photo")
        2. Indirect requests ("what do you look like", "can I see you")
        3. References to visual content ("selfie", "picture", "photo", "image")
        
        Respond with only "true" if the user is requesting a picture, or "false" if not.`
    }

    public checkIfHindiNeededPrompt(message: string) {
        return `Determine if the user wants to talk in hindi.
        Message: "${message}"
        
        Consider these indicators:
        1. Direct requests ("Can we talk in hindi?")
        2. The user is using hindi words or phrases to speak
        
        Respond with only "true" if the user needs a Hindi translation, or "false" if not.`
    }

    public boredomPrompt(messages: ChatMessage[], boredCount: number, timeSinceLastResponse: number) {
      
        return `Analyze if the user seems bored or disengaged in this conversation.
                If the user says something like "I'm bored" or "I'm not interested" or "I'm not in the mood" or "I'm not feeling like talking", then respond with true.
            Otherwise Consider these factors:
            1. Short or one-word responses
            2. Delayed responses
            3. Lack of engagement or enthusiasm
            4. Repetitive responses
            5. Signs of distraction
            6. Says he/she is bored

            Recent conversation:
            ${messages.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

            Time since last response: ${timeSinceLastResponse}ms
            Previous boredom count: ${boredCount}

            Respond with only "true" if user seems bored, or "false" if they seem engaged.`;
    }


    public generateScenarioPrompt(personality: string, conversationContext: ChatMessage[]) {
        return `Generate a short, engaging roleplay scenario to spice up the conversation.
                The scenario should match your personality and be flirty but not explicit.
                Keep it under 100 words and make it feel natural. No childish content or language.
                Previous conversation context: ${conversationContext.map(msg => `${msg.role}: ${msg.content}`).join('\n')}`
    }

    public generateImageDescriptionPrompt(personality: string, message: string, simpleHistory: ChatMessage[]) {
        return `You are ${personality}. Based on the following chat history and current context, generate a seductive but tasteful description of a picture you would share. The description should match the current mood and conversation flow.

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

                Respond only with the picture description.` 
    }
    


    
    
  
    
}


export const promptManager = new PromptManager(); 