import { motion } from 'motion/react';
import { useState, useRef } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ArrowRight, ChevronDown, ChevronUp, X } from 'lucide-react';
import { BubbleEffect } from './BubbleEffect';
import { useTheme } from './ThemeContext';
import { useLanguage } from './LanguageContext';

export function Portfolio() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{ before: string; after: string; title: string; emoji: string } | null>(null);
  const sectionTitleRef = useRef<HTMLDivElement>(null);

  const portfolioItems = [
    {
      before: 'https://images.unsplash.com/photo-1594798546489-0a5cd52bb4c8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXIlMjBiZWZvcmUlMjBhZnRlciUyMGNsZWFufGVufDF8fHx8MTc2MzUxNDY4Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      after: 'https://images.unsplash.com/photo-1586852393158-2d13e3dc6b6b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGVhbiUyMHNoaW55JTIwY2FyJTIwYmx1ZSUyMHNreXxlbnwxfHx8fDE3NjM1MTU3NzV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      title: 'Exterior Transformation',
      emoji: '✨',
    },
    {
      before: 'https://images.unsplash.com/photo-1594849981292-89dbaf5aee53?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXIlMjBkZXRhaWxpbmclMjB3b3Jrc3BhY2V8ZW58MXx8fHwxNzYzNTE1Nzc2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      after: 'https://images.unsplash.com/photo-1586852393158-2d13e3dc6b6b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGVhbiUyMHNoaW55JTIwY2FyJTIwYmx1ZSUyMHNreXxlbnwxfHx8fDE3NjM1MTU3NzV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      title: 'Deep Clean Magic',
      emoji: '🌟',
    },
    {
      before: 'https://images.unsplash.com/photo-1594798546489-0a5cd52bb4c8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXIlMjBiZWZvcmUlMjBhZnRlciUyMGNsZWFufGVufDF8fHx8MTc2MzUxNDY4Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      after: 'https://images.unsplash.com/photo-1586852393158-2d13e3dc6b6b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGVhbiUyMHNoaW55JTIwY2FyJTIwYmx1ZSUyMHNreXxlbnwxfHx8fDE3NjM1MTU3NzV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      title: 'Full Detail Package',
      emoji: '🚗',
    },
    {
      before: 'https://images.unsplash.com/photo-1594849981292-89dbaf5aee53?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXIlMjBkZXRhaWxpbmclMjB3b3Jrc3BhY2V8ZW58MXx8fHwxNzYzNTE1Nzc2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      after: 'https://images.unsplash.com/photo-1586852393158-2d13e3dc6b6b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGVhbiUyMHNoaW55JTIwY2FyJTIwYmx1ZSUyMHNreXxlbnwxfHx8fDE3NjM1MTU3NzV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      title: 'Paint Protection',
      emoji: '🛡️',
    },
    {
      before: 'https://images.unsplash.com/photo-1639599629730-5710b6e18363?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaXJ0eSUyMGNhciUyMGludGVyaW9yfGVufDF8fHx8MTc2MzUxNzE3NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      after: 'https://images.unsplash.com/photo-1682858110563-3f609263d418?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGVhbiUyMGNhciUyMGludGVyaW9yfGVufDF8fHx8MTc2MzQ5NTk0N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      title: 'Interior Detailing',
      emoji: '💎',
    },
    {
      before: 'https://images.unsplash.com/photo-1665585637851-19f1e1dc0e81?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXIlMjBoZWFkbGlnaHRzJTIwcmVzdG9yYXRpb258ZW58MXx8fHwxNzYzNTE3MTc2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      after: 'https://images.unsplash.com/photo-1761312834150-4beefff097a7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBjYXIlMjB3YXNofGVufDF8fHx8MTc2MzQ4ODc3NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      title: 'Headlight Restoration',
      emoji: '💡',
    },
    {
      before: 'https://images.unsplash.com/photo-1594798546489-0a5cd52bb4c8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXIlMjBiZWZvcmUlMjBhZnRlciUyMGNsZWFufGVufDF8fHx8MTc2MzUxNDY4Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      after: 'https://images.unsplash.com/photo-1761934658331-2e00b20dc6c6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXIlMjB3YXhpbmclMjBwb2xpc2h8ZW58MXx8fHwxNzYzNTE3MTc3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      title: 'Premium Wax & Polish',
      emoji: '🌈',
    },
    {
      before: 'https://images.unsplash.com/photo-1708805283087-cb22474fb88e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbmdpbmUlMjBiYXklMjBjbGVhbmluZ3xlbnwxfHx8fDE3NjM1MTcxNzd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      after: 'https://images.unsplash.com/photo-1586852393158-2d13e3dc6b6b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGVhbiUyMHNoaW55JTIwY2FyJTIwYmx1ZSUyMHNreXxlbnwxfHx8fDE3NjM1MTU3NzV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      title: 'Engine Bay Detail',
      emoji: '⚙️',
    },
    {
      before: 'https://images.unsplash.com/photo-1594849981292-89dbaf5aee53?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXIlMjBkZXRhaWxpbmclMjB3b3Jrc3BhY2V8ZW58MXx8fHwxNzYzNTE1Nzc2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      after: 'https://images.unsplash.com/photo-1586852393158-2d13e3dc6b6b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGVhbiUyMHNoaW55JTIwY2FyJTIwYmx1ZSUyMHNreXxlbnwxfHx8fDE3NjM1MTU3NzV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      title: 'Ceramic Coating',
      emoji: '🔮',
    },
    {
      before: 'https://images.unsplash.com/photo-1639599629730-5710b6e18363?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaXJ0eSUyMGNhciUyMGludGVyaW9yfGVufDF8fHx8MTc2MzUxNzE3NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      after: 'https://images.unsplash.com/photo-1682858110563-3f609263d418?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGVhbiUyMGNhciUyMGludGVyaW9yfGVufDF8fHx8MTc2MzQ5NTk0N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      title: 'Leather Conditioning',
      emoji: '🎯',
    },
  ];

  const handleShowMore = () => {
    setShowAll(true);
  };

  const handleShowLess = () => {
    setShowAll(false);
    // Scroll to the section title
    setTimeout(() => {
      sectionTitleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const displayedItems = showAll ? portfolioItems : portfolioItems.slice(0, 4);

  return (
    <section id="portfolio" className="relative py-20 sm:py-32 overflow-hidden">
      {/* Background Decorations */}
      <div className={`absolute top-10 left-10 w-64 h-64 rounded-full blur-3xl opacity-30 ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-pink-500 to-purple-500'
          : 'bg-gradient-to-br from-pink-200 to-orange-200'
      }`}></div>
      <div className={`absolute bottom-10 right-10 w-64 h-64 rounded-full blur-3xl opacity-30 ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-cyan-500 to-blue-500'
          : 'bg-gradient-to-br from-cyan-200 to-blue-200'
      }`}></div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={sectionTitleRef}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-block px-6 py-2 vhs-gradient text-white rounded-full mb-4 cartoon-shadow-sm vhs-glow">
            <span>{t('portfolio.badge')}</span>
          </div>
          <h2 className={`vhs-text text-transparent bg-clip-text mb-4 ${
            theme === 'dark'
              ? 'bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400'
              : 'bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600'
          }`}>
            {t('portfolio.title')} 
          </h2>
          <p className={`max-w-2xl mx-auto text-lg ${
            theme === 'dark' ? 'text-purple-200/70' : 'text-gray-600'
          }`}>
            {t('portfolio.subtitle')} 🎨
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-8">
          {displayedItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => setSelectedItem(item)}
              className="group relative cursor-pointer"
            >
              <div className="relative overflow-hidden rounded-3xl aspect-video cartoon-shadow vhs-border vhs-scanlines">
                {/* Before Image */}
                <ImageWithFallback
                  src={item.before}
                  alt={`${item.title} - Before`}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
                    hoveredIndex === index ? 'opacity-0' : 'opacity-100'
                  }`}
                />
                {/* After Image */}
                <ImageWithFallback
                  src={item.after}
                  alt={`${item.title} - After`}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
                    hoveredIndex === index ? 'opacity-100' : 'opacity-0'
                  }`}
                />

                {/* Before Label */}
                <div className={`absolute top-6 left-6 px-5 py-2 bg-gray-800/90 backdrop-blur-sm rounded-full text-white transition-opacity duration-300 ${hoveredIndex === index ? 'opacity-0' : 'opacity-100'}`}>
                  <span>{t('portfolio.before')}</span>
                </div>

                {/* After Label */}
                <div className={`absolute top-6 right-6 px-5 py-2 vhs-gradient rounded-full text-white transition-opacity duration-300 cartoon-shadow-sm vhs-glow ${hoveredIndex === index ? 'opacity-100' : 'opacity-0'}`}>
                  <span className="flex items-center gap-2">
                    {t('portfolio.after')} {item.emoji}
                  </span>
                </div>

                {/* Bottom Info */}
                <div className={`absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent transition-all duration-300 ${hoveredIndex === index ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
                  <h4 className="text-white flex items-center gap-2">
                    {item.title}
                    <ArrowRight className="w-5 h-5" />
                  </h4>
                </div>

                {/* Hover Border */}
                <div className={`absolute inset-0 rounded-3xl border-4 transition-all duration-300 ${
                  hoveredIndex === index
                    ? 'border-cyan-400 vhs-glow'
                    : 'border-transparent'
                }`}></div>
              </div>
            </motion.div>
          ))}
        </div>

        {!showAll && (
          <div className="flex justify-center mt-8">
            <button
              className="vhs-gradient px-6 py-3 text-white rounded-full cartoon-shadow-sm vhs-glow flex items-center gap-2 hover:scale-105 transition-transform duration-300"
              onClick={handleShowMore}
            >
              <span>Show More</span>
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>
        )}

        {showAll && (
          <div className="flex justify-center mt-8">
            <button
              className="vhs-gradient px-6 py-3 text-white rounded-full cartoon-shadow-sm vhs-glow flex items-center gap-2 hover:scale-105 transition-transform duration-300"
              onClick={handleShowLess}
            >
              <span>Show Less</span>
              <ChevronUp className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      {selectedItem && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedItem(null)}
        >
          <button
            onClick={() => setSelectedItem(null)}
            className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
            aria-label="Close"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          <div className="max-w-7xl w-full grid md:grid-cols-2 gap-4" onClick={(e) => e.stopPropagation()}>
            {/* Before Image */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="relative"
            >
              <div className="absolute top-4 left-4 px-5 py-2 bg-gray-800/90 backdrop-blur-sm rounded-full text-white z-10">
                <span>Before</span>
              </div>
              <ImageWithFallback
                src={selectedItem.before}
                alt={`${selectedItem.title} - Before`}
                className="w-full h-full object-cover rounded-2xl"
              />
            </motion.div>

            {/* After Image */}
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="relative"
            >
              <div className="absolute top-4 right-4 px-5 py-2 vhs-gradient rounded-full text-white z-10 cartoon-shadow-sm vhs-glow">
                <span className="flex items-center gap-2">
                  After {selectedItem.emoji}
                </span>
              </div>
              <ImageWithFallback
                src={selectedItem.after}
                alt={`${selectedItem.title} - After`}
                className="w-full h-full object-cover rounded-2xl"
              />
            </motion.div>

            {/* Title */}
            <div className="md:col-span-2 text-center">
              <h3 className="text-white">{selectedItem.title}</h3>
            </div>
          </div>
        </motion.div>
      )}
    </section>
  );
}