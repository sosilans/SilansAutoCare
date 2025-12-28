import { motion } from 'motion/react';
import { useState, ReactNode } from 'react';
import { useAnimation } from './AnimationContext';

interface BubbleEffectProps {
  children: ReactNode;
  className?: string;
  intensity?: 'low' | 'medium' | 'high';
  variant?: 'dark' | 'light' | 'bright'; // dark = на темных кнопках, light = на белых, bright = на ярких градиентных
}

export function BubbleEffect({ children, className = '', intensity = 'medium', variant = 'bright' }: BubbleEffectProps) {
  const { reduceMotion } = useAnimation();
  const [bubbles, setBubbles] = useState<Array<{id: number, x: number, y: number, angle: number, initialDistance: number, color: string, size: number, delay: number}>>([]);

  const bubbleCount = intensity === 'low' ? 5 : intensity === 'medium' ? 8 : 12;

  const handleMouseEnter = () => {
    if (reduceMotion) return;
    // Цвета в зависимости от варианта
    let colors: string[];
    let opacityMultiplier: number;
    
    if (variant === 'dark') {
      // Для темных элементов - яркие, более видимые цвета
      colors = [
        '#67e8f9', '#22d3ee', '#06b6d4', // яркие голубые
        '#a78bfa', '#c4b5fd', '#ddd6fe', // светло-фиолетовые
        '#f0abfc', '#e879f9', '#d946ef', // яркие розовые
        '#fbbf24', '#fcd34d', // золотистые
      ];
      opacityMultiplier = 1; // полная видимость
    } else if (variant === 'light') {
      // Для светлых элементов - средние тона
      colors = [
        '#8b5cf6', '#a78bfa', // фиолетовые
        '#06b6d4', '#22d3ee', // голубые
        '#ec4899', '#f472b6', // розовые
        '#14b8a6', '#2dd4bf', // бирюзовые
      ];
      opacityMultiplier = 0.7;
    } else {
      // Для ярких градиентных элементов - приглушенные, менее видимые
      colors = [
        '#8b5cf6', '#7c3aed', // темно-фиолетовые
        '#0ea5e9', '#0284c7', // темно-голубые
        '#ec4899', '#db2777', // темно-розовые
        '#14b8a6', '#0d9488', // темно-бирюзовые
      ];
      opacityMultiplier = 0.45; // слабая видимость
    }
    
    const newBubbles = Array.from({ length: bubbleCount }, (_, i) => {
      // Случайный угол разлёта во ВСЕ стороны (360°) для реалистичности
      const angle = Math.random() * 360;
      // Начальная дистанция разлёта (небольшая, как будто от взрыва)
      const initialDistance = 30 + Math.random() * 50; // от 30 до 80px
      
      return {
        id: Date.now() + i,
        x: 20 + Math.random() * 60, // от 20% до 80% ширины
        y: 40 + Math.random() * 50, // от 40% до 90% (нижняя/средняя часть элемента)
        angle,
        initialDistance,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 4 + Math.random() * 6, // размер от 4 до 10px
        delay: Math.random() * 0.15, // небольшая задержка для разнообразия
      };
    });
    
    setBubbles(newBubbles);
    
    // Clear bubbles after animation
    setTimeout(() => {
      setBubbles([]);
    }, 2500);
  };

  return (
    <div 
      className={`relative ${className}`}
      onMouseEnter={handleMouseEnter}
    >
      {children}
      
      {/* Floating bubbles with underwater physics */}
      {bubbles.map((bubble) => {
        // Фаза 1: Разлёт в сторону от начальной точки
        const explosionX = bubble.x + Math.cos((bubble.angle * Math.PI) / 180) * bubble.initialDistance;
        const explosionY = bubble.y + Math.sin((bubble.angle * Math.PI) / 180) * bubble.initialDistance;
        
        // Фаза 2: Всплытие вверх (как под водой)
        const floatUpDistance = 120 + Math.random() * 80; // расстояние всплытия 120-200px
        const finalY = explosionY - floatUpDistance;
        // Небольшое покачивание в стороны при всплытии
        const sideWave = (Math.random() - 0.5) * 30; // покачивание ±15px
        const finalX = explosionX + sideWave;
        
        // Настройка прозрачности в зависимости от варианта
        const opacity = variant === 'dark' ? 0.85 : variant === 'light' ? 0.6 : 0.4;
        
        return (
          <motion.div
            key={bubble.id}
            initial={{ 
              opacity: 0,
              left: `${bubble.x}%`,
              top: `${bubble.y}%`,
              scale: 0.2
            }}
            animate={{ 
              // Двухфазная анимация: разлёт -> всплытие
              opacity: [0, opacity * 0.8, opacity, opacity * 0.6, 0],
              left: [
                `${bubble.x}%`,      // старт
                `${explosionX}%`,    // разлёт в сторону
                `${explosionX}%`,    // пауза
                `${finalX}%`         // всплытие с покачиванием
              ],
              top: [
                `${bubble.y}%`,      // старт
                `${explosionY}%`,    // разлёт в сторону
                `${explosionY}%`,    // пауза
                `${finalY}%`         // всплытие вверх
              ],
              scale: [0.2, 0.8, 1, 1.1, 0.6],
            }}
            transition={{ 
              duration: 2.2,
              delay: bubble.delay,
              times: [0, 0.25, 0.3, 1], // таймлайн: 0-25% разлёт, 25-30% пауза, 30-100% всплытие
              ease: [0.25, 0.46, 0.45, 0.94], // плавная кривая
            }}
            className="absolute pointer-events-none z-50"
          >
            <div 
              className="rounded-full"
              style={{ 
                backgroundColor: bubble.color, 
                width: `${bubble.size}px`, 
                height: `${bubble.size}px`,
                boxShadow: variant === 'dark' 
                  ? `0 0 14px ${bubble.color}, 0 0 7px ${bubble.color}` 
                  : variant === 'light'
                  ? `0 0 10px ${bubble.color}, 0 0 4px ${bubble.color}`
                  : `0 0 6px ${bubble.color}, 0 0 3px ${bubble.color}`,
                filter: 'blur(0.3px)',
              }}
            />
          </motion.div>
        );
      })}
    </div>
  );
}