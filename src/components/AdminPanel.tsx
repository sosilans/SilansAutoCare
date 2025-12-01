import { useTheme } from './ThemeContext';
import { useAuth } from './AuthContext';
import { Settings } from 'lucide-react';

export function AdminPanel() {
  const { theme } = useTheme();
  const { isAdmin } = useAuth();

  if (!isAdmin) return null;

  const handleOpenAdmin = () => {
    window.open('/admin', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={handleOpenAdmin}
        className={`px-6 py-3 rounded-xl border-2 inline-flex items-center gap-2 shadow-lg hover:scale-105 transition-transform ${
          theme === 'dark'
            ? 'border-purple-500/50 bg-purple-950/40 text-purple-200 hover:bg-purple-900/60 vhs-glow-dark'
            : 'border-purple-300 bg-white text-purple-700 hover:bg-purple-50'
        }`}
        title="Open Admin Dashboard (New Tab)"
      >
        <Settings size={20} />
        <span className="font-medium">Admin Dashboard</span>
      </button>
    </div>
  );
}