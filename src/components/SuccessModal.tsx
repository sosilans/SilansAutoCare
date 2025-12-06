import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, X } from 'lucide-react';
import { useTheme } from './ThemeContext';
import { useLanguage } from './LanguageContext';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SuccessModal({ isOpen, onClose }: SuccessModalProps) {
  const { theme } = useTheme();
  const { t } = useLanguage();

  React.useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 7000); // Auto-close after 7 seconds
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Modal */}
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ 
                duration: 0.3, 
                type: 'spring', 
                stiffness: 300, 
                damping: 25 
              }}
              className="pointer-events-auto w-full max-w-md"
            >
              <div className={`relative p-8 rounded-3xl border-2 cartoon-shadow-sm ${ 
                theme === 'dark'
                  ? 'bg-purple-900/95 border-purple-500/30 vhs-noise backdrop-blur-xl'
                  : 'bg-white border-green-200'
              }`}>
                {/* Close button */}
                <button
                  onClick={onClose}
                  className={`absolute top-4 right-4 p-2 rounded-full transition-all duration-200 ${ 
                    theme === 'dark'
                      ? 'hover:bg-purple-800/50 text-purple-300 hover:text-purple-100'
                      : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Success Icon with animation */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ 
                    delay: 0.2,
                    type: 'spring',
                    stiffness: 200,
                    damping: 10
                  }}
                  className="flex justify-center mb-6"
                >
                  <div className={`relative ${ 
                    theme === 'dark'
                      ? 'text-green-400'
                      : 'text-green-500'
                  }`}>
                    <CheckCircle2 className="w-20 h-20" strokeWidth={2} />
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: [0, 1.5, 1], opacity: [0, 0.6, 0] }}
                      transition={{ 
                        duration: 0.6,
                        delay: 0.3,
                        times: [0, 0.5, 1]
                      }}
                      className={`absolute inset-0 rounded-full blur-xl ${ 
                        theme === 'dark'
                          ? 'bg-green-400'
                          : 'bg-green-500'
                      }`}
                    />
                  </div>
                </motion.div>

                {/* Text content */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-center"
                >
                  <h3 className={`text-2xl font-bold mb-3 ${ 
                    theme === 'dark'
                      ? 'text-green-400'
                      : 'text-green-600'
                  }`}>
                    {t('contact.success.title')}
                  </h3>
                  <p className={`text-base leading-relaxed ${ 
                    theme === 'dark'
                      ? 'text-purple-200'
                      : 'text-gray-700'
                  }`}>
                    {t('contact.success.message')}
                  </p>
                </motion.div>

                {/* Progress bar */}
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 7, ease: 'linear' }}
                  className={`absolute bottom-0 left-0 right-0 h-1 rounded-b-3xl origin-left ${ 
                    theme === 'dark'
                      ? 'bg-gradient-to-r from-green-400 to-cyan-400'
                      : 'bg-gradient-to-r from-green-500 to-blue-500'
                  }`}
                />
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
