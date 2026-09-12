// ==========================================
// ZAK'S SPIDER — RECON PROXY SERVERLESS ENDPOINT (/api/proxy)
// Performs CORS-free target probing, HTTP header collection & body extraction on Node
// ==========================================

// Disable strict TLS validation for private pentest labs and self-signed certificates
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

export default async function handler(req: any, res: any) {
  // Allow CORS from any origin for private local pentesting
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  let targetUrl: string | undefined;

  if (req.method === 'GET') {
    targetUrl = req.query?.url;
  } else {
    targetUrl = req.body?.url || req.query?.url;
  }

  if (!targetUrl || typeof targetUrl !== 'string') {
    return res.status(400).json({ success: false, error: 'Missing target URL parameter (?url=...)' });
  }

  let raw = targetUrl.trim();

  // Intelligent protocol ordering
  const urlsToTry: string[] = [];
  if (raw.startsWith('http://')) {
    urlsToTry.push(raw);
    urlsToTry.push(raw.replace(/^http:\/\//, 'https://'));
  } else if (raw.startsWith('https://')) {
    urlsToTry.push(raw);
    urlsToTry.push(raw.replace(/^https:\/\//, 'http://'));
  } else {
    // Check if host/port looks like local development or plain HTTP
    const isLikelyHttp = /^(localhost|127\.|192\.168\.|10\.|0\.0\.0\.0)(:\d+)?/i.test(raw) ||
      /:(80|8080|8888|3000|5000|8000|5173|4200|8008)(\/|$)/.test(raw);

    if (isLikelyHttp) {
      urlsToTry.push('http://' + raw);
      urlsToTry.push('https://' + raw);
    } else {
      urlsToTry.push('https://' + raw);
      urlsToTry.push('http://' + raw);
    }
  }

  // Attempt fetch with automatic fallback
  const fetchWithFallback = async () => {
    let lastError: any = null;
    for (const u of urlsToTry) {
      try {
        const response = await fetch(u, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 ZaksSpider/2.0',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
          },
          redirect: 'follow',
          signal: AbortSignal.timeout(3000),
        });

        const headers: Record<string, string> = {};
        response.headers.forEach((val, key) => {
          headers[key.toLowerCase()] = val;
        });

        const body = await response.text();

        return {
          success: true,
          status: response.status,
          statusText: response.statusText,
          url: response.url || u,
          headers,
          body,
        };
      } catch (err: any) {
        lastError = err;
      }
    }

    throw lastError || new Error('Connection failed on both HTTPS and HTTP');
  };

  try {
    const result = await fetchWithFallback();
    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(502).json({
      success: false,
      error: error.message || 'Upstream connection failed',
      target: urlsToTry[0] || raw,
    });
  }
}
