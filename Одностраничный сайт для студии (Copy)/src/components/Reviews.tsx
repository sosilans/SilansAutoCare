import { motion } from 'motion/react';
import { Star, User, MessageCircle, ChevronDown, ChevronUp, Mail, Clock } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { BubbleEffect } from './BubbleEffect';
import { useTheme } from './ThemeContext';

export function Reviews() {
  const { theme } = useTheme();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Mock login state - change to true to test logged in state
  const [isRegistered, setIsRegistered] = useState(false); // Track if user is registered
  const [showAll, setShowAll] = useState(false);
  const [canSubmitReview, setCanSubmitReview] = useState(true);
  const [timeUntilNextReview, setTimeUntilNextReview] = useState<string>('');
  const reviewsRef = useRef<HTMLElement>(null);

  // Check if user can submit a review (24 hour cooldown)
  useEffect(() => {
    const lastReviewTime = localStorage.getItem('lastReviewTimestamp');
    if (lastReviewTime) {
      const lastTime = parseInt(lastReviewTime);
      const now = Date.now();
      const timeDiff = now - lastTime;
      const twentyFourHours = 24 * 60 * 60 * 1000;

      if (timeDiff < twentyFourHours) {
        setCanSubmitReview(false);
        const hoursLeft = Math.ceil((twentyFourHours - timeDiff) / (60 * 60 * 1000));
        setTimeUntilNextReview(`${hoursLeft} hour${hoursLeft > 1 ? 's' : ''}`);
      } else {
        setCanSubmitReview(true);
      }
    }
  }, []);

  const reviews = [
    {
      name: 'Michael Johnson',
      rating: 5,
      date: 'October 2024',
      text: 'Absolutely incredible work! My Tesla Model 3 looks better than the day I bought it. The ceramic coating is amazing!',
      avatar: '👨',
      color: 'from-cyan-400 via-blue-400 to-purple-400',
    },
    {
      name: 'Sarah Martinez',
      rating: 5,
      date: 'November 2024',
      text: 'Best detailing service in Sacramento! The attention to detail is unmatched. Worth every penny!',
      avatar: '👩',
      color: 'from-pink-400 via-rose-400 to-purple-400',
    },
    {
      name: 'David Chen',
      rating: 5,
      date: 'November 2024',
      text: 'Professional and passionate! They transformed my 10-year-old car. It looks brand new. Thank you!',
      avatar: '👨‍💼',
      color: 'from-cyan-400 via-teal-400 to-blue-400',
    },
    {
      name: 'Emily Roberts',
      rating: 5,
      date: 'November 2024',
      text: 'The paint correction service removed years of swirl marks. My black BMW finally has that mirror finish!',
      avatar: '👩‍💼',
      color: 'from-purple-400 via-pink-400 to-cyan-400',
    },
    {
      name: 'James Wilson',
      rating: 5,
      date: 'October 2024',
      text: 'Outstanding service! They worked on my Mercedes and the results exceeded all expectations. Highly recommend!',
      avatar: '👨‍💻',
      color: 'from-blue-400 via-cyan-400 to-teal-400',
    },
    {
      name: 'Lisa Anderson',
      rating: 5,
      date: 'September 2024',
      text: 'The interior detailing brought my car back to life! Every corner was spotless. True professionals!',
      avatar: '👩‍🦰',
      color: 'from-purple-400 via-violet-400 to-pink-400',
    },
    {
      name: 'Robert Taylor',
      rating: 5,
      date: 'September 2024',
      text: 'Exceptional quality! The team is friendly, professional, and truly cares about their work. My Audi looks stunning!',
      avatar: '👨‍🦳',
      color: 'from-cyan-400 via-blue-500 to-purple-500',
    },
    {
      name: 'Amanda White',
      rating: 5,
      date: 'August 2024',
      text: 'Best car care experience ever! They took their time and the results are incredible. Will definitely come back!',
      avatar: '👱‍♀️',
      color: 'from-pink-400 via-purple-400 to-indigo-400',
    },
  ];

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    
    // For unregistered users - simulate registration
    if (!isLoggedIn || !isRegistered) {
      // In real app, this would register the user
      setIsLoggedIn(true);
      setIsRegistered(true);
      alert('🎉 Registration successful! Your review has been submitted. Thank you!');
      setIsFormOpen(false);
      localStorage.setItem('lastReviewTimestamp', Date.now().toString());
      setCanSubmitReview(false);
      return;
    }
    
    // Check 24-hour cooldown for registered users
    if (!canSubmitReview) {
      alert(`⏰ You can submit another review in ${timeUntilNextReview}. Please wait to avoid spam.`);
      return;
    }
    
    // Submit review for logged in users
    alert('✅ Thank you for your review! It has been submitted successfully.');
    setIsFormOpen(false);
    localStorage.setItem('lastReviewTimestamp', Date.now().toString());
    setCanSubmitReview(false);
    
    // Calculate next available time
    const hoursLeft = 24;
    setTimeUntilNextReview(`${hoursLeft} hours`);
  };

  const handleShowMore = () => {
    setShowAll(true);
  };

  const handleShowLess = () => {
    setShowAll(false);
    setTimeout(() => {
      reviewsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const displayedReviews = showAll ? reviews : reviews.slice(0, 4);

  return (
    <section ref={reviewsRef} id="reviews" className="relative py-20 sm:py-32 overflow-hidden">
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
            <span>Testimonials</span>
          </div>
          <h2 className={`text-transparent bg-clip-text mb-4 ${
            theme === 'dark'
              ? 'bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 vhs-text-dark'
              : 'bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 vhs-text-light'
          }`}>
            Happy Customers!
          </h2>
          <p className={`max-w-2xl mx-auto text-lg ${
            theme === 'dark' ? 'text-purple-200/70' : 'text-gray-600'
          }`}>
            See what our wonderful clients have to say about us!
          </p>
        </motion.div>

        {/* Reviews Grid */}
        <div className="grid sm:grid-cols-2 gap-6 lg:gap-8 mb-12">
          {displayedReviews.map((review, index) => (
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
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${review.color} flex items-center justify-center text-3xl cartoon-shadow-sm gradient-animated ${
                      theme === 'dark' ? 'vhs-glow-dark' : 'vhs-glow-light'
                    }`}>
                      {review.avatar}
                    </div>
                    <div>
                      <h4 className={theme === 'dark' ? 'text-purple-100' : 'text-gray-900'}>{review.name}</h4>
                      <p className={`text-sm ${theme === 'dark' ? 'text-purple-300/60' : 'text-gray-500'}`}>{review.date}</p>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>

                  {/* Review Text */}
                  <p className={`leading-relaxed ${theme === 'dark' ? 'text-purple-200/70' : 'text-gray-700'}`}>{review.text}</p>

                  {/* Quote Icon */}
                  <MessageCircle className={`absolute top-6 right-6 w-8 h-8 ${theme === 'dark' ? 'text-purple-500/20' : 'text-gray-200'}`} />
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
              Show More Reviews
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

        {/* Add Review Button */}
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
              Leave a Review
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
                We'd Love to Hear From You! 💬
              </h3>
              
              {!isLoggedIn && !isRegistered && (
                <div className={`mb-6 p-4 rounded-2xl border-2 ${
                  theme === 'dark'
                    ? 'bg-cyan-900/30 border-cyan-500/40'
                    : 'bg-blue-100 border-blue-300'
                }`}>
                  <p className={theme === 'dark' ? 'text-cyan-200' : 'text-blue-800'}>
                    📝 Please register to leave a review. It only takes a moment!
                  </p>
                </div>
              )}

              {!canSubmitReview && isLoggedIn && isRegistered && (
                <div className={`mb-6 p-4 rounded-2xl border-2 ${
                  theme === 'dark'
                    ? 'bg-pink-900/30 border-pink-500/40'
                    : 'bg-orange-100 border-orange-300'
                }`}>
                  <div className="flex items-center gap-2">
                    <Clock className={`w-5 h-5 ${theme === 'dark' ? 'text-pink-400' : 'text-orange-600'}`} />
                    <p className={theme === 'dark' ? 'text-pink-200' : 'text-orange-800'}>
                      You can leave another review in {timeUntilNextReview}. Thank you for your patience! ⏰
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmitReview} className="space-y-4">
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
                    placeholder="Share your experience..."
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
                    disabled={!canSubmitReview && isLoggedIn && isRegistered}
                    className={`flex-1 text-white rounded-full py-6 disabled:opacity-50 disabled:cursor-not-allowed ${
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
                        <MessageCircle className="w-5 h-5 mr-2" />
                        Submit Review
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