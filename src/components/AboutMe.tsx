import { motion } from 'motion/react';
import { Award, Heart, Sparkles, Smile } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { BubbleEffect } from './BubbleEffect';
import { useTheme } from './ThemeContext';
import { useLanguage } from './LanguageContext';

export function AboutMe() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  
  const principles = [
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: t('about.quality'),
      description: t('about.quality.desc'),
      color: 'from-blue-400 to-cyan-400',
      bgColorLight: 'bg-blue-100',
      bgColorDark: 'bg-blue-900/30',
      borderColor: theme === 'dark' ? 'border-blue-500/30' : 'border-white',
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: t('about.passion'),
      description: t('about.passion.desc'),
      color: 'from-pink-400 to-rose-400',
      bgColorLight: 'bg-pink-100',
      bgColorDark: 'bg-pink-900/30',
      borderColor: theme === 'dark' ? 'border-pink-500/30' : 'border-white',
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: t('about.excellence'),
      description: t('about.excellence.desc'),
      color: 'from-orange-400 to-amber-400',
      bgColorLight: 'bg-orange-100',
      bgColorDark: 'bg-orange-900/30',
      borderColor: theme === 'dark' ? 'border-orange-500/30' : 'border-white',
    },
    {
      icon: <Smile className="w-8 h-8" />,
      title: t('about.happy'),
      description: t('about.happy.desc'),
      color: 'from-green-400 to-emerald-400',
      bgColorLight: 'bg-green-100',
      bgColorDark: 'bg-green-900/30',
      borderColor: theme === 'dark' ? 'border-green-500/30' : 'border-white',
    },
  ];

  return (
    <section id="about" className="relative py-20 sm:py-32 overflow-hidden">
      {/* Background Decorations */}
      <div className={`absolute top-10 right-10 w-64 h-64 rounded-full blur-3xl opacity-30 ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-purple-500 to-pink-500'
          : 'bg-gradient-to-br from-blue-200 to-cyan-200'
      }`}></div>
      <div className={`absolute bottom-10 left-10 w-64 h-64 rounded-full blur-3xl opacity-30 ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-cyan-500 to-blue-500'
          : 'bg-gradient-to-br from-orange-200 to-pink-200'
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
            <span>{t('about.badge')}</span>
          </div>
          <h2 className={`vhs-text text-transparent bg-clip-text mb-4 ${
            theme === 'dark'
              ? 'bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400'
              : 'bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600'
          }`}>
            {t('about.title')}
          </h2>
          <p className={`max-w-2xl mx-auto text-lg ${
            theme === 'dark' ? 'text-purple-200/70' : 'text-gray-600'
          }`}>
            {t('about.subtitle')} 🌟
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-20">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative rounded-3xl overflow-hidden cartoon-shadow vhs-border vhs-noise">
              <ImageWithFallback
                src="/assets/Misha.jpg"
                alt="Misha - Professional Auto Detailing Specialist"
                className="w-full h-auto"
              />
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
              {t('about.heading')} 
            </h3>
            <p className={`text-lg ${
              theme === 'dark' ? 'text-purple-100/80' : 'text-gray-700'
            }`}>
              {t('about.text1')}
            </p>
            <p className={`text-lg ${
              theme === 'dark' ? 'text-purple-100/80' : 'text-gray-700'
            }`}>
              {t('about.text2')}
            </p>
            
            <div className="flex gap-4 pt-4">
              <div className="text-center">
                <div className="text-4xl mb-2">🚗</div>
                <p className={theme === 'dark' ? 'text-purple-200/70' : 'text-gray-600'}>500+ {t('about.stats.cars')}</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-2">⭐</div>
                <p className={theme === 'dark' ? 'text-purple-200/70' : 'text-gray-600'}>{t('about.stats.reviews')}</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-2">💯</div>
                <p className={theme === 'dark' ? 'text-purple-200/70' : 'text-gray-600'}>100% {t('about.stats.happy')}</p>
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