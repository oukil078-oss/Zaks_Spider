// ==========================================
// ZAK'S SPIDER — RECON PROXY SERVERLESS ENDPOINT (/api/proxy)
// Performs CORS-free target probing, HTTP header collection & body extraction on Node
// ==========================================

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
  if (!raw.startsWith('http://') && !raw.startsWith('https://')) {
    raw = 'https://' + raw;
  }

  // Attempt fetch with automatic fallback from HTTPS to HTTP if port 443 fails
  const fetchWithFallback = async (primaryUrl: string) => {
    const urlsToTry = [primaryUrl];
    if (primaryUrl.startsWith('https://')) {
      urlsToTry.push(primaryUrl.replace(/^https:\/\//, 'http://'));
    } else if (primaryUrl.startsWith('http://')) {
      urlsToTry.push(primaryUrl.replace(/^http:\/\//, 'https://'));
    }

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
          signal: AbortSignal.timeout(6000),
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
    const result = await fetchWithFallback(raw);
    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(502).json({
      success: false,
      error: error.message || 'Upstream connection failed',
      target: raw,
    });
  }
}
