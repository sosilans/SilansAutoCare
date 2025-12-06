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
