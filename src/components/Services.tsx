import { motion, AnimatePresence } from 'motion/react';
import { Droplet, Wind, Car, Sparkles, Zap as ZapIcon, Shield, ChevronDown, X } from 'lucide-react';
import { BubbleEffect } from './BubbleEffect';
import { useTheme } from './ThemeContext';
import { useLanguage } from './LanguageContext';
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { lockScroll } from './ui/scrollLock';
import { track } from '../analytics/client';
import type { Lang, ServicesOverrides, ServiceTextOverride } from './servicesConfig';
import { isServicesOverrides } from './servicesConfig';

interface ServiceDetails {
  whatYouGet: string[];
  bestFor: string;
  toolsUsed: string[];
  importantNotes: string[];
  whyChooseUs: string[];
  duration: string;
  startingPrice: string;
}

interface Service {
  id: number;
  icon: React.ReactNode;
  emoji: string;
  title: string;
  headline: string;
  description: string;
  color: string;
  bgColorLight: string;
  bgColorDark: string;
  borderColorDark: string;
  details: ServiceDetails;
}

export function Services() {
  const { theme } = useTheme();
  const { t, language } = useLanguage();
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const lastActiveElementRef = useRef<HTMLElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const [servicesOverrides, setServicesOverrides] = useState<ServicesOverrides | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch('/api/public/services');
        const json = await res.json();
        if (!cancelled && json?.ok && isServicesOverrides(json?.overrides)) {
          setServicesOverrides(json.overrides);
        }
      } catch {
        // ignore
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const applyTextOverride = (base: { title: string; headline: string; description: string; details: any }, override?: ServiceTextOverride) => {
    if (!override) return base;
    return {
      ...base,
      title: override.title ?? base.title,
      headline: override.headline ?? base.headline,
      description: override.description ?? base.description,
      details: {
        ...base.details,
        whatYouGet: override.details?.whatYouGet ?? base.details.whatYouGet,
        bestFor: override.details?.bestFor ?? base.details.bestFor,
        toolsUsed: override.details?.toolsUsed ?? base.details.toolsUsed,
        importantNotes: override.details?.importantNotes ?? base.details.importantNotes,
        whyChooseUs: override.details?.whyChooseUs ?? base.details.whyChooseUs,
        duration: override.details?.duration ?? base.details.duration,
        startingPrice: override.details?.startingPrice ?? base.details.startingPrice,
      },
    };
  };

  const scrollToContactForm = () => {
    const contactSection = document.getElementById('contact');
    if (!contactSection) return;

    contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Try to focus the first field shortly after scrolling starts.
    window.setTimeout(() => {
      const nameInput = document.querySelector('#contact input[name="name"]') as HTMLInputElement | null;
      nameInput?.focus({ preventScroll: true } as any);
    }, 350);
  };

  const closeAndGoToForm = () => {
    setExpandedCard(null);
    // Wait for scroll-lock cleanup + overlay unmount.
    window.setTimeout(() => scrollToContactForm(), 80);
  };

  const toggleService = (service: Service) => {
    track('service_card_click', { service: { id: service.id, title: service.title } });

    const willOpen = expandedCard !== service.id;
    setExpandedCard(willOpen ? service.id : null);

    if (willOpen) {
      track('service_modal_open', { service: { id: service.id, title: service.title } });
    }
  };

  useEffect(() => {
    if (expandedCard === null) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      setExpandedCard(null);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [expandedCard]);

  useEffect(() => {
    if (expandedCard !== null) {
      lastActiveElementRef.current =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;
      return;
    }

    if (!lastActiveElementRef.current) return;
    try {
      lastActiveElementRef.current.focus({ preventScroll: true } as any);
    } catch {
      // ignore
    }
  }, [expandedCard]);

  useEffect(() => {
    if (expandedCard === null) return;
    const unlock = lockScroll();

    // Move focus into the modal (close button) after mount.
    window.setTimeout(() => closeButtonRef.current?.focus({ preventScroll: true } as any), 0);

    return unlock;
  }, [expandedCard]);

  const baseServices: Service[] = [
    {
      id: 1,
      icon: <Droplet className="w-10 h-10" />,
      emoji: '💧',
      title: t('services.cards.basic.title'),
      headline: t('services.cards.basic.headline'),
      description: t('services.cards.basic.description'),
      color: 'from-cyan-400 via-blue-400 to-purple-400',
      bgColorLight: 'bg-cyan-50',
      bgColorDark: 'bg-cyan-900/20',
      borderColorDark: 'border-cyan-500/30',
      details: {
        whatYouGet: [
          t('services.cards.basic.what.1'),
          t('services.cards.basic.what.2'),
          t('services.cards.basic.what.3'),
          t('services.cards.basic.what.4'),
          t('services.cards.basic.what.5'),
          t('services.cards.basic.what.6')
        ],
        bestFor: t('services.cards.basic.bestFor'),
        toolsUsed: [
          t('services.cards.basic.tools.1'),
          t('services.cards.basic.tools.2'),
          t('services.cards.basic.tools.3'),
          t('services.cards.basic.tools.4'),
          t('services.cards.basic.tools.5')
        ],
        importantNotes: [
          t('services.cards.basic.notes.1'),
          t('services.cards.basic.notes.2'),
          t('services.cards.basic.notes.3'),
          t('services.cards.basic.notes.4')
        ],
        whyChooseUs: [
          t('services.cards.basic.why.1'),
          t('services.cards.basic.why.2'),
          t('services.cards.basic.why.3'),
          t('services.cards.basic.why.4')
        ],
        duration: t('services.cards.basic.duration'),
        startingPrice: t('services.cards.basic.startingPrice')
      }
    },
    {
      id: 2,
      icon: <Wind className="w-10 h-10" />,
      emoji: '🌪️',
      title: t('services.cards.interior.title'),
      headline: t('services.cards.interior.headline'),
      description: t('services.cards.interior.description'),
      color: 'from-cyan-400 via-teal-400 to-green-400',
      bgColorLight: 'bg-teal-50',
      bgColorDark: 'bg-teal-900/20',
      borderColorDark: 'border-teal-500/30',
      details: {
        whatYouGet: [
          t('services.cards.interior.what.1'),
          t('services.cards.interior.what.2'),
          t('services.cards.interior.what.3'),
          t('services.cards.interior.what.4'),
          t('services.cards.interior.what.5'),
          t('services.cards.interior.what.6')
        ],
        bestFor: t('services.cards.interior.bestFor'),
        toolsUsed: [
          t('services.cards.interior.tools.1'),
          t('services.cards.interior.tools.2'),
          t('services.cards.interior.tools.3'),
          t('services.cards.interior.tools.4'),
          t('services.cards.interior.tools.5')
        ],
        importantNotes: [
          t('services.cards.interior.notes.1'),
          t('services.cards.interior.notes.2'),
          t('services.cards.interior.notes.3'),
          t('services.cards.interior.notes.4')
        ],
        whyChooseUs: [
          t('services.cards.interior.why.1'),
          t('services.cards.interior.why.2'),
          t('services.cards.interior.why.3'),
          t('services.cards.interior.why.4')
        ],
        duration: t('services.cards.interior.duration'),
        startingPrice: t('services.cards.interior.startingPrice')
      }
    },
    {
      id: 3,
      icon: <Car className="w-10 h-10" />,
      emoji: '🚗',
      title: t('services.cards.full.title'),
      headline: t('services.cards.full.headline'),
      description: t('services.cards.full.description'),
      color: 'from-purple-400 via-pink-400 to-cyan-400',
      bgColorLight: 'bg-purple-50',
      bgColorDark: 'bg-purple-900/20',
      borderColorDark: 'border-purple-500/30',
      details: {
        whatYouGet: [
          t('services.cards.full.what.1'),
          t('services.cards.full.what.2'),
          t('services.cards.full.what.3'),
          t('services.cards.full.what.4'),
          t('services.cards.full.what.5'),
          t('services.cards.full.what.6')
        ],
        bestFor: t('services.cards.full.bestFor'),
        toolsUsed: [
          t('services.cards.full.tools.1'),
          t('services.cards.full.tools.2'),
          t('services.cards.full.tools.3'),
          t('services.cards.full.tools.4'),
          t('services.cards.full.tools.5')
        ],
        importantNotes: [
          t('services.cards.full.notes.1'),
          t('services.cards.full.notes.2'),
          t('services.cards.full.notes.4')
        ],
        whyChooseUs: [
          t('services.cards.full.why.1'),
          t('services.cards.full.why.2'),
          t('services.cards.full.why.3'),
          t('services.cards.full.why.4')
        ],
        duration: t('services.cards.full.duration'),
        startingPrice: t('services.cards.full.startingPrice')
      }
    },
    {
      id: 4,
      icon: <Sparkles className="w-10 h-10" />,
      emoji: '✨',
      title: t('services.cards.exterior.title'),
      headline: t('services.cards.exterior.headline'),
      description: t('services.cards.exterior.description'),
      color: 'from-blue-400 via-cyan-400 to-teal-400',
      bgColorLight: 'bg-blue-50',
      bgColorDark: 'bg-blue-900/20',
      borderColorDark: 'border-blue-500/30',
      details: {
        whatYouGet: [
          t('services.cards.exterior.what.1'),
          t('services.cards.exterior.what.2'),
          t('services.cards.exterior.what.3'),
          t('services.cards.exterior.what.4'),
          t('services.cards.exterior.what.5'),
          t('services.cards.exterior.what.6')
        ],
        bestFor: t('services.cards.exterior.bestFor'),
        toolsUsed: [
          t('services.cards.exterior.tools.1'),
          t('services.cards.exterior.tools.2'),
          t('services.cards.exterior.tools.3'),
          t('services.cards.exterior.tools.4'),
          t('services.cards.exterior.tools.5')
        ],
        importantNotes: [
          t('services.cards.exterior.notes.1'),
          t('services.cards.exterior.notes.2'),
          t('services.cards.exterior.notes.3'),
          t('services.cards.exterior.notes.4')
        ],
        whyChooseUs: [
          t('services.cards.exterior.why.1'),
          t('services.cards.exterior.why.2'),
          t('services.cards.exterior.why.3'),
          t('services.cards.exterior.why.4')
        ],
        duration: t('services.cards.exterior.duration'),
        startingPrice: t('services.cards.exterior.startingPrice')
      }
    },
    {
      id: 5,
      icon: <ZapIcon className="w-10 h-10" />,
      emoji: '⚡',
      title: t('services.cards.engine.title'),
      headline: t('services.cards.engine.headline'),
      description: t('services.cards.engine.description'),
      color: 'from-yellow-400 via-orange-400 to-red-400',
      bgColorLight: 'bg-orange-50',
      bgColorDark: 'bg-orange-900/20',
      borderColorDark: 'border-orange-500/30',
      details: {
        whatYouGet: [
          t('services.cards.engine.what.1'),
          t('services.cards.engine.what.2'),
          t('services.cards.engine.what.3'),
          t('services.cards.engine.what.4'),
          t('services.cards.engine.what.5'),
          t('services.cards.engine.what.6')
        ],
        bestFor: t('services.cards.engine.bestFor'),
        toolsUsed: [
          t('services.cards.engine.tools.1'),
          t('services.cards.engine.tools.2'),
          t('services.cards.engine.tools.3'),
          t('services.cards.engine.tools.4'),
          t('services.cards.engine.tools.5')
        ],
        importantNotes: [
          t('services.cards.engine.notes.1'),
          t('services.cards.engine.notes.2'),
          t('services.cards.engine.notes.3'),
          t('services.cards.engine.notes.4')
        ],
        whyChooseUs: [
          t('services.cards.engine.why.1'),
          t('services.cards.engine.why.2'),
          t('services.cards.engine.why.3'),
          t('services.cards.engine.why.4')
        ],
        duration: t('services.cards.engine.duration'),
        startingPrice: t('services.cards.engine.startingPrice')
      }
    },
    {
      id: 6,
      icon: <Shield className="w-10 h-10" />,
      emoji: '🛡️',
      title: t('services.cards.maintenance.title'),
      headline: t('services.cards.maintenance.headline'),
      description: t('services.cards.maintenance.description'),
      color: 'from-pink-400 via-rose-400 to-orange-400',
      bgColorLight: 'bg-pink-50',
      bgColorDark: 'bg-pink-900/20',
      borderColorDark: 'border-pink-500/30',
      details: {
        whatYouGet: [
          t('services.cards.maintenance.what.1'),
          t('services.cards.maintenance.what.2'),
          t('services.cards.maintenance.what.3'),
          t('services.cards.maintenance.what.4'),
          t('services.cards.maintenance.what.5'),
          t('services.cards.maintenance.what.6')
        ],
        bestFor: t('services.cards.maintenance.bestFor'),
        toolsUsed: [
          t('services.cards.maintenance.tools.1'),
          t('services.cards.maintenance.tools.2'),
          t('services.cards.maintenance.tools.3')
        ],
        importantNotes: [
          t('services.cards.maintenance.notes.1'),
          t('services.cards.maintenance.notes.2'),
          t('services.cards.maintenance.notes.3'),
          t('services.cards.maintenance.notes.4')
        ],
        whyChooseUs: [
          t('services.cards.maintenance.why.1'),
          t('services.cards.maintenance.why.2'),
          t('services.cards.maintenance.why.3'),
          t('services.cards.maintenance.why.4')
        ],
        duration: t('services.cards.maintenance.duration'),
        startingPrice: t('services.cards.maintenance.startingPrice')
      }
    }
  ];

  const services: Service[] = baseServices.map((svc) => {
    const ov = servicesOverrides?.services?.find((s) => s.id === svc.id);
    const textOv = ov?.text?.[language as Lang];
    const nextText = applyTextOverride(
      {
        title: svc.title,
        headline: svc.headline,
        description: svc.description,
        details: svc.details,
      },
      textOv
    );
    return {
      ...svc,
      emoji: ov?.emoji || svc.emoji,
      title: nextText.title,
      headline: nextText.headline,
      description: nextText.description,
      details: nextText.details,
    };
  });

  return (
    <section
      id="services"
      className="relative py-20 sm:py-32 overflow-hidden"
    >
      {/* Background Decorations */}
      <div
        className={`absolute top-10 left-10 w-64 h-64 rounded-full blur-3xl ${
          theme === 'dark'
            ? 'bg-purple-500/10'
            : 'bg-gradient-to-br from-purple-200 to-pink-200 opacity-30'
        }`}
      ></div>
      <div
        className={`absolute bottom-10 right-10 w-64 h-64 rounded-full blur-3xl ${
          theme === 'dark'
            ? 'bg-cyan-500/10'
            : 'bg-gradient-to-br from-cyan-200 to-blue-200 opacity-30'
        }`}
      ></div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-block px-6 py-2 vhs-gradient text-white rounded-full mb-4 cartoon-shadow-sm vhs-glow">
            <span>{t('services.premiumBadge')}</span>
          </div>
          <h2
            className={`vhs-text text-transparent bg-clip-text mb-4 ${
              theme === 'dark'
                ? 'bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400'
                : 'bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600'
            }`}
          >
            {t('services.heading')}
          </h2>
          <p
            className={`max-w-2xl mx-auto text-lg ${
              theme === 'dark' ? 'text-purple-200/70' : 'text-gray-600'
            }`}
          >
            {t('services.lead')}
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-12">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <BubbleEffect intensity="low" variant="light">
                <button
                  onClick={() => toggleService(service)}
                  className={`w-full h-full p-6 rounded-3xl border-[3px] shadow-lg transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 text-left group ${
                    theme === 'dark'
                      ? `${service.bgColorDark} ${service.borderColorDark} border-opacity-80 hover:border-opacity-100 focus:ring-offset-slate-900 focus:ring-cyan-400`
                      : `${service.bgColorLight} border-purple-200 hover:border-purple-300 focus:ring-offset-slate-50 focus:ring-purple-400`
                  }`}
                  aria-label={t('services.card.aria')
                    .replace('{title}', service.title)
                    .replace('{headline}', service.headline)}
                >
                  {/* Icon */}
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: index * 0.1
                    }}
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-4 cartoon-shadow-sm ${
                      theme === 'dark' ? 'vhs-glow-dark' : 'vhs-glow-light'
                    }`}
                  >
                    <span className="text-2xl">{service.emoji}</span>
                  </motion.div>

                  {/* Title & Headline */}
                  <h3
                    className={`text-xl font-bold mb-1 ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {service.title}
                  </h3>
                  <p
                    className={`text-sm font-semibold mb-3 ${
                      theme === 'dark'
                        ? 'text-cyan-300'
                        : 'text-purple-600'
                    }`}
                  >
                    {service.headline}
                  </p>

                  {/* Description */}
                  <p
                    className={`mb-4 leading-relaxed ${
                      theme === 'dark'
                        ? 'text-purple-200/80'
                        : 'text-gray-700'
                    }`}
                  >
                    {service.description}
                  </p>

                  {/* CTA and Price */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-sm font-semibold ${
                        theme === 'dark'
                          ? 'text-cyan-300'
                          : 'text-purple-600'
                      }`}
                    >
                      {t('services.startingAt')}{' '}
                      <span className="text-lg">
                        {service.details.startingPrice}
                      </span>
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 transition-transform ${
                        expandedCard === service.id ? 'rotate-180' : ''
                      } ${
                        theme === 'dark'
                          ? 'text-cyan-400'
                          : 'text-purple-500'
                      }`}
                    />
                  </div>
                </button>
              </BubbleEffect>
            </motion.div>
          ))}
        </div>

        {/* Modal for Service Details */}
        {typeof document !== 'undefined' &&
          createPortal(
            <AnimatePresence>
              {expandedCard !== null && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[1000]"
                >
                  {/* Full-screen backdrop: tap anywhere outside closes */}
                  <div
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    onPointerDown={() => setExpandedCard(null)}
                    aria-hidden="true"
                  />

                  {/* Content layer (scroll-safe on mobile) */}
                  <div
                    className="absolute inset-0 flex items-start sm:items-center justify-center p-4 sm:p-6 overflow-hidden"
                  >
                    <motion.div
                      initial={{ scale: 0.98, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.98, opacity: 0 }}
                      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                      className={`relative isolate w-[94vw] max-w-4xl rounded-3xl p-4 sm:p-6 overflow-hidden shadow-2xl flex flex-col min-h-0 my-4 h-[calc(100svh-2rem)] max-h-[calc(100svh-2rem)] sm:my-0 sm:h-auto sm:max-h-[72vh] sm:max-h-[72svh] ${
                        theme === 'dark'
                          ? 'bg-slate-900 border border-purple-500/30 vhs-noise'
                          : 'bg-white border border-purple-100'
                      }`}
                      role="dialog"
                      aria-modal="true"
                    >
                {/* Close Button */}
                <button
                  onClick={() => setExpandedCard(null)}
                  ref={closeButtonRef}
                  style={
                    {
                      '--safe-top': '0.75rem',
                      '--safe-right': '0.75rem',
                      '--safe-top-sm': '1.25rem',
                      '--safe-right-sm': '1.25rem'
                    } as any
                  }
                  className={`absolute safe-abs-tr z-20 inline-flex items-center justify-center w-10 h-10 rounded-full transition-colors touch-manipulation ${
                    theme === 'dark'
                      ? 'hover:bg-purple-500/20 text-purple-300'
                      : 'hover:bg-gray-100 text-gray-600'
                  }`}
                  aria-label={t('common.close')}
                >
                  <X className="w-6 h-6" />
                </button>

                {/* Modal Header */}
                <div className="mb-4 pr-10">
                  <h2
                    className={`text-2xl font-bold mb-1 ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {services.find((s) => s.id === expandedCard)?.title}
                  </h2>
                  <p
                    className={`text-base ${
                      theme === 'dark'
                        ? 'text-cyan-300'
                        : 'text-purple-600'
                    }`}
                  >
                    {services.find((s) => s.id === expandedCard)?.headline}
                  </p>
                </div>

                <div
                  className="flex-1 min-h-0 overflow-y-auto pr-4 sm:pr-5 overscroll-contain touch-pan-y"
                  style={{ WebkitOverflowScrolling: 'touch' } as any}
                >

                  {/* Service Details */}
                  {services.find((s) => s.id === expandedCard)?.details && (
                    <div className="grid gap-6 lg:grid-cols-2">
                    {/* What You Get */}
                    <div className="lg:col-span-1">
                      <h3
                        className={`text-lg font-bold mb-3 ${
                          theme === 'dark'
                            ? 'text-purple-300'
                            : 'text-purple-600'
                        }`}
                      >
                        ✨ {t('services.modal.whatYouGet')}
                      </h3>
                      <ul className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
                        {services
                          .find((s) => s.id === expandedCard)
                          ?.details.whatYouGet.map((item, idx) => (
                            <li
                              key={idx}
                              className={`flex gap-2 ${
                                theme === 'dark'
                                  ? 'text-purple-200/80'
                                  : 'text-gray-700'
                              }`}
                            >
                              <span className="text-cyan-400">•</span>
                              {item}
                            </li>
                          ))}
                      </ul>
                    </div>

                    {/* Best For */}
                    <div className="lg:col-span-1">
                      <h3
                        className={`text-lg font-bold mb-2 ${
                          theme === 'dark'
                            ? 'text-purple-300'
                            : 'text-purple-600'
                        }`}
                      >
                        🎯 {t('services.modal.bestFor')}
                      </h3>
                      <p
                        className={`${
                          theme === 'dark'
                            ? 'text-purple-200/80'
                            : 'text-gray-700'
                        }`}
                      >
                        {services.find((s) => s.id === expandedCard)?.details
                          .bestFor}
                      </p>
                    </div>

                    {/* Tools Used */}
                    <div className="lg:col-span-1">
                      <h3
                        className={`text-lg font-bold mb-2 ${
                          theme === 'dark'
                            ? 'text-purple-300'
                            : 'text-purple-600'
                        }`}
                      >
                        🔧 {t('services.modal.toolsUsed')}
                      </h3>
                      <ul className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
                        {services
                          .find((s) => s.id === expandedCard)
                          ?.details.toolsUsed.map((tool, idx) => (
                            <li
                              key={idx}
                              className={`flex gap-2 ${
                                theme === 'dark'
                                  ? 'text-purple-200/80'
                                  : 'text-gray-700'
                              }`}
                            >
                              <span className="text-cyan-400">•</span>
                              {tool}
                            </li>
                          ))}
                      </ul>
                    </div>

                    {/* Important Notes */}
                    <div className="lg:col-span-1">
                      <h3
                        className={`text-lg font-bold mb-3 ${
                          theme === 'dark'
                            ? 'text-orange-300'
                            : 'text-orange-600'
                        }`}
                      >
                        ⚠️ {t('services.modal.importantNotes')}
                      </h3>
                      <ul className="space-y-2">
                        {services
                          .find((s) => s.id === expandedCard)
                          ?.details.importantNotes.map((note, idx) => (
                            <li
                              key={idx}
                              className={`${
                                theme === 'dark'
                                  ? 'text-purple-200/70'
                                  : 'text-gray-600'
                              }`}
                            >
                              {note}
                            </li>
                          ))}
                      </ul>
                    </div>

                    {/* Why Choose Us */}
                    <div className="lg:col-span-2">
                      <h3
                        className={`text-lg font-bold mb-3 ${
                          theme === 'dark'
                            ? 'text-cyan-300'
                            : 'text-purple-700'
                        }`}
                      >
                        💎 {t('services.modal.whyChoose')}
                      </h3>
                      <ul className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
                        {services
                          .find((s) => s.id === expandedCard)
                          ?.details.whyChooseUs.map((reason, idx) => (
                            <li
                              key={idx}
                              className={`flex gap-2 ${
                                theme === 'dark'
                                  ? 'text-purple-200/80'
                                  : 'text-gray-700'
                              }`}
                            >
                              <span
                                className={
                                  theme === 'dark' ? 'text-cyan-400' : 'text-purple-600'
                                }
                              >
                                →
                              </span>
                              {reason}
                            </li>
                          ))}
                      </ul>
                    </div>

                  </div>
                )}
                </div>

                {/* Modal Footer (always visible) */}
                <div className="mt-4 pt-4 border-t border-purple-500/20 flex-shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                  <button
                    onClick={closeAndGoToForm}
                    className={`inline-flex items-center justify-center w-full px-6 py-3 rounded-full font-bold transition-transform hover:scale-105 ${
                      theme === 'dark'
                        ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white vhs-glow-dark'
                        : 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white vhs-glow-light'
                    }`}
                    aria-label={t('services.modal.bookAria').replace(
                      '{title}',
                      services.find((s) => s.id === expandedCard)?.title ?? ''
                    )}
                  >
                    {t('services.modal.bookCta')}
                  </button>
                  <p
                    className={`mt-3 text-sm text-center ${
                      theme === 'dark'
                        ? 'text-purple-300/60'
                        : 'text-gray-600'
                    }`}
                  >
                    {t('services.modal.disclaimer')}
                  </p>
                </div>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>,
            document.body
          )}

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
            {t('services.sectionCta')}
          </a>
        </motion.div>
      </div>
    </section>
  );
}