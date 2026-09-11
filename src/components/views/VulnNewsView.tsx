import React, { useState, useEffect, useMemo } from 'react';
import { 
  Bug, ShieldAlert, AlertTriangle, Flame, Terminal, 
  ExternalLink, Search, Filter, RefreshCw, Layers, 
  Copy, Check, Bot, Zap, ArrowRight, ShieldCheck, Database, 
  FileText, X, Download, SlidersHorizontal, ArrowUpDown, 
  Code2, Shield, ChevronRight, CheckCircle2, ChevronDown, 
  Sparkles, AlertOctagon, Table, LayoutGrid
} from 'lucide-react';
import { VulnNewsItem } from '../../types';
import { HISTORIC_CVE_CATALOG } from '../../data/historicCveCatalog';
import { apiService } from '../../services/api';

interface VulnNewsViewProps {
  onPivotToPentest?: (commandOrTool: string) => void;
  onOpenAiSwarm?: (initialPrompt?: string, cveContext?: VulnNewsItem) => void;
  activeSubSection?: string;
}

type SortField = 'cvssScore' | 'epssScore' | 'dateAdded' | 'cveID';
type SortOrder = 'asc' | 'desc';

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
  const [kevOnly, setKevOnly] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  
  // Sort State
  const [sortField, setSortField] = useState<SortField>('cvssScore');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Inspector Drawer State
  const [selectedCve, setSelectedCve] = useState<VulnNewsItem | null>(null);
  const [activeDrawerTab, setActiveDrawerTab] = useState<'overview' | 'mitre' | 'detection'>('overview');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<string | null>(null);

  // Sync with activeSubSection from NavRail
  useEffect(() => {
    if (activeSubSection === 'zero-days') {
      setSelectedEra('2024-2026');
      setRansomwareOnly(false);
      setKevOnly(false);
    } else if (activeSubSection === 'ransomware') {
      setRansomwareOnly(true);
      setSelectedEra('all');
      setKevOnly(false);
    } else if (activeSubSection === 'classics') {
      setSelectedEra('historic');
      setRansomwareOnly(false);
      setKevOnly(false);
    } else if (activeSubSection === 'kev') {
      setKevOnly(true);
      setSelectedEra('all');
      setRansomwareOnly(false);
    } else if (activeSubSection === 'all') {
      setSelectedEra('all');
      setRansomwareOnly(false);
      setKevOnly(false);
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

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Filter and Sort in-memory
  const filteredAndSortedVulns = useMemo(() => {
    let result = vulns.filter((v) => {
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
      const matchesKev = !kevOnly || v.exploitStatus === 'In The Wild (KEV)' || v.requiredAction;
      const matchesSeverity = selectedSeverity === 'all' || v.severity === selectedSeverity;
      return matchesSearch && matchesWeaponized && matchesKev && matchesSeverity;
    });

    result.sort((a, b) => {
      let aVal: any = a[sortField] ?? 0;
      let bVal: any = b[sortField] ?? 0;
      if (sortField === 'cveID') {
        aVal = a.cveID;
        bVal = b.cveID;
      }
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [vulns, searchQuery, weaponizedOnly, kevOnly, selectedSeverity, sortField, sortOrder]);

  // Key Metrics
  const metrics = useMemo(() => {
    const total = vulns.length;
    const critical = vulns.filter(v => v.severity === 'CRITICAL').length;
    const ransomware = vulns.filter(v => v.knownRansomwareCampaignUse === 'Known').length;
    const weaponized = vulns.filter(v => v.weaponized).length;
    const highEpss = vulns.filter(v => (v.epssScore ?? 0) >= 0.5).length;
    return { total, critical, ransomware, weaponized, highEpss };
  }, [vulns]);

  // Export CSV Handler
  const handleExportCsv = () => {
    const headers = ['CVE_ID', 'Vendor', 'Product', 'Title', 'CVSS', 'Severity', 'EPSS_Percent', 'Ransomware', 'Weaponized', 'Required_Action'];
    const rows = filteredAndSortedVulns.map(v => [
      v.cveID,
      `"${v.vendorProject.replace(/"/g, '""')}"`,
      `"${v.product.replace(/"/g, '""')}"`,
      `"${v.vulnerabilityName.replace(/"/g, '""')}"`,
      v.cvssScore || '',
      v.severity || '',
      v.epssScore ? (v.epssScore * 100).toFixed(1) + '%' : '',
      v.knownRansomwareCampaignUse || 'Unknown',
      v.weaponized ? 'TRUE' : 'FALSE',
      `"${(v.requiredAction || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `cve_threat_intel_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Generate Sigma Rule for selected CVE
  const getSigmaRule = (cve: VulnNewsItem) => {
    const isRce = cve.vulnerabilityName.toLowerCase().includes('execution') || cve.vulnerabilityName.toLowerCase().includes('rce');
    const technique = isRce ? 't1190' : cve.vulnerabilityName.toLowerCase().includes('privilege') ? 't1068' : 't1210';
    return `title: Exploitation of ${cve.cveID} - ${cve.product}
id: sig-${cve.cveID.toLowerCase().replace(/[^a-z0-9]/g, '-')}-spider
status: production
description: Detects network and endpoint exploitation activity targeting ${cve.product} (${cve.vendorProject}) via ${cve.cveID}.
references:
  - https://nvd.nist.gov/vuln/detail/${cve.cveID}
  - ${cve.sourceUrl || 'https://www.cisa.gov/known-exploited-vulnerabilities-catalog'}
author: Spider CTI Team
date: ${cve.dateAdded || '2024/01/15'}
tags:
  - attack.${technique}
  - attack.initial_access
  - cve.${cve.cveID.toLowerCase()}
logsource:
  category: webserver
  product: ${cve.vendorProject.toLowerCase().replace(/[^a-z0-9]/g, '_')}
detection:
  selection:
    c-uri|contains:
      - '/api/v1/'
      - '/admin/'
      - '/rest/'
    sc-status:
      - 200
      - 500
  condition: selection
falsepositives:
  - Legitimate administrative web console operations
level: ${cve.severity === 'CRITICAL' ? 'critical' : 'high'}`;
  };

  // Generate YARA Rule for selected CVE
  const getYaraRule = (cve: VulnNewsItem) => {
    const safeId = cve.cveID.replace(/[^a-zA-Z0-9]/g, '_');
    return `rule Exploit_${safeId} {
    meta:
        description = "Detects binary/script artifacts exploiting ${cve.cveID} (${cve.product})"
        author = "Spider CTI Research"
        date = "${cve.dateAdded || '2024-01-01'}"
        cve = "${cve.cveID}"
        cvss = "${cve.cvssScore || 9.8}"
    strings:
        $target = "${cve.vendorProject}" ascii wide nocase
        $cve_str = "${cve.cveID}" ascii
        $payload1 = "/bin/sh" ascii
        $payload2 = "cmd.exe" ascii nocase
        $powershell = "powershell -enc" ascii nocase
    condition:
        ($target and $cve_str) or ($payload1 and $payload2) or $powershell
}`;
  };

  return (
    <div className="flex-1 w-full h-full flex flex-col overflow-hidden font-sans text-slate-200">
      {/* 1. Sleek Enterprise Statistical Ribbon */}
      <div className="px-4 py-2 bg-[#090e18] border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Indexed Threats</span>
            <span className="text-sm font-bold font-mono text-white">{metrics.total}</span>
          </div>

          <div className="h-4 w-[1px] bg-slate-800 hidden sm:block" />

          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            <span className="text-[11px] font-mono text-slate-400 uppercase">Critical (≥9.0)</span>
            <span className="text-sm font-bold font-mono text-red-400">{metrics.critical}</span>
          </div>

          <div className="h-4 w-[1px] bg-slate-800 hidden sm:block" />

          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            <span className="text-[11px] font-mono text-slate-400 uppercase">Ransomware Tied</span>
            <span className="text-sm font-bold font-mono text-purple-400">{metrics.ransomware}</span>
          </div>

          <div className="h-4 w-[1px] bg-slate-800 hidden md:block" />

          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span className="text-[11px] font-mono text-slate-400 uppercase">Weaponized PoC</span>
            <span className="text-sm font-bold font-mono text-amber-400">{metrics.weaponized}</span>
          </div>

          <div className="h-4 w-[1px] bg-slate-800 hidden lg:block" />

          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[11px] font-mono text-slate-400 uppercase">High EPSS (&gt;50%)</span>
            <span className="text-sm font-bold font-mono text-emerald-400">{metrics.highEpss}</span>
          </div>
        </div>

        {/* Sync & Refresh Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchVulns(true)}
            title="Force refresh CISA KEV JSON feed"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 text-xs font-mono transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-400' : ''}`} />
            <span>SYNC KEV</span>
          </button>
        </div>
      </div>

      {/* 2. Unified Filter, Search & View Controls Bar */}
      <div className="px-4 py-2.5 bg-[#0b101b] border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
        {/* Search Input */}
        <div className="flex-1 min-w-[220px] max-w-md relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter CVE ID, Vendor, Product, or Keyword..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#080d17] border border-slate-800 hover:border-slate-700 focus:border-blue-500 rounded-md text-white placeholder-slate-500 focus:outline-none transition-colors"
          />
        </div>

        {/* Filter Badges & Quick Selectors */}
        <div className="flex items-center gap-1.5 flex-wrap text-xs">
          {/* Era Filter Selector */}
          <select
            value={selectedEra}
            onChange={e => setSelectedEra(e.target.value)}
            className="bg-[#080d17] border border-slate-800 text-slate-300 px-2.5 py-1.5 rounded-md text-xs outline-none cursor-pointer hover:border-slate-700"
          >
            <option value="all">All Eras (1999–2026)</option>
            <option value="2024-2026">2024–2026 Active Zero-Days</option>
            <option value="2020-2023">2020–2023 Modern Exploits</option>
            <option value="historic">Historic Classics (1999–2019)</option>
          </select>

          {/* Severity Selector */}
          <select
            value={selectedSeverity}
            onChange={e => setSelectedSeverity(e.target.value)}
            className="bg-[#080d17] border border-slate-800 text-slate-300 px-2.5 py-1.5 rounded-md text-xs outline-none cursor-pointer hover:border-slate-700"
          >
            <option value="all">All Severities</option>
            <option value="CRITICAL">Critical (9.0–10.0)</option>
            <option value="HIGH">High (7.0–8.9)</option>
            <option value="MEDIUM">Medium (4.0–6.9)</option>
          </select>

          {/* CISA KEV Toggle */}
          <button
            onClick={() => setKevOnly(!kevOnly)}
            className={`px-2.5 py-1.5 rounded-md text-xs font-medium border transition-colors cursor-pointer flex items-center gap-1.5 ${
              kevOnly
                ? 'bg-blue-600/20 border-blue-500/60 text-blue-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>CISA KEV</span>
          </button>

          {/* Ransomware Toggle */}
          <button
            onClick={() => setRansomwareOnly(!ransomwareOnly)}
            className={`px-2.5 py-1.5 rounded-md text-xs font-medium border transition-colors cursor-pointer flex items-center gap-1.5 ${
              ransomwareOnly
                ? 'bg-purple-950/60 border-purple-500/60 text-purple-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Ransomware</span>
          </button>

          {/* Weaponized Toggle */}
          <button
            onClick={() => setWeaponizedOnly(!weaponizedOnly)}
            className={`px-2.5 py-1.5 rounded-md text-xs font-medium border transition-colors cursor-pointer flex items-center gap-1.5 ${
              weaponizedOnly
                ? 'bg-amber-950/60 border-amber-500/60 text-amber-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Weaponized</span>
          </button>
        </div>

        {/* View Toggle & CSV Export */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center bg-[#080d17] border border-slate-800 rounded-md p-0.5">
            <button
              onClick={() => setViewMode('table')}
              title="Dense Table View"
              className={`p-1.5 rounded text-xs transition-colors ${
                viewMode === 'table' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              title="Card Grid View"
              className={`p-1.5 rounded text-xs transition-colors ${
                viewMode === 'cards' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={handleExportCsv}
            title="Export filtered threats as CSV"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 3. Main Stage: Data Table / Cards + Inspector Split */}
      <div className="flex-1 w-full flex overflow-hidden relative">
        {/* Left Side: Table View or Card View */}
        <div className={`flex-1 h-full overflow-y-auto ${selectedCve ? 'hidden lg:block' : ''}`}>
          {loading ? (
            <div className="w-full h-64 flex flex-col items-center justify-center gap-2 text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
              <span className="text-xs font-mono tracking-wider">Synchronizing threat intelligence feed...</span>
            </div>
          ) : filteredAndSortedVulns.length === 0 ? (
            <div className="w-full h-64 flex flex-col items-center justify-center gap-2 text-slate-400">
              <Bug className="w-8 h-8 text-slate-600" />
              <span className="text-sm font-semibold text-slate-300">No vulnerabilities match current query</span>
              <p className="text-xs text-slate-500">Try broadening your search term or resetting active filters.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedEra('all');
                  setSelectedSeverity('all');
                  setRansomwareOnly(false);
                  setWeaponizedOnly(false);
                  setKevOnly(false);
                }}
                className="mt-2 px-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-xs font-mono text-slate-200"
              >
                Reset All Filters
              </button>
            </div>
          ) : viewMode === 'table' ? (
            /* Enterprise High-Density Table */
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-10 bg-[#0a0f1d] border-b border-slate-800 text-[11px] font-mono text-slate-400 uppercase select-none">
                <tr>
                  <th 
                    onClick={() => handleSort('cveID')}
                    className="py-2.5 px-3.5 font-semibold cursor-pointer hover:text-white"
                  >
                    <div className="flex items-center gap-1">
                      <span>CVE Identifier</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-600" />
                    </div>
                  </th>
                  <th className="py-2.5 px-3 font-semibold">Vendor & Asset</th>
                  <th className="py-2.5 px-3 font-semibold">Vulnerability Description</th>
                  <th 
                    onClick={() => handleSort('cvssScore')}
                    className="py-2.5 px-3 font-semibold cursor-pointer hover:text-white text-center"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>CVSS v3</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-600" />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('epssScore')}
                    className="py-2.5 px-3 font-semibold cursor-pointer hover:text-white text-center"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>EPSS Risk</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-600" />
                    </div>
                  </th>
                  <th className="py-2.5 px-3 font-semibold text-center">Threat Status</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs font-sans">
                {filteredAndSortedVulns.map((v) => {
                  const isSelected = selectedCve?.cveID === v.cveID;
                  const isCrit = v.severity === 'CRITICAL' || (v.cvssScore && v.cvssScore >= 9.0);
                  const isHigh = v.severity === 'HIGH' || (v.cvssScore && v.cvssScore >= 7.0 && v.cvssScore < 9.0);
                  const epssPct = v.epssScore ? Math.round(v.epssScore * 100) : null;

                  return (
                    <tr
                      key={v.cveID}
                      onClick={() => setSelectedCve(v)}
                      className={`transition-colors cursor-pointer ${
                        isSelected 
                          ? 'bg-blue-600/10 border-l-2 border-blue-500' 
                          : 'hover:bg-slate-800/40'
                      }`}
                    >
                      {/* CVE Identifier */}
                      <td className="py-3 px-3.5 font-mono text-xs font-semibold text-white whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span>{v.cveID}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(v.cveID, v.cveID);
                            }}
                            title="Copy CVE ID"
                            className="text-slate-500 hover:text-slate-300 p-0.5 rounded"
                          >
                            {copiedId === v.cveID ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </td>

                      {/* Vendor & Product */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="font-medium text-slate-200">{v.vendorProject}</div>
                        <div className="text-[11px] text-slate-400 font-mono truncate max-w-[140px]">{v.product}</div>
                      </td>

                      {/* Title & Description */}
                      <td className="py-3 px-3 min-w-[240px] max-w-md">
                        <div className="font-medium text-slate-100 truncate">{v.vulnerabilityName}</div>
                        <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{v.shortDescription}</p>
                      </td>

                      {/* CVSS Score */}
                      <td className="py-3 px-3 text-center whitespace-nowrap font-mono">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                          isCrit 
                            ? 'bg-red-950/70 border border-red-800/60 text-red-300' 
                            : isHigh 
                            ? 'bg-amber-950/70 border border-amber-800/60 text-amber-300' 
                            : 'bg-slate-800 border border-slate-700 text-slate-300'
                        }`}>
                          {v.cvssScore ? v.cvssScore.toFixed(1) : '9.0'}
                        </span>
                      </td>

                      {/* EPSS Score Meter */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        {epssPct !== null ? (
                          <div className="flex flex-col items-center gap-1 font-mono text-[11px]">
                            <span className={epssPct >= 70 ? 'text-red-400 font-bold' : epssPct >= 30 ? 'text-amber-400' : 'text-slate-400'}>
                              {epssPct}%
                            </span>
                            <div className="w-14 h-1 bg-slate-800 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${epssPct >= 70 ? 'bg-red-500' : epssPct >= 30 ? 'bg-amber-500' : 'bg-blue-500'}`}
                                style={{ width: `${Math.min(100, epssPct)}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-600 font-mono text-[11px]">—</span>
                        )}
                      </td>

                      {/* Threat Status Tags */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1 flex-wrap">
                          {v.knownRansomwareCampaignUse === 'Known' && (
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-950/80 text-purple-300 border border-purple-800/60" title="Actively leveraged by ransomware operators">
                              RANSOMWARE
                            </span>
                          )}
                          {v.weaponized && (
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-950/80 text-amber-300 border border-amber-800/60" title="Public weaponized exploit available">
                              POC
                            </span>
                          )}
                          {(v.exploitStatus === 'In The Wild (KEV)' || v.requiredAction) && (
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-950/80 text-blue-300 border border-blue-800/60" title="Flagged in CISA KEV Catalog">
                              KEV
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCve(v);
                          }}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-300 text-xs font-medium transition-colors cursor-pointer"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            /* Enterprise Card Grid */
            <div className="p-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2.5">
              {filteredAndSortedVulns.map(v => {
                const isSelected = selectedCve?.cveID === v.cveID;
                const isCrit = v.severity === 'CRITICAL' || (v.cvssScore && v.cvssScore >= 9.0);
                return (
                  <div
                    key={v.cveID}
                    onClick={() => setSelectedCve(v)}
                    className={`p-3.5 rounded-lg border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected 
                        ? 'bg-[#0f1728] border-blue-500' 
                        : 'bg-[#090d18] border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono font-bold text-xs text-white">{v.cveID}</span>
                        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                          isCrit ? 'bg-red-950 text-red-400 border border-red-800/60' : 'bg-slate-800 text-slate-300'
                        }`}>
                          CVSS {v.cvssScore?.toFixed(1) || '9.0'}
                        </span>
                      </div>
                      <div className="text-xs font-medium text-slate-200 mb-1">{v.vendorProject} • {v.product}</div>
                      <p className="text-xs text-slate-400 line-clamp-2 mb-3">{v.vulnerabilityName}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px]">
                      <div className="flex items-center gap-1 font-mono text-slate-500">
                        {v.epssScore && <span>EPSS {(v.epssScore * 100).toFixed(0)}%</span>}
                      </div>
                      <span className="text-blue-400 font-medium hover:underline flex items-center gap-0.5">
                        Details <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Side: Slide-Out Intelligence Dossier Drawer */}
        {selectedCve && (
          <aside className="w-full lg:w-[480px] h-full bg-[#0c121e] border-l border-slate-800 flex flex-col shrink-0 z-20 animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-800 bg-[#090e18] flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold font-mono text-white">{selectedCve.cveID}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    selectedCve.severity === 'CRITICAL' ? 'bg-red-950 text-red-400 border border-red-800/60' : 'bg-slate-800 text-slate-300'
                  }`}>
                    CVSS {selectedCve.cvssScore?.toFixed(1) || '9.0'}
                  </span>
                  {selectedCve.knownRansomwareCampaignUse === 'Known' && (
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-purple-950 text-purple-300 border border-purple-800/60">
                      RANSOMWARE
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-400 mt-1 font-medium">
                  {selectedCve.vendorProject} / {selectedCve.product}
                </div>
              </div>

              <button
                onClick={() => setSelectedCve(null)}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors"
                title="Close Inspector"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Tabs */}
            <div className="flex border-b border-slate-800 bg-[#0a0f1b] text-xs">
              <button
                onClick={() => setActiveDrawerTab('overview')}
                className={`flex-1 py-2 font-medium transition-colors border-b-2 ${
                  activeDrawerTab === 'overview' 
                    ? 'border-blue-500 text-white bg-slate-800/30' 
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Overview & Impact
              </button>
              <button
                onClick={() => setActiveDrawerTab('mitre')}
                className={`flex-1 py-2 font-medium transition-colors border-b-2 ${
                  activeDrawerTab === 'mitre' 
                    ? 'border-blue-500 text-white bg-slate-800/30' 
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                MITRE ATT&CK
              </button>
              <button
                onClick={() => setActiveDrawerTab('detection')}
                className={`flex-1 py-2 font-medium transition-colors border-b-2 ${
                  activeDrawerTab === 'detection' 
                    ? 'border-blue-500 text-white bg-slate-800/30' 
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Detection Rules
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-sans">
              {activeDrawerTab === 'overview' && (
                <>
                  {/* Vulnerability Name & Short Description */}
                  <div>
                    <h4 className="font-semibold text-slate-100 text-sm mb-1.5">{selectedCve.vulnerabilityName}</h4>
                    <p className="text-slate-300 leading-relaxed text-xs bg-slate-900/60 p-3 rounded-md border border-slate-800/80">
                      {selectedCve.shortDescription}
                    </p>
                  </div>

                  {/* Required Action / Remediation */}
                  {selectedCve.requiredAction && (
                    <div className="bg-red-950/20 border border-red-900/40 rounded-md p-3">
                      <div className="flex items-center gap-2 text-red-400 font-semibold mb-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>CISA Remediation Directive</span>
                      </div>
                      <p className="text-slate-300 text-xs leading-relaxed">
                        {selectedCve.requiredAction}
                      </p>
                      {selectedCve.dueDate && (
                        <div className="text-[11px] font-mono text-red-400 mt-2">
                          Federal Mandate Due Date: {selectedCve.dueDate}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Metadata Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 bg-slate-900/60 rounded border border-slate-800/80">
                      <div className="text-slate-500 font-mono text-[10px] uppercase">EPSS Probability</div>
                      <div className="text-slate-100 font-bold font-mono mt-0.5">
                        {selectedCve.epssScore ? `${(selectedCve.epssScore * 100).toFixed(1)}%` : 'N/A'}
                      </div>
                    </div>

                    <div className="p-2.5 bg-slate-900/60 rounded border border-slate-800/80">
                      <div className="text-slate-500 font-mono text-[10px] uppercase">Exploit Availability</div>
                      <div className="text-slate-100 font-semibold mt-0.5">
                        {selectedCve.weaponized ? 'Public Weaponized PoC' : 'Under Observation'}
                      </div>
                    </div>

                    {selectedCve.cwes && selectedCve.cwes.length > 0 && (
                      <div className="col-span-2 p-2.5 bg-slate-900/60 rounded border border-slate-800/80">
                        <div className="text-slate-500 font-mono text-[10px] uppercase">Weakness Taxonomy (CWE)</div>
                        <div className="flex items-center gap-1.5 mt-1">
                          {selectedCve.cwes.map(cwe => (
                            <span key={cwe} className="px-1.5 py-0.5 bg-slate-800 font-mono text-slate-300 rounded text-[11px]">
                              {cwe}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* AI Threat Assessment Button */}
                  <div className="pt-2">
                    <button
                      onClick={() => handleTriggerAiAnalysis(selectedCve)}
                      disabled={aiAnalyzing}
                      className="w-full py-2 px-3 rounded-md bg-blue-600 hover:bg-blue-500 text-white font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Sparkles className={`w-3.5 h-3.5 ${aiAnalyzing ? 'animate-spin' : ''}`} />
                      <span>{aiAnalyzing ? 'Analyzing with Neural Swarm...' : 'Generate AI Risk & Triage Synthesis'}</span>
                    </button>

                    {aiAnalysisResult && (
                      <div className="mt-3 p-3 rounded bg-[#090d16] border border-blue-500/30 text-xs text-slate-200 leading-relaxed font-mono">
                        <div className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-1.5">
                          Virtual SOC Operator Assessment
                        </div>
                        <div className="whitespace-pre-wrap">{aiAnalysisResult}</div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {activeDrawerTab === 'mitre' && (
                <div className="space-y-3">
                  <div className="p-3 rounded bg-slate-900/60 border border-slate-800">
                    <div className="text-[10px] font-mono text-slate-400 uppercase">Primary Attack Tactic</div>
                    <div className="text-sm font-bold text-white mt-1">TA0001: Initial Access</div>
                    <p className="text-xs text-slate-400 mt-1">
                      Adversary leverages public-facing application vulnerabilities to establish foothold in the network.
                    </p>
                  </div>

                  <div className="p-3 rounded bg-slate-900/60 border border-slate-800">
                    <div className="text-[10px] font-mono text-slate-400 uppercase">Mapped Technique</div>
                    <div className="text-sm font-bold text-blue-400 mt-1">T1190: Exploit Public-Facing Application</div>
                    <p className="text-xs text-slate-400 mt-1">
                      Targets server daemon or web application endpoints before authentication boundaries.
                    </p>
                  </div>

                  <div className="p-3 rounded bg-slate-900/60 border border-slate-800">
                    <div className="text-[10px] font-mono text-slate-400 uppercase">Recommended Mitigation</div>
                    <ul className="list-disc pl-4 mt-1.5 space-y-1 text-slate-300 text-xs">
                      <li>Apply vendor security advisory update immediately.</li>
                      <li>Deploy network intrusion signatures to block malformed HTTP URI payloads.</li>
                      <li>Isolate administrative management interfaces from public exposure.</li>
                    </ul>
                  </div>
                </div>
              )}

              {activeDrawerTab === 'detection' && (
                <div className="space-y-4">
                  {/* Sigma Rule */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-slate-200">Sigma Detection Rule (YAML)</span>
                      <button
                        onClick={() => copyToClipboard(getSigmaRule(selectedCve), 'sigma')}
                        className="flex items-center gap-1 text-[11px] font-mono text-slate-400 hover:text-white cursor-pointer"
                      >
                        {copiedId === 'sigma' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedId === 'sigma' ? 'Copied' : 'Copy Sigma'}</span>
                      </button>
                    </div>
                    <pre className="p-3 rounded bg-[#070b13] border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto leading-relaxed">
                      {getSigmaRule(selectedCve)}
                    </pre>
                  </div>

                  {/* YARA Rule */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-slate-200">YARA Binary Signature</span>
                      <button
                        onClick={() => copyToClipboard(getYaraRule(selectedCve), 'yara')}
                        className="flex items-center gap-1 text-[11px] font-mono text-slate-400 hover:text-white cursor-pointer"
                      >
                        {copiedId === 'yara' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedId === 'yara' ? 'Copied' : 'Copy YARA'}</span>
                      </button>
                    </div>
                    <pre className="p-3 rounded bg-[#070b13] border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto leading-relaxed">
                      {getYaraRule(selectedCve)}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Actions Footer */}
            <div className="p-3 border-t border-slate-800 bg-[#090e18] flex items-center gap-2">
              {selectedCve.pentestToolRef && onPivotToPentest && (
                <button
                  onClick={() => onPivotToPentest(selectedCve.pentestToolRef!)}
                  className="flex-1 py-1.5 px-3 rounded bg-amber-950/60 hover:bg-amber-900/60 border border-amber-800/60 text-amber-300 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Pivot to PenTest Command</span>
                </button>
              )}

              {onOpenAiSwarm && (
                <button
                  onClick={() => onOpenAiSwarm(`Dissect vulnerability ${selectedCve.cveID} (${selectedCve.vulnerabilityName}) and generate mitigation rules.`, selectedCve)}
                  className="flex-1 py-1.5 px-3 rounded bg-blue-950/60 hover:bg-blue-900/60 border border-blue-800/60 text-blue-300 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>Dispatch Swarm</span>
                </button>
              )}

              {selectedCve.sourceUrl && (
                <a
                  href={selectedCve.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                  title="Open Official Advisory Link"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};
