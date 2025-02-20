import React, { useState, useEffect, TouchEvent } from 'react';
import { AIPersonality } from '../types';
import { aiPersonalities } from '../config/personalities';

interface Props {
  onPersonalitySelect: (personality: AIPersonality) => void;
  userId: string;
}

const REJECTION_COOLDOWN = 1000 * 10; // 10 seconds

interface RejectedPersonality {
  personalityId: string;
  rejectedAt: number;
}

const SwipeCards: React.FC<Props> = ({ onPersonalitySelect, userId }) => {
  const [personalities, setPersonalities] = useState<AIPersonality[]>([]);
  const [lastDirection, setLastDirection] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rejectedPersonalities, setRejectedPersonalities] = useState<RejectedPersonality[]>([]);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const fetchPersonalities = () => {
    // Get matched personalities from localStorage
    const storedMatches = localStorage.getItem('matchedPersonalities');
    const matchedIds = storedMatches ? JSON.parse(storedMatches).map((p: AIPersonality) => p.id) : [];
    
    // Get and filter rejected personalities
    const storedRejections = localStorage.getItem(`rejectedPersonalities_${userId}`);
    const rejections: RejectedPersonality[] = storedRejections ? JSON.parse(storedRejections) : [];
    const currentTime = Date.now();
    
    // Clean up expired rejections
    const activeRejections = rejections.filter(
      r => currentTime - r.rejectedAt < REJECTION_COOLDOWN
    );
    setRejectedPersonalities(activeRejections);

    // Filter available personalities
    const availablePersonalities = aiPersonalities.filter((p) => 
      !matchedIds.includes(p.id) && 
      !activeRejections.find(r => r.personalityId === p.id)
    );
    
    setPersonalities(availablePersonalities);
    setLoading(false);
  };

  useEffect(() => {
    fetchPersonalities();
    // Refresh personalities every second to check for expired cooldowns
    const interval = setInterval(fetchPersonalities, 1000);
    return () => clearInterval(interval);
  }, [userId]);

  const handleSwipe = (direction: string, personality: AIPersonality) => {
    setLastDirection(direction);
    if (direction === 'right') {
      onPersonalitySelect(personality);
    } else if (direction === 'left') {
      const newRejection = {
        personalityId: personality.id,
        rejectedAt: Date.now()
      };
      const updatedRejections = [...rejectedPersonalities, newRejection];
      setRejectedPersonalities(updatedRejections);
      localStorage.setItem(`rejectedPersonalities_${userId}`, JSON.stringify(updatedRejections));
    }
  };

  const getNextAvailableTime = (): number | null => {
    if (rejectedPersonalities.length === 0) return null;
    const earliestRejection = Math.min(
      ...rejectedPersonalities.map(r => r.rejectedAt)
    );
    return earliestRejection + REJECTION_COOLDOWN;
  };

  const formatTimeLeft = (timestamp: number): string => {
    const secondsLeft = Math.ceil((timestamp - Date.now()) / 1000);
    return `${secondsLeft}s`;
  };

  const handleTouchStart = (e: TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (personality: AIPersonality) => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      handleSwipe('left', personality);
    } else if (isRightSwipe) {
      handleSwipe('right', personality);
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-white text-xl">Loading personalities...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  if (personalities.length === 0) {
    const nextAvailableTime = getNextAvailableTime();
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="text-white text-xl mb-4">No personalities available right now!</div>
        {nextAvailableTime && (
          <p className="text-light mb-2">
            Next personality available in: {formatTimeLeft(nextAvailableTime)}
          </p>
        )}
        <p className="text-light">Check back soon for new matches</p>
        <p className="text-light mt-2">Or view your existing matches</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="w-full max-w-sm h-[60vh] relative">
        {personalities.map((personality, index) => {
          if (index !== personalities.length - 1) return null;

          return (
            <div
              key={personality.id}
              className="absolute w-full h-full"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={() => handleTouchEnd(personality)}
            >
              <div className="w-full h-full bg-primary rounded-2xl shadow-xl p-6 flex flex-col items-center justify-center cursor-grab border border-secondary">
                <div className="relative w-[75%] aspect-square mb-4 rounded-full overflow-hidden">
                  <img
                    src={personality.avatar}
                    alt={personality.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {personality.name}
                </h2>
                <p className="text-light text-center">
                  {personality.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-8 text-light text-center">
        <p>Swipe right to chat, left to skip!</p>
        {lastDirection && (
          <p>You swiped {lastDirection}</p>
        )}
        {rejectedPersonalities.length > 0 && getNextAvailableTime() && (
          <p className="mt-2 text-sm">
            {rejectedPersonalities.length} skipped {rejectedPersonalities.length === 1 ? 'personality' : 'personalities'} will be available in: {formatTimeLeft(getNextAvailableTime()!)}
          </p>
        )}
      </div>
    </div>
  );
};

export default SwipeCards; 