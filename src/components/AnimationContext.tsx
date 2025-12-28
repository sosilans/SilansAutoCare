import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

type AnimationContextType = {
  reduceMotion: boolean;
  setReduceMotion: (next: boolean) => void;
  toggleReduceMotion: () => void;
};

const AnimationContext = createContext<AnimationContextType | undefined>(undefined);

const STORAGE_KEY = 'reduceMotion';

function getInitialReduceMotion(): boolean {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === '1') return true;
    if (saved === '0') return false;
  } catch {
    // ignore
  }

  try {
    return Boolean(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  } catch {
    return false;
  }
}

export function AnimationProvider({ children }: { children: ReactNode }) {
  const [reduceMotion, setReduceMotionState] = useState<boolean>(() => getInitialReduceMotion());

  const setReduceMotion = (next: boolean) => {
    setReduceMotionState(Boolean(next));
  };

  const toggleReduceMotion = () => {
    setReduceMotionState((prev) => !prev);
  };

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, reduceMotion ? '1' : '0');
    } catch {
      // ignore
    }

    // Useful for CSS overrides if needed.
    document.documentElement.setAttribute('data-reduce-motion', reduceMotion ? 'true' : 'false');
  }, [reduceMotion]);

  const value = useMemo<AnimationContextType>(() => {
    return { reduceMotion, setReduceMotion, toggleReduceMotion };
  }, [reduceMotion]);

  return <AnimationContext.Provider value={value}>{children}</AnimationContext.Provider>;
}

export function useAnimation() {
  const ctx = useContext(AnimationContext);
  if (!ctx) throw new Error('useAnimation must be used within an AnimationProvider');
  return ctx;
}
