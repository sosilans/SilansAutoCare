import React from 'react';
import { motion } from 'motion/react';
import { useTheme } from './ThemeContext';
import { useLanguage } from './LanguageContext';

interface HelpfulTipsProps {
  selectedTips: string[];
  onToggleTip: (tip: string) => void;
}

export function HelpfulTips({ selectedTips, onToggleTip }: HelpfulTipsProps) {
  const { theme } = useTheme();
  const { t } = useLanguage();

  const tips = [
    t('contact.tips.1'),
    t('contact.tips.2'),
    t('contact.tips.3'),
    t('contact.tips.4'),
    t('contact.tips.5'),
  ];

  return (
    <div className="space-y-3">
      <h4 className={`text-sm font-semibold ${theme === 'dark' ? 'text-purple-200' : 'text-gray-700'}`}>
        {t('contact.tips.title')}
      </h4>
      <div className="flex flex-wrap gap-2">
        {tips.map((tip) => {
          const isSelected = selectedTips.includes(tip);
          return (
          <motion.button
            key={tip}
            type="button"
            onClick={() => onToggleTip(tip)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-3 py-2 rounded-full text-xs font-medium transition-all duration-300 gradient-animated ${
              theme === 'dark'
                ? isSelected
                  ? 'bg-gradient-to-r from-pink-500/70 to-purple-500/70 text-white border border-pink-500/40'
                  : 'bg-gradient-to-r from-pink-500/40 to-purple-500/40 text-pink-200 hover:from-pink-500/60 hover:to-purple-500/60 border border-pink-500/20'
                : isSelected
                  ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white border border-purple-700'
                  : 'bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600 border border-pink-600'
            } ${isSelected ? 'ring-2 ring-white/30' : ''}`}
          >
            {tip}
          </motion.button>
        );
        })}
      </div>
    </div>
  );
}
