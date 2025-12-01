import { Handler } from '@netlify/functions';

interface ContactData {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

const handler: Handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse the contact form data
    const data: ContactData = JSON.parse(event.body || '{}');

    // Validate required fields
    if (!data.name || !data.email || !data.message) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    // Get Telegram credentials from environment variables
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      console.error('Telegram credentials not configured');
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Telegram not configured' })
      };
    }

    // Format the message for Telegram
    const telegramMessage = `
🔔 *New Contact Form Submission*

👤 *Name:* ${data.name}
📧 *Email:* ${data.email}
${data.phone ? `📱 *Phone:* ${data.phone}\n` : ''}
💬 *Message:*
${data.message}

⏰ *Time:* ${new Date().toLocaleString('en-US', { timeZone: 'Europe/Moscow' })}
    `.trim();

    // Send message to Telegram
    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: telegramMessage,
          parse_mode: 'Markdown',
        }),
      }
    );

    const result = await telegramResponse.json();

    if (!telegramResponse.ok) {
      console.error('Telegram API error:', result);
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: 'Failed to send Telegram message',
          details: result
        })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true,
        message: 'Message sent to Telegram successfully'
      })
    };

  } catch (error) {
    console.error('Error in send-telegram function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};

export { handler };
