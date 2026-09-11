import React, { useState } from 'react';
import {
  Users, Search, RefreshCw, ShieldAlert, AlertTriangle, CheckCircle2,
  ExternalLink, Download, Layers, Key, Filter, Copy, Check, ChevronRight,
  Fingerprint, AtSign, Globe, Hash, Terminal, Cpu, Clock, ShieldCheck,
  UserCheck, AlertCircle, Share2, CornerDownRight, Database
} from 'lucide-react';

export interface PlatformResult {
  id: string;
  platform: string;
  category: 'CODE' | 'MESSAGING' | 'FORUM' | 'BUG_BOUNTY' | 'SOCIAL' | 'CRYPTO';
  url: string;
  status: 'FOUND' | 'POSSIBLE' | 'UNCLAIMED' | 'RATE_LIMITED';
  username: string;
  confidence: number;
  bio?: string;
  avatarUrl?: string;
  pHash?: string;
  joinedDate?: string;
  lastSeen?: string;
  reputation?: string;
  tags: string[];
  associatedEmails?: string[];
  associatedKeys?: string[];
}

export interface PersonaDossier {
  targetSeed: string;
  targetType: 'USERNAME' | 'EMAIL' | 'ALIAS';
  riskScore: number;
  confidence: number;
  aliases: string[];
  emails: string[];
  pgpKeys: { id: string; fingerprint: string; algorithm: string; created: string }[];
  knownBreaches: { source: string; year: number; compromisedData: string[]; severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' }[];
  pHashMatches: { hash: string; platforms: string[]; similarity: number }[];
  correlatedActors: string[];
}

interface SpiderIdentityViewProps {
  onPivotToGraph?: (entity: string, type: string) => void;
  onPivotToSwarm?: (dossier: string) => void;
  onPivotToForensics?: (target: string) => void;
}

const PRESET_TARGETS: { name: string; query: string; type: 'USERNAME' | 'EMAIL'; desc: string }[] = [
  {
    name: 'Ghost_Broker (Underground Seller)',
    query: 'ghost_broker_99',
    type: 'USERNAME',
    desc: 'Suspected initial access broker active across breach forums and dark messaging'
  },
  {
    name: 'Volt_Viper (APT Contract Operator)',
    query: 'volt_viper@proton.me',
    type: 'EMAIL',
    desc: 'Target tied to ICS/SCADA reconnaissance campaigns and private Git mirrors'
  },
  {
    name: 'SecOps_Auditor (Corporate Footprint)',
    query: 'zakar_secops',
    type: 'USERNAME',
    desc: 'Security engineering profile with public GPG keys, HackerOne and GitHub repositories'
  }
];

const MOCK_PLATFORMS_GHOST: PlatformResult[] = [
  {
    id: 'gh-1',
    platform: 'GitHub',
    category: 'CODE',
    url: 'https://github.com/ghost-broker-99',
    status: 'FOUND',
    username: 'ghost-broker-99',
    confidence: 94,
    bio: 'Independent offensive tooling, C2 payloads, and kernel exploits.',
    pHash: '8f7e2c9a1b0d4e3f',
    joinedDate: '2021-04-12',
    lastSeen: '3 hours ago',
    reputation: 'High (42 forks, 18 stars)',
    tags: ['golang', 'c2-framework', 'implant'],
    associatedEmails: ['ghost_broker@proton.me', 'gb99_ops@onionmail.org'],
    associatedKeys: ['0x4E9A12B890CC71FA']
  },
  {
    id: 'tg-1',
    platform: 'Telegram',
    category: 'MESSAGING',
    url: 'https://t.me/ghost_broker_99',
    status: 'FOUND',
    username: '@ghost_broker_99',
    confidence: 98,
    bio: 'Verified escrow dealer. Direct all inquiries via OTR or Session. PGP only.',
    pHash: '8f7e2c9a1b0d4e3f',
    joinedDate: '2020-09-01',
    lastSeen: 'Online',
    reputation: 'Escrow Tier 3',
    tags: ['dark-markets', 'session-id', 'escrow'],
    associatedKeys: ['0x4E9A12B890CC71FA']
  },
  {
    id: 'bf-1',
    platform: 'BreachForums v2',
    category: 'FORUM',
    url: 'https://breached.is/User-ghost_broker_99',
    status: 'FOUND',
    username: 'ghost_broker_99',
    confidence: 96,
    bio: 'Selling corporate access, Active Directory dumps, and VPN session cookies.',
    pHash: '8f7e2c9a1b0d4e3f',
    joinedDate: '2022-01-18',
    lastSeen: '1 day ago',
    reputation: 'Godfather Rank (Score: +412)',
    tags: ['stealer-logs', 'corp-access', 'vpn-tokens'],
    associatedEmails: ['gb99_ops@onionmail.org']
  },
  {
    id: 'xss-1',
    platform: 'XSS.is',
    category: 'FORUM',
    url: 'https://xss.is/members/ghost_broker.4982',
    status: 'FOUND',
    username: 'ghost_broker',
    confidence: 88,
    bio: 'Looking for 0-day RCE in enterprise VPN gateways. Budget $150k.',
    joinedDate: '2019-11-20',
    lastSeen: '5 days ago',
    reputation: 'Verified Buyer (14 Deals)',
    tags: ['zero-day', 'exploit-broker'],
    associatedEmails: ['gb99_ops@onionmail.org']
  },
  {
    id: 'kb-1',
    platform: 'Keybase',
    category: 'MESSAGING',
    url: 'https://keybase.io/ghostbroker99',
    status: 'FOUND',
    username: 'ghostbroker99',
    confidence: 92,
    bio: 'PGP cryptographic proof and verified identities.',
    pHash: '8f7e2c9a1b0d4e3f',
    joinedDate: '2021-02-10',
    lastSeen: '2 weeks ago',
    tags: ['pgp-verified', 'dns-proof'],
    associatedKeys: ['0x4E9A12B890CC71FA']
  },
  {
    id: 'h1-1',
    platform: 'HackerOne',
    category: 'BUG_BOUNTY',
    url: 'https://hackerone.com/ghost_broker_99',
    status: 'POSSIBLE',
    username: 'ghost_broker_99',
    confidence: 45,
    bio: 'Inactive account created 2022.',
    joinedDate: '2022-06-11',
    lastSeen: '2022-08-04',
    tags: ['inactive', 'no-bounties']
  },
  {
    id: 'gl-1',
    platform: 'GitLab',
    category: 'CODE',
    url: 'https://gitlab.com/ghost_broker_99',
    status: 'UNCLAIMED',
    username: 'ghost_broker_99',
    confidence: 0,
    tags: ['unregistered']
  },
  {
    id: 'rd-1',
    platform: 'Reddit',
    category: 'SOCIAL',
    url: 'https://reddit.com/user/ghost_broker_99',
    status: 'FOUND',
    username: 'u/ghost_broker_99',
    confidence: 76,
    bio: 'Participates in r/netsec, r/malware, and r/reverseengineering.',
    joinedDate: '2020-03-15',
    lastSeen: '4 days ago',
    reputation: '1,420 Karma',
    tags: ['netsec', 'malware-analysis']
  },
  {
    id: 'tw-1',
    platform: 'X / Twitter',
    category: 'SOCIAL',
    url: 'https://x.com/ghost_broker_99',
    status: 'POSSIBLE',
    username: '@ghost_broker_99',
    confidence: 62,
    bio: 'Cyber threat researcher & zero-day enthusiast.',
    joinedDate: '2022-10-09',
    tags: ['infosec', 'threat-intel']
  },
  {
    id: 'btc-1',
    platform: 'Bitcoin Explorer',
    category: 'CRYPTO',
    url: 'https://mempool.space/address/bc1q8f7e2c9a1b0d4e3f99z001',
    status: 'FOUND',
    username: 'bc1q8f7e2c9a1b0d4e3f99z001',
    confidence: 85,
    bio: 'Public payment address linked in BreachForums profile.',
    reputation: 'Total Received: 4.82 BTC (~$290,000 USD)',
    tags: ['ransom-wallet', 'tumbler-inflow'],
    lastSeen: '12 hours ago'
  }
];

const MOCK_DOSSIER_GHOST: PersonaDossier = {
  targetSeed: 'ghost_broker_99',
  targetType: 'USERNAME',
  riskScore: 88,
  confidence: 95,
  aliases: ['ghost_broker', 'gb99_ops', 'ghostbroker99', 'shadow_dealer_v'],
  emails: ['ghost_broker@proton.me', 'gb99_ops@onionmail.org', 'ghost99@secmail.pro'],
  pgpKeys: [
    {
      id: '0x4E9A12B890CC71FA',
      fingerprint: '38B2 99A1 C402 F510 E889 2201 4E9A 12B8 90CC 71FA',
      algorithm: 'RSA 4096-bit (Created 2021-04-10)',
      created: '2021-04-10'
    }
  ],
  knownBreaches: [
    {
      source: 'RaidForums Database Dump',
      year: 2022,
      compromisedData: ['Username: ghost_broker', 'Email: ghost_broker@proton.me', 'IP: 185.220.101.5', 'Bcrypt Hash'],
      severity: 'HIGH'
    },
    {
      source: 'RedLine Stealer Master Log',
      year: 2023,
      compromisedData: ['Session Cookies', 'Telegram Session tdata', 'Saved Passwords (XSS.is, BreachForums)'],
      severity: 'CRITICAL'
    }
  ],
  pHashMatches: [
    {
      hash: '8f7e2c9a1b0d4e3f',
      platforms: ['GitHub', 'Telegram', 'BreachForums', 'Keybase'],
      similarity: 100
    }
  ],
  correlatedActors: ['FIN7 Affiliates', 'RansomHub Negotiator Group', 'Scattered Spider Telegram Ring']
};

export const SpiderIdentityView: React.FC<SpiderIdentityViewProps> = ({
  onPivotToGraph,
  onPivotToSwarm,
  onPivotToForensics
}) => {
  const [queryInput, setQueryInput] = useState('ghost_broker_99');
  const [activeQuery, setActiveQuery] = useState('ghost_broker_99');
  const [queryType, setQueryType] = useState<'USERNAME' | 'EMAIL' | 'ALIAS'>('USERNAME');
  const [hopDepth, setHopDepth] = useState<number>(2);
  const [isCrawling, setIsCrawling] = useState(false);
  const [crawlProgress, setCrawlProgress] = useState(100);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedResult, setSelectedResult] = useState<PlatformResult | null>(MOCK_PLATFORMS_GHOST[0]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const [results, setResults] = useState<PlatformResult[]>(MOCK_PLATFORMS_GHOST);
  const [dossier, setDossier] = useState<PersonaDossier>(MOCK_DOSSIER_GHOST);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleRunSpider = () => {
    if (!queryInput.trim()) return;
    setIsCrawling(true);
    setCrawlProgress(15);
    setActiveQuery(queryInput.trim());

    setTimeout(() => setCrawlProgress(45), 400);
    setTimeout(() => setCrawlProgress(78), 850);
    setTimeout(() => {
      setCrawlProgress(100);
      setIsCrawling(false);

      if (queryInput.toLowerCase().includes('viper')) {
        setDossier({
          targetSeed: queryInput,
          targetType: 'EMAIL',
          riskScore: 94,
          confidence: 91,
          aliases: ['volt_viper', 'viper_operator', 'vv_ics'],
          emails: [queryInput, 'volt_ops@tutanota.com'],
          pgpKeys: [
            {
              id: '0x99B87F1142A0CD99',
              fingerprint: '99B8 7F11 42A0 CD99 11A0 EE77 4488 2211 00AA 88BB',
              algorithm: 'Ed25519 (Created 2022-08-14)',
              created: '2022-08-14'
            }
          ],
          knownBreaches: [
            {
              source: 'Dark Web ComboList 2024',
              year: 2024,
              compromisedData: ['Email', 'Plaintext Password', 'SCADA VPN Token'],
              severity: 'CRITICAL'
            }
          ],
          pHashMatches: [
            {
              hash: '2b4c6e801a3c5d7f',
              platforms: ['GitHub', 'ProtonMail Gravatar'],
              similarity: 95
            }
          ],
          correlatedActors: ['Volt Typhoon Subcontractors', 'UNC3886']
        });
      } else if (queryInput.toLowerCase().includes('secops') || queryInput.toLowerCase().includes('zakar')) {
        setDossier({
          targetSeed: queryInput,
          targetType: 'USERNAME',
          riskScore: 24,
          confidence: 98,
          aliases: ['zakar_secops', 'oukil_dev', 'zak_spider_lead'],
          emails: ['zak@secops.internal', 'dev@zakspider.io'],
          pgpKeys: [
            {
              id: '0x77FA192800DDAABB',
              fingerprint: '77FA 1928 00DD AABB CC11 2233 4455 6677 8899 00AA',
              algorithm: 'RSA 4096-bit (Created 2023-01-01)',
              created: '2023-01-01'
            }
          ],
          knownBreaches: [],
          pHashMatches: [],
          correlatedActors: ['Corporate Security Blue Team', 'HackerOne Verified']
        });
      } else {
        setDossier(MOCK_DOSSIER_GHOST);
      }
    }, 1200);
  };

  const filteredResults = results.filter(r => {
    if (categoryFilter !== 'ALL' && r.category !== categoryFilter) return false;
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    return true;
  });

  const verifiedMatches = results.filter(r => r.status === 'FOUND').length;
  const possibleMatches = results.filter(r => r.status === 'POSSIBLE').length;

  const exportDossierMarkdown = () => {
    const md = `# OSINT IDENTITY DOSSIER: ${dossier.targetSeed}
Generated by Zak's Spider - OSINT Identity Reconnaissance Engine
Date: ${new Date().toISOString()}

## Target Summary
- Target Seed: ${dossier.targetSeed}
- Type: ${dossier.targetType}
- Threat / Exposure Score: ${dossier.riskScore}/100
- Correlation Confidence: ${dossier.confidence}%

## Correlated Aliases & Handles
${dossier.aliases.map(a => `- @${a}`).join('\n')}

## Associated Email Addresses
${dossier.emails.map(e => `- ${e}`).join('\n')}

## Cryptographic Identities & PGP Keys
${dossier.pgpKeys.map(k => `- Key ID: ${k.id} | Fingerprint: ${k.fingerprint} (${k.algorithm})`).join('\n')}

## Avatar Perceptual Hash (pHash) Correlation
${dossier.pHashMatches.map(p => `- Hash: ${p.hash} | Similarity: ${p.similarity}% | Seen On: ${p.platforms.join(', ')}`).join('\n')}

## Breach Appearances & Historical Credentials
${dossier.knownBreaches.map(b => `- [${b.year}] ${b.source} (${b.severity}): ${b.compromisedData.join(', ')}`).join('\n')}

## Platform Presence (${results.length} sweeps)
${results.map(r => `- [${r.status}] ${r.platform} (${r.category}): ${r.url} (Confidence: ${r.confidence}%)`).join('\n')}

## Correlated Threat Groups
${dossier.correlatedActors.map(c => `- ${c}`).join('\n')}
`;

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `osint_dossier_${dossier.targetSeed}_${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full bg-[#070b13] text-slate-200 overflow-hidden select-text">
      {/* Top Header / Context Banner */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-[#090e1a]/90 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Fingerprint className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold tracking-wide text-white uppercase">
                Recursive OSINT Identity Spider
              </h2>
              <span className="px-2 py-0.5 text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded">
                Multi-Hop Recon
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Automated persona graph sweeping across 60+ developer, underground, crypto & messaging ecosystems
            </p>
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex items-center space-x-3">
          <button
            onClick={exportDossierMarkdown}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-mono font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Dossier (.MD)</span>
          </button>

          {onPivotToGraph && (
            <button
              onClick={() => onPivotToGraph(dossier.targetSeed, 'ACTOR')}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-mono font-medium rounded-lg bg-indigo-950/70 hover:bg-indigo-900 text-indigo-300 border border-indigo-700/50 transition"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Send to Link-Graph</span>
            </button>
          )}

          {onPivotToSwarm && (
            <button
              onClick={() => onPivotToSwarm(`Adversary Profile Analysis for target ${dossier.targetSeed}`)}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-mono font-medium rounded-lg bg-purple-950/70 hover:bg-purple-900 text-purple-300 border border-purple-700/50 transition"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>AI Swarm Triage</span>
            </button>
          )}
        </div>
      </div>

      {/* Target Input & Configuration Bar */}
      <div className="p-5 border-b border-slate-800 bg-[#080d17]/95">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex-1 flex items-center space-x-2 bg-slate-900/90 border border-slate-700 rounded-lg px-3 py-1.5 focus-within:border-emerald-500 transition">
            <AtSign className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRunSpider()}
              placeholder="Enter handle (e.g. ghost_broker_99), email, or alias seed..."
              className="bg-transparent border-none text-sm text-white focus:outline-none w-full font-mono placeholder:text-slate-500"
            />
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1.5 bg-slate-900/90 border border-slate-800 rounded-lg p-1 text-xs font-mono">
              <span className="px-2 text-slate-400">Target Type:</span>
              {(['USERNAME', 'EMAIL', 'ALIAS'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setQueryType(t)}
                  className={`px-2.5 py-1 rounded ${queryType === t ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 font-bold' : 'text-slate-400 hover:text-white'}`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-2 bg-slate-900/90 border border-slate-800 rounded-lg px-3 py-1 text-xs font-mono">
              <span className="text-slate-400">Hop Depth:</span>
              <div className="flex items-center space-x-1">
                {[1, 2, 3].map(h => (
                  <button
                    key={h}
                    onClick={() => setHopDepth(h)}
                    className={`w-6 h-6 rounded flex items-center justify-center font-bold text-xs ${hopDepth === h ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:bg-slate-800'}`}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleRunSpider}
              disabled={isCrawling}
              className="flex items-center space-x-2 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-slate-950 font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-emerald-950/50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isCrawling ? 'animate-spin' : ''}`} />
              <span>{isCrawling ? 'Spidering...' : 'Launch Spider'}</span>
            </button>
          </div>
        </div>

        {/* Preset seeds chips */}
        <div className="flex items-center space-x-2 mt-3 text-xs">
          <span className="text-slate-500 font-mono text-[11px]">Preset Targets:</span>
          {PRESET_TARGETS.map(p => (
            <button
              key={p.name}
              onClick={() => {
                setQueryInput(p.query);
                setQueryType(p.type);
                setActiveQuery(p.query);
              }}
              className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-mono text-[11px] transition"
              title={p.desc}
            >
              {p.name}
            </button>
          ))}
        </div>

        {/* Crawling Progress Bar */}
        {isCrawling && (
          <div className="w-full bg-slate-800/80 rounded-full h-1.5 mt-3 overflow-hidden">
            <div
              className="bg-emerald-500 h-full transition-all duration-300"
              style={{ width: `${crawlProgress}%` }}
            />
          </div>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 p-5 border-b border-slate-800/60 bg-[#060a11]">
        <div className="p-3 rounded-lg bg-[#0a0f1d] border border-slate-800">
          <div className="text-[11px] font-mono text-slate-400 uppercase">Target Seed</div>
          <div className="text-sm font-mono font-bold text-white truncate mt-0.5">{dossier.targetSeed}</div>
        </div>

        <div className="p-3 rounded-lg bg-[#0a0f1d] border border-slate-800">
          <div className="text-[11px] font-mono text-slate-400 uppercase">Verified Matches</div>
          <div className="text-sm font-mono font-bold text-emerald-400 mt-0.5">
            {verifiedMatches} / {results.length}
          </div>
        </div>

        <div className="p-3 rounded-lg bg-[#0a0f1d] border border-slate-800">
          <div className="text-[11px] font-mono text-slate-400 uppercase">Possible Matches</div>
          <div className="text-sm font-mono font-bold text-amber-400 mt-0.5">
            {possibleMatches}
          </div>
        </div>

        <div className="p-3 rounded-lg bg-[#0a0f1d] border border-slate-800">
          <div className="text-[11px] font-mono text-slate-400 uppercase">Linked Aliases</div>
          <div className="text-sm font-mono font-bold text-purple-400 mt-0.5">
            {dossier.aliases.length} handles
          </div>
        </div>

        <div className="p-3 rounded-lg bg-[#0a0f1d] border border-slate-800">
          <div className="text-[11px] font-mono text-slate-400 uppercase">Known Breaches</div>
          <div className="text-sm font-mono font-bold text-rose-400 mt-0.5">
            {dossier.knownBreaches.length} confirmed
          </div>
        </div>

        <div className="p-3 rounded-lg bg-[#0a0f1d] border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono text-slate-400 uppercase">Exposure Score</div>
            <div className="text-sm font-mono font-bold text-rose-400 mt-0.5">
              {dossier.riskScore} <span className="text-[10px] text-slate-500 font-normal">/ 100</span>
            </div>
          </div>
          <div className={`px-2 py-1 rounded text-[10px] font-bold font-mono ${
            dossier.riskScore >= 75 ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' :
            dossier.riskScore >= 40 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
            'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
          }`}>
            {dossier.riskScore >= 75 ? 'HIGH RISK' : dossier.riskScore >= 40 ? 'ELEVATED' : 'LOW RISK'}
          </div>
        </div>
      </div>

      {/* Main Content: 2-Column Split (Left: Platform Table, Right: Persona Dossier Card) */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Column: Platform Sweep Results */}
        <div className="flex-1 flex flex-col border-b lg:border-b-0 lg:border-r border-slate-800 overflow-hidden bg-[#070b13]">
          {/* Filter Bar */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800/80 bg-[#090e1b]">
            <div className="flex items-center space-x-2">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <div className="flex items-center space-x-1 text-xs font-mono">
                {['ALL', 'CODE', 'MESSAGING', 'FORUM', 'BUG_BOUNTY', 'SOCIAL', 'CRYPTO'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-2.5 py-1 rounded transition ${
                      categoryFilter === cat
                        ? 'bg-slate-800 text-white font-semibold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-1.5 text-xs font-mono">
              <span className="text-slate-500 text-[11px]">Status:</span>
              {['ALL', 'FOUND', 'POSSIBLE'].map(st => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2 py-0.5 rounded text-[11px] ${
                    statusFilter === st
                      ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/50'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Results Table */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
            {filteredResults.map(res => {
              const isSelected = selectedResult?.id === res.id;
              return (
                <div
                  key={res.id}
                  onClick={() => setSelectedResult(res)}
                  className={`p-3.5 rounded-lg border transition cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 border-emerald-500/60 shadow-md shadow-emerald-950/20'
                      : 'bg-[#080d18] hover:bg-slate-900/60 border-slate-800/80'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        res.status === 'FOUND' ? 'bg-emerald-400' :
                        res.status === 'POSSIBLE' ? 'bg-amber-400' :
                        'bg-slate-600'
                      }`} />
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-bold text-white">{res.platform}</span>
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-slate-800 text-slate-400">
                            {res.category}
                          </span>
                          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold ${
                            res.status === 'FOUND' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                            res.status === 'POSSIBLE' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' :
                            'bg-slate-800 text-slate-500'
                          }`}>
                            {res.status}
                          </span>
                        </div>
                        <div className="text-xs font-mono text-slate-400 mt-0.5">
                          {res.username}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <div className="text-right">
                        <div className="text-[11px] font-mono text-slate-400">Confidence</div>
                        <div className="text-xs font-mono font-bold text-white">{res.confidence}%</div>
                      </div>
                      <a
                        href={res.url}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition"
                        title="Open external platform profile"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>

                  {res.bio && (
                    <p className="text-xs text-slate-300 mt-2 line-clamp-2 bg-slate-950/60 p-2 rounded border border-slate-800/60 font-mono">
                      {res.bio}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                    {res.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800/80 text-slate-300 border border-slate-700/50"
                      >
                        #{tag}
                      </span>
                    ))}

                    {res.pHash && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-950/60 text-purple-300 border border-purple-800/40">
                        pHash: {res.pHash.substring(0, 8)}...
                      </span>
                    )}

                    {res.reputation && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-950/60 text-blue-300 border border-blue-800/40 ml-auto">
                        {res.reputation}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Persona Dossier Deck */}
        <div className="w-full lg:w-[460px] flex flex-col bg-[#080d19] overflow-y-auto p-5 space-y-5">
          {/* Target Overview Card */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-[#0c1224] to-[#070b13] border border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-mono font-bold text-lg shadow-inner">
                {dossier.targetSeed.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-bold text-white font-mono">{dossier.targetSeed}</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    {dossier.targetType}
                  </span>
                </div>
                <div className="text-xs text-slate-400 font-mono mt-0.5 flex items-center space-x-2">
                  <span>Confidence: {dossier.confidence}%</span>
                  <span>•</span>
                  <span>{dossier.aliases.length} Known Aliases</span>
                </div>
              </div>
            </div>

            {/* Correlated Aliases */}
            <div className="mt-4 pt-3 border-t border-slate-800/80">
              <div className="text-[11px] font-mono uppercase text-slate-400 font-bold mb-1.5 flex items-center justify-between">
                <span>Correlated Aliases & Handles</span>
                <span className="text-slate-500 text-[10px]">{dossier.aliases.length} discovered</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {dossier.aliases.map(al => (
                  <span
                    key={al}
                    onClick={() => {
                      setQueryInput(al);
                      handleRunSpider();
                    }}
                    className="px-2.5 py-1 rounded text-xs font-mono bg-slate-900 hover:bg-slate-800 border border-slate-800 text-emerald-400 cursor-pointer transition flex items-center space-x-1"
                    title="Spider this correlated alias"
                  >
                    <span>@{al}</span>
                    <CornerDownRight className="w-2.5 h-2.5 text-slate-500" />
                  </span>
                ))}
              </div>
            </div>

            {/* Associated Emails */}
            <div className="mt-4 pt-3 border-t border-slate-800/80">
              <div className="text-[11px] font-mono uppercase text-slate-400 font-bold mb-1.5">
                Linked Email Addresses
              </div>
              <div className="space-y-1">
                {dossier.emails.map(em => (
                  <div
                    key={em}
                    className="flex items-center justify-between p-1.5 rounded bg-slate-900/60 border border-slate-800 text-xs font-mono text-slate-300"
                  >
                    <span>{em}</span>
                    <button
                      onClick={() => handleCopy(em, em)}
                      className="text-slate-400 hover:text-white transition"
                    >
                      {copiedKey === em ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Cryptographic Proof & PGP Keys */}
          <div className="p-4 rounded-xl bg-[#0a0f1f] border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2 text-xs font-mono font-bold text-slate-200 uppercase">
                <Key className="w-4 h-4 text-amber-400" />
                <span>Discovered Cryptographic Keys</span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">{dossier.pgpKeys.length} active</span>
            </div>

            {dossier.pgpKeys.length > 0 ? (
              <div className="space-y-2">
                {dossier.pgpKeys.map(k => (
                  <div key={k.id} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono">
                    <div className="flex items-center justify-between text-amber-300 font-bold">
                      <span>{k.id}</span>
                      <button
                        onClick={() => handleCopy(k.fingerprint, k.id)}
                        className="text-slate-400 hover:text-white transition flex items-center space-x-1 text-[11px]"
                      >
                        {copiedKey === k.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>Copy Fingerprint</span>
                      </button>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 break-all">
                      {k.fingerprint}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">
                      {k.algorithm}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-slate-500 font-mono italic">No public PGP or SSH keys discovered.</div>
            )}
          </div>

          {/* Historical Breaches & Credential Exposures */}
          <div className="p-4 rounded-xl bg-[#0a0f1f] border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2 text-xs font-mono font-bold text-slate-200 uppercase">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>Confirmed Breach Appearances</span>
              </div>
              <span className="px-1.5 py-0.5 text-[10px] font-mono bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded">
                {dossier.knownBreaches.length} Incidents
              </span>
            </div>

            {dossier.knownBreaches.length > 0 ? (
              <div className="space-y-2">
                {dossier.knownBreaches.map((b, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-rose-950/20 border border-rose-900/40 text-xs font-mono">
                    <div className="flex items-center justify-between font-bold text-rose-300">
                      <span>{b.source} ({b.year})</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 border border-rose-500/40">
                        {b.severity}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-300 mt-1.5">
                      <div className="text-slate-400 text-[10px] uppercase font-semibold">Exposed Artifacts:</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {b.compromisedData.map((d, dIdx) => (
                          <span key={dIdx} className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800 text-[10px]">
                            {d}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-emerald-400/80 font-mono">
                No compromised passwords or breach appearances identified.
              </div>
            )}
          </div>

          {/* Avatar Perceptual Hash (pHash) Matching */}
          {dossier.pHashMatches.length > 0 && (
            <div className="p-4 rounded-xl bg-[#0a0f1f] border border-slate-800">
              <div className="flex items-center space-x-2 text-xs font-mono font-bold text-purple-300 uppercase mb-2">
                <Hash className="w-4 h-4" />
                <span>Avatar Perceptual Hash Matching</span>
              </div>
              <p className="text-[11px] text-slate-400 mb-3 font-mono">
                Cross-platform avatar fingerprinting confirmed identical profile imagery across distinct accounts.
              </p>
              {dossier.pHashMatches.map((m, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-purple-950/20 border border-purple-900/40 text-xs font-mono">
                  <div className="flex items-center justify-between text-purple-300 font-bold">
                    <span>pHash: {m.hash}</span>
                    <span className="text-emerald-400">{m.similarity}% Match</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Confirmed across: <span className="text-white">{m.platforms.join(', ')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Correlated Threat Groups */}
          {dossier.correlatedActors.length > 0 && (
            <div className="p-4 rounded-xl bg-[#0a0f1f] border border-slate-800">
              <div className="text-xs font-mono font-bold text-slate-300 uppercase mb-2">
                Associated Threat Clusters
              </div>
              <div className="flex flex-wrap gap-1.5">
                {dossier.correlatedActors.map(act => (
                  <span
                    key={act}
                    className="px-2.5 py-1 rounded text-xs font-mono bg-slate-900 border border-purple-500/40 text-purple-300"
                  >
                    {act}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
