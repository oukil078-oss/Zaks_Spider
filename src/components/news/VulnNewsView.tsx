// ==========================================
// ZAK'S SPIDER — LIVE VULNERABILITY & ZERO-DAY RADAR
// Real-time CISA Known Exploited Vulnerabilities (KEV) Catalog
// Powered by GPT-6 Astra Intelligence & Second Brain Weaving
// ==========================================

import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldAlert, 
  Flame, 
  Search, 
  Filter, 
  RefreshCw, 
  ExternalLink, 
  Sparkles, 
  Network, 
  AlertTriangle, 
  CheckCircle2, 
  Skull, 
  Terminal, 
  ChevronRight, 
  Clock, 
  Layers, 
  Info,
  Calendar,
  Building2,
  Cpu,
  Lock
} from 'lucide-react';
import { VulnNewsItem, GlobalCyberAttack } from '../../types';
import { api } from '../../services/api';
import { LivingGlobe3D } from '../canvas/LivingGlobe3D';
import { LiveAttackStreamDeck, REAL_WORLD_ATTACK_POOL } from '../soc/LiveAttackStreamDeck';

interface VulnNewsViewProps {
  onWeaveCveToBrain?: (cve: VulnNewsItem, analysis?: string) => void;
  onSendToCopilot?: (prompt: string) => void;
}

export const VulnNewsView: React.FC<VulnNewsViewProps> = ({
  onWeaveCveToBrain,
  onSendToCopilot,
}) => {
  const [vulns, setVulns] = useState<VulnNewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedAttackCoords, setSelectedAttackCoords] = useState<[number, number] | undefined>(undefined);
  const [selectedAttackId, setSelectedAttackId] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedVendor, setSelectedVendor] = useState<string>('all');
  const [onlyRansomware, setOnlyRansomware] = useState(false);

  // Active Deep-Dive CVE Modal
  const [selectedCve, setSelectedCve] = useState<VulnNewsItem | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [cveAnalysis, setCveAnalysis] = useState<string | null>(null);

  // Load KEV Feed
  const fetchVulnFeed = async (force: boolean = false) => {
    if (force) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const res = await api.getVulnNews({ force });
      if (res.items) {
        setVulns(res.items);
        setLastUpdated(res.lastUpdated || new Date().toISOString());
      }
    } catch (e) {
      console.error('[VulnNews] Failed to load vulnerability feed:', e);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchVulnFeed();
  }, []);

  // Filtered Vulnerabilities
  const filteredVulns = useMemo(() => {
    return vulns.filter(v => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches = 
          v.cveID.toLowerCase().includes(q) ||
          v.vulnerabilityName.toLowerCase().includes(q) ||
          v.shortDescription.toLowerCase().includes(q) ||
          v.vendorProject.toLowerCase().includes(q) ||
          v.product.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // Severity
      if (selectedSeverity !== 'all' && v.severity !== selectedSeverity) {
        return false;
      }

      // Vendor
      if (selectedVendor !== 'all') {
        if (!v.vendorProject.toLowerCase().includes(selectedVendor.toLowerCase())) {
          return false;
        }
      }

      // Ransomware
      if (onlyRansomware && v.knownRansomwareCampaignUse !== 'Known') {
        return false;
      }

      return true;
    });
  }, [vulns, searchQuery, selectedSeverity, selectedVendor, onlyRansomware]);

  // Statistics
  const stats = useMemo(() => {
    const total = vulns.length;
    const criticalCount = vulns.filter(v => v.severity === 'CRITICAL').length;
    const ransomwareCount = vulns.filter(v => v.knownRansomwareCampaignUse === 'Known').length;
    return { total, criticalCount, ransomwareCount };
  }, [vulns]);

  // Handle Deep AI Analysis
  const handleAnalyzeWithAstra = async (cve: VulnNewsItem) => {
    setSelectedCve(cve);
    setIsAnalyzing(true);
    setCveAnalysis(null);

    try {
      const analysis = await api.analyzeCveWithAi(cve);
      setCveAnalysis(analysis);
    } catch (e) {
      setCveAnalysis('Failed to complete automated threat triage.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-red-500/25 bg-gradient-to-br from-[#0c0f17] via-[#090d15] to-[#12080a] p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-red-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 shadow-spider-glow flex items-center justify-center">
                <ShieldAlert className="w-7 h-7 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-mono">
                    VULNERABILITY & ZERO-DAY RADAR
                  </h1>
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
                    LIVE CISA KEV
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-gray-400 font-mono">
                  Autonomous threat intelligence streaming real-time actively exploited vulnerabilities in the wild.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Stats Bento */}
          <div className="flex items-center gap-3">
            <div className="px-4 py-3 rounded-2xl bg-black/40 border border-red-500/20 text-center">
              <span className="block text-[10px] uppercase font-mono text-gray-400">Total KEV</span>
              <span className="text-xl font-mono font-bold text-cyan-400">{stats.total}</span>
            </div>
            <div className="px-4 py-3 rounded-2xl bg-black/40 border border-red-500/20 text-center">
              <span className="block text-[10px] uppercase font-mono text-gray-400">Critical</span>
              <span className="text-xl font-mono font-bold text-red-400">{stats.criticalCount}</span>
            </div>
            <div className="px-4 py-3 rounded-2xl bg-black/40 border border-red-500/20 text-center">
              <span className="block text-[10px] uppercase font-mono text-gray-400">Ransomware</span>
              <span className="text-xl font-mono font-bold text-amber-400">{stats.ransomwareCount}</span>
            </div>
            <button
              onClick={() => fetchVulnFeed(true)}
              disabled={isRefreshing}
              className="p-3 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-all hover:scale-105"
              title="Refresh CISA KEV Feed"
            >
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* 3D Global Real-Time Cyber Attack Map Stage */}
      <div className="rounded-3xl border border-white/10 bg-[#0a101a]/90 backdrop-blur-xl p-5 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
            <div>
              <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
                GLOBAL REAL-TIME CYBER ATTACKS & EXPLOIT TRAJECTORIES
                <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                  LIVE INTERCEPT
                </span>
              </h2>
              <p className="text-[11px] text-zinc-400 font-mono">
                Active parabolic attack lines streaming from threat actor origin to victim infrastructure.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
            <span className="text-amber-400 font-bold">5 Active Vectors</span>
            <span>•</span>
            <span className="text-cyan-400">60 FPS Particle Arcs</span>
          </div>
        </div>

        {/* 2027 Bento Grid: 3D Living Globe (8 Cols) + Live Attack Stream Deck (4 Cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          {/* 3D Living Globe Canvas Container */}
          <div className="lg:col-span-8 h-[520px] w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative bg-[#06090e]">
            <LivingGlobe3D
              mode="attack-map"
              selectedCoords={selectedAttackCoords}
              activeAttacks={REAL_WORLD_ATTACK_POOL.map((a, i) => ({
                ...a,
                id: `globe-atk-${i}`,
                timestamp: 'Live'
              }))}
              className="w-full h-full"
            />
          </div>

          {/* Right Column: Live Attack Stream Deck */}
          <div className="lg:col-span-4 h-[520px]">
            <LiveAttackStreamDeck
              onSelectAttack={(atk) => {
                setSelectedAttackCoords(atk.targetCoords);
                setSelectedAttackId(atk.id);
              }}
              selectedAttackId={selectedAttackId}
            />
          </div>
        </div>
      </div>

      {/* Control Filters Bar */}
      <div className="p-4 rounded-2xl bg-[#0a0e17]/80 border border-cyan-500/20 backdrop-blur-md space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400/60" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search CVE ID, vendor, product, or vulnerability..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/50 border border-cyan-500/20 text-xs font-mono text-cyan-200 placeholder-gray-500 focus:outline-none focus:border-cyan-400"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Filter Buttons */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Severity Toggles */}
            <div className="flex items-center p-1 rounded-xl bg-black/40 border border-white/5 text-xs font-mono">
              {['all', 'CRITICAL', 'HIGH', 'MEDIUM'].map((sev) => (
                <button
                  key={sev}
                  onClick={() => setSelectedSeverity(sev)}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    selectedSeverity === sev
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {sev === 'all' ? 'All Severities' : sev}
                </button>
              ))}
            </div>

            {/* Ransomware Only Pill */}
            <button
              onClick={() => setOnlyRansomware(!onlyRansomware)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono transition-all ${
                onlyRansomware
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 font-bold'
                  : 'bg-black/40 text-gray-400 border border-white/5 hover:text-amber-300'
              }`}
            >
              <Skull className="w-3.5 h-3.5" />
              <span>Ransomware Linked</span>
            </button>
          </div>
        </div>

        {/* Vendor Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-[11px] font-mono">
          <span className="text-gray-500 flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5 text-cyan-400" />
            Vendor:
          </span>
          {['all', 'Microsoft', 'Linux', 'Cisco', 'Apache', 'NextCloud', 'Google', 'Apple', 'Fortinet', 'Ivanti', 'VMware'].map((v) => (
            <button
              key={v}
              onClick={() => setSelectedVendor(v)}
              className={`px-2.5 py-1 rounded-lg transition-all whitespace-nowrap ${
                selectedVendor === v
                  ? 'bg-red-500/20 text-red-300 border border-red-500/40 font-semibold'
                  : 'bg-black/30 text-gray-400 border border-white/5 hover:bg-white/5'
              }`}
            >
              {v === 'all' ? 'All Vendors' : v}
            </button>
          ))}
        </div>
      </div>

      {/* Vulnerabilities Grid */}
      {isLoading ? (
        <div className="py-20 text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full border-2 border-red-500 border-t-transparent animate-spin" />
          <p className="text-xs font-mono text-gray-400">Streaming live intelligence from CISA KEV catalog...</p>
        </div>
      ) : filteredVulns.length === 0 ? (
        <div className="py-16 text-center rounded-3xl border border-dashed border-gray-800 bg-black/20 p-8">
          <AlertTriangle className="w-10 h-10 mx-auto text-gray-600 mb-3" />
          <h3 className="text-base font-mono font-bold text-gray-300">No CVE advisories matched your filter</h3>
          <p className="text-xs text-gray-500 font-mono mt-1">Try broadening your search query or selecting "All Severities".</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredVulns.map((vuln) => (
            <div
              key={vuln.cveID}
              className="group relative flex flex-col justify-between p-5 rounded-2xl bg-[#0a0e17]/85 border border-white/5 hover:border-red-500/40 transition-all duration-300 hover:shadow-[0_0_25px_rgba(239,68,68,0.15)] overflow-hidden"
            >
              {/* Severity Top Line Highlight */}
              <div 
                className={`absolute top-0 left-0 right-0 h-1 ${
                  vuln.severity === 'CRITICAL' 
                    ? 'bg-gradient-to-r from-red-500 via-rose-400 to-amber-500' 
                    : vuln.severity === 'HIGH' 
                    ? 'bg-gradient-to-r from-amber-500 to-orange-400' 
                    : 'bg-gradient-to-r from-cyan-500 to-blue-400'
                }`} 
              />

              <div className="space-y-3">
                {/* Header: CVE ID, Severity & Ransomware */}
                <div className="flex items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-sm text-cyan-300 tracking-wider">
                      {vuln.cveID}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      vuln.severity === 'CRITICAL'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : vuln.severity === 'HIGH'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    }`}>
                      {vuln.severity || 'HIGH'}
                    </span>
                  </div>

                  {vuln.knownRansomwareCampaignUse === 'Known' && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                      <Skull className="w-3 h-3 text-purple-400" />
                      RANSOMWARE
                    </span>
                  )}
                </div>

                {/* Vendor & Product Banner */}
                <div className="text-[11px] font-mono text-gray-400 flex items-center gap-1.5">
                  <span className="text-gray-200 font-semibold">{vuln.vendorProject}</span>
                  <span>/</span>
                  <span className="text-cyan-400">{vuln.product}</span>
                </div>

                {/* Title */}
                <h3 className="font-bold text-sm text-gray-100 line-clamp-2 leading-snug group-hover:text-cyan-300 transition-colors">
                  {vuln.vulnerabilityName}
                </h3>

                {/* Description */}
                <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed">
                  {vuln.shortDescription}
                </p>

                {/* Required Action / Due Date */}
                {vuln.requiredAction && (
                  <div className="p-2.5 rounded-xl bg-black/40 border border-red-500/15 text-[11px] font-mono text-gray-300">
                    <span className="text-red-400 font-semibold block mb-0.5">Remediation Directive:</span>
                    <p className="line-clamp-2 text-gray-400">{vuln.requiredAction}</p>
                  </div>
                )}
              </div>

              {/* Bottom Card Actions */}
              <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1 text-[11px] font-mono text-gray-500">
                  <Calendar className="w-3 h-3" />
                  <span>Added: {vuln.dateAdded}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Deep AI Analysis Button */}
                  <button
                    onClick={() => handleAnalyzeWithAstra(vuln)}
                    className="p-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition-all flex items-center gap-1 text-xs font-mono font-semibold"
                    title="Deep AI Triage with GPT-6 Astra"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>AI Triage</span>
                  </button>

                  {/* Weave to Second Brain */}
                  {onWeaveCveToBrain && (
                    <button
                      onClick={() => onWeaveCveToBrain(vuln)}
                      className="p-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 transition-all"
                      title="Weave CVE into Second Brain"
                    >
                      <Network className="w-3.5 h-3.5 text-purple-400" />
                    </button>
                  )}

                  {/* NVD Link */}
                  {vuln.sourceUrl && (
                    <a
                      href={vuln.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                      title="View on NVD NIST"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Deep AI Triage Modal */}
      {selectedCve && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-3xl max-h-[85vh] rounded-3xl bg-[#090d16] border border-cyan-500/30 shadow-[0_0_50px_rgba(0,240,255,0.2)] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-cyan-500/20 flex items-start justify-between gap-4 bg-black/40">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-lg text-cyan-400">{selectedCve.cveID}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                    {selectedCve.severity}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    GPT-6 ASTRA ANALYSIS
                  </span>
                </div>
                <h2 className="font-bold text-base text-white">{selectedCve.vulnerabilityName}</h2>
                <p className="text-xs font-mono text-gray-400">
                  Target: {selectedCve.vendorProject} — {selectedCve.product}
                </p>
              </div>

              <button
                onClick={() => { setSelectedCve(null); setCveAnalysis(null); }}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs text-gray-300 leading-relaxed font-sans">
              {isAnalyzing ? (
                <div className="py-16 text-center space-y-3">
                  <div className="w-10 h-10 mx-auto rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
                  <p className="font-mono text-cyan-400">GPT-6 Astra synthesizing attack surface & defense vectors...</p>
                </div>
              ) : cveAnalysis ? (
                <div className="prose prose-invert max-w-none prose-pre:bg-black/60 prose-pre:border prose-pre:border-cyan-500/20">
                  <div className="whitespace-pre-wrap font-mono text-xs bg-black/40 p-5 rounded-2xl border border-cyan-500/20 text-cyan-100">
                    {cveAnalysis}
                  </div>
                </div>
              ) : (
                <p>No analysis generated.</p>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-cyan-500/20 bg-black/50 flex items-center justify-between gap-3">
              <div className="text-[11px] font-mono text-gray-400">
                Model: <span className="text-cyan-400 font-bold">gpt-6-astra</span> (ExperientialLabs Core)
              </div>

              <div className="flex items-center gap-2">
                {onWeaveCveToBrain && selectedCve && (
                  <button
                    onClick={() => {
                      onWeaveCveToBrain(selectedCve, cveAnalysis || undefined);
                      setSelectedCve(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-mono font-bold flex items-center gap-1.5 transition"
                  >
                    <Network className="w-4 h-4" />
                    <span>Weave into Neural Web</span>
                  </button>
                )}

                {onSendToCopilot && selectedCve && (
                  <button
                    onClick={() => {
                      onSendToCopilot(`I need an in-depth offensive & defensive breakdown of ${selectedCve.cveID} affecting ${selectedCve.vendorProject} ${selectedCve.product}. What are the CTF / exploit mechanics and how do we patch it?`);
                      setSelectedCve(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-mono font-bold flex items-center gap-1.5 transition"
                  >
                    <Terminal className="w-4 h-4" />
                    <span>Open in AI Pentest Buddy</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
