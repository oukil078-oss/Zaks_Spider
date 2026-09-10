import React, { useState, useEffect } from 'react';
import { 
  Bug, ShieldAlert, AlertTriangle, Flame, Terminal, 
  ExternalLink, Search, Filter, RefreshCw, Layers, 
  Copy, Check, Bot, Zap, ArrowRight, ShieldCheck, Database, FileText, X
} from 'lucide-react';
import { VulnNewsItem } from '../../types';
import { HISTORIC_CVE_CATALOG } from '../../data/historicCveCatalog';
import { apiService } from '../../services/api';

interface VulnNewsViewProps {
  onPivotToPentest?: (commandOrTool: string) => void;
  onOpenAiSwarm?: (initialPrompt?: string, cveContext?: VulnNewsItem) => void;
  activeSubSection?: string;
}

export const VulnNewsView: React.FC<VulnNewsViewProps> = ({
  onPivotToPentest,
  onOpenAiSwarm,
  activeSubSection = 'all',
}) => {
  const [vulns, setVulns] = useState<VulnNewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEra, setSelectedEra] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [ransomwareOnly, setRansomwareOnly] = useState(false);
  const [weaponizedOnly, setWeaponizedOnly] = useState(false);
  const [selectedCve, setSelectedCve] = useState<VulnNewsItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<string | null>(null);

  // Sync with activeSubSection from NavRail
  useEffect(() => {
    if (activeSubSection === 'zero-days') {
      setSelectedEra('2024-2026');
      setRansomwareOnly(false);
    } else if (activeSubSection === 'ransomware') {
      setRansomwareOnly(true);
      setSelectedEra('all');
    } else if (activeSubSection === 'classics') {
      setSelectedEra('historic');
      setRansomwareOnly(false);
    } else if (activeSubSection === 'kev') {
      setSelectedEra('kev');
      setRansomwareOnly(false);
    } else if (activeSubSection === 'all') {
      setSelectedEra('all');
      setRansomwareOnly(false);
    }
  }, [activeSubSection]);

  // Load vulnerabilities from API with fallback to historic catalog
  const fetchVulns = async (forceRefresh = false) => {
    setLoading(true);
    try {
      const res = await apiService.getVulnNews({
        era: selectedEra !== 'all' ? selectedEra : undefined,
        severity: selectedSeverity !== 'all' ? selectedSeverity : undefined,
        ransomware: ransomwareOnly ? 'known' : undefined,
        force: forceRefresh,
      });
      if (res && res.items && res.items.length > 0) {
        setVulns(res.items);
      } else {
        setVulns(HISTORIC_CVE_CATALOG);
      }
    } catch (e) {
      console.warn('Failed to load Vuln News, fallback to historic catalog:', e);
      setVulns(HISTORIC_CVE_CATALOG);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVulns();
  }, [selectedEra, selectedSeverity, ransomwareOnly]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleTriggerAiAnalysis = async (cve: VulnNewsItem) => {
    setAiAnalyzing(true);
    setAiAnalysisResult(null);
    try {
      const result = await apiService.analyzeCveWithAi(cve);
      setAiAnalysisResult(result);
    } catch (err) {
      setAiAnalysisResult('AI Triage error: unable to establish neural bridge.');
    } finally {
      setAiAnalyzing(false);
    }
  };

  // Filter in-memory for instant search query responsiveness
  const filteredVulns = vulns.filter((v) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      v.cveID.toLowerCase().includes(q) ||
      v.vulnerabilityName.toLowerCase().includes(q) ||
      v.shortDescription.toLowerCase().includes(q) ||
      v.vendorProject.toLowerCase().includes(q) ||
      v.product.toLowerCase().includes(q) ||
      (v.metasploitModule && v.metasploitModule.toLowerCase().includes(q)) ||
      (v.exploitDbId && v.exploitDbId.toLowerCase().includes(q));

    const matchesWeaponized = !weaponizedOnly || v.weaponized;
    return matchesSearch && matchesWeaponized;
  });

  // Calculate metrics
  const totalCount = vulns.length;
  const criticalCount = vulns.filter((v) => v.severity === 'CRITICAL').length;
  const ransomwareCount = vulns.filter((v) => v.knownRansomwareCampaignUse === 'Known').length;
  const weaponizedCount = vulns.filter((v) => v.weaponized).length;

  return (
    <div className="flex-1 w-full h-full flex flex-col gap-3 overflow-hidden font-mono">
      {/* 1. Top Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 shrink-0">
        <div className="p-3 rounded-2xl bg-[#080e1a]/95 border border-cyan-500/20 shadow-lg flex items-center justify-between">
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Cataloged CVEs</div>
            <div className="text-xl font-black text-cyan-300 drop-shadow-[0_0_8px_rgba(0,240,255,0.4)]">
              {totalCount > 100 ? `${totalCount}+` : totalCount}
            </div>
            <div className="text-[9px] text-slate-500">1999 — 2026 Live Radar</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Database className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-[#080e1a]/95 border border-red-500/20 shadow-lg flex items-center justify-between">
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Critical 9.0+ CVSS</div>
            <div className="text-xl font-black text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.4)]">
              {criticalCount}
            </div>
            <div className="text-[9px] text-red-400/70">Unauthenticated RCE</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
            <Flame className="w-4 h-4 animate-pulse" />
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-[#080e1a]/95 border border-purple-500/20 shadow-lg flex items-center justify-between">
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Ransomware Used</div>
            <div className="text-xl font-black text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]">
              {ransomwareCount}
            </div>
            <div className="text-[9px] text-purple-400/70">LockBit, BlackCat, CL0P</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <ShieldAlert className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-[#080e1a]/95 border border-amber-500/20 shadow-lg flex items-center justify-between">
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Weaponized PoCs</div>
            <div className="text-xl font-black text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]">
              {weaponizedCount}
            </div>
            <div className="text-[9px] text-amber-400/70">Metasploit & Exploit-DB</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Terminal className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-[#080e1a]/95 border border-emerald-500/20 shadow-lg flex items-center justify-between col-span-2 sm:col-span-1">
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">CISA KEV Feed</div>
            <div className="text-sm font-black text-emerald-400 flex items-center gap-1.5 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>SYNCHRONIZED</span>
            </div>
            <div className="text-[9px] text-slate-500 mt-1">Automated Zero-Day Ingest</div>
          </div>
          <button
            onClick={() => fetchVulns(true)}
            title="Force refresh CISA KEV JSON"
            className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/20 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. Filter & Search Controls Bar */}
      <div className="p-3 rounded-2xl bg-[#080e1a]/95 border border-cyan-500/20 shadow-lg flex flex-wrap items-center justify-between gap-3 shrink-0">
        {/* Search Input */}
        <div className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search CVE (e.g. MS08-067, EternalBlue, Log4Shell, Fortinet, Apache)..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-900/90 border border-cyan-500/20 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
          />
        </div>

        {/* Era Selector Tabs */}
        <div className="flex items-center gap-1 bg-[#050914] p-1 rounded-xl border border-cyan-500/20 text-xs">
          {[
            { id: 'all', label: 'All Eras' },
            { id: '2024-2026', label: '2024-2026 Zero-Days' },
            { id: '2020-2023', label: '2020-2023 Modern' },
            { id: 'historic', label: 'Historic Classics (1999-2019)' },
          ].map((era) => (
            <button
              key={era.id}
              onClick={() => setSelectedEra(era.id)}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                selectedEra === era.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {era.label}
            </button>
          ))}
        </div>

        {/* Toggles: Ransomware & Weaponized */}
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setRansomwareOnly(!ransomwareOnly)}
            className={`px-3 py-1.5 rounded-xl border font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              ransomwareOnly
                ? 'bg-purple-950/60 border-purple-500 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                : 'bg-slate-900/60 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />
            <span>Ransomware Only</span>
          </button>

          <button
            onClick={() => setWeaponizedOnly(!weaponizedOnly)}
            className={`px-3 py-1.5 rounded-xl border font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              weaponizedOnly
                ? 'bg-amber-950/60 border-amber-500 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                : 'bg-slate-900/60 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-amber-400" />
            <span>Weaponized</span>
          </button>
        </div>
      </div>

      {/* 3. Main Stage: Vulnerability Cards Grid */}
      <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-cyan-500/20 scrollbar-track-transparent">
        {loading ? (
          <div className="w-full h-64 flex flex-col items-center justify-center gap-3 text-cyan-400">
            <RefreshCw className="w-8 h-8 animate-spin" />
            <span className="text-sm font-bold tracking-widest uppercase">Ingesting CISA KEV Threat Telemetry...</span>
          </div>
        ) : filteredVulns.length === 0 ? (
          <div className="w-full h-64 flex flex-col items-center justify-center gap-2 text-slate-400 border border-dashed border-cyan-500/20 rounded-2xl">
            <Bug className="w-8 h-8 text-slate-600" />
            <span className="text-sm font-bold">No vulnerabilities match the current filter criteria.</span>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedEra('all');
                setRansomwareOnly(false);
                setWeaponizedOnly(false);
              }}
              className="mt-2 px-4 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-bold hover:bg-cyan-500/30 cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredVulns.map((v) => {
              const isCrit = v.severity === 'CRITICAL';
              const isHigh = v.severity === 'HIGH';

              return (
                <div
                  key={v.cveID}
                  className={`flex flex-col justify-between p-4 rounded-2xl bg-[#0a101d]/90 border transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,240,255,0.2)] hover:border-cyan-400/60 ${
                    isCrit
                      ? 'border-red-500/30 hover:border-red-400'
                      : isHigh
                      ? 'border-amber-500/30 hover:border-amber-400'
                      : 'border-cyan-500/20'
                  }`}
                >
                  <div>
                    {/* Top Row: CVE ID + Badges */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-white tracking-wider font-mono">
                          {v.cveID}
                        </span>
                        <span
                          className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase border ${
                            isCrit
                              ? 'bg-red-950/70 border-red-500/60 text-red-300'
                              : isHigh
                              ? 'bg-amber-950/70 border-amber-500/60 text-amber-300'
                              : 'bg-cyan-950/70 border-cyan-500/60 text-cyan-300'
                          }`}
                        >
                          CVSS {v.cvssScore?.toFixed(1) || '9.0'}
                        </span>
                      </div>

                      {v.historicEra && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {v.historicEra === '1999-2010'
                            ? 'CLASSIC'
                            : v.historicEra === '2014-2019'
                            ? 'LEGEND'
                            : v.historicEra === '2020-2023'
                            ? 'MODERN'
                            : 'ZERO-DAY'}
                        </span>
                      )}
                    </div>

                    {/* Product & Vendor */}
                    <div className="text-[11px] text-cyan-400 font-bold mb-1 truncate">
                      {v.vendorProject} • <span className="text-slate-300">{v.product}</span>
                    </div>

                    {/* Vulnerability Title */}
                    <h3 className="text-xs font-bold text-white leading-snug line-clamp-2 mb-2">
                      {v.vulnerabilityName}
                    </h3>

                    {/* Short Description */}
                    <p className="text-[11px] text-slate-400 line-clamp-3 mb-3 leading-relaxed">
                      {v.shortDescription}
                    </p>

                    {/* Indicators: Ransomware, Metasploit, Exploit-DB */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {v.knownRansomwareCampaignUse === 'Known' && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-500/40 flex items-center gap-1">
                          <Flame className="w-2.5 h-2.5 text-purple-400" />
                          <span>Ransomware</span>
                        </span>
                      )}
                      {v.metasploitModule && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                          <Terminal className="w-2.5 h-2.5 text-amber-400" />
                          <span>Metasploit</span>
                        </span>
                      )}
                      {v.exploitDbId && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-950/60 text-blue-300 border border-blue-500/40">
                          {v.exploitDbId}
                        </span>
                      )}
                      {v.cwes && v.cwes.length > 0 && (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                          {v.cwes[0]}
                        </span>
                      )}
                    </div>

                    {/* EPSS Score Meter */}
                    {v.epssScore && (
                      <div className="mb-3">
                        <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                          <span>EPSS Exploit Probability</span>
                          <span className="text-cyan-300 font-bold">{(v.epssScore * 100).toFixed(1)}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-cyan-400 to-red-500 rounded-full"
                            style={{ width: `${Math.min(100, v.epssScore * 100)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-3 border-t border-cyan-500/10 flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedCve(v);
                        handleTriggerAiAnalysis(v);
                      }}
                      className="flex-1 py-1.5 px-2.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Inspect Dossier</span>
                    </button>

                    {v.pentestToolRef && onPivotToPentest && (
                      <button
                        onClick={() => onPivotToPentest(v.pentestToolRef!)}
                        title="Pivot to PenTest Lab command"
                        className="py-1.5 px-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                      >
                        <Terminal className="w-3.5 h-3.5" />
                        <span>Pivot</span>
                      </button>
                    )}

                    {onOpenAiSwarm && (
                      <button
                        onClick={() => onOpenAiSwarm(`Dissect vulnerability ${v.cveID} (${v.vulnerabilityName}) and generate detection & containment rules.`, v)}
                        title="Dispatch to AI Cyber Swarm"
                        className="p-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/40 text-purple-300 transition-all cursor-pointer"
                      >
                        <Bot className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Deep CVE Technical Dossier Modal */}
      {selectedCve && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-2xl max-h-[85vh] rounded-2xl bg-[#0a101d] border border-cyan-400/50 shadow-[0_0_40px_rgba(0,240,255,0.25)] flex flex-col overflow-hidden font-mono text-xs">
            {/* Modal Header */}
            <div className="p-4 border-b border-cyan-500/20 bg-[#060a14] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-base font-black text-white">{selectedCve.cveID}</span>
                <span className="px-2 py-0.5 rounded-full bg-red-950/60 border border-red-500/40 text-red-300 text-[10px] font-bold">
                  CVSS {selectedCve.cvssScore?.toFixed(1) || '10.0'} CRITICAL
                </span>
                {selectedCve.historicEra && (
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-bold">
                    {selectedCve.historicEra}
                  </span>
                )}
              </div>
              <button
                onClick={() => {
                  setSelectedCve(null);
                  setAiAnalysisResult(null);
                }}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 p-4 space-y-4 overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-500/20">
              {/* Overview */}
              <div>
                <h4 className="text-sm font-bold text-cyan-300 mb-1">{selectedCve.vulnerabilityName}</h4>
                <div className="text-[11px] text-slate-400">
                  Vendor: <span className="text-white font-bold">{selectedCve.vendorProject}</span> | Product: <span className="text-white font-bold">{selectedCve.product}</span>
                </div>
              </div>

              {/* Description */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 leading-relaxed">
                {selectedCve.shortDescription}
              </div>

              {/* Remediation Requirement */}
              {selectedCve.requiredAction && (
                <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-300">
                  <div className="font-bold mb-1 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>CISA Required Remediation Action:</span>
                  </div>
                  <div className="text-[11px] text-slate-200">{selectedCve.requiredAction}</div>
                  {selectedCve.dueDate && (
                    <div className="mt-1 text-[10px] text-emerald-400/80">
                      Federal Compliance Deadline: {selectedCve.dueDate}
                    </div>
                  )}
                </div>
              )}

              {/* Tactical Exploit Ref */}
              {selectedCve.pentestToolRef && (
                <div className="p-3 rounded-xl bg-slate-950 border border-amber-500/30">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                      <Terminal className="w-3.5 h-3.5" />
                      <span>Tactical Probe / Exploitation Command</span>
                    </span>
                    <button
                      onClick={() => copyToClipboard(selectedCve.pentestToolRef!, 'poc')}
                      className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      {copiedId === 'poc' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedId === 'poc' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <code className="text-amber-300 text-[11px] break-all select-all font-mono">
                    {selectedCve.pentestToolRef}
                  </code>
                </div>
              )}

              {/* AI Triage Section */}
              <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/30">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-purple-300 font-bold">
                    <Bot className="w-4 h-4 text-purple-400" />
                    <span>Widow-AI Autonomous Vulnerability Triage</span>
                  </div>
                  {aiAnalyzing && <RefreshCw className="w-3.5 h-3.5 text-purple-400 animate-spin" />}
                </div>

                {aiAnalyzing ? (
                  <div className="text-slate-400 italic">Dissecting binary offsets and generating Sigma mitigation rule...</div>
                ) : aiAnalysisResult ? (
                  <div className="text-slate-200 leading-relaxed whitespace-pre-line text-[11px]">
                    {aiAnalysisResult}
                  </div>
                ) : (
                  <button
                    onClick={() => handleTriggerAiAnalysis(selectedCve)}
                    className="px-3 py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/40 text-purple-300 font-bold cursor-pointer"
                  >
                    Generate AI Threat Analysis & Sigma Rule
                  </button>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-cyan-500/20 bg-[#060a14] flex items-center justify-between">
              {selectedCve.sourceUrl && (
                <a
                  href={selectedCve.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:underline flex items-center gap-1"
                >
                  <span>NVD / NIST Advisory</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}

              <div className="flex items-center gap-2">
                {selectedCve.pentestToolRef && onPivotToPentest && (
                  <button
                    onClick={() => {
                      onPivotToPentest(selectedCve.pentestToolRef!);
                      setSelectedCve(null);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Terminal className="w-3.5 h-3.5" />
                    <span>Launch in PenTest Lab</span>
                  </button>
                )}

                <button
                  onClick={() => setSelectedCve(null)}
                  className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
