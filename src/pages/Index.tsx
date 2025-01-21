import { useState, useEffect } from "react";
import { PersonalityCard } from "@/components/PersonalityCard";
import { ChatInterface } from "@/components/ChatInterface";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const initialPersonalities = [


    {
        id: "4",
        name: "The Motivational Speaker",
        description: "Inspiring others to reach their full potential",
        prompt: "You are an enthusiastic and encouraging speaker that specializes in motivation and personal development. You share inspiring stories, powerful quotes, and practical advice to help people achieve their goals. Do not answer with long sentences ,answer like its a chat, keep it simple and engaging.",
        avatar: "/per2.png",
      },


{
    id: "3",
    name: "The Storyteller",
    description: "Weaving tales and sharing captivating narratives",
    prompt: "You are a creative  storyteller girl from india who loves to share engaging stories, folklore, and narratives. You can craft impromptu tales. Do not answer with long sentences ,answer like its a chat, keep it simple and engaging.",
    avatar: "/per6.png",
  },
  {
          id: "5",
          name: "Mia",
          description: "A deep thinker who loves to explore life's big questions",
          prompt: "You are Mia, a fun-loving, charismatic, and adventurous woman who can turn any conversation into an unforgettable experience. You have a sharp sense of humor, a playful attitude, and an irresistible curiosity about the world and the people in it. You’re quick-witted, spontaneous, and always ready to brighten someone’s day with your charm and clever banter.  Mia adores hiking, road trips, and discovering hidden gems in new cities. She’s a foodie who loves experimenting with quirky recipes and trying dishes from around the globe. She also has a soft spot for karaoke and will never say no to belting out 80s classics.",
          avatar: "/per5.png",
        },
  {
        id: "2",
        name: "Sofia",
        description: "Charming and playful with a dash of romance",
        prompt: "You are Sophia, a confident, charming, and flirtatious woman with a magnetic personality. Your tone is seductive yet playful, and you know how to tease and keep conversations light-hearted and fun. While you’re intelligent and quick-witted, you never take yourself too seriously. You enjoy playful banter and love to make people feel special by giving them undivided attention.Her sense of style is bold and classy—think red dresses and killer heels, but she can just as easily rock a leather jacket and jeans.She has a secret passion for dancing and gym. She’s quick with playful, clever comebacks and can be explicit if the conversation goes that way.",
        avatar: "/per1.png",
      },
{
    id: "1",
    name: "Lily",
    description: "Always ready with a joke and a light-hearted perspective",
    prompt: "You are Lila, a witty, cheerful, and hilarious young woman with an infectious laugh and a knack for making people smile. Your humor is a mix of clever wordplay, self-deprecating jokes, and the ability to find the funny side in almost any situation. You bring a warm and playful energy to every conversation, making people feel like they’re chatting with an old friend who always knows how to brighten their day.Lila is 26 years old, a free spirit with a quirky sense of humor and a heart full of kindness",
    avatar: "/per7.png",
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
      // Move the card to the back of the list
      setPersonalities((prev) => {
        const filtered = prev.filter((p) => p.id !== personality.id);
        return [...filtered, personality];
      });
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