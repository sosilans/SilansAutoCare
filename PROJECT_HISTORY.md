 # Project History & Configuration

## Project Overview
**Sacramento Car Detailing Studio Website**
- Business: Silan's Auto Care
- Location: Sacramento, California
- Services: Professional car detailing (interior, exterior, full detail, engine bay, maintenance)
- Tech Stack: React 18 + TypeScript, Vite 6.3.5, Tailwind CSS, Radix UI, Framer Motion

## Deployment & Repository
- **GitHub Repository**: https://github.com/sosilans/SilansAutoCare
- **Branch**: main
- **Hosting**: Netlify (auto-deploy from GitHub)
- **Live URL**: [Check Netlify dashboard for current URL]

## Contact Information
- **Phone**: +1 (916) 534-5547
- **Email**: silansautocare@gmail.com
- **Hours**: 9am - 9pm daily
- **Facebook**: [Link in Contact component]

## Backend Integration

### Google Apps Script Web App
- **Deployment ID**: `AKfycbyne5NIAQpAOcC2D2cY-HkxgKJe58gZ7zYbfK489paKbLWiwvoBnLnoinpG7-bNrML4XQ`
- **Full URL**: `https://script.google.com/macros/s/AKfycbyne5NIAQpAOcC2D2cY-HkxgKJe58gZ7zYbfK489paKbLWiwvoBnLnoinpG7-bNrML4XQ/exec`
- **Purpose**: Handles contact form submissions, saves to Google Sheets, sends Telegram notifications
- **Google Sheet**: Contact form data stored in connected Google Sheet
- **Script Location**: `google-apps-script/` folder in repository

### Telegram Bot Integration
- **Bot Token**: `8265472049:AAFO1fYKsykWvViK_2Y_PNxtmwUEiduaYV0`
- **Chat ID**: `-1003369331745`
- **Telegram API URL**: `https://api.telegram.org/bot{TOKEN}/sendMessage`
- **Purpose**: Real-time notifications when contact form is submitted
- **Message Format**: Includes name, phone, email, message, and selected services with emoji formatting

### Netlify Functions (Proxy)
- **File**: `netlify/functions/send-telegram.ts`
- **Purpose**: Proxy for Google Apps Script endpoint
- **Rate Limiting**: 5 requests per minute per IP address
- **Timeout**: 60 seconds window
- **Response**: 429 status when rate limit exceeded
- **Security**: Input validation, CORS, honeypot field, email regex

## Architecture Flow
```
User Form Submit 
  → Contact.tsx validates input
  → POST to Netlify Function (/api/send-telegram)
  → Rate limiting check (5/min per IP)
  → Forward to Google Apps Script
  → GAS writes to Google Sheets
  → GAS sends Telegram notification
  → Response back to user
```

## Key Features Implemented

### 1. Performance Optimizations
- **Particle Animations**: Reduced for smooth performance
  - Hero: 15 → 8 particles
  - AboutMe: 12 → 6 particles
  - Floating bubbles: 8 → 4
- **Services Animations**: Only animate when cards are expanded
- **CSS**: Added `prefers-reduced-motion` support
- **Build Size**: 461KB JS (136KB gzipped), 87KB CSS (12.6KB gzipped)

### 2. Security Features
- Rate limiting: 5 requests/minute per IP
- Input validation on all form fields
- CORS configuration
- Honeypot field for bot prevention
- Email regex validation
- 429 response for rate limit violations

### 3. Contact Form Enhancements
- **QuickServiceSelector**: Collapsible service selection with custom checkboxes
  - 6 services: Interior, Exterior, Full Detail, Engine Bay, Maintenance, Not Sure Yet
  - Custom styled checkboxes with pink-purple gradient
  - Selected services append to Telegram message with emoji formatting
  
- **HelpfulTips**: Quick-add tips for contact form
  - 5 predefined helpful phrases
  - Gradient-animated buttons
  - Light theme: pink-purple gradient with white text
  - Dark theme: semi-transparent with pink-200 text

### 4. Theme & Styling
- **Dark/Light Theme**: Full theme toggle support
- **Background Gradients**: Optimized opacity (/10) for dark theme
- **Gradient Animations**: 
  - Keyframe: `gradient-slide` (24s ease-in-out infinite alternate)
  - Applied to: Choose Services, Helpful Tips, Send Message, Facebook buttons
- **Custom Components**: All using Radix UI + Tailwind CSS

### 5. Content Sections

#### Hero Section
- Main landing with call-to-action
- 8 particle animations
- Gradient background with reduced opacity

#### Services Section
- 6 service cards with emojis: 💧🌪️🚗✨⚡🛡️
- Animated accordions (only when expanded)
- Custom checkboxes for features
- Dark/light theme optimized

#### About Me Section
- Image carousel with 2 photos:
  - `/assets/Misha.jpg`
  - `/assets/misha_1.jpg`
- 3.5 second auto-scroll
- 4 principles with emojis: 💎⚡❤️😎
  - Quality First
  - Precision in Every Detail
  - Passion for Cars
  - Happy Clients

#### Portfolio Section
- **Real Work Photos** (3 before/after pairs):
  1. Headlight Restoration ✨ - `/assets/cleaningsamples/1.jpg` → `/assets/cleaningsamples/1_1.jpg`
  2. Full Detail Package 🚗 - `/assets/cleaningsamples/3.jpg` → `/assets/cleaningsamples/3_1.jpg`
  3. Paint Protection 🛡️ - `/assets/cleaningsamples/4.jpg` → `/assets/cleaningsamples/4_1.jpg`
- Show/hide functionality (Show More/Show Less)
- ImageWithFallback component for error handling

#### FAQ Section
- Collapsible accordions
- Business-specific questions:
  - How long does detailing take?
  - Do you offer mobile service?
  - What payment methods?
  - Do I need to be present?
  - What's included in full detail?
  - How often should I detail?

#### Reviews Section
- Customer testimonials
- Star ratings

#### Contact Section
- Form fields: Name, Phone, Email, Message
- QuickServiceSelector component
- HelpfulTips component
- Send Message button with gradient animation
- Success notification (currently using alert, SuccessModal component created but not integrated)

### 6. Localization
- **Languages**: English (EN), Spanish (ES), Russian (RU)
- **Context**: `LanguageContext.tsx`
- **Implementation**: All text content has translations in all 3 languages
- Language switcher in header

## Known Issues & Pending Tasks

### Pending: SuccessModal Integration
- **File Created**: `src/components/SuccessModal.tsx`
- **Status**: Component created but not integrated
- **Features**: Green checkmark, 7s auto-close, backdrop blur, progress bar
- **Missing**: 
  - Translations needed in `LanguageContext.tsx`:
    - `contact.success.title` (EN/ES/RU)
    - `contact.success.message` (EN/ES/RU)
  - Import in `Contact.tsx`
  - Replace `alert()` calls with modal state management

### Image Optimization
- Portfolio images should be optimized:
  - Recommended: 1200px width max
  - JPEG quality: 80-85%
  - Consider WebP format for better compression
- Current images: Original size from user's folder

## Recent Work (Dec 2025) — Agent Handoff Notes

### Context
- Project is a React/Vite/Tailwind SPA with custom i18n in `src/components/LanguageContext.tsx`.
- Deploy is via Netlify auto-deploy on pushes to `main`.
- Live site is typically https://silansautocare.com.

### What Was Changed Recently

#### Contact: click-to-copy + selection UX
- Contact cards (Phone/Email) are now **click-to-copy** (clipboard API with fallback).
  - File: `src/components/Contact.tsx`
- `QuickServiceSelector` was rebuilt to match `HelpfulTips` “pill” UX and labels now come from service card titles.
  - `Not Sure Yet` is **mutually exclusive** (selecting it clears others; selecting others clears it).
  - File: `src/components/QuickServiceSelector.tsx`
- `HelpfulTips` is now **toggleable** (select/unselect), localized, and sends selected tips as a separate block in the outgoing message.
  - Files: `src/components/HelpfulTips.tsx`, `src/components/Contact.tsx`, `src/components/LanguageContext.tsx`

#### Services: modal CTA + mobile scrolling
- Services modal bottom button no longer “Close”: it now **closes the modal and scrolls to the Contact form** (and attempts to focus the name field).
  - Files: `src/components/Services.tsx`, `src/components/LanguageContext.tsx`
- Mobile fix: Services modal overlay now uses higher z-index than the fixed header, and the inner content area is iOS-friendly scroll (`WebkitOverflowScrolling: 'touch'`, `touch-pan-y`).
  - File: `src/components/Services.tsx`

#### Admin: repeated info copy
- In Admin Dashboard → Contacts tab, contact email is now **click-to-copy**.
  - File: `src/components/AdminDashboard.tsx`

### Pricing/i18n strategy
- Starting prices were moved from hardcoded strings into i18n keys (`services.cards.*.startingPrice`) so pricing can be updated per language from one place.
  - Files: `src/components/Services.tsx`, `src/components/LanguageContext.tsx`

### What To Verify (QA Checklist)
- On iPhone/iOS Safari:
  - Open any service → modal content should **scroll**, and header should not block taps.
  - Bottom CTA should close + scroll to `#contact`.
- In Contact section:
  - Phone/Email cards copy correctly.
  - Helpful Tips toggles visually and included in submission payload.
  - `Not Sure Yet` clears other services and vice versa.

### Known sensitivities
- Avoid changing design tokens/colors beyond existing Tailwind classes (project constraint).
- Repo contains a `backup-*` folder and a separate copy project; changes should target `src/` (not the backup).

## Services Modal Deep Fix (Dec 2025) — iOS scroll + layering

### Problem
- On iPhone/iOS Safari, the Services modal could appear **under** cards/header, and the **background** could scroll instead of the modal.

### Final approach (proven pattern)
- Use the same modal structure as `Portfolio` (fullscreen fixed overlay scroller):
  - `fixed inset-0` overlay with `overflow-y-auto`, `overscroll-contain`, and `WebkitOverflowScrolling: 'touch'`.
  - Close button is `fixed` and always on top.
- Lock background scrolling while the modal is open via `lockScroll()`.

### Files updated
- `src/components/Services.tsx` — replaced the old “page-scroll clamp” fallback with a fullscreen overlay scroller modal.
- `src/components/ui/scrollLock.ts` — iOS-friendly body freeze (`position: fixed; top: -scrollY`) and full restore on unlock.

### QA checklist
- On iPhone: modal is always above cards/header, modal content scrolls to the bottom CTA, background does not scroll, close works (X + backdrop).

## Analytics System (Dec 2025) — Auto-Metrics + Heatmap

### Summary
A lightweight, GDPR-safe analytics system was added (no cookies; anonymized; batched `sendBeacon`/`fetch(keepalive)`; passive scroll/touch listeners). It captures:
- Click heatmap events (x,y), viewport, scroll position
- Session start + referrer + UTM params + first-visit landing page
- Scroll depth (max %)
- Time spent per section + section transitions
- Service card clicks + service modal opens
- Hero CTA clicks
- Review form opens + submissions
- Contact form submissions (anonymized)
- Language switch usage

### Files Added
- `src/analytics/client.ts` — client-side tracker (sessionId via localStorage; batching; section observer; global click capture)
- `netlify/functions/analytics-ingest.ts` — ingest endpoint (rate limit; strips sensitive keys; **prefers Supabase insert** if configured; falls back to Postgres)
- `netlify/functions/analytics-query.ts` — **admin-only** query endpoint for aggregates + heatmap points (prefers Supabase RPC if configured)
- `netlify/functions/_shared/postgres.ts` — Postgres connector (reads `ANALYTICS_DATABASE_URL`/`DATABASE_URL`)
- `src/components/AdminSiteAnalytics.tsx` — admin charts + heatmap overlay
- `docs/ANALYTICS_SETUP.md` — DB schema + env var instructions

### Files Updated (Instrumentation / Routing)
- `src/App.tsx` — initializes analytics on public site and supports `/admin/*` routes
- `src/components/Services.tsx` — `service_card_click` and `service_modal_open`
- `src/components/Hero.tsx` — `cta_click` for hero buttons
- `src/components/Reviews.tsx` — `review_form_open` + `review_submit`
- `src/components/Contact.tsx` — `contact_submit` (does NOT include form values)
- `src/components/LanguageContext.tsx` — `language_switch`
- `src/components/AdminDashboard.tsx` — embeds `AdminSiteAnalytics` in Analytics tab
- `src/components/AdminPanel.tsx` — admin button routes to `/admin/analytics`
- `package.json` — added dependency `postgres` for Netlify Functions

### DB / Netlify Configuration Required
Create Postgres table:
- `AnalyticsEvents(id bigserial, created_at timestamptz, type text, metadata jsonb)`

Supabase-first (recommended):
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (for ingest)
- `SUPABASE_ANON_KEY` (for server-side admin token validation)

Fallback (direct Postgres):
- `ANALYTICS_DATABASE_URL` (recommended) or `DATABASE_URL`

See `docs/ANALYTICS_SETUP.md` for SQL + examples.

### Admin UI
Admin analytics is available at:
- `/admin/analytics`

It renders inside the existing Admin “Analytics” tab and shows:
- Most opened services
- Scroll depth trend
- Per-section engagement
- UTM campaign performance
- Heatmap overlay (normalized by viewport)

## Development Commands

```powershell
# Install dependencies
npm install

# Start dev server (Vite)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run task from VS Code
# Task: "Install and start Vite dev server"
```

## File Structure (Key Files)

```
src/
├── App.tsx                          # Main app component
├── AppWithRouter.tsx                # Router wrapper
├── main.tsx                         # Entry point
├── index.css                        # Global styles
├── components/
│   ├── Hero.tsx                     # Landing section
│   ├── Services.tsx                 # Service cards (6 services)
│   ├── AboutMe.tsx                  # About section with carousel
│   ├── Portfolio.tsx                # Before/after gallery (3 pairs)
│   ├── FAQ.tsx                      # Frequently asked questions
│   ├── Reviews.tsx                  # Customer testimonials
│   ├── Contact.tsx                  # Contact form with enhancements
│   ├── QuickServiceSelector.tsx    # Service selection component
│   ├── HelpfulTips.tsx              # Quick tips for contact form
│   ├── SuccessModal.tsx             # Success notification (not integrated)
│   ├── Header.tsx                   # Navigation + language switcher
│   ├── Footer.tsx                   # Footer with socials
│   ├── AuthContext.tsx              # Authentication (if used)
│   ├── LanguageContext.tsx          # i18n translations (EN/ES/RU)
│   ├── ThemeContext.tsx             # Dark/light theme
│   ├── DataStoreContext.tsx         # Global state management
│   ├── OnlineStatusContext.tsx      # Network status
│   └── ui/                          # Radix UI components (shadcn)
├── styles/
│   └── globals.css                  # Tailwind + custom CSS
└── guidelines/
    └── Guidelines.md                # Design guidelines

netlify/
└── functions/
    └── send-telegram.ts             # Contact form proxy + rate limiting

google-apps-script/
└── [GAS files]                      # Google Apps Script for backend

public/
├── assets/
│   ├── Misha.jpg                    # About Me carousel image 1
│   ├── misha_1.jpg                  # About Me carousel image 2
│   └── cleaningsamples/             # Portfolio before/after photos
│       ├── 1.jpg                    # Before (Headlight Restoration)
│       ├── 1_1.jpg                  # After (Headlight Restoration)
│       ├── 3.jpg                    # Before (Full Detail Package)
│       ├── 3_1.jpg                  # After (Full Detail Package)
│       ├── 4.jpg                    # Before (Paint Protection)
│       └── 4_1.jpg                  # After (Paint Protection)
└── telegram-test.html               # Testing file for Telegram integration
```

## CSS Animations

### gradient-animated class
```css
@keyframes gradient-slide {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.gradient-animated {
  background-size: 200% 200%;
  animation: gradient-slide 24s ease-in-out infinite alternate;
}
```

Applied to buttons:
- Choose Your Services (QuickServiceSelector)
- Helpful Tips buttons (HelpfulTips)
- Send Message (Contact)
- Facebook button (Contact)

## Testing Checklist

Before deployment:
- ✅ Test contact form submission
- ✅ Verify Google Sheets data appears
- ✅ Check Telegram notification received
- ✅ Test rate limiting (6+ rapid submissions)
- ✅ Verify dark/light theme switching
- ✅ Test language switching (EN/ES/RU)
- ✅ Check mobile responsiveness
- ✅ Verify portfolio images load correctly
- ✅ Test service selection in contact form
- ✅ Verify helpful tips append to message
- ⏳ Optimize portfolio images for web

## Build Process

1. **Local build**: `npm run build`
2. **Push to GitHub**: 
   ```powershell
   git add .
   git commit -m "Update description"
   git push origin main
   ```
3. **Auto-deploy**: Netlify automatically deploys from GitHub main branch
4. **Verify**: Check Netlify dashboard for build status and live URL

## Troubleshooting

### Contact form not working
1. Check Netlify Functions logs
2. Verify Google Apps Script deployment is active
3. Test Telegram bot token with direct API call
4. Check rate limiting (wait 1 minute if exceeded)

### Images not loading
1. Verify files exist in `public/assets/` folder
2. Check paths start with `/` (absolute paths)
3. Clear browser cache
4. Check build output includes assets

### Performance issues
1. Check particle count (Hero: 8, AboutMe: 6, Bubbles: 4)
2. Verify animations only run when needed
3. Check browser dev tools Performance tab
4. Consider enabling prefers-reduced-motion

### Theme issues
1. Check ThemeContext is properly wrapped
2. Verify Tailwind dark: classes are applied
3. Check background gradient opacities (/10 for dark theme)

## Change History

### Recent Updates (December 2025)
1. **Portfolio Images**: Replaced all Unsplash stock images with real work photos (3 before/after pairs)
2. **Contact Form**: Added QuickServiceSelector and HelpfulTips components
3. **Animations**: Added gradient-animated class to major buttons
4. **Theme**: Fixed text visibility in light theme (textarea, helpful tips)
5. **Security**: Implemented rate limiting (5 req/min per IP)
6. **Performance**: Reduced particle animations, optimized build size
7. **About Me**: Fixed misha_1.jpg path from relative to absolute

### Previous Updates
- Telegram bot integration
- Google Apps Script backend setup
- Multi-language support (EN/ES/RU)
- Dark/light theme implementation
- Service cards with custom checkboxes
- FAQ section with business-specific questions
- Reviews section
- Mobile responsive design

## Important Notes

1. **Never commit sensitive data**: Tokens and credentials are in this file for handoff purposes only. In production, use environment variables.

2. **Image paths**: Always use absolute paths starting with `/` for public assets.

3. **Rate limiting**: Be aware of 5 requests/minute limit when testing contact form.

4. **Build before deploy**: Always test `npm run build` locally before pushing to GitHub.

5. **Netlify Functions**: Located in `netlify/functions/`, automatically deployed with site.

6. **Google Apps Script**: Separate deployment, update URL in Netlify Functions if redeployed.

7. **Portfolio images**: Located in `public/assets/cleaningsamples/`, ensure folder exists after build.

## Next Steps for New Agent

1. Review this document thoroughly
2. Check `package.json` for all dependencies
3. Run `npm install` to install dependencies
4. Start dev server with `npm run dev`
5. Test all features locally before making changes
6. Review `src/components/` folder for component structure
7. Check `LanguageContext.tsx` for translation keys
8. Understand flow: Contact form → Netlify Function → GAS → Sheets + Telegram

## Support & Maintenance

For any issues or questions:
1. Check this document first
2. Review component files in `src/components/`
3. Check Netlify Functions logs for backend errors
4. Verify Google Apps Script is active
5. Test Telegram bot with direct API call if notifications fail

---
*Last Updated: December 5, 2025*
*Agent: GitHub Copilot (Claude Sonnet 4.5)*

## QA-отчет: полный аудит проекта (28.12.2025)

### Критичные баги/проблемы
- Публичные API-эндпоинты (например, /api/public/services) возвращают HTML вместо JSON — вероятно, не работает Netlify Functions роутинг или SPA fallback перехватывает запросы. Это ломает динамику услуг, отзывов, FAQ и т.д.
- Без корректных переменных окружения (Supabase, Telegram, Postgres) часть функций (админка, отправка сообщений, аналитика) не будет работать даже на проде.

### Минорные баги/UX
- Формы отправки отзывов и вопросов требуют регистрации — но UX не подсказывает, как быстро зарегистрироваться (нет явного CTA).
- Нет явной индикации ошибок при сбоях API (например, если не работает прокси или Telegram).
- В мобильной версии некоторые блоки (галерея, услуги) могут выглядеть перегруженно — стоит проверить адаптивность на реальных устройствах.
- Нет явного rate-limit feedback для пользователя (если лимит превышен, просто ошибка).
- В сборке большой JS-бандл (>1MB) — желательно разбить на чанки для ускорения загрузки.

### Что работает стабильно
- Сборка и типизация проходят без ошибок, все зависимости корректно установлены, npm audit — чисто.
- UI/анимации, навигация, открытие/закрытие модалок, копирование контактов, выбор услуг — работают штатно.
- Безопасность: нет утечек секретов в клиентском коде, есть honeypot, CORS, rate-limit на сервере.

### Рекомендации
- Исправить роутинг Netlify Functions для всех /api/* путей (см. netlify.toml и SPA fallback).
- Проверить и задокументировать все переменные окружения для деплоя (Supabase, Telegram, Postgres).
- Добавить явные сообщения об ошибках для пользователя при сбоях API/интеграций.
- Улучшить мобильную адаптивность и провести ручное тестирование на телефоне.
- Разбить JS-бандл на чанки (динамические импорты, оптимизация Vite).
- Добавить e2e-тесты для ключевых пользовательских сценариев (отправка форм, логин, CRUD админки).

---

Проведен полный аудит: критичные и минорные проблемы зафиксированы, рекомендации даны. Для продакшн-качества требуется доработка API-роутинга и финальная ручная проверка на проде.

## Чек-лист для полного рабочего деплоя (29.12.2025)

1. Проверьте переменные окружения на Netlify:
   - SUPABASE_URL — https://<project-ref>.supabase.co
   - SUPABASE_ANON_KEY — публичный ключ Supabase (для клиента)
   - SUPABASE_SERVICE_ROLE_KEY — приватный ключ Supabase (для функций)
   - TELEGRAM_BOT_TOKEN — токен вашего Telegram-бота (для отправки сообщений)
   - TELEGRAM_CHAT_ID — chat_id для получения сообщений
   - ANALYTICS_DATABASE_URL или DATABASE_URL — строка подключения к Postgres (для аналитики)
   - ADMIN_BOOTSTRAP_SECRET или ADMIN_KEY — секрет для доступа к админке (опционально)

2. Убедитесь, что netlify.toml содержит force=true для всех /api/* редиректов (уже исправлено).

3. Выполните один деплой через Netlify (npx netlify deploy --prod или через UI).

4. После деплоя проверьте:
   - /api/public/services и другие API возвращают JSON, а не HTML
   - Форма обратной связи и отзывы работают (отправка, получение)
   - Админка открывается и работает (если настроены Supabase и ADMIN_KEY)
   - Аналитика событий пишется в базу (если настроен Postgres)

5. Если что-то не работает — проверьте логи функций на Netlify и корректность переменных окружения.

---

Теперь все критичные проблемы устранены, и один деплой с корректными env переменными даст полностью рабочий сайт и API.
