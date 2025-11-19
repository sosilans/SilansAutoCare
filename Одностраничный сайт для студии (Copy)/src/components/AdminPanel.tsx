import { useOnlineStatus } from './OnlineStatusContext';
import { useTheme } from './ThemeContext';

export function AdminPanel() {
  const { isOnline, setIsOnline } = useOnlineStatus();
  const { theme } = useTheme();

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className={`hidden rounded-2xl p-6 shadow-2xl backdrop-blur-md border-2 ${
        theme === 'dark'
          ? 'bg-gray-900/90 border-purple-500/50'
          : 'bg-white/90 border-purple-200'
      }`}>
        <h3 className={`text-lg mb-4 ${
          theme === 'dark' ? 'text-purple-300' : 'text-purple-700'
        }`}>
          Admin Panel
        </h3>
        
        <div className="flex flex-col gap-3">
          <div className="text-sm mb-2 opacity-75">
            Status Control:
          </div>
          
          {/* Online Button */}
          <button
            onClick={() => setIsOnline(true)}
            className={`group flex items-center justify-between gap-3 px-5 py-3 rounded-xl transition-all duration-300 ${
              isOnline
                ? theme === 'dark'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/50 scale-105'
                  : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30 scale-105'
                : theme === 'dark'
                  ? 'bg-gray-800/50 text-gray-400 hover:bg-gray-800 border border-gray-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${
                isOnline ? 'bg-green-200 animate-pulse' : 'bg-green-500/30'
              }`}></span>
              <span className="font-medium">Available</span>
            </div>
            {isOnline && (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>

          {/* Offline Button */}
          <button
            onClick={() => setIsOnline(false)}
            className={`group flex items-center justify-between gap-3 px-5 py-3 rounded-xl transition-all duration-300 ${
              !isOnline
                ? theme === 'dark'
                  ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg shadow-red-500/50 scale-105'
                  : 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg shadow-red-500/30 scale-105'
                : theme === 'dark'
                  ? 'bg-gray-800/50 text-gray-400 hover:bg-gray-800 border border-gray-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${
                !isOnline ? 'bg-red-200' : 'bg-red-500/30'
              }`}></span>
              <span className="font-medium">Not Available</span>
            </div>
            {!isOnline && (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
        </div>

        {/* Current Status Display */}
        <div className={`mt-4 pt-4 border-t text-sm ${
          theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center gap-2">
            <span className="opacity-75">Current Status:</span>
            <span className={`flex items-center gap-1 font-medium ${
              isOnline ? 'text-green-500' : 'text-red-500'
            }`}>
              <span className={`w-2 h-2 rounded-full ${
                isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'
              }`}></span>
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}