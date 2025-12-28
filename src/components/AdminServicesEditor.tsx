import { useEffect, useMemo, useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useLanguage } from './LanguageContext';
import type { Lang, ServicesOverrides, ServiceOverride, ServiceKey, ServiceTextOverride } from './servicesConfig';
import { emptyServicesOverrides } from './servicesConfig';

type Props = {
  adminAccessToken?: string;
  theme: 'light' | 'dark';
  onNotify: (type: 'success' | 'error', message: string) => void;
};

const SERVICE_KEYS: Array<{ id: number; key: ServiceKey; iconLabel: string }> = [
  { id: 1, key: 'basic', iconLabel: 'Droplet' },
  { id: 2, key: 'interior', iconLabel: 'Wind' },
  { id: 3, key: 'full', iconLabel: 'Car' },
  { id: 4, key: 'exterior', iconLabel: 'Sparkles' },
  { id: 5, key: 'engine', iconLabel: 'Zap' },
  { id: 6, key: 'maintenance', iconLabel: 'Shield' },
];

function normalizeLines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function linesToText(lines?: string[]): string {
  return (lines || []).join('\n');
}

type DraftField = 'whatYouGet' | 'toolsUsed' | 'importantNotes' | 'whyChooseUs';

function draftKey(id: number, lang: Lang, field: DraftField): string {
  return `${id}|${lang}|${field}`;
}

function parseDraftKey(key: string): { id: number; lang: Lang; field: DraftField } | null {
  const parts = key.split('|');
  if (parts.length !== 3) return null;
  const id = Number(parts[0]);
  const lang = parts[1] as Lang;
  const field = parts[2] as DraftField;
  if (!Number.isFinite(id)) return null;
  if (!['en', 'es', 'ru'].includes(lang)) return null;
  if (!['whatYouGet', 'toolsUsed', 'importantNotes', 'whyChooseUs'].includes(field)) return null;
  return { id, lang, field };
}

function getServiceTitleKey(serviceKey: ServiceKey) {
  return `services.cards.${serviceKey}.title`;
}
function getServiceHeadlineKey(serviceKey: ServiceKey) {
  return `services.cards.${serviceKey}.headline`;
}
function getServiceDescriptionKey(serviceKey: ServiceKey) {
  return `services.cards.${serviceKey}.description`;
}

function listKeys(serviceKey: ServiceKey, group: 'what' | 'tools' | 'notes' | 'why', count: number): string[] {
  const prefix = `services.cards.${serviceKey}.${group}.`;
  return Array.from({ length: count }, (_, i) => `${prefix}${i + 1}`);
}

function getDetailsKey(serviceKey: ServiceKey, field: 'bestFor' | 'duration' | 'startingPrice') {
  return `services.cards.${serviceKey}.${field}`;
}

function baseServiceText(tForLanguage: (lang: Lang, key: string) => string, lang: Lang, key: ServiceKey): ServiceTextOverride {
  const whatCount = 6;
  const toolsCount = key === 'maintenance' ? 3 : 5;
  const whyCount = 4;

  const whatYouGet = listKeys(key, 'what', whatCount).map((k) => tForLanguage(lang, k));
  const toolsUsed = listKeys(key, 'tools', toolsCount).map((k) => tForLanguage(lang, k));
  const importantNotes =
    key === 'full'
      ? [
          tForLanguage(lang, `services.cards.${key}.notes.1`),
          tForLanguage(lang, `services.cards.${key}.notes.2`),
          tForLanguage(lang, `services.cards.${key}.notes.4`),
        ]
      : listKeys(key, 'notes', 4).map((k) => tForLanguage(lang, k));
  const whyChooseUs = listKeys(key, 'why', whyCount).map((k) => tForLanguage(lang, k));

  return {
    title: tForLanguage(lang, getServiceTitleKey(key)),
    headline: tForLanguage(lang, getServiceHeadlineKey(key)),
    description: tForLanguage(lang, getServiceDescriptionKey(key)),
    details: {
      whatYouGet,
      bestFor: tForLanguage(lang, getDetailsKey(key, 'bestFor')),
      toolsUsed,
      importantNotes,
      whyChooseUs,
      duration: tForLanguage(lang, getDetailsKey(key, 'duration')),
      startingPrice: tForLanguage(lang, getDetailsKey(key, 'startingPrice')),
    },
  };
}

function mergeText(base: ServiceTextOverride, override?: ServiceTextOverride): ServiceTextOverride {
  if (!override) return base;
  return {
    title: override.title ?? base.title,
    headline: override.headline ?? base.headline,
    description: override.description ?? base.description,
    details: {
      whatYouGet: override.details?.whatYouGet ?? base.details?.whatYouGet,
      bestFor: override.details?.bestFor ?? base.details?.bestFor,
      toolsUsed: override.details?.toolsUsed ?? base.details?.toolsUsed,
      importantNotes: override.details?.importantNotes ?? base.details?.importantNotes,
      whyChooseUs: override.details?.whyChooseUs ?? base.details?.whyChooseUs,
      duration: override.details?.duration ?? base.details?.duration,
      startingPrice: override.details?.startingPrice ?? base.details?.startingPrice,
    },
  };
}

async function apiJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const text = await res.text();
  let body: any = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = { error: text || 'Invalid JSON response' };
  }
  if (!res.ok) {
    const err: any = new Error(body?.error || `Request failed (${res.status})`);
    err.status = res.status;
    err.body = body;
    throw err;
  }
  return body as T;
}

export function AdminServicesEditor({ adminAccessToken, theme, onNotify }: Props) {
  const { language, t, tForLanguage } = useLanguage();
  const [activeLang, setActiveLang] = useState<Lang>('en');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [overrides, setOverrides] = useState<ServicesOverrides>(() => emptyServicesOverrides());
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!adminAccessToken) return;
    setIsLoading(true);
    void (async () => {
      try {
        const resp = await apiJson<{ ok: true; overrides: any }>(`/api/admin/services`, {
          headers: { Authorization: `Bearer ${adminAccessToken}` },
        });
        if (resp?.overrides && resp.overrides?.version === 1 && Array.isArray(resp.overrides?.services)) {
          setOverrides(resp.overrides as ServicesOverrides);
        }
      } catch {
        // ignore; editor still works with empty overrides
      } finally {
        setIsLoading(false);
      }
    })();
  }, [adminAccessToken]);

  // Keep language selector aligned with site language by default.
  useEffect(() => {
    setActiveLang(language);
  }, [language]);

  // Prevent drafts from leaking across languages.
  useEffect(() => {
    setDrafts({});
  }, [activeLang]);

  const byId = useMemo(() => {
    const map = new Map<number, ServiceOverride>();
    for (const s of overrides.services) map.set(s.id, s);
    return map;
  }, [overrides]);

  const updateService = (id: number, updater: (prev: ServiceOverride) => ServiceOverride) => {
    setOverrides((prev) => {
      const next = { ...prev, services: prev.services.map((s) => (s.id === id ? updater(s) : s)) };
      return next;
    });
  };

  const updateTextField = (id: number, lang: Lang, field: keyof ServiceTextOverride, value: string) => {
    updateService(id, (prev) => {
      const nextText = { ...(prev.text || {}) } as any;
      const prevLang = (nextText[lang] || {}) as ServiceTextOverride;
      nextText[lang] = { ...prevLang, [field]: value };
      return { ...prev, text: nextText };
    });
  };

  const updateDetailsLines = (
    id: number,
    lang: Lang,
    field: keyof NonNullable<ServiceTextOverride['details']>,
    lines: string[] | string
  ) => {
    updateService(id, (prev) => {
      const nextText = { ...(prev.text || {}) } as any;
      const prevLang = (nextText[lang] || {}) as ServiceTextOverride;
      const prevDetails = { ...(prevLang.details || {}) };
      (prevDetails as any)[field] = lines;
      nextText[lang] = { ...prevLang, details: prevDetails };
      return { ...prev, text: nextText };
    });
  };

  const copyFromEn = (id: number, targetLang: Lang) => {
    if (targetLang === 'en') return;
    updateService(id, (prev) => {
      const nextText = { ...(prev.text || {}) } as any;
      nextText[targetLang] = JSON.parse(JSON.stringify(nextText.en || {}));
      return { ...prev, text: nextText };
    });
  };

  const fillFromDefaults = (id: number, lang: Lang) => {
    const svc = SERVICE_KEYS.find((s) => s.id === id);
    if (!svc) return;
    const base = baseServiceText(tForLanguage as any, lang, svc.key);
    updateService(id, (prev) => {
      const nextText = { ...(prev.text || {}) } as any;
      nextText[lang] = base;
      return { ...prev, text: nextText };
    });
  };

  const handleSave = async () => {
    if (!adminAccessToken) return;
    setIsSaving(true);

    // If user clicks Save while focused in a textarea, flush drafts first.
    const overridesToSave: ServicesOverrides = (() => {
      const entries = Object.entries(drafts);
      if (entries.length === 0) return overrides;

      const next: ServicesOverrides = {
        ...overrides,
        services: overrides.services.map((s) => ({ ...s, text: s.text ? { ...s.text } : undefined })),
      };

      for (const [k, v] of entries) {
        const parsed = parseDraftKey(k);
        if (!parsed) continue;
        const svc = next.services.find((s) => s.id === parsed.id);
        if (!svc) continue;
        const nextText: any = { ...(svc.text || {}) };
        const prevLang = (nextText[parsed.lang] || {}) as ServiceTextOverride;
        const prevDetails = { ...(prevLang.details || {}) };
        (prevDetails as any)[parsed.field] = normalizeLines(v);
        nextText[parsed.lang] = { ...prevLang, details: prevDetails };
        svc.text = nextText;
      }

      return next;
    })();

    if (overridesToSave !== overrides) {
      setOverrides(overridesToSave);
      setDrafts({});
    }

    try {
      await apiJson(`/api/admin/services`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminAccessToken}`,
        },
        body: JSON.stringify(overridesToSave),
      });
      onNotify('success', t('admin.services.saved'));
    } catch {
      onNotify('error', t('admin.services.saveFailed'));
    } finally {
      setIsSaving(false);
    }
  };

  const panelCls = theme === 'dark' ? 'bg-slate-800/50 border-purple-500/30' : '';

  return (
    <Card className={panelCls}>
      <CardHeader>
        <CardTitle>{t('admin.services.title')}</CardTitle>
        <CardDescription>{t('admin.services.description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="text-sm text-muted-foreground">{t('admin.services.language')}</div>
            <div className="w-[180px]">
              <Select value={activeLang} onValueChange={(v: string) => setActiveLang(v as Lang)}>
                <SelectTrigger>
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="ru">Русский</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                for (const s of SERVICE_KEYS) fillFromDefaults(s.id, activeLang);
                onNotify('success', t('admin.services.filledDefaults'));
              }}
              disabled={!adminAccessToken}
            >
              {t('admin.services.fillDefaults')}
            </Button>
            <Button type="button" onClick={() => void handleSave()} disabled={!adminAccessToken || isSaving}>
              {isSaving ? t('admin.services.saving') : t('admin.services.save')}
            </Button>
          </div>
        </div>

        {isLoading && <div className="text-sm text-muted-foreground">{t('admin.services.loading')}</div>}

        <Accordion type="multiple" className="w-full">
          {SERVICE_KEYS.map((svc) => {
            const current = byId.get(svc.id) || { id: svc.id };
            const base = baseServiceText(tForLanguage as any, activeLang, svc.key);
            const effective = mergeText(base, current.text?.[activeLang]);

            const details = effective.details || {};

            const listDraftValue = (field: DraftField, fallbackLines?: string[]) => {
              const k = draftKey(svc.id, activeLang, field);
              return drafts[k] ?? linesToText(fallbackLines);
            };

            const setListDraftValue = (field: DraftField, value: string) => {
              const k = draftKey(svc.id, activeLang, field);
              setDrafts((prev) => ({ ...prev, [k]: value }));
            };

            const commitListDraftValue = (field: DraftField) => {
              const k = draftKey(svc.id, activeLang, field);
              const value = drafts[k];
              if (value === undefined) return;
              updateDetailsLines(svc.id, activeLang, field, normalizeLines(value));
              setDrafts((prev) => {
                const next = { ...prev };
                delete next[k];
                return next;
              });
            };

            return (
              <AccordionItem key={svc.id} value={String(svc.id)}>
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{current.emoji || '🧽'}</span>
                    <span className="font-medium">{effective.title || `Service ${svc.id}`}</span>
                    <span className="text-muted-foreground">(#{svc.id})</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">{t('admin.services.emoji')}</div>
                        <Input
                          value={current.emoji || ''}
                          onChange={(e) => updateService(svc.id, (p) => ({ ...p, emoji: e.target.value }))}
                          placeholder="✨"
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button type="button" variant="outline" onClick={() => fillFromDefaults(svc.id, activeLang)}>
                          {t('admin.services.fillDefaultsOne')}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => copyFromEn(svc.id, activeLang)} disabled={activeLang === 'en'}>
                          {t('admin.services.copyFromEn')}
                        </Button>
                      </div>

                      <div>
                        <div className="text-xs text-muted-foreground mb-1">{t('admin.services.titleField')}</div>
                        <Input
                          value={effective.title || ''}
                          onChange={(e) => updateTextField(svc.id, activeLang, 'title', e.target.value)}
                        />
                      </div>

                      <div>
                        <div className="text-xs text-muted-foreground mb-1">{t('admin.services.headline')}</div>
                        <Input
                          value={effective.headline || ''}
                          onChange={(e) => updateTextField(svc.id, activeLang, 'headline', e.target.value)}
                        />
                      </div>

                      <div>
                        <div className="text-xs text-muted-foreground mb-1">{t('admin.services.descriptionField')}</div>
                        <Textarea
                          value={effective.description || ''}
                          onChange={(e) => updateTextField(svc.id, activeLang, 'description', e.target.value)}
                          rows={4}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">{t('admin.services.startingPrice')}</div>
                          <Input
                            value={details.startingPrice || ''}
                            onChange={(e) => updateDetailsLines(svc.id, activeLang, 'startingPrice', e.target.value)}
                          />
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">{t('admin.services.duration')}</div>
                          <Input
                            value={details.duration || ''}
                            onChange={(e) => updateDetailsLines(svc.id, activeLang, 'duration', e.target.value)}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="text-xs text-muted-foreground mb-1">{t('admin.services.bestFor')}</div>
                        <Textarea
                          value={details.bestFor || ''}
                          onChange={(e) => updateDetailsLines(svc.id, activeLang, 'bestFor', e.target.value)}
                          rows={2}
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">{t('admin.services.whatYouGet')}</div>
                        <Textarea
                          value={listDraftValue('whatYouGet', details.whatYouGet)}
                          onChange={(e) => setListDraftValue('whatYouGet', e.target.value)}
                          onBlur={() => commitListDraftValue('whatYouGet')}
                          rows={6}
                        />
                        <div className="text-xs text-muted-foreground mt-1">{t('admin.services.onePerLine')}</div>
                      </div>

                      <div>
                        <div className="text-xs text-muted-foreground mb-1">{t('admin.services.toolsUsed')}</div>
                        <Textarea
                          value={listDraftValue('toolsUsed', details.toolsUsed)}
                          onChange={(e) => setListDraftValue('toolsUsed', e.target.value)}
                          onBlur={() => commitListDraftValue('toolsUsed')}
                          rows={5}
                        />
                      </div>

                      <div>
                        <div className="text-xs text-muted-foreground mb-1">{t('admin.services.importantNotes')}</div>
                        <Textarea
                          value={listDraftValue('importantNotes', details.importantNotes)}
                          onChange={(e) => setListDraftValue('importantNotes', e.target.value)}
                          onBlur={() => commitListDraftValue('importantNotes')}
                          rows={5}
                        />
                      </div>

                      <div>
                        <div className="text-xs text-muted-foreground mb-1">{t('admin.services.whyChooseUs')}</div>
                        <Textarea
                          value={listDraftValue('whyChooseUs', details.whyChooseUs)}
                          onChange={(e) => setListDraftValue('whyChooseUs', e.target.value)}
                          onBlur={() => commitListDraftValue('whyChooseUs')}
                          rows={5}
                        />
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </CardContent>
    </Card>
  );
}
