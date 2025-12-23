import React from 'react';
import { motion } from 'motion/react';
import { useTheme } from './ThemeContext';
import { useLanguage } from './LanguageContext';

interface QuickServiceSelectorProps {
  selectedServices: string[];
  onServicesChange: (services: string[]) => void;
}

export function QuickServiceSelector({ selectedServices, onServicesChange }: QuickServiceSelectorProps) {
  const { theme } = useTheme();
  const { t } = useLanguage();

  const services = [
    t('services.cards.basic.title'),
    t('services.cards.interior.title'),
    t('services.cards.full.title'),
    t('services.cards.exterior.title'),
    t('services.cards.engine.title'),
    t('services.cards.maintenance.title'),
    t('contact.services.notSure')
  ];

  const notSureLabel = t('contact.services.notSure');

  const handleToggleService = (service: string) => {
    const isSelected = selectedServices.includes(service);

    // Mutually exclusive "Not sure" behavior:
    // - Selecting it clears others.
    // - Selecting any other service clears it.
    if (service === notSureLabel) {
      onServicesChange(isSelected ? [] : [notSureLabel]);
      return;
    }

    const withoutNotSure = selectedServices.filter((s) => s !== notSureLabel);
    const updated = isSelected
      ? withoutNotSure.filter((s) => s !== service)
      : [...withoutNotSure, service];

    onServicesChange(updated);
  };

  return (
    <div className="space-y-3">
      <h4 className={`text-sm font-semibold ${theme === 'dark' ? 'text-purple-200' : 'text-gray-700'}`}>
        🧾 {t('contact.services.choose')}
      </h4>

      <div className="flex flex-wrap gap-2">
        {services.map((service) => {
          const isSelected = selectedServices.includes(service);
          return (
            <motion.button
              key={service}
              type="button"
              onClick={() => handleToggleService(service)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-pressed={isSelected}
              className={`px-3 py-2 rounded-full text-xs font-medium transition-all duration-300 gradient-animated ${
                theme === 'dark'
                  ? isSelected
                    ? 'bg-gradient-to-r from-pink-500/70 to-purple-500/70 text-white border border-pink-500/30'
                    : 'bg-gradient-to-r from-pink-500/40 to-purple-500/40 text-pink-200 hover:from-pink-500/60 hover:to-purple-500/60 border border-pink-500/20'
                  : isSelected
                    ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white border border-pink-700'
                    : 'bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600 border border-pink-600'
              }`}
            >
              {service}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
