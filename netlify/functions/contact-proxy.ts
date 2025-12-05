import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";

// Прокси для Google Apps Script (обходит CORS)
const GAS_ENDPOINT = 'https://script.google.com/macros/s/AKfycbyne5NIAQpAOcC2D2cY-HkxgKJe58gZ7zYbfK489paKbLWiwvoBnLnoinpG7-bNrML4XQ/exec';

// Simple in-memory rate limiting (per IP, last 10 requests)
const requestCache = new Map<string, number[]>();
const RATE_LIMIT = 5; // max 5 requests per IP per minute
const RATE_WINDOW = 60000; // 1 minute in ms

const isRateLimited = (ip: string): boolean => {
  const now = Date.now();
  const requests = requestCache.get(ip) || [];
  const recentRequests = requests.filter(time => now - time < RATE_WINDOW);
  
  if (recentRequests.length >= RATE_LIMIT) {
    return true;
  }
  
  recentRequests.push(now);
  requestCache.set(ip, recentRequests);
  return false;
};

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  const clientIP = event.headers['client-ip'] || event.headers['x-forwarded-for'] || 'unknown';
  
  // Rate limiting check
  if (isRateLimited(clientIP)) {
    return {
      statusCode: 429,
      body: JSON.stringify({ error: 'Too many requests. Please try again later.' }),
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Retry-After': '60',
      },
    };
  }
  
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
