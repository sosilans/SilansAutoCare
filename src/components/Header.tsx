import { useState, useEffect } from 'react';
import { Menu, X, Sun, Moon, User } from 'lucide-react';
import { useTheme } from './ThemeContext';
import { useLanguage } from './LanguageContext';
import { useAuth } from './AuthContext';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { openAuthModal, user, logout } = useAuth();

  const cycleLanguage = () => {
    const languages: ('en' | 'es' | 'ru')[] = ['en', 'es', 'ru'];
    const currentIndex = languages.indexOf(language);
    const nextIndex = (currentIndex + 1) % languages.length;
    setLanguage(languages[nextIndex]);
  };

  const getNextLanguage = () => {
    const languages: ('en' | 'es' | 'ru')[] = ['en', 'es', 'ru'];
    const currentIndex = languages.indexOf(language);
    const nextIndex = (currentIndex + 1) % languages.length;
    return languages[nextIndex].toUpperCase();
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Определяем направление скролла
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Скроллим вниз и прошли больше 100px - скрываем header
        setIsVisible(false);
      } else {
        // Скроллим вверх - показываем header
        setIsVisible(true);
      }
      
      setIsScrolled(currentScrollY > 20);
      setLastScrollY(currentScrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const navItems = [
    { name: t('nav.about'), href: '#about' },
    { name: t('nav.portfolio'), href: '#portfolio' },
    { name: t('nav.services'), href: '#services' },
    { name: t('nav.reviews'), href: '#reviews' },
    { name: t('nav.faq'), href: '#faq' },
    { name: t('nav.contact'), href: '#contact' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${
        isScrolled
          ? theme === 'dark'
            ? 'bg-black/60 backdrop-blur-lg border-b border-purple-500/20'
            : 'bg-white/80 backdrop-blur-lg border-b border-blue-200/20'
          : 'bg-transparent'
      } ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <a href="#hero" className="flex items-center space-x-2 group">
            <div className="relative">
              <h4 className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 transition-all duration-300 group-hover:scale-105">
                Silans Auto Care
              </h4>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <div className="flex items-center space-x-8">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className={`relative transition-colors duration-500 group opacity-70 hover:opacity-100 ${
                    theme === 'dark'
                      ? 'text-purple-200 hover:text-white'
                      : isScrolled
                      ? 'text-gray-700 hover:text-gray-900'
                      : 'text-gray-900 hover:text-gray-700'
                  }`}
                >
                  {item.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 group-hover:w-full transition-all duration-300"></span>
                </a>
              ))}
            </div>
            
            <div className="flex items-center gap-2">
              {/* Theme Toggle Button - Desktop */}
              <button
                onClick={toggleTheme}
                className={`relative p-2 rounded-xl transition-all duration-300 hover:scale-110 ${
                  theme === 'dark'
                    ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 text-white vhs-glow'
                    : 'bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 text-white vhs-glow'
                }`}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              
              {/* Language Toggle Button - Desktop */}
              <button
                onClick={cycleLanguage}
                className={`relative p-2 rounded-full w-9 h-9 flex items-center justify-center transition-all duration-300 hover:scale-110 ${
                  theme === 'dark'
                    ? 'bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 text-white vhs-glow'
                    : 'bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 text-white vhs-glow'
                }`}
                aria-label="Change language"
              >
                <span className="text-sm font-bold">{getNextLanguage()}</span>
              </button>

              {/* Login/Logout Button - Desktop */}
              {user ? (
                <button
                  onClick={logout}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl transition-transform duration-300 hover:scale-105 ${
                    theme === 'dark'
                      ? 'bg-purple-900/20 border-2 border-purple-500/30 text-purple-100 vhs-noise'
                      : 'bg-white border-2 border-purple-400 text-purple-600'
                  }`}
                >
                  <User size={18} />
                  <span>Logout</span>
                </button>
              ) : (
                <button
                  onClick={() => openAuthModal('login')}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl transition-transform duration-300 hover:scale-105 ${
                    theme === 'dark'
                      ? 'bg-purple-900/20 border-2 border-purple-500/30 text-purple-100 vhs-noise'
                      : 'bg-white border-2 border-purple-400 text-purple-600'
                  }`}
                >
                  <User size={18} />
                  <span>Login</span>
                </button>
              )}
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors duration-500 ${
              theme === 'dark' ? 'text-purple-200' : isScrolled ? 'text-gray-700' : 'text-gray-900'
            }`}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className={`md:hidden backdrop-blur-lg border-b ${
          theme === 'dark'
            ? 'bg-indigo-900/98 border-purple-400/20'
            : 'bg-blue-50/98 border-blue-200/20'
        }`}>
          <nav className="container mx-auto px-4 py-4 flex flex-col space-y-4">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`transition-colors duration-300 py-2 ${
                  theme === 'dark' ? 'text-purple-200 hover:text-white' : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                {item.name}
              </a>
            ))}
            
            {/* Theme Toggle Button - Mobile */}
            <button
              onClick={toggleTheme}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl transition-all duration-300 ${
                theme === 'dark'
                  ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 text-white vhs-glow'
                  : 'bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 text-white vhs-glow'
              }`}
            >
              {theme === 'dark' ? (
                <>
                  <Sun size={20} />
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <Moon size={20} />
                  <span>Dark Mode</span>
                </>
              )}
            </button>

            {/* Language Toggle Button - Mobile */}
            <button
              onClick={cycleLanguage}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl transition-all duration-300 ${
                theme === 'dark'
                  ? 'bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 text-white vhs-glow'
                  : 'bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 text-white vhs-glow'
              }`}
            >
              <span className="font-bold">{getNextLanguage()}</span>
            </button>

                {/* Login/Logout Button - Mobile */}
                {user ? (
                  <button
                    onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl transition-all duration-300 border-2 ${
                      theme === 'dark'
                        ? 'border-purple-500/30 bg-purple-950/30 text-purple-200 hover:bg-purple-900/40'
                        : 'border-purple-400 bg-white text-purple-600 hover:bg-purple-50'
                    }`}
                  >
                    <User size={20} />
                    <span>Logout</span>
                  </button>
                ) : (
                  <button
                    onClick={() => { openAuthModal('login'); setIsMobileMenuOpen(false); }}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl transition-all duration-300 border-2 ${
                      theme === 'dark'
                        ? 'border-purple-500/30 bg-purple-950/30 text-purple-200 hover:bg-purple-900/40'
                        : 'border-purple-400 bg-white text-purple-600 hover:bg-purple-50'
                    }`}
                  >
                    <User size={20} />
                    <span>Login</span>
                  </button>
                )}
          </nav>
        </div>
      )}
    </header>
  );
}