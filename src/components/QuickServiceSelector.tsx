import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { useTheme } from './ThemeContext';

interface QuickServiceSelectorProps {
  selectedServices: string[];
  onServicesChange: (services: string[]) => void;
}

const SERVICES = [
  'Interior Cleaning',
  'Exterior Cleaning',
  'Full Detail Package',
  'Engine Bay Cleaning',
  'Maintenance (Recurring Wash)',
  'Not Sure Yet (Need Recommendation)',
];

export function QuickServiceSelector({ selectedServices, onServicesChange }: QuickServiceSelectorProps) {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

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
        className={`w-full px-6 py-4 rounded-2xl border-2 transition-all duration-300 flex items-center justify-between ${
          theme === 'dark'
            ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 border-purple-400/50 vhs-glow-dark'
            : 'bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 border-purple-300/50 vhs-glow-light'
        }`}
      >
        <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-white'}`}>
          Choose Your Services
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown className="w-5 h-5 text-white" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className={`rounded-2xl border-2 overflow-hidden ${
              theme === 'dark'
                ? 'bg-purple-900/30 border-purple-500/30 vhs-noise'
                : 'bg-white border-gray-100'
            }`}
          >
            <div className="p-4 space-y-3">
              {SERVICES.map((service) => (
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
                        : 'text-gray-700 group-hover:text-gray-900'
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

      {selectedServices.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className={`px-4 py-2 rounded-xl text-xs ${
            theme === 'dark'
              ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/30'
              : 'bg-cyan-100 text-cyan-700 border border-cyan-200'
          }`}
        >
          Selected: {selectedServices.join(', ')}
        </motion.div>
      )}
    </div>
  );
}
