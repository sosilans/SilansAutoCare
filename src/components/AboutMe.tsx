import { motion, AnimatePresence } from 'motion/react';
import { Award, Heart, Sparkles, Smile } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { BubbleEffect } from './BubbleEffect';
import { useTheme } from './ThemeContext';
import { useLanguage } from './LanguageContext';
import { useState, useEffect } from 'react';

export function AboutMe() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, type: 'bubble' | 'star', color: string}>>([]);
  const [floatingBubbles, setFloatingBubbles] = useState<Array<{id: number, x: number, startY: number, color: string, size: number}>>([]);
  
  const carouselImages = [
    {
      src: "/assets/misha.jpg",
      alt: "Misha - Professional Auto Detailing Specialist"
    },
    {
      src: "/assets/misha_1.jpg",
      alt: "Misha at work - Detailing in action"
    }
  ];

  // Auto-scroll carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 3500); // Change slide every 3.5 seconds

    return () => clearInterval(interval);
  }, [carouselImages.length]);

  // Generate particles on slide change
  useEffect(() => {
    const colors = [
      '#8b5cf6', '#a78bfa', '#c4b5fd', // purple
      '#7c3aed', '#6d28d9', '#5b21b6', // dark purple
      '#06b6d4', '#22d3ee', '#67e8f9', // cyan
      '#0ea5e9', '#0284c7', '#0369a1', // blue
    ];
    
    const newParticles = Array.from({ length: 6 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      type: Math.random() > 0.6 ? 'bubble' : 'star' as 'bubble' | 'star',
      color: colors[Math.floor(Math.random() * colors.length)]
    }));
    
    setParticles(newParticles);
    
    const newFloatingBubbles = Array.from({ length: 4 }, (_, i) => ({
      id: Date.now() + 1000 + i,
      x: 10 + Math.random() * 80,
      startY: 70 + Math.random() * 25,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 4 + Math.random() * 8
    }));
    
    setFloatingBubbles(newFloatingBubbles);
    
    const timeout = setTimeout(() => {
      setParticles([]);
      setFloatingBubbles([]);
    }, 2500);
    
    return () => clearTimeout(timeout);
  }, [currentSlide]);
  
  const principles = [
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: '💎 Quality',
      description: 'Only premium products & techniques',
      color: 'from-blue-400 to-cyan-400',
      bgColorLight: 'bg-blue-100',
      bgColorDark: 'bg-blue-900/30',
      borderColor: theme === 'dark' ? 'border-blue-500/30' : 'border-white',
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: '⚡ Precision',
      description: 'Every detail counts — literally',
      color: 'from-purple-400 to-pink-400',
      bgColorLight: 'bg-purple-100',
      bgColorDark: 'bg-purple-900/30',
      borderColor: theme === 'dark' ? 'border-purple-500/30' : 'border-white',
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: '❤️ Passion',
      description: 'This isn\'t work, it\'s art',
      color: 'from-pink-400 to-rose-400',
      bgColorLight: 'bg-pink-100',
      bgColorDark: 'bg-pink-900/30',
      borderColor: theme === 'dark' ? 'border-pink-500/30' : 'border-white',
    },
    {
      icon: <Smile className="w-8 h-8" />,
      title: '😎 Happy Clients',
      description: 'Your car, my pride',
      color: 'from-green-400 to-emerald-400',
      bgColorLight: 'bg-green-100',
      bgColorDark: 'bg-green-900/30',
      borderColor: theme === 'dark' ? 'border-green-500/30' : 'border-white',
    },
  ];

  return (
    <section id="about" className="relative py-20 sm:py-32 overflow-hidden">
      {/* Background Decorations */}
      <div className={`absolute top-10 right-10 w-64 h-64 rounded-full blur-3xl ${
        theme === 'dark'
          ? 'bg-purple-500/10'
          : 'bg-gradient-to-br from-blue-200 to-cyan-200 opacity-30'
      }`}></div>
      <div className={`absolute bottom-10 left-10 w-64 h-64 rounded-full blur-3xl ${
        theme === 'dark'
          ? 'bg-cyan-500/10'
          : 'bg-gradient-to-br from-orange-200 to-pink-200 opacity-30'
      }`}></div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-block px-6 py-2 vhs-gradient gradient-animated text-white rounded-full mb-4 cartoon-shadow-sm vhs-glow">
            <span>About Me</span>
          </div>
          <h2 className="vhs-text mb-4">
            <span className={`text-transparent bg-clip-text ${
              theme === 'dark'
                ? 'bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400'
                : 'bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600'
            }`}>
              Hey, I'm Misha — your Sacramento detailing guy
            </span>
            <span className="ml-2 align-middle text-amber-300 drop-shadow-[0_0_6px_rgba(255,193,7,0.6)]">👋</span>
          </h2>
          <p className={`max-w-2xl mx-auto text-lg ${
            theme === 'dark' ? 'text-purple-200/70' : 'text-gray-600'
          }`}>
            I turn everyday cars into head-turning rides. No rush. No shortcuts. Just precision and passion. 🌟
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-20">
          {/* Image Carousel */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ 
              opacity: 1, 
              x: 0,
              y: [0, -15, 0],
              rotate: [0, 0.5, 0]
            }}
            transition={{ 
              opacity: { duration: 0.6 },
              x: { duration: 0.6 },
              y: {
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              },
              rotate: {
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              }
            }}
            className="relative scale-85"
          >
            {/* Transition particles */}
            {particles.map((particle) => (
              <motion.div
                key={particle.id}
                initial={{ 
                  opacity: 0.8,
                  scale: 1,
                  left: `${particle.x}%`,
                  top: `${particle.y}%`
                }}
                animate={{ 
                  opacity: 0,
                  scale: 0.3,
                  left: `${particle.x + (Math.random() - 0.5) * 40}%`,
                  top: `${particle.y + (Math.random() - 0.5) * 40}%`
                }}
                transition={{ 
                  duration: 0.7,
                  ease: "easeOut"
                }}
                className="absolute pointer-events-none z-50"
              >
                {particle.type === 'bubble' ? (
                  <div 
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: particle.color, opacity: 0.6 }}
                  />
                ) : (
                  <div 
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: particle.color, opacity: 0.6 }}
                  />
                )}
              </motion.div>
            ))}
            
            <div className="relative rounded-3xl overflow-hidden cartoon-shadow vhs-border vhs-noise cursor-pointer group aspect-[3/4]">
              {/* Floating bubbles inside container */}
              {floatingBubbles.map((bubble) => (
                <motion.div
                  key={bubble.id}
                  initial={{ 
                    opacity: 0.5,
                    left: `${bubble.x}%`,
                    top: `${bubble.startY}%`
                  }}
                  animate={{ 
                    opacity: [0.5, 0.8, 0],
                    top: '-10%',
                    left: `${bubble.x + (Math.random() - 0.5) * 20}%`
                  }}
                  transition={{ 
                    duration: 2 + Math.random(),
                    ease: "easeOut"
                  }}
                  className="absolute pointer-events-none z-40 rounded-full"
                  style={{
                    width: `${bubble.size}px`,
                    height: `${bubble.size}px`,
                    backgroundColor: bubble.color
                  }}
                />
              ))}
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0"
                >
                  <ImageWithFallback
                    src={carouselImages[currentSlide].src}
                    alt={carouselImages[currentSlide].alt}
                    className="w-full h-full object-cover rounded-3xl"
                  />
                </motion.div>
              </AnimatePresence>
              
              {/* Rock emoji decorations - smooth continuous glow */}
              <motion.div
                animate={{
                  opacity: [0.3, 0.8, 0.3],
                  scale: [0.95, 1.1, 0.95],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute top-10 right-10 pointer-events-none text-4xl drop-shadow-[0_0_12px_rgba(255,193,7,0.5)]"
              >
                🤘
              </motion.div>
              <motion.div
                animate={{
                  opacity: [0.3, 0.8, 0.3],
                  scale: [0.95, 1.1, 0.95],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1,
                }}
                className="absolute bottom-20 left-10 pointer-events-none text-3xl drop-shadow-[0_0_12px_rgba(0,245,255,0.5)]"
              >
                🤘
              </motion.div>
              
              {/* Carousel indicators */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {carouselImages.map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === currentSlide 
                        ? 'w-8 bg-white' 
                        : 'w-2 bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <h3 className={`text-transparent bg-clip-text ${
              theme === 'dark'
                ? 'bg-gradient-to-r from-pink-400 to-purple-400'
                : 'bg-gradient-to-r from-orange-500 to-pink-500'
            }`}>
              Making Cars Smile Since Day One!
            </h3>
            <p className={`text-lg ${
              theme === 'dark' ? 'text-purple-100/80' : 'text-gray-700'
            }`}>
              Welcome to my world of automotive perfection! I'm not just another car wash — I'm an artist who treats every vehicle like a masterpiece.
            </p>
            <p className={`text-lg ${
              theme === 'dark' ? 'text-purple-100/80' : 'text-gray-700'
            }`}>
              With 4+ years of experience and an obsession for perfection, I built Sac Shine Detailing to bring premium-quality detailing to Sacramento. Whether it's a quick wash or a full transformation — I put my soul into every job. Cars leave not just clean, but glowing.
            </p>
            
            <div className="flex gap-6 pt-4">
              <div className="text-center">
                <div className="text-4xl mb-2">🚗</div>
                <p className={`font-semibold ${
                  theme === 'dark' ? 'text-purple-200' : 'text-gray-800'
                }`}>500+ Cars</p>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-purple-300/60' : 'text-gray-500'
                }`}>Detailed</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-2">⭐</div>
                <p className={`font-semibold ${
                  theme === 'dark' ? 'text-purple-200' : 'text-gray-800'
                }`}>4.93-Star</p>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-purple-300/60' : 'text-gray-500'
                }`}>Reviews</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-2">💯</div>
                <p className={`font-semibold ${
                  theme === 'dark' ? 'text-purple-200' : 'text-gray-800'
                }`}>100% Happy</p>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-purple-300/60' : 'text-gray-500'
                }`}>Clients</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Principles Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {principles.map((principle, index) => (
            <motion.div
              key={principle.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{
                opacity: 1,
                scale: 0.98 + index * 0.01,
                y: [0, -12, 0],
                x: [0, index % 2 === 0 ? 4 : -4, 0],
                rotate: [0, index % 2 === 0 ? 0.4 : -0.4, 0],
              }}
              transition={{
                opacity: { duration: 0.6, delay: index * 0.1 },
                scale: { duration: 0.6, delay: index * 0.1 },
                y: {
                  duration: 7 + index * 0.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: index * 0.25,
                },
                x: {
                  duration: 7 + index * 0.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: index * 0.25,
                },
                rotate: {
                  duration: 7 + index * 0.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: index * 0.25,
                },
              }}
              className="relative group"
            >
              <BubbleEffect intensity="low" variant="light">
                <div className={`h-full p-8 rounded-3xl border-2 cartoon-shadow hover:scale-105 transition-transform duration-300 ${
                  theme === 'dark' ? `${principle.bgColorDark} ${principle.borderColor}` : `${principle.bgColorLight} border-white`
                }`}>
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${principle.color} text-white mb-4`}>
                    {principle.icon}
                  </div>
                  <h4 className={theme === 'dark' ? 'text-purple-100 mb-2' : 'text-gray-900 mb-2'}>{principle.title}</h4>
                  <p className={theme === 'dark' ? 'text-purple-200/70' : 'text-gray-600'}>{principle.description}</p>
                </div>
              </BubbleEffect>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}