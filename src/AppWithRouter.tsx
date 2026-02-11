import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { AboutMe } from './components/AboutMe';
import { Footer } from './components/Footer';
import { AdminPanel } from './components/AdminPanel';
import { AdminSecureDashboard } from './components/AdminSecureDashboard';
import { lazy, Suspense, useEffect, useState } from 'react';
const Portfolio = lazy(() => import('./components/Portfolio').then(m => ({ default: m.Portfolio })));
const Services = lazy(() => import('./components/Services').then(m => ({ default: m.Services })));
const Reviews = lazy(() => import('./components/Reviews').then(m => ({ default: m.Reviews })));
const Contact = lazy(() => import('./components/Contact').then(m => ({ default: m.Contact })));
const FAQ = lazy(() => import('./components/FAQ').then(m => ({ default: m.FAQ })));
const FloatingBubbles = lazy(() => import('./components/FloatingBubbles').then(m => ({ default: m.FloatingBubbles })));
import { AuthProvider } from './components/AuthContext';
import { AuthModal } from './components/AuthModal';
import { ThemeProvider, useTheme } from './components/ThemeContext';
import { LanguageProvider } from './components/LanguageContext';
import { OnlineStatusProvider } from './components/OnlineStatusContext';
import { DataStoreProvider } from './components/DataStoreContext';

function AppContent() {
  const { theme } = useTheme();
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  // Admin page
  if (currentPath === '/admin' || currentPath.startsWith('/admin/')) {
    return (
      <div 
        className={`min-h-screen transition-colors duration-500 ${
          theme === 'light'
            ? 'bg-gradient-to-b from-slate-50 via-blue-50/30 to-indigo-50/50'
            : 'bg-gradient-to-b from-slate-900 via-blue-950 to-indigo-950'
        }`}
      >
        <AdminSecureDashboard />
      </div>
    );
  }

  // Main website
  return (
    <div 
      className={`min-h-screen text-white overflow-x-hidden relative transition-colors duration-500 ${
        theme === 'light'
          ? 'bg-gradient-to-b from-slate-50 via-blue-50/30 to-indigo-50/50'
          : 'bg-gradient-to-b from-slate-900 via-blue-950 to-indigo-950'
      }`}
    >
      <Suspense fallback={<div className="absolute inset-0 z-0" />}> 
        <FloatingBubbles />
      </Suspense>
      <AdminPanel />
      <div className="relative z-10">
        <Header />
        <main>
          <Hero />
          <AboutMe />
          <Suspense fallback={<div className="h-8" />}> <Portfolio /> </Suspense>
          <Suspense fallback={<div className="h-8" />}> <Services /> </Suspense>
          <Suspense fallback={<div className="h-8" />}> <Reviews /> </Suspense>
          <Suspense fallback={<div className="h-8" />}> <Contact /> </Suspense>
          <Suspense fallback={<div className="h-8" />}> <FAQ /> </Suspense>
        </main>
        <Footer />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <OnlineStatusProvider>
          <AuthProvider>
            <DataStoreProvider>
              <AuthModal />
              <AppContent />
            </DataStoreProvider>
          </AuthProvider>
        </OnlineStatusProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
