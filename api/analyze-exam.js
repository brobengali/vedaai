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

    // Models to try in order (primary → fallback)
    const MODELS = (process.env.GEMINI_MODEL)
      ? [process.env.GEMINI_MODEL]
      : ['gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-3.5-flash-lite'];

    // Ensure request body is properly parsed
    const bodyData = typeof req.body === 'string'
      ? req.body
      : JSON.stringify(req.body);

    let response;
    let data;
    let MODEL_NAME;

    // Try each model until one succeeds
    for (const model of MODELS) {
      MODEL_NAME = model;
      const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

      response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: bodyData,
      });

      data = await response.json();

      if (response.ok) break; // Success — stop trying

      // Only fallback on capacity/not-found errors
      const status = response.status;
      if (status === 429 || status === 500 || status === 503 || status === 404) {
        console.log(`Model ${model} failed (${status}), trying next...`);
        continue;
      }
      break; // For auth or other errors, don't retry with a different model
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