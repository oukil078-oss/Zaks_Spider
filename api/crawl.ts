// ==========================================
// ZAK'S SPIDER — CRAWLER SERVERLESS FUNCTION (/api/crawl)
// Vercel Serverless Function: Multi-vector Reconnaissance
// ==========================================

import type { IncomingMessage, ServerResponse } from 'http';
import dns from 'dns';
import net from 'net';
import tls from 'tls';
import type { 
  ScrapedResult, 
  OsintReconData, 
  SecurityHeadersAudit, 
  DetectedTechnology, 
  SslCertInfo,
  SensitiveFileFinding
} from '../src/types';

export default async function handler(req: any, res: any) {
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

    const parsed = new URL(clean);
    const host = parsed.hostname.toLowerCase();
    const isIp = net.isIP(host) !== 0;
    const rootDomain = isIp ? host : host.split('.').slice(-2).join('.');
    const origin = parsed.origin;

    // 1. DNS Resolution
    const dnsRecords: OsintReconData['dns'] = {};
    try {
      if (!isIp) {
        dnsRecords.a = await new Promise((resolve) => {
          dns.resolve4(host, (err, addresses) => resolve(err ? [] : addresses));
        });
        dnsRecords.mx = await new Promise((resolve) => {
          dns.resolveMx(host, (err, addresses) => resolve(err ? [] : addresses));
        });
      }
    } catch {}

    // 2. Fetch main page content
    let html = '';
    let status = 200;
    let serverBanner = '';
    let contentType = '';
    let responseHeaders: Record<string, string> = {};

    try {
      const response = await fetch(clean, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ZaksSpider/1.0 (Cybersecurity Recon)',
        },
        signal: AbortSignal.timeout(8000),
      });

      status = response.status;
      serverBanner = response.headers.get('server') || '';
      contentType = response.headers.get('content-type') || '';
      response.headers.forEach((val, key) => {
        responseHeaders[key.toLowerCase()] = val;
      });

      html = await response.text();
    } catch (e: any) {
      html = `Failed to fetch body: ${e.message}`;
    }

    // 3. Extract title and description
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : `${host} - Endpoint`;
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
    const description = descMatch ? descMatch[1].trim() : 'No meta description detected.';

    // 4. Extract emails (Plain text + Cloudflare de-obfuscation)
    const emailSet = new Set<string>();
    const emailMatches = html.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
    for (const em of emailMatches) {
      const c = em.toLowerCase().trim();
      if (!c.match(/\.(png|jpg|jpeg|gif|svg|webp|css|js|ico|woff|woff2|ttf)$/i)) {
        emailSet.add(c);
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
          dec += String.fromCharCode(parseInt(hex.substring(i, 2), 16) ^ k);
        }
        if (dec.includes('@')) emailSet.add(dec.toLowerCase().trim());
      } catch {}
    }

    // 5. Extract links
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
        internalLinks.add(`${origin}${link}`);
      }
    }

    // 6. Subdomain discovery via crt.sh
    const subdomains = new Set<string>();
    if (!isIp) {
      subdomains.add(`www.${rootDomain}`);
      subdomains.add(`api.${rootDomain}`);
      subdomains.add(`mail.${rootDomain}`);
      try {
        const crtRes = await fetch(`https://crt.sh/?q=%25.${rootDomain}&output=json`, {
          signal: AbortSignal.timeout(4000),
        });
        if (crtRes.ok) {
          const entries = (await crtRes.json()) as any[];
          for (const e of entries.slice(0, 30)) {
            const nameVal = e.name_value || '';
            const names = nameVal.split('\n');
            for (const n of names) {
              const cleanedSub = n.replace(/^\*\./, '').toLowerCase().trim();
              if (cleanedSub.endsWith(rootDomain)) {
                subdomains.add(cleanedSub);
              }
            }
          }
        }
      } catch {}
    }

    // 7. Robots.txt and sensitive paths probe
    const sensitiveFiles: SensitiveFileFinding[] = [];
    let robotsTxtData = { disallow: [] as string[], allow: [] as string[], sitemaps: [] as string[] };
    try {
      const robotsRes = await fetch(`${origin}/robots.txt`, { signal: AbortSignal.timeout(3000) });
      if (robotsRes.ok) {
        const robText = await robotsRes.text();
        const disallows = (robText.match(/Disallow:\s*([^\r\n]+)/gi) || []).map(l => l.replace(/Disallow:\s*/i, '').trim());
        robotsTxtData.disallow = disallows;
        sensitiveFiles.push({
          path: '/robots.txt',
          url: `${origin}/robots.txt`,
          status: robotsRes.status,
          source: 'robots.txt',
          interesting: true,
          notes: `Exposes ${disallows.length} disallow paths`,
        });
      }
    } catch {}

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
        internal: Array.from(internalLinks).slice(0, 80),
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
  const server = headers['server'] || '';
  const xPowered = headers['x-powered-by'] || '';

  if (server.toLowerCase().includes('nginx')) techs.push({ name: 'Nginx', category: 'Web Server', confidence: 'high' });
  if (server.toLowerCase().includes('apache')) techs.push({ name: 'Apache', category: 'Web Server', confidence: 'high' });
  if (server.toLowerCase().includes('cloudflare')) techs.push({ name: 'Cloudflare', category: 'CDN / WAF', confidence: 'high' });
  if (xPowered.toLowerCase().includes('express')) techs.push({ name: 'Express', category: 'Backend', confidence: 'high' });
  if (xPowered.toLowerCase().includes('php')) techs.push({ name: 'PHP', category: 'Backend', confidence: 'high' });

  if (html.includes('react') || html.includes('_next') || html.includes('__NEXT_DATA__')) {
    techs.push({ name: 'React / Next.js', category: 'Frontend', confidence: 'high' });
  }
  if (html.includes('wp-content') || html.includes('wp-includes')) {
    techs.push({ name: 'WordPress', category: 'CMS', confidence: 'high' });
  }
  if (html.includes('tailwind')) {
    techs.push({ name: 'Tailwind CSS', category: 'Frontend', confidence: 'medium' });
  }

  return techs;
}
