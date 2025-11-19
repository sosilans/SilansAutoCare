import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'

export default function App() {
  return <RetroWaveWebsite />
}

function RetroWaveWebsite() {
  const [activeSlide, setActiveSlide] = useState(0)
  const [activeTeamMember, setActiveTeamMember] = useState(0)
  const [scrollY, setScrollY] = useState(0)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [reviewsExpanded, setReviewsExpanded] = useState(false)
  const [logoOk, setLogoOk] = useState(true)
  const reviewsRef = useRef<HTMLDivElement | null>(null)
  const reviewsScrollRef = useRef<HTMLDivElement | null>(null)
  const heroRef = useRef<HTMLDivElement | null>(null)
  const starsContainerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (starsContainerRef.current) {
        setMousePosition({ x: e.clientX, y: e.clientY })
      }
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const generateStars = (count: number) =>
    Array.from({ length: count }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 0.5,
      color:
        Math.random() > 0.7
          ? 'rgba(255, 0, 128, 0.8)'
          : Math.random() > 0.5
          ? 'rgba(137, 58, 234, 0.8)'
          : 'rgba(255, 255, 255, 0.8)',
      parallaxFactor: Math.random() * 0.3 + 0.1,
    }))

  const [stars] = useState(generateStars(150))

  const generateFireflies = (count: number) =>
    Array.from({ length: count }).map((_, i) => ({
      id: i,
      size: Math.random() * 3 + 2,
      duration: Math.random() * 8 + 10,
      delay: Math.random() * 5,
      blinkDuration: Math.random() * 2 + 1,
      top: Math.random() * 100,
      left: Math.random() * 100,
      color: `rgba(255, 255, ${Math.floor(120 + Math.random() * 80)}, 0.9)`,
    }))

  const [fireflies] = useState(generateFireflies(15))

  // Local hero slider images (1.jpg .. 7.jpg)
  const heroSlides = [
    {
      id: 1,
      image: new URL('../assets/1.jpg', import.meta.url).href,
      title: 'Premium Auto Detailing',
      subtitle: 'Professional care for your vehicle',
    },
    {
      id: 2,
      image: new URL('../assets/2.jpg', import.meta.url).href,
      title: 'Interior Restoration',
      subtitle: 'Bring back that new car feeling',
    },
    {
      id: 3,
      image: new URL('../assets/3.jpg', import.meta.url).href,
      title: 'Paint Protection',
      subtitle: 'Long-lasting shine and protection',
    },
    {
      id: 4,
      image: new URL('../assets/4.jpg', import.meta.url).href,
      title: 'Ceramic Coating Excellence',
      subtitle: 'Ultimate gloss & durable shield',
    },
    {
      id: 5,
      image: new URL('../assets/5.jpg', import.meta.url).href,
      title: 'Deep Interior Care',
      subtitle: 'Refresh, sanitize & protect',
    },
    {
      id: 6,
      image: new URL('../assets/6.jpg', import.meta.url).href,
      title: 'Paint Correction',
      subtitle: 'Remove swirls & restore clarity',
    },
    {
      id: 7,
      image: new URL('../assets/7.jpg', import.meta.url).href,
      title: 'Showroom Finish',
      subtitle: 'Stand out everywhere you drive',
    },
  ]

  // Use local photo for the first team member
  const mishaPhoto = new URL('../assets/Misha.jpg', import.meta.url).href

  const teamMembers = [
    {
      id: 1,
      name: 'Alex Johnson',
      role: 'Founder & Lead Detailer',
      image: mishaPhoto,
      bio: 'With over 15 years of experience, Alex founded Silans Auto Care with a passion for perfection.',
    },
    {
      id: 2,
      name: 'Maria Rodriguez',
      role: 'Interior Specialist',
      image:
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
      bio: "Maria's attention to detail makes her our go-to expert for interior restoration and cleaning.",
    },
    {
      id: 3,
      name: 'David Chen',
      role: 'Paint Correction Expert',
      image:
        'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=800&q=80',
      bio: 'David specializes in paint correction and ceramic coating applications.',
    },
  ]

  const services = [
    {
      id: 1,
      title: 'Full Detail Package',
      price: '$249',
      description: 'Complete interior and exterior detailing with premium products',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
    },
    {
      id: 2,
      title: 'Ceramic Coating',
      price: '$599',
      description: 'Long-lasting protection with 2-year warranty and paint correction',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
    },
    {
      id: 3,
      title: 'Interior Restoration',
      price: '$179',
      description: 'Deep cleaning, conditioning, and protection for all interior surfaces',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      id: 4,
      title: 'Paint Correction',
      price: '$349',
      description: "Remove swirls, scratches and restore your paint's original shine",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      ),
    },
  ]

  const comparisonItems = [
    {
      id: 1,
      title: 'Paint Correction',
      description: 'Removing swirls and scratches to restore original shine',
      beforeImage:
        'https://images.unsplash.com/photo-1596720307130-3d5d8853b445?auto=format&fit=crop&w=1200&q=80',
      afterImage:
        'https://images.unsplash.com/photo-1601987078363-42899e307202?auto=format&fit=crop&w=1200&q=80',
      category: 'Exterior',
    },
    {
      id: 2,
      title: 'Interior Detailing',
      description: 'Deep cleaning to make your interior look like new',
      beforeImage:
        'https://images.unsplash.com/photo-1587451152235-d9ffe5a56dc4?auto=format&fit=crop&w=1200&q=80',
      afterImage:
        'https://images.unsplash.com/photo-1563979064478-e4e05640784d?auto=format&fit=crop&w=1200&q=80',
      category: 'Interior',
    },
    {
      id: 3,
      title: 'Ceramic Coating',
      description: 'Long-lasting protection with incredible gloss',
      beforeImage:
        'https://images.unsplash.com/photo-1594055486210-48095ab7af81?auto=format&fit=crop&w=1200&q=80',
      afterImage:
        'https://images.unsplash.com/photo-1606073641089-5d74e9f3334f?auto=format&fit=crop&w=1200&q=80',
      category: 'Protection',
    },
    {
      id: 4,
      title: 'Headlight Restoration',
      description: 'Revitalizing yellowed and foggy headlights',
      beforeImage:
        'https://images.unsplash.com/photo-1509475826633-fed577a2c71b?auto=format&fit=crop&w=1200&q=80',
      afterImage:
        'https://images.unsplash.com/photo-1591293835940-934a7c4f2d1b?auto=format&fit=crop&w=1200&q=80',
      category: 'Restoration',
    },
    {
      id: 5,
      title: 'Engine Bay Cleaning',
      description: 'Meticulous detailing of the engine compartment',
      beforeImage:
        'https://images.unsplash.com/photo-1566936737687-8f392a237b8b?auto=format&fit=crop&w=1200&q=80',
      afterImage:
        'https://images.unsplash.com/photo-1586771107445-d3ca888129ce?auto=format&fit=crop&w=1200&q=80',
      category: 'Specialty',
    },
    {
      id: 6,
      title: 'Wheel & Tire Detailing',
      description: 'Complete wheel cleaning and tire dressing',
      beforeImage:
        'https://images.unsplash.com/photo-1590759489293-edc63587889b?auto=format&fit=crop&w=1200&q=80',
      afterImage:
        'https://images.unsplash.com/photo-1626954079979-ec9181dccb94?auto=format&fit=crop&w=1200&q=80',
      category: 'Wheels',
    },
  ]

  const reviews = [
    { id: 1, name: 'Michael T.', rating: 5, text: 'Absolutely amazing service! My car looks better than when I bought it. The ceramic coating is worth every penny.', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80', date: '2 weeks ago' },
    { id: 2, name: 'Sarah L.', rating: 5, text: 'The team at Silans Auto Care treated my classic Mustang with incredible care. Highly recommend their restoration services!', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80', date: '1 month ago' },
    { id: 3, name: 'James R.', rating: 5, text: "Professional, punctual, and perfect results. The interior of my SUV hasn't looked this good in years.", image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80', date: '3 weeks ago' },
    { id: 4, name: 'Emma W.', rating: 5, text: 'I was blown away by the attention to detail. The paint correction removed years of swirl marks and made my car look showroom new.', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80', date: '2 months ago' },
    { id: 5, name: 'Robert K.', rating: 4, text: 'Great service overall. The headlight restoration made a huge difference for my older vehicle. Would definitely use them again.', image: 'https://images.unsplash.com/photo-1548449112-96a38a643324?auto=format&fit=crop&w=200&q=80', date: '6 days ago' },
    { id: 6, name: 'Jennifer P.', rating: 5, text: 'Best detailing service in Sacramento! The ceramic coating they applied has kept my car looking amazing even after months of use.', image: 'https://images.unsplash.com/photo-1499952127939-9bbf5af6c51c?auto=format&fit=crop&w=200&q=80', date: '1 week ago' },
    { id: 7, name: 'Daniel M.', rating: 5, text: "I brought in my Tesla for the full detail package and I couldn't be happier with the results. Worth every penny!", image: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=200&q=80', date: '3 months ago' },
    { id: 8, name: 'Olivia S.', rating: 5, text: "The team at Silans Auto Care are true professionals. They restored my vintage convertible's interior and it looks better than new.", image: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=200&q=80', date: '2 months ago' },
  ]

  useEffect(() => {
    if (!reviewsExpanded && reviewsScrollRef.current) {
      const scrollContainer = reviewsScrollRef.current
      let animationId = 0
      let position = 0

      const scrollAnimation = () => {
        if (scrollContainer) {
          position += 0.5
          if (position >= scrollContainer.scrollWidth / 2) position = 0
          scrollContainer.scrollLeft = position
        }
        animationId = requestAnimationFrame(scrollAnimation)
      }

      animationId = requestAnimationFrame(scrollAnimation)

      const handleMouseEnter = () => cancelAnimationFrame(animationId)
      const handleMouseLeave = () => (animationId = requestAnimationFrame(scrollAnimation))

      scrollContainer.addEventListener('mouseenter', handleMouseEnter)
      scrollContainer.addEventListener('mouseleave', handleMouseLeave)

      return () => {
        cancelAnimationFrame(animationId)
        scrollContainer.removeEventListener('mouseenter', handleMouseEnter)
        scrollContainer.removeEventListener('mouseleave', handleMouseLeave)
      }
    }
  }, [reviewsExpanded])

  const toggleReviewsExpanded = () => {
    setReviewsExpanded((prev) => !prev)
    setTimeout(() => {
      if (!reviewsExpanded && reviewsRef.current) {
        reviewsRef.current.scrollIntoView({ behavior: 'smooth' })
      }
    }, 100)
  }

  const nextSlide = () => setActiveSlide((p) => (p === heroSlides.length - 1 ? 0 : p + 1))
  const prevSlide = () => setActiveSlide((p) => (p === 0 ? heroSlides.length - 1 : p - 1))
  const nextTeamMember = () => setActiveTeamMember((p) => (p === teamMembers.length - 1 ? 0 : p + 1))
  const prevTeamMember = () => setActiveTeamMember((p) => (p === 0 ? teamMembers.length - 1 : p - 1))

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    const target = document.getElementById(id)
    if (!target) return
    const headerEl = document.querySelector('header') as HTMLElement | null
    const headerOffset = headerEl ? headerEl.offsetHeight : 0
    const extraOffset = 50 // scroll a bit further as requested
    const y = target.getBoundingClientRect().top + window.scrollY - headerOffset + extraOffset
    window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' })
  }

  return (
    <div className="relative bg-indigo-950 text-white min-h-screen overflow-hidden">
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900 via-purple-950 to-black"></div>
        <div className="absolute inset-0 z-0" ref={starsContainerRef}>
          {stars.map((star) => {
            const starLeft = `${star.x}%`
            const starTop = `${star.y - scrollY * star.parallaxFactor * 0.05}%`
            const proximity = Math.max(0.2, 1 - Math.abs(star.parallaxFactor - 0.2) * 3)
            const baseShadowSize = star.size * 4
            const glowSize = baseShadowSize * proximity
            return (
              <div
                key={star.id}
                className="absolute rounded-full star-point"
                style={{
                  left: starLeft,
                  top: starTop,
                  width: `${star.size}px`,
                  height: `${star.size}px`,
                  backgroundColor: star.color,
                  boxShadow: `0 0 ${glowSize}px ${star.color}`,
                  opacity: proximity,
                  transform: `scale(${1 + proximity * 0.5})`,
                  transition: 'transform 0.1s ease-out, box-shadow 0.1s ease-out',
                  zIndex: Math.floor(star.parallaxFactor * 10),
                }}
              />
            )
          })}
        </div>
      </div>

      <div
        className="fixed inset-0 z-0 perspective-effect"
        style={{
          backgroundImage:
            'linear-gradient(transparent 95%, rgba(137, 58, 234, 0.4) 95%), linear-gradient(90deg, transparent 95%, rgba(137, 58, 234, 0.4) 95%)',
          backgroundSize: '40px 40px',
          transform: `perspective(800px) rotateX(60deg) translateY(${scrollY * 0.3}px)`,
          height: '300%',
          width: '300%',
          left: '-100%',
          opacity: 0.15,
        }}
      ></div>

      <header className="fixed top-0 left-0 right-0 z-50 bg-indigo-950/80 backdrop-blur-md border-b border-pink-500/30">
        <div className="container mx-auto px-4 h-14 md:h-16 flex justify-between items-center">
          <div className="flex items-center h-full">
            <a href="#home" className="inline-flex items-center h-full group" aria-label="Silans Auto Care – Home">
              {logoOk ? (
                <picture className="h-full flex items-center">
                  <source srcSet="/images/silans-logo.webp" type="image/webp" />
                  <img
                    src="/images/silans-logo.png"
                    alt="Silans Auto Care"
                    className="h-full w-auto max-h-full select-none block"
                    loading="eager"
                    decoding="async"
                    fetchPriority="high"
                    onError={() => setLogoOk(false)}
                    style={{ filter: 'drop-shadow(0 0 10px rgba(255, 105, 180, 0.35))' }}
                  />
                </picture>
              ) : (
                <span className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500">
                  Silans Auto Care
                </span>
              )}
              {/* Auto Care script text */}
              <span className="ml-1 text-white text-sm md:text-base font-medium tracking-wide select-none">
                auto&nbsp;care
              </span>
            </a>
          </div>
          <nav className="hidden md:flex space-x-8">
            {['Home', 'About', 'Services', 'Portfolio', 'Reviews', 'Contact'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                onClick={(e) => handleNavClick(e, item.toLowerCase())}
                className="text-white hover:text-pink-400 transition-colors relative group"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-pink-500 to-cyan-500 transition-all duration-300 group-hover:w-full"></span>
              </a>
            ))}
          </nav>
          <button className="md:hidden text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      <main className="relative z-10">
        <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden" ref={heroRef}>
          <div className="absolute inset-0 z-0">
            {heroSlides.map((slide, index) => (
              <div key={slide.id} className={`absolute inset-0 transition-opacity duration-1000 ${index === activeSlide ? 'opacity-100' : 'opacity-0'}`}>
                <div className="absolute inset-0 bg-indigo-950/60 z-10"></div>
                <div className="absolute inset-0 vhs-effect z-20 opacity-20"></div>
                <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>

          <div className="container mx-auto px-4 z-20 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="max-w-3xl mx-auto"
              >
                <h1 className="text-4xl md:text-6xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500">
                  {heroSlides[activeSlide].title}
                </h1>
                <p className="text-xl md:text-2xl mb-8 text-white/90">{heroSlides[activeSlide].subtitle}</p>
                <div className="flex justify-center space-x-4">
                  <button className="px-8 py-3 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full text-white font-medium hover:from-pink-500 hover:to-purple-500 transition-all hover:shadow-lg hover:shadow-pink-500/30">
                    Book Now
                  </button>
                  <button className="px-8 py-3 bg-transparent border border-white/30 rounded-full text-white font-medium hover:bg-white/10 transition-all">
                    Our Services
                  </button>
                </div>
              </motion.div>
          </div>

          <div className="absolute bottom-10 left-0 right-0 flex justify-center space-x-2 z-20">
            {heroSlides.map((_, index) => (
              <button key={index} onClick={() => setActiveSlide(index)} className={`w-3 h-3 rounded-full transition-all ${index === activeSlide ? 'bg-pink-500 w-8' : 'bg-white/50'}`}></button>
            ))}
          </div>

          <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/30 flex items-center justify-center text-white hover:bg-black/50 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/30 flex items-center justify-center text-white hover:bg-black/50 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </section>

        <section id="about" className="py-20 relative scroll-mt-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500">About Us</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-pink-500 to-cyan-500 mx-auto"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-lg mb-6 text-white/80">
                  Founded in 2015, Silans Auto Care has become Sacramento's premier auto detailing studio, specializing in high-end vehicles and meticulous attention to detail. Our passion for perfection drives everything we do.
                </p>
                <p className="text-lg mb-6 text-white/80">
                  We use only the highest quality products and cutting-edge techniques to ensure your vehicle receives the care it deserves. From exotic sports cars to family SUVs, we treat every vehicle with the same level of dedication and expertise.
                </p>
                <div className="flex space-x-4 mt-8">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-pink-500">7+</div>
                    <div className="text-sm text-white/70">Years Experience</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-purple-500">5000+</div>
                    <div className="text-sm text-white/70">Cars Detailed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-cyan-500">100%</div>
                    <div className="text-sm text-white/70">Satisfaction</div>
                  </div>
                </div>
              </div>

              <div className="relative h-[400px] overflow-hidden rounded-lg border border-purple-500/30 shadow-xl shadow-purple-500/10">
                {teamMembers.map((member, index) => (
                  <div key={member.id} className={`absolute inset-0 transition-all duration-500 ${index === activeTeamMember ? 'opacity-100 translate-x-0' : index < activeTeamMember ? 'opacity-0 -translate-x-full' : 'opacity-0 translate-x-full'}`}>
                    <div className="absolute inset-0 bg-gradient-to-t from-indigo-950 via-indigo-950/80 to-transparent z-10"></div>
                    <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                      <h3 className="text-2xl font-bold text-white">{member.name}</h3>
                      <p className="text-pink-400 mb-2">{member.role}</p>
                      <p className="text-white/80">{member.bio}</p>
                    </div>
                  </div>
                ))}

                <div className="absolute top-4 right-4 flex space-x-2 z-20">
                  <button onClick={prevTeamMember} className="w-8 h-8 rounded-full bg-black/30 flex items-center justify-center text-white hover:bg-black/50 transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button onClick={nextTeamMember} className="w-8 h-8 rounded-full bg-black/30 flex items-center justify-center text-white hover:bg-black/50 transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="services" className="py-20 relative scroll-mt-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500">Our Services</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-pink-500 to-cyan-500 mx-auto"></div>
              <p className="mt-4 text-lg text-white/80 max-w-2xl mx-auto">We offer a comprehensive range of detailing services to keep your vehicle looking its best.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {services.map((service) => (
                <motion.div key={service.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} viewport={{ once: true }} className="bg-indigo-900/20 backdrop-blur-sm rounded-lg p-6 border border-purple-500/30 hover:border-pink-500/50 transition-all hover:shadow-lg hover:shadow-pink-500/20 group">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform">
                    {service.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-white">{service.title}</h3>
                  <p className="text-2xl font-bold text-pink-400 mb-4">{service.price}</p>
                  <p className="text-white/70">{service.description}</p>
                  <button className="mt-6 px-6 py-2 bg-transparent border border-purple-500/50 rounded-full text-white text-sm hover:bg-purple-500/20 transition-all">Learn More</button>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="portfolio" className="py-20 relative scroll-mt-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500">Before & After</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-pink-500 to-cyan-500 mx-auto"></div>
              <p className="mt-4 text-lg text-white/80 max-w-2xl mx-auto">See the dramatic transformation our services create with these before and after comparisons.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {comparisonItems.map((item) => (
                <BeforeAfterSlider key={item.id} beforeImage={item.beforeImage} afterImage={item.afterImage} title={item.title} description={item.description} category={item.category} />
              ))}
            </div>
          </div>
        </section>

        <section id="reviews" ref={reviewsRef} className="py-20 relative scroll-mt-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500">Customer Reviews</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-pink-500 to-cyan-500 mx-auto"></div>
            </div>

            <div className="mb-12" style={{ display: reviewsExpanded ? 'none' : 'block' }}>
              <div ref={reviewsScrollRef} className="flex overflow-x-auto overflow-y-hidden scrollbar-hide py-8 -mx-4 px-4 space-x-6" style={{ scrollBehavior: 'smooth' }}>
                {[...reviews, ...reviews].map((review, index) => (
                  <div key={`${review.id}-${index}`} className="flex-shrink-0 w-80 bg-indigo-900/20 backdrop-blur-sm rounded-lg p-6 border border-purple-500/30 hover:border-pink-500/30 transition-all hover:shadow-lg hover:shadow-pink-500/10">
                    <div className="flex items-center mb-4">
                      <img src={review.image} alt={review.name} className="w-12 h-12 rounded-full object-cover mr-4 border-2 border-pink-500" />
                      <div>
                        <h4 className="font-bold text-white">{review.name}</h4>
                        <p className="text-xs text-pink-400">{review.date}</p>
                        <div className="flex mt-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <svg key={i} xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${i < review.rating ? 'text-pink-500' : 'text-gray-400'}`} viewBox="0 0 20 20" fill="currentColor">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-white/80 italic line-clamp-4">"{review.text}"</p>
                  </div>
                ))}
              </div>

              <div className="flex justify-center mt-8">
                <button onClick={toggleReviewsExpanded} className="px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full text-white font-medium hover:from-pink-500 hover:to-purple-500 transition-all hover:shadow-lg hover:shadow-pink-500/30 group">
                  <div className="flex items-center">
                    <span>See All Reviews</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 transition-transform group-hover:translate-y-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>
              </div>
            </div>

            <div style={{ display: reviewsExpanded ? 'block' : 'none' }}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reviews.slice(0, 8).map((review) => (
                  <motion.div key={review.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: review.id * 0.1 }} className="bg-indigo-900/20 backdrop-blur-sm rounded-lg p-6 border border-purple-500/30 hover:border-pink-500/30 hover:shadow-lg hover:shadow-pink-500/10 transition-all">
                    <div className="flex items-center mb-4">
                      <img src={review.image} alt={review.name} className="w-12 h-12 rounded-full object-cover mr-4 border-2 border-pink-500" />
                      <div>
                        <h4 className="font-bold text-white">{review.name}</h4>
                        <p className="text-xs text-pink-400">{review.date}</p>
                        <div className="flex mt-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <svg key={i} xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${i < review.rating ? 'text-pink-500' : 'text-gray-400'}`} viewBox="0 0 20 20" fill="currentColor">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-white/80 italic">{review.text}</p>
                  </motion.div>
                ))}
              </div>

              {/* Close Reviews button placed below the grid, within the Reviews section flow */}
              <div className="flex justify-center mt-10">
                <button onClick={toggleReviewsExpanded} className="px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full text-white font-medium hover:from-pink-500 hover:to-purple-500 transition-all hover:shadow-lg hover:shadow-pink-500/30 group flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 transition-transform group-hover:-translate-y-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                  <span>Close Reviews</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        <ContactSection fireflies={fireflies} />
      </main>

      <footer className="relative z-20 border-t border-purple-500/30">
        {/* Top fade to soften transition into footer */}
        <div
          className="absolute -top-10 left-0 right-0 h-10 z-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(to bottom, rgba(30,10,71,0) 0%, rgba(30,10,71,0.6) 60%, rgba(30,10,71,0.85) 100%)',
          }}
        ></div>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {fireflies.map((firefly) => (
            <div
              key={firefly.id}
              className="absolute firefly"
              style={{
                width: `${firefly.size}px`,
                height: `${firefly.size}px`,
                backgroundColor: firefly.color,
                borderRadius: '50%',
                top: `${firefly.top}%`,
                left: `${firefly.left}%`,
                boxShadow: `0 0 ${firefly.size * 2}px ${firefly.color}`,
                animation: `firefly-move ${firefly.duration}s ease-in-out infinite alternate, firefly-blink ${firefly.blinkDuration}s ease-in-out infinite alternate`,
                animationDelay: `${firefly.delay}s, ${firefly.delay * 0.5}s`,
              }}
            />
          ))}
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 text-white">Silans Auto Care</h3>
              <p className="text-white/70 mb-4">Sacramento's premier auto detailing studio, specializing in high-end vehicles and meticulous attention to detail.</p>
              <div className="flex space-x-4">
                <a href="#" className="text-white/70 hover:text-pink-400 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.049c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.049H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z" />
                  </svg>
                </a>
                <a href="#" className="text-white/70 hover:text-pink-400 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0h.003z" />
                  </svg>
                </a>
                <a href="#" className="text-white/70 hover:text-pink-400 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592z" />
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4 text-white">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="#home" className="text-white/70 hover:text-pink-400 transition-colors">Home</a></li>
                <li><a href="#about" className="text-white/70 hover:text-pink-400 transition-colors">About Us</a></li>
                <li><a href="#services" className="text-white/70 hover:text-pink-400 transition-colors">Services</a></li>
                <li><a href="#portfolio" className="text-white/70 hover:text-pink-400 transition-colors">Portfolio</a></li>
                <li><a href="#reviews" className="text-white/70 hover:text-pink-400 transition-colors">Reviews</a></li>
                <li><a href="#contact" className="text-white/70 hover:text-pink-400 transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4 text-white">Services</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-white/70 hover:text-pink-400 transition-colors">Full Detail Package</a></li>
                <li><a href="#" className="text-white/70 hover:text-pink-400 transition-colors">Ceramic Coating</a></li>
                <li><a href="#" className="text-white/70 hover:text-pink-400 transition-colors">Interior Restoration</a></li>
                <li><a href="#" className="text-white/70 hover:text-pink-400 transition-colors">Paint Correction</a></li>
                <li><a href="#" className="text-white/70 hover:text-pink-400 transition-colors">Maintenance Wash</a></li>
                <li><a href="#" className="text-white/70 hover:text-pink-400 transition-colors">Headlight Restoration</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4 text-white">Contact</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-pink-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-white/70">1234 Detailing Ave, Sacramento, CA 95814</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-pink-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-white/70">(916) 555-1234</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-pink-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-white/70">info@silansautocare.com</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-purple-500/30 mt-8 pt-8 text-center">
            <p className="text-white/50">© 2023 Silans Auto Care. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <div className="fixed inset-0 pointer-events-none z-[60] opacity-10">
        <div className="vhs-scanlines absolute inset-0"></div>
        <div className="vhs-flicker absolute inset-0"></div>
      </div>

      <style>{`
        .star-point { animation: neon-pulse 3s infinite alternate; pointer-events: none; }
        .firefly { pointer-events: none; z-index: 5; }
        @keyframes firefly-move { 0% { transform: translate(0,0) } 20% { transform: translate(20px,-30px) } 40% { transform: translate(-30px,-50px) } 60% { transform: translate(40px,-20px) } 80% { transform: translate(-20px,30px) } 100% { transform: translate(30px,10px) } }
        @keyframes firefly-blink { 0% { opacity:.2; transform:scale(.8) } 50% { opacity:1; transform:scale(1.2) } 100% { opacity:.3; transform:scale(1) } }
        @keyframes neon-pulse { 0% { opacity:.7 } 50% { opacity:.49 } 100% { opacity:.7 } }
        .vhs-scanlines { background: linear-gradient(to bottom, transparent 50%, rgba(0,0,0,.1) 51%); background-size: 100% 4px; }
        .vhs-flicker { animation: vhs-flicker .2s infinite }
        .vhs-effect { background: repeating-linear-gradient(to bottom, transparent, transparent 1px, rgba(255,255,255,.03) 2px, rgba(255,255,255,.03) 3px) }
        @keyframes vhs-flicker { 0% { opacity:.95 } 50% { opacity:1 } 100% { opacity:.95 } }
        .scrollbar-hide::-webkit-scrollbar { display:none }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none }
        .line-clamp-4 { display:-webkit-box; -webkit-line-clamp:4; -webkit-box-orient: vertical; overflow:hidden }
      `}</style>
    </div>
  )
}

type BeforeAfterSliderProps = {
  beforeImage: string
  afterImage: string
  title: string
  description: string
  category?: string
}

function BeforeAfterSlider({ beforeImage, afterImage, title, description }: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50)
  const sliderRef = useRef<HTMLDivElement | null>(null)
  const isDragging = useRef(false)

  const handleMouseDown = () => {
    isDragging.current = true
  }
  const handleMouseUp = () => {
    isDragging.current = false
  }
  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging.current && sliderRef.current) {
      const rect = sliderRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const newPosition = (x / rect.width) * 100
      setSliderPosition(Math.min(Math.max(newPosition, 0), 100))
    }
  }
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (sliderRef.current) {
      const rect = sliderRef.current.getBoundingClientRect()
      const x = e.touches[0].clientX - rect.left
      const newPosition = (x / rect.width) * 100
      setSliderPosition(Math.min(Math.max(newPosition, 0), 100))
    }
  }

  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('mousemove', handleMouseMove as any)
    return () => {
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('mousemove', handleMouseMove as any)
    }
  }, [])

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} viewport={{ once: true }} className="rounded-lg overflow-hidden relative group">
      <div ref={sliderRef} className="relative h-80 cursor-ew-resize" onMouseDown={handleMouseDown} onTouchMove={handleTouchMove}>
        <div className="absolute inset-0 z-10">
          <img src={beforeImage} alt={`Before ${title}`} className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 z-20 overflow-hidden" style={{ width: `${sliderPosition}%` }}>
          <img src={afterImage} alt={`After ${title}`} className="absolute top-0 left-0 h-full object-cover" style={{ width: '100vw', objectPosition: 'left center' }} />
        </div>
        <div className="absolute top-4 right-4 z-30 bg-black/50 px-3 py-1 rounded text-white text-xs font-bold select-none pointer-events-none">AFTER</div>
        <div className="absolute bottom-4 left-4 z-30 bg-black/50 px-3 py-1 rounded text-white text-xs font-bold select-none pointer-events-none">BEFORE</div>
        <div className="absolute top-0 bottom-0 z-30 w-1 bg-white" style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)', boxShadow: '0 0 10px 2px rgba(255,105,180,0.7)' }}>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center" style={{ boxShadow: '0 0 10px 2px rgba(255,105,180,0.7)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
            </svg>
          </div>
        </div>
      </div>
      <div className="bg-indigo-900/20 backdrop-blur-sm p-4 border-t border-purple-500/30">
        <h3 className="text-xl font-bold text-white">{title}</h3>
        <p className="text-white/70 text-sm mt-1">{description}</p>
      </div>
    </motion.div>
  )
}

function ContactSection({ fireflies }: { fireflies: any[] }) {
  return (
    <section id="contact" className="py-20 relative scroll-mt-24">
      <div className="absolute bottom-0 left-0 right-0 h-80 overflow-hidden z-10 pointer-events-none">
        {/* Classic sun with linear gradient + glow (restored) */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full z-10"
          style={{
            background: 'linear-gradient(to top, #ff0080, #ff8c00)',
            boxShadow:
              '0 0 60px 20px rgba(255, 0, 128, 0.7), 0 0 100px 50px rgba(255, 140, 0, 0.5)'
          }}
        ></div>
        <div className="absolute bottom-0 left-0 w-full z-20 flex justify-center">
          <div className="absolute bottom-0 left-0 w-full" style={{ height: '120px', background: 'linear-gradient(180deg, #1e0a47 0%, #301c6e 100%)', clipPath: 'polygon(0% 100%, 5% 80%, 10% 85%, 15% 75%, 20% 80%, 25% 70%, 30% 65%, 35% 75%, 40% 65%, 45% 60%, 50% 70%, 55% 65%, 60% 60%, 65% 70%, 70% 65%, 75% 75%, 80% 60%, 85% 70%, 90% 65%, 95% 75%, 100% 60%, 100% 100%)' }}></div>
          <div className="absolute bottom-0 left-0 w-full" style={{ height: '80px', background: 'linear-gradient(180deg, #27115d 0%, #3a2285 100%)', clipPath: 'polygon(0% 100%, 5% 75%, 10% 85%, 15% 70%, 20% 80%, 25% 65%, 30% 75%, 35% 65%, 40% 70%, 45% 60%, 50% 65%, 55% 70%, 60% 55%, 65% 65%, 70% 55%, 75% 65%, 80% 55%, 85% 70%, 90% 60%, 95% 70%, 100% 55%, 100% 100%)' }}></div>
          <div className="absolute bottom-0 left-0 w-full" style={{ height: '60px', background: 'linear-gradient(180deg, #301c6e 0%, #4b2b9c 100%)', clipPath: 'polygon(0% 100%, 5% 65%, 10% 75%, 15% 60%, 20% 70%, 25% 55%, 30% 65%, 35% 55%, 40% 60%, 45% 50%, 50% 60%, 55% 50%, 60% 55%, 65% 45%, 70% 50%, 75% 60%, 80% 45%, 85% 55%, 90% 50%, 95% 60%, 100% 50%, 100% 100%)' }}></div>
        </div>
        {Array.from({ length: 12 }).map((_, i) => {
          const left = `${i * 8 + 2}%`
          const height = 60 + Math.random() * 100
          const width = 1 + Math.random() * 2
          const opacity = 0.1 + Math.random() * 0.3
          return <div key={i} className="absolute bottom-0" style={{ left, width: `${width}px`, height: `${height}px`, background: `linear-gradient(to top, rgba(255, 80, 180, ${opacity}), transparent)` }}></div>
        })}
        {/* Bottom fade to background to avoid harsh cutoff */}
        <div
          className="absolute bottom-0 left-0 right-0 h-24 z-20"
          style={{
            background:
              'linear-gradient(to top, #1e0a47 0%, rgba(48, 28, 110, 0.95) 40%, rgba(48, 28, 110, 0) 100%)',
          }}
        ></div>
      </div>

      <div className="container mx-auto px-4 relative z-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500">Contact Us</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-pink-500 to-cyan-500 mx-auto"></div>
          <p className="mt-4 text-lg text-white/80 max-w-2xl mx-auto">Have questions or ready to book? Reach out to us!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="relative backdrop-blur-md bg-indigo-900/10 rounded-lg p-6 border border-indigo-500/30 h-full overflow-hidden shadow-xl z-[30]">
            <div className="absolute -top-[200px] -right-[100px] w-[300px] h-[300px] bg-purple-400/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-[200px] -left-[100px] w-[300px] h-[300px] bg-pink-400/10 rounded-full blur-3xl pointer-events-none"></div>
            <h3 className="text-2xl font-bold text-white mb-6 relative z-[1]">Send a Message</h3>
            <form className="space-y-6 relative z-[1]" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label htmlFor="name" className="block text-white/80 mb-2">Your Name</label>
                <input id="name" className="w-full bg-indigo-900/30 border border-indigo-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-pink-500/50" placeholder="John Doe" />
              </div>
              <div>
                <label htmlFor="email" className="block text-white/80 mb-2">Email Address</label>
                <input id="email" type="email" className="w-full bg-indigo-900/30 border border-indigo-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-pink-500/50" placeholder="john@example.com" />
              </div>
              <div>
                <label htmlFor="service" className="block text-white/80 mb-2">Service Interested In</label>
                <select id="service" className="w-full bg-indigo-900/30 border border-indigo-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-pink-500/50">
                  <option value="">Select a service</option>
                  <option value="full-detail">Full Detail Package</option>
                  <option value="ceramic">Ceramic Coating</option>
                  <option value="interior">Interior Restoration</option>
                  <option value="paint">Paint Correction</option>
                </select>
              </div>
              <div>
                <label htmlFor="message" className="block text-white/80 mb-2">Your Message</label>
                <textarea id="message" rows={4} className="w-full bg-indigo-900/30 border border-indigo-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-pink-500/50" placeholder="Tell us about your vehicle and requirements..."></textarea>
              </div>
              <button type="submit" className="w-full px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg text-white font-medium hover:from-pink-500 hover:to-purple-500 transition-all hover:shadow-lg hover:shadow-pink-500/30">Send Message</button>
            </form>
          </div>

          <div className="relative backdrop-blur-md bg-indigo-900/10 rounded-lg p-6 border border-indigo-500/30 h-full overflow-hidden shadow-xl z-[30]">
            <div className="absolute -top-[200px] -right-[100px] w-[300px] h-[300px] bg-purple-400/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-[200px] -left-[100px] w-[300px] h-[300px] bg-pink-400/10 rounded-full blur-3xl pointer-events-none"></div>
            <h3 className="text-2xl font-bold mb-6 relative z-[1]">Contact Information</h3>
            <div className="space-y-6 relative z-[1]">
              <div className="flex items-start">
                <div className="w-12 h-12 flex items-center justify-center bg-pink-500/20 backdrop-blur-sm rounded-full mr-4 border border-pink-500/30">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-pink-400"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                </div>
                <div>
                  <h4 className="text-white font-medium mb-1">Location</h4>
                  <p className="text-gray-300">1234 Detailing Ave, Sacramento, CA 95814</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-12 h-12 flex items-center justify-center bg-blue-500/20 backdrop-blur-sm rounded-full mr-4 border border-blue-500/30">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-blue-400"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2  0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                </div>
                <div>
                  <h4 className="text-white font-medium mb-1">Phone</h4>
                  <p className="text-gray-300">(916) 555-1234</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-12 h-12 flex items-center justify-center bg-indigo-500/20 backdrop-blur-sm rounded-full mr-4 border border-indigo-500/30">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-indigo-400"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
                </div>
                <div>
                  <h4 className="text-white font-medium mb-1">Email</h4>
                  <p className="text-gray-300">info@silansautocare.com</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-12 h-12 flex items-center justify-center bg-pink-500/20 backdrop-blur-sm rounded-full mr-4 border border-pink-500/30">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-pink-400"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                </div>
                <div>
                  <h4 className="text-white font-medium mb-1">Business Hours</h4>
                  <p className="text-gray-300">Monday - Friday: 9am - 6pm</p>
                  <p className="text-gray-300">Saturday: 10am - 4pm</p>
                  <p className="text-gray-300">Sunday: Closed</p>
                </div>
              </div>
            </div>
            <div className="mt-8 relative z-[1]">
              <h4 className="text-white font-medium mb-4">Connect With Us</h4>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 flex items-center justify-center bg-blue-500/20 backdrop-blur-sm rounded-full text-blue-400 hover:bg-blue-500/30 transition-all hover:scale-110 hover:-translate-y-1 active:scale-95 border border-blue-500/30">F</a>
                <a href="#" className="w-10 h-10 flex items-center justify-center bg-pink-500/20 backdrop-blur-sm rounded-full text-pink-400 hover:bg-pink-500/30 transition-all hover:scale-110 hover:-translate-y-1 active:scale-95 border border-pink-500/30">I</a>
                <a href="#" className="w-10 h-10 flex items-center justify-center bg-green-500/20 backdrop-blur-sm rounded-full text-green-400 hover:bg-green-500/30 transition-all hover:scale-110 hover:-translate-y-1 active:scale-95 border border-green-500/30">W</a>
                <a href="#" className="w-10 h-10 flex items-center justify-center bg-blue-500/20 backdrop-blur-sm rounded-full text-blue-400 hover:bg-blue-500/30 transition-all hover:scale-110 hover:-translate-y-1 active:scale-95 border border-blue-500/30">X</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
