import React, { useState, useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';

interface AIPersonality {
  id: string;
  name: string;
  description: string;
  avatar: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Props {
  socket: Socket;
  personality: AIPersonality;
  onBack: () => void;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  userId: string;
}

const Chat: React.FC<Props> = ({ socket, personality, onBack, messages, setMessages, userId }) => {
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log('Setting up chat with personality:', personality.name);
    
    socket.on('message', (message: Message) => {
      console.log('Received message from server:', message);
      setMessages(prev => [...prev, {
        ...message,
        timestamp: new Date(message.timestamp)
      }]);
      setIsTyping(false);
    });

    socket.on('error', (error) => {
      console.error('Received error from server:', error);
    });

    return () => {
      console.log('Cleaning up chat event listeners');
      socket.off('message');
      socket.off('error');
    };
  }, [socket, personality]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    console.log('Sending message:', inputMessage);
    const newMessage = {
      role: 'user' as const,
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    // Add user message to history first
    setMessages(prev => [...prev, newMessage]);
    
    // Then send to socket
    socket.emit('message', inputMessage, userId);
    setInputMessage('');
    setIsTyping(true);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
                {message.timestamp.toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start mb-4">
            <div className="bg-primary text-light rounded-lg p-3">
              <p>Typing...</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="p-4 bg-secondary">
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