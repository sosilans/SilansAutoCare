import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { useTheme } from './ThemeContext';
import { useLanguage } from './LanguageContext';

interface QuickServiceSelectorProps {
  selectedServices: string[];
  onServicesChange: (services: string[]) => void;
}

export function QuickServiceSelector({ selectedServices, onServicesChange }: QuickServiceSelectorProps) {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const services = [
    t('services.cards.basic.title'),
    t('services.cards.interior.title'),
    t('services.cards.full.title'),
    t('services.cards.exterior.title'),
    t('services.cards.engine.title'),
    t('services.cards.maintenance.title'),
    t('contact.services.notSure')
  ];

  const handleToggleService = (service: string) => {
    const updated = selectedServices.includes(service)
      ? selectedServices.filter(s => s !== service)
      : [...selectedServices, service];
    onServicesChange(updated);
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-6 py-3 rounded-2xl border transition-all duration-300 flex items-center justify-between gradient-animated ${
          theme === 'dark'
            ? 'bg-gradient-to-r from-pink-500/40 to-purple-500/40 text-pink-200 hover:from-pink-500/60 hover:to-purple-500/60 border-pink-500/20'
            : 'bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600 border-pink-600'
        }`}
      >
        <span className="text-sm font-medium">
          {t('contact.services.choose')}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transitionEnd={{ height: 'auto' }}
            transition={{ duration: 0.3 }}
            className={`rounded-2xl border-2 overflow-hidden ${
              theme === 'dark'
                ? 'bg-purple-900/30 border-purple-500/30 vhs-noise'
                : 'bg-white border-gray-100'
            }`}
          >
            <div className="p-4 space-y-3">
              {services.map((service) => (
                <label key={service} className="flex items-center gap-3 cursor-pointer group w-full">
                  <input
                    type="checkbox"
                    checked={selectedServices.includes(service)}
                    onChange={() => handleToggleService(service)}
                    className="absolute opacity-0 pointer-events-none"
                    tabIndex={-1}
                  />
                  <div className={`w-5 h-5 rounded border-2 transition-all duration-200 flex items-center justify-center flex-shrink-0 ${
                    selectedServices.includes(service)
                      ? theme === 'dark'
                        ? 'bg-gradient-to-br from-pink-500 to-purple-500 border-pink-400 shadow-lg shadow-pink-500/50'
                        : 'bg-gradient-to-br from-pink-400 to-purple-400 border-pink-500 shadow-lg shadow-pink-400/40'
                      : theme === 'dark'
                      ? 'bg-purple-900/40 border-purple-500/40 group-hover:border-purple-400/60'
                      : 'bg-white border-gray-300 group-hover:border-gray-400'
                  }`}>
                    {selectedServices.includes(service) && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span
                    className={`text-sm transition-colors min-w-0 ${
                      theme === 'dark'
                        ? 'text-purple-200 group-hover:text-purple-100'
                        : 'text-gray-900 group-hover:text-gray-900'
                    }`}
                  >
                    {service}
                  </span>
                </label>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
