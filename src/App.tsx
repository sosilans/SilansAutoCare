import { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { AboutMe } from './components/AboutMe';
import { Portfolio } from './components/Portfolio';
import { Services } from './components/Services';
import { Reviews } from './components/Reviews';
import { Contact } from './components/Contact';
import { FAQ } from './components/FAQ';
import { Footer } from './components/Footer';
import { FloatingBubbles } from './components/FloatingBubbles';
import { AdminPanel } from './components/AdminPanel';
import { AdminSecureDashboard } from './components/AdminSecureDashboard';
import { AuthProvider } from './components/AuthContext';
import { AuthModal } from './components/AuthModal';
import { ThemeProvider, useTheme } from './components/ThemeContext';
import { LanguageProvider } from './components/LanguageContext';
import { OnlineStatusProvider } from './components/OnlineStatusContext';
import { DataStoreProvider } from './components/DataStoreContext';
import { initAnalytics } from './analytics/client';

function AppContent() {
  const { theme } = useTheme();
  const [currentHash, setCurrentHash] = useState(window.location.hash);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handleHashChange = () => setCurrentHash(window.location.hash);
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    const handlePopState = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    // Initialize analytics only on the public site (not admin routes).
    initAnalytics();
  }, []);

  const isAdminRoute = currentPath.startsWith('/admin') || currentHash === '#admin';

  // Show secure admin dashboard on /admin/* or legacy #admin route
  if (isAdminRoute) {
    return (
      <div 
        className={`min-h-screen overflow-x-hidden relative transition-colors duration-500 ${
          theme === 'light'
            ? 'bg-gradient-to-b from-slate-50 via-blue-50/30 to-indigo-50/50 text-gray-900'
            : 'bg-gradient-to-b from-slate-900 via-blue-950 to-indigo-950 text-white'
        }`}
      >
        <AdminSecureDashboard />
      </div>
    );
  }
  
  return (
    <div 
      className={`min-h-screen text-white overflow-x-hidden relative transition-colors duration-500 ${
        theme === 'light'
          ? 'bg-gradient-to-b from-slate-50 via-blue-50/30 to-indigo-50/50'
          : 'bg-gradient-to-b from-slate-900 via-blue-950 to-indigo-950'
      }`}
    >
      <FloatingBubbles />
      <AdminPanel />
      <div className="relative z-10">
        <Header />
        <main>
          <Hero />
          <AboutMe />
          <Portfolio />
          <Services />
          <Reviews />
          <Contact />
          <FAQ />
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