import React, { useState, useEffect } from 'react';
import { 
  Globe2, ShieldAlert, AlertTriangle, ShieldCheck, 
  ExternalLink, Search, Crosshair, ChevronRight, Zap, RefreshCw, X, Radio, Layers,
  Activity, Shield, Terminal, Check, Bot
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
  const [rightDeckTab, setRightDeckTab] = useState<'stream' | 'countries' | 'ids'>('stream');
  const [filterSeverity, setFilterSeverity] = useState<'ALL' | 'CRITICAL' | 'HIGH'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [triageModalOpen, setTriageModalOpen] = useState(false);

  // Live IDS Sensor State
  const [idsEvents, setIdsEvents] = useState<IdsTrafficEvent[]>([]);
  const [idsStats, setIdsStats] = useState({
    totalEvents: 14820,
    activeCritical: 1,
    activeHigh: 4,
    threatsBlocked: 14872,
    securityScore: 98,
  });
  const [activeAlertBanner, setActiveAlertBanner] = useState<IdsTrafficEvent | null>(null);
  const [blockedIps, setBlockedIps] = useState<Set<string>>(new Set());

  // Sync with NavRail activeSubSection if changed
  useEffect(() => {
    if (activeSubSection === 'stream') setRightDeckTab('stream');
    else if (activeSubSection === 'countries' || activeSubSection === 'aerospace') setRightDeckTab('countries');
    else if (activeSubSection === 'ids') setRightDeckTab('ids');
  }, [activeSubSection]);

  // Poll IDS Events from /api/ids every 5 seconds
  useEffect(() => {
    const fetchIds = async () => {
      try {
        const res = await apiService.getIdsEvents();
        if (res.events && res.events.length > 0) {
          setIdsEvents(res.events);
          if (res.stats) setIdsStats(res.stats);
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
    const interval = setInterval(fetchIds, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleBlockIp = (ip: string) => {
    setBlockedIps((prev) => new Set(prev).add(ip));
    setIdsEvents((prev) => prev.map((e) => (e.sourceIp === ip ? { ...e, status: 'Blocked' as const } : e)));
    setTimeout(() => {
      if (activeAlertBanner?.sourceIp === ip) setActiveAlertBanner(null);
    }, 1500);
  };

  const handleTriggerSimulatedKaliProbe = async () => {
    try {
      const res = await apiService.triggerIdsProbe({
        probeType: 'nmap-nse',
        endpoint: '/api/v1/auth/internal-debug',
        payload: 'nmap -sV -p 443 --script http-vuln-cve2024-3400',
      });
      if (res.detectedEvent) {
        setIdsEvents((prev) => [res.detectedEvent, ...prev]);
        setActiveAlertBanner(res.detectedEvent);
        setRightDeckTab('ids');
      }
    } catch (e) {
      console.warn('Kali probe trigger failed:', e);
    }
  };


  // Live attack injection timer simulating active real-world threat telemetry
  useEffect(() => {
    const interval = setInterval(() => {
      const randomSeed = GLOBAL_THREAT_SEEDS[Math.floor(Math.random() * GLOBAL_THREAT_SEEDS.length)];
      const newAttack: GlobalCyberAttack = {
        ...randomSeed,
        id: `atk-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        timestamp: new Date().toLocaleTimeString(),
      };

      setAttacks((prev) => [newAttack, ...prev.slice(0, 39)]);
    }, 4500);

    return () => clearInterval(interval);
  }, []);

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

  const filteredAttacks = attacks.filter((atk) => {
    const matchesSeverity = filterSeverity === 'ALL' || atk.severity === filterSeverity;
    const matchesSearch =
      searchQuery === '' ||
      atk.threatActor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      atk.vector.toLowerCase().includes(searchQuery.toLowerCase()) ||
      atk.targetCity?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      atk.sourceCity?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (atk.cve && atk.cve.toLowerCase().includes(searchQuery.toLowerCase()));
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
      e.country.toLowerCase().includes(q) ||
      e.attackPhase.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex-1 w-full h-full flex flex-col gap-3 overflow-hidden font-mono">
      {/* Main Grid: Left Stage (Globe) + Right Deck (Attack Stream / Country Rankings) */}
      <div className="flex-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-3.5 overflow-hidden">
        {/* Left Stage: 3D Living Globe (~65% width) */}
        <div className="lg:col-span-8 flex flex-col h-full rounded-2xl bg-[#060b14]/90 border border-cyan-500/20 overflow-hidden relative shadow-2xl">
          <div className="flex-1 w-full h-full relative">
            {/* Urgent IDS Intercept Alert Banner */}
            {activeAlertBanner && (
              <div className="absolute top-3 left-3 right-3 z-30 p-3 rounded-2xl bg-red-950/95 border border-red-500/80 shadow-[0_0_30px_rgba(239,68,68,0.5)] backdrop-blur-xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-red-600 flex items-center justify-center text-white font-bold shrink-0 shadow-[0_0_15px_rgba(239,68,68,0.6)]">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-xs font-black text-red-200 uppercase tracking-wider">
                      <span>LIVE INTRUSION DETECTED // IDS SENSOR INTERCEPT</span>
                      <span className="px-1.5 py-0.5 rounded bg-red-800/80 text-white text-[9px] font-mono">
                        {activeAlertBanner.signature}
                      </span>
                    </div>
                    <p className="text-[11px] text-red-300 font-mono mt-0.5">
                      Source IP: <span className="font-bold text-white">{activeAlertBanner.sourceIp}</span> ({activeAlertBanner.country}) | Target: <span className="text-white">{activeAlertBanner.targetEndpoint}</span> (Port {activeAlertBanner.targetPort})
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleBlockIp(activeAlertBanner.sourceIp)}
                    disabled={blockedIps.has(activeAlertBanner.sourceIp)}
                    className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-extrabold flex items-center gap-1 transition-all shadow-lg cursor-pointer disabled:opacity-50"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>{blockedIps.has(activeAlertBanner.sourceIp) ? 'IP Blocked (DROP)' : 'Block IP (iptables DROP)'}</span>
                  </button>
                  <button
                    onClick={() => setActiveAlertBanner(null)}
                    className="text-red-300 hover:text-white p-1 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
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

            {/* Selected Attack Target Overlay */}
            {selectedAttack && (
              <div className="absolute top-14 right-3 max-w-sm p-3 rounded-xl bg-[#0a101d]/95 border border-cyan-400/50 shadow-[0_0_20px_rgba(0,240,255,0.25)] backdrop-blur-xl animate-in fade-in slide-in-from-top-2 z-20">
                <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-cyan-500/20">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                    <span className="text-red-400">TARGET LOCKED:</span>
                    <span>{selectedAttack.targetCity}, {selectedAttack.targetCountry}</span>
                    <span>{selectedAttack.targetFlag}</span>
                  </div>
                  <button
                    onClick={() => setSelectedAttack(null)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="mt-2 text-[11px] space-y-1 text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Threat Actor:</span>
                    <span className="text-red-400 font-bold">{selectedAttack.threatActor}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Attack Vector:</span>
                    <span className="text-cyan-300 truncate max-w-[180px]">{selectedAttack.vector}</span>
                  </div>
                  {selectedAttack.cve && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Exploited CVE:</span>
                      <span className="text-purple-400 font-bold">{selectedAttack.cve}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-500">Mitigation:</span>
                    <span className="text-emerald-400 font-bold">{selectedAttack.status}</span>
                  </div>
                </div>

                <button
                  onClick={() => setTriageModalOpen(true)}
                  className="mt-2.5 w-full py-1.5 rounded-lg bg-gradient-to-r from-cyan-500/30 to-blue-600/30 border border-cyan-400/50 hover:bg-cyan-500/40 text-cyan-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Execute Triage Playbook</span>
                </button>
              </div>
            )}

            {/* Selected Country Hotspot Overlay */}
            {selectedCountry && (
              <div className="absolute top-14 right-3 max-w-sm p-3.5 rounded-xl bg-[#0a101d]/95 border border-yellow-500/50 shadow-[0_0_20px_rgba(245,158,11,0.25)] backdrop-blur-xl animate-in fade-in slide-in-from-top-2 z-20">
                <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-yellow-500/20">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <span className="text-yellow-400">HOTSPOT CLUSTER:</span>
                    <span>{selectedCountry.flag} {selectedCountry.country}</span>
                  </div>
                  <button
                    onClick={() => setSelectedCountry(null)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="mt-2 text-[11px] space-y-1.5 text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Attacks:</span>
                    <span className="text-yellow-400 font-bold">{selectedCountry.incidentCount.toLocaleString()} Ingress</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Primary Vectors:</span>
                    <span className="text-cyan-300 truncate max-w-[180px]">{selectedCountry.primaryVector}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Active Actors:</span>
                    <span className="text-red-400 font-bold">{selectedCountry.topActors.join(', ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Attacked Ports:</span>
                    <span className="text-slate-200 font-mono">{selectedCountry.topPorts.join(', ')}</span>
                  </div>
                </div>

                <div className="mt-2.5 p-2 rounded-lg bg-yellow-950/30 border border-yellow-500/20 text-[10px] text-yellow-300">
                  Showing {selectedCountry.dots.length} geographically distributed incident nodes inside {selectedCountry.country}.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Stacked Deck: Live Attacks Stream or Country Rankings (~35% width) */}
        <div className="lg:col-span-4 flex flex-col h-full rounded-2xl bg-[#080e1a]/95 border border-cyan-500/20 shadow-2xl backdrop-blur-xl overflow-hidden">
          {/* Deck Header Tabs */}
          <div className="p-2 border-b border-cyan-500/20 bg-[#0a1222] flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setRightDeckTab('stream')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  rightDeckTab === 'stream'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Live Incidents</span>
              </button>

              <button
                onClick={() => setRightDeckTab('countries')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  rightDeckTab === 'countries'
                    ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-400/50'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Radio className="w-3.5 h-3.5" />
                <span>Countries ({REAL_COUNTRY_THREATS.length})</span>
              </button>

              <button
                onClick={() => setRightDeckTab('ids')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  rightDeckTab === 'ids'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/50 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>IDS Sensor ({idsEvents.length})</span>
              </button>
            </div>

            {rightDeckTab === 'stream' && (
              <button
                onClick={() => setFilterSeverity(filterSeverity === 'ALL' ? 'CRITICAL' : 'ALL')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                  filterSeverity === 'CRITICAL'
                    ? 'bg-red-950/60 border-red-500/50 text-red-300'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                {filterSeverity === 'CRITICAL' ? 'CRIT ONLY' : 'ALL SEV'}
              </button>
            )}

            {rightDeckTab === 'ids' && (
              <button
                onClick={handleTriggerSimulatedKaliProbe}
                className="px-2.5 py-1 rounded-lg text-[10px] font-bold border border-cyan-500/40 bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 transition-colors cursor-pointer flex items-center gap-1 shadow-sm"
                title="Trigger simulated Nmap scan probe to honeypot"
              >
                <Zap className="w-3 h-3 text-cyan-400" />
                <span>Test Kali Probe</span>
              </button>
            )}
          </div>

          {/* Search bar inside deck */}
          <div className="p-2 border-b border-cyan-500/10 bg-[#060a14]">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  rightDeckTab === 'stream'
                    ? 'Search actor, vector, city, CVE...'
                    : rightDeckTab === 'ids'
                    ? 'Search IP, port, signature, or phase...'
                    : 'Search all 177 countries, code, or APT actors...'
                }
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-900/80 border border-cyan-500/20 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Deck Body */}
          <div className="flex-1 p-2.5 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-500/20 scrollbar-track-transparent">
            {rightDeckTab === 'stream' ? (
              // Live Attacks Stream
              filteredAttacks.map((atk) => {
                const isSelected = selectedAttack?.id === atk.id;
                const isCrit = atk.severity === 'CRITICAL';

                return (
                  <div
                    key={atk.id}
                    onClick={() => handleSelectAttack(atk)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer relative group ${
                      isSelected
                        ? 'bg-gradient-to-r from-cyan-950/70 to-blue-950/70 border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                        : isCrit
                        ? 'bg-[#0e1424] border-red-500/30 hover:border-red-400/60 hover:bg-[#121b30]'
                        : 'bg-[#0a101e] border-cyan-500/15 hover:border-cyan-500/40 hover:bg-[#0e172a]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1.5 font-bold text-white">
                        <span>{atk.sourceFlag} {atk.sourceCity}</span>
                        <span className="text-cyan-400 font-mono">⟶</span>
                        <span>{atk.targetFlag} {atk.targetCity}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                            isCrit
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                              : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                          }`}
                        >
                          {atk.severity}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">{atk.timestamp}</span>
                      </div>
                    </div>

                    <div className="mt-1.5 flex items-start justify-between gap-2">
                      <div>
                        <div className="text-[11px] font-bold text-red-400 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-red-400 shrink-0" />
                          <span className="truncate">{atk.threatActor}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[220px]">
                          {atk.vector}
                        </div>
                      </div>

                      {atk.cve && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-950/60 border border-purple-500/40 text-purple-300 font-bold shrink-0">
                          {atk.cve}
                        </span>
                      )}
                    </div>

                    <div className="mt-2 pt-1.5 border-t border-cyan-500/10 flex items-center justify-between text-[10px]">
                      <span className="text-emerald-400 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-400" />
                        {atk.status || 'BLOCKED'}
                      </span>
                      <span className="text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 font-bold">
                        <Crosshair className="w-3 h-3" /> Focus on Globe
                      </span>
                    </div>
                  </div>
                );
              })
            ) : rightDeckTab === 'countries' ? (
              // Real 177+ Sovereign Country Threat Rankings (Dot Density Matrix)
              filteredCountries.map((ct) => {
                const isSelected = selectedCountry?.country === ct.country;
                return (
                  <div
                    key={ct.country}
                    onClick={() => handleSelectCountry(ct)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer relative group ${
                      isSelected
                        ? 'bg-gradient-to-r from-yellow-950/60 to-slate-900 border-yellow-400 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                        : 'bg-[#0a101e] border-cyan-500/15 hover:border-yellow-500/40 hover:bg-[#0e172a]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{ct.flag}</span>
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span>{ct.country}</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700 font-mono">
                              {ct.code}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 truncate max-w-[200px]">
                            {ct.dots.length} Distributed Hotspot Nodes
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-black font-mono text-yellow-400">
                          {ct.incidentCount.toLocaleString()}
                        </div>
                        <div className="text-[9px] text-slate-500 uppercase">Total Ingress</div>
                      </div>
                    </div>

                    <div className="mt-2 pt-2 border-t border-cyan-500/10 flex items-center justify-between text-[10px]">
                      <span className="text-slate-400 truncate max-w-[210px]">
                        Actors: <span className="text-red-300 font-bold">{ct.topActors.slice(0, 2).join(', ')}</span>
                      </span>
                      <span className="text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 font-bold">
                        <Crosshair className="w-3 h-3" /> Focus Dots
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              // Live Active Network & Web IDS Traffic Stream
              <div className="space-y-2">
                {/* IDS Mini-Telemetry Dashboard */}
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-emerald-500/30 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-emerald-400 font-bold">SENSOR ARMED</span>
                  </div>
                  <div className="text-slate-400">
                    Security Score: <span className="text-emerald-300 font-bold">{idsStats.securityScore}%</span> | Blocked: <span className="text-cyan-300 font-bold">{idsStats.threatsBlocked}</span>
                  </div>
                </div>

                {filteredIdsEvents.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 border border-dashed border-cyan-500/20 rounded-xl">
                    No active intrusion signatures detected.
                  </div>
                ) : (
                  filteredIdsEvents.map((evt) => {
                    const isBlocked = evt.status === 'Blocked' || blockedIps.has(evt.sourceIp);
                    const isCrit = evt.severity === 'Critical';

                    return (
                      <div
                        key={evt.id}
                        className={`p-3 rounded-xl border transition-all ${
                          isCrit
                            ? 'bg-red-950/30 border-red-500/40'
                            : 'bg-[#0a101e] border-emerald-500/20'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-1.5 font-bold text-white text-[11px]">
                            <span>{evt.countryFlag}</span>
                            <span className="text-red-400">{evt.sourceIp}</span>
                            <span className="text-slate-500">⟶</span>
                            <span className="text-cyan-300 truncate max-w-[150px]">{evt.targetEndpoint}</span>
                          </div>
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                              isBlocked
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                                : 'bg-red-950 text-red-400 border border-red-500/40'
                            }`}
                          >
                            {isBlocked ? 'BLOCKED' : 'ALERT'}
                          </span>
                        </div>

                        <div className="text-xs font-bold text-slate-200 mb-1">
                          {evt.eventType}
                        </div>

                        <div className="text-[10px] text-slate-400 font-mono mb-2">
                          Sig: <span className="text-amber-300">{evt.signature}</span> | {evt.mitreTechnique}
                        </div>

                        <div className="p-2 rounded-lg bg-black/40 border border-white/5 text-[10px] text-slate-300 mb-2">
                          {evt.mitigationTip}
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-white/5">
                          <span className="text-[9px] text-slate-500">{evt.timestamp}</span>
                          <div className="flex items-center gap-1.5">
                            {!isBlocked && (
                              <button
                                onClick={() => handleBlockIp(evt.sourceIp)}
                                className="px-2.5 py-1 rounded bg-red-600/80 hover:bg-red-500 text-white font-bold text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <Zap className="w-2.5 h-2.5" />
                                <span>Block IP</span>
                              </button>
                            )}
                            {onOpenAiSwarm && (
                              <button
                                onClick={() => onOpenAiSwarm(`Formulate immediate incident response playbook for: ${evt.eventType} (${evt.signature}) from IP ${evt.sourceIp} targeting ${evt.targetEndpoint}`)}
                                className="p-1 rounded bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 cursor-pointer"
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
