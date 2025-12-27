export type Lang = 'en' | 'es' | 'ru';

export type ServiceKey = 'basic' | 'interior' | 'full' | 'exterior' | 'engine' | 'maintenance';

export type ServiceDetailsOverride = {
  whatYouGet?: string[];
  bestFor?: string;
  toolsUsed?: string[];
  importantNotes?: string[];
  whyChooseUs?: string[];
  duration?: string;
  startingPrice?: string;
};

export type ServiceTextOverride = {
  title?: string;
  headline?: string;
  description?: string;
  details?: ServiceDetailsOverride;
};

export type ServiceOverride = {
  id: number; // 1..6
  emoji?: string;
  text?: Partial<Record<Lang, ServiceTextOverride>>;
};

export type ServicesOverrides = {
  version: 1;
  services: ServiceOverride[]; // length 6
};

export const SERVICES_OVERRIDES_KEY = 'services_overrides_v1' as const;

export function emptyServicesOverrides(): ServicesOverrides {
  return {
    version: 1,
    services: [
      { id: 1 },
      { id: 2 },
      { id: 3 },
      { id: 4 },
      { id: 5 },
      { id: 6 },
    ],
  };
}

export function isServicesOverrides(value: unknown): value is ServicesOverrides {
  const v: any = value;
  if (!v || typeof v !== 'object') return false;
  if (v.version !== 1) return false;
  if (!Array.isArray(v.services) || v.services.length !== 6) return false;
  for (const s of v.services) {
    if (!s || typeof s !== 'object') return false;
    if (typeof s.id !== 'number') return false;
  }
  return true;
}
