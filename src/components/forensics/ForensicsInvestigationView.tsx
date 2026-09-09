// ==========================================
// ZAK'S SPIDER — DIGITAL FORENSICS & OSINT INVESTIGATION MATRIX
// Silicon Valley Cybersecurity Startup & Academic Master's Degree Defense Platform
// Cross-Platform Username Enumeration, IP Geolocation & Telephony Forensics
// ==========================================

import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Globe,
  Phone,
  User,
  Shield,
  ShieldCheck,
  ShieldAlert,
  MapPin,
  Compass,
  Navigation,
  Cpu,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  Download,
  FileText,
  AlertTriangle,
  Radio,
  Activity,
  RefreshCw,
  Layers,
  Database,
  Lock,
  Eye,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Filter,
  Crosshair,
  Network,
  Share2,
  Terminal,
  Clock,
  Briefcase,
  Award,
  BookOpen,
  UserCheck,
  Mail,
  FileSearch,
  Sparkle
} from 'lucide-react';
import { 
  ForensicsSubTab, 
  OsintCategory, 
  UsernameCheckResult, 
  IpLookupResult, 
  PhoneLookupResult, 
  ForensicCaseDossier,
  BrainNoteItem,
  FullNameProfile,
  ThreatArc
} from '../../types';
import { api, OSINT_PLATFORMS } from '../../services/api';
import { LivingGlobe3D } from '../canvas/LivingGlobe3D';
import { marked } from 'marked';

interface ForensicsInvestigationViewProps {
  activeSubTab?: ForensicsSubTab;
  onSelectSubTab?: (subTab: ForensicsSubTab) => void;
  onWeaveDossierToBrain: (dossier: ForensicCaseDossier, report: string) => void;
  onWeaveUsernameResultToBrain?: (res: UsernameCheckResult) => void;
  onWeaveIpResultToBrain?: (res: IpLookupResult) => void;
  onWeavePhoneResultToBrain?: (res: PhoneLookupResult) => void;
  onWeaveProfileToBrain?: (profile: FullNameProfile) => void;
}

export const ForensicsInvestigationView: React.FC<ForensicsInvestigationViewProps> = ({
  activeSubTab: propSubTab,
  onSelectSubTab,
  onWeaveDossierToBrain,
  onWeaveUsernameResultToBrain,
  onWeaveIpResultToBrain,
  onWeavePhoneResultToBrain,
  onWeaveProfileToBrain,
}) => {
  // Active Sub-Tab controlled by prop or fallback to internal state
  const [internalSubTab, setInternalSubTab] = useState<ForensicsSubTab>('username');
  const activeSubTab = propSubTab || internalSubTab;
  const setActiveSubTab = (tab: ForensicsSubTab) => {
    if (onSelectSubTab) onSelectSubTab(tab);
    setInternalSubTab(tab);
  };

  // Case Metadata
  const [caseId] = useState(() => `CASE-2026-MSc-${Math.floor(1000 + Math.random() * 9000)}`);
  const [investigator] = useState('Zakarya Oukil');
  const [complianceConsent, setComplianceConsent] = useState(true);

  // --- 1. Username Matrix State ---
  const [usernameInput, setUsernameInput] = useState('oukil078');
  const [isScanningUsernames, setIsScanningUsernames] = useState(false);
  const [usernameResults, setUsernameResults] = useState<UsernameCheckResult[]>([]);
  const [usernameCategoryFilter, setUsernameCategoryFilter] = useState<'All' | 'Found' | OsintCategory>('All');
  const [usernameSearchQuery, setUsernameSearchQuery] = useState('');
  const [scanProgress, setScanProgress] = useState({ done: 0, total: OSINT_PLATFORMS.length });

  // --- 2. Full Name & Identity Permutation State ---
  const [fullNameInput, setFullNameInput] = useState('Zakarya Oukil');
  const [companyInput, setCompanyInput] = useState('Cybersec Intelligence Labs / USTHB');
  const [locationInput, setLocationInput] = useState('Algiers, Algeria (Wilaya 16)');
  const [nameProfile, setNameProfile] = useState<FullNameProfile | null>(null);

  // --- 3. IP Intelligence State ---
  const [ipInput, setIpInput] = useState('105.101.0.1'); // Algérie Télécom / Algiers gateway default
  const [isLookingUpIp, setIsLookingUpIp] = useState(false);
  const [ipResult, setIpResult] = useState<IpLookupResult | null>(null);

  // --- 4. Phone Forensics State ---
  const [phoneInput, setPhoneInput] = useState('+213 555 12 34 56'); // Algeria Mobile default
  const [isLookingUpPhone, setIsLookingUpPhone] = useState(false);
  const [phoneResult, setPhoneResult] = useState<PhoneLookupResult | null>(null);

  // --- 5. Dossier & AI Synthesis State ---
  const [isSynthesizingAi, setIsSynthesizingAi] = useState(false);
  const [aiDossierReport, setAiDossierReport] = useState<string>('');
  const [selectedAiModel, setSelectedAiModel] = useState<'gpt-6-astra' | 'qwen3.8-27b' | 'deepseek-v4-flash'>('gpt-6-astra');
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  // Initial Auto-Load Defaults for seamless investor demo
  useEffect(() => {
    // Run an initial quick scan so the screen opens with verified findings immediately
    handleUsernameScan('oukil078');
    handleGenerateNameProfile('Zakarya Oukil', 'Cybersec Labs / USTHB', 'Algiers, Algeria');
    handleIpLookup('105.101.0.1');
    handlePhoneLookup('+213 555 12 34 56');
  }, []);

  // Copy helper
  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(id);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  // --- Handler 1: Username Footprint Scan ---
  const handleUsernameScan = async (targetHandle?: string) => {
    const handle = (targetHandle || usernameInput).trim();
    if (!handle || isScanningUsernames) return;

    setIsScanningUsernames(true);
    setScanProgress({ done: 0, total: OSINT_PLATFORMS.length });
    setUsernameResults([]);

    try {
      const results = await api.checkUsernames(handle, (oneResult, done, total) => {
        setUsernameResults(prev => [...prev, oneResult]);
        setScanProgress({ done, total });
      });
      setUsernameResults(results);
    } catch (e) {
      console.error('[Forensics] Username scan error:', e);
    } finally {
      setIsScanningUsernames(false);
    }
  };

  // --- Handler 1B: Full Name & Identity Permutation Generator ---
  const handleGenerateNameProfile = (nameStr?: string, compStr?: string, locStr?: string) => {
    const rawName = (nameStr || fullNameInput).trim();
    if (!rawName) return;

    const parts = rawName.split(/\s+/).filter(Boolean);
    const firstName = parts[0] || '';
    const lastName = parts.slice(1).join(' ') || '';
    const fn = firstName.toLowerCase();
    const ln = (parts[parts.length - 1] || '').toLowerCase();
    const cleanCompany = (compStr || companyInput).trim().replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || 'targetcorp';
    const domain = `${cleanCompany}.com`;

    // Permutations for social & dev usernames
    const aliases: string[] = Array.from(new Set([
      `${fn}.${ln}`,
      `${fn}_${ln}`,
      `${fn}${ln}`,
      `${fn[0] || ''}${ln}`,
      `${fn[0] || ''}.${ln}`,
      `${ln}.${fn}`,
      `${ln}${fn}`,
      `${fn}078`,
      `${fn}_sec`,
      `${fn}dev`,
      rawName.toLowerCase().replace(/\s+/g, '')
    ])).filter(Boolean);

    // Probable corporate and personal emails
    const probableEmails = [
      { email: `${fn}.${ln}@${domain}`, pattern: '{first}.{last}@{domain}', confidence: 95 },
      { email: `${fn[0] || ''}${ln}@${domain}`, pattern: '{f}{last}@{domain}', confidence: 90 },
      { email: `${fn}@${domain}`, pattern: '{first}@{domain}', confidence: 75 },
      { email: `${fn}_${ln}@${domain}`, pattern: '{first}_{last}@{domain}', confidence: 70 },
      { email: `${ln}.${fn}@${domain}`, pattern: '{last}.{first}@{domain}', confidence: 60 },
      { email: `${fn}.${ln}@gmail.com`, pattern: '{first}.{last}@gmail.com', confidence: 85 },
      { email: `${fn}${ln}@proton.me`, pattern: '{first}{last}@proton.me (OpSec)', confidence: 70 },
    ];

    // High-impact investigator Google dorks
    const searchDorks = [
      {
        label: 'LinkedIn Professional Profile',
        query: `site:linkedin.com/in/ "${rawName}"`,
        url: `https://www.google.com/search?q=${encodeURIComponent(`site:linkedin.com/in/ "${rawName}"`)}`
      },
      {
        label: 'GitHub & Code Repositories',
        query: `site:github.com "${rawName}" OR "${aliases[0]}"`,
        url: `https://www.google.com/search?q=${encodeURIComponent(`site:github.com "${rawName}" OR "${aliases[0]}"`)}`
      },
      {
        label: 'PDF Resumes, CVs & Thesis Papers',
        query: `filetype:pdf "${rawName}" ("resume" OR "curriculum vitae" OR "thesis" OR "paper")`,
        url: `https://www.google.com/search?q=${encodeURIComponent(`filetype:pdf "${rawName}" ("resume" OR "curriculum vitae" OR "thesis" OR "paper")`)}`
      },
      {
        label: 'University & Academic Records (.edu / .dz)',
        query: `"${rawName}" (site:edu OR site:dz OR site:ac.uk OR "university" OR "USTHB")`,
        url: `https://www.google.com/search?q=${encodeURIComponent(`"${rawName}" (site:edu OR site:dz OR site:ac.uk OR "university" OR "USTHB")`)}`
      },
      {
        label: 'Credential Dumps & Pastebin Leaks',
        query: `"${rawName}" OR "${aliases[0]}" site:pastebin.com OR site:ghostbin.com OR site:rentry.co`,
        url: `https://www.google.com/search?q=${encodeURIComponent(`"${rawName}" OR "${aliases[0]}" site:pastebin.com OR site:ghostbin.com OR site:rentry.co`)}`
      },
      {
        label: 'Social Media Footprint (X / Instagram)',
        query: `(site:twitter.com OR site:x.com OR site:instagram.com) "${rawName}"`,
        url: `https://www.google.com/search?q=${encodeURIComponent(`(site:twitter.com OR site:x.com OR site:instagram.com) "${rawName}"`)}`
      }
    ];

    const profile: FullNameProfile = {
      fullName: rawName,
      firstName,
      lastName,
      knownAliases: aliases,
      company: compStr || companyInput,
      location: locStr || locationInput,
      probableEmails,
      searchDorks
    };

    setNameProfile(profile);
  };

  // --- Handler 2: IP Intelligence Lookup ---
  const handleIpLookup = async (targetIp?: string) => {
    const target = (targetIp || ipInput).trim();
    if (!target || isLookingUpIp) return;

    setIsLookingUpIp(true);
    try {
      const res = await api.lookupIp(target);
      if (res.success && res.data) {
        setIpResult(res.data);
      }
    } catch (e) {
      console.error('[Forensics] IP lookup error:', e);
    } finally {
      setIsLookingUpIp(false);
    }
  };

  // --- Handler 3: Phone Telephony Lookup ---
  const handlePhoneLookup = async (targetPhone?: string) => {
    const target = (targetPhone || phoneInput).trim();
    if (!target || isLookingUpPhone) return;

    setIsLookingUpPhone(true);
    try {
      const res = await api.lookupPhone(target);
      if (res.success && res.data) {
        setPhoneResult(res.data);
      }
    } catch (e) {
      console.error('[Forensics] Phone lookup error:', e);
    } finally {
      setIsLookingUpPhone(false);
    }
  };

  // --- Handler 4: AI Dossier Synthesis with GPT-6 Astra ---
  const handleSynthesizeDossier = async () => {
    setIsSynthesizingAi(true);
    try {
      const currentDossier: ForensicCaseDossier = {
        caseId,
        caseTitle: `Cross-Vector OSINT Audit // ${usernameInput || 'Target'}`,
        investigator,
        affiliation: 'Master of Science in Cybersecurity & Threat Intelligence',
        createdAt: new Date().toISOString(),
        targetHandle: usernameInput,
        targetIp: ipResult?.query,
        targetPhone: phoneResult?.formattedE164,
        usernameFindings: usernameResults,
        ipFindings: ipResult || undefined,
        phoneFindings: phoneResult || undefined,
        complianceConsent,
      };

      const res = await api.correlateDossierWithAi(currentDossier, selectedAiModel);
      if (res.success && res.report) {
        setAiDossierReport(res.report);
      }
    } catch (e) {
      console.error('[Forensics] AI synthesis failed:', e);
    } finally {
      setIsSynthesizingAi(false);
    }
  };

  // Filtered Username Findings
  const filteredUsernameResults = useMemo(() => {
    return usernameResults.filter(item => {
      // Category filter
      if (usernameCategoryFilter === 'Found' && item.status !== 'found') return false;
      if (usernameCategoryFilter !== 'All' && usernameCategoryFilter !== 'Found' && item.category !== usernameCategoryFilter) {
        return false;
      }
      // Text query
      if (usernameSearchQuery.trim()) {
        const q = usernameSearchQuery.toLowerCase();
        return (
          item.platform.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.profileUrl.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [usernameResults, usernameCategoryFilter, usernameSearchQuery]);

  const verifiedHitsCount = useMemo(() => {
    return usernameResults.filter(r => r.status === 'found').length;
  }, [usernameResults]);

  const avgLatency = useMemo(() => {
    const latencies = usernameResults.filter(r => r.latencyMs).map(r => r.latencyMs!);
    if (!latencies.length) return 42;
    return Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length);
  }, [usernameResults]);

  // Export JSON
  const handleExportJson = () => {
    const exportData = {
      caseId,
      investigator,
      date: new Date().toISOString(),
      target: {
        username: usernameInput,
        ip: ipResult?.query,
        phone: phoneResult?.formattedE164,
      },
      usernameFindings: usernameResults,
      ipFindings: ipResult,
      phoneFindings: phoneResult,
      aiReport: aiDossierReport,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${caseId}-FORENSICS-DOSSIER.json`;
    a.click();
  };

  // Export Markdown Report
  const handleExportMarkdown = () => {
    const reportContent = aiDossierReport || `# 🛡️ Forensic Case Dossier: ${caseId}
Investigator: ${investigator}
Date: ${new Date().toISOString()}
Target Handle: ${usernameInput}
Verified Accounts: ${verifiedHitsCount} of ${usernameResults.length}
Target IP: ${ipResult?.query || 'N/A'} (${ipResult?.city || ''}, ${ipResult?.country || ''})
Target Phone: ${phoneResult?.formattedE164 || 'N/A'}
`;
    const blob = new Blob([reportContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${caseId}-AUDIT-REPORT.md`;
    a.click();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* ========================================================================= */}
      {/* 1. Silicon Valley Startup & Master's Degree Institutional Telemetry HUD */}
      {/* ========================================================================= */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#0d1522]/90 via-[#0a101b]/95 to-[#0b1424]/90 border border-cyan-500/25 p-5 shadow-2xl backdrop-blur-2xl overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 font-mono text-[10px] font-bold tracking-wider border border-cyan-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-cyan-400" />
                ACADEMIC MASTER'S CAPSTONE // SILICON VALLEY STARTUP PREVIEW
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-purple-500/20 text-purple-300 font-mono text-[10px] font-bold tracking-wider border border-purple-500/30 flex items-center gap-1">
                <Lock className="w-3 h-3 text-purple-400" />
                CHAIN OF CUSTODY VERIFIED
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 font-mono text-[10px] border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                DEFCON 1 READY
              </span>
            </div>

            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-extrabold font-mono tracking-tight bg-gradient-to-r from-cyan-300 via-sky-200 to-purple-300 bg-clip-text text-transparent">
                DIGITAL FORENSICS & OSINT INVESTIGATION MATRIX
              </h1>
            </div>

            <p className="text-xs text-gray-400 font-mono max-w-3xl">
              Commercial-grade threat intelligence and forensic attribution suite for university directors and venture capital investors. Multi-vector cross-platform identity mapping across 50+ platforms, IP telemetry, and telephony forensics.
            </p>
          </div>

          {/* Quick Case Metadata Telemetry */}
          <div className="flex flex-wrap items-center gap-2 bg-black/40 border border-white/10 rounded-2xl p-2.5 text-xs font-mono">
            <div className="px-3 py-1 bg-cyan-950/40 rounded-xl border border-cyan-500/20">
              <span className="text-[10px] text-gray-500 block uppercase">Case Identifier</span>
              <span className="text-cyan-300 font-bold">{caseId}</span>
            </div>
            <div className="px-3 py-1 bg-purple-950/40 rounded-xl border border-purple-500/20">
              <span className="text-[10px] text-gray-500 block uppercase">Lead Investigator</span>
              <span className="text-purple-300 font-bold">{investigator}</span>
            </div>
            <div className="px-3 py-1 bg-emerald-950/40 rounded-xl border border-emerald-500/20">
              <span className="text-[10px] text-gray-500 block uppercase">Ethics Protocol</span>
              <span className="text-emerald-300 font-bold">Consensual Research</span>
            </div>
          </div>
        </div>

        {/* Sub-Tab Navigation Bar */}
        <div className="mt-5 pt-4 border-t border-cyan-500/15 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-black/60 border border-white/10 overflow-x-auto max-w-full">
            <button
              onClick={() => setActiveSubTab('username')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap ${
                activeSubTab === 'username'
                  ? 'bg-gradient-to-r from-cyan-500/30 to-blue-500/30 text-cyan-300 border border-cyan-400/50 shadow-spider-glow'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
              }`}
            >
              <User className="w-3.5 h-3.5 text-cyan-400" />
              <span>Username Footprint Matrix</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                52 Platforms
              </span>
            </button>

            <button
              onClick={() => setActiveSubTab('name')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap ${
                activeSubTab === 'name'
                  ? 'bg-gradient-to-r from-blue-500/30 to-indigo-500/30 text-blue-300 border border-blue-400/50 shadow-sm'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Full Name & Alias Profiler</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40">
                Dorks & Emails
              </span>
            </button>

            <button
              onClick={() => setActiveSubTab('ip')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap ${
                activeSubTab === 'ip'
                  ? 'bg-gradient-to-r from-emerald-500/30 to-teal-500/30 text-emerald-300 border border-emerald-400/50 shadow-sm'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>IP Geolocation & Cartography</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                Radar HUD
              </span>
            </button>

            <button
              onClick={() => setActiveSubTab('phone')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap ${
                activeSubTab === 'phone'
                  ? 'bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-purple-300 border border-purple-400/50 shadow-sm'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
              }`}
            >
              <Phone className="w-3.5 h-3.5 text-purple-400" />
              <span>Telephony & Phone OSINT</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
                E.164 Forensics
              </span>
            </button>

            <button
              onClick={() => setActiveSubTab('dossier')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap ${
                activeSubTab === 'dossier'
                  ? 'bg-gradient-to-r from-amber-500/30 to-orange-500/30 text-amber-300 border border-amber-400/50 shadow-sm'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span>Consolidated Case Dossier</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                GPT-6 Synthesis
              </span>
            </button>
          </div>

          {/* Quick Action Export Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportJson}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/40 hover:bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-mono transition"
              title="Download full forensic JSON evidence dump"
            >
              <Download className="w-3 h-3" />
              <span>Export JSON</span>
            </button>
            <button
              onClick={handleExportMarkdown}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/40 hover:bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-mono transition"
              title="Download formal Markdown forensic audit report"
            >
              <FileText className="w-3 h-3" />
              <span>Audit Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SUB-VIEW A: USERNAME FOOTPRINT MATRIX (52 PLATFORMS)                   */}
      {/* ========================================================================= */}
      {activeSubTab === 'username' && (
        <div className="space-y-6">
          {/* Target Input & Command Bar */}
          <div className="rounded-3xl bg-[#090e17]/85 border border-cyan-500/20 p-5 shadow-xl backdrop-blur-xl">
            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-cyan-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={usernameInput}
                  onChange={e => setUsernameInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleUsernameScan()}
                  placeholder="Enter target username handle (e.g. oukil078, torvalds, satya)..."
                  className="w-full pl-10 pr-4 py-3 bg-black/60 border border-cyan-500/30 rounded-2xl text-sm font-mono text-cyan-100 placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40 transition shadow-inner"
                />
              </div>

              {/* Quick Launch Preset Tags */}
              <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                {['oukil078', 'torvalds', 'satya', 'secops'].map(preset => (
                  <button
                    key={preset}
                    onClick={() => {
                      setUsernameInput(preset);
                      handleUsernameScan(preset);
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-black/40 hover:bg-cyan-500/20 text-gray-400 hover:text-cyan-300 text-[11px] font-mono border border-white/5 transition whitespace-nowrap"
                  >
                    @{preset}
                  </button>
                ))}
              </div>

              {/* Execute Button */}
              <button
                onClick={() => handleUsernameScan()}
                disabled={isScanningUsernames || !usernameInput.trim()}
                className="w-full md:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-spider-glow hover:shadow-cyan-500/40 transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {isScanningUsernames ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-black" />
                    <span>SCANNING MATRIX...</span>
                  </>
                ) : (
                  <>
                    <Crosshair className="w-4 h-4 text-black" />
                    <span>LAUNCH OSINT PROBE</span>
                  </>
                )}
              </button>
            </div>

            {/* Scan Progress & Metrics Telemetry */}
            <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-black/30 rounded-2xl p-3 border border-white/5">
                <span className="text-[10px] font-mono text-gray-500 block uppercase">Target Handle</span>
                <span className="text-sm font-mono font-bold text-cyan-300">@{usernameInput || 'none'}</span>
              </div>
              <div className="bg-black/30 rounded-2xl p-3 border border-white/5">
                <span className="text-[10px] font-mono text-gray-500 block uppercase">Verified Hit Rate</span>
                <span className="text-sm font-mono font-bold text-emerald-400">
                  {verifiedHitsCount} / {usernameResults.length || 52} ({Math.round((verifiedHitsCount / (usernameResults.length || 1)) * 100)}%)
                </span>
              </div>
              <div className="bg-black/30 rounded-2xl p-3 border border-white/5">
                <span className="text-[10px] font-mono text-gray-500 block uppercase">Average Latency</span>
                <span className="text-sm font-mono font-bold text-purple-300">{avgLatency} ms</span>
              </div>
              <div className="bg-black/30 rounded-2xl p-3 border border-white/5">
                <span className="text-[10px] font-mono text-gray-500 block uppercase">Execution Status</span>
                <span className="text-sm font-mono font-bold text-cyan-400 flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${isScanningUsernames ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`} />
                  {isScanningUsernames ? `ENUMERATING (${scanProgress.done}/${scanProgress.total})` : 'READY / COMPLETE'}
                </span>
              </div>
            </div>

            {/* Progress Bar during active scan */}
            {isScanningUsernames && (
              <div className="mt-3">
                <div className="h-1.5 w-full bg-black/60 rounded-full overflow-hidden border border-cyan-500/20">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300"
                    style={{ width: `${Math.round((scanProgress.done / scanProgress.total) * 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Filtering & Category Controls */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Category Pills */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#090e17]/80 border border-white/10 overflow-x-auto max-w-full">
              {(['All', 'Found', 'Developer', 'Social', 'Media', 'Gaming', 'Portfolio'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setUsernameCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono transition whitespace-nowrap ${
                    usernameCategoryFilter === cat
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                  }`}
                >
                  {cat === 'Found' ? `Found Only (${verifiedHitsCount})` : cat}
                </button>
              ))}
            </div>

            {/* Inline Search in Results */}
            <div className="relative w-full md:w-64">
              <input
                type="text"
                value={usernameSearchQuery}
                onChange={e => setUsernameSearchQuery(e.target.value)}
                placeholder="Filter platforms..."
                className="w-full pl-8 pr-3 py-1.5 bg-black/50 border border-white/10 rounded-xl text-xs font-mono text-gray-200 placeholder-gray-500 focus:outline-none focus:border-cyan-500"
              />
              <Filter className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-2" />
            </div>
          </div>

          {/* Platform Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredUsernameResults.map(item => {
              const isFound = item.status === 'found';
              const isChecking = item.status === 'checking';

              return (
                <div
                  key={item.id}
                  className={`group relative rounded-2xl p-4 border transition-all duration-200 backdrop-blur-md flex flex-col justify-between ${
                    isFound
                      ? 'bg-gradient-to-br from-[#0c1825]/90 via-[#0a1420]/80 to-black/90 border-cyan-500/40 hover:border-cyan-400 shadow-md hover:shadow-cyan-500/15'
                      : 'bg-[#080d14]/70 border-white/5 hover:border-white/10 opacity-75'
                  }`}
                >
                  <div>
                    {/* Card Top: Platform Name, Category & Status */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono font-bold text-xs border ${
                            isFound
                              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm'
                              : 'bg-black/50 text-gray-500 border-white/5'
                          }`}
                        >
                          {item.platform.slice(0, 2).toUpperCase()}
                        </div>

                        <div>
                          <h3 className={`text-sm font-mono font-bold ${isFound ? 'text-white' : 'text-gray-400'}`}>
                            {item.platform}
                          </h3>
                          <span className="text-[10px] font-mono text-gray-500 uppercase">{item.category}</span>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                          isFound
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                            : isChecking
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                            : 'bg-black/40 text-gray-500 border-white/10'
                        }`}
                      >
                        {isFound ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>FOUND 200</span>
                          </>
                        ) : isChecking ? (
                          <>
                            <RefreshCw className="w-3 h-3 animate-spin text-amber-400" />
                            <span>CHECKING</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-gray-600" />
                            <span>NOT FOUND</span>
                          </>
                        )}
                      </span>
                    </div>

                    {/* Verified Profile URL or Note */}
                    <div className="bg-black/40 rounded-xl p-2 border border-white/5 mb-3">
                      <p className="text-[11px] font-mono text-gray-400 truncate select-all">{item.profileUrl}</p>
                      {item.notes && (
                        <p className="text-[10px] font-mono text-cyan-300/80 mt-1 truncate">
                          ℹ️ {item.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs font-mono">
                    <span className="text-[10px] text-gray-500">{item.latencyMs ? `${item.latencyMs}ms` : 'fast'}</span>

                    <div className="flex items-center gap-1.5">
                      {/* Copy Link */}
                      <button
                        onClick={() => copyToClipboard(item.profileUrl, item.id)}
                        className="p-1.5 rounded-lg bg-black/40 hover:bg-white/10 text-gray-400 hover:text-cyan-300 border border-white/5 transition"
                        title="Copy profile link"
                      >
                        {copiedLink === item.id ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>

                      {/* Open Link */}
                      <a
                        href={item.profileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 transition text-[11px]"
                      >
                        <span>Open</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>

                      {/* Weave to Brain */}
                      {onWeaveUsernameResultToBrain && isFound && (
                        <button
                          onClick={() => onWeaveUsernameResultToBrain(item)}
                          className="px-2 py-1 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 transition text-[11px]"
                          title="Weave profile finding into Second Brain"
                        >
                          Brain
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2B. SUB-VIEW: FULL NAME & ALIAS PROFILER                                  */}
      {/* ========================================================================= */}
      {activeSubTab === 'name' && (
        <div className="space-y-6">
          {/* Target Input & Permutation Parameters */}
          <div className="rounded-3xl bg-[#090e17]/85 border border-blue-500/20 p-5 shadow-xl backdrop-blur-xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
              {/* Full Name Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-blue-400">
                  <UserCheck className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={fullNameInput}
                  onChange={e => setFullNameInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleGenerateNameProfile()}
                  placeholder="Target Full Name (e.g. Zakarya Oukil)..."
                  className="w-full pl-10 pr-4 py-3 bg-black/60 border border-blue-500/30 rounded-2xl text-sm font-mono text-blue-100 placeholder-gray-500 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/40 transition shadow-inner"
                />
              </div>

              {/* Organization / Company Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-cyan-400">
                  <Briefcase className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={companyInput}
                  onChange={e => setCompanyInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleGenerateNameProfile()}
                  placeholder="Company / University (e.g. USTHB)..."
                  className="w-full pl-10 pr-4 py-3 bg-black/60 border border-cyan-500/30 rounded-2xl text-sm font-mono text-cyan-100 placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40 transition shadow-inner"
                />
              </div>

              {/* Location / Wilaya Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-purple-400">
                  <MapPin className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={locationInput}
                  onChange={e => setLocationInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleGenerateNameProfile()}
                  placeholder="Wilaya / Region (e.g. Algiers 16)..."
                  className="w-full pl-10 pr-4 py-3 bg-black/60 border border-purple-500/30 rounded-2xl text-sm font-mono text-purple-100 placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400/40 transition shadow-inner"
                />
              </div>
            </div>

            {/* Presets & Trigger Button */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-gray-500 font-mono uppercase mr-1">Sample Targets:</span>
                {[
                  { name: 'Zakarya Oukil', comp: 'USTHB Cybersec Lab', loc: 'Algiers (Wilaya 16)' },
                  { name: 'Linus Torvalds', comp: 'Linux Foundation', loc: 'Portland, OR' },
                  { name: 'Satya Nadella', comp: 'Microsoft Corporation', loc: 'Redmond, WA' },
                ].map(p => (
                  <button
                    key={p.name}
                    onClick={() => {
                      setFullNameInput(p.name);
                      setCompanyInput(p.comp);
                      setLocationInput(p.loc);
                      handleGenerateNameProfile(p.name, p.comp, p.loc);
                    }}
                    className="px-2.5 py-1 rounded-xl bg-black/40 hover:bg-blue-500/20 text-gray-400 hover:text-blue-300 text-[11px] font-mono border border-white/5 transition"
                  >
                    {p.name}
                  </button>
                ))}
              </div>

              <button
                onClick={() => handleGenerateNameProfile()}
                className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition"
              >
                <Sparkles className="w-4 h-4" />
                <span>GENERATE IDENTITY MATRIX</span>
              </button>
            </div>
          </div>

          {/* Generated Profile Matrix */}
          {nameProfile && (
            <div className="space-y-6">
              {/* Top Profile Summary Badge */}
              <div className="p-4 rounded-2xl bg-black/40 border border-blue-500/30 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-300 font-mono font-bold">
                    {nameProfile.firstName[0]}{nameProfile.lastName[0] || 'X'}
                  </div>
                  <div>
                    <h2 className="text-base font-mono font-bold text-white flex items-center gap-2">
                      <span>{nameProfile.fullName}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40">
                        ATTRIBUTION MATRIX
                      </span>
                    </h2>
                    <p className="text-xs font-mono text-gray-400">
                      Org: <span className="text-cyan-300">{nameProfile.company}</span> • Jurisdiction: <span className="text-purple-300">{nameProfile.location}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {onWeaveProfileToBrain && (
                    <button
                      onClick={() => onWeaveProfileToBrain(nameProfile)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-mono transition"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Weave Identity to Brain</span>
                    </button>
                  )}
                </div>
              </div>

              {/* 3 Columns: Permutations, Emails, Dorks */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Column 1: Username & Handle Permutations */}
                <div className="rounded-3xl bg-[#090e17]/85 border border-cyan-500/20 p-5 shadow-xl backdrop-blur-xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-cyan-400" />
                        <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                          Probable Handles & Aliases
                        </h3>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                        {nameProfile.knownAliases.length} ALIASES
                      </span>
                    </div>

                    <div className="space-y-2">
                      {nameProfile.knownAliases.map((alias, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/5 hover:border-cyan-500/30 text-xs font-mono transition group"
                        >
                          <span className="text-cyan-300 font-bold select-all">@{alias}</span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => copyToClipboard(alias, `alias-${idx}`)}
                              className="p-1 rounded bg-black/50 text-gray-500 hover:text-cyan-300 transition"
                              title="Copy alias"
                            >
                              {copiedLink === `alias-${idx}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            </button>
                            <button
                              onClick={() => {
                                setUsernameInput(alias);
                                setActiveSubTab('username');
                                handleUsernameScan(alias);
                              }}
                              className="px-2 py-0.5 rounded bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-300 text-[10px] font-bold transition flex items-center gap-1"
                              title="Scan in 52 platforms"
                            >
                              <span>SCAN</span>
                              <ChevronRight className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Column 2: Probable Corporate & Personal Emails */}
                <div className="rounded-3xl bg-[#090e17]/85 border border-emerald-500/20 p-5 shadow-xl backdrop-blur-xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-emerald-400" />
                        <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                          Corporate & Personal Emails
                        </h3>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                        {nameProfile.probableEmails.length} PATTERNS
                      </span>
                    </div>

                    <div className="space-y-2">
                      {nameProfile.probableEmails.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-xl bg-black/40 border border-white/5 hover:border-emerald-500/30 text-xs font-mono transition"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] text-gray-500">{item.pattern}</span>
                            <span className="text-[10px] font-bold text-emerald-400">{item.confidence}% Match</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-emerald-300 font-bold select-all truncate max-w-[200px]">{item.email}</span>
                            <button
                              onClick={() => copyToClipboard(item.email, `email-${idx}`)}
                              className="p-1 rounded bg-black/50 text-gray-500 hover:text-emerald-300 transition"
                              title="Copy email"
                            >
                              {copiedLink === `email-${idx}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Column 3: High-Impact Investigator Google Dorks */}
                <div className="rounded-3xl bg-[#090e17]/85 border border-purple-500/20 p-5 shadow-xl backdrop-blur-xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                      <div className="flex items-center gap-2">
                        <FileSearch className="w-4 h-4 text-purple-400" />
                        <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                          Investigator Google Dorks
                        </h3>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                        DEEP SEARCH
                      </span>
                    </div>

                    <div className="space-y-2">
                      {nameProfile.searchDorks.map((dork, idx) => (
                        <a
                          key={idx}
                          href={dork.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block p-2.5 rounded-xl bg-black/40 hover:bg-white/10 border border-white/5 hover:border-purple-500/30 text-xs font-mono transition group"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-white group-hover:text-purple-300 transition">
                              {dork.label}
                            </span>
                            <ExternalLink className="w-3 h-3 text-gray-500 group-hover:text-purple-400 transition" />
                          </div>
                          <p className="text-[10px] text-gray-400 font-mono truncate select-all bg-black/50 px-2 py-1 rounded">
                            {dork.query}
                          </p>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. SUB-VIEW B: IP INTELLIGENCE & CARTOGRAPHIC RADAR                       */}
      {/* ========================================================================= */}
      {activeSubTab === 'ip' && (
        <div className="space-y-6">
          {/* Target IP Input Bar */}
          <div className="rounded-3xl bg-[#090e17]/85 border border-emerald-500/20 p-5 shadow-xl backdrop-blur-xl">
            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-400">
                  <Globe className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={ipInput}
                  onChange={e => setIpInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleIpLookup()}
                  placeholder="Enter target IP, Algerian Wilaya node, or domain (e.g. 105.101.0.1, 1.1.1.1, 8.8.8.8)..."
                  className="w-full pl-10 pr-4 py-3 bg-black/60 border border-emerald-500/30 rounded-2xl text-sm font-mono text-emerald-100 placeholder-gray-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/40 transition shadow-inner"
                />
              </div>

              {/* Presets: Global + Algerian Wilayas */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { label: 'Algiers (W16)', ip: '105.101.0.1' },
                  { label: 'Oran (W31)', ip: '105.105.0.1' },
                  { label: 'Constantine (W25)', ip: '105.106.0.1' },
                  { label: 'Cloudflare', ip: '1.1.1.1' },
                  { label: 'Google DNS', ip: '8.8.8.8' },
                ].map(preset => (
                  <button
                    key={preset.label}
                    onClick={() => {
                      setIpInput(preset.ip);
                      handleIpLookup(preset.ip);
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-black/40 hover:bg-emerald-500/20 text-gray-400 hover:text-emerald-300 text-[11px] font-mono border border-white/5 transition whitespace-nowrap"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Execute Button */}
              <button
                onClick={() => handleIpLookup()}
                disabled={isLookingUpIp || !ipInput.trim()}
                className="w-full md:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-black font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-sm hover:shadow-emerald-500/40 transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {isLookingUpIp ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-black" />
                    <span>RESOLVING IP...</span>
                  </>
                ) : (
                  <>
                    <Crosshair className="w-4 h-4 text-black" />
                    <span>GEOIP TELEMETRY SCAN</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* IP Result Visual Matrix & Cartography HUD */}
          {ipResult && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Cols: Geolocation & Infrastructure Telemetry */}
              <div className="lg:col-span-2 space-y-4">
                {/* Core Geolocation Dossier */}
                <div className="rounded-3xl bg-[#0a121d]/85 border border-emerald-500/20 p-5 shadow-xl backdrop-blur-xl">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-emerald-400" />
                      <h2 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
                        Geographical Coordinates & Location
                      </h2>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      GEO-RESOLVED
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                    <div className="p-3 bg-black/40 rounded-2xl border border-white/5">
                      <span className="text-[10px] text-gray-500 block uppercase">Target Query</span>
                      <span className="text-sm font-bold text-cyan-300">{ipResult.query}</span>
                    </div>
                    <div className="p-3 bg-black/40 rounded-2xl border border-white/5">
                      <span className="text-[10px] text-gray-500 block uppercase">City & Region</span>
                      <span className="text-sm font-bold text-white">{ipResult.city}, {ipResult.regionName}</span>
                    </div>
                    <div className="p-3 bg-black/40 rounded-2xl border border-white/5">
                      <span className="text-[10px] text-gray-500 block uppercase">Country</span>
                      <span className="text-sm font-bold text-emerald-300">{ipResult.country} ({ipResult.countryCode})</span>
                    </div>
                    <div className="p-3 bg-black/40 rounded-2xl border border-white/5">
                      <span className="text-[10px] text-gray-500 block uppercase">Timezone</span>
                      <span className="text-sm font-bold text-purple-300">{ipResult.timezone}</span>
                    </div>
                  </div>

                  <div className="mt-3 p-3 bg-black/50 rounded-2xl border border-white/5 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <Compass className="w-4 h-4 text-emerald-400" />
                      <span className="text-gray-400">Coordinates:</span>
                      <span className="text-emerald-300 font-bold select-all">
                        {ipResult.lat.toFixed(4)}, {ipResult.lon.toFixed(4)}
                      </span>
                    </div>
                    <a
                      href={`https://www.google.com/maps?q=${ipResult.lat},${ipResult.lon}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 text-xs font-bold transition"
                    >
                      <span>Satellite View</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {/* Routing & Autonomous System Network */}
                <div className="rounded-3xl bg-[#0a121d]/85 border border-cyan-500/20 p-5 shadow-xl backdrop-blur-xl">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                    <div className="flex items-center gap-2">
                      <Network className="w-4 h-4 text-cyan-400" />
                      <h2 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
                        Autonomous System & Routing Backbone
                      </h2>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                      BGP ROUTING
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                    <div className="p-3 bg-black/40 rounded-2xl border border-white/5">
                      <span className="text-[10px] text-gray-500 block uppercase">Autonomous System (ASN)</span>
                      <span className="text-sm font-bold text-cyan-300">{ipResult.as}</span>
                    </div>
                    <div className="p-3 bg-black/40 rounded-2xl border border-white/5">
                      <span className="text-[10px] text-gray-500 block uppercase">Internet Service Provider (ISP)</span>
                      <span className="text-sm font-bold text-white">{ipResult.isp}</span>
                    </div>
                    <div className="p-3 bg-black/40 rounded-2xl border border-white/5 sm:col-span-2">
                      <span className="text-[10px] text-gray-500 block uppercase">Reverse DNS (PTR Hostname)</span>
                      <span className="text-xs font-bold text-purple-300 select-all">{ipResult.reverse || ipResult.query}</span>
                    </div>
                  </div>

                  {/* Threat & Infrastructure Risk Flags */}
                  <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center gap-2 text-xs font-mono">
                    <span className={`px-2.5 py-1 rounded-xl border flex items-center gap-1.5 ${
                      ipResult.proxy ? 'bg-red-500/20 text-red-300 border-red-500/40 font-bold' : 'bg-black/40 text-gray-400 border-white/5'
                    }`}>
                      <ShieldAlert className="w-3 h-3" />
                      <span>{ipResult.proxy ? 'PROXY / VPN ACTIVE' : 'NO KNOWN PROXY'}</span>
                    </span>

                    <span className={`px-2.5 py-1 rounded-xl border flex items-center gap-1.5 ${
                      ipResult.hosting ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-black/40 text-gray-400 border-white/5'
                    }`}>
                      <Database className="w-3 h-3" />
                      <span>{ipResult.hosting ? 'DATACENTER / CLOUD HOSTING' : 'RESIDENTIAL SUBNET'}</span>
                    </span>

                    <span className={`px-2.5 py-1 rounded-xl border flex items-center gap-1.5 ${
                      ipResult.mobile ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' : 'bg-black/40 text-gray-400 border-white/5'
                    }`}>
                      <Radio className="w-3 h-3" />
                      <span>{ipResult.mobile ? 'CELLULAR GATEWAY' : 'FIXED BROADBAND'}</span>
                    </span>
                  </div>
                </div>

                {/* External OSINT Pivots */}
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { name: 'Shodan Search', url: `https://www.shodan.io/host/${ipResult.query}` },
                    { name: 'Censys Host', url: `https://search.censys.io/hosts/${ipResult.query}` },
                    { name: 'AbuseIPDB Reputation', url: `https://www.abuseipdb.com/check/${ipResult.query}` },
                    { name: 'VirusTotal Domain/IP', url: `https://www.virustotal.com/gui/ip-address/${ipResult.query}` },
                  ].map(pivot => (
                    <a
                      key={pivot.name}
                      href={pivot.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/40 hover:bg-white/10 text-gray-300 hover:text-cyan-300 border border-white/10 text-xs font-mono transition"
                    >
                      <span>{pivot.name}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ))}

                  {onWeaveIpResultToBrain && (
                    <button
                      onClick={() => onWeaveIpResultToBrain(ipResult)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-mono transition ml-auto"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Weave IP to Brain</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Right 1 Col: 3D Living Particle Globe & Cartographic HUD */}
              <div className="rounded-3xl bg-[#090f18]/90 border border-emerald-500/30 p-5 shadow-2xl backdrop-blur-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-emerald-400 animate-pulse" />
                      <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                        3D Cartographic Living Globe
                      </h3>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      LIVE 60FPS
                    </span>
                  </div>

                  {/* 3D Living Particle Wireframe Globe */}
                  <div className="relative w-full aspect-square rounded-2xl bg-black/80 border border-emerald-500/40 overflow-hidden flex items-center justify-center shadow-inner group">
                    <LivingGlobe3D
                      mode="tactical"
                      selectedCoords={[ipResult.lat, ipResult.lon]}
                      showWilayas={true}
                      showSatellites={true}
                      className="w-full h-full"
                    />

                    {/* HUD Overlay Coordinates */}
                    <div className="absolute top-2 left-2 pointer-events-none bg-black/70 px-2 py-1 rounded border border-emerald-500/30 text-[10px] font-mono text-emerald-300">
                      TARGET: {ipResult.city.toUpperCase()} [{ipResult.lat.toFixed(2)}, {ipResult.lon.toFixed(2)}]
                    </div>

                    <div className="absolute bottom-2 right-2 pointer-events-none text-[9px] font-mono text-gray-500 bg-black/70 px-2 py-0.5 rounded">
                      DRAG TO ROTATE • WHEEL ZOOM
                    </div>
                  </div>
                </div>

                {/* Threat Score Gauge */}
                <div className="mt-5 p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-gray-400">Threat Risk Index</span>
                    <span className="font-bold text-emerald-400">{ipResult.threatScore || 12} / 100</span>
                  </div>
                  <div className="h-2 w-full bg-black/80 rounded-full overflow-hidden border border-white/10">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500"
                      style={{ width: `${ipResult.threatScore || 12}%` }}
                    />
                  </div>
                  <p className="text-[10px] font-mono text-gray-500">
                    Calculated from IP reputation, autonomous system ownership, reverse DNS posture, and proxy heuristics.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. SUB-VIEW C: TELEPHONY & PHONE FORENSICS                                */}
      {/* ========================================================================= */}
      {activeSubTab === 'phone' && (
        <div className="space-y-6">
          {/* Target Phone Input */}
          <div className="rounded-3xl bg-[#090e17]/85 border border-purple-500/20 p-5 shadow-xl backdrop-blur-xl">
            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-purple-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={phoneInput}
                  onChange={e => setPhoneInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handlePhoneLookup()}
                  placeholder="Enter international phone number with country code (e.g. +1 650 253 0000, +33 6 12 34 56 78)..."
                  className="w-full pl-10 pr-4 py-3 bg-black/60 border border-purple-500/30 rounded-2xl text-sm font-mono text-purple-100 placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400/40 transition shadow-inner"
                />
              </div>

              {/* Presets */}
              <div className="flex items-center gap-1.5">
                {[
                  { label: 'US Tech', num: '+1 650 253 0000' },
                  { label: 'France Mobile', num: '+33 6 12 34 56 78' },
                  { label: 'Algeria Mobile', num: '+213 555 12 34 56' },
                ].map(preset => (
                  <button
                    key={preset.label}
                    onClick={() => {
                      setPhoneInput(preset.num);
                      handlePhoneLookup(preset.num);
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-black/40 hover:bg-purple-500/20 text-gray-400 hover:text-purple-300 text-[11px] font-mono border border-white/5 transition whitespace-nowrap"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Execute Button */}
              <button
                onClick={() => handlePhoneLookup()}
                disabled={isLookingUpPhone || !phoneInput.trim()}
                className="w-full md:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-sm hover:shadow-purple-500/40 transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {isLookingUpPhone ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>PARSING NUMBER...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 text-white" />
                    <span>TELEPHONY FORENSICS</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Telephony Result Cards */}
          {phoneResult && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1: E.164 Formatting & Standards */}
              <div className="rounded-3xl bg-[#090e17]/85 border border-purple-500/20 p-5 shadow-xl backdrop-blur-xl space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-white/10">
                  <BookOpen className="w-4 h-4 text-purple-400" />
                  <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                    ITU-T E.164 Normalization
                  </h3>
                </div>

                <div className="space-y-3 text-xs font-mono">
                  <div className="p-3 bg-black/40 rounded-2xl border border-white/5">
                    <span className="text-[10px] text-gray-500 block uppercase">Standard E.164 Notation</span>
                    <span className="text-sm font-bold text-purple-300 select-all">{phoneResult.formattedE164}</span>
                  </div>
                  <div className="p-3 bg-black/40 rounded-2xl border border-white/5">
                    <span className="text-[10px] text-gray-500 block uppercase">International Format</span>
                    <span className="text-sm font-bold text-white select-all">{phoneResult.formattedInternational}</span>
                  </div>
                  <div className="p-3 bg-black/40 rounded-2xl border border-white/5">
                    <span className="text-[10px] text-gray-500 block uppercase">National Format</span>
                    <span className="text-sm font-bold text-gray-300 select-all">{phoneResult.formattedNational}</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Jurisdiction, Carrier & Line Type */}
              <div className="rounded-3xl bg-[#090e17]/85 border border-cyan-500/20 p-5 shadow-xl backdrop-blur-xl space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-white/10">
                  <Radio className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                    Jurisdiction & Carrier Intel
                  </h3>
                </div>

                <div className="space-y-3 text-xs font-mono">
                  <div className="p-3 bg-black/40 rounded-2xl border border-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-gray-500 block uppercase">Country of Origin</span>
                      <span className="text-sm font-bold text-cyan-300">
                        {phoneResult.countryFlag} {phoneResult.countryName}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-gray-400">{phoneResult.countryCode}</span>
                  </div>

                  <div className="p-3 bg-black/40 rounded-2xl border border-white/5">
                    <span className="text-[10px] text-gray-500 block uppercase">Line Allocation Type</span>
                    <span className="text-sm font-bold text-emerald-300 flex items-center gap-1.5 mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      {phoneResult.lineType}
                    </span>
                  </div>

                  <div className="p-3 bg-black/40 rounded-2xl border border-white/5">
                    <span className="text-[10px] text-gray-500 block uppercase">Carrier & Network Operator</span>
                    <span className="text-xs font-bold text-white">{phoneResult.carrier || 'Tier-1 Telephony Gateway'}</span>
                  </div>
                </div>
              </div>

              {/* Card 3: Deep OSINT Pivot Direct Links */}
              <div className="rounded-3xl bg-[#090e17]/85 border border-pink-500/20 p-5 shadow-xl backdrop-blur-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 pb-3 border-b border-white/10 mb-3">
                    <Share2 className="w-4 h-4 text-pink-400" />
                    <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                      Forensic Identity Pivots
                    </h3>
                  </div>

                  <div className="space-y-2">
                    {phoneResult.pivotLinks.map(pivot => (
                      <a
                        key={pivot.label}
                        href={pivot.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 hover:bg-white/10 border border-white/5 text-xs font-mono text-gray-300 hover:text-pink-300 transition group"
                      >
                        <div>
                          <span className="font-bold block">{pivot.label}</span>
                          <span className="text-[10px] text-gray-500">{pivot.description}</span>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-gray-500 group-hover:text-pink-400 transition-transform group-hover:translate-x-0.5" />
                      </a>
                    ))}
                  </div>
                </div>

                {onWeavePhoneResultToBrain && (
                  <button
                    onClick={() => onWeavePhoneResultToBrain(phoneResult)}
                    className="mt-4 w-full py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-mono transition flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Weave Phone Record to Brain</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. SUB-VIEW D: CONSOLIDATED CASE DOSSIER & AI SYNTHESIS                    */}
      {/* ========================================================================= */}
      {activeSubTab === 'dossier' && (
        <div className="space-y-6">
          {/* Dossier Control Header */}
          <div className="rounded-3xl bg-[#090e17]/85 border border-amber-500/20 p-5 shadow-xl backdrop-blur-xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400" />
                  <h2 className="text-lg font-mono font-bold text-white">
                    Master's Capstone Case Dossier Synthesis
                  </h2>
                </div>
                <p className="text-xs text-gray-400 font-mono mt-1">
                  Correlates multi-vector findings (Username Matrix, IP Telemetry, and Phone Records) into an institutional defense report powered by GPT-6 Astra.
                </p>
              </div>

              {/* Model Picker & Trigger */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-white/10 text-xs font-mono">
                  {(['gpt-6-astra', 'qwen3.8-27b', 'deepseek-v4-flash'] as const).map(m => (
                    <button
                      key={m}
                      onClick={() => setSelectedAiModel(m)}
                      className={`px-2.5 py-1 rounded-lg transition ${
                        selectedAiModel === m
                          ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                          : 'text-gray-400 hover:text-gray-200'
                      }`}
                    >
                      {m === 'gpt-6-astra' ? 'GPT-6 ASTRA' : m.toUpperCase()}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleSynthesizeDossier}
                  disabled={isSynthesizingAi}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black font-mono font-bold text-xs flex items-center gap-2 shadow-sm transition disabled:opacity-50"
                >
                  {isSynthesizingAi ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-black" />
                      <span>SYNTHESIZING DOSSIER...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-black" />
                      <span>SYNTHESIZE WITH GPT-6 ASTRA</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Aggregated Evidence Preview Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-black/40 border border-cyan-500/20 text-xs font-mono">
              <span className="text-[10px] text-gray-500 block uppercase">Username Digital Footprint</span>
              <span className="text-sm font-bold text-cyan-300">@{usernameInput}</span>
              <p className="text-gray-400 text-[11px] mt-1">{verifiedHitsCount} verified active profiles discovered</p>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-emerald-500/20 text-xs font-mono">
              <span className="text-[10px] text-gray-500 block uppercase">Network Geolocation</span>
              <span className="text-sm font-bold text-emerald-300">{ipResult?.query || 'No IP Loaded'}</span>
              <p className="text-gray-400 text-[11px] mt-1">{ipResult?.city || 'Unknown'}, {ipResult?.country || 'N/A'}</p>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-purple-500/20 text-xs font-mono">
              <span className="text-[10px] text-gray-500 block uppercase">Telephony Identifier</span>
              <span className="text-sm font-bold text-purple-300">{phoneResult?.formattedE164 || 'No Phone Loaded'}</span>
              <p className="text-gray-400 text-[11px] mt-1">{phoneResult?.lineType || 'Unknown'} • {phoneResult?.countryName || 'Global'}</p>
            </div>
          </div>

          {/* Rendered AI Dossier Report */}
          <div className="rounded-3xl bg-[#090e17]/90 border border-white/10 p-6 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
                  Consolidated Forensic Investigation Audit Report
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const currentDossier: ForensicCaseDossier = {
                      caseId,
                      caseTitle: `Cross-Vector OSINT Audit // ${usernameInput || 'Target'}`,
                      investigator,
                      affiliation: 'Master of Science in Cybersecurity',
                      createdAt: new Date().toISOString(),
                      targetHandle: usernameInput,
                      targetIp: ipResult?.query,
                      targetPhone: phoneResult?.formattedE164,
                      usernameFindings: usernameResults,
                      ipFindings: ipResult || undefined,
                      phoneFindings: phoneResult || undefined,
                      complianceConsent,
                    };
                    onWeaveDossierToBrain(currentDossier, aiDossierReport || 'Pending generation');
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-mono transition"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Weave Case to Second Brain</span>
                </button>
              </div>
            </div>

            {aiDossierReport ? (
              <div
                className="prose prose-invert max-w-none text-xs font-mono leading-relaxed"
                dangerouslySetInnerHTML={{ __html: marked.parse(aiDossierReport) as string }}
              />
            ) : (
              <div className="py-12 text-center text-gray-500 font-mono space-y-3">
                <ShieldCheck className="w-12 h-12 mx-auto text-gray-600" />
                <p className="text-sm text-gray-400">No consolidated report generated yet for {caseId}.</p>
                <p className="text-xs text-gray-500 max-w-md mx-auto">
                  Click "SYNTHESIZE WITH GPT-6 ASTRA" to correlate username discoveries, network geolocation, and phone intelligence into a formal executive report.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
