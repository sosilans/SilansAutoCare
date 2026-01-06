# Админка — быстрый гайд по отдельному деплою на Netlify

Это репозиторий админ‑панели (Vite + React). Инструкция ниже шаг за шагом описывает, как задеплоить админку как отдельный проект на Netlify, чтобы держать публичный сайт в другом репо.

Ключевые моменты
- Сборка: `npm run build` (Vite). Публикуется папка `build`.
- SPA fallback и редиректы уже настроены в `netlify.toml`.
- Серверные функции находятся в `netlify/functions` и используют секреты `SUPABASE_SERVICE_ROLE_KEY` и т.д.

Шаги для деплоя (коротко)
1. На Netlify: New site → Import from Git → выберите этот репозиторий.
2. В Build settings установите:
   - Build command: `npm run build`
   - Publish directory: `build`
   - Functions directory: `netlify/functions`
   - Install command (рекомендация): `npm ci` (если есть `package-lock.json`)
3. В Netlify → Site settings → Environment → Add variables (значения берите в Supabase Project → Settings → API):
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_ANON_KEY
   - SUPABASE_URL
   - SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY (секрет!)
   - OPTIONAL: ANALYTICS_DATABASE_URL / DATABASE_URL / POSTGRES_URL
4. В Supabase (Project → Authentication → URL Configuration) добавьте Redirect URLs:
   - https://<admin-site>.netlify.app/admin
   - https://<admin-site>.netlify.app/*
   или ваш кастомный домен `https://admin.<your-domain>.com/*`.
5. Деплой и проверка:
   - Откройте `https://<admin-site>.netlify.app/admin` — страница должна загрузиться.
   - Протестируйте логин через Supabase, сброс пароля и несколько admin API операций.
   - Если функции падают — посмотрите Netlify Functions → Function logs.

Полезные команды локально
```bash
# запустить dev
npm run dev

# собрать
npm run build

# прогнать тесты
npm run test

# проверить, что переменные окружения для Netlify установлены (локально)
npm run check-env
```

CI / Автодеплой (опционально)

В репо добавлен GitHub Actions workflow `.github/workflows/deploy-admin.yml`, который:
- запускает тесты (`npm run test`) и собирает (`npm run build`) на push в `main`.
- если в репозитории заданы Secrets `NETLIFY_AUTH_TOKEN` и `NETLIFY_SITE_ID`, автодеплой выполнится на Netlify (через `npx netlify-cli deploy --prod`).

Чтобы включить автодеплой через Actions:
1. В GitHub репо → Settings → Secrets and variables → Actions добавьте secrets:
   - `NETLIFY_AUTH_TOKEN` — личный токен Netlify с правами deploy
   - `NETLIFY_SITE_ID` — Site ID вашего Netlify сайта
2. Push в `main` или запустите workflow вручную (Actions → deploy-admin → Run workflow).

Если вы не хотите хранить Netlify токен в GitHub, просто оставьте секреты пустыми — workflow будет выполнять только тесты и сборку.

Что я добавил в репо
- `.github/workflows/deploy-admin.yml` — CI + optional Netlify deploy
- `scripts/check_netlify_env.js` — проверка env
- `package.json` script `check-env`

Если готовы, выполню деплой и проверю логи функций (нужен Netlify token или доступ). 

# Админка — быстрый гайд по отдельному деплою на Netlify

Это репозиторий админ‑панели (Vite + React). Инструкция ниже шаг за шагом описывает, как задеплоить админку как отдельный проект на Netlify, чтобы держать публичный сайт в другом репо.

Ключевые моменты
- Сборка: `npm run build` (Vite). Публикуется папка `build`.
- SPA fallback и редиректы уже настроены в `netlify.toml`.
- Серверные функции находятся в `netlify/functions` и используют секреты `SUPABASE_SERVICE_ROLE_KEY` и т.д.

Шаги для деплоя (коротко)
1. На Netlify: New site → Import from Git → выберите этот репозиторий.
2. В Build settings установите:
   - Build command: `npm run build`
   - Publish directory: `build`
   - Functions directory: `netlify/functions`
   - Install command (рекомендация): `npm ci` (если есть `package-lock.json`)
3. В Netlify → Site settings → Environment → Add variables (значения берите в Supabase Project → Settings → API):
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_ANON_KEY
   - SUPABASE_URL
   - SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY (секрет!)
   - OPTIONAL: ANALYTICS_DATABASE_URL / DATABASE_URL / POSTGRES_URL
4. В Supabase (Project → Authentication → URL Configuration) добавьте Redirect URLs:
   - https://<admin-site>.netlify.app/admin
   - https://<admin-site>.netlify.app/*
   или ваш кастомный домен `https://admin.<your-domain>.com/*`.
5. Деплой и проверка:
   - Откройте `https://<admin-site>.netlify.app/admin` — страница должна загрузиться.
   - Протестируйте логин через Supabase, сброс пароля и несколько admin API операций.
   - Если функции падают — посмотрите Netlify Functions → Function logs.

Полезные команды локально
```bash
# запустить dev
npm run dev

# собрать
npm run build

# прогнать тесты
npm run test

# проверить, что переменные окружения для Netlify установлены (локально)
npm run check-env
```

Что я добавил в репо
- `README_ADMIN_DEPLOY.md` (этот файл)
- `scripts/check_netlify_env.js` — простой скрипт, проверяющий наличие необходимых env‑переменных
- Обновлён `package.json` — добавлен script `check-env` (вызывает `node scripts/check_netlify_env.js`)

Если хотите — могу также создать файл `docs/netlify-setup.md` с более подробными снимками экрана, либо автоматически создать Netlify site через API (нужен Netlify token).

Если готовы, выполню деплой и проверю логи функций (нужен доступ к Netlify или секретные токены).
