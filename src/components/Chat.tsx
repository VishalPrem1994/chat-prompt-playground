import React, { useState, useRef, useEffect } from 'react';
import { saladCloudManager } from '../utils/saladCloudManager';
import { analyzeConversation } from '../utils/promptManager';
import { Message, AIPersonality } from '../types';  // Import shared types
import { MessageAnalyzer } from '../utils/messageAnalyzer';

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
  const messageAnalyzer = new MessageAnalyzer();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    console.log('API Key available:', !!import.meta.env.VITE_SALAD_API_KEY);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    console.log('Sending message:', userMessage);
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Check for picture request
      const isPictureRequest = await saladCloudManager.detectPictureRequest(userMessage.content);
      if (isPictureRequest) {
        const pictureResponse = await saladCloudManager.generateImageDescription(
          personality.name,
          userMessage.content,
          messages
        );
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: pictureResponse,
          timestamp: new Date()
        }]);
        setIsLoading(false);
        return;
      }

      // Check for boredom
      const isBored = await saladCloudManager.detectBoredom(
        messages.map(m => `${m.role}: ${m.content}`).join('\n'),
        boredCount,
        lastResponseTime
      );

      let aiResponse: string;
      if (isBored) {
        setBoredCount(prev => prev + 1);
        aiResponse = await saladCloudManager.generateScenario(
          personality.systemPrompt,
          messages.map(m => `${m.role}: ${m.content}`).join('\n')
        );
      } else {
        aiResponse = await saladCloudManager.generateResponse(
          personality.systemPrompt,
          [...messages, userMessage]
        );
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setLastResponseTime(Date.now());
    } catch (error) {
      console.error('Error getting AI response:', error);
      // Add user-facing error message
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I had trouble responding. Please try again.',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
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
              <p className="whitespace-pre-wrap">{message.content}</p>
              <span className="text-xs opacity-75 mt-1 block">
                {message.timestamp?.toLocaleTimeString() || new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="bg-primary text-light rounded-lg p-3">
              <p>Typing...</p>
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