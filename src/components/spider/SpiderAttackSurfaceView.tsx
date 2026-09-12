import React, { useState } from 'react';
import { 
  Globe, Search, RefreshCw, ShieldAlert, AlertTriangle, 
  CheckCircle2, ExternalLink, Download, Layers, Server, 
  Code2, Key, Shield, Filter, Copy, Check, ChevronRight,
  Database, Terminal, ArrowUpRight, Cpu, Mail, FileText, X, Play,
  Zap, Info, CheckCircle, XCircle
} from 'lucide-react';

export interface DiscoveredAsset {
  id: string;
  fqdn: string;
  ip: string;
  cname?: string;
  status: 'ACTIVE' | 'UNRESOLVED' | 'DANGLING_CNAME';
  source: 'CRT_SH' | 'HACKERTARGET' | 'DNS_DOH' | 'DIRECT';
}

export interface DiscoveredExposure {
  id: string;
  path: string;
  url: string;
  status: number | string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'INFO';
  evidence: string;
  type: 'GIT_REPOSITORY' | 'ENV_FILE' | 'ROBOTS_DISALLOW' | 'SITEMAP_INDEX' | 'SECURITY_TXT' | 'GRAPHQL_SCHEMA' | 'API_DOCS' | 'DS_STORE';
}

export interface HarvestedEmail {
  id: string;
  email: string;
  source: string;
}

export interface DetectedTechnology {
  name: string;
  category: string;
  confidence: 'high' | 'medium' | 'low';
  evidence?: string;
}

export interface SecurityHeadersAudit {
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  score: number;
  passCount: number;
  failCount: number;
  findings: {
    header: string;
    value?: string;
    status: 'pass' | 'fail';
    importance: 'critical' | 'high' | 'medium' | 'low';
    description: string;
    recommendation: string;
  }[];
}

interface SpiderAttackSurfaceViewProps {
  onPivotToSoc?: (ip: string) => void;
  onPivotToForensics?: (url: string) => void;
  onPivotToSwarm?: (target: string) => void;
}

// Client-side Heuristic Tech Detector
function extractTechFromClient(headers: Record<string, string>, html: string): DetectedTechnology[] {
  const techs: DetectedTechnology[] = [];
  const server = (headers['server'] || '').toLowerCase();
  const xPowered = (headers['x-powered-by'] || '').toLowerCase();
  const via = (headers['via'] || '').toLowerCase();
  const lowerHtml = (html || '').toLowerCase();

  // Web Servers
  if (server.includes('nginx')) techs.push({ name: 'Nginx', category: 'Web Server', confidence: 'high', evidence: headers['server'] });
  if (server.includes('apache')) techs.push({ name: 'Apache HTTP Server', category: 'Web Server', confidence: 'high', evidence: headers['server'] });
  if (server.includes('caddy')) techs.push({ name: 'Caddy Server', category: 'Web Server', confidence: 'high', evidence: headers['server'] });
  if (server.includes('iis') || server.includes('microsoft-iis')) techs.push({ name: 'Microsoft IIS', category: 'Web Server', confidence: 'high', evidence: headers['server'] });
  if (server.includes('litespeed')) techs.push({ name: 'LiteSpeed', category: 'Web Server', confidence: 'high', evidence: headers['server'] });

  // CDNs / Reverse Proxies
  if (server.includes('cloudflare') || headers['cf-ray']) techs.push({ name: 'Cloudflare', category: 'CDN / WAF', confidence: 'high', evidence: headers['cf-ray'] ? `CF-Ray: ${headers['cf-ray']}` : headers['server'] });
  if (via.includes('cloudfront') || headers['x-amz-cf-id']) techs.push({ name: 'Amazon CloudFront', category: 'CDN / WAF', confidence: 'high', evidence: via || 'x-amz-cf-id header' });
  if (server.includes('akamai') || headers['x-akamai-transformed']) techs.push({ name: 'Akamai', category: 'CDN / WAF', confidence: 'high', evidence: headers['server'] || 'Akamai' });
  if (via.includes('fastly') || headers['x-fastly-request-id']) techs.push({ name: 'Fastly', category: 'CDN / WAF', confidence: 'high', evidence: via });

  // Backend Frameworks & Runtimes
  if (xPowered.includes('express')) techs.push({ name: 'Express.js', category: 'Backend Framework', confidence: 'high', evidence: headers['x-powered-by'] });
  if (xPowered.includes('php') || lowerHtml.includes('.php')) techs.push({ name: 'PHP', category: 'Backend Language', confidence: 'high', evidence: headers['x-powered-by'] || '.php route signatures' });
  if (xPowered.includes('asp.net') || headers['x-aspnet-version']) techs.push({ name: 'ASP.NET', category: 'Backend Framework', confidence: 'high', evidence: headers['x-powered-by'] || 'ASP.NET' });
  if (headers['x-generator']?.toLowerCase().includes('drupal')) techs.push({ name: 'Drupal CMS', category: 'CMS', confidence: 'high', evidence: headers['x-generator'] });

  // Frontend & UI
  if (lowerHtml.includes('react') || lowerHtml.includes('_next') || lowerHtml.includes('__next_data__')) {
    techs.push({ name: 'React / Next.js', category: 'Frontend Framework', confidence: 'high', evidence: 'DOM script / __NEXT_DATA__' });
  }
  if (lowerHtml.includes('vue') || lowerHtml.includes('__nuxt')) {
    techs.push({ name: 'Vue / Nuxt.js', category: 'Frontend Framework', confidence: 'high', evidence: 'Vue DOM instance / Nuxt tokens' });
  }
  if (lowerHtml.includes('wp-content') || lowerHtml.includes('wp-includes')) {
    techs.push({ name: 'WordPress', category: 'CMS / Blog', confidence: 'high', evidence: '/wp-content/ directory structure' });
  }
  if (lowerHtml.includes('tailwind') || lowerHtml.includes('tailwindcss')) {
    techs.push({ name: 'Tailwind CSS', category: 'UI Framework', confidence: 'medium', evidence: 'Utility classes & Tailwind markers' });
  }
  if (lowerHtml.includes('bootstrap') || lowerHtml.includes('bootstrap.min.css')) {
    techs.push({ name: 'Bootstrap', category: 'UI Framework', confidence: 'medium', evidence: 'Bootstrap CSS styles' });
  }
  if (lowerHtml.includes('jquery') || lowerHtml.includes('jquery.min.js')) {
    techs.push({ name: 'jQuery', category: 'JavaScript Library', confidence: 'medium', evidence: 'jQuery library inclusion' });
  }

  return techs;
}

// Client-side Security Headers Auditor
function generateClientSecurityAudit(headers: Record<string, string>): SecurityHeadersAudit {
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
      description: 'HSTS is enforced, mitigating SSL-stripping man-in-the-middle attacks.',
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

// Universal CORS-tolerant probe fetcher
async function fetchProbeWithFallbacks(targetUrl: string): Promise<{ status: number; headers: Record<string, string>; text: string; url: string } | null> {
  // 1. Try local Node serverless proxy (/api/proxy)
  try {
    const pRes = await fetch(`/api/proxy?url=${encodeURIComponent(targetUrl)}`, {
      signal: AbortSignal.timeout(6000),
    });
    if (pRes.ok) {
      const pData = await pRes.json();
      if (pData.success) {
        return {
          status: pData.status,
          headers: pData.headers || {},
          text: pData.body || '',
          url: pData.url || targetUrl,
        };
      }
    }
  } catch {}

  // 2. Try open CORS proxy (api.allorigins.win)
  try {
    const aoRes = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`, {
      signal: AbortSignal.timeout(5000),
    });
    if (aoRes.ok) {
      const aoData = await aoRes.json();
      if (aoData.contents) {
        const hdrs: Record<string, string> = {};
        if (aoData.status?.response_headers) {
          Object.entries(aoData.status.response_headers).forEach(([k, v]) => {
            hdrs[k.toLowerCase()] = String(v);
          });
        }
        return {
          status: aoData.status?.http_code || 200,
          headers: hdrs,
          text: aoData.contents,
          url: targetUrl,
        };
      }
    }
  } catch {}

  // 3. Try direct fetch (if allowed by remote or local network)
  try {
    let clean = targetUrl;
    if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
      clean = 'https://' + clean;
    }
    const dRes = await fetch(clean, { signal: AbortSignal.timeout(3500) });
    const hdrs: Record<string, string> = {};
    dRes.headers.forEach((val, k) => { hdrs[k.toLowerCase()] = val; });
    const txt = await dRes.text();
    return {
      status: dRes.status,
      headers: hdrs,
      text: txt,
      url: dRes.url || clean,
    };
  } catch {}

  return null;
}

export const SpiderAttackSurfaceView: React.FC<SpiderAttackSurfaceViewProps> = ({
  onPivotToSoc,
  onPivotToForensics,
  onPivotToSwarm,
}) => {
  const [targetDomain, setTargetDomain] = useState<string>('scanme.nmap.org');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanPhase, setScanPhase] = useState<string>('');
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [activeDeckTab, setActiveDeckTab] = useState<'ASSETS' | 'EXPOSURES' | 'EMAILS' | 'ROBOTS' | 'HEADERS'>('ASSETS');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Real Discovered Data (Zero Fake Data)
  const [assets, setAssets] = useState<DiscoveredAsset[]>([]);
  const [exposures, setExposures] = useState<DiscoveredExposure[]>([]);
  const [emails, setEmails] = useState<HarvestedEmail[]>([]);
  const [robotsRoutes, setRobotsRoutes] = useState<string[]>([]);
  const [rawHeaders, setRawHeaders] = useState<Record<string, string>>({});
  const [technologies, setTechnologies] = useState<DetectedTechnology[]>([]);
  const [securityAudit, setSecurityAudit] = useState<SecurityHeadersAudit | null>(null);
  const [targetIp, setTargetIp] = useState<string | null>(null);

  // Helper: DNS-over-HTTPS A record resolver
  const resolveDoH = async (fqdn: string): Promise<{ ip: string; cname?: string } | null> => {
    try {
      const res = await fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(fqdn)}&type=A`, {
        headers: { Accept: 'application/dns-json' },
      });
      if (!res.ok) return null;
      const data = await res.json();
      if (!data.Answer || data.Answer.length === 0) return null;

      let resolvedIp = '';
      let resolvedCname: string | undefined;

      for (const ans of data.Answer) {
        if (ans.type === 1) resolvedIp = ans.data; // A record
        if (ans.type === 5) resolvedCname = ans.data; // CNAME
      }

      return resolvedIp ? { ip: resolvedIp, cname: resolvedCname } : null;
    } catch {
      return null;
    }
  };

  // Main Spider & Exposure Engine Execution
  const handleExecuteSpider = async () => {
    const raw = targetDomain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    if (!raw) return;

    setIsScanning(true);
    setProgressPercent(5);
    setScanPhase(`Phase 1/5: Initializing DNS resolution & DoH discovery for ${raw}...`);

    const discoveredSubdomains = new Set<string>();
    discoveredSubdomains.add(raw);
    discoveredSubdomains.add(`www.${raw}`);

    const newExposures: DiscoveredExposure[] = [];
    const newEmails = new Set<string>();
    const newRobotsRoutes: string[] = [];
    const discoveredAssetsMap = new Map<string, DiscoveredAsset>();
    let targetHeaders: Record<string, string> = {};
    let targetTechs: DetectedTechnology[] = [];
    let targetAudit: SecurityHeadersAudit | null = null;

    try {
      // 1. Resolve Root Domain A-record via Cloudflare DoH
      const rootDns = await resolveDoH(raw);
      if (rootDns) {
        setTargetIp(rootDns.ip);
        discoveredAssetsMap.set(raw, {
          id: `ast-${Date.now()}-root`,
          fqdn: raw,
          ip: rootDns.ip,
          cname: rootDns.cname,
          status: 'ACTIVE',
          source: 'DIRECT',
        });
      }

      // 2. Certificate Transparency Enumeration (crt.sh)
      setProgressPercent(20);
      setScanPhase(`Phase 2/5: Querying Certificate Transparency logs (crt.sh)...`);
      try {
        const crtRes = await fetch(`https://crt.sh/?q=%25.${encodeURIComponent(raw)}&output=json`, {
          signal: AbortSignal.timeout(6000),
        });
        if (crtRes.ok) {
          const entries = await crtRes.json();
          if (Array.isArray(entries)) {
            entries.slice(0, 150).forEach((item: any) => {
              const nameVal = String(item.name_value || '');
              nameVal.split('\n').forEach(sub => {
                const cleanSub = sub.replace(/^\*\./, '').toLowerCase().trim();
                if (cleanSub.endsWith(raw) && !cleanSub.includes('*') && cleanSub.length <= 120) {
                  discoveredSubdomains.add(cleanSub);
                }
              });
            });
          }
        }
      } catch (err) {
        console.warn('crt.sh passive lookup timed out or failed:', err);
      }

      // 3. HackerTarget Passive DNS Lookup
      setProgressPercent(35);
      setScanPhase(`Phase 3/5: Querying HackerTarget Passive DNS host tables...`);
      try {
        const htRes = await fetch(`https://api.hackertarget.com/hostsearch/?q=${encodeURIComponent(raw)}`, {
          signal: AbortSignal.timeout(4000),
        });
        if (htRes.ok) {
          const htText = await htRes.text();
          if (!htText.includes('API count exceeded') && !htText.includes('error')) {
            const lines = htText.split('\n').map(l => l.trim()).filter(Boolean);
            lines.forEach(line => {
              const parts = line.split(',');
              const fqdn = parts[0]?.toLowerCase().trim();
              const ip = parts[1]?.trim();
              if (fqdn && fqdn.endsWith(raw)) {
                discoveredSubdomains.add(fqdn);
                if (ip && !discoveredAssetsMap.has(fqdn)) {
                  discoveredAssetsMap.set(fqdn, {
                    id: `ast-${Date.now()}-${fqdn}`,
                    fqdn,
                    ip,
                    status: 'ACTIVE',
                    source: 'HACKERTARGET',
                  });
                }
              }
            });
          }
        }
      } catch (err) {
        console.warn('HackerTarget lookup fallback:', err);
      }

      // 4. Server-Side Deep Reconnaissance Crawler (/api/crawl)
      setProgressPercent(50);
      setScanPhase(`Phase 4/5: Invoking Deep Recon Crawler & Technology Fingerprinter...`);
      try {
        const crawlRes = await fetch('/api/crawl', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: raw }),
          signal: AbortSignal.timeout(10000),
        });

        if (crawlRes.ok) {
          const crawlJson = await crawlRes.json();
          if (crawlJson.success && crawlJson.data) {
            const d = crawlJson.data;

            // Target IP
            if (d.osint?.target_ip && d.osint.target_ip !== 'Unknown') {
              setTargetIp(d.osint.target_ip);
              if (discoveredAssetsMap.has(raw)) {
                const cur = discoveredAssetsMap.get(raw)!;
                discoveredAssetsMap.set(raw, { ...cur, ip: d.osint.target_ip });
              }
            }

            // Subdomains
            if (Array.isArray(d.subdomains)) {
              d.subdomains.forEach((s: string) => discoveredSubdomains.add(s));
            }

            // Emails
            if (Array.isArray(d.emails)) {
              d.emails.forEach((em: string) => newEmails.add(em));
            }

            // Robots & Disallowed routes
            if (d.osint?.robots_txt) {
              const r = d.osint.robots_txt;
              if (Array.isArray(r.disallow)) newRobotsRoutes.push(...r.disallow);
              if (Array.isArray(r.allow)) newRobotsRoutes.push(...r.allow);
              if (Array.isArray(r.sitemaps)) newRobotsRoutes.push(...r.sitemaps);
            }

            // Sensitive files from server crawl
            if (Array.isArray(d.osint?.sensitive_files)) {
              d.osint.sensitive_files.forEach((sf: any) => {
                newExposures.push({
                  id: `exp-${Date.now()}-${sf.path}`,
                  path: sf.path,
                  url: sf.url,
                  status: sf.status,
                  severity: sf.path.includes('.git') || sf.path.includes('.env') ? 'CRITICAL' : sf.interesting ? 'HIGH' : 'INFO',
                  evidence: sf.notes || `Discovered ${sf.path} on target`,
                  type: sf.path.includes('.git') ? 'GIT_REPOSITORY' : sf.path.includes('.env') ? 'ENV_FILE' : sf.path.includes('robots') ? 'ROBOTS_DISALLOW' : sf.path.includes('security.txt') ? 'SECURITY_TXT' : 'API_DOCS',
                });
              });
            }

            // Security Headers & Tech
            if (d.osint?.security_headers) {
              targetAudit = d.osint.security_headers;
              if (d.metadata?.server) {
                targetHeaders['server'] = d.metadata.server;
              }
              if (d.metadata?.content_type) {
                targetHeaders['content-type'] = d.metadata.content_type;
              }
              if (Array.isArray(d.osint.security_headers.findings)) {
                d.osint.security_headers.findings.forEach((f: any) => {
                  if (f.value) {
                    targetHeaders[f.header.toLowerCase()] = f.value;
                  }
                });
              }
            }

            if (Array.isArray(d.osint?.technologies)) {
              targetTechs = d.osint.technologies;
            }
          }
        }
      } catch (crawlErr) {
        console.warn('Local /api/crawl endpoint bypass:', crawlErr);
      }

      // 5. Active Target Probing & Live Header Verification (via /api/proxy or Fallbacks)
      setProgressPercent(75);
      setScanPhase(`Phase 5/5: Active probing sensitive endpoints & verifying security headers...`);

      const probeList = [
        { path: '/', type: 'ROOT' as const },
        { path: '/robots.txt', type: 'ROBOTS_DISALLOW' as const },
        { path: '/.well-known/security.txt', type: 'SECURITY_TXT' as const },
        { path: '/.git/HEAD', type: 'GIT_REPOSITORY' as const },
        { path: '/.env', type: 'ENV_FILE' as const },
        { path: '/sitemap.xml', type: 'SITEMAP_INDEX' as const },
        { path: '/graphql', type: 'GRAPHQL_SCHEMA' as const },
        { path: '/swagger.json', type: 'API_DOCS' as const },
        { path: '/.DS_Store', type: 'DS_STORE' as const },
      ];

      for (const probe of probeList) {
        const probeTargetUrl = `${raw}${probe.path}`;
        const probeResult = await fetchProbeWithFallbacks(probeTargetUrl);
        if (probeResult) {
          // Collect headers from root or robots
          if (probe.path === '/' || probe.path === '/robots.txt' || Object.keys(targetHeaders).length === 0) {
            targetHeaders = { ...targetHeaders, ...probeResult.headers };
          }

          const status = probeResult.status;
          const text = probeResult.text;

          // Extract emails from body
          const emailMatches = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
          emailMatches.forEach(em => {
            const c = em.toLowerCase().trim();
            if (!c.match(/\.(png|jpg|jpeg|gif|svg|webp|css|js|ico|woff|woff2|ttf)$/i)) {
              newEmails.add(c);
            }
          });

          // Robots parsing
          if (probe.path === '/robots.txt' && status === 200) {
            const disallowMatches = (text.match(/Disallow:\s*([^\r\n#]+)/gi) || []).map(l => l.replace(/Disallow:\s*/i, '').trim()).filter(Boolean);
            const allowMatches = (text.match(/Allow:\s*([^\r\n#]+)/gi) || []).map(l => l.replace(/Allow:\s*/i, '').trim()).filter(Boolean);
            const sitemapMatches = (text.match(/Sitemap:\s*([^\r\n#]+)/gi) || []).map(l => l.replace(/Sitemap:\s*/i, '').trim()).filter(Boolean);

            newRobotsRoutes.push(...disallowMatches, ...allowMatches, ...sitemapMatches);

            if (!newExposures.some(e => e.path === '/robots.txt')) {
              newExposures.push({
                id: `exp-${Date.now()}-robots`,
                path: '/robots.txt',
                url: probeResult.url,
                status,
                severity: disallowMatches.length > 5 ? 'MEDIUM' : 'INFO',
                evidence: `Exposes ${disallowMatches.length} hidden routes and ${sitemapMatches.length} sitemaps`,
                type: 'ROBOTS_DISALLOW',
              });
            }
          }

          // Security.txt parsing
          if (probe.path === '/.well-known/security.txt' && status === 200) {
            if (!newExposures.some(e => e.path === '/.well-known/security.txt')) {
              newExposures.push({
                id: `exp-${Date.now()}-sectxt`,
                path: '/.well-known/security.txt',
                url: probeResult.url,
                status,
                severity: 'INFO',
                evidence: `RFC 9116 security disclosure published with contact info`,
                type: 'SECURITY_TXT',
              });
            }
          }

          // Git repository exposure
          if (probe.path === '/.git/HEAD' && (text.includes('ref: refs/heads/') || (status === 200 && text.trim().length === 41))) {
            if (!newExposures.some(e => e.path === '/.git/HEAD')) {
              newExposures.push({
                id: `exp-${Date.now()}-git`,
                path: '/.git/HEAD',
                url: probeResult.url,
                status,
                severity: 'CRITICAL',
                evidence: `Exposed Git repository metadata: "${text.slice(0, 80).trim()}"`,
                type: 'GIT_REPOSITORY',
              });
            }
          }

          // Env file exposure
          if (probe.path === '/.env' && status === 200 && (text.includes('APP_') || text.includes('DB_') || text.includes('KEY=') || text.includes('SECRET='))) {
            if (!newExposures.some(e => e.path === '/.env')) {
              newExposures.push({
                id: `exp-${Date.now()}-env`,
                path: '/.env',
                url: probeResult.url,
                status,
                severity: 'CRITICAL',
                evidence: `Environment secrets exposed in plain text: "${text.slice(0, 100)}"`,
                type: 'ENV_FILE',
              });
            }
          }

          // GraphQL probe
          if (probe.path === '/graphql' && status === 200 && text.includes('__schema')) {
            if (!newExposures.some(e => e.path === '/graphql')) {
              newExposures.push({
                id: `exp-${Date.now()}-graphql`,
                path: '/graphql',
                url: probeResult.url,
                status,
                severity: 'HIGH',
                evidence: 'Public GraphQL endpoint exposes full introspection schema',
                type: 'GRAPHQL_SCHEMA',
              });
            }
          }

          // Swagger API Docs
          if (probe.path === '/swagger.json' && status === 200 && (text.includes('swagger') || text.includes('openapi'))) {
            if (!newExposures.some(e => e.path === '/swagger.json')) {
              newExposures.push({
                id: `exp-${Date.now()}-swagger`,
                path: '/swagger.json',
                url: probeResult.url,
                status,
                severity: 'MEDIUM',
                evidence: 'Public Swagger/OpenAPI specification exposed',
                type: 'API_DOCS',
              });
            }
          }

          // Detect tech from headers and text if not already populated
          if (targetTechs.length === 0) {
            targetTechs = extractTechFromClient(targetHeaders, text);
          }
        }
      }

      // 6. Subdomain DNS Live Verification
      const subList = Array.from(discoveredSubdomains).slice(0, 25);
      for (let i = 0; i < subList.length; i++) {
        const sub = subList[i];
        if (!discoveredAssetsMap.has(sub)) {
          const record = await resolveDoH(sub);
          if (record) {
            discoveredAssetsMap.set(sub, {
              id: `ast-${Date.now()}-${i}`,
              fqdn: sub,
              ip: record.ip,
              cname: record.cname,
              status: record.cname && !record.ip ? 'DANGLING_CNAME' : 'ACTIVE',
              source: 'DNS_DOH',
            });
          } else {
            discoveredAssetsMap.set(sub, {
              id: `ast-${Date.now()}-${i}`,
              fqdn: sub,
              ip: 'Unresolved',
              status: 'UNRESOLVED',
              source: 'CRT_SH',
            });
          }
        }
      }

      // Commit State
      const assetsList = Array.from(discoveredAssetsMap.values());
      setAssets(assetsList);
      setExposures(newExposures);
      setRobotsRoutes(Array.from(new Set(newRobotsRoutes)));
      setRawHeaders(targetHeaders);
      setTechnologies(targetTechs);
      setSecurityAudit(targetAudit || generateClientSecurityAudit(targetHeaders));

      const emailList: HarvestedEmail[] = Array.from(newEmails).map((em, i) => ({
        id: `email-${i + 1}`,
        email: em,
        source: em.includes('hostmaster') ? 'DNS SOA Record' : 'Web Metadata / Security.txt',
      }));
      setEmails(emailList);

      setProgressPercent(100);
      setScanPhase(`Recon complete. ${assetsList.length} assets, ${newExposures.length} exposures, ${emailList.length} emails, ${targetTechs.length} technologies identified.`);
    } catch (e: any) {
      setScanPhase(`Recon scan encountered error: ${e.message}`);
    } finally {
      setIsScanning(false);
    }
  };

  const copyText = (val: string, key: string) => {
    navigator.clipboard.writeText(val);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const exportAssetsCsv = () => {
    const csvContent = [
      ['FQDN', 'Resolved IP', 'CNAME Record', 'Status', 'Discovery Source'].join(','),
      ...assets.map(a => [
        `"${a.fqdn}"`,
        `"${a.ip}"`,
        `"${a.cname || ''}"`,
        a.status,
        a.source,
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ATTACK_SURFACE_${targetDomain}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportSubdomainsTxt = () => {
    const txt = assets.map(a => a.fqdn).sort().join('\n');
    const blob = new Blob([txt], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `subdomains-${targetDomain}-${Date.now()}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const filteredAssets = assets.filter(a => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return a.fqdn.toLowerCase().includes(q) || a.ip.toLowerCase().includes(q) || (a.cname && a.cname.toLowerCase().includes(q));
  });

  return (
    <div className="flex-1 w-full h-full flex flex-col overflow-hidden bg-[#000000] font-mono text-neutral-200 select-text">
      {/* 1. Command Input Header */}
      <div className="p-3 bg-[#0a0a0a] border-b border-neutral-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-none bg-cyan-400 animate-pulse" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            ATTACK SURFACE & EXPOSURE SPIDER
          </span>
          <span className="text-[10px] px-1.5 py-0.2 bg-neutral-900 border border-neutral-800 text-neutral-400">
            PASSIVE CRT + DOH DNS + CORS-FREE PROBE ENGINE
          </span>
        </div>

        <div className="flex items-center gap-2">
          {assets.length > 0 && (
            <>
              <button
                onClick={exportSubdomainsTxt}
                className="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Export subdomains list formatted for SecLists / ffuf"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span>Export Subdomains (.txt)</span>
              </button>
              <button
                onClick={exportAssetsCsv}
                className="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Export full inventory as CSV"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Export CSV</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* 2. Target Bar & Execution Strip */}
      <div className="p-3 bg-[#050505] border-b border-neutral-800 shrink-0 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-[280px]">
            <div className="relative flex-1">
              <Globe className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={targetDomain}
                onChange={(e) => setTargetDomain(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !isScanning && handleExecuteSpider()}
                placeholder="Enter target domain (e.g. scanme.nmap.org, example.com)..."
                className="w-full pl-8 pr-3 py-1.5 bg-[#000000] border border-neutral-800 text-neutral-200 placeholder-neutral-600 text-xs font-mono focus:outline-none focus:border-neutral-600"
              />
            </div>

            <button
              onClick={handleExecuteSpider}
              disabled={isScanning || !targetDomain.trim()}
              className="px-4 py-1.5 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-800/80 text-cyan-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              {isScanning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isScanning ? 'Scanning...' : 'Launch Recon Spider'}</span>
            </button>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-neutral-500">
            <span>Target IP:</span>
            <strong className="text-white font-mono">{targetIp || 'Unresolved'}</strong>
          </div>
        </div>

        {/* Live Progress Phase */}
        {isScanning && (
          <div className="space-y-1 pt-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-cyan-400 font-mono animate-pulse">{scanPhase}</span>
              <span className="text-neutral-400">{progressPercent}%</span>
            </div>
            <div className="w-full h-1 bg-neutral-900 overflow-hidden">
              <div
                className="h-full bg-cyan-500 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* 3. Operational Navigation Deck */}
      <div className="p-2.5 bg-[#0a0a0a] border-b border-neutral-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex flex-wrap items-center gap-1 border border-neutral-800">
          <button
            onClick={() => setActiveDeckTab('ASSETS')}
            className={`px-3 py-1 text-xs font-bold uppercase transition-colors cursor-pointer ${
              activeDeckTab === 'ASSETS'
                ? 'bg-neutral-800 text-white'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            Subdomains ({assets.length})
          </button>
          <button
            onClick={() => setActiveDeckTab('EXPOSURES')}
            className={`px-3 py-1 text-xs font-bold uppercase transition-colors cursor-pointer ${
              activeDeckTab === 'EXPOSURES'
                ? 'bg-neutral-800 text-white'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            Exposures ({exposures.length})
          </button>
          <button
            onClick={() => setActiveDeckTab('EMAILS')}
            className={`px-3 py-1 text-xs font-bold uppercase transition-colors cursor-pointer ${
              activeDeckTab === 'EMAILS'
                ? 'bg-neutral-800 text-white'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            Harvested Emails ({emails.length})
          </button>
          <button
            onClick={() => setActiveDeckTab('ROBOTS')}
            className={`px-3 py-1 text-xs font-bold uppercase transition-colors cursor-pointer ${
              activeDeckTab === 'ROBOTS'
                ? 'bg-neutral-800 text-white'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            Robots & Routes ({robotsRoutes.length})
          </button>
          <button
            onClick={() => setActiveDeckTab('HEADERS')}
            className={`px-3 py-1 text-xs font-bold uppercase transition-colors cursor-pointer ${
              activeDeckTab === 'HEADERS'
                ? 'bg-neutral-800 text-white'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            Headers & Tech ({Object.keys(rawHeaders).length + technologies.length})
          </button>
        </div>

        {/* Global Tab Filter */}
        <div className="relative w-64">
          <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-2 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Filter current view..."
            className="w-full pl-7 pr-3 py-1 bg-[#000000] border border-neutral-800 text-neutral-300 placeholder-neutral-600 text-xs font-mono focus:outline-none focus:border-neutral-600"
          />
        </div>
      </div>

      {/* 4. Active Tab Content Canvas */}
      <div className="flex-1 overflow-auto bg-[#000000]">
        {/* Tab 1: Discovered Subdomains & Assets */}
        {activeDeckTab === 'ASSETS' && (
          assets.length === 0 ? (
            <div className="p-16 text-center text-xs text-neutral-600">
              No discovered assets to display. Click "Launch Recon Spider" to start real target enumeration.
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-800 bg-[#050505] text-neutral-500 text-[10px] uppercase">
                  <th className="p-2.5 font-bold">FQDN Subdomain</th>
                  <th className="p-2.5 font-bold">Resolved IP</th>
                  <th className="p-2.5 font-bold">CNAME Alias</th>
                  <th className="p-2.5 font-bold">Status</th>
                  <th className="p-2.5 font-bold">Source</th>
                  <th className="p-2.5 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-900 font-mono">
                {filteredAssets.map((asset) => {
                  const isDangling = asset.status === 'DANGLING_CNAME';
                  const isUnresolved = asset.status === 'UNRESOLVED';

                  return (
                    <tr
                      key={asset.id}
                      className={`hover:bg-neutral-950 transition-colors ${
                        isDangling ? 'bg-rose-950/20' : ''
                      }`}
                    >
                      <td className="p-2.5 font-bold text-white flex items-center gap-1.5">
                        {isDangling && <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />}
                        <span className="select-all">{asset.fqdn}</span>
                      </td>
                      <td className="p-2.5 text-cyan-400 select-all">
                        {asset.ip}
                      </td>
                      <td className="p-2.5 text-neutral-400 select-all">
                        {asset.cname || '—'}
                      </td>
                      <td className="p-2.5">
                        <span className={`px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                          isDangling ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                          isUnresolved ? 'bg-neutral-900 text-neutral-500 border border-neutral-800' :
                          'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        }`}>
                          {asset.status}
                        </span>
                      </td>
                      <td className="p-2.5 text-neutral-500 text-[11px]">
                        {asset.source}
                      </td>
                      <td className="p-2.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {asset.ip !== 'Unresolved' && (
                            <button
                              onClick={() => onPivotToSoc?.(asset.ip)}
                              className="px-2 py-0.5 border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-[10px] cursor-pointer"
                              title="Pivot to SOC Center"
                            >
                              SOC
                            </button>
                          )}
                          <a
                            href={`https://${asset.fqdn}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white cursor-pointer"
                            title="Open Target Endpoint"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )
        )}

        {/* Tab 2: Sensitive Exposures */}
        {activeDeckTab === 'EXPOSURES' && (
          exposures.length === 0 ? (
            <div className="p-16 text-center text-xs text-neutral-600">
              No sensitive misconfigurations or exposed repository trees detected on target.
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {exposures.map(exp => {
                const isCrit = exp.severity === 'CRITICAL';
                const isHigh = exp.severity === 'HIGH';

                return (
                  <div
                    key={exp.id}
                    className={`p-3 border transition-colors ${
                      isCrit ? 'bg-rose-950/20 border-rose-800' :
                      isHigh ? 'bg-amber-950/20 border-amber-800' :
                      'bg-neutral-950 border-neutral-850'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                          isCrit ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                          isHigh ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                          'bg-neutral-900 text-neutral-400 border border-neutral-800'
                        }`}>
                          {exp.severity}
                        </span>
                        <span className="text-xs font-bold text-white font-mono">
                          {exp.path}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 bg-neutral-900 text-cyan-400 border border-neutral-800">
                          HTTP {exp.status}
                        </span>
                      </div>

                      <a
                        href={exp.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-neutral-400 hover:text-white flex items-center gap-1 text-[11px]"
                      >
                        <span>Open URL</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    <div className="text-xs text-neutral-300 font-mono select-all">
                      {exp.evidence}
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}

        {/* Tab 3: Harvested Contacts */}
        {activeDeckTab === 'EMAILS' && (
          emails.length === 0 ? (
            <div className="p-16 text-center text-xs text-neutral-600">
              No public email addresses harvested from target web metadata or security disclosures.
            </div>
          ) : (
            <div className="p-4 space-y-2">
              <div className="text-xs text-neutral-400 font-bold uppercase mb-2">
                RECON HARVESTED EMAIL CONTACTS ({emails.length})
              </div>
              <div className="divide-y divide-neutral-900 border border-neutral-800 bg-[#050505]">
                {emails.map(em => (
                  <div key={em.id} className="p-3 flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="text-white font-bold select-all">{em.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-neutral-500">
                      <span>{em.source}</span>
                      <button
                        onClick={() => copyText(em.email, em.id)}
                        className="p-1 border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-[10px] cursor-pointer"
                      >
                        {copiedKey === em.id ? <Check className="w-3 h-3 text-emerald-400 inline" /> : 'Copy'}
                      </button>
                      <a
                        href={`mailto:${em.email}`}
                        className="p-1 border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white text-[10px]"
                      >
                        Mailto
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        )}

        {/* Tab 4: Robots & Routes */}
        {activeDeckTab === 'ROBOTS' && (
          robotsRoutes.length === 0 ? (
            <div className="p-16 text-center text-xs text-neutral-600">
              No robots.txt routes cataloged for target domain.
            </div>
          ) : (
            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between text-xs text-neutral-400 font-bold uppercase mb-2">
                <span>DISALLOWED / ALLOWED ROUTES HARVESTED FROM ROBOTS.TXT & SITEMAPS ({robotsRoutes.length})</span>
                <button
                  onClick={() => copyText(robotsRoutes.join('\n'), 'routes-all')}
                  className="text-cyan-400 hover:text-cyan-300 text-[11px] flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === 'routes-all' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>Copy All Routes</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {robotsRoutes
                  .filter(r => !searchFilter || r.toLowerCase().includes(searchFilter.toLowerCase()))
                  .map((route, i) => (
                    <div key={i} className="p-2 bg-[#050505] border border-neutral-850 text-xs font-mono text-neutral-300 truncate select-all flex items-center justify-between">
                      <span className="truncate">{route}</span>
                      <button
                        onClick={() => copyText(route, `route-${i}`)}
                        className="text-neutral-500 hover:text-white p-0.5"
                      >
                        {copiedKey === `route-${i}` ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5" />}
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )
        )}

        {/* Tab 5: Headers & Tech Stack */}
        {activeDeckTab === 'HEADERS' && (
          Object.keys(rawHeaders).length === 0 && technologies.length === 0 ? (
            <div className="p-16 text-center text-xs text-neutral-600">
              No HTTP response headers or technologies captured yet. Launch spider to inspect live server banners.
            </div>
          ) : (
            <div className="p-4 space-y-6">
              {/* Section A: Detected Technologies */}
              <div>
                <div className="flex items-center justify-between text-xs text-neutral-400 font-bold uppercase mb-2">
                  <span className="flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                    DETECTED TECHNOLOGIES & PLATFORMS ({technologies.length})
                  </span>
                </div>
                {technologies.length === 0 ? (
                  <div className="p-4 border border-neutral-850 bg-[#050505] text-xs text-neutral-500">
                    No distinctive server banners or frontend framework signatures identified.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {technologies.map((t, idx) => (
                      <div key={idx} className="p-3 bg-[#050505] border border-neutral-800 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-white font-bold text-xs">{t.name}</span>
                          <span className="text-[9px] px-1.5 py-0.2 bg-neutral-900 border border-neutral-800 text-cyan-400">
                            {t.category}
                          </span>
                        </div>
                        {t.evidence && (
                          <div className="text-[10px] text-neutral-500 font-mono truncate select-all">
                            Signature: {t.evidence}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Section B: Security Headers Compliance Audit */}
              {securityAudit && (
                <div>
                  <div className="flex items-center justify-between text-xs text-neutral-400 font-bold uppercase mb-2">
                    <span className="flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-emerald-400" />
                      SECURITY HEADERS COMPLIANCE AUDIT
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-neutral-400">Score: {securityAudit.score}/100</span>
                      <span className={`px-2 py-0.5 text-xs font-bold ${
                        securityAudit.grade === 'A+' || securityAudit.grade === 'A' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                        securityAudit.grade === 'B' || securityAudit.grade === 'C' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                        'bg-rose-950 text-rose-300 border border-rose-800'
                      }`}>
                        GRADE {securityAudit.grade}
                      </span>
                    </div>
                  </div>

                  <div className="border border-neutral-800 divide-y divide-neutral-900 bg-[#050505]">
                    {securityAudit.findings.map((f, i) => (
                      <div key={i} className="p-3 flex items-start justify-between gap-4 text-xs font-mono">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            {f.status === 'pass' ? (
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            ) : (
                              <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                            )}
                            <span className="text-white font-bold">{f.header}</span>
                            <span className="text-[9px] px-1.5 py-0.2 bg-neutral-900 border border-neutral-800 text-neutral-400 uppercase">
                              {f.importance}
                            </span>
                          </div>
                          <div className="text-[11px] text-neutral-400">
                            {f.description}
                          </div>
                          {f.status === 'fail' && (
                            <div className="text-[10px] text-amber-400/90">
                              Remediation: {f.recommendation}
                            </div>
                          )}
                        </div>

                        {f.value && (
                          <div className="text-[10px] text-neutral-500 max-w-xs truncate select-all">
                            {f.value}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Section C: Live HTTP Response Headers */}
              <div>
                <div className="flex items-center justify-between text-xs text-neutral-400 font-bold uppercase mb-2">
                  <span>LIVE HTTP RESPONSE HEADERS AUDIT ({Object.keys(rawHeaders).length})</span>
                  <button
                    onClick={() => copyText(JSON.stringify(rawHeaders, null, 2), 'headers-all')}
                    className="text-cyan-400 hover:text-cyan-300 text-[11px] flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === 'headers-all' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>Copy All Headers</span>
                  </button>
                </div>
                <div className="border border-neutral-800 divide-y divide-neutral-900 bg-[#050505]">
                  {Object.entries(rawHeaders).map(([k, v], i) => (
                    <div key={i} className="p-2.5 flex items-center justify-between text-xs font-mono">
                      <span className="text-cyan-400 font-bold">{k}</span>
                      <span className="text-neutral-300 max-w-xl truncate select-all">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};
