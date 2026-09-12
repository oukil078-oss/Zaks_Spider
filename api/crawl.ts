// ==========================================
// ZAK'S SPIDER — CRAWLER SERVERLESS FUNCTION (/api/crawl)
// Vercel Serverless Function: Multi-vector Reconnaissance
// ==========================================

import dns from 'dns';
import net from 'net';
import type { 
  ScrapedResult, 
  OsintReconData, 
  SecurityHeadersAudit, 
  DetectedTechnology, 
  SensitiveFileFinding
} from '../src/types';

export default async function handler(req: any, res: any) {
  // CORS support
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const { url } = req.body || {};
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ success: false, error: 'Missing target URL' });
  }

  try {
    let clean = url.trim();
    if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
      clean = 'https://' + clean;
    }

    let parsed: URL;
    try {
      parsed = new URL(clean);
    } catch {
      return res.status(400).json({ success: false, error: 'Invalid URL format' });
    }

    const host = parsed.hostname.toLowerCase();
    const isIp = net.isIP(host) !== 0;
    const rootDomain = isIp ? host : host.split('.').slice(-2).join('.');

    // 1. DNS Resolution
    const dnsRecords: OsintReconData['dns'] = {};
    let hostmasterEmail = '';
    try {
      if (!isIp) {
        dnsRecords.a = await new Promise((resolve) => {
          dns.resolve4(host, (err, addresses) => resolve(err ? [] : addresses));
        });
        dnsRecords.mx = await new Promise((resolve) => {
          dns.resolveMx(host, (err, addresses) => resolve(err ? [] : addresses));
        });
        dnsRecords.txt = await new Promise((resolve) => {
          dns.resolveTxt(host, (err, records) => resolve(err ? [] : records.flat()));
        });
        dnsRecords.ns = await new Promise((resolve) => {
          dns.resolveNs(host, (err, addresses) => resolve(err ? [] : addresses));
        });

        // SOA lookup for admin/hostmaster email
        try {
          const soa = await new Promise<any>((resolve) => {
            dns.resolveSoa(rootDomain, (err, record) => resolve(err ? null : record));
          });
          if (soa && soa.hostmaster) {
            const hm = String(soa.hostmaster).replace(/\./, '@');
            if (hm.includes('@') && !hm.endsWith('.')) {
              hostmasterEmail = hm;
            }
          }
        } catch {}
      }
    } catch {}

    // 2. Fetch main page content with automatic HTTPS -> HTTP fallback
    let html = '';
    let status = 200;
    let serverBanner = '';
    let contentType = '';
    let responseHeaders: Record<string, string> = {};
    let activeOrigin = parsed.origin;

    const fetchPage = async (targetUrl: string) => {
      const response = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 ZaksSpider/2.0',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        redirect: 'follow',
        signal: AbortSignal.timeout(7000),
      });

      const hdrs: Record<string, string> = {};
      response.headers.forEach((val, key) => {
        hdrs[key.toLowerCase()] = val;
      });

      const body = await response.text();
      return {
        status: response.status,
        headers: hdrs,
        body,
        finalUrl: response.url || targetUrl,
        server: hdrs['server'] || '',
        contentType: hdrs['content-type'] || '',
      };
    };

    try {
      const pageResult = await fetchPage(clean);
      status = pageResult.status;
      serverBanner = pageResult.server;
      contentType = pageResult.contentType;
      responseHeaders = pageResult.headers;
      html = pageResult.body;
      activeOrigin = new URL(pageResult.finalUrl).origin;
    } catch (err: any) {
      // If HTTPS failed (e.g. port 443 refused/timeout), retry on HTTP
      if (clean.startsWith('https://')) {
        const httpFallback = clean.replace(/^https:\/\//, 'http://');
        try {
          const fallbackResult = await fetchPage(httpFallback);
          status = fallbackResult.status;
          serverBanner = fallbackResult.server;
          contentType = fallbackResult.contentType;
          responseHeaders = fallbackResult.headers;
          html = fallbackResult.body;
          activeOrigin = new URL(fallbackResult.finalUrl).origin;
          clean = httpFallback;
        } catch (fbErr: any) {
          html = `Fetch failed: ${err.message}; Fallback failed: ${fbErr.message}`;
        }
      } else {
        html = `Fetch failed: ${err.message}`;
      }
    }

    // 3. Extract title and description
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : `${host} - Endpoint`;
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
    const description = descMatch ? descMatch[1].trim() : 'No meta description detected.';

    // 4. Extract emails (Plain text, mailto links, Cloudflare de-obfuscation)
    const emailSet = new Set<string>();
    const emailMatches = html.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
    for (const em of emailMatches) {
      const c = em.toLowerCase().trim();
      if (!c.match(/\.(png|jpg|jpeg|gif|svg|webp|css|js|ico|woff|woff2|ttf)$/i)) {
        emailSet.add(c);
      }
    }

    // Mailto links
    const mailtoMatches = html.matchAll(/href=["']mailto:([^"'\s?#]+)/gi);
    for (const m of mailtoMatches) {
      const em = m[1].toLowerCase().trim();
      if (em.includes('@') && !em.match(/\.(png|jpg|jpeg|gif|svg|webp|css|js)$/i)) {
        emailSet.add(em);
      }
    }

    // Cloudflare email decode
    const cfMatches = [
      ...html.matchAll(/data-cfemail=["']([a-f0-9]+)["']/gi),
      ...html.matchAll(/\/cdn-cgi\/l\/email-protection#([a-f0-9]+)/gi),
    ];
    for (const m of cfMatches) {
      try {
        const hex = m[1];
        const k = parseInt(hex.substring(0, 2), 16);
        let dec = '';
        for (let i = 2; i < hex.length; i += 2) {
          dec += String.fromCharCode(parseInt(hex.substr(i, 2), 16) ^ k);
        }
        if (dec.includes('@')) emailSet.add(dec.toLowerCase().trim());
      } catch {}
    }

    if (hostmasterEmail) {
      emailSet.add(hostmasterEmail.toLowerCase());
    }

    // 5. Extract links & routes from HTML
    const internalLinks = new Set<string>();
    const externalLinks = new Set<string>();
    const hrefMatches = html.matchAll(/href=["']([^"'#\s]+)["']/gi);
    for (const m of hrefMatches) {
      const link = m[1].trim();
      if (link.startsWith('http://') || link.startsWith('https://')) {
        try {
          const u = new URL(link);
          if (u.hostname.includes(rootDomain)) {
            internalLinks.add(link);
          } else {
            externalLinks.add(link);
          }
        } catch {}
      } else if (link.startsWith('/')) {
        internalLinks.add(`${activeOrigin}${link}`);
      }
    }

    // 6. Subdomain discovery via crt.sh
    const subdomains = new Set<string>();
    if (!isIp) {
      subdomains.add(`www.${rootDomain}`);
      subdomains.add(`api.${rootDomain}`);
      subdomains.add(`mail.${rootDomain}`);
      try {
        const crtRes = await fetch(`https://crt.sh/?q=%25.${encodeURIComponent(rootDomain)}&output=json`, {
          signal: AbortSignal.timeout(4000),
        });
        if (crtRes.ok) {
          const entries = (await crtRes.json()) as any[];
          for (const e of entries.slice(0, 50)) {
            const nameVal = e.name_value || '';
            const names = nameVal.split('\n');
            for (const n of names) {
              const cleanedSub = n.replace(/^\*\./, '').toLowerCase().trim();
              if (cleanedSub.endsWith(rootDomain) && !cleanedSub.includes('*')) {
                subdomains.add(cleanedSub);
              }
            }
          }
        }
      } catch {}
    }

    // 7. Robots.txt and sensitive paths probe
    const sensitiveFiles: SensitiveFileFinding[] = [];
    const robotsTxtData = { disallow: [] as string[], allow: [] as string[], sitemaps: [] as string[] };

    // Probe A: /robots.txt
    try {
      const robotsRes = await fetch(`${activeOrigin}/robots.txt`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ZaksSpider/2.0' },
        signal: AbortSignal.timeout(3500)
      });
      if (robotsRes.ok) {
        const robText = await robotsRes.text();
        const disallows = (robText.match(/Disallow:\s*([^\r\n#]+)/gi) || []).map(l => l.replace(/Disallow:\s*/i, '').trim()).filter(Boolean);
        const allows = (robText.match(/Allow:\s*([^\r\n#]+)/gi) || []).map(l => l.replace(/Allow:\s*/i, '').trim()).filter(Boolean);
        const sitemaps = (robText.match(/Sitemap:\s*([^\r\n#]+)/gi) || []).map(l => l.replace(/Sitemap:\s*/i, '').trim()).filter(Boolean);

        robotsTxtData.disallow = disallows;
        robotsTxtData.allow = allows;
        robotsTxtData.sitemaps = sitemaps;

        // Extract emails in robots comments
        const robEmails = robText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
        robEmails.forEach(e => emailSet.add(e.toLowerCase().trim()));

        sensitiveFiles.push({
          path: '/robots.txt',
          url: `${activeOrigin}/robots.txt`,
          status: robotsRes.status,
          source: 'robots.txt',
          interesting: disallows.length > 0,
          notes: `Exposes ${disallows.length} disallow paths and ${sitemaps.length} sitemaps`,
        });
      }
    } catch {}

    // Probe B: /.well-known/security.txt (RFC 9116)
    try {
      const secRes = await fetch(`${activeOrigin}/.well-known/security.txt`, { signal: AbortSignal.timeout(3000) });
      if (secRes.ok) {
        const secText = await secRes.text();
        const secEmails = secText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
        secEmails.forEach(e => emailSet.add(e.toLowerCase().trim()));

        sensitiveFiles.push({
          path: '/.well-known/security.txt',
          url: `${activeOrigin}/.well-known/security.txt`,
          status: secRes.status,
          source: 'heuristic',
          interesting: true,
          notes: `RFC 9116 security disclosure published with ${secEmails.length} contacts`,
        });
      }
    } catch {}

    // Probe C: Sensitive Probes (Git, Env, Swagger, GraphQL)
    const probeList = [
      { path: '/.git/HEAD', check: (txt: string, s: number) => txt.includes('ref: refs/heads/') || (s === 200 && txt.trim().length === 41), note: 'Exposed Git repository metadata' },
      { path: '/.env', check: (txt: string, s: number) => s === 200 && (txt.includes('DB_') || txt.includes('KEY=') || txt.includes('SECRET=')), note: 'Plaintext environment variables' },
      { path: '/sitemap.xml', check: (_txt: string, s: number) => s === 200, note: 'Indexed sitemap routes' },
      { path: '/swagger.json', check: (txt: string, s: number) => s === 200 && (txt.includes('swagger') || txt.includes('openapi')), note: 'Public Swagger/OpenAPI definition' },
      { path: '/graphql', check: (txt: string, s: number) => s === 200 && txt.includes('__schema'), note: 'GraphQL schema introspection' },
      { path: '/.DS_Store', check: (_txt: string, s: number) => s === 200, note: 'macOS folder structure metadata' },
    ];

    for (const p of probeList) {
      try {
        const res = await fetch(`${activeOrigin}${p.path}`, { signal: AbortSignal.timeout(2500) });
        if (res.ok) {
          const txt = await res.text();
          if (p.check(txt, res.status)) {
            sensitiveFiles.push({
              path: p.path,
              url: `${activeOrigin}${p.path}`,
              status: res.status,
              source: 'heuristic',
              interesting: true,
              notes: p.note,
            });
          }
        }
      } catch {}
    }

    // 8. Security Headers Audit
    const securityAudit = auditSecurityHeaders(responseHeaders);

    // 9. Detected Technologies
    const technologies = detectTechnologies(responseHeaders, html);

    const result: ScrapedResult = {
      url: clean,
      domain: host,
      metadata: {
        title,
        description,
        author: 'Arachnid Recon Agent',
        status,
        server: serverBanner,
        content_type: contentType,
      },
      emails: Array.from(emailSet).sort(),
      subdomains: Array.from(subdomains).sort(),
      links: {
        internal: Array.from(internalLinks).slice(0, 100),
        external: Array.from(externalLinks).slice(0, 50),
        total_internal: internalLinks.size,
        total_external: externalLinks.size,
      },
      text: html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 4000),
      scraped_at: new Date().toISOString(),
      osint: {
        root_domain: rootDomain,
        is_ip: isIp,
        target_ip: dnsRecords.a?.[0] || (isIp ? host : 'Unknown'),
        dns: dnsRecords,
        robots_txt: robotsTxtData,
        sensitive_files: sensitiveFiles,
        security_headers: securityAudit,
        technologies,
      },
    };

    return res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

function auditSecurityHeaders(headers: Record<string, string>): SecurityHeadersAudit {
  const findings: SecurityHeadersAudit['findings'] = [];
  let passCount = 0;
  let failCount = 0;

  // HSTS
  if (headers['strict-transport-security']) {
    passCount++;
    findings.push({
      header: 'Strict-Transport-Security',
      value: headers['strict-transport-security'],
      status: 'pass',
      importance: 'critical',
      description: 'HSTS is enforced, preventing SSL-stripping man-in-the-middle attacks.',
      recommendation: 'Maintain configuration.',
    });
  } else {
    failCount++;
    findings.push({
      header: 'Strict-Transport-Security',
      status: 'fail',
      importance: 'critical',
      description: 'Missing HSTS header allows users to connect via unencrypted HTTP.',
      recommendation: 'Add Strict-Transport-Security: max-age=31536000; includeSubDomains.',
    });
  }

  // Content-Security-Policy
  if (headers['content-security-policy']) {
    passCount++;
    findings.push({
      header: 'Content-Security-Policy',
      value: headers['content-security-policy'].substring(0, 80) + '...',
      status: 'pass',
      importance: 'high',
      description: 'CSP mitigates Cross-Site Scripting (XSS) and data injection.',
      recommendation: 'Ensure unsafe-inline is restricted.',
    });
  } else {
    failCount++;
    findings.push({
      header: 'Content-Security-Policy',
      status: 'fail',
      importance: 'high',
      description: 'Missing CSP leaves endpoints vulnerable to reflected and stored XSS.',
      recommendation: 'Define a strict CSP policy.',
    });
  }

  // X-Frame-Options
  if (headers['x-frame-options']) {
    passCount++;
    findings.push({
      header: 'X-Frame-Options',
      value: headers['x-frame-options'],
      status: 'pass',
      importance: 'medium',
      description: 'Mitigates UI redressing and Clickjacking attacks.',
      recommendation: 'Consider frame-ancestors in CSP.',
    });
  } else {
    failCount++;
    findings.push({
      header: 'X-Frame-Options',
      status: 'fail',
      importance: 'medium',
      description: 'Missing X-Frame-Options allows page embedding in malicious iframes.',
      recommendation: 'Set X-Frame-Options to DENY or SAMEORIGIN.',
    });
  }

  // X-Content-Type-Options
  if (headers['x-content-type-options']) {
    passCount++;
    findings.push({
      header: 'X-Content-Type-Options',
      value: headers['x-content-type-options'],
      status: 'pass',
      importance: 'medium',
      description: 'Prevents browser MIME-sniffing away from declared content-type.',
      recommendation: 'Keep nosniff configured.',
    });
  } else {
    failCount++;
    findings.push({
      header: 'X-Content-Type-Options',
      status: 'fail',
      importance: 'medium',
      description: 'MIME sniffing can lead to executable script execution from uploaded media.',
      recommendation: 'Set X-Content-Type-Options: nosniff.',
    });
  }

  // Referrer-Policy
  if (headers['referrer-policy']) {
    passCount++;
    findings.push({
      header: 'Referrer-Policy',
      value: headers['referrer-policy'],
      status: 'pass',
      importance: 'low',
      description: 'Controls referrer information sent in outbound requests.',
      recommendation: 'Maintain strict-origin-when-cross-origin.',
    });
  } else {
    failCount++;
    findings.push({
      header: 'Referrer-Policy',
      status: 'fail',
      importance: 'low',
      description: 'Missing Referrer-Policy may leak sensitive query parameters in URL headers.',
      recommendation: 'Set Referrer-Policy: strict-origin-when-cross-origin.',
    });
  }

  // Permissions-Policy
  if (headers['permissions-policy']) {
    passCount++;
    findings.push({
      header: 'Permissions-Policy',
      value: headers['permissions-policy'],
      status: 'pass',
      importance: 'low',
      description: 'Restricts access to browser APIs like geolocation, camera, and microphone.',
      recommendation: 'Maintain configuration.',
    });
  } else {
    failCount++;
    findings.push({
      header: 'Permissions-Policy',
      status: 'fail',
      importance: 'low',
      description: 'Missing Permissions-Policy allows iframes to request sensitive browser features.',
      recommendation: 'Define explicit Permissions-Policy (camera=(), microphone=(), geolocation=()).',
    });
  }

  const score = Math.round((passCount / (passCount + failCount || 1)) * 100);
  let grade: SecurityHeadersAudit['grade'] = 'F';
  if (score >= 90) grade = 'A+';
  else if (score >= 80) grade = 'A';
  else if (score >= 65) grade = 'B';
  else if (score >= 50) grade = 'C';
  else if (score >= 35) grade = 'D';

  return { grade, score, passCount, failCount, findings };
}

function detectTechnologies(headers: Record<string, string>, html: string): DetectedTechnology[] {
  const techs: DetectedTechnology[] = [];
  const server = (headers['server'] || '').toLowerCase();
  const xPowered = (headers['x-powered-by'] || '').toLowerCase();
  const via = (headers['via'] || '').toLowerCase();
  const lowerHtml = html.toLowerCase();

  // Web Servers
  if (server.includes('nginx')) techs.push({ name: 'Nginx', category: 'Web Server', confidence: 'high' });
  if (server.includes('apache')) techs.push({ name: 'Apache HTTP Server', category: 'Web Server', confidence: 'high' });
  if (server.includes('caddy')) techs.push({ name: 'Caddy Server', category: 'Web Server', confidence: 'high' });
  if (server.includes('iis') || server.includes('microsoft-iis')) techs.push({ name: 'Microsoft IIS', category: 'Web Server', confidence: 'high' });
  if (server.includes('litespeed')) techs.push({ name: 'LiteSpeed', category: 'Web Server', confidence: 'high' });

  // CDNs / Reverse Proxies
  if (server.includes('cloudflare') || headers['cf-ray']) techs.push({ name: 'Cloudflare', category: 'CDN / WAF', confidence: 'high' });
  if (via.includes('cloudfront') || headers['x-amz-cf-id']) techs.push({ name: 'Amazon CloudFront', category: 'CDN / WAF', confidence: 'high' });
  if (server.includes('akamai') || headers['x-akamai-transformed']) techs.push({ name: 'Akamai', category: 'CDN / WAF', confidence: 'high' });
  if (via.includes('fastly') || headers['x-fastly-request-id']) techs.push({ name: 'Fastly', category: 'CDN / WAF', confidence: 'high' });

  // Backend Frameworks & Runtimes
  if (xPowered.includes('express')) techs.push({ name: 'Express.js', category: 'Backend', confidence: 'high' });
  if (xPowered.includes('php') || lowerHtml.includes('.php')) techs.push({ name: 'PHP', category: 'Backend', confidence: 'high' });
  if (xPowered.includes('asp.net') || headers['x-aspnet-version']) techs.push({ name: 'ASP.NET', category: 'Backend', confidence: 'high' });
  if (headers['x-generator']?.toLowerCase().includes('drupal')) techs.push({ name: 'Drupal CMS', category: 'CMS', confidence: 'high' });

  // Frontend & UI
  if (lowerHtml.includes('react') || lowerHtml.includes('_next') || lowerHtml.includes('__next_data__')) {
    techs.push({ name: 'React / Next.js', category: 'Frontend', confidence: 'high' });
  }
  if (lowerHtml.includes('vue') || lowerHtml.includes('__nuxt')) {
    techs.push({ name: 'Vue / Nuxt.js', category: 'Frontend', confidence: 'high' });
  }
  if (lowerHtml.includes('wp-content') || lowerHtml.includes('wp-includes')) {
    techs.push({ name: 'WordPress', category: 'CMS', confidence: 'high' });
  }
  if (lowerHtml.includes('tailwind') || lowerHtml.includes('tailwindcss')) {
    techs.push({ name: 'Tailwind CSS', category: 'Frontend', confidence: 'medium' });
  }
  if (lowerHtml.includes('bootstrap') || lowerHtml.includes('bootstrap.min.css')) {
    techs.push({ name: 'Bootstrap', category: 'Frontend', confidence: 'medium' });
  }
  if (lowerHtml.includes('jquery') || lowerHtml.includes('jquery.min.js')) {
    techs.push({ name: 'jQuery', category: 'Frontend', confidence: 'medium' });
  }

  return techs;
}
