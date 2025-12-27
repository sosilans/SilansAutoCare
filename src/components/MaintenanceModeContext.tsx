import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface MaintenanceModeContextType {
  isMaintenanceMode: boolean;
  setIsMaintenanceMode: (value: boolean) => void;
}

const MaintenanceModeContext = createContext<MaintenanceModeContextType | undefined>(undefined);

const LS_MAINTENANCE = 'cd_maintenance_mode';

function normalizeBool(value: unknown): boolean | null {
  if (typeof value === 'boolean') return value;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return null;
}

async function loadMaintenanceMode(): Promise<boolean | null> {
  try {
    const res = await fetch('/api/public/settings?key=maintenance_mode');
    if (!res.ok) return null;
    const body = (await res.json()) as any;
    return normalizeBool(body?.setting?.value);
  } catch {
    return null;
  }
}

export function MaintenanceModeProvider({ children }: { children: ReactNode }) {
  const [isMaintenanceMode, setIsMaintenanceMode] = useState<boolean>(() => {
    try {
      const raw = localStorage.getItem(LS_MAINTENANCE);
      const normalized = normalizeBool(raw);
      if (typeof normalized === 'boolean') return normalized;
    } catch {
      // ignore
    }
    return false;
  });

  useEffect(() => {
    void (async () => {
      const serverValue = await loadMaintenanceMode();
      if (typeof serverValue === 'boolean') setIsMaintenanceMode(serverValue);
    })();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(LS_MAINTENANCE, String(isMaintenanceMode));
    } catch {
      // ignore
    }
  }, [isMaintenanceMode]);

  return (
    <MaintenanceModeContext.Provider value={{ isMaintenanceMode, setIsMaintenanceMode }}>
      {children}
    </MaintenanceModeContext.Provider>
  );
}

export function useMaintenanceMode() {
  const ctx = useContext(MaintenanceModeContext);
  if (!ctx) throw new Error('useMaintenanceMode must be used within a MaintenanceModeProvider');
  return ctx;
}
