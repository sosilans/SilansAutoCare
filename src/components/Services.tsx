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
      title: 'Premium Wash',
      description: 'Hand wash with gentle care, foam treatment & microfiber drying',
      price: '$80',
      color: 'from-cyan-400 via-blue-400 to-purple-400',
      bgColorLight: 'bg-cyan-50',
      bgColorDark: 'bg-cyan-900/20',
      borderColorDark: 'border-cyan-500/30',
      details: {
        duration: '1-1.5 hours',
        includes: [
          'Pre-wash foam treatment',
          'Hand wash with pH-neutral soap',
          'Wheel & tire cleaning',
          'Microfiber drying',
          'Exterior glass cleaning',
          'Tire shine application'
        ],
        ideal: 'Regular maintenance and keeping your car looking fresh'
      }
    },
    {
      icon: <Sparkles className="w-10 h-10" />,
      emoji: '✨',
      title: 'Paint Correction',
      description: 'Remove scratches & swirls for that showroom shine',
      price: '$350',
      color: 'from-purple-400 via-pink-400 to-purple-500',
      bgColorLight: 'bg-purple-50',
      bgColorDark: 'bg-purple-900/20',
      borderColorDark: 'border-purple-500/30',
      details: {
        duration: '4-6 hours',
        includes: [
          'Multi-stage paint polishing',
          'Swirl mark removal',
          'Light scratch removal',
          'Paint depth measurement',
          'Professional buffing',
          'Final polish application'
        ],
        ideal: 'Restoring faded paint and removing imperfections'
      }
    },
    {
      icon: <Shield className="w-10 h-10" />,
      emoji: '🛡️',
      title: 'Ceramic Coating',
      description: 'Long-lasting protection with amazing water-repellent finish',
      price: '$800',
      color: 'from-pink-400 via-rose-400 to-orange-400',
      bgColorLight: 'bg-pink-50',
      bgColorDark: 'bg-pink-900/20',
      borderColorDark: 'border-pink-500/30',
      details: {
        duration: '8-10 hours',
        includes: [
          '9H hardness ceramic coating',
          'Paint correction prep',
          'Surface decontamination',
          'Multi-layer application',
          '5-year protection guarantee',
          'Hydrophobic water beading'
        ],
        ideal: 'Maximum protection and long-term paint preservation'
      }
    },
    {
      icon: <Wind className="w-10 h-10" />,
      emoji: '🌪️',
      title: 'Interior Detailing',
      description: 'Deep clean seats, carpets & dashboard. Fresh like new!',
      price: '$200',
      color: 'from-cyan-400 via-teal-400 to-green-400',
      bgColorLight: 'bg-cyan-50',
      bgColorDark: 'bg-teal-900/20',
      borderColorDark: 'border-teal-500/30',
      details: {
        duration: '2-3 hours',
        includes: [
          'Steam cleaning of all surfaces',
          'Leather conditioning',
          'Carpet & upholstery shampooing',
          'Dashboard & console cleaning',
          'Air vent detailing',
          'Interior glass polishing'
        ],
        ideal: 'Deep cleaning and refreshing your car\'s interior'
      }
    },
    {
      icon: <Car className="w-10 h-10" />,
      emoji: '🚗',
      title: 'Engine Bay Clean',
      description: 'Safe degreasing & detailing of your engine compartment',
      price: '$120',
      color: 'from-blue-400 via-cyan-400 to-teal-400',
      bgColorLight: 'bg-blue-50',
      bgColorDark: 'bg-blue-900/20',
      borderColorDark: 'border-blue-500/30',
      details: {
        duration: '1-2 hours',
        includes: [
          'Safe degreasing process',
          'Engine component protection',
          'Pressure washing',
          'Plastic & rubber restoration',
          'Engine bay dressing',
          'Final inspection'
        ],
        ideal: 'Maintaining engine components and improving resale value'
      }
    },
    {
      icon: <Zap className="w-10 h-10" />,
      emoji: '⚡',
      title: 'Full Package',
      description: 'Complete transformation! Everything your car needs',
      price: '$600',
      color: 'from-purple-400 via-pink-400 to-cyan-400',
      bgColorLight: 'bg-purple-50',
      bgColorDark: 'bg-purple-900/20',
      borderColorDark: 'border-pink-500/30',
      details: {
        duration: 'Full day (6-8 hours)',
        includes: [
          'All Premium Wash services',
          'Complete Interior Detailing',
          'Engine Bay Cleaning',
          'Paint Correction (1-stage)',
          'Wax protection',
          'Complimentary air freshener'
        ],
        ideal: 'Complete car transformation and maximum value'
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
                y: [0, -12, 0],
                x: [0, index % 2 === 0 ? 4 : -4, 0],
                rotate: [0, index % 2 === 0 ? 0.4 : -0.4, 0],
              }}
              transition={{
                opacity: { duration: 0.6, delay: index * 0.1 },
                y: {
                  duration: 7 + index * 0.7,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: index * 0.2,
                },
                x: {
                  duration: 7 + index * 0.7,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: index * 0.2,
                },
                rotate: {
                  duration: 7 + index * 0.7,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: index * 0.2,
                },
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
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 pointer-events-none flex items-start justify-center pt-20"
            >
              <motion.div
                className={`p-6 rounded-3xl border-2 shadow-2xl w-96 pointer-events-auto ${
                  theme === 'dark' 
                    ? `${services[expandedCard].bgColorDark} ${services[expandedCard].borderColorDark} vhs-noise vhs-scanlines` 
                    : `${services[expandedCard].bgColorLight} border-white vhs-noise`
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                <div className={`space-y-4 ${theme === 'dark' ? 'text-purple-100' : 'text-gray-800'}`}>
                  <h3 className="text-xl font-bold mb-4">{services[expandedCard].title}</h3>
                  
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      ⏱️ Duration: <span className="font-normal">{services[expandedCard].details.duration}</span>
                    </h4>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">✅ What's Included:</h4>
                    <ul className={`space-y-1 ${theme === 'dark' ? 'text-purple-200/80' : 'text-gray-600'}`}>
                      {services[expandedCard].details.includes.map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-green-500 mt-1">•</span>
                          <span className="text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-purple-800/30' : 'bg-white/60'}`}>
                    <p className="text-sm">
                      <span className="font-semibold">💡 Ideal for:</span> {services[expandedCard].details.ideal}
                    </p>
                  </div>

                  <button
                    onClick={() => setExpandedCard(null)}
                    className={`w-full mt-4 px-4 py-2 rounded-lg transition-colors ${
                      theme === 'dark'
                        ? 'bg-purple-700/50 hover:bg-purple-600/50 text-purple-100'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                    }`}
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        </div>

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