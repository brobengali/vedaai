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

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const GEMINI_API_KEY = (process.env.GEMINI_API_KEY || '').trim();
    if (!GEMINI_API_KEY) {
      return res.status(400).json({
        error: {
          message: "GEMINI_API_KEY environment variable is NOT set on Vercel. Please add GEMINI_API_KEY in Vercel Settings -> Environment Variables and redeploy."
        }
      });
    }

    const MODEL_NAME = process.env.GEMINI_MODEL || "gemini-3.5-flash";
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent`;

    const bodyData = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);

    let response;
    let data;

    // Retry up to 3 times for transient server errors (500, 503, 429)
    for (let attempt = 1; attempt <= 3; attempt++) {
      response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": GEMINI_API_KEY
        },
        body: bodyData
      });

      data = await response.json();

      if (response.ok) break;

      const status = response.status;
      if ((status === 500 || status === 503 || status === 429) && attempt < 3) {
        console.log(`Gemini returned ${status}, retrying (attempt ${attempt + 1}/3)...`);
        await new Promise(r => setTimeout(r, attempt * 2000));
        continue;
      }
      break;
    }

    if (!response.ok) {
      const keyPrefix = GEMINI_API_KEY.length > 8 ? GEMINI_API_KEY.substring(0, 8) + "..." : "INVALID_SHORT";
      const detailedMessage = `Google API Error (${response.status}): ${data?.error?.message || 'Unknown'}. [Key Used: ${keyPrefix}, Length: ${GEMINI_API_KEY.length}]`;
      console.error(detailedMessage);
      return res.status(response.status).json({
        error: {
          message: detailedMessage,
          details: data?.error,
          source: "google_api"
        }
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Vercel Serverless Function Error:", error);
    return res.status(500).json({ 
      error: { 
        message: `[VERCEL FUNCTION ERROR] ${error.message || "Internal server error"}`,
        source: "vercel_function"
      } 
    });
  }
}
