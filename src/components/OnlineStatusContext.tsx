import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface OnlineStatusContextType {
  isOnline: boolean;
  setIsOnline: (status: boolean) => void;
}

const OnlineStatusContext = createContext<OnlineStatusContextType | undefined>(undefined);

const LS_SITE_ONLINE = 'cd_site_online';

async function loadSiteOnline(): Promise<boolean | null> {
  try {
    const res = await fetch('/api/public/settings?key=site_online');
    if (!res.ok) return null;
    const body = (await res.json()) as any;
    const value = body?.setting?.value;
    if (typeof value === 'boolean') return value;
    if (value === 'true') return true;
    if (value === 'false') return false;
    return null;
  } catch {
    return null;
  }
}

export function OnlineStatusProvider({ children }: { children: ReactNode }) {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    try {
      const raw = localStorage.getItem(LS_SITE_ONLINE);
      if (raw === 'true') return true;
      if (raw === 'false') return false;
    } catch {
      // ignore
    }
    return true;
  });

  useEffect(() => {
    void (async () => {
      const serverValue = await loadSiteOnline();
      if (typeof serverValue === 'boolean') setIsOnline(serverValue);
    })();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(LS_SITE_ONLINE, String(isOnline));
    } catch {
      // ignore
    }
  }, [isOnline]);

  return (
    <OnlineStatusContext.Provider value={{ isOnline, setIsOnline }}>
      {children}
    </OnlineStatusContext.Provider>
  );
}

export function useOnlineStatus() {
  const context = useContext(OnlineStatusContext);
  if (!context) {
    throw new Error('useOnlineStatus must be used within an OnlineStatusProvider');
  }
  return context;
}
