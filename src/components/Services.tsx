import { motion, AnimatePresence } from 'motion/react';
import { Droplet, Wind, Car, Sparkles, Zap as ZapIcon, Shield, ChevronDown, X } from 'lucide-react';
import { BubbleEffect } from './BubbleEffect';
import { useTheme } from './ThemeContext';
import { useLanguage } from './LanguageContext';
import { useState } from 'react';

interface ServiceDetails {
  whatYouGet: string[];
  bestFor: string;
  toolsUsed: string[];
  importantNotes: string[];
  whyChooseUs: string[];
  duration: string;
  startingPrice: string;
}

interface Service {
  id: number;
  icon: React.ReactNode;
  emoji: string;
  title: string;
  headline: string;
  description: string;
  color: string;
  bgColorLight: string;
  bgColorDark: string;
  borderColorDark: string;
  details: ServiceDetails;
}

export function Services() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [expandedCard, setExpandedCard] = useState<number | null>(null);

  const services: Service[] = [
    {
      id: 1,
      icon: <Droplet className="w-10 h-10" />,
      emoji: '💧',
      title: 'Basic Exterior Wash',
      headline: 'Your Car Deserves Fresh',
      description: 'Hand-wash perfection with premium foam bath, wax protection, and mirror-shine finish.',
      color: 'from-cyan-400 via-blue-400 to-purple-400',
      bgColorLight: 'bg-cyan-50',
      bgColorDark: 'bg-cyan-900/20',
      borderColorDark: 'border-cyan-500/30',
      details: {
        whatYouGet: [
          'Pre-wash foam treatment for safe cleaning',
          'Gentle hand wash with premium soap',
          'Wheel, tire, and trim cleaning',
          'Microfiber drying to prevent water spots',
          'Exterior glass polishing',
          'Tire and trim protection'
        ],
        bestFor: 'Cars that need regular maintenance, before events, or seasonal refresh',
        toolsUsed: ['Foam cannon', 'Microfiber wash mitt', 'Premium soaps', 'Microfiber towels', 'Tire dressing'],
        importantNotes: [
          '💧 I use your property\'s water supply for washing.',
          '⚡ If no water is available, let me know in advance.',
          '⏱️ Typical duration: 1 hour',
          '🚗 Optimal for: All vehicle types'
        ],
        whyChooseUs: [
          'Hand-wash only — no harsh brushes that scratch paint',
          'Premium soap protects your clear coat',
          'Microfiber technology for spotless finish',
          'Attention to every detail, from wheel wells to trim'
        ],
        duration: '~1 hour',
        startingPrice: '$120'
      }
    },
    {
      id: 2,
      icon: <Wind className="w-10 h-10" />,
      emoji: '🌪️',
      title: 'Interior Deep Clean',
      headline: 'Restore Fresh Car Feeling',
      description: 'Tornado-powered extraction, steam cleaning, and precision detailing for pristine interiors.',
      color: 'from-cyan-400 via-teal-400 to-green-400',
      bgColorLight: 'bg-teal-50',
      bgColorDark: 'bg-teal-900/20',
      borderColorDark: 'border-teal-500/30',
      details: {
        whatYouGet: [
          'Complete vacuuming with commercial-grade equipment',
          'Tornado air circulation for deep carpet cleaning',
          'Steam extraction for stubborn stains',
          'Seat shampooing and conditioning',
          'Dashboard, console, and vent detailing',
          'Door panels and interior trim refresh'
        ],
        bestFor: 'Cars with heavy interior use, pet owners, or before resale',
        toolsUsed: ['Tornador', 'Steam cleaner', 'Mighty extractor', 'Professional vacuums', 'Microfiber brushes'],
        importantNotes: [
          '💧 Water supply needed for steam and extraction.',
          '⚡ Generator available if no power outlet on-site (small extra fee).',
          '⏱️ Typical duration: 1.5–2 hours',
          '🚗 Drying time: 2–4 hours recommended'
        ],
        whyChooseUs: [
          'Professional-grade Tornador for deep fiber cleaning',
          'Steam kills bacteria and odors naturally',
          'Mighty extractor removes water for faster drying',
          'Every surface treated with premium products'
        ],
        duration: '1.5–2 hours',
        startingPrice: '$180'
      }
    },
    {
      id: 3,
      icon: <Car className="w-10 h-10" />,
      emoji: '🚗',
      title: 'Full Detail Package',
      headline: 'Complete Transformation',
      description: 'Premium inside + outside: wash, extract, protect, shine. Your car will feel brand new.',
      color: 'from-purple-400 via-pink-400 to-cyan-400',
      bgColorLight: 'bg-purple-50',
      bgColorDark: 'bg-purple-900/20',
      borderColorDark: 'border-purple-500/30',
      details: {
        whatYouGet: [
          'Full exterior wash with foam bath and wax finish',
          'Interior deep clean with Tornador and steam',
          'Leather conditioning (if applicable)',
          'Seat extraction and stain treatment',
          'Engine bay degreasing and dressing',
          'Windows and all glass polished to perfection'
        ],
        bestFor: 'Luxury vehicles, before special events, or complete refresh after heavy use',
        toolsUsed: ['All professional tools', 'Tornador', 'Steam cleaner', 'Mighty extractor', 'Leather care products'],
        importantNotes: [
          '💧 Water and power supply required.',
          '⚡ Generator option available if needed (extra fee applies).',
          '⏱️ Typical duration: 3–5 hours (same day or scheduled)',
          '🏆 Best results: book for early morning appointments'
        ],
        whyChooseUs: [
          'Most popular choice — we\'ve perfected this package',
          'Your car looks dealership-fresh',
          'Engine bay included — often missed by others',
          'All systems working together for maximum impact'
        ],
        duration: '3–5 hours',
        startingPrice: '$420'
      }
    },
    {
      id: 4,
      icon: <Sparkles className="w-10 h-10" />,
      emoji: '✨',
      title: 'Exterior Shine Package',
      headline: 'Paint Perfection, Wax Protection',
      description: 'Professional hand wash with premium wax sealant for lasting exterior brilliance.',
      color: 'from-blue-400 via-cyan-400 to-teal-400',
      bgColorLight: 'bg-blue-50',
      bgColorDark: 'bg-blue-900/20',
      borderColorDark: 'border-blue-500/30',
      details: {
        whatYouGet: [
          'Full hand wash with two-bucket method',
          'Tire and wheel detail with shine',
          'Paint clarification (light clay bar treatment)',
          'Premium wax sealant application',
          'Trim and rubber protection',
          'Final polish for mirror-like shine'
        ],
        bestFor: 'Owners wanting lasting paint protection and show-quality finish',
        toolsUsed: ['Premium foam', 'Clay bar', 'Microfiber towels', 'Professional wax', 'Applicator pads'],
        importantNotes: [
          '💧 Water supply needed for washing phase.',
          '⚡ No power required for this service.',
          '⏱️ Typical duration: 2–3 hours',
          '🌞 Best time: Cloudy day or morning for wax curing'
        ],
        whyChooseUs: [
          'Premium wax lasts 2–3 months with proper care',
          'Paint protection against UV and contaminants',
          'Clay bar removes embedded iron and fallout',
          'Results: Show-room quality shine'
        ],
        duration: '2–3 hours',
        startingPrice: '$220'
      }
    },
    {
      id: 5,
      icon: <ZapIcon className="w-10 h-10" />,
      emoji: '⚡',
      title: 'Engine Bay Clean',
      headline: 'Professional Under-Hood Detail',
      description: 'Safe steam cleaning and degreasing for pristine engine components and presentation.',
      color: 'from-yellow-400 via-orange-400 to-red-400',
      bgColorLight: 'bg-orange-50',
      bgColorDark: 'bg-orange-900/20',
      borderColorDark: 'border-orange-500/30',
      details: {
        whatYouGet: [
          'Safe degreasing of engine and components',
          'Steam cleaning for deep dirt removal',
          'Plastic and rubber dressing application',
          'Metal components protected with dressing',
          'Final inspection and shine finish',
          'Professional presentation-ready result'
        ],
        bestFor: 'Before vehicle resale, trade-in, or showing your pride of ownership',
        toolsUsed: ['Steam cleaner', 'Degreaser', 'Protective dressing', 'Brushes', 'Microfiber cloths'],
        importantNotes: [
          '💧 Water required for steam cleaning.',
          '⚡ Power outlet needed for steam equipment.',
          '⏱️ Typical duration: 45 minutes to 1 hour',
          '🚗 Most impressive when combined with exterior wash'
        ],
        whyChooseUs: [
          'Professional equipment — safe for all engine types',
          'Degreaser removes years of buildup',
          'Protection applied to prevent new grime',
          'Engine runs cooler when clean'
        ],
        duration: '~45 min',
        startingPrice: '$85'
      }
    },
    {
      id: 6,
      icon: <Shield className="w-10 h-10" />,
      emoji: '🛡️',
      title: 'Maintenance Plan',
      headline: 'Stay Perfect Year-Round',
      description: 'Recurring care every 60 days at loyalty rate. Consistent protection, fresh appearance always.',
      color: 'from-pink-400 via-rose-400 to-orange-400',
      bgColorLight: 'bg-pink-50',
      bgColorDark: 'bg-pink-900/20',
      borderColorDark: 'border-pink-500/30',
      details: {
        whatYouGet: [
          'Discounted service rate for recurring bookings',
          'Flexible scheduling every 60 days',
          'Priority appointment slots',
          'Custom service selection each visit',
          'Loyalty rewards and perks',
          'Your car always show-ready'
        ],
        bestFor: 'Luxury car owners, daily drivers, and those who value consistent perfection',
        toolsUsed: ['Full toolset', 'All professional equipment', 'Premium products'],
        importantNotes: [
          '💰 PRICING LOGIC: Book every 60 days → Discounted rate.',
          '⏰ Miss 60-day window? → Full cleaning price applies.',
          '📅 Easy rescheduling within your plan.',
          '✅ No contracts — flexible month-to-month'
        ],
        whyChooseUs: [
          'Save 20–30% vs. booking single services',
          'Your car never gets dirty — always maintained',
          'Priority scheduling around your lifestyle',
          'Building trust through consistent excellence'
        ],
        duration: 'Varies by service',
        startingPrice: 'Custom (Starts at $99)'
      }
    }
  ];

  return (
    <section
      id="services"
      className="relative py-20 sm:py-32 overflow-hidden"
    >
      {/* Background Decorations */}
      <div
        className={`absolute top-10 left-10 w-64 h-64 rounded-full blur-3xl ${
          theme === 'dark'
            ? 'bg-purple-500/10'
            : 'bg-gradient-to-br from-purple-200 to-pink-200 opacity-30'
        }`}
      ></div>
      <div
        className={`absolute bottom-10 right-10 w-64 h-64 rounded-full blur-3xl ${
          theme === 'dark'
            ? 'bg-cyan-500/10'
            : 'bg-gradient-to-br from-cyan-200 to-blue-200 opacity-30'
        }`}
      ></div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-block px-6 py-2 vhs-gradient text-white rounded-full mb-4 cartoon-shadow-sm vhs-glow">
            <span>Premium Services</span>
          </div>
          <h2
            className={`vhs-text text-transparent bg-clip-text mb-4 ${
              theme === 'dark'
                ? 'bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400'
                : 'bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600'
            }`}
          >
            Precision Detailing for Every Need
          </h2>
          <p
            className={`max-w-2xl mx-auto text-lg ${
              theme === 'dark' ? 'text-purple-200/70' : 'text-gray-600'
            }`}
          >
            Professional hand-washing, steam extraction, and premium protection. Every service tailored to your car's personality.
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-12">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <BubbleEffect intensity="low" variant="light">
                <button
                  onClick={() =>
                    setExpandedCard(expandedCard === service.id ? null : service.id)
                  }
                  className={`w-full h-full p-6 rounded-3xl border-2 transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 text-left group ${
                    theme === 'dark'
                      ? `${service.bgColorDark} ${service.borderColorDark} border-opacity-50 hover:border-opacity-100 focus:ring-offset-slate-900 focus:ring-cyan-400`
                      : `${service.bgColorLight} border-white hover:border-gray-200 focus:ring-offset-slate-50 focus:ring-purple-400`
                  }`}
                  aria-label={`${service.title} - ${service.headline}. Click to see details`}
                >
                  {/* Icon */}
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: index * 0.1
                    }}
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-4 cartoon-shadow-sm ${
                      theme === 'dark' ? 'vhs-glow-dark' : 'vhs-glow-light'
                    }`}
                  >
                    <span className="text-2xl">{service.emoji}</span>
                  </motion.div>

                  {/* Title & Headline */}
                  <h3
                    className={`text-xl font-bold mb-1 ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {service.title}
                  </h3>
                  <p
                    className={`text-sm font-semibold mb-3 ${
                      theme === 'dark'
                        ? 'text-cyan-300'
                        : 'text-purple-600'
                    }`}
                  >
                    {service.headline}
                  </p>

                  {/* Description */}
                  <p
                    className={`mb-4 leading-relaxed ${
                      theme === 'dark'
                        ? 'text-purple-200/80'
                        : 'text-gray-700'
                    }`}
                  >
                    {service.description}
                  </p>

                  {/* CTA and Price */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-sm font-semibold ${
                        theme === 'dark'
                          ? 'text-cyan-300'
                          : 'text-purple-600'
                      }`}
                    >
                      Starting at{' '}
                      <span className="text-lg">
                        {service.details.startingPrice}
                      </span>
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 transition-transform ${
                        expandedCard === service.id ? 'rotate-180' : ''
                      } ${
                        theme === 'dark'
                          ? 'text-cyan-400'
                          : 'text-purple-500'
                      }`}
                    />
                  </div>
                </button>
              </BubbleEffect>
            </motion.div>
          ))}
        </div>

        {/* Modal for Service Details */}
        <AnimatePresence>
          {expandedCard !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setExpandedCard(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className={`max-w-2xl w-full rounded-3xl p-8 max-h-[90vh] overflow-y-auto ${
                  theme === 'dark'
                    ? 'bg-slate-900/95 border border-purple-500/30 vhs-noise'
                    : 'bg-white'
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <button
                  onClick={() => setExpandedCard(null)}
                  className={`absolute top-6 right-6 p-2 rounded-full transition-colors ${
                    theme === 'dark'
                      ? 'hover:bg-purple-500/20 text-purple-300'
                      : 'hover:bg-gray-100 text-gray-600'
                  }`}
                  aria-label="Close modal"
                >
                  <X className="w-6 h-6" />
                </button>

                {/* Modal Header */}
                <div className="mb-6">
                  <h2
                    className={`text-3xl font-bold mb-2 ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {services.find((s) => s.id === expandedCard)?.title}
                  </h2>
                  <p
                    className={`text-lg ${
                      theme === 'dark'
                        ? 'text-cyan-300'
                        : 'text-purple-600'
                    }`}
                  >
                    {services.find((s) => s.id === expandedCard)?.headline}
                  </p>
                </div>

                {/* Service Details */}
                {services.find((s) => s.id === expandedCard)?.details && (
                  <div className="space-y-6">
                    {/* What You Get */}
                    <div>
                      <h3
                        className={`text-lg font-bold mb-3 ${
                          theme === 'dark'
                            ? 'text-purple-300'
                            : 'text-purple-600'
                        }`}
                      >
                        ✨ What You Get
                      </h3>
                      <ul className="space-y-2">
                        {services
                          .find((s) => s.id === expandedCard)
                          ?.details.whatYouGet.map((item, idx) => (
                            <li
                              key={idx}
                              className={`flex gap-2 ${
                                theme === 'dark'
                                  ? 'text-purple-200/80'
                                  : 'text-gray-700'
                              }`}
                            >
                              <span className="text-cyan-400">•</span>
                              {item}
                            </li>
                          ))}
                      </ul>
                    </div>

                    {/* Best For */}
                    <div>
                      <h3
                        className={`text-lg font-bold mb-2 ${
                          theme === 'dark'
                            ? 'text-purple-300'
                            : 'text-purple-600'
                        }`}
                      >
                        🎯 Best For Cars That…
                      </h3>
                      <p
                        className={`${
                          theme === 'dark'
                            ? 'text-purple-200/80'
                            : 'text-gray-700'
                        }`}
                      >
                        {services.find((s) => s.id === expandedCard)?.details
                          .bestFor}
                      </p>
                    </div>

                    {/* Tools Used */}
                    <div>
                      <h3
                        className={`text-lg font-bold mb-2 ${
                          theme === 'dark'
                            ? 'text-purple-300'
                            : 'text-purple-600'
                        }`}
                      >
                        🔧 Tools Used
                      </h3>
                      <p
                        className={`${
                          theme === 'dark'
                            ? 'text-purple-200/80'
                            : 'text-gray-700'
                        }`}
                      >
                        {services
                          .find((s) => s.id === expandedCard)
                          ?.details.toolsUsed.join(', ')}
                      </p>
                    </div>

                    {/* Important Notes */}
                    <div>
                      <h3
                        className={`text-lg font-bold mb-3 ${
                          theme === 'dark'
                            ? 'text-orange-300'
                            : 'text-orange-600'
                        }`}
                      >
                        ⚠️ Important Notes
                      </h3>
                      <ul className="space-y-2">
                        {services
                          .find((s) => s.id === expandedCard)
                          ?.details.importantNotes.map((note, idx) => (
                            <li
                              key={idx}
                              className={`${
                                theme === 'dark'
                                  ? 'text-purple-200/70'
                                  : 'text-gray-600'
                              }`}
                            >
                              {note}
                            </li>
                          ))}
                      </ul>
                    </div>

                    {/* Why Choose Us */}
                    <div>
                      <h3
                        className={`text-lg font-bold mb-3 ${
                          theme === 'dark'
                            ? 'text-cyan-300'
                            : 'text-cyan-600'
                        }`}
                      >
                        💎 Why Choose Silans Auto Care?
                      </h3>
                      <ul className="space-y-2">
                        {services
                          .find((s) => s.id === expandedCard)
                          ?.details.whyChooseUs.map((reason, idx) => (
                            <li
                              key={idx}
                              className={`flex gap-2 ${
                                theme === 'dark'
                                  ? 'text-purple-200/80'
                                  : 'text-gray-700'
                              }`}
                            >
                              <span className="text-cyan-400">→</span>
                              {reason}
                            </li>
                          ))}
                      </ul>
                    </div>

                    {/* CTA */}
                    <div className="mt-8 pt-6 border-t border-purple-500/20">
                      <a
                        href="#contact"
                        onClick={() => setExpandedCard(null)}
                        className={`inline-flex items-center justify-center w-full px-6 py-3 rounded-full font-bold transition-transform hover:scale-105 ${
                          theme === 'dark'
                            ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white vhs-glow-dark'
                            : 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white vhs-glow-light'
                        }`}
                        aria-label={`Book ${services.find((s) => s.id === expandedCard)?.title}`}
                      >
                        Book This Service →
                      </a>
                      <p
                        className={`text-sm text-center mt-3 ${
                          theme === 'dark'
                            ? 'text-purple-300/60'
                            : 'text-gray-500'
                        }`}
                      >
                        Final price depends on vehicle size and condition.
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Transformation Gallery Link Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-16 text-center"
        >
          <p className={`text-lg mb-6 leading-relaxed max-w-2xl mx-auto ${
            theme === 'dark'
              ? 'text-purple-200/80'
              : 'text-gray-700'
          }`}>
            Ready to see your car transformed? Check out our <a href="#portfolio" className={`font-semibold transition-colors ${
              theme === 'dark'
                ? 'text-cyan-300 hover:text-cyan-200'
                : 'text-cyan-600 hover:text-cyan-700'
            }`}>before-and-after gallery</a> to see real results from real customers.
          </p>
        </motion.div>
      </div>
    </section>
  );
}