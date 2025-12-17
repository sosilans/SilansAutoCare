import { motion } from 'motion/react';
import { Sparkles, Star, Droplets } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useState, useEffect, useRef } from 'react';
import { BubbleEffect } from './BubbleEffect';
import { useTheme } from './ThemeContext';
import { useLanguage } from './LanguageContext';
import { useOnlineStatus } from './OnlineStatusContext';
import { useAuth } from './AuthContext';

export function Hero() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { isOnline } = useOnlineStatus();
  const { user, openAuthModal } = useAuth();
  const heroRef = useRef<HTMLDivElement | null>(null);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const [useImageFallback, setUseImageFallback] = useState(false);
  // Carousel state
  const [currentSlide, setCurrentSlide] = useState(0);
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, type: 'bubble' | 'star', color: string}>>([]);
  const [floatingBubbles, setFloatingBubbles] = useState<Array<{id: number, x: number, startY: number, color: string, size: number}>>([]);
  
  // Video carousel - 10 videos cycling
  const videoCarousel = Array.from({ length: 10 }, (_, i) => ({
    videoSrc: `/assets/vids/${i}.mp4`,
    posterSrc: '/assets/cleaningsamples/1_1.jpg',
    alt: `Car detailing video ${i + 1}`,
    scale: 1
  }));

  const carouselImages = [
    {
      src: "https://images.unsplash.com/photo-1586852393158-2d13e3dc6b6b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGVhbiUyMHNoaW55JTIwY2FyJTIwYmx1ZSUyMHNreXxlbnwxfHx8fDE3NjM1MTU3NzV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      alt: "Clean shiny car",
      scale: 1
    },
    {
      src: "https://images.unsplash.com/photo-1601362840469-51e4d8d58785?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXIlMjBkZXRhaWxpbmd8ZW58MXx8fHwxNzYzNTE1Nzc1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      alt: "Car detailing process",
      scale: 1.05
    },
    {
      src: "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXIlMjB3YXNoJTIwY2xlYW58ZW58MXx8fHwxNzYzNTE1Nzc1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      alt: "Professional car wash",
      scale: 0.98
    },
    {
      src: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXIlMjBzaGluZSUyMGRldGFpbGluZ3xlbnwxfHx8fDE3NjM1MTU3NzV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      alt: "Shiny detailed car",
      scale: 1.03
    }
  ];

  // Auto-scroll carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % videoCarousel.length);
    }, 3500); // Change slide every 3.5 seconds

    return () => clearInterval(interval);
  }, [videoCarousel.length]);

  // Generate particles on slide change
  useEffect(() => {
    // Голубые и фиолетовые оттенки
    const colors = [
      '#8b5cf6', '#a78bfa', '#c4b5fd', // фиолетовые
      '#7c3aed', '#6d28d9', '#5b21b6', // темно-фиолетовые
      '#06b6d4', '#22d3ee', '#67e8f9', // голубые
      '#0ea5e9', '#0284c7', '#0369a1', // сине-голубые
      '#a855f7', '#d946ef', // пурпурные
      '#14b8a6', '#2dd4bf' // бирюзовые
    ];
    
    // Разлетающиеся частицы (reduced for performance)
    const newParticles = Array.from({ length: 8 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      type: Math.random() > 0.6 ? 'bubble' : 'star' as 'bubble' | 'star',
      color: colors[Math.floor(Math.random() * colors.length)]
    }));
    
    setParticles(newParticles);
    
    // Всплывающие пузырьки
    const newFloatingBubbles = Array.from({ length: 5 }, (_, i) => ({
      id: Date.now() + 1000 + i,
      x: 50 + Math.random() * 45, // от 50% до 95% ширины (правая сторона, где фото)
      startY: 70 + Math.random() * 25, // начальная позиция от 70% до 95% (снизу фотографии)
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 4 + Math.random() * 8 // размер от 4 до 12
    }));
    
    setFloatingBubbles(newFloatingBubbles);
    
    // Clear particles after animation
    const timeout = setTimeout(() => {
      setParticles([]);
      setFloatingBubbles([]);
    }, 2500);
    
    return () => clearTimeout(timeout);
  }, [currentSlide]);

  // Scroll to portfolio on click
  const handleCarouselClick = () => {
    const portfolioSection = document.getElementById('portfolio');
    if (portfolioSection) {
      portfolioSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Lazy-load video once hero enters viewport
  useEffect(() => {
    if (!heroRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldLoadVideo(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '200px' }
    );
    observer.observe(heroRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="hero"
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
    >
      {/* Animated Background */}
      <div className={`absolute inset-0 ${
        theme === 'dark'
          ? 'bg-transparent'
          : 'bg-gradient-to-br from-sky-100 via-blue-100 to-cyan-100'
      }`}>
        {/* Decorative blur circles */}
        <div className={`absolute top-10 right-10 w-64 h-64 rounded-full blur-3xl opacity-30 ${
          theme === 'dark'
            ? 'bg-gradient-to-br from-purple-500 to-pink-500'
            : 'bg-gradient-to-br from-purple-200 to-pink-200'
        }`}></div>
        <div className={`absolute bottom-10 left-10 w-64 h-64 rounded-full blur-3xl opacity-30 ${
          theme === 'dark'
            ? 'bg-gradient-to-br from-cyan-500 to-blue-500'
            : 'bg-gradient-to-br from-cyan-200 to-blue-200'
        }`}></div>
        
        {/* Floating Bubbles */}
        <div className={`absolute top-20 left-10 w-32 h-32 rounded-full blur-2xl float-animation ${
          theme === 'dark' ? 'bg-purple-500/30' : 'bg-purple-400/30'
        }`}></div>
        <div className={`absolute top-40 right-20 w-40 h-40 rounded-full blur-2xl float-animation ${
          theme === 'dark' ? 'bg-cyan-500/30' : 'bg-cyan-400/30'
        }`} style={{ animationDelay: '1s' }}></div>
        <div className={`absolute bottom-20 left-1/4 w-36 h-36 rounded-full blur-2xl float-animation ${
          theme === 'dark' ? 'bg-pink-500/30' : 'bg-pink-400/30'
        }`} style={{ animationDelay: '2s' }}></div>
        <div className={`absolute bottom-40 right-1/3 w-28 h-28 rounded-full blur-2xl float-animation ${
          theme === 'dark' ? 'bg-orange-400/30' : 'bg-orange-300/30'
        }`} style={{ animationDelay: '0.5s' }}></div>
      </div>

      {/* VHS Scanlines Effect */}
      <div className="vhs-scanlines absolute inset-0 pointer-events-none"></div>

      {/* Floating bubbles that rise to the top */}
      {floatingBubbles.map((bubble) => (
        <motion.div
          key={bubble.id}
          initial={{ 
            opacity: 1,
            left: `${bubble.x}%`,
            top: `${bubble.startY}%`,
            scale: 1
          }}
          animate={{ 
            opacity: 0,
            top: '-10%', // всплывают к самому верху сайта
            scale: 1.2
          }}
          transition={{ 
            duration: 2,
            ease: "easeOut"
          }}
          className="absolute pointer-events-none z-50"
        >
          <div 
            className="rounded-full"
            style={{ 
              backgroundColor: bubble.color, 
              width: `${bubble.size}px`, 
              height: `${bubble.size}px`,
              opacity: 1,
              boxShadow: `0 0 10px ${bubble.color}`
            }}
          />
        </motion.div>
      ))}

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-left"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 vhs-gradient rounded-full text-white mb-6 cartoon-shadow-sm vhs-glow"
            >
              <Star className="w-4 h-4 fill-yellow-300 text-yellow-300" />
              <span className="text-sm flex items-center gap-2">
                {t('hero.badge')}
                <span className="text-white/50">•</span>
                <span className={`flex items-center gap-1 ${isOnline ? 'text-green-300' : 'text-red-300'}`}>
                  <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></span>
                  {isOnline ? t('hero.online') : t('hero.offline')}
                </span>
              </span>
            </motion.div>

            <h1 className={`vhs-text text-transparent bg-clip-text mb-6 ${ 
              theme === 'dark'
                ? 'bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400'
                : 'bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600'
            }`}>
              {t('hero.title')}
            </h1>
            
            <p className={`text-2xl sm:text-3xl mb-4 ${
              theme === 'dark' ? 'text-pink-200' : 'text-gray-800'
            }`}>
              {t('hero.subtitle')}
            </p>
            
            <p className={`text-lg mb-8 max-w-xl ${
              theme === 'dark' ? 'text-purple-200/80' : 'text-gray-600'
            }`}>
              {t('hero.description')}
            </p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <a
                href="#services"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 vhs-gradient text-white rounded-full cartoon-shadow vhs-glow hover:scale-105 transition-transform duration-300"
              >
                <Sparkles className="w-5 h-5" />
                {t('hero.cta.primary')}
              </a>
              <a
                href="#contact"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-purple-600 rounded-full vhs-border-animated cartoon-shadow-sm hover:scale-105 transition-transform duration-300"
              >
                <Droplets className="w-5 h-5" />
                {t('hero.cta.secondary')}
              </a>
            </motion.div>
          </motion.div>

          {/* Hero Media (Video with fallback image) */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ 
              opacity: 1, 
              x: 0,
              y: [0, -15, 0],
              rotate: [0, 0.5, 0]
            }}
            transition={{ 
              opacity: { duration: 0.8 },
              x: { duration: 0.8 },
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
            {/* Transition particles - outside overflow container */}
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
                  <Star 
                    className="w-6 h-6" 
                    style={{ color: particle.color, fill: particle.color, opacity: 0.6 }}
                  />
                )}
              </motion.div>
            ))}
            
            <div 
              className="relative rounded-3xl overflow-hidden cartoon-shadow vhs-border vhs-noise cursor-pointer group aspect-[3/4]"
              onClick={handleCarouselClick}
            >
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 rounded-3xl overflow-hidden"
              >
                {shouldLoadVideo && !useImageFallback ? (
                  <video
                    key={videoCarousel[currentSlide].videoSrc}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    poster={videoCarousel[currentSlide].posterSrc}
                    onError={() => setUseImageFallback(true)}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 rounded-3xl"
                    style={{ 
                      transform: `scale(${videoCarousel[currentSlide].scale})`,
                      transformOrigin: 'center'
                    }}
                  >
                    <source src={videoCarousel[currentSlide].videoSrc} type="video/mp4" />
                  </video>
                ) : (
                  <ImageWithFallback
                    src={videoCarousel[currentSlide].posterSrc}
                    fallback={carouselImages[0].src}
                    alt={videoCarousel[currentSlide].alt}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 rounded-3xl"
                    style={{ 
                      transform: `scale(${videoCarousel[currentSlide].scale})`,
                      transformOrigin: 'center'
                    }}
                  />
                )}
              </motion.div>
              {/* Sound status badge (kept muted for autoplay) */}
              <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-black/40 text-white text-xs px-3 py-1 rounded-full backdrop-blur-md border border-white/10">
                <span className="inline-block w-2 h-2 rounded-full bg-white/70" />
                <span>Sound off</span>
              </div>
              
              {/* Click hint overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-purple-900/40 via-transparent to-transparent flex items-end justify-center pb-8 pointer-events-none">
                <motion.span
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ 
                    opacity: 1,
                    y: [0, -8, 0]
                  }}
                  transition={{
                    opacity: { duration: 0.6, delay: 1 },
                    y: {
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }
                  }}
                  className="text-white px-4 py-2 bg-purple-600/80 rounded-full text-sm backdrop-blur-sm pointer-events-auto"
                >
                  {t('hero.click')}
                </motion.span>
              </div>
              
              {/* Sparkle Effects */}
              <motion.div
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0.8, 1.2, 0.8],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 1,
                }}
                className="absolute top-10 right-10 pointer-events-none"
              >
                <Sparkles className="w-12 h-12 text-yellow-400 fill-yellow-400" />
              </motion.div>
              <motion.div
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0.8, 1.2, 0.8],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 1,
                  delay: 0.5,
                }}
                className="absolute bottom-20 left-10 pointer-events-none"
              >
                <Sparkles className="w-8 h-8 text-cyan-400 fill-cyan-400" />
              </motion.div>
              
              {/* Carousel indicators */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 pointer-events-none">
                {videoCarousel.map((_, index) => (
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
        </div>
      </div>
    </section>
  );
}