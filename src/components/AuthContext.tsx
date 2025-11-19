import { createContext, useContext, useEffect, useMemo, useState } from 'react';

type AuthMode = 'login' | 'register';

type Role = 'guest' | 'user' | 'admin';

export interface AuthUser {
  name: string;
  email?: string;
  role: Role;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAdmin: boolean;
  login: (name: string, email: string) => Promise<{ ok: boolean; message?: string }>; 
  register: (name: string, email: string) => Promise<{ ok: boolean; message?: string }>; 
  logout: () => void;
  users: AuthUser[];
  removeUser: (email: string) => void;
  // Modal controls
  authOpen: boolean;
  authMode: AuthMode;
  openAuthModal: (mode?: AuthMode) => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const LS_KEY = 'car-detailing-auth-user';
const LS_USERS_KEY = 'car-detailing-users';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('login');

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_USERS_KEY);
      if (raw) setUsers(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      if (user) localStorage.setItem(LS_KEY, JSON.stringify(user));
      else localStorage.removeItem(LS_KEY);
    } catch {}
  }, [user]);

  useEffect(() => {
    try {
      localStorage.setItem(LS_USERS_KEY, JSON.stringify(users));
    } catch {}
  }, [users]);

  const isAdmin = user?.role === 'admin';

  const openAuthModal = (mode: AuthMode = 'login') => {
    setAuthMode(mode);
    setAuthOpen(true);
  };
  const closeAuthModal = () => setAuthOpen(false);

  async function login(name: string, email: string) {
    const envAdminName = import.meta.env.VITE_ADMIN_NAME as string | undefined;
    const envAdminEmail = import.meta.env.VITE_ADMIN_EMAIL as string | undefined;
    const fallbackName = 'Adminsilans';
    const fallbackEmail = 'GameManPlay1337@gmail.com';

    const adminName = envAdminName && envAdminName.length ? envAdminName : fallbackName;
    const adminEmail = envAdminEmail && envAdminEmail.length ? envAdminEmail : fallbackEmail;

    const isAdminLogin = name.trim() === adminName && email.trim().toLowerCase() === adminEmail.toLowerCase();

    setUser({ name: name.trim(), email: email.trim(), role: isAdminLogin ? 'admin' : 'user' });
    closeAuthModal();
    return { ok: true };
  }

  async function register(name: string, email: string) {
    // Client-side registration with localStorage persistence and duplicate check
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const emailLower = trimmedEmail.toLowerCase();

    // basic email shape check
    const emailOk = /.+@.+\..+/.test(emailLower);
    if (!emailOk) {
      return { ok: false, message: 'Invalid email format' };
    }

    const exists = users.some(u => (u.email || '').toLowerCase() === emailLower);
    if (exists) {
      return { ok: false, message: 'User already exists. Please login.' };
    }

    const newUser: AuthUser = { name: trimmedName, email: trimmedEmail, role: 'user' };
    setUsers(prev => [...prev, newUser]);
    setUser(newUser); // auto-login after successful registration
    closeAuthModal();
    return { ok: true };
  }

  function logout() {
    setUser(null);
  }

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isAdmin,
    login,
    register,
    logout,
    users,
    removeUser: (email: string) => {
      const next = users.filter(u => (u.email || '').toLowerCase() !== email.toLowerCase());
      setUsers(next);
      if (user && (user.email || '').toLowerCase() === email.toLowerCase()) setUser(null);
    },
    authOpen,
    authMode,
    openAuthModal,
    closeAuthModal,
  }), [user, users, isAdmin, authOpen, authMode]);

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
