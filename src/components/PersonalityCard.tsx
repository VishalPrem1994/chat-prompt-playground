import { motion, PanInfo } from "framer-motion";
import { cn } from "@/lib/utils";

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
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipeThreshold = 100;
    if (Math.abs(info.offset.x) > swipeThreshold) {
      onSwipe(info.offset.x > 0 ? "right" : "left");
    }
  };

  return (
    <motion.div
      className={cn("personality-card", className)}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 1.05 }}
      animate={{ scale: 1 }}
    >
      <div className="w-full h-full rounded-3xl overflow-hidden bg-white shadow-xl">
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
      </div>
    </motion.div>
  );
};