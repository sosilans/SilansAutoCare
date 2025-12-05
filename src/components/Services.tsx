import { motion, AnimatePresence } from 'motion/react';
import { Droplet, Shield, Sparkles, Wind, Car, Zap, ChevronDown } from 'lucide-react';
import { BubbleEffect } from './BubbleEffect';
import { useTheme } from './ThemeContext';
import { useState } from 'react';

export function Services() {
  const { theme } = useTheme();
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  
  const services = [
    {
      icon: <Droplet className="w-10 h-10" />,
      emoji: '💧',
      title: 'Basic Wash',
      description: 'Gentle exterior hand wash, foam bath, microfiber dry',
      price: '$120',
      color: 'from-cyan-400 via-blue-400 to-purple-400',
      bgColorLight: 'bg-cyan-50',
      bgColorDark: 'bg-cyan-900/20',
      borderColorDark: 'border-cyan-500/30',
      details: {
        duration: '⏱ ~1 hour',
        includes: [
          'Pre-wash foam treatment',
          'Gentle hand wash',
          'Wheel & tire cleaning',
          'Microfiber drying',
          'Exterior glass cleaning',
          'Tire shine application'
        ],
        ideal: 'Regular customers get maintenance discounts every 3 months'
      }
    },
    {
      icon: <Wind className="w-10 h-10" />,
      emoji: '🌪️',
      title: 'Interior Deep Clean',
      description: 'Thorough vacuuming, seat shampoo, dash & vents detail',
      price: '$150',
      color: 'from-cyan-400 via-teal-400 to-green-400',
      bgColorLight: 'bg-cyan-50',
      bgColorDark: 'bg-teal-900/20',
      borderColorDark: 'border-teal-500/30',
      details: {
        duration: '⏱ 1.5–2 hours',
        includes: [
          'Complete vacuuming',
          'Seat shampoo & conditioning',
          'Dashboard detailing',
          'Vent cleaning',
          'Door panel cleaning',
          'Interior glass polishing'
        ],
        ideal: 'Ideal for seasonal refresh or sale prep'
      }
    },
    {
      icon: <Car className="w-10 h-10" />,
      emoji: '🚗',
      title: 'Engine Bay Clean',
      description: 'Safe degreasing, dressing and shine for engine components',
      price: '$40+',
      color: 'from-blue-400 via-cyan-400 to-teal-400',
      bgColorLight: 'bg-blue-50',
      bgColorDark: 'bg-blue-900/20',
      borderColorDark: 'border-blue-500/30',
      details: {
        duration: '⏱ ~45 min',
        includes: [
          'Safe degreasing process',
          'Engine component protection',
          'Pressure washing',
          'Plastic & rubber dressing',
          'Final shine application',
          'Inspection'
        ],
        ideal: 'Best combined with Basic Wash'
      }
    },
    {
      icon: <Sparkles className="w-10 h-10" />,
      emoji: '✨',
      title: 'Exterior Detail',
      description: 'Professional full exterior cleaning — tires, trim, windows, and shine restoration.',
      price: '$250+',
      color: 'from-purple-400 via-pink-400 to-purple-500',
      bgColorLight: 'bg-purple-50',
      bgColorDark: 'bg-purple-900/20',
      borderColorDark: 'border-purple-500/30',
      details: {
        duration: '⏱ 2–3 hours',
        includes: [
          'Hand wash with foam bath',
          'Tire shine & rim cleaning',
          'Light clay bar treatment',
          'Wax or spray sealant finish',
          'Ideal for cars needing a deeper refresh',
          'Estimated time: 2–3 hours'
        ],
        ideal: 'Perfect for restoring paint brilliance'
      }
    },
    {
      icon: <Zap className="w-10 h-10" />,
      emoji: '⚡',
      title: 'Full Detail Package',
      description: 'Complete interior + exterior detailing with protection',
      price: '$400+',
      color: 'from-purple-400 via-pink-400 to-cyan-400',
      bgColorLight: 'bg-purple-50',
      bgColorDark: 'bg-purple-900/20',
      borderColorDark: 'border-pink-500/30',
      details: {
        duration: '⏱ 3–5 hours',
        includes: [
          'Complete exterior detail',
          'Full interior deep clean',
          'Engine bay cleaning',
          'Paint protection',
          'All surfaces treated',
          'Premium finish'
        ],
        ideal: 'All-in-one transformation'
      }
    },
    {
      icon: <Shield className="w-10 h-10" />,
      emoji: '🛡️',
      title: 'Maintenance Plan',
      description: 'Recurring monthly or quarterly washes with loyalty discounts',
      price: 'Custom',
      color: 'from-pink-400 via-rose-400 to-orange-400',
      bgColorLight: 'bg-pink-50',
      bgColorDark: 'bg-pink-900/20',
      borderColorDark: 'border-pink-500/30',
      details: {
        duration: '⏱ Flexible',
        includes: [
          'Monthly or quarterly service',
          'Loyalty discounts',
          'Priority scheduling',
          'Consistent care',
          'Custom package options',
          'Year-round protection'
        ],
        ideal: 'Stay spotless all year round'
      }
    },
  ];

  return (
    <section id="services" className="relative py-20 sm:py-32 overflow-hidden">
      {/* Background Decorations */}
      <div className={`absolute top-10 right-10 w-64 h-64 rounded-full blur-3xl opacity-30 ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-purple-500 to-pink-500'
          : 'bg-gradient-to-br from-cyan-200 to-blue-200'
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
          <div className="inline-block px-6 py-2 vhs-gradient text-white rounded-full mb-4 cartoon-shadow-sm vhs-glow">
            <span>Our Services</span>
          </div>
          <h2 className={`vhs-text text-transparent bg-clip-text mb-4 ${
            theme === 'dark'
              ? 'bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400'
              : 'bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600'
          }`}>
            What We Offer
          </h2>
          <p className={`max-w-2xl mx-auto text-lg ${
            theme === 'dark' ? 'text-purple-200/70' : 'text-gray-600'
          }`}>
            From basic wash to complete makeover — we've got you covered! 🎉
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 relative pb-96">
          {services.map((service, index) => {
            const cardRow = Math.floor(index / 3);
            const isFirstRow = cardRow === 0;
            return (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{
                opacity: 1,
                y: expandedCard === index ? [0, -12, 0] : 0,
              }}
              transition={{
                opacity: { duration: 0.6, delay: index * 0.1 },
                y: expandedCard === index ? {
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                } : { duration: 0.3 },
              }}
              className="group relative"
            >
              <BubbleEffect intensity="low" variant="light">
                <div 
                  onClick={() => setExpandedCard(expandedCard === index ? null : index)}
                  className={`h-full p-8 rounded-3xl border-2 cartoon-shadow hover:scale-105 transition-all duration-300 cursor-pointer ${
                  theme === 'dark' 
                    ? `${service.bgColorDark} ${service.borderColorDark} vhs-noise vhs-scanlines` 
                    : `${service.bgColorLight} border-white vhs-noise`
                }`}>
                  {/* Icon Circle */}
                  <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br ${service.color} text-white mb-4 cartoon-shadow-sm gradient-animated ${
                    theme === 'dark' ? 'vhs-glow-dark' : 'vhs-glow-light'
                  }`}>
                    {service.icon}
                  </div>

                  {/* Emoji */}
                  <div className="text-5xl mb-4 bounce-gentle">{service.emoji}</div>

                  {/* Title */}
                  <h3 className={`mb-3 ${theme === 'dark' ? 'text-purple-100' : 'text-gray-900'}`}>{service.title}</h3>

                  {/* Description */}
                  <p className={`mb-6 leading-relaxed ${theme === 'dark' ? 'text-purple-200/70' : 'text-gray-600'}`}>{service.description}</p>

                  {/* Price Badge */}
                  <div className={`inline-block px-6 py-3 rounded-full bg-gradient-to-r ${service.color} text-white cartoon-shadow-sm vhs-glow gradient-animated`}>
                    <span className="text-lg">Starting at {service.price}</span>
                  </div>

                  {/* Expand indicator */}
                  <div className="flex items-center justify-center mt-4">
                    <motion.div
                      animate={{ rotate: expandedCard === index ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ChevronDown className={`w-6 h-6 ${theme === 'dark' ? 'text-purple-300' : 'text-gray-500'}`} />
                    </motion.div>
                  </div>
                </div>
              </BubbleEffect>
            </motion.div>
            );
          })}
        </div>

        {/* Expanded Details Popup - Outside Grid */}
        <AnimatePresence>
          {expandedCard !== null && (
            <>
              {/* Semi-transparent dark backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
                onClick={() => setExpandedCard(null)}
              />
              
              {/* Popup Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -20 }}
                transition={{ duration: 0.3, type: 'spring', stiffness: 300, damping: 25 }}
                className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center"
              >
                <BubbleEffect intensity="high" variant="bright">
                  <motion.div
                    className={`p-8 rounded-3xl border-2 shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col pointer-events-auto ${
                      theme === 'dark' 
                        ? `${services[expandedCard].bgColorDark} ${services[expandedCard].borderColorDark} vhs-noise vhs-scanlines` 
                        : `${services[expandedCard].bgColorLight} border-white vhs-noise`
                    }`}
                    animate={{
                      y: [0, -8, 0],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Header */}
                    <div className="flex-shrink-0 mb-4">
                      <h3 className={`text-2xl font-bold ${theme === 'dark' ? 'text-purple-100' : 'text-gray-900'}`}>
                        {services[expandedCard].title}
                      </h3>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto pr-4 space-y-4">
                      <div>
                        <h4 className={`font-semibold mb-2 flex items-center gap-2 ${theme === 'dark' ? 'text-purple-200' : 'text-gray-800'}`}>
                          ⏱️ Duration: <span className={`font-normal ${theme === 'dark' ? 'text-purple-200/80' : 'text-gray-600'}`}>{services[expandedCard].details.duration}</span>
                        </h4>
                      </div>
                      
                      <div>
                        <h4 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-purple-200' : 'text-gray-800'}`}>✅ What's Included:</h4>
                        <ul className={`space-y-1 ${theme === 'dark' ? 'text-purple-200/80' : 'text-gray-600'}`}>
                          {services[expandedCard].details.includes.map((item, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-green-400 mt-1 flex-shrink-0">•</span>
                              <span className="text-sm">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-purple-800/40 border border-purple-700/40' : 'bg-white/70 border border-gray-200'}`}>
                        <p className={`text-sm ${theme === 'dark' ? 'text-purple-200' : 'text-gray-700'}`}>
                          <span className="font-semibold block mb-1">💡 Ideal for:</span> {services[expandedCard].details.ideal}
                        </p>
                      </div>
                    </div>

                    {/* Footer Buttons */}
                    <div className="flex-shrink-0 mt-6 pt-4 border-t border-opacity-20" style={{ borderColor: 'currentColor' }}>
                      <button
                        onClick={() => setExpandedCard(null)}
                        className={`w-full px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                          theme === 'dark'
                            ? 'bg-gradient-to-r from-purple-700 to-pink-600 hover:shadow-lg hover:shadow-purple-500/50 text-white'
                            : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:shadow-lg text-white'
                        }`}
                      >
                        Close
                      </button>
                    </div>
                  </motion.div>
                </BubbleEffect>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-16"
        >
          <a
            href="#contact"
            className="inline-flex items-center gap-2 px-10 py-5 vhs-gradient text-white rounded-full cartoon-shadow vhs-glow hover:scale-105 transition-transform duration-300 text-lg"
          >
            <Sparkles className="w-6 h-6" />
            Book Your Service Today!
          </a>
        </motion.div>
      </div>
    </section>
  );
}