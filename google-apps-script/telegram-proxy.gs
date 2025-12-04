/**
 * Google Apps Script Web App для сохранения контактов с сайта в Google Таблицу + Telegram.
 * Deploy as Web App (Execute as: Me; Who has access: Anyone).
 * 
 * Script Properties:
 * - SPREADSHEET_ID (обязательно) - ID Google Таблицы для сохранения контактов
 * - TELEGRAM_BOT_TOKEN (опционально) - токен Telegram бота
 * - TELEGRAM_CHAT_ID (опционально) - ID чата для уведомлений
 * - RECAPTCHA_SECRET (опционально) - секретный ключ reCAPTCHA v3
 */

function doPost(e) {
  try {
    var props = PropertiesService.getScriptProperties();
    var SPREADSHEET_ID = props.getProperty('SPREADSHEET_ID');
    var TELEGRAM_BOT_TOKEN = props.getProperty('TELEGRAM_BOT_TOKEN');
    var TELEGRAM_CHAT_ID = props.getProperty('TELEGRAM_CHAT_ID');
    var RECAPTCHA_SECRET = props.getProperty('RECAPTCHA_SECRET');

    // Проверка наличия ID таблицы
    if (!SPREADSHEET_ID) {
      return ContentService.createTextOutput(JSON.stringify({
        error: 'SPREADSHEET_ID не настроен в Script Properties',
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var data = {};
    if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        // Fallback for form-encoded
        data = e.parameter || {};
      }
    }

    var name = (data.name || '').toString();
    var email = (data.email || '').toString();
    var phone = (data.phone || '').toString();
    var message = (data.message || '').toString();
    var website = (data.website || data.company || '').toString(); // honeypot
    var recaptchaToken = (data.recaptchaToken || '').toString();
    var debug = (data.debug === true || data.debug === '1');

    // Honeypot check (bots часто заполняют скрытые поля)
    if (website) {
      return ContentService.createTextOutput(JSON.stringify({
        error: 'Блокировано honeypot правилом',
        code: 403,
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Базовые валидации и ограничения
    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
    if (!emailRe.test(email)) {
      return ContentService.createTextOutput(JSON.stringify({
        error: 'Некорректный email',
        code: 400,
      })).setMimeType(ContentService.MimeType.JSON);
    }
    if (message.length < 10 || message.length > 2000) {
      return ContentService.createTextOutput(JSON.stringify({
        error: 'Сообщение должно быть 10–2000 символов',
        code: 400,
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Rate limit по email (60 секунд) + дедупликация контента (10 минут)
    var cache = CacheService.getScriptCache();
    var emailKey = 'rl:' + email.toLowerCase();
    if (cache.get(emailKey)) {
      return ContentService.createTextOutput(JSON.stringify({
        error: 'Слишком часто. Повтор через минуту',
        code: 429,
      })).setMimeType(ContentService.MimeType.JSON);
    }
    cache.put(emailKey, '1', 60);

    var hashInput = email.toLowerCase() + '|' + message.trim();
    var hashBytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, hashInput);
    var hash = Utilities.base64Encode(hashBytes);
    var dupeKey = 'dupe:' + hash;
    if (cache.get(dupeKey)) {
      return ContentService.createTextOutput(JSON.stringify({
        error: 'Дубликат заявки (10 мин)',
        code: 409,
      })).setMimeType(ContentService.MimeType.JSON);
    }
    cache.put(dupeKey, '1', 600);

    // reCAPTCHA v3 (опционально): если задан секрет, требуем валидный токен
    if (RECAPTCHA_SECRET) {
      if (!recaptchaToken) {
        return ContentService.createTextOutput(JSON.stringify({
          error: 'Требуется reCAPTCHA',
          code: 401,
        })).setMimeType(ContentService.MimeType.JSON);
      }
      try {
        var verifyResp = UrlFetchApp.fetch('https://www.google.com/recaptcha/api/siteverify', {
          method: 'post',
          payload: {
            secret: RECAPTCHA_SECRET,
            response: recaptchaToken,
          },
          muteHttpExceptions: true,
        });
        var vrOk = verifyResp.getResponseCode() >= 200 && verifyResp.getResponseCode() < 300;
        var vrBody = safeJson(verifyResp.getContentText());
        if (!vrOk || !vrBody.success || (vrBody.score && vrBody.score < 0.4)) {
          return ContentService.createTextOutput(JSON.stringify({
            error: 'Проверка reCAPTCHA не пройдена',
            code: 401,
            details: debug ? vrBody : undefined,
          })).setMimeType(ContentService.MimeType.JSON);
        }
      } catch (capErr) {
        return ContentService.createTextOutput(JSON.stringify({
          error: 'Ошибка проверки reCAPTCHA',
          code: 500,
          details: debug ? (capErr && capErr.message ? capErr.message : String(capErr)) : undefined,
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }

    if (!name || !email || !message) {
      return ContentService.createTextOutput(JSON.stringify({
        error: 'Не заполнены обязательные поля (name, email, message)',
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var tz = Session.getScriptTimeZone() || 'Europe/Moscow';
    var timestamp = Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd HH:mm:ss');

    // Сохранение в Google Таблицу
    try {
      var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
      var sheet = ss.getSheets()[0]; // Первый лист
      
      // Если таблица пустая, создаём заголовки
      if (sheet.getLastRow() === 0) {
        sheet.appendRow(['Дата и время', 'Имя', 'Email', 'Телефон', 'Сообщение']);
        sheet.getRange(1, 1, 1, 5).setFontWeight('bold').setBackground('#4285f4').setFontColor('#ffffff');
      }
      
      // Добавляем данные клиента
      sheet.appendRow([timestamp, name, email, phone, message]);
      
      // Отправка в Telegram (опционально)
      var telegramSent = false;
      if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
        try {
          var telegramMessage = '🚗 *Новая заявка с сайта!*\n\n' +
                                '👤 *Имя:* ' + name + '\n' +
                                '📧 *Email:* ' + email + '\n' +
                                (phone ? '📞 *Телефон:* ' + phone + '\n' : '') +
                                '💬 *Сообщение:* ' + message + '\n\n' +
                                '🕐 *Время:* ' + timestamp;
          
          var telegramUrl = 'https://api.telegram.org/bot' + TELEGRAM_BOT_TOKEN + '/sendMessage';
          var telegramPayload = {
            chat_id: TELEGRAM_CHAT_ID,
            text: telegramMessage,
            parse_mode: 'Markdown'
          };
          
          var telegramResponse = UrlFetchApp.fetch(telegramUrl, {
            method: 'post',
            contentType: 'application/json',
            payload: JSON.stringify(telegramPayload),
            muteHttpExceptions: true
          });
          
          var telegramResult = safeJson(telegramResponse.getContentText());
          telegramSent = telegramResult.ok === true;
        } catch (tgErr) {
          // Игнорируем ошибки Telegram, главное что в Sheets сохранили
        }
      }
      
      // Успешный ответ
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: 'Контакт успешно сохранён' + (telegramSent ? ' и отправлен в Telegram' : ''),
        timestamp: timestamp,
        telegramSent: telegramSent,
        input: debug ? { name: name, email: email, phone: phone, message: message } : undefined,
      })).setMimeType(ContentService.MimeType.JSON);
      
    } catch (sheetErr) {
      return ContentService.createTextOutput(JSON.stringify({
        error: 'Ошибка при сохранении в Google Таблицу',
        details: sheetErr && sheetErr.message ? sheetErr.message : String(sheetErr),
      })).setMimeType(ContentService.MimeType.JSON);
    }
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      error: 'Внутренняя ошибка сервера',
      details: err && err.message ? err.message : String(err),
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function safeJson(text) {
  try {
    return JSON.parse(text);
  } catch (e) {
    return { raw: text };
  }
}

// Health check - проверка статуса
function doGet(e) {
  var props = PropertiesService.getScriptProperties();
  var SPREADSHEET_ID_SET = !!props.getProperty('SPREADSHEET_ID');
  var TELEGRAM_BOT_TOKEN_SET = !!props.getProperty('TELEGRAM_BOT_TOKEN');
  var TELEGRAM_CHAT_ID_SET = !!props.getProperty('TELEGRAM_CHAT_ID');
  
  return ContentService.createTextOutput(JSON.stringify({
    ok: true,
    configured: SPREADSHEET_ID_SET,
    spreadsheetIdPresent: SPREADSHEET_ID_SET,
    telegramConfigured: TELEGRAM_BOT_TOKEN_SET && TELEGRAM_CHAT_ID_SET,
    note: 'POST с полями: name, email, message, phone (опционально), debug=1 (опционально)',
  })).setMimeType(ContentService.MimeType.JSON);
}
