import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTheme } from './ThemeContext';
import { useAnimation } from './AnimationContext';

interface Bubble {
  id: number;
  x: number;
  delay: number;
  duration: number;
  size: number;
}

export function FloatingBubbles() {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const { theme } = useTheme();
  const { reduceMotion } = useAnimation();

  useEffect(() => {
    if (reduceMotion) {
      setBubbles([]);
      return;
    }
    // Create initial bubbles
    const initialBubbles: Bubble[] = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 10,
      duration: 8 + Math.random() * 6,
      size: 20 + Math.random() * 24,
    }));
    setBubbles(initialBubbles);

    // Add new bubbles periodically
    const interval = setInterval(() => {
      setBubbles((prev) => {
        const newBubble: Bubble = {
          id: Date.now(),
          x: Math.random() * 100,
          delay: 0,
          duration: 8 + Math.random() * 6,
          size: 20 + Math.random() * 24,
        };
        // Keep only last 18 bubbles to avoid memory issues
        return [...prev.slice(-17), newBubble];
      });
    }, 2000); // New bubble every 2 seconds

    return () => clearInterval(interval);
  }, [reduceMotion]);

  if (reduceMotion) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {bubbles.map((bubble) => (
        <motion.div
          key={bubble.id}
          initial={{ 
            y: '100vh',
            x: `${bubble.x}vw`,
            opacity: 0,
            scale: 0.5,
          }}
          animate={{
            y: '-10vh',
            x: `${bubble.x + (Math.random() - 0.5) * 20}vw`,
            opacity: theme === 'dark' 
              ? [0, 0.55, 0.75, 0.55, 0]  // -15% от [0, 0.7, 0.9, 0.7, 0]
              : [0, 0.25, 0.45, 0.25, 0], // -15% от [0, 0.4, 0.6, 0.4, 0]
            scale: [0.5, 1, 0.8, 1, 0.5],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: bubble.duration,
            delay: bubble.delay,
            ease: "easeInOut",
            repeat: Infinity,
            repeatDelay: Math.random() * 5,
          }}
          className="absolute"
          style={{
            width: bubble.size,
            height: bubble.size,
          }}
        >
          <Sparkles 
            className={`w-full h-full ${
              theme === 'dark' 
                ? 'text-cyan-400/60 fill-blue-300/40' 
                : 'text-blue-400/50 fill-cyan-300/30'
            }`}
            style={{
              filter: theme === 'dark' ? 'blur(1px) drop-shadow(0 0 8px rgba(34, 211, 238, 0.5))' : 'blur(1px)',
            }}
          />
        </motion.div>
      ))}
    </div>
  );
}