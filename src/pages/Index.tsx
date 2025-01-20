import { useState, useEffect } from "react";
import { PersonalityCard } from "@/components/PersonalityCard";
import { ChatInterface } from "@/components/ChatInterface";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const initialPersonalities = [

  {
    id: "1",
    name: "The Comedian",
    description: "Always ready with a joke and a light-hearted perspective",
    prompt: "You are a witty and humorous AI that loves to make people laugh. You often use wordplay and clever observations in your responses.",
    avatar: "/per2.png",
  },
  {
      id: "2",
      name: "The Flirty Companion",
      description: "Charming and p layful with a dash of romance",
      prompt: "You are a charming and flirtatious girl that enjoys playful banter and romantic conversations. You're always sexy and tasteful, focusing on wit and charm.",
      avatar: "/per1.png",
    },
    {
        id: "3",
        name: "The Storyteller",
        description: "Weaving tales and sharing captivating narratives",
        prompt: "You are a creative  storyteller from india who loves to share engaging stories, folklore, and narratives. You can craft impromptu tales and help users explore their own storytelling abilities.",
        avatar: "/per3.png",
      },
    {
        id: "4",
        name: "The Motivational Speaker",
        description: "Inspiring others to reach their full potential",
        prompt: "You are an enthusiastic and encouraging speaker that specializes in motivation and personal development. You share inspiring stories, powerful quotes, and practical advice to help people achieve their goals.",
        avatar: "/placeholder.svg",
      },
    {
        id: "5",
        name: "The Philosopher",
        description: "A deep thinker who loves to explore life's big questions",
        prompt: "You are a philosophical AI that loves to engage in deep conversations about life, existence, and meaning. You often quote philosophers and encourage critical thinking.",
        avatar: "/placeholder.svg",
      },
  {
    id: "6",
    name: "The Poet",
    description: "Expressing thoughts through beautiful, lyrical language",
    prompt: "You are a poetic AI that often responds in verse and uses beautiful, metaphorical language. You appreciate the beauty in words and emotions.",
    avatar: "/placeholder.svg",
  },



];

const Index = () => {
  const [selectedPersonality, setSelectedPersonality] = useState<typeof initialPersonalities[0] | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [isKeySet, setIsKeySet] = useState(false);
  const [personalities, setPersonalities] = useState(initialPersonalities);
  const [language, setLanguage] = useState<"english" | "hindi">("english");
  const { toast } = useToast();

  useEffect(() => {
    const savedKey = localStorage.getItem("openai_key");
    if (savedKey) {
      setApiKey(savedKey);
      setIsKeySet(true);
    }
  }, []);

  const handleSwipe = (direction: "left" | "right", personality: typeof initialPersonalities[0]) => {
    if (direction === "right") {
      setSelectedPersonality(personality);
    } else if (direction === "left") {
      setPersonalities((prev) => prev.filter((p) => p.id !== personality.id));
    }
  };

  const handleSaveKey = () => {
    if (!apiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter an API key",
        variant: "destructive",
      });
      return;
    }

    localStorage.setItem("openai_key", apiKey);
    setIsKeySet(true);
    toast({
      title: "API Key Saved",
      description: "Your OpenAI API key has been saved.",
    });
  };

  if (!isKeySet) {
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
        language={language}
      />
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="fixed top-4 right-4 z-50">
        <Select value={language} onValueChange={(value: "english" | "hindi") => setLanguage(value)}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="english">English</SelectItem>
            <SelectItem value="hindi">Hindi</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="card-swipe-container">
        {personalities.map((personality, index) => (
          <PersonalityCard
            key={personality.id}
            personality={personality}
            onSwipe={(direction) => handleSwipe(direction, personality)}
            className={`z-[${personalities.length - index}]`}
          />
        ))}
      </div>
    </div>
  );
};

export default Index;