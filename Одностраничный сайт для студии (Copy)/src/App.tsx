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
import { ThemeProvider, useTheme } from './components/ThemeContext';
import { LanguageProvider } from './components/LanguageContext';
import { OnlineStatusProvider } from './components/OnlineStatusContext';
import './styles/globals.css';

function AppContent() {
  const { theme } = useTheme();
  
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
          <AppContent />
        </OnlineStatusProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}