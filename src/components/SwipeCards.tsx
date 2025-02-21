import React, { useState, useEffect } from 'react';
import { AIPersonality } from '../types';
import { aiPersonalities } from '../config/personalities';

interface Props {
  onPersonalitySelect: (personality: AIPersonality) => void;
  userId: string;
}

const PersonalityGrid: React.FC<Props> = ({ onPersonalitySelect, userId }) => {
  const [personalities, setPersonalities] = useState<AIPersonality[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get matched personalities from localStorage
    const storedMatches = localStorage.getItem('matchedPersonalities');
    const matchedIds = storedMatches ? JSON.parse(storedMatches).map((p: AIPersonality) => p.id) : [];
    
    // Filter available personalities (excluding matched ones)
    const availablePersonalities = aiPersonalities.filter((p) => !matchedIds.includes(p.id));
    setPersonalities(availablePersonalities);
    setLoading(false);
  }, [userId]);

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
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="text-white text-xl mb-4">No personalities available right now!</div>
        <p className="text-light">Check back soon for new personalities</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {personalities.map((personality) => (
          <div
            key={personality.id}
            className="bg-primary rounded-2xl shadow-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-opacity-80 transition-colors border border-secondary"
            onClick={() => onPersonalitySelect(personality)}
          >
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
        ))}
      </div>
    </div>
  );
};

export default PersonalityGrid; 