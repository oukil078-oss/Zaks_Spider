import React, { useState } from 'react';
import { 
  Globe, Search, RefreshCw, ShieldAlert, AlertTriangle, 
  CheckCircle2, ExternalLink, Download, Layers, Server, 
  Code2, Key, Shield, Filter, Copy, Check, ChevronRight,
  Database, Terminal, ArrowUpRight, Cpu, Mail, FileText, X, Play
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

interface SpiderAttackSurfaceViewProps {
  onPivotToSoc?: (ip: string) => void;
  onPivotToForensics?: (url: string) => void;
  onPivotToSwarm?: (target: string) => void;
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

  // Main Spider & Exposure Engine Execution (100% Real Results)
  const handleExecuteSpider = async () => {
    const raw = targetDomain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    if (!raw) return;

    setIsScanning(true);
    setProgressPercent(5);
    setScanPhase(`Phase 1/5: Resolving root domain DNS & CNAME via Cloudflare DoH...`);

    const discoveredSubdomains = new Set<string>();
    discoveredSubdomains.add(raw);
    discoveredSubdomains.add(`www.${raw}`);

    const newExposures: DiscoveredExposure[] = [];
    const newEmails = new Set<string>();
    const newRobotsRoutes: string[] = [];
    const discoveredAssetsMap = new Map<string, DiscoveredAsset>();

    try {
      // 1. Resolve Root Domain A-record
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
      setProgressPercent(40);
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

      // 4. DNS Live Verification of Top Subdomains
      setProgressPercent(60);
      setScanPhase(`Phase 4/5: Verifying live resolution across ${discoveredSubdomains.size} subdomains...`);
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

      // 5. Active Sensitive File & Misconfiguration Probing (Origin Endpoint)
      setProgressPercent(80);
      setScanPhase(`Phase 5/5: Probing sensitive paths (/.git/HEAD, .env, robots.txt, security.txt)...`);
      const targetOrigin = `https://${raw}`;

      const probeTargets = [
        { path: '/robots.txt', type: 'ROBOTS_DISALLOW' as const },
        { path: '/.git/HEAD', type: 'GIT_REPOSITORY' as const },
        { path: '/.env', type: 'ENV_FILE' as const },
        { path: '/.well-known/security.txt', type: 'SECURITY_TXT' as const },
        { path: '/sitemap.xml', type: 'SITEMAP_INDEX' as const },
        { path: '/graphql', type: 'GRAPHQL_SCHEMA' as const },
        { path: '/swagger.json', type: 'API_DOCS' as const },
        { path: '/.DS_Store', type: 'DS_STORE' as const },
      ];

      for (const probe of probeTargets) {
        try {
          const res = await fetch(`${targetOrigin}${probe.path}`, {
            headers: { 'Accept': '*/*' },
            signal: AbortSignal.timeout(3500),
          }).catch(() => null);

          if (res) {
            const status = res.status;
            let text = '';
            try { text = await res.text(); } catch {}

            // Save response headers on root/robots
            if (probe.path === '/robots.txt' || probe.path === '/.well-known/security.txt') {
              const headersObj: Record<string, string> = {};
              res.headers.forEach((val, k) => { headersObj[k.toLowerCase()] = val; });
              setRawHeaders(headersObj);
            }

            // A. Git Repository Exposure Check
            if (probe.type === 'GIT_REPOSITORY') {
              if (text.includes('ref: refs/heads/') || (status === 200 && text.trim().length === 41)) {
                newExposures.push({
                  id: `exp-${Date.now()}-git`,
                  path: probe.path,
                  url: `${targetOrigin}${probe.path}`,
                  status,
                  severity: 'CRITICAL',
                  evidence: `Exposed Git repository metadata: "${text.slice(0, 80).trim()}"`,
                  type: 'GIT_REPOSITORY',
                });
              } else if (status === 200 || status === 403) {
                newExposures.push({
                  id: `exp-${Date.now()}-git-stat`,
                  path: probe.path,
                  url: `${targetOrigin}${probe.path}`,
                  status,
                  severity: status === 200 ? 'HIGH' : 'INFO',
                  evidence: `HTTP ${status} returned for git path`,
                  type: 'GIT_REPOSITORY',
                });
              }
            }

            // B. Environment File Exposure Check
            else if (probe.type === 'ENV_FILE') {
              if (status === 200 && (text.includes('APP_') || text.includes('DB_') || text.includes('KEY=') || text.includes('SECRET='))) {
                newExposures.push({
                  id: `exp-${Date.now()}-env`,
                  path: probe.path,
                  url: `${targetOrigin}${probe.path}`,
                  status,
                  severity: 'CRITICAL',
                  evidence: `Environment secrets exposed in plain text: "${text.slice(0, 100)}"`,
                  type: 'ENV_FILE',
                });
              }
            }

            // C. Robots.txt Analysis & Disallowed Route Extraction
            else if (probe.type === 'ROBOTS_DISALLOW' && status === 200) {
              const disallowMatches = (text.match(/Disallow:\s*([^\r\n]+)/gi) || []).map(l => l.replace(/Disallow:\s*/i, '').trim());
              const allowMatches = (text.match(/Allow:\s*([^\r\n]+)/gi) || []).map(l => l.replace(/Allow:\s*/i, '').trim());
              const combinedRoutes = Array.from(new Set([...disallowMatches, ...allowMatches]));
              newRobotsRoutes.push(...combinedRoutes);

              newExposures.push({
                id: `exp-${Date.now()}-robots`,
                path: probe.path,
                url: `${targetOrigin}${probe.path}`,
                status,
                severity: disallowMatches.length > 5 ? 'MEDIUM' : 'INFO',
                evidence: `Exposes ${disallowMatches.length} hidden disallowed endpoints in robots.txt`,
                type: 'ROBOTS_DISALLOW',
              });

              // Extract any emails in robots.txt comments
              const emailMatches = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
              emailMatches.forEach(em => newEmails.add(em.toLowerCase()));
            }

            // D. Security.txt (RFC 9116)
            else if (probe.type === 'SECURITY_TXT' && status === 200) {
              const contactMatches = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
              contactMatches.forEach(em => newEmails.add(em.toLowerCase()));

              newExposures.push({
                id: `exp-${Date.now()}-sec-txt`,
                path: probe.path,
                url: `${targetOrigin}${probe.path}`,
                status,
                severity: 'INFO',
                evidence: `RFC 9116 Security contact published (${contactMatches.join(', ') || 'URL link'})`,
                type: 'SECURITY_TXT',
              });
            }

            // E. GraphQL Introspection Probe
            else if (probe.type === 'GRAPHQL_SCHEMA') {
              if (status === 200 && text.includes('__schema')) {
                newExposures.push({
                  id: `exp-${Date.now()}-graphql`,
                  path: probe.path,
                  url: `${targetOrigin}${probe.path}`,
                  status,
                  severity: 'HIGH',
                  evidence: 'Full GraphQL schema introspection enabled on public endpoint',
                  type: 'GRAPHQL_SCHEMA',
                });
              }
            }

            // F. API Documentation Exposure
            else if (probe.type === 'API_DOCS' && status === 200 && (text.includes('swagger') || text.includes('openapi'))) {
              newExposures.push({
                id: `exp-${Date.now()}-api`,
                path: probe.path,
                url: `${targetOrigin}${probe.path}`,
                status,
                severity: 'MEDIUM',
                evidence: 'Public Swagger/OpenAPI specification exposed',
                type: 'API_DOCS',
              });
            }
          }
        } catch {
          // Path probe error / timeout
        }
      }

      // Convert Discovered Assets
      const assetsList = Array.from(discoveredAssetsMap.values());
      setAssets(assetsList);
      setExposures(newExposures);
      setRobotsRoutes(newRobotsRoutes);

      const emailList: HarvestedEmail[] = Array.from(newEmails).map((em, i) => ({
        id: `email-${i + 1}`,
        email: em,
        source: 'Web Metadata / Security.txt',
      }));
      setEmails(emailList);

      setProgressPercent(100);
      setScanPhase(`Recon complete. ${assetsList.length} assets verified, ${newExposures.length} exposures detected, ${emailList.length} contacts found.`);
    } catch (e: any) {
      setScanPhase(`Recon scan encountered network error: ${e.message}`);
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
            PASSIVE CRT + DOH DNS + EXPOSURE PROBER
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
            Subdomains & Assets ({assets.length})
          </button>

          <button
            onClick={() => setActiveDeckTab('EXPOSURES')}
            className={`px-3 py-1 text-xs font-bold uppercase transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeDeckTab === 'EXPOSURES'
                ? 'bg-neutral-800 text-white'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            <span>Sensitive Exposures</span>
            <span className={`text-[10px] px-1 py-0.2 font-bold ${
              exposures.some(e => e.severity === 'CRITICAL') ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-neutral-900 text-neutral-400'
            }`}>
              {exposures.length}
            </span>
          </button>

          <button
            onClick={() => setActiveDeckTab('EMAILS')}
            className={`px-3 py-1 text-xs font-bold uppercase transition-colors cursor-pointer ${
              activeDeckTab === 'EMAILS'
                ? 'bg-neutral-800 text-white'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            Harvested Contacts ({emails.length})
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
            Headers & Tech Stack
          </button>
        </div>

        {activeDeckTab === 'ASSETS' && (
          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Filter subdomains or IPs..."
              className="w-full pl-8 pr-3 py-1 bg-[#000000] border border-neutral-800 text-neutral-200 placeholder-neutral-600 text-xs focus:outline-none focus:border-neutral-600"
            />
          </div>
        )}
      </div>

      {/* 4. Main Telemetry Body */}
      <div className="flex-1 overflow-auto bg-[#000000]">
        {/* Tab 1: Subdomains & Assets */}
        {activeDeckTab === 'ASSETS' && (
          filteredAssets.length === 0 ? (
            <div className="p-16 text-center text-xs text-neutral-600">
              {isScanning ? 'Executing multi-source asset discovery...' : 'No assets scanned yet. Enter target domain and click "Launch Recon Spider".'}
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#050505] border-b border-neutral-800 text-[10px] uppercase text-neutral-500 sticky top-0 z-10">
                <tr>
                  <th className="p-2.5 font-bold">STATUS</th>
                  <th className="p-2.5 font-bold">FQDN SUBDOMAIN</th>
                  <th className="p-2.5 font-bold">RESOLVED IPv4</th>
                  <th className="p-2.5 font-bold">CNAME POINTER</th>
                  <th className="p-2.5 font-bold">SOURCE</th>
                  <th className="p-2.5 font-bold text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-900 font-mono text-[11px]">
                {filteredAssets.map(asset => {
                  const isActive = asset.status === 'ACTIVE';
                  const isDangling = asset.status === 'DANGLING_CNAME';

                  return (
                    <tr key={asset.id} className="transition-colors hover:bg-neutral-950">
                      <td className="p-2.5 whitespace-nowrap">
                        <span className={`px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                          isActive ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                          isDangling ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                          'bg-neutral-900 text-neutral-500 border border-neutral-800'
                        }`}>
                          {asset.status}
                        </span>
                      </td>

                      <td className="p-2.5 whitespace-nowrap font-bold text-white select-all">
                        {asset.fqdn}
                      </td>

                      <td className="p-2.5 whitespace-nowrap font-mono text-cyan-400 select-all">
                        {asset.ip}
                      </td>

                      <td className="p-2.5 max-w-xs text-neutral-400 truncate">
                        {asset.cname || <span className="text-neutral-600">-</span>}
                      </td>

                      <td className="p-2.5 whitespace-nowrap text-neutral-500 text-[10px]">
                        {asset.source}
                      </td>

                      <td className="p-2.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {asset.ip !== 'Unresolved' && onPivotToSoc && (
                            <button
                              onClick={() => onPivotToSoc(asset.ip)}
                              className="px-2 py-0.5 border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-[10px] cursor-pointer"
                              title="Pivot to SOC Investigation"
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
                <span>DISALLOWED / ALLOWED ROUTES HARVESTED FROM ROBOTS.TXT ({robotsRoutes.length})</span>
                <button
                  onClick={() => copyText(robotsRoutes.join('\n'), 'routes-all')}
                  className="text-cyan-400 hover:text-cyan-300 text-[11px] flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === 'routes-all' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>Copy All Routes</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {robotsRoutes.map((route, i) => (
                  <div key={i} className="p-2 bg-[#050505] border border-neutral-850 text-xs font-mono text-neutral-300 truncate select-all">
                    {route}
                  </div>
                ))}
              </div>
            </div>
          )
        )}

        {/* Tab 5: Headers & Tech Stack */}
        {activeDeckTab === 'HEADERS' && (
          Object.keys(rawHeaders).length === 0 ? (
            <div className="p-16 text-center text-xs text-neutral-600">
              No HTTP response headers captured yet. Launch spider to inspect live server banners.
            </div>
          ) : (
            <div className="p-4 space-y-2">
              <div className="text-xs text-neutral-400 font-bold uppercase mb-2">
                LIVE HTTP RESPONSE HEADERS AUDIT
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
          )
        )}
      </div>
    </div>
  );
};
