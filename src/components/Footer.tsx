import { motion } from 'motion/react';
import { Instagram, Facebook, Heart } from 'lucide-react';
import { useTheme } from './ThemeContext';
import { useLanguage } from './LanguageContext';

export function Footer() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  
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
              {t('footer.tagline')} — {t('footer.description')}
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h4 className={`mb-4 ${theme === 'dark' ? 'text-purple-100' : 'text-gray-900'}`}>{t('footer.quick')}</h4>
            <ul className="space-y-2">
              {[
                { label: t('nav.about'), href: '#about' },
                { label: t('nav.portfolio'), href: '#portfolio' },
                { label: t('nav.services'), href: '#services' },
                { label: t('nav.reviews'), href: '#reviews' },
                { label: t('nav.contact'), href: '#contact' }
              ].map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className={`transition-colors ${
                      theme === 'dark'
                        ? 'text-purple-300/70 hover:text-pink-400'
                        : 'text-gray-600 hover:text-blue-600'
                    }`}
                  >
                    {item.label}
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
            <h4 className={`mb-4 ${theme === 'dark' ? 'text-purple-100' : 'text-gray-900'}`}>{t('footer.follow')}</h4>
            <div className="flex gap-3 mb-4">
              <a
                href="https://www.instagram.com/silansautocare?igsh=NTc4MTIwNjQ2YQ%3D%3D&utm_source=qr"
                target="_blank"
                rel="noopener noreferrer"
                className={`p-3 rounded-xl bg-gradient-to-br from-pink-400 via-purple-400 to-orange-400 text-white hover:scale-110 transition-transform duration-300 cartoon-shadow-sm gradient-animated ${
                  theme === 'dark' ? 'vhs-glow-dark' : 'vhs-glow-light'
                }`}
                aria-label={t('social.instagram')}
              >
                <Instagram className="w-6 h-6" />
              </a>
              <a
                href="https://www.facebook.com/silansautocare?mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                className={`p-3 rounded-xl bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 text-white hover:scale-110 transition-transform duration-300 cartoon-shadow-sm gradient-animated ${
                  theme === 'dark' ? 'vhs-glow-dark' : 'vhs-glow-light'
                }`}
                aria-label={t('social.facebook')}
              >
                <Facebook className="w-6 h-6" />
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
            © 2025 Silans Auto Care, Sacramento · {t('footer.rights')}
            <Heart className="w-4 h-4 fill-red-500 text-red-500 inline" />
            {t('footer.madeWithLove')}
          </p>
        </motion.div>
      </div>
    </footer>
  );
}