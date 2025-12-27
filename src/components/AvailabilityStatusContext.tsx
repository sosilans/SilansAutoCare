import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type AvailabilityStatus = 'available' | 'unavailable';

interface AvailabilityStatusContextType {
  status: AvailabilityStatus;
  setStatus: (status: AvailabilityStatus) => void;
}

const AvailabilityStatusContext = createContext<AvailabilityStatusContextType | undefined>(undefined);

const LS_AVAILABILITY = 'cd_availability_status';

function normalizeAvailability(value: unknown): AvailabilityStatus | null {
  if (value === true) return 'available';
  if (value === false) return 'unavailable';
  if (typeof value !== 'string') return null;
  const v = value.trim().toLowerCase();
  if (v === 'available' || v === 'online' || v === 'true') return 'available';
  if (v === 'unavailable' || v === 'offline' || v === 'false' || v === 'not_available') return 'unavailable';
  return null;
}

async function loadAvailabilityStatus(): Promise<AvailabilityStatus | null> {
  try {
    const res = await fetch('/api/public/settings?key=availability_status');
    if (!res.ok) return null;
    const body = (await res.json()) as any;
    const value = body?.setting?.value;
    return normalizeAvailability(value);
  } catch {
    return null;
  }
}

export function AvailabilityStatusProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AvailabilityStatus>(() => {
    try {
      const raw = localStorage.getItem(LS_AVAILABILITY);
      const normalized = normalizeAvailability(raw);
      if (normalized) return normalized;
    } catch {
      // ignore
    }
    return 'available';
  });

  useEffect(() => {
    void (async () => {
      const serverValue = await loadAvailabilityStatus();
      if (serverValue) setStatus(serverValue);
    })();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(LS_AVAILABILITY, status);
    } catch {
      // ignore
    }
  }, [status]);

  return (
    <AvailabilityStatusContext.Provider value={{ status, setStatus }}>
      {children}
    </AvailabilityStatusContext.Provider>
  );
}

export function useAvailabilityStatus() {
  const ctx = useContext(AvailabilityStatusContext);
  if (!ctx) throw new Error('useAvailabilityStatus must be used within an AvailabilityStatusProvider');
  return ctx;
}
