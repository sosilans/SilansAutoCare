# Инструкция по настройке Google Apps Script прокси

## Шаг 1: Создать Google Таблицу

1. Открой https://sheets.google.com
2. Создай новую таблицу: **+ Создать** → **Google Таблицы**
3. Назови её, например: "Silans Auto Care — Контакты"
4. Скопируй **ID таблицы** из URL:
   ```
   https://docs.google.com/spreadsheets/d/1ABC123XYZ456DEF789/edit
                                        ^^^^^^^^^^^^^^^^^^^ это ID
   ```
   Пример ID: `1ABC123XYZ456DEF789`

## Шаг 2: Создать Apps Script проект

1. Открой https://script.google.com
2. Нажми **+ Новый проект**
3. Удали дефолтный код
4. Скопируй весь код из файла `telegram-proxy.gs` (в этой папке)
5. Вставь в редактор
6. Нажми **💾 Сохранить** (или Ctrl+S), назови проект: "Silans Contact Proxy"

## Шаг 3: Настроить Script Properties (секреты)

1. В редакторе Apps Script:
   - Нажми **⚙️ Project Settings** (слева внизу)
   - Прокрути до **Script Properties**
   - Нажми **Add script property**

2. Добавь **обязательное** свойство:
   - **Property:** `SPREADSHEET_ID`
   - **Value:** `<твой ID таблицы из шага 1>`
   
3. (Опционально) Добавь Telegram свойства для уведомлений:
   - **Property:** `TELEGRAM_BOT_TOKEN`  
     **Value:** `<токен от @BotFather>`
   
   - **Property:** `TELEGRAM_CHAT_ID`  
     **Value:** `-1003369331745` (или твой chat ID)

4. Нажми **Save script properties**

## Шаг 4: Deploy Web App

1. В редакторе Apps Script:
   - Нажми **Deploy** → **New deployment**
   - Нажми **⚙️ Select type** → выбери **Web app**
   
2. Заполни настройки:
   - **Description:** `v1 - Sheets + Telegram`
   - **Execute as:** `Me (<твоя почта>)`
   - **Who has access:** `Anyone`
   
3. Нажми **Deploy**

4. Разреши доступ:
   - Появится окно авторизации → **Review permissions**
   - Выбери свой Google аккаунт
   - Нажми **Advanced** → **Go to Silans Contact Proxy (unsafe)**
   - Нажми **Allow**

5. **Скопируй Web App URL** (заканчивается на `/exec`)
   ```
   https://script.google.com/macros/s/AKfycbz.../exec
   ```

## Шаг 5: Подключить к сайту

1. Открой файл `src/config.ts` в проекте
2. Вставь скопированный URL:
   ```typescript
   export const TELEGRAM_PROXY_URL = 'https://script.google.com/macros/s/AKfycbz.../exec';
   ```
3. Сохрани файл

## Шаг 6: Проверка

### Тест 1: Health check
```powershell
Invoke-WebRequest -Uri "https://script.google.com/macros/s/AKfycbz.../exec" -UseBasicParsing | Select-Object Content | Format-List
```
Ожидаемо:
```json
{
  "ok": true,
  "configured": true,
  "spreadsheetIdPresent": true,
  "telegramEnabled": true
}
```

### Тест 2: Отправка контакта
```powershell
$body = @{ name = "Test User"; email = "test@example.com"; phone = "+1234567890"; message = "Hello from test"; debug = 1 } | ConvertTo-Json -Depth 5
Invoke-WebRequest -Uri "https://script.google.com/macros/s/AKfycbz.../exec" -Method POST -ContentType "application/json" -Body $body -UseBasicParsing | Select-Object StatusCode,Content | Format-List
```
Ожидаемо:
```json
{
  "success": true,
  "savedToSheet": true,
  "sentToTelegram": true
}
```

### Проверь результат:
- Открой Google Таблицу — должна появиться строка с данными
- Проверь Telegram группу — должно прийти сообщение (если настроен)

## Шаг 7: Deploy сайта

1. Закоммить изменения:
   ```powershell
   git add .
   git commit -m "feat: add Google Sheets contact logging via GAS proxy"
   git push origin main
   ```

2. Netlify автоматически задеплоит сайт

3. Проверь форму на сайте:
   - Открой https://silansautocare.com
   - Заполни форму "Let's Get Started"
   - Отправь
   - Проверь Google Таблицу и Telegram

## Troubleshooting

### Ошибка: "SPREADSHEET_ID required"
- Проверь, что добавил Script Property `SPREADSHEET_ID`
- Проверь, что сделал **Redeploy** Web App после добавления свойства

### Ошибка: "Failed to save to Google Sheets"
- Проверь, что ID таблицы правильный (без лишних символов)
- Убедись, что скрипт запускается от твоего имени (Execute as: Me)
- Дай права доступа при авторизации

### Telegram не работает, но Sheets работает
- Это нормально — Telegram опциональный
- Проверь `TELEGRAM_BOT_TOKEN` и `TELEGRAM_CHAT_ID` в Script Properties
- Убедись, что бот добавлен в группу и имеет права отправлять сообщения

### Форма на сайте не отправляет
- Проверь Developer Tools (F12) → Console → есть ли ошибки
- Проверь, что `src/config.ts` содержит правильный URL прокси
- Убедись, что сделал `git push` и Netlify задеплоил изменения

## Полезные ссылки

- [Google Apps Script Documentation](https://developers.google.com/apps-script)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- Твоя таблица: https://docs.google.com/spreadsheets/d/ТВОЙ_ID/edit
- Твой скрипт: https://script.google.com (проекты)
