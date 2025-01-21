import { motion, PanInfo } from "framer-motion";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface PersonalityCardProps {
  personality: {
    id: string;
    name: string;
    description: string;
    prompt: string;
    avatar: string;
  };
  onSwipe: (direction: "left" | "right") => void;
  className?: string;
}

export const PersonalityCard = ({ personality, onSwipe, className }: PersonalityCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipeThreshold = 100;
    if (Math.abs(info.offset.x) > swipeThreshold) {
      if (info.offset.x < 0) {
        // Left swipe
        setIsFlipped(true);
        setTimeout(() => {
          onSwipe("left");
        }, 500); // Wait for animation to complete
      } else {
        // Right swipe
        onSwipe("right");
      }
    }
  };

  return (
    <motion.div
      className={cn("personality-card perspective-1000", className)}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 1.05 }}
      animate={{ 
        scale: 1,
        rotateY: isFlipped ? 180 : 0,
        transition: { duration: 0.5 }
      }}
    >
      <div className="w-full h-full rounded-3xl overflow-hidden bg-white shadow-xl preserve-3d">
        {/* Front of the card */}
        <motion.div
          className="absolute w-full h-full backface-hidden"
          style={{ 
            backfaceVisibility: "hidden",
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          <div className="relative h-3/4">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50" />
            <img
              src={personality.avatar}
              alt={personality.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 left-4 text-white">
              <h2 className="text-2xl font-bold">{personality.name}</h2>
            </div>
          </div>
          <div className="p-4">
            <p className="text-gray-600">{personality.description}</p>
          </div>
        </motion.div>

        {/* Back of the card */}
        <motion.div
          className="absolute w-full h-full backface-hidden bg-white flex items-center justify-center p-6"
          style={{ 
            backfaceVisibility: "hidden",
            transform: isFlipped ? "rotateY(0deg)" : "rotateY(-180deg)",
          }}
        >
          <p className="text-center text-gray-600">Swipe complete! 👋</p>
        </motion.div>
      </div>
    </motion.div>
  );
};