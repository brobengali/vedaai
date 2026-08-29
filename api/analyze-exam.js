export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Validate API key
    const GEMINI_API_KEY = (process.env.GEMINI_API_KEY || '').trim();
    if (!GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not set');
      return res.status(500).json({
        error: 'Server configuration error: GEMINI_API_KEY is missing'
      });
    }

    // Get model name with fallback
    const MODEL_NAME = process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp';

    // Ensure request body is properly parsed
    const bodyData = typeof req.body === 'string'
      ? req.body
      : JSON.stringify(req.body);

    // Build the API URL with the key in query parameter (recommended approach)
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`;

    // First attempt with API key in URL
    let response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: bodyData,
    });

    let data = await response.json();

    // If first attempt fails with authentication error, try Bearer token approach
    if (!response.ok && data?.error?.message?.includes('not valid')) {
      console.log('Trying alternative authentication method...');

      const ALT_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent`;

      response = await fetch(ALT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GEMINI_API_KEY}`,
        },
        body: bodyData,
      });

      const altData = await response.json();

      if (response.ok) {
        data = altData;
      } else {
        // If both attempts fail, use the second response for error reporting
        data = altData;
      }
    }

    // Handle API errors
    if (!response.ok) {
      const errorMessage = data?.error?.message || 'Unknown error';
      console.error(`Google API Error (${response.status}):`, errorMessage);

      // Provide user-friendly error messages
      if (response.status === 403 || response.status === 401) {
        return res.status(response.status).json({
          error: 'Authentication failed. Please check your GEMINI_API_KEY.',
          details: errorMessage
        });
      } else if (response.status === 429) {
        return res.status(response.status).json({
          error: 'Rate limit exceeded. Please try again later.',
          details: errorMessage
        });
      } else if (response.status === 404) {
        return res.status(response.status).json({
          error: `Model '${MODEL_NAME}' not found. Check GEMINI_MODEL environment variable.`,
          details: errorMessage
        });
      }

      return res.status(response.status).json({
        error: `Google API Error (${response.status})`,
        details: errorMessage
      });
    }

    // Success
    return res.status(200).json(data);

  } catch (error) {
    console.error('Vercel Serverless Function Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message || 'An unexpected error occurred'
    });
  }
}