import React, { useState, useEffect } from 'react';
import { 
  Radar, 
  Globe, 
  ShieldAlert, 
  Mail, 
  Network, 
  FileText, 
  Sparkles, 
  Search, 
  ExternalLink, 
  Copy, 
  Check, 
  Terminal, 
  AlertTriangle, 
  ShieldCheck, 
  Layers,
  Server,
  BookmarkPlus,
  RefreshCw,
  Lock,
  Zap,
  Newspaper
} from 'lucide-react';
import { ScrapedResult, ThreatAnalysis, CybersecNewsItem } from '../../types';
import { api } from '../../services/api';

interface WebSpiderViewProps {
  onWeaveScrapedResultToBrain: (result: ScrapedResult, analysis?: ThreatAnalysis) => void;
}

type SpiderSubTab = 'overview' | 'subdomains' | 'emails' | 'paths' | 'security' | 'tech' | 'intel' | 'console';

export const WebSpiderView: React.FC<WebSpiderViewProps> = ({
  onWeaveScrapedResultToBrain,
}) => {
  const [targetUrl, setTargetUrl] = useState('https://owasp.org');
  const [isCrawling, setIsCrawling] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<SpiderSubTab>('overview');
  const [crawledData, setCrawledData] = useState<ScrapedResult | null>(null);
  const [threatAnalysis, setThreatAnalysis] = useState<ThreatAnalysis | null>(null);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [newsFeed, setNewsFeed] = useState<CybersecNewsItem[]>([]);
  const [subdomainSearch, setSubdomainSearch] = useState('');
  const [emailSearch, setEmailSearch] = useState('');

  const presets = [
    'https://owasp.org',
    '199.16.129.142',
    'https://thehackernews.com',
    'his.edu.dz'
  ];

  const log = (msg: string) => {
    setConsoleLogs(prev => [...prev.slice(-35), `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleStartCrawl = async (urlToCrawl?: string) => {
    const url = (urlToCrawl || targetUrl).trim();
    if (!url || isCrawling) return;

    setIsCrawling(true);
    setCrawledData(null);
    setThreatAnalysis(null);
    log(`🕷️ Initiating Arachnid Recon Spider on target: ${url}`);
    log('🕸️ Weaving network probes: DNS resolution, SSL cert extraction, crt.sh query...');

    try {
      const res = await api.crawlUrl(url);
      if (res.success && res.data) {
        setCrawledData(res.data);
        log(`✓ Target perimeter mapped: ${res.data.subdomains.length} subdomains, ${res.data.emails.length} emails discovered.`);
        log(`🛡️ Auditing defensive security headers (Grade: ${res.data.osint?.security_headers?.grade || 'N/A'})...`);

        // Trigger AI Threat Analysis
        log('🧠 Synthesizing attack surface with Threat Intelligence Engine...');
        const aiRes = await api.analyzeThreat(res.data);
        if (aiRes.success && aiRes.analysis) {
          setThreatAnalysis(aiRes.analysis);
          log(`✓ Threat analysis synthesized. Posture: ${aiRes.analysis.threatLevel}`);
        }
      } else {
        log(`✕ Crawl warning: ${res.error || 'Check target availability'}`);
      }
    } catch (e: any) {
      log(`✕ Spider execution error: ${e.message}`);
    } finally {
      setIsCrawling(false);
    }
  };

  useEffect(() => {
    api.getNews().then(res => {
      if (res.success && res.items) setNewsFeed(res.items);
    });
    // Trigger initial demo crawl for instant feedback
    handleStartCrawl('https://owasp.org');
  }, []);

  const filteredSubdomains = (crawledData?.subdomains || []).filter(s =>
    s.toLowerCase().includes(subdomainSearch.toLowerCase())
  );

  const filteredEmails = (crawledData?.emails || []).filter(e =>
    e.toLowerCase().includes(emailSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-r from-spider-card via-spider-surface to-spider-void border border-cyan-500/20 shadow-spider-glow">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <Globe className="w-5 h-5" />
              </span>
              <h1 className="text-xl sm:text-2xl font-black font-mono tracking-tight text-white flex items-center gap-2">
                ARACHNID WEB CRAWLER & OSINT SPIDER
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-gray-300 font-mono">
              Autonomous multi-vector reconnaissance, crt.sh subdomain mesh, email harvester, and security posture auditor.
            </p>
          </div>

          {crawledData && (
            <button
              onClick={() => onWeaveScrapedResultToBrain(crawledData, threatAnalysis || undefined)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 font-mono font-bold text-xs shadow-purple-glow transition-all"
            >
              <BookmarkPlus className="w-4 h-4" />
              <span>WEAVE TARGET INTO SECOND BRAIN</span>
            </button>
          )}
        </div>
      </div>

      {/* Target URL Input Bar & Presets */}
      <div className="p-4 rounded-xl spider-glass border border-cyan-500/20 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
            <input
              type="text"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleStartCrawl()}
              placeholder="Enter target domain or IP (e.g. owasp.org, 10.10.10.50)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/60 border border-cyan-500/30 text-cyan-300 font-mono text-xs focus:outline-none focus:border-cyan-400 transition"
            />
          </div>

          <button
            onClick={() => handleStartCrawl()}
            disabled={isCrawling}
            className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-mono text-xs font-bold transition-all ${
              isCrawling
                ? 'bg-gray-800 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black shadow-venom-glow'
            }`}
          >
            <Radar className={`w-4 h-4 ${isCrawling ? 'animate-spin' : ''}`} />
            <span>{isCrawling ? 'SPIDER CRAWLING...' : 'DEPLOY SPIDER'}</span>
          </button>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-2 text-xs font-mono text-gray-400 flex-wrap">
          <span className="text-gray-500">QUICK TARGETS:</span>
          {presets.map((p) => (
            <button
              key={p}
              onClick={() => {
                setTargetUrl(p);
                handleStartCrawl(p);
              }}
              className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/5 text-gray-300 hover:text-cyan-300 hover:border-cyan-500/30 transition text-[11px]"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Sub-Tab Switcher Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-mono scrollbar-none border-b border-white/5">
        {[
          { id: 'overview', label: 'Intel Overview', icon: ShieldAlert },
          { id: 'subdomains', label: `Subdomains (${crawledData?.subdomains.length || 0})`, icon: Network },
          { id: 'emails', label: `Emails (${crawledData?.emails.length || 0})`, icon: Mail },
          { id: 'paths', label: 'Web Paths & Robots', icon: FileText },
          { id: 'security', label: `Security & SSL (${crawledData?.osint?.security_headers?.grade || '-'})`, icon: ShieldCheck },
          { id: 'tech', label: `Tech Stack (${crawledData?.osint?.technologies?.length || 0})`, icon: Server },
          { id: 'intel', label: 'Threat AI & CVEs', icon: Sparkles },
          { id: 'console', label: 'Spider Console', icon: Terminal },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as SpiderSubTab)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-t-xl transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-cyan-500/10 text-cyan-300 border-b-2 border-cyan-400 font-bold'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Overview */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          {crawledData ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Target Posture Card */}
              <div className="md:col-span-2 p-5 rounded-2xl spider-glass space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">
                    TARGET RECON PROFILE
                  </span>
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold uppercase ${
                    threatAnalysis?.threatLevel === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                    threatAnalysis?.threatLevel === 'HIGH' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                    'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  }`}>
                    RISK: {threatAnalysis?.threatLevel || 'EVALUATING'}
                  </span>
                </div>

                <div className="space-y-1">
                  <h2 className="text-lg font-bold font-mono text-white break-all">
                    {crawledData.url}
                  </h2>
                  <p className="text-xs text-gray-300">
                    {crawledData.metadata.title}
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-[10px] font-mono text-gray-400 block">HTTP STATUS</span>
                    <span className="text-base font-bold font-mono text-emerald-400">
                      {crawledData.metadata.status} OK
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-[10px] font-mono text-gray-400 block">SERVER</span>
                    <span className="text-xs font-bold font-mono text-white truncate block">
                      {crawledData.metadata.server || 'Generic/CDN'}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-[10px] font-mono text-gray-400 block">HEADERS GRADE</span>
                    <span className="text-base font-bold font-mono text-cyan-400">
                      {crawledData.osint?.security_headers?.grade || 'N/A'}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                    <span className="text-[10px] font-mono text-gray-400 block">HOST IP</span>
                    <span className="text-xs font-bold font-mono text-purple-300 truncate block">
                      {crawledData.osint?.target_ip || 'Resolved'}
                    </span>
                  </div>
                </div>

                {threatAnalysis && (
                  <div className="p-3.5 rounded-xl bg-black/50 border border-cyan-500/20 space-y-1.5">
                    <span className="text-xs font-mono font-bold text-cyan-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      EXECUTIVE PERIMETER SUMMARY:
                    </span>
                    <p className="text-xs text-gray-300 leading-relaxed font-sans">
                      {threatAnalysis.summary}
                    </p>
                  </div>
                )}
              </div>

              {/* Surface Stats Card */}
              <div className="p-5 rounded-2xl spider-glass space-y-4 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-mono text-gray-400 uppercase tracking-wider block mb-3">
                    ATTACK PERIMETER METRICS
                  </span>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/5">
                      <span className="text-xs font-mono text-gray-300 flex items-center gap-2">
                        <Network className="w-4 h-4 text-cyan-400" />
                        Subdomains Mapped
                      </span>
                      <span className="text-xs font-mono font-bold text-cyan-300">
                        {crawledData.subdomains.length}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/5">
                      <span className="text-xs font-mono text-gray-300 flex items-center gap-2">
                        <Mail className="w-4 h-4 text-emerald-400" />
                        Harvested Emails
                      </span>
                      <span className="text-xs font-mono font-bold text-emerald-300">
                        {crawledData.emails.length}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/5">
                      <span className="text-xs font-mono text-gray-300 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-purple-400" />
                        Internal Endpoints
                      </span>
                      <span className="text-xs font-mono font-bold text-purple-300">
                        {crawledData.links.total_internal}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/5">
                      <span className="text-xs font-mono text-gray-300 flex items-center gap-2">
                        <Lock className="w-4 h-4 text-orange-400" />
                        Robots Rules
                      </span>
                      <span className="text-xs font-mono font-bold text-orange-300">
                        {crawledData.osint?.robots_txt?.disallow.length || 0}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onWeaveScrapedResultToBrain(crawledData, threatAnalysis || undefined)}
                  className="w-full py-2 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-500/30 font-mono text-xs font-bold hover:bg-purple-500/30 transition flex items-center justify-center gap-2"
                >
                  <BookmarkPlus className="w-4 h-4" />
                  <span>Weave into Second Brain</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center rounded-2xl spider-glass border border-dashed border-gray-700">
              <Radar className="w-10 h-10 text-gray-500 mx-auto mb-3 animate-spin" />
              <p className="text-sm font-mono text-gray-400">Deploying spider to inspect target perimeter...</p>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Subdomain Mesh */}
      {activeSubTab === 'subdomains' && (
        <div className="p-5 rounded-2xl spider-glass space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Filter discovered subdomains..."
                value={subdomainSearch}
                onChange={(e) => setSubdomainSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-black/50 border border-cyan-500/20 text-white text-xs font-mono focus:outline-none focus:border-cyan-400"
              />
            </div>

            <button
              onClick={() => handleCopy('all-subdomains', (crawledData?.subdomains || []).join('\n'))}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-mono"
            >
              {copiedKey === 'all-subdomains' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy All Subdomains ({crawledData?.subdomains.length || 0})</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {filteredSubdomains.map((sub, i) => (
              <div key={i} className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between text-xs font-mono group hover:border-cyan-500/30 transition">
                <span className="text-cyan-300 truncate mr-2">{sub}</span>
                <button
                  onClick={() => handleCopy(`sub-${i}`, sub)}
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-cyan-400 transition"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Email Harvester */}
      {activeSubTab === 'emails' && (
        <div className="p-5 rounded-2xl spider-glass space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Filter harvested emails..."
                value={emailSearch}
                onChange={(e) => setEmailSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-black/50 border border-emerald-500/20 text-white text-xs font-mono focus:outline-none focus:border-emerald-400"
              />
            </div>

            <button
              onClick={() => handleCopy('all-emails', (crawledData?.emails || []).join('\n'))}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono"
            >
              {copiedKey === 'all-emails' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy All Emails ({crawledData?.emails.length || 0})</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {filteredEmails.map((email, i) => (
              <div key={i} className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between text-xs font-mono group hover:border-emerald-500/30 transition">
                <span className="text-emerald-300 truncate mr-2">{email}</span>
                <button
                  onClick={() => handleCopy(`em-${i}`, email)}
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-emerald-400 transition"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Web Paths & Robots */}
      {activeSubTab === 'paths' && (
        <div className="space-y-4">
          {/* Sensitive Paths Table */}
          <div className="p-5 rounded-2xl spider-glass space-y-3">
            <span className="text-xs font-mono font-bold text-cyan-400 block">
              SENSITIVE PROBED ENDPOINTS (.git, .env, admin, backup):
            </span>
            <div className="divide-y divide-white/5 overflow-x-auto">
              {(crawledData?.osint?.sensitive_files || []).map((file, i) => (
                <div key={i} className="py-2.5 flex items-center justify-between gap-3 text-xs font-mono">
                  <div className="flex items-center gap-2 truncate">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      file.status === 200 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                      file.status === 403 ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' :
                      'bg-gray-800 text-gray-400'
                    }`}>
                      HTTP {file.status}
                    </span>
                    <span className="text-white truncate">{file.path}</span>
                  </div>
                  <span className="text-gray-400 text-[11px] shrink-0">{file.notes || 'Discovered'}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Robots.txt Disallows */}
          <div className="p-5 rounded-2xl spider-glass space-y-3">
            <span className="text-xs font-mono font-bold text-orange-400 block">
              ROBOTS.TXT DISALLOW DIRECTIVES ({crawledData?.osint?.robots_txt?.disallow.length || 0}):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {(crawledData?.osint?.robots_txt?.disallow || []).map((rule, i) => (
                <div key={i} className="p-2 rounded-lg bg-black/40 border border-white/5 text-xs font-mono text-orange-300 truncate">
                  Disallow: {rule}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Security Headers & SSL */}
      {activeSubTab === 'security' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl spider-glass space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">
                DEFENSIVE SECURITY HEADERS AUDIT
              </span>
              <span className="px-3 py-1 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono text-sm font-bold">
                GRADE: {crawledData?.osint?.security_headers?.grade || 'C'} ({crawledData?.osint?.security_headers?.score || 70}%)
              </span>
            </div>

            <div className="space-y-2.5">
              {(crawledData?.osint?.security_headers?.findings || []).map((finding, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-black/40 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        finding.status === 'pass' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        finding.status === 'fail' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                        'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                      }`}>
                        {finding.status}
                      </span>
                      <span className="font-bold text-white">{finding.header}</span>
                    </div>
                    <p className="text-[11px] text-gray-400">{finding.description}</p>
                  </div>
                  <span className="text-cyan-400 text-[11px] sm:text-right shrink-0">{finding.recommendation}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Tech Fingerprinter */}
      {activeSubTab === 'tech' && (
        <div className="p-5 rounded-2xl spider-glass space-y-4">
          <span className="text-xs font-mono font-bold text-cyan-400 block uppercase">
            DETECTED TECHNOLOGIES & SOFTWARE STACK
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {(crawledData?.osint?.technologies || []).map((tech, i) => (
              <div key={i} className="p-4 rounded-xl bg-black/40 border border-cyan-500/20 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold font-mono text-white text-sm">{tech.name}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    {tech.confidence.toUpperCase()}
                  </span>
                </div>
                <span className="text-xs text-gray-400 font-mono block">{tech.category}</span>
                {tech.version && (
                  <span className="text-[11px] text-purple-300 font-mono">v{tech.version}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 7: Threat AI & CVEs */}
      {activeSubTab === 'intel' && (
        <div className="space-y-4">
          {threatAnalysis && (
            <div className="p-5 rounded-2xl spider-glass space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-cyan-400 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  WIDOW-AI THREAT INTELLIGENCE TRIAGE
                </span>
                <span className="text-xs font-mono text-gray-400">GPT-6 / GEMINI REASONING</span>
              </div>
              <div className="p-4 rounded-xl bg-black/60 border border-cyan-500/20 font-mono text-xs text-gray-200 whitespace-pre-wrap leading-relaxed">
                {threatAnalysis.rawAnalysis}
              </div>
            </div>
          )}

          {/* Live Cyber Threat Feed */}
          <div className="p-5 rounded-2xl spider-glass space-y-3">
            <span className="text-xs font-mono font-bold text-purple-400 flex items-center gap-2">
              <Newspaper className="w-4 h-4" />
              LIVE CYBERSECURITY CVE & EXPLOIT FEED
            </span>
            <div className="space-y-3">
              {newsFeed.map((news) => (
                <div key={news.id} className="p-3.5 rounded-xl bg-black/40 border border-white/5 hover:border-purple-500/30 transition space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold font-mono text-white hover:text-purple-300 transition cursor-pointer">
                      {news.title}
                    </span>
                    {news.cve_id && (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                        {news.cve_id}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 font-sans">{news.description}</p>
                  <div className="flex items-center gap-3 text-[11px] font-mono text-gray-500 pt-1">
                    <span>Source: {news.source}</span>
                    <span>•</span>
                    <span>{news.published_date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 8: Spider Console */}
      {activeSubTab === 'console' && (
        <div className="p-5 rounded-2xl spider-glass space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-cyan-400 flex items-center gap-2">
              <Terminal className="w-4 h-4" />
              SPIDER CRAWLER TELEMETRY LOG
            </span>
            <button
              onClick={() => setConsoleLogs([])}
              className="text-[11px] font-mono text-gray-400 hover:text-white"
            >
              Clear
            </button>
          </div>

          <div className="h-72 overflow-y-auto rounded-xl bg-black/80 border border-cyan-500/20 p-4 font-mono text-xs text-cyan-300 space-y-1.5">
            {consoleLogs.map((l, i) => (
              <div key={i} className="leading-relaxed">
                {l}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
