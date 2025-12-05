# Telegram Bot Setup Instructions

## Шаг 1: Создать Telegram бота

1. Открой Telegram и найди [@BotFather](https://t.me/botfather)
2. Отправь команду `/newbot`
3. Следуй инструкциям (имя бота, username)
4. BotFather даст тебе **токен** - скопируй его (выглядит как `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

## Шаг 2: Получить Chat ID

### Вариант A: Через userinfobot
1. Найди [@userinfobot](https://t.me/userinfobot) в Telegram
2. Нажми Start
3. Бот пришлет твой **Chat ID** (число типа `123456789`)

### Вариант B: Через API
1. Напиши что-нибудь своему новому боту (нажми Start)
2. Открой в браузере: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
3. Найди `"chat":{"id":123456789}` - это твой Chat ID

## Шаг 3: Добавить в Netlify

1. Зайди на [Netlify Dashboard](https://app.netlify.com)
2. Открой свой проект `bucolic-mermaid-7d3bc4`
3. Перейди в **Site configuration → Environment variables**
4. Добавь две переменные:
   - **Key:** `TELEGRAM_BOT_TOKEN`  
     **Value:** `твой_токен_от_BotFather`
   
   - **Key:** `TELEGRAM_CHAT_ID`  
     **Value:** `твой_chat_id`

5. Сохрани и **Redeploy** сайт (Deploys → Trigger deploy → Deploy site)

## Шаг 4: Тестирование

1. После деплоя зайди на свой сайт
2. Заполни контактную форму
3. Твой бот должен прислать уведомление в Telegram!

## Формат сообщения

Бот будет присылать сообщения в таком виде:

```
🔔 New Contact Form Submission

👤 Name: Иван Иванов
📧 Email: ivan@example.com
📱 Phone: +7 999 123 45 67

💬 Message:
Хочу детейлинг для BMW

⏰ Time: 1/15/2025, 10:30:00 AM
```

## Troubleshooting

Если не работает:
1. Проверь, что переменные окружения сохранены в Netlify
2. Проверь, что сделал redeploy после добавления переменных
3. Открой DevTools (F12) → Console → попробуй отправить форму → смотри ошибки
4. Проверь, что написал боту хотя бы раз (нажал Start)

## Альтернатива: внешний прокси (Google Apps Script)

Если нет доступа к **Environment variables** на Netlify, можно использовать внешний прокси, где секреты хранятся в скрипте.

1. Открой https://script.google.com и создай новый проект Apps Script.
2. Вставь код из `google-apps-script/telegram-proxy.gs`.
3. В меню: Project Settings → Script properties → добавь:
  - `TELEGRAM_BOT_TOKEN` = твоё значение
  - `TELEGRAM_CHAT_ID` = твой chat id
4. Deploy → New deployment → Select type: Web app →
  - Execute as: Me
  - Who has access: Anyone
  Скопируй URL (оканчивается на `/exec`).
5. Настрой сайт использовать прокси:
  - Самый быстрый вариант: в `index.html` перед `<script type="module" src="/src/main.tsx"></script>` добавь:
    ```html
    <script>
     window.__TELEGRAM_PROXY_URL = 'https://script.google.com/macros/s/XXXX/exec';
    </script>
    ```
  - Форма `Contact.tsx` автоматически отправит запрос на этот URL, а если не задан, будет fallback на `/.netlify/functions/send-telegram`.

Проверка: отправь форму на сайте или выполни POST на URL прокси с JSON `{name,email,phone,message}`.

## Полезные ссылки

- [Telegram Bot API Documentation](https://core.telegram.org/bots/api)
- [Netlify Functions Documentation](https://docs.netlify.com/functions/overview/)
- [@BotFather](https://t.me/botfather)
- [@userinfobot](https://t.me/userinfobot)
