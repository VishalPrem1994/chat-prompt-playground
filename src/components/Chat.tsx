import React, { useState, useRef, useEffect, useMemo } from 'react';
import { analyzeConversation } from '../utils/promptManager';
import { Message, AIPersonality, MessageContent } from '../types';  // Import shared types
import { MessageAnalyzer } from '../utils/messageAnalyzer';
import { LanguageManager } from '../utils/languageManager';
import { GrokManager } from '../utils/grokManager';

interface ChatProps {
  personality: AIPersonality;
  onBack: () => void;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  userId: string;
}

const Chat: React.FC<ChatProps> = ({
  personality,
  onBack,
  messages,
  setMessages,
  userId
}) => {
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [boredCount, setBoredCount] = useState(0);
  const [lastResponseTime, setLastResponseTime] = useState(Date.now());
  
  const languageManager = useMemo(() => new LanguageManager(new GrokManager()), []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    // Process user message for multiple languages
    
    
    let userMessage: Message = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    console.log('Sending message:', userMessage);
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Check for picture request
      const processedContent = await languageManager.processUserMessage(inputMessage.trim());
      userMessage = {
        role: 'user',
        content: processedContent,
        timestamp: new Date()
      };
      
      const isPictureRequest = await languageManager.detectPictureRequest(userMessage);
      if (isPictureRequest) {
        const pictureResponse = await languageManager.generateImageDescription(
          personality.name,
          userMessage,
          [...messages, userMessage]
        );
        const processedResponse = await languageManager.processAssistantResponse(pictureResponse);
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: processedResponse,
          timestamp: new Date()
        }]);
        setIsLoading(false);
        return;
      }

      // Check for boredom
      const isBored = await languageManager.detectBoredom(
        [...messages, userMessage],
        boredCount,
        lastResponseTime
      );

      let aiResponse: string;
      if (isBored) {
        setBoredCount(prev => prev + 1);
        aiResponse = await languageManager.generateScenario(
          personality.systemPrompt,
          [...messages, userMessage]
        );
      } else {
        aiResponse = await languageManager.generateResponse(
          personality.systemPrompt,
          [...messages, userMessage]
        );
      }

      const processedResponse = await languageManager.processAssistantResponse(aiResponse);
      const assistantMessage: Message = {
        role: 'assistant',
        content: processedResponse,
        timestamp: new Date()
      };

      console.log('Current Full Conversation:', [...messages, userMessage, assistantMessage]);

      setMessages(prev => [...prev, assistantMessage]);
      setLastResponseTime(Date.now());
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorResponse = await languageManager.processAssistantResponse('Sorry, I had trouble responding. Please try again.');
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: errorResponse,
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessageContent = (content: string | MessageContent[]): string => {
    if (typeof content === 'string') {
      return content;
    }
    // For multilingual content, prefer Hindi if available, fallback to English
    const hindiContent = content.find(c => c.language === 'hindi');
    const englishContent = content.find(c => c.language === 'english');
    return hindiContent?.content || englishContent?.content || content[0].content;
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-primary">
      <div className="bg-secondary p-4 flex items-center">
        <button
          onClick={onBack}
          className="text-light hover:text-white mr-4 text-xl"
        >
          ←
        </button>
        <div className="flex items-center">
          <img 
            src={personality.avatar} 
            alt={personality.name}
            className="w-12 h-12 rounded-full object-cover mr-2"
          />
          <div>
            <h2 className="text-xl font-bold text-white">{personality.name}</h2>
            <p className="text-sm text-light opacity-75">{personality.description}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-dark">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-4 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-accent text-white'
                  : 'bg-primary text-light'
              }`}
            >
              <p className="whitespace-pre-wrap">{renderMessageContent(message.content)}</p>
              {Array.isArray(message.content) && message.content.length > 1 && (
                <div className="text-xs opacity-75 mt-1">
                  {message.content.map((c, i) => (
                    <span key={i} className="mr-2">
                      {c.language === 'hindi' ? 'हिंदी' : 'English'}
                    </span>
                  ))}
                </div>
              )}
              <span className="text-xs opacity-75 mt-1 block">
                {message.timestamp?.toLocaleTimeString() || new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="bg-primary text-light rounded-lg p-3">
              <p>{"Typing..."}</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 bg-secondary">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 p-3 bg-primary border border-secondary rounded-lg focus:outline-none focus:border-accent text-light"
          />
          <button
            type="submit"
            className="bg-accent text-white px-6 py-3 rounded-lg hover:bg-opacity-90 transition-colors font-semibold"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chat; 