import React, { useState } from 'react';
import { motion } from 'motion/react';
import { MapPin, Phone, Mail, Facebook, Clock, Instagram } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { BubbleEffect } from './BubbleEffect';
import { QuickServiceSelector } from './QuickServiceSelector';
import { HelpfulTips } from './HelpfulTips';
import { useTheme } from './ThemeContext';
import { useLanguage } from './LanguageContext';
import { useDataStore } from './DataStoreContext';
import { TELEGRAM_PROXY_URL as CONFIG_PROXY_URL, RECAPTCHA_SITE_KEY } from '../config';

export function Contact() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { submitContact } = useDataStore();
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  // Optional: set this to your Google Apps Script Web App URL to use proxy
  const TELEGRAM_PROXY_URL = CONFIG_PROXY_URL || (typeof window !== 'undefined' && (window as any).__TELEGRAM_PROXY_URL) || '';

  const generatePlaceholder = () => {
    if (selectedServices.length === 0) {
      return t('contact.form.messagePlaceholder');
    }
    return `Selected: ${selectedServices.join(', ')}.\nTell us more about your vehicle (condition, size, any concerns)...`;
  };

  const handleTipClick = (tip: string) => {
    setMessage((prev) => {
      const updated = prev ? `${prev}\n${tip}` : tip;
      return updated;
    });
  };

  const PHONE_NUMBER = '+1 (916) 534-5547';
  const EMAIL_ADDRESS = 'silansautocare@gmail.com';

  const copyToClipboard = async (text: string) => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return;
      }

      // Fallback for older browsers / restricted clipboard contexts
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      textarea.style.top = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    } catch {
      // Intentionally silent: user only requested copy behavior.
    }
  };

  async function getRecaptchaToken(): Promise<string | undefined> {
    if (!RECAPTCHA_SITE_KEY) return undefined;
    // ensure script
    if (typeof window !== 'undefined' && !(window as any).grecaptcha) {
      await new Promise<void>((resolve) => {
        const s = document.createElement('script');
        s.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
        s.async = true;
        s.onload = () => resolve();
        document.head.appendChild(s);
      });
    }
    return new Promise<string | undefined>((resolve) => {
      const gr = (window as any).grecaptcha;
      if (!gr) return resolve(undefined);
      gr.ready(() => {
        gr.execute(RECAPTCHA_SITE_KEY, { action: 'contact' })
          .then((token: string) => resolve(token))
          .catch(() => resolve(undefined));
      });
    });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formEl = e.target as HTMLFormElement;
    const formData = new FormData(formEl);
    const name = String(formData.get('name') || '').trim();
    const email = String(formData.get('email') || '').trim();
    const phone = String(formData.get('phone') || '').trim();
    const messageValue = message.trim();
    const website = String(formData.get('website') || '').trim(); // honeypot
    
    if (!name || !email || !messageValue) {
      alert('❌ Please fill in all fields.');
      return;
    }
    
    // Basic email validation
    if (!/.+@.+\..+/.test(email)) {
      alert('❌ Please enter a valid email address.');
      return;
    }
    
    // Save to contact submissions
    submitContact(name, email, messageValue);
    
    // Send via Netlify proxy (avoids CORS issues with GAS)
    try {
      const endpoint = '/.netlify/functions/contact-proxy';
      const recaptchaToken = await getRecaptchaToken();
      const servicesText = selectedServices.length > 0 ? `\n\n📋 Selected Services:\n${selectedServices.map(s => `• ${s}`).join('\n')}` : '';
      const fullMessage = `${messageValue}${servicesText}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          phone,
          message: fullMessage,
          website, // honeypot
          recaptchaToken,
        }),
      });
      const respText = await response.text();
      let respJson: any = {};
      try { respJson = JSON.parse(respText); } catch { respJson = { raw: respText }; }

      if (!response.ok || respJson.error) {
        console.error('Submission error:', respJson);
        const errMsg = respJson && respJson.error ? respJson.error : 'Unknown error';
        alert(`⚠️ Submission failed: ${errMsg}`);
      } else {
        alert(t('contact.submitSuccess'));
        setMessage('');
        setSelectedServices([]);
      }
    } catch (error) {
      console.error('Submission request failed:', error);
      alert('⚠️ Submission failed');
    }
    
    formEl.reset();
  };

  const contactInfo = [
    {
      icon: <MapPin className="w-6 h-6" />,
      title: t('contact.location'),
      content: 'Sacramento, California',
      emoji: '📍',
      color: 'from-cyan-400 via-blue-400 to-purple-400',
    },
    {
      icon: <Phone className="w-6 h-6" />,
      title: t('contact.phone'),
      content: `${PHONE_NUMBER} (9am-9pm)`,
      copyValue: PHONE_NUMBER,
      emoji: '📞',
      color: 'from-pink-400 via-purple-400 to-cyan-400',
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: t('contact.email'),
      content: EMAIL_ADDRESS,
      copyValue: EMAIL_ADDRESS,
      emoji: '✉️',
      color: 'from-purple-400 via-pink-400 to-orange-400',
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: t('contact.hours'),
      content: '9am - 9pm',
      emoji: '⏰',
      color: 'from-cyan-400 via-teal-400 to-blue-400',
    },
  ];

  return (
    <section id="contact" className="relative py-20 sm:py-32 overflow-hidden">
      {/* Background Decorations */}
      <div className={`absolute top-10 right-10 w-64 h-64 rounded-full blur-3xl ${
        theme === 'dark'
          ? 'bg-purple-500/10'
          : 'bg-gradient-to-br from-blue-200 to-purple-200 opacity-30'
      }`}></div>
      <div className={`absolute bottom-10 left-10 w-64 h-64 rounded-full blur-3xl ${
        theme === 'dark'
          ? 'bg-cyan-500/10'
          : 'bg-gradient-to-br from-purple-200 to-pink-200 opacity-30'
      }`}></div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-block px-6 py-2 vhs-gradient text-white rounded-full mb-4 cartoon-shadow-sm vhs-glow">
            <span>{t('contact.badge')}</span>
          </div>
          <h2 className={`vhs-text text-transparent bg-clip-text mb-4 ${
            theme === 'dark'
              ? 'bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400'
              : 'bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600'
          }`}>
            {t('contact.title')} 
          </h2>
          <p className={`max-w-2xl mx-auto text-lg ${
            theme === 'dark' ? 'text-purple-200/70' : 'text-gray-600'
          }`}>
            {t('contact.subtitle')}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {contactInfo.map((info, index) => (
              <motion.div
                key={info.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <motion.div
                  animate={{
                    y: [0, -12, 0],
                    x: [0, index % 2 === 0 ? 4 : -4, 0],
                    rotate: [0, index % 2 === 0 ? 0.4 : -0.4, 0],
                  }}
                  transition={{
                    duration: 7,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: index * 0.2,
                  }}
                >
                  <BubbleEffect intensity="low" variant="light">
                    <div
                      className={`flex items-center gap-4 p-6 rounded-2xl border-2 cartoon-shadow-sm hover:scale-105 transition-transform duration-300 ${
                      theme === 'dark'
                        ? 'bg-purple-900/20 border-purple-500/30 vhs-noise vhs-scanlines'
                        : 'bg-white border-gray-100 vhs-noise'
                      } ${info.copyValue ? 'cursor-pointer' : ''}`}
                      role={info.copyValue ? 'button' : undefined}
                      tabIndex={info.copyValue ? 0 : undefined}
                      onClick={
                        info.copyValue
                          ? () => {
                              void copyToClipboard(info.copyValue);
                            }
                          : undefined
                      }
                      onKeyDown={
                        info.copyValue
                          ? (e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                void copyToClipboard(info.copyValue);
                              }
                            }
                          : undefined
                      }
                    >
                      <div className={`flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br ${info.color} flex items-center justify-center text-3xl gradient-animated ${
                        theme === 'dark' ? 'vhs-glow-dark' : 'vhs-glow-light'
                      }`}>
                        {info.emoji}
                      </div>
                      <div>
                        <h4 className={`mb-1 ${theme === 'dark' ? 'text-purple-100' : 'text-gray-900'}`}>{info.title}</h4>
                        <p className={theme === 'dark' ? 'text-purple-200/70' : 'text-gray-700'}>{info.content}</p>
                      </div>
                    </div>
                  </BubbleEffect>
                </motion.div>
              </motion.div>
            ))}

            {/* Quick Contact Buttons */}
            <div className="pt-6 space-y-4">
              <h4 className={theme === 'dark' ? 'text-purple-100 mb-4' : 'text-gray-900 mb-4'}>{t('contact.quickMessage')}</h4>
              <div className="grid grid-cols-2 gap-4">
                <motion.a
                  href="https://www.facebook.com/silansautocare?mibextid=wwXIfr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-2xl cartoon-shadow vhs-glow hover:scale-105 transition-transform duration-300 gradient-animated"
                  animate={{
                    y: [0, -12, 0],
                    x: [0, 4, 0],
                    rotate: [0, 0.4, 0],
                  }}
                  transition={{
                    duration: 7,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.4,
                  }}
                >
                  <Facebook className="w-5 h-5" />
                  Facebook
                </motion.a>
                <motion.a
                  href="https://www.instagram.com/silansautocare?igsh=NTc4MTIwNjQ2YQ%3D%3D&utm_source=qr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-pink-400 via-purple-400 to-orange-400 text-white rounded-2xl cartoon-shadow vhs-glow hover:scale-105 transition-transform duration-300 gradient-animated"
                  animate={{
                    y: [0, -12, 0],
                    x: [0, -4, 0],
                    rotate: [0, -0.4, 0],
                  }}
                  transition={{
                    duration: 7,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.6,
                  }}
                >
                  <Instagram className="w-5 h-5" />
                  Instagram
                </motion.a>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.form
              onSubmit={handleSubmit}
              className={`p-8 rounded-3xl border-2 cartoon-shadow space-y-6 ${
                theme === 'dark'
                  ? 'bg-purple-900/20 border-purple-500/30 vhs-noise vhs-scanlines'
                  : 'bg-white border-blue-100'
              }`}
              animate={{
                y: [0, -12, 0],
                x: [0, 4, 0],
                rotate: [0, 0.4, 0],
              }}
              transition={{
                duration: 7,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.8,
              }}
            >
              <div>
                <label htmlFor="name" className={`block mb-2 ${theme === 'dark' ? 'text-purple-100' : 'text-gray-900'}`}>
                  {t('contact.form.name')}
                </label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder={t('contact.form.namePlaceholder')}
                  required
                  className={`border-2 rounded-2xl ${
                    theme === 'dark'
                      ? 'bg-purple-950/30 border-purple-500/20 text-purple-100 placeholder:text-purple-300/60'
                      : 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-600'
                  }`}
                />
              </div>

              <div>
                <label htmlFor="email" className={`block mb-2 ${theme === 'dark' ? 'text-purple-100' : 'text-gray-900'}`}>
                  {t('contact.form.email')}
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder={t('contact.form.emailPlaceholder')}
                  required
                  className={`border-2 rounded-2xl ${
                    theme === 'dark'
                      ? 'bg-purple-950/30 border-purple-500/20 text-purple-100 placeholder:text-purple-300/60'
                      : 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-600'
                  }`}
                />
              </div>

              <div>
                <label htmlFor="phone" className={`block mb-2 ${theme === 'dark' ? 'text-purple-100' : 'text-gray-900'}`}>
                  {t('contact.form.phone')}
                </label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder={t('contact.form.phonePlaceholder')}
                  className={`border-2 rounded-2xl ${
                    theme === 'dark'
                      ? 'bg-purple-950/30 border-purple-500/20 text-purple-100 placeholder:text-purple-300/60'
                      : 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-600'
                  }`}
                />
              </div>

              {/* Quick Service Selector */}
              <QuickServiceSelector 
                selectedServices={selectedServices}
                onServicesChange={setSelectedServices}
              />

              {/* Helpful Tips */}
              <HelpfulTips onTipClick={handleTipClick} />

              <div>
                <label htmlFor="message" className={`block mb-2 ${theme === 'dark' ? 'text-purple-100' : 'text-gray-900'}`}>
                  {t('contact.form.message')}
                </label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder={generatePlaceholder()}
                  rows={5}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className={`border-2 rounded-2xl ${
                    theme === 'dark'
                      ? 'bg-purple-950/30 border-purple-500/20 text-purple-200 placeholder:text-purple-300/60'
                      : 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-600'
                  }`}
                />
              </div>

              <BubbleEffect intensity="high" variant="bright">
                <Button
                  type="submit"
                  className="w-full py-6 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 text-white rounded-2xl cartoon-shadow vhs-glow hover:scale-105 transition-transform duration-300 text-lg gradient-animated"
                >
                  {t('contact.form.send')} 🚀
                </Button>
              </BubbleEffect>
              {/* Honeypot field (must be inside the form) */}
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                style={{ display: 'none' }}
              />
            </motion.form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}