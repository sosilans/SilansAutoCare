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
import { ErrorBoundary } from './components/ErrorBoundary';
import { AuthProvider } from './components/AuthContext';
import { AuthModal } from './components/AuthModal';
import { ThemeProvider, useTheme } from './components/ThemeContext';
import { LanguageProvider, useLanguage } from './components/LanguageContext';
import { OnlineStatusProvider } from './components/OnlineStatusContext';
import { AvailabilityStatusProvider } from './components/AvailabilityStatusContext';
import { MaintenanceModeProvider, useMaintenanceMode } from './components/MaintenanceModeContext';
import { DataStoreProvider } from './components/DataStoreContext';
import { initAnalytics } from './analytics/client';

function MaintenancePlaceholder() {
  const { theme } = useTheme();
  const { t } = useLanguage();

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-6 transition-colors duration-500 ${
        theme === 'light'
          ? 'bg-gradient-to-b from-slate-50 via-blue-50/30 to-indigo-50/50 text-gray-900'
          : 'bg-gradient-to-b from-slate-900 via-blue-950 to-indigo-950 text-white'
      }`}
    >
      <div className="max-w-xl w-full text-center">
        <div className="mx-auto mb-4 inline-flex items-center justify-center w-14 h-14 rounded-2xl vhs-gradient cartoon-shadow-sm">
          <span className="text-2xl">🛠️</span>
        </div>
        <h1 className={`text-3xl sm:text-4xl font-bold mb-3 ${theme === 'dark' ? 'text-purple-100' : 'text-gray-900'}`}>
          {t('maintenance.title')}
        </h1>
        <p className={theme === 'dark' ? 'text-purple-200/80' : 'text-gray-700'}>
          {t('maintenance.message')}
        </p>
      </div>
    </div>
  );
}

function AppContent() {
  const { theme } = useTheme();
  const { isMaintenanceMode } = useMaintenanceMode();
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
        <ErrorBoundary fallbackTitle="Admin crashed">
          <AdminSecureDashboard />
        </ErrorBoundary>
      </div>
    );
  }

  // Public site maintenance mode
  if (isMaintenanceMode) {
    return <MaintenancePlaceholder />;
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
          <AvailabilityStatusProvider>
            <MaintenanceModeProvider>
              <AuthProvider>
                <DataStoreProvider>
                  <AuthModal />
                  <AppContent />
                </DataStoreProvider>
              </AuthProvider>
            </MaintenanceModeProvider>
          </AvailabilityStatusProvider>
        </OnlineStatusProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}