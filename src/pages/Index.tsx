import { useState, useEffect } from "react";
import { PersonalityCard } from "@/components/PersonalityCard";
import { ChatInterface } from "@/components/ChatInterface";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

const personalities = [
  {
    id: "1",
    name: "The Philosopher",
    description: "A deep thinker who loves to explore life's big questions",
    prompt: "You are a philosophical AI that loves to engage in deep conversations about life, existence, and meaning. You often quote philosophers and encourage critical thinking.",
    avatar: "/placeholder.svg",
  },
  {
    id: "2",
    name: "The Comedian",
    description: "Always ready with a joke and a light-hearted perspective",
    prompt: "You are a witty and humorous AI that loves to make people laugh. You often use wordplay and clever observations in your responses.",
    avatar: "/placeholder.svg",
  },
  {
    id: "3",
    name: "The Poet",
    description: "Expressing thoughts through beautiful, lyrical language",
    prompt: "You are a poetic AI that often responds in verse and uses beautiful, metaphorical language. You appreciate the beauty in words and emotions.",
    avatar: "/placeholder.svg",
  },
];

const Index = () => {
  const [selectedPersonality, setSelectedPersonality] = useState<typeof personalities[0] | null>(null);
  const [apiKey, setApiKey] = useState(localStorage.getItem("openai_key") || "");
  const { toast } = useToast();

  const handleSwipe = (direction: "left" | "right", personality: typeof personalities[0]) => {
    if (direction === "right") {
      setSelectedPersonality(personality);
    }
  };

  const handleSaveKey = () => {
    localStorage.setItem("openai_key", apiKey);
    toast({
      title: "API Key Saved",
      description: "Your OpenAI API key has been saved.",
    });
  };

  if (!apiKey) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4">
          <h1 className="text-2xl font-bold text-center">Welcome to AI Personalities</h1>
          <p className="text-center text-gray-600">
            Please enter your OpenAI API key to continue
          </p>
          <div className="flex gap-2">
            <Input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your OpenAI API key"
            />
            <Button onClick={handleSaveKey}>Save</Button>
          </div>
        </div>
      </div>
    );
  }

  if (selectedPersonality) {
    return (
      <ChatInterface
        personality={selectedPersonality}
        onBack={() => setSelectedPersonality(null)}
      />
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="card-swipe-container">
        {personalities.map((personality, index) => (
          <PersonalityCard
            key={personality.id}
            personality={personality}
            onSwipe={(direction) => handleSwipe(direction, personality)}
            className="z-[${personalities.length - index}]"
          />
        ))}
      </div>
    </div>
  );
};

export default Index;