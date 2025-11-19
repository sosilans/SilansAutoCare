# Silans Auto Care — локальный предпросмотр

Минимальный проект на Vite + React (TypeScript) для предпросмотра сайта с вашим компонентом.

## Как запустить (Windows PowerShell)

```powershell
# Один раз установить зависимости
npm install

# Запустить локальный сервер (http://localhost:5173)
npm run dev
```

Остановка сервера: в терминале нажмите Ctrl+C. В VS Code также можно запустить задачу "Install and start Vite dev server" через Terminal → Run Task.

## Структура
- `index.html` — точка входа, Tailwind подключён через CDN для быстрого старта
- `src/main.tsx` — инициализация React
- `src/App.tsx` — ваш компонент (адаптирован из `website design.txt`)
- `vite.config.ts`, `tsconfig.json`, `package.json` — конфигурация проекта

## Примечания
- Встроенные стили styled-jsx заменены на обычный `<style>` внутри компонента.
- Анимации реализованы через пакет `motion` (`import { motion } from 'motion/react'`).
- Для полноценной настройки Tailwind можно позже заменить CDN на конфиг постпроцессора.
