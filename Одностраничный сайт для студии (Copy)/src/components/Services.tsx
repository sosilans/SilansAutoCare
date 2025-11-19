import { motion } from 'motion/react';
import { Droplet, Shield, Sparkles, Wind, Car, Zap } from 'lucide-react';
import { BubbleEffect } from './BubbleEffect';
import { useTheme } from './ThemeContext';

export function Services() {
  const { theme } = useTheme();
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

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
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
                <div className={`h-full p-8 rounded-3xl border-2 cartoon-shadow hover:scale-105 transition-all duration-300 ${
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
                </div>
              </BubbleEffect>
            </motion.div>
          ))}
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