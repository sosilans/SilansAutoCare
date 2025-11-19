import { useState } from 'react';
import { motion } from 'motion/react';
import { useTheme } from './ThemeContext';
import { useAuth } from './AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';

export function AuthModal() {
  const { theme } = useTheme();
  const { authOpen, authMode, closeAuthModal, login, register, openAuthModal } = useAuth();

  const [form, setForm] = useState({
    name: '',
    email: '',
  });
  const [error, setError] = useState<string | null>(null);

  if (!authOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={closeAuthModal} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`relative w-[92vw] max-w-xl rounded-3xl border-2 p-6 mx-4 backdrop-blur-md shadow-2xl ${
          theme === 'dark'
            ? 'bg-gray-900/90 border-purple-500/30 vhs-noise vhs-scanlines'
            : 'bg-white/90 border-purple-200'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className={theme === 'dark' ? 'text-purple-100' : 'text-gray-900'}>
            {authMode === 'login' ? 'Login' : 'Registration'}
          </h3>
          <button onClick={closeAuthModal} className="text-sm opacity-60 hover:opacity-100">Close</button>
        </div>

        <div className="flex gap-2 mb-4">
          <button
            className={`flex-1 py-2 rounded-2xl border-2 transition ${authMode === 'login'
              ? (theme === 'dark' ? 'bg-purple-900/40 border-purple-500/50' : 'bg-purple-50 border-purple-400')
              : (theme === 'dark' ? 'border-purple-500/20 hover:border-purple-400/40' : 'border-purple-200 hover:border-purple-300')
            }`}
            onClick={() => { setError(null); openAuthModal('login'); }}
          >
            Login
          </button>
          <button
            className={`flex-1 py-2 rounded-2xl border-2 transition ${authMode === 'register'
              ? (theme === 'dark' ? 'bg-purple-900/40 border-purple-500/50' : 'bg-purple-50 border-purple-400')
              : (theme === 'dark' ? 'border-purple-500/20 hover:border-purple-400/40' : 'border-purple-200 hover:border-purple-300')
            }`}
            onClick={() => { setError(null); openAuthModal('register'); }}
          >
            Register
          </button>
        </div>

        {error && (
          <div className={`mb-3 p-3 rounded-xl border-2 ${
            theme === 'dark' ? 'bg-red-500/10 border-red-500/30 text-red-200' : 'bg-red-50 border-red-200 text-red-700'
          }`}>
            {error}
          </div>
        )}

        {authMode === 'login' ? (
          <form
            className="space-y-3"
            onSubmit={async (e) => {
              e.preventDefault();
              setError(null);
              if (!form.name.trim()) return setError('Please enter your name');
              if (!form.email.trim()) return setError('Please enter your email');
              const res = await login(form.name.trim(), form.email.trim());
              if (!res.ok) setError(res.message || 'Login failed');
            }}
          >
            <Input
              placeholder="Name"
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className={`border-2 rounded-2xl h-11 px-4 ${
                theme === 'dark' ? 'bg-purple-950/30 border-purple-500/20 text-purple-100 focus-visible:border-purple-400/60' : 'bg-gray-50 border-gray-200 text-gray-900 focus-visible:border-purple-300'
              }`}
            />
            <Input
              type="email"
              placeholder="email"
              required
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className={`border-2 rounded-2xl h-11 px-4 ${
                theme === 'dark' ? 'bg-purple-950/30 border-purple-500/20 text-purple-100 focus-visible:border-purple-400/60' : 'bg-gray-50 border-gray-200 text-gray-900 focus-visible:border-purple-300'
              }`}
            />
            <Button
              type="submit"
              className={`w-full text-white rounded-full py-3 shadow-lg ${
                theme === 'dark'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 vhs-glow-dark'
                  : 'bg-gradient-to-r from-purple-500 to-pink-500'
              }`}
            >
              Login
            </Button>
          </form>
        ) : (
          <form
            className="space-y-3"
            onSubmit={async (e) => {
              e.preventDefault();
              setError(null);
              if (!form.name.trim()) return setError('Please enter your name');
              if (!form.email.trim()) return setError('Please enter your email');
              const res = await register(form.name.trim(), form.email.trim());
              if (!res.ok) setError(res.message || 'Registration failed');
            }}
          >
            <Input
              placeholder="Name"
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className={`border-2 rounded-2xl h-11 px-4 ${
                theme === 'dark' ? 'bg-purple-950/30 border-purple-500/20 text-purple-100 focus-visible:border-purple-400/60' : 'bg-gray-50 border-gray-200 text-gray-900 focus-visible:border-purple-300'
              }`}
            />
            <Input
              type="email"
              placeholder="email"
              required
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className={`border-2 rounded-2xl h-11 px-4 ${
                theme === 'dark' ? 'bg-purple-950/30 border-purple-500/20 text-purple-100 focus-visible:border-purple-400/60' : 'bg-gray-50 border-gray-200 text-gray-900 focus-visible:border-purple-300'
              }`}
            />
            <Button
              type="submit"
              className={`w-full text-white rounded-full py-3 shadow-lg ${
                theme === 'dark'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 vhs-glow-dark'
                  : 'bg-gradient-to-r from-purple-500 to-pink-500'
              }`}
            >
              Register
            </Button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
