import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";

// Прокси для Google Apps Script (обходит CORS)
const GAS_ENDPOINT = 'https://script.google.com/macros/s/AKfycbyne5NIAQpAOcC2D2cY-HkxgKJe58gZ7zYbfK489paKbLWiwvoBnLnoinpG7-bNrML4XQ/exec';

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    };
  }

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: '',
    };
  }

  try {
    // Parse incoming request
    const body = event.body ? JSON.parse(event.body) : {};

    // Forward to Google Apps Script
    const response = await fetch(GAS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      redirect: 'follow', // Follow GAS redirects
    });

    const responseText = await response.text();
    let responseJson: any = {};
    
    try {
      responseJson = JSON.parse(responseText);
    } catch {
      // If response is not JSON, wrap it
      responseJson = { raw: responseText };
    }

    return {
      statusCode: response.status,
      body: JSON.stringify(responseJson),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    };
  } catch (error: any) {
    console.error('Proxy error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Proxy error',
        details: error?.message || String(error),
      }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    };
  }
};

export { handler };
