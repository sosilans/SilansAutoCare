import { motion } from 'motion/react';
import { HelpCircle, User, ChevronDown, ChevronUp, Mail } from 'lucide-react';
import { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { BubbleEffect } from './BubbleEffect';
import { useTheme } from './ThemeContext';

interface FAQItem {
  name: string;
  date: string;
  question: string;
  answer: string;
  avatar: string;
  color: string;
}

export function FAQ() {
  const { theme } = useTheme();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const faqRef = useRef<HTMLElement>(null);

  const faqs: FAQItem[] = [
    {
      name: 'Michael Johnson',
      date: 'November 2024',
      question: 'How long does detailing take on average?',
      answer: 'On average, a full car detailing takes about 3 hours. The time may vary depending on the car\'s condition and the service package chosen. Express wash takes 30-40 minutes.',
      avatar: '👨',
      color: 'from-cyan-400 via-blue-400 to-purple-400',
    },
    {
      name: 'Sarah Martinez',
      date: 'November 2024',
      question: 'Do you need a power outlet and water access from the client?',
      answer: 'Yes, for quality work we need access to electricity (standard 220V outlet) and a water source. If you don\'t have access to water, we can bring our own for an additional fee.',
      avatar: '👩',
      color: 'from-pink-400 via-rose-400 to-purple-400',
    },
    {
      name: 'David Chen',
      date: 'October 2024',
      question: 'What payment methods do you accept?',
      answer: 'We accept cash, bank cards, payment via SBP (Fast Payment System), and online prepayment is also possible when booking a service on the website.',
      avatar: '👨‍💼',
      color: 'from-cyan-400 via-teal-400 to-blue-400',
    },
    {
      name: 'Emily Roberts',
      date: 'October 2024',
      question: 'Do you provide mobile service?',
      answer: 'Yes, we provide mobile car wash service to your home, office, or any convenient location within the city and nearby suburbs. The service fee is calculated individually.',
      avatar: '👩‍💼',
      color: 'from-purple-400 via-pink-400 to-cyan-400',
    },
    {
      name: 'James Wilson',
      date: 'September 2024',
      question: 'Do you use safe products for car coatings?',
      answer: 'Absolutely! We use only premium professional car care products that are safe for any coatings, including ceramic, PPF film, and delicate chrome elements. All products are certified.',
      avatar: '👨‍💻',
      color: 'from-blue-400 via-cyan-400 to-teal-400',
    },
    {
      name: 'Lisa Anderson',
      date: 'September 2024',
      question: 'Do you have a loyalty program?',
      answer: 'Yes! When you purchase a package of 5 washes, you get the 6th one free. We also have a cumulative discount system for regular customers: from 3% to 15% depending on the number of visits.',
      avatar: '👩‍🦰',
      color: 'from-purple-400 via-violet-400 to-pink-400',
    },
    {
      name: 'Robert Taylor',
      date: 'August 2024',
      question: 'How do I book an appointment?',
      answer: 'You can book an appointment through our website contact form, by phone, or via email. We recommend booking at least 2-3 days in advance for your preferred time slot.',
      avatar: '👨‍🦳',
      color: 'from-cyan-400 via-blue-500 to-purple-500',
    },
    {
      name: 'Amanda White',
      date: 'August 2024',
      question: 'What areas do you service?',
      answer: 'We service Sacramento and all surrounding areas within a 30-mile radius. For locations beyond that, please contact us to discuss availability and additional fees.',
      avatar: '👱‍♀️',
      color: 'from-pink-400 via-purple-400 to-indigo-400',
    },
  ];

  const handleSubmitQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    
    // For unregistered users - simulate registration
    if (!isLoggedIn || !isRegistered) {
      setIsLoggedIn(true);
      setIsRegistered(true);
      alert('🎉 Registration successful! Your question has been submitted. We will respond soon!');
      setIsFormOpen(false);
      return;
    }
    
    // Submit question for logged in users
    alert('✅ Thank you for your question! We will respond as soon as possible.');
    setIsFormOpen(false);
  };

  const handleShowMore = () => {
    setShowAll(true);
  };

  const handleShowLess = () => {
    setShowAll(false);
    setTimeout(() => {
      faqRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const displayedFAQs = showAll ? faqs : faqs.slice(0, 4);

  return (
    <section ref={faqRef} id="faq" className="relative py-20 sm:py-32 overflow-hidden">
      {/* Background Decorations */}
      <div className={`absolute top-10 right-10 w-64 h-64 rounded-full blur-3xl opacity-30 ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-purple-500 to-pink-500'
          : 'bg-gradient-to-br from-purple-200 to-pink-200'
      }`}></div>
      <div className={`absolute bottom-10 left-10 w-64 h-64 rounded-full blur-3xl opacity-30 ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-cyan-500 to-blue-500'
          : 'bg-gradient-to-br from-cyan-200 to-blue-200'
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
            <span>FAQ</span>
          </div>
          <h2 className={`text-transparent bg-clip-text mb-4 ${
            theme === 'dark'
              ? 'bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 vhs-text-dark'
              : 'bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 vhs-text-light'
          }`}>
            Frequently Asked Questions
          </h2>
          <p className={`max-w-2xl mx-auto text-lg ${
            theme === 'dark' ? 'text-purple-200/70' : 'text-gray-600'
          }`}>
            Find answers to common questions from our clients
          </p>
        </motion.div>

        {/* FAQ Grid */}
        <div className="grid sm:grid-cols-2 gap-6 lg:gap-8 mb-12">
          {displayedFAQs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{
                opacity: 1,
                scale: 1,
                y: [0, -12, 0],
                x: [0, index % 2 === 0 ? 4 : -4, 0],
                rotate: [0, index % 2 === 0 ? 0.4 : -0.4, 0],
              }}
              transition={{
                opacity: { duration: 0.6, delay: index * 0.1 },
                scale: { duration: 0.6, delay: index * 0.1 },
                y: {
                  duration: 7,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: index * 0.2,
                },
                x: {
                  duration: 7,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: index * 0.2,
                },
                rotate: {
                  duration: 7,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: index * 0.2,
                },
              }}
              className="group relative"
            >
              <BubbleEffect intensity="low" variant="light">
                <div className={`h-full p-8 rounded-3xl border-2 cartoon-shadow hover:scale-105 transition-transform duration-300 ${
                  theme === 'dark'
                    ? 'bg-purple-900/20 border-purple-500/30 vhs-noise vhs-scanlines'
                    : 'bg-white border-gray-100 vhs-noise'
                }`}>
                  {/* Header */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${faq.color} flex items-center justify-center text-3xl cartoon-shadow-sm gradient-animated ${
                      theme === 'dark' ? 'vhs-glow-dark' : 'vhs-glow-light'
                    }`}>
                      {faq.avatar}
                    </div>
                    <div>
                      <h4 className={theme === 'dark' ? 'text-purple-100' : 'text-gray-900'}>{faq.name}</h4>
                      <p className={`text-sm ${theme === 'dark' ? 'text-purple-300/60' : 'text-gray-500'}`}>{faq.date}</p>
                    </div>
                  </div>

                  {/* Question */}
                  <div className="mb-4">
                    <div className="flex items-start gap-2 mb-2">
                      <HelpCircle className={`w-5 h-5 mt-1 flex-shrink-0 ${
                        theme === 'dark' ? 'text-cyan-400' : 'text-blue-600'
                      }`} />
                      <h4 className={theme === 'dark' ? 'text-purple-100' : 'text-gray-900'}>
                        {faq.question}
                      </h4>
                    </div>
                  </div>

                  {/* Answer */}
                  <p className={`leading-relaxed ${theme === 'dark' ? 'text-purple-200/70' : 'text-gray-700'}`}>
                    {faq.answer}
                  </p>

                  {/* Quote Icon */}
                  <HelpCircle className={`absolute top-6 right-6 w-8 h-8 ${theme === 'dark' ? 'text-purple-500/20' : 'text-gray-200'}`} />
                </div>
              </BubbleEffect>
            </motion.div>
          ))}
        </div>

        {/* Show More/Less Button */}
        {!showAll && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <Button
              onClick={handleShowMore}
              className="px-8 py-6 vhs-gradient text-white rounded-full cartoon-shadow vhs-glow hover:scale-105 transition-transform duration-300 text-lg gradient-animated"
            >
              <ChevronDown className="w-5 h-5 mr-2" />
              Show More Questions
            </Button>
          </motion.div>
        )}
        {showAll && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <Button
              onClick={handleShowLess}
              className="px-8 py-6 vhs-gradient text-white rounded-full cartoon-shadow vhs-glow hover:scale-105 transition-transform duration-300 text-lg gradient-animated"
            >
              <ChevronUp className="w-5 h-5 mr-2" />
              Show Less
            </Button>
          </motion.div>
        )}

        {/* Ask Question Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          {!isFormOpen ? (
            <Button
              onClick={() => setIsFormOpen(true)}
              className={`px-8 py-6 border-2 rounded-full cartoon-shadow hover:scale-105 transition-transform duration-300 text-lg vhs-border-animated ${
                theme === 'dark'
                  ? 'bg-purple-900/20 text-purple-200 border-purple-500/50'
                  : 'bg-white text-purple-600 border-purple-400'
              }`}
            >
              <User className="w-5 h-5 mr-2" />
              Ask a Question
            </Button>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`max-w-2xl mx-auto p-8 rounded-3xl border-2 cartoon-shadow ${
                theme === 'dark'
                  ? 'bg-purple-900/20 border-purple-500/30 vhs-noise vhs-scanlines'
                  : 'bg-white border-purple-200'
              }`}
            >
              <h3 className={theme === 'dark' ? 'text-purple-100 mb-6' : 'text-gray-900 mb-6'}>
                We're Here to Help!
              </h3>
              
              {!isLoggedIn && !isRegistered && (
                <div className={`mb-6 p-4 rounded-2xl border-2 ${
                  theme === 'dark'
                    ? 'bg-cyan-900/30 border-cyan-500/40'
                    : 'bg-blue-100 border-blue-300'
                }`}>
                  <p className={theme === 'dark' ? 'text-cyan-200' : 'text-blue-800'}>
                    <User className="w-5 h-5 inline mr-2 mb-1" />
                    Please register to ask a question. It only takes a moment!
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmitQuestion} className="space-y-4">
                <div>
                  <Input
                    type="text"
                    placeholder="Your Name"
                    required
                    className={`border-2 rounded-2xl ${
                      theme === 'dark'
                        ? 'bg-purple-950/30 border-purple-500/20 text-purple-100 placeholder:text-purple-300/40'
                        : 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-500'
                    }`}
                  />
                </div>
                <div>
                  <Input
                    type="email"
                    placeholder="Your Email"
                    required
                    className={`border-2 rounded-2xl ${
                      theme === 'dark'
                        ? 'bg-purple-950/30 border-purple-500/20 text-purple-100 placeholder:text-purple-300/40'
                        : 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-500'
                    }`}
                  />
                </div>
                <div>
                  <Textarea
                    placeholder="Your question..."
                    rows={4}
                    required
                    className={`border-2 rounded-2xl ${
                      theme === 'dark'
                        ? 'bg-purple-950/30 border-purple-500/20 text-purple-100 placeholder:text-purple-300/40'
                        : 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-500'
                    }`}
                  />
                </div>
                <div className="flex gap-4">
                  <Button
                    type="submit"
                    className={`flex-1 text-white rounded-full py-6 ${
                      theme === 'dark'
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 vhs-glow-dark'
                        : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                    }`}
                  >
                    {!isLoggedIn || !isRegistered ? (
                      <>
                        <User className="w-5 h-5 mr-2" />
                        Register & Submit
                      </>
                    ) : (
                      <>
                        <HelpCircle className="w-5 h-5 mr-2" />
                        Submit Question
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className={`border-2 rounded-full px-8 ${
                      theme === 'dark'
                        ? 'border-purple-500/30 bg-purple-950/30 text-purple-200 hover:bg-purple-900/40'
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
