import React from 'react';
import { motion } from 'motion/react';
import { useTheme } from './ThemeContext';

interface HelpfulTipsProps {
  onTipClick: (tip: string) => void;
}

const TIPS = [
  'My car is very dirty inside',
  'Pet hair issues',
  'Smell removal needed',
  'Exterior oxidation / dull paint',
  "Just want a quick refresh",
];

export function HelpfulTips({ onTipClick }: HelpfulTipsProps) {
  const { theme } = useTheme();

  return (
    <div className="space-y-3">
      <h4 className={`text-sm font-semibold ${theme === 'dark' ? 'text-purple-200' : 'text-gray-700'}`}>
        💡 Helpful Tips
      </h4>
      <div className="flex flex-wrap gap-2">
        {TIPS.map((tip) => (
          <motion.button
            key={tip}
            type="button"
            onClick={() => onTipClick(tip)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-3 py-2 rounded-full text-xs font-medium transition-all duration-300 ${
              theme === 'dark'
                ? 'bg-gradient-to-r from-pink-500/40 to-purple-500/40 text-pink-200 hover:from-pink-500/60 hover:to-purple-500/60 border border-pink-500/20'
                : 'bg-gradient-to-r from-pink-200 to-purple-200 text-purple-800 hover:from-pink-300 hover:to-purple-300 border border-pink-300'
            }`}
          >
            {tip}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
