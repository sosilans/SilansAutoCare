import { motion } from 'motion/react';
import { Instagram, Mail, Heart } from 'lucide-react';
import { useTheme } from './ThemeContext';

export function Footer() {
  const { theme } = useTheme();
  
  return (
    <footer className={`relative py-12 overflow-hidden border-t-4 ${
      theme === 'dark'
        ? 'bg-gradient-to-br from-slate-900 to-indigo-950 border-cyan-400/30'
        : 'bg-gradient-to-br from-blue-100 to-purple-100 border-white'
    }`}>
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h4 className={`text-transparent bg-clip-text mb-4 ${
              theme === 'dark'
                ? 'bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 vhs-text-dark'
                : 'bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 vhs-text-light'
            }`}>
              Silans Auto Care
            </h4>
            <p className={`mb-4 ${theme === 'dark' ? 'text-purple-200/70' : 'text-gray-700'}`}>
              Your friendly auto care experts in Sacramento! Making cars happy since day one! 🚗✨
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h4 className={`mb-4 ${theme === 'dark' ? 'text-purple-100' : 'text-gray-900'}`}>Quick Links</h4>
            <ul className="space-y-2">
              {['About', 'Portfolio', 'Services', 'Reviews', 'Contact'].map((item) => (
                <li key={item}>
                  <a
                    href={`#${item.toLowerCase()}`}
                    className={`transition-colors ${
                      theme === 'dark'
                        ? 'text-purple-300/70 hover:text-pink-400'
                        : 'text-gray-600 hover:text-blue-600'
                    }`}
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Social */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h4 className={`mb-4 ${theme === 'dark' ? 'text-purple-100' : 'text-gray-900'}`}>Follow Us!</h4>
            <div className="flex gap-3 mb-4">
              <a
                href="https://instagram.com/silansautocare"
                target="_blank"
                rel="noopener noreferrer"
                className={`p-3 rounded-xl bg-gradient-to-br from-pink-400 via-purple-400 to-orange-400 text-white hover:scale-110 transition-transform duration-300 cartoon-shadow-sm gradient-animated ${
                  theme === 'dark' ? 'vhs-glow-dark' : 'vhs-glow-light'
                }`}
                aria-label="Instagram"
              >
                <Instagram className="w-6 h-6" />
              </a>
              <a
                href="#contact"
                target="_blank"
                rel="noopener noreferrer"
                className={`p-3 rounded-xl bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 text-white hover:scale-110 transition-transform duration-300 cartoon-shadow-sm gradient-animated ${
                  theme === 'dark' ? 'vhs-glow-dark' : 'vhs-glow-light'
                }`}
                aria-label="Facebook"
              >
                <Mail className="w-6 h-6" />
              </a>
            </div>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className={`pt-8 border-t-2 text-center ${
            theme === 'dark' ? 'border-purple-500/30' : 'border-white/50'
          }`}
        >
          <p className={`flex items-center justify-center gap-2 flex-wrap ${
            theme === 'dark' ? 'text-purple-200/70' : 'text-gray-700'
          }`}>
            © 2025 Silans Auto Care, Sacramento
            <Heart className="w-4 h-4 fill-red-500 text-red-500 inline" />
            Made with love for your car!
          </p>
        </motion.div>
      </div>
    </footer>
  );
}