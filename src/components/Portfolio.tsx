import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ArrowRight, ChevronDown, ChevronUp, X } from 'lucide-react';
import { BubbleEffect } from './BubbleEffect';
import { useTheme } from './ThemeContext';
import { useLanguage } from './LanguageContext';
import { lockScroll } from './ui/scrollLock';

export function Portfolio() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{ before: string; after: string; title: string; emoji: string } | null>(null);
  const sectionTitleRef = useRef<HTMLDivElement>(null);
  const galleryTopRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!selectedItem) return;
    return lockScroll();
  }, [selectedItem]);

  const portfolioItems = [
    {
      before: '/assets/cleaningsamples/2.jpg',
      after: '/assets/cleaningsamples/2_1.jpg',
      title: t('portfolio.items.fullDetail'),
      emoji: '🚗',
    },
    {
      before: '/assets/cleaningsamples/1.jpg',
      after: '/assets/cleaningsamples/1_1.jpg',
      title: t('portfolio.items.deepInterior'),
      emoji: '✨',
    },
    {
      before: '/assets/cleaningsamples/3.jpg',
      after: '/assets/cleaningsamples/3_1.jpg',
      title: t('portfolio.items.exteriorDeepClean'),
      emoji: '🛡️',
    },
    {
      before: '/assets/cleaningsamples/Screenshot_2.png',
      after: '/assets/cleaningsamples/Screenshot_1.png',
      title: t('portfolio.items.interiorRestoration'),
      emoji: '🧼',
    },
    {
      before: '/assets/cleaningsamples/new_pictures_gigapixScreenshot_3-low_res-scale-2_00x.jpg',
      after: '/assets/cleaningsamples/new_pictures_gigapixScreenshot_4-standard-scale-2_00x.jpg',
      title: t('portfolio.items.seatDeepClean'),
      emoji: '💺',
    },
    {
      before: '/assets/cleaningsamples/new_pictures_gigapixScreenshot_5-standard-scale-2_00x.jpg',
      after: '/assets/cleaningsamples/new_pictures_gigapixScreenshot_6-low_res-scale-2_00x.jpg',
      title: t('portfolio.items.dashboardDetail'),
      emoji: '🎛️',
    },
    {
      before: '/assets/cleaningsamples/new_pictures_gigapixScreenshot_7-low_res-scale-2_00x.jpg',
      after: '/assets/cleaningsamples/new_pictures_gigapixScreenshot_8-art-scale-2_00x.jpg',
      title: t('portfolio.items.floorMatCleaning'),
      emoji: '🧽',
    },
    {
      before: '/assets/cleaningsamples/Screenshot_9.png',
      after: '/assets/cleaningsamples/Screenshot_10.png',
      title: t('portfolio.items.consoleDetailing'),
      emoji: '🎮',
    },
    {
      before: '/assets/cleaningsamples/Screenshot_11.png',
      after: '/assets/cleaningsamples/Screenshot_12.png',
      title: t('portfolio.items.doorPanelClean'),
      emoji: '🚪',
    },
    {
      before: '/assets/cleaningsamples/Screenshot_13.png',
      after: '/assets/cleaningsamples/Screenshot_14.png',
      title: t('portfolio.items.carpetShampooing'),
      emoji: '🧴',
    },
    {
      before: '/assets/cleaningsamples/Screenshot_15.png',
      after: '/assets/cleaningsamples/Screenshot_16.png',
      title: t('portfolio.items.leatherTreatment'),
      emoji: '🪑',
    },
    {
      before: '/assets/cleaningsamples/Screenshot_17.png',
      after: '/assets/cleaningsamples/Screenshot_18.png',
      title: t('portfolio.items.trunkCleaning'),
      emoji: '📦',
    },
    {
      before: '/assets/cleaningsamples/Screenshot_19.png',
      after: '/assets/cleaningsamples/Screenshot_20.png',
      title: t('portfolio.items.headlinerDetail'),
      emoji: '☁️',
    },
    {
      before: '/assets/cleaningsamples/Screenshot_21.png',
      after: '/assets/cleaningsamples/Screenshot_22.png',
      title: t('portfolio.items.stainRemoval'),
      emoji: '🎯',
    },
    {
      before: '/assets/cleaningsamples/Screenshot_23.png',
      after: '/assets/cleaningsamples/Screenshot_24.png',
      title: t('portfolio.items.petHairRemoval'),
      emoji: '🐾',
    },
    {
      before: '/assets/cleaningsamples/Screenshot_25.png',
      after: '/assets/cleaningsamples/Screenshot_26.png',
      title: t('portfolio.items.smokeOdorTreatment'),
      emoji: '🚭',
    },
    {
      before: '/assets/cleaningsamples/Screenshot_27.png',
      after: '/assets/cleaningsamples/Screenshot_28.png',
      title: t('portfolio.items.upholsteryRevival'),
      emoji: '🛋️',
    },
    {
      before: '/assets/cleaningsamples/Screenshot_29.png',
      after: '/assets/cleaningsamples/Screenshot_30.png',
      title: t('portfolio.items.cupHolderDetail'),
      emoji: '☕',
    },
    {
      before: '/assets/cleaningsamples/new_pictures_gigapixScreenshot_31-low_res-scale-2_00x.jpg',
      after: '/assets/cleaningsamples/new_pictures_gigapixScreenshot_32-art-scale-2_00x.jpg',
      title: t('portfolio.items.ventCleaning'),
      emoji: '💨',
    },
    {
      before: '/assets/cleaningsamples/Screenshot_33.png',
      after: '/assets/cleaningsamples/Screenshot_34.png',
      title: t('portfolio.items.windowPolish'),
      emoji: '🪟',
    },
    {
      before: '/assets/cleaningsamples/Screenshot_35.png',
      after: '/assets/cleaningsamples/Screenshot_36.png',
      title: t('portfolio.items.completeTransformation'),
      emoji: '⭐',
    },
  ];

  const handleShowMore = () => {
    const currentY = window.scrollY;
    setShowAll(true);
    // Keep viewport anchored so first expand doesn't jump down
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.scrollTo({ top: currentY });
      });
    });
  };

  const handleShowLess = () => {
    setShowAll(false);
    requestAnimationFrame(() => {
      galleryTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const displayedItems = showAll ? portfolioItems : portfolioItems.slice(0, 4);

  return (
    <section id="portfolio" className="relative py-20 sm:py-32 overflow-hidden">
      {/* Background Decorations */}
      <div className={`absolute top-10 left-10 w-64 h-64 rounded-full blur-3xl ${
        theme === 'dark'
          ? 'bg-purple-500/10'
          : 'bg-gradient-to-br from-pink-200 to-orange-200 opacity-30'
      }`}></div>
      <div className={`absolute bottom-10 right-10 w-64 h-64 rounded-full blur-3xl ${
        theme === 'dark'
          ? 'bg-cyan-500/10'
          : 'bg-gradient-to-br from-cyan-200 to-blue-200 opacity-30'
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

        <div ref={galleryTopRef} />
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
                  alt={`${item.title} - ${t('portfolio.before')}`}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
                    hoveredIndex === index ? 'opacity-0' : 'opacity-100'
                  }`}
                />
                {/* After Image */}
                <ImageWithFallback
                  src={item.after}
                  alt={`${item.title} - ${t('portfolio.after')}`}
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
          <div className="flex flex-col items-center gap-4 mt-14 sm:mt-16">
            <button
              className="vhs-gradient px-6 py-3 text-white rounded-full cartoon-shadow-sm vhs-glow flex items-center gap-2 hover:scale-105 transition-transform duration-300"
              onClick={handleShowMore}
            >
              <span>{t('portfolio.showMore')}</span>
              <ChevronDown className="w-5 h-5" />
            </button>
            
            {/* Motivational Text Below Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className={`max-w-2xl text-center px-6 py-6 rounded-2xl border ${
                theme === 'dark'
                  ? 'bg-gradient-to-r from-purple-900/30 to-cyan-900/30 border-purple-500/30'
                  : 'bg-gradient-to-r from-purple-50 to-cyan-50 border-purple-200'
              }`}
            >
              <p className={`text-sm leading-relaxed ${
                theme === 'dark'
                  ? 'text-purple-200/80'
                  : 'text-gray-700'
              }`}>
                {t('portfolio.motivation.text')}{' '}
                <span className="font-semibold">{t('portfolio.motivation.cta')}</span>
              </p>
            </motion.div>
          </div>
        )}

        {showAll && (
          <div className="flex justify-center mt-12 sm:mt-14">
            <button
              className="vhs-gradient px-6 py-3 text-white rounded-full cartoon-shadow-sm vhs-glow flex items-center gap-2 hover:scale-105 transition-transform duration-300"
              onClick={handleShowLess}
            >
              <span>{t('portfolio.showLess')}</span>
              <ChevronUp className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {selectedItem && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0"
                  onClick={() => setSelectedItem(null)}
                  style={
                    {
                      zIndex: 2147483647,
                      overflowY: 'auto',
                      WebkitOverflowScrolling: 'touch',
                      overscrollBehavior: 'contain',
                      backgroundColor: theme === 'dark' ? 'rgba(3,7,18,0.86)' : 'rgba(0,0,0,0.95)',
                      backdropFilter: theme === 'dark' ? 'blur(10px)' : 'blur(6px)',
                    } as any
                  }
              >
                {/* outer fixed close removed; add inside card for proper positioning */}

                <div className="min-h-screen flex items-start sm:items-center justify-center p-4">
                  <div className="max-w-7xl w-full grid md:grid-cols-2 gap-4 relative" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setSelectedItem(null)}
                      type="button"
                      aria-label={t('common.close')}
                      style={{ top: 'calc(1rem + env(safe-area-inset-top))', right: 'calc(1rem + env(safe-area-inset-right))', zIndex: 2147483648 } as any}
                      className="absolute inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors touch-manipulation border"
                    >
                      <X className="w-6 h-6 text-white" />
                    </button>
            {/* Before Image */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="relative"
            >
              <div className="absolute top-4 left-4 px-5 py-2 bg-gray-800/90 backdrop-blur-sm rounded-full text-white z-10">
                <span>{t('portfolio.before')}</span>
              </div>
              <ImageWithFallback
                src={selectedItem.before}
                alt={`${selectedItem.title} - ${t('portfolio.before')}`}
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
                  {t('portfolio.after')} {selectedItem.emoji}
                </span>
              </div>
              <ImageWithFallback
                src={selectedItem.after}
                alt={`${selectedItem.title} - ${t('portfolio.after')}`}
                className="w-full h-full object-cover rounded-2xl"
              />
            </motion.div>

            {/* Title */}
            <div className="md:col-span-2 text-center">
              <h3 className="text-white">{selectedItem.title}</h3>
            </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </section>
  );
}