import { Message } from '../types';

interface ConversationContext {
  history: Message[];
  personality: string;
  boredCount: number;
  lastResponseTime: number;
}

interface ConversationDecision {
  isUserBored: boolean;
  suggestedResponse?: string;
}


export async function analyzeConversation(
  message: string,
  context: ConversationContext
): Promise<ConversationDecision> {
  // Simple analysis without API calls
  const decision: ConversationDecision = {
    isUserBored: false
  };

  // Check for explicit boredom indicators
  const boredPhrases = ['boring', 'bored', 'not interesting', 'meh'];
  const isExplicitlyBored = boredPhrases.some(phrase => 
    message.toLowerCase().includes(phrase)
  );

  // Check for short responses
  const isShortResponse = message.split(' ').length <= 2;

  // Check response time
  const responseDelay = Date.now() - context.lastResponseTime;
  const isSlowResponse = responseDelay > 30000; // 30 seconds

  // Determine if user is bored
  decision.isUserBored = isExplicitlyBored || 
    (isShortResponse && context.boredCount > 2) ||
    (isSlowResponse && context.boredCount > 1);

  // Generate engagement response if needed
  if (decision.isUserBored) {
    decision.suggestedResponse = getEngagementResponse(context);
  }

  return decision;
}

function getEngagementResponse(context: ConversationContext): string {
  const engagementResponses = [
    "I sense you might be looking for something more interesting. What topics truly fascinate you?",
    "Let's shake things up! What's something you've always wanted to discuss?",
    "I feel our conversation could use a spark. What's on your mind lately?",
    "You know what would be interesting? Tell me about your most recent adventure!",
    "I'd love to hear your thoughts on something different. What's the last thing that really excited you?"
  ];

  return engagementResponses[Math.floor(Math.random() * engagementResponses.length)];
} 