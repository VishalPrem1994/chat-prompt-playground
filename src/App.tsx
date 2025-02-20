import React, { useState, useEffect } from 'react';
import SwipeCards from './components/SwipeCards';
import Chat from './components/Chat';
import MatchedPersonalities from './components/MatchedPersonalities';
import Login from './components/Login';
import Signup from './components/Signup';
import { v4 as uuidv4 } from 'uuid';
import { AIPersonality, Message } from './types';

type View = 'swipe' | 'chat' | 'matches';

const App: React.FC = () => {
  const [selectedPersonality, setSelectedPersonality] = useState<AIPersonality | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<View>('swipe');
  const [matchedPersonalities, setMatchedPersonalities] = useState<AIPersonality[]>([]);
  const [showSignup, setShowSignup] = useState(false);

  useEffect(() => {
    // Get or generate user ID
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
    } else {
      const newUserId = uuidv4();
      localStorage.setItem('userId', newUserId);
      setUserId(newUserId);
    }

    // Load matched personalities from localStorage
    const storedMatches = localStorage.getItem('matchedPersonalities');
    if (storedMatches) {
      setMatchedPersonalities(JSON.parse(storedMatches));
    }
  }, []);

  const handlePersonalitySelect = (personality: AIPersonality) => {
    console.log('Selected personality:', personality);
    setSelectedPersonality(personality);
    setCurrentView('chat');
    setMessages([]); // Clear messages when starting new chat
  };

  const handleSwipeRight = (personality: AIPersonality) => {
    const updatedMatches = [...matchedPersonalities, personality];
    setMatchedPersonalities(updatedMatches);
    localStorage.setItem('matchedPersonalities', JSON.stringify(updatedMatches));
    handlePersonalitySelect(personality);
  };

  const handleBack = () => {
    setSelectedPersonality(null);
    setCurrentView('swipe');
    setMessages([]); // Clear messages when going back
  };

  const handleClearMatch = (personality: AIPersonality) => {
    // Remove from matched personalities
    const updatedMatches = matchedPersonalities.filter(p => p.id !== personality.id);
    setMatchedPersonalities(updatedMatches);
    localStorage.setItem('matchedPersonalities', JSON.stringify(updatedMatches));

    // Add to rejected personalities
    const newRejection = {
      personalityId: personality.id,
      rejectedAt: Date.now()
    };
    const storedRejections = localStorage.getItem(`rejectedPersonalities_${userId}`);
    const existingRejections = storedRejections ? JSON.parse(storedRejections) : [];
    const updatedRejections = [...existingRejections, newRejection];
    localStorage.setItem(`rejectedPersonalities_${userId}`, JSON.stringify(updatedRejections));
  };

  if (!userId) {
    if (showSignup) {
      return (
        <Signup
          onSignup={(id) => setUserId(id)}
          onBackToLogin={() => setShowSignup(false)}
        />
      );
    }
    return (
      <Login
        onLogin={(id) => setUserId(id)}
        onSignupClick={() => setShowSignup(true)}
      />
    );
  }

  const renderView = () => {
    switch (currentView) {
      case 'chat':
        return selectedPersonality ? (
          <Chat
            personality={selectedPersonality}
            onBack={handleBack}
            messages={messages}
            setMessages={setMessages}
            userId={userId}
          />
        ) : null;
      case 'matches':
        return (
          <div className="container mx-auto px-4 py-8">
            <MatchedPersonalities
              personalities={matchedPersonalities}
              onPersonalitySelect={handlePersonalitySelect}
              onClearMatch={handleClearMatch}
            />
          </div>
        );
      default:
        return (
          <div className="container mx-auto px-4 py-8">
            <SwipeCards 
              onPersonalitySelect={handleSwipeRight}
              userId={userId}
            />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      {currentView !== 'chat' && (
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <div className="flex gap-4">
              <button
                onClick={() => setCurrentView('swipe')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentView === 'swipe'
                    ? 'bg-accent text-white'
                    : 'bg-primary text-light hover:bg-opacity-80'
                }`}
              >
                Discover
              </button>
              <button
                onClick={() => setCurrentView('matches')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentView === 'matches'
                    ? 'bg-accent text-white'
                    : 'bg-primary text-light hover:bg-opacity-80'
                }`}
              >
                Matches
              </button>
            </div>
          </div>
        </div>
      )}
      {renderView()}
    </div>
  );
};

export default App; 