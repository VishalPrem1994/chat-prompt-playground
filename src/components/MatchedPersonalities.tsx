import React from 'react';
import { AIPersonality } from '../types';

interface Props {
  personalities: AIPersonality[];
  onPersonalitySelect: (personality: AIPersonality) => void;
  onClearMatch?: (personality: AIPersonality) => void;
}

const MatchedPersonalities: React.FC<Props> = ({ personalities, onPersonalitySelect, onClearMatch }) => {
  if (personalities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <p className="text-white text-xl mb-4">No matches yet!</p>
        <p className="text-light">Swipe right on personalities to start chatting</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-6">Your Matches</h2>
      <div className="grid gap-4">
        {personalities.map((personality) => (
          <div
            key={personality.id}
            className="bg-primary rounded-lg p-4 hover:bg-opacity-80 transition-colors border border-secondary"
          >
            <div className="flex items-center justify-between">
              <div 
                className="flex items-center flex-1 cursor-pointer"
                onClick={() => onPersonalitySelect(personality)}
              >
                <img 
                  src={personality.avatar} 
                  alt={personality.name}
                  className="w-16 h-16 rounded-full object-cover mr-4"
                />
                <div>
                  <h3 className="text-xl font-semibold text-white">{personality.name}</h3>
                  <p className="text-light">{personality.description}</p>
                </div>
              </div>
              {onClearMatch && (
                <button
                  onClick={() => onClearMatch(personality)}
                  className="ml-4 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                  title="Remove match"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MatchedPersonalities; 