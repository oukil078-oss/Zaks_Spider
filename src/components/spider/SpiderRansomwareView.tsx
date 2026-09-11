import React, { useState, useEffect } from 'react';
import {
  Skull, AlertOctagon, ShieldAlert, Globe, Clock, Download,
  ExternalLink, Search, Filter, Shield, Server, FileText,
  DollarSign, Building, AlertTriangle, CheckCircle2, ChevronRight,
  RefreshCw, ArrowUpRight, Cpu, Eye, Lock, HardDrive, Share2, ShieldCheck
} from 'lucide-react';

export interface RansomwareGroup {
  id: string;
  name: string;
  avatarIcon?: string;
  status: 'ACTIVE_TOR' | 'SEIZED' | 'INTERMITTENT' | 'REBRANDED';
  torAddress: string;
  activeVictimsCount: number;
  avgRansomUsd: string;
  primaryVectors: string[];
  cveAssociations: string[];
  firstSeen: string;
  lastClaimDate: string;
  encryptionAlgo: string;
}

export interface RansomVictim {
  id: string;
  victimName: string;
  domain: string;
  country: string;
  countryCode: string;
  industry: 'HEALTHCARE' | 'FINANCIAL' | 'DEFENSE' | 'INFRASTRUCTURE' | 'RETAIL' | 'TECH' | 'GOV';
  groupId: string;
  groupName: string;
  ransomStatus: 'COUNTDOWN_ACTIVE' | 'DATA_PUBLISHED' | 'NEGOTIATING' | 'PAYMENT_CLAIMED';
  deadline: string; // ISO string
  ransomAmountUsd?: string;
  dataSizeGb: number;
  proofFiles: string[];
  cisaKevMatch?: string;
  publishedAt: string;
  summary: string;
}

interface SpiderRansomwareViewProps {
  onPivotToSoc?: (domainOrIp: string) => void;
  onPivotToGraph?: (entity: string, type: string) => void;
  onPivotToSurface?: (domain: string) => void;
  onPivotToSwarm?: (prompt: string) => void;
}

const MOCK_GROUPS: RansomwareGroup[] = [
  {
    id: 'lockbit',
    name: 'LockBit 3.0 / Black',
    status: 'ACTIVE_TOR',
    torAddress: 'lockbitaptc2pqdgvsfdgw...onion',
    activeVictimsCount: 42,
    avgRansomUsd: '$850,000',
    primaryVectors: ['Phishing', 'CVE-2023-4966 Citrix Bleed', 'RDP Compromise'],
    cveAssociations: ['CVE-2023-4966', 'CVE-2023-38831', 'CVE-2024-1709'],
    firstSeen: '2019-09',
    lastClaimDate: '18 minutes ago',
    encryptionAlgo: 'AES-256 + RSA-4096'
  },
  {
    id: 'ransomhub',
    name: 'RansomHub',
    status: 'ACTIVE_TOR',
    torAddress: 'ransomhube7x23y9...onion',
    activeVictimsCount: 31,
    avgRansomUsd: '$1,400,000',
    primaryVectors: ['CVE-2024-3400 PAN-OS', 'Data-Only Extortion', 'Stealer Creds'],
    cveAssociations: ['CVE-2024-3400', 'CVE-2024-21887'],
    firstSeen: '2024-02',
    lastClaimDate: '1 hour ago',
    encryptionAlgo: 'Go-based ChaCha20'
  },
  {
    id: 'play',
    name: 'Play Ransomware',
    status: 'ACTIVE_TOR',
    torAddress: 'playnews749x...onion',
    activeVictimsCount: 19,
    avgRansomUsd: '$620,000',
    primaryVectors: ['CVE-2022-41082 ProxyNotShell', 'Fortinet SSL-VPN'],
    cveAssociations: ['CVE-2022-41082', 'CVE-2023-27997'],
    firstSeen: '2022-06',
    lastClaimDate: '4 hours ago',
    encryptionAlgo: 'Hybrid AES-RSA'
  },
  {
    id: 'akira',
    name: 'Akira',
    status: 'ACTIVE_TOR',
    torAddress: 'akiralkzvsfdg...onion',
    activeVictimsCount: 14,
    avgRansomUsd: '$480,000',
    primaryVectors: ['Cisco ASA AnyConnect VPN', 'CVE-2023-20269'],
    cveAssociations: ['CVE-2023-20269', 'CVE-2020-3259'],
    firstSeen: '2023-03',
    lastClaimDate: '9 hours ago',
    encryptionAlgo: 'ChaCha20-Poly1305'
  },
  {
    id: 'blackcat',
    name: 'BlackCat / ALPHV',
    status: 'SEIZED',
    torAddress: 'alphvxcv9320...onion',
    activeVictimsCount: 0,
    avgRansomUsd: '$2,500,000',
    primaryVectors: ['Affiliate RaaS', 'ScreenConnect Zero-Day'],
    cveAssociations: ['CVE-2024-1709'],
    firstSeen: '2021-11',
    lastClaimDate: 'Disrupted by Law Enforcement',
    encryptionAlgo: 'Rust-based AES'
  }
];

const MOCK_VICTIMS: RansomVictim[] = [
  {
    id: 'vic-1',
    victimName: 'AeroDynamics Defense Systems Corp',
    domain: 'aerodynamics-defense.com',
    country: 'United States',
    countryCode: 'US',
    industry: 'DEFENSE',
    groupId: 'ransomhub',
    groupName: 'RansomHub',
    ransomStatus: 'COUNTDOWN_ACTIVE',
    deadline: new Date(Date.now() + 86400000 * 2.8).toISOString(),
    ransomAmountUsd: '$1,800,000',
    dataSizeGb: 480,
    proofFiles: [
      '/DoD_Contracts/Subcontractor_Agreements_2024.pdf',
      '/CAD_Drawings/Drone_Propulsion_Schematics_v4.dwg',
      '/Financial_Audits/P&L_Internal_Ledger.xlsx',
      '/HR/Executive_Passports_Clearance_Levels.csv'
    ],
    cisaKevMatch: 'CVE-2024-3400 (Palo Alto GlobalProtect RCE)',
    publishedAt: '2 hours ago',
    summary: 'Exfiltrated 480GB of defense contracts, missile telemetry schematics, and personnel security clearance files.'
  },
  {
    id: 'vic-2',
    victimName: 'Metropolitan Health & Trauma Center',
    domain: 'metrohealth-trauma.org',
    country: 'United Kingdom',
    countryCode: 'GB',
    industry: 'HEALTHCARE',
    groupId: 'lockbit',
    groupName: 'LockBit 3.0',
    ransomStatus: 'NEGOTIATING',
    deadline: new Date(Date.now() + 86400000 * 4.1).toISOString(),
    ransomAmountUsd: '$950,000',
    dataSizeGb: 310,
    proofFiles: [
      '/Patient_Records/HIPAA_Patient_Dossiers_2023_2024.sqlite',
      '/Pharmacy/Controlled_Substances_Prescriptions.csv',
      '/Billing/Insurance_Claims_NHS.xlsx'
    ],
    cisaKevMatch: 'CVE-2023-4966 (Citrix NetScaler Information Disclosure)',
    publishedAt: '5 hours ago',
    summary: 'Active directory compromised via unpatched Citrix gateway. 310GB patient history and prescription records staged for release.'
  },
  {
    id: 'vic-3',
    victimName: 'Apex Nordic Maritime Logistics',
    domain: 'apex-nordic.se',
    country: 'Sweden',
    countryCode: 'SE',
    industry: 'INFRASTRUCTURE',
    groupId: 'play',
    groupName: 'Play Ransomware',
    ransomStatus: 'DATA_PUBLISHED',
    deadline: new Date(Date.now() - 86400000 * 1.2).toISOString(),
    ransomAmountUsd: '$500,000',
    dataSizeGb: 190,
    proofFiles: [
      '/Manifests/Port_Rotterdam_Cargo_2024.tar.gz',
      '/Customs/Declaration_Passports.zip',
      '/Server_Backups/MySQL_Master_Dump.sql'
    ],
    cisaKevMatch: 'CVE-2023-27997 (FortiOS SSL-VPN Heap Overflow)',
    publishedAt: '1 day ago',
    summary: 'Negotiation failed. Complete 190GB archive published to public Tor leak mirror. Includes cargo manifests and customs filings.'
  },
  {
    id: 'vic-4',
    victimName: 'Valence FinTech Capital Partners',
    domain: 'valence-fintech.ch',
    country: 'Switzerland',
    countryCode: 'CH',
    industry: 'FINANCIAL',
    groupId: 'akira',
    groupName: 'Akira',
    ransomStatus: 'COUNTDOWN_ACTIVE',
    deadline: new Date(Date.now() + 86400000 * 1.5).toISOString(),
    ransomAmountUsd: '$1,200,000',
    dataSizeGb: 220,
    proofFiles: [
      '/Accounts/SWIFT_Audit_Logs_2024.json',
      '/KYC_Compliance/High_Net_Worth_Clients.pdf',
      '/Private_Keys/Custody_Cold_Storage_Signers.enc'
    ],
    cisaKevMatch: 'CVE-2023-20269 (Cisco ASA VPN Zero-Day)',
    publishedAt: '12 hours ago',
    summary: 'Compromised Cisco ASA VPN profile. 220GB client financial records and SWIFT messaging logs scheduled for release.'
  },
  {
    id: 'vic-5',
    victimName: 'Kyoto Precision Robotics Ltd',
    domain: 'kyoto-robotics.jp',
    country: 'Japan',
    countryCode: 'JP',
    industry: 'TECH',
    groupId: 'ransomhub',
    groupName: 'RansomHub',
    ransomStatus: 'PAYMENT_CLAIMED',
    deadline: new Date(Date.now() - 86400000 * 3).toISOString(),
    ransomAmountUsd: '$750,000',
    dataSizeGb: 140,
    proofFiles: [
      '/Patents/Factory_Automation_Arm_Firmware.c',
      '/Clients/Automotive_Supplier_Contracts.pdf'
    ],
    publishedAt: '3 days ago',
    summary: 'Victim confirmed payment. Extortion post marked resolved and decryption keys published to client escrow.'
  }
];

export const SpiderRansomwareView: React.FC<SpiderRansomwareViewProps> = ({
  onPivotToSoc,
  onPivotToGraph,
  onPivotToSurface,
  onPivotToSwarm
}) => {
  const [selectedVictim, setSelectedVictim] = useState<RansomVictim | null>(MOCK_VICTIMS[0]);
  const [selectedGroup, setSelectedGroup] = useState<string>('ALL');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 900);
  };

  const formatCountdown = (deadlineIso: string) => {
    const diff = new Date(deadlineIso).getTime() - currentTime;
    if (diff <= 0) return 'EXPIRED / PUBLISHED';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return `${days}d ${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
  };

  const filteredVictims = MOCK_VICTIMS.filter(v => {
    if (selectedGroup !== 'ALL' && v.groupId !== selectedGroup) return false;
    if (selectedIndustry !== 'ALL' && v.industry !== selectedIndustry) return false;
    if (selectedStatus !== 'ALL' && v.ransomStatus !== selectedStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match = v.victimName.toLowerCase().includes(q) ||
                    v.domain.toLowerCase().includes(q) ||
                    v.groupName.toLowerCase().includes(q) ||
                    v.cisaKevMatch?.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const exportDigestCsv = () => {
    const headers = ['Victim', 'Domain', 'Country', 'Industry', 'Group', 'Status', 'DataGB', 'RansomUSD', 'CVE', 'PublishedAt'];
    const rows = filteredVictims.map(v => [
      `"${v.victimName}"`,
      v.domain,
      v.country,
      v.industry,
      v.groupName,
      v.ransomStatus,
      v.dataSizeGb,
      `"${v.ransomAmountUsd || 'N/A'}"`,
      `"${v.cisaKevMatch || 'N/A'}"`,
      v.publishedAt
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ransomware_leaks_digest_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full bg-[#070b13] text-slate-200 overflow-hidden select-text">
      {/* Top Banner / Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-[#090e1a]/90 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <Skull className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold tracking-wide text-white uppercase">
                Dark Web & Ransomware Leak Spider
              </h2>
              <span className="px-2 py-0.5 text-[10px] font-mono uppercase bg-rose-500/10 text-rose-400 border border-rose-500/30 rounded">
                Live DLS Radar
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Continuous reconnaissance across active Tor ransomware leak blogs, extortion claims & CISA KEV correlations
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-mono font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-rose-400' : ''}`} />
            <span>Sync Feeds</span>
          </button>

          <button
            onClick={exportDigestCsv}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-mono font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Ransomware Groups Status Marquee */}
      <div className="px-5 py-3 border-b border-slate-800 bg-[#060a12] flex items-center space-x-4 overflow-x-auto text-xs font-mono">
        <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold flex items-center space-x-1.5 shrink-0">
          <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
          <span>Monitored DLS:</span>
        </div>
        <div className="flex items-center space-x-3">
          {MOCK_GROUPS.map(g => (
            <div
              key={g.id}
              onClick={() => setSelectedGroup(selectedGroup === g.id ? 'ALL' : g.id)}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border cursor-pointer transition shrink-0 ${
                selectedGroup === g.id
                  ? 'bg-rose-950/40 border-rose-500/60 text-white'
                  : 'bg-slate-900/80 border-slate-800/80 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${
                g.status === 'ACTIVE_TOR' ? 'bg-emerald-400 animate-ping' :
                g.status === 'SEIZED' ? 'bg-rose-500' : 'bg-amber-400'
              }`} />
              <span className="font-bold">{g.name}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                {g.activeVictimsCount} claims
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 border-b border-slate-800/90 bg-[#080d18] flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center space-x-3 flex-1">
          <div className="flex items-center space-x-2 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 w-full max-w-md focus-within:border-rose-500 transition">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search victim company, domain, CVE, or ransomware group..."
              className="bg-transparent border-none text-xs text-white focus:outline-none w-full font-mono placeholder:text-slate-500"
            />
          </div>

          <div className="flex items-center space-x-1.5 text-xs font-mono">
            <span className="text-slate-400 text-[11px]">Status:</span>
            {['ALL', 'COUNTDOWN_ACTIVE', 'NEGOTIATING', 'DATA_PUBLISHED'].map(st => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-2.5 py-1 rounded text-[11px] ${
                  selectedStatus === st
                    ? 'bg-rose-950/60 text-rose-300 border border-rose-600/50 font-bold'
                    : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-1.5 text-xs font-mono">
          <span className="text-slate-400 text-[11px]">Sector:</span>
          {['ALL', 'DEFENSE', 'HEALTHCARE', 'INFRASTRUCTURE', 'FINANCIAL', 'TECH'].map(ind => (
            <button
              key={ind}
              onClick={() => setSelectedIndustry(ind)}
              className={`px-2 py-0.5 rounded text-[11px] ${
                selectedIndustry === ind
                  ? 'bg-slate-800 text-white font-semibold border border-slate-600'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {ind}
            </button>
          ))}
        </div>
      </div>

      {/* Main Split Body: Left Victim Stream, Right Incident Dossier */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Column: Victim Stream */}
        <div className="flex-1 flex flex-col border-b lg:border-b-0 lg:border-r border-slate-800 overflow-y-auto p-4 space-y-3 bg-[#070b13]">
          {filteredVictims.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-500 text-xs font-mono">
              <ShieldCheck className="w-8 h-8 mb-2 text-slate-600" />
              <span>No ransomware claims matching active filters.</span>
            </div>
          ) : (
            filteredVictims.map(vic => {
              const isSelected = selectedVictim?.id === vic.id;
              const isExpired = new Date(vic.deadline).getTime() <= currentTime;

              return (
                <div
                  key={vic.id}
                  onClick={() => setSelectedVictim(vic)}
                  className={`p-4 rounded-xl border transition cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 border-rose-500/60 shadow-lg shadow-rose-950/20'
                      : 'bg-[#090e1b] hover:bg-slate-900/60 border-slate-800/80'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-white tracking-wide">{vic.victimName}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {vic.country} ({vic.countryCode})
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-950/60 text-purple-300 border border-purple-800/40">
                          {vic.industry}
                        </span>
                      </div>
                      <div className="text-xs font-mono text-slate-400 mt-1 flex items-center space-x-2">
                        <span>{vic.domain}</span>
                        <span>•</span>
                        <span className="text-rose-400 font-semibold">{vic.groupName}</span>
                        <span>•</span>
                        <span>{vic.dataSizeGb} GB Exfiltrated</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                        vic.ransomStatus === 'COUNTDOWN_ACTIVE' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse' :
                        vic.ransomStatus === 'NEGOTIATING' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' :
                        vic.ransomStatus === 'DATA_PUBLISHED' ? 'bg-rose-500/20 text-rose-400 border-rose-500/40' :
                        'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                      }`}>
                        {vic.ransomStatus.replace('_', ' ')}
                      </span>
                      <div className="text-[11px] font-mono text-slate-400 mt-1">
                        {vic.publishedAt}
                      </div>
                    </div>
                  </div>

                  {/* Countdown Ticker */}
                  {vic.ransomStatus === 'COUNTDOWN_ACTIVE' && (
                    <div className="mt-3 p-2 rounded-lg bg-amber-950/20 border border-amber-800/30 flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center space-x-1.5 text-amber-400 font-bold">
                        <Clock className="w-3.5 h-3.5" />
                        <span>DEADLINE COUNTDOWN:</span>
                      </div>
                      <div className="text-amber-300 font-bold tracking-wider">
                        {formatCountdown(vic.deadline)}
                      </div>
                    </div>
                  )}

                  {/* Summary Snippet */}
                  <p className="text-xs text-slate-300 font-mono mt-2 line-clamp-2">
                    {vic.summary}
                  </p>

                  {/* CISA KEV Badge */}
                  {vic.cisaKevMatch && (
                    <div className="mt-2.5 flex items-center space-x-1.5 text-[11px] font-mono text-rose-400 bg-rose-950/30 px-2 py-1 rounded border border-rose-900/50">
                      <ShieldAlert className="w-3 h-3 text-rose-400 shrink-0" />
                      <span>CISA KEV Matched: {vic.cisaKevMatch}</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Detailed Extortion Dossier */}
        <div className="w-full lg:w-[480px] flex flex-col bg-[#080d1a] overflow-y-auto p-5 space-y-5">
          {selectedVictim ? (
            <>
              {/* Target Overview */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-[#0e1629] to-[#070b13] border border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs font-mono text-rose-400 uppercase font-bold">
                    <Skull className="w-4 h-4" />
                    <span>Active Extortion Dossier</span>
                  </div>
                  <span className="text-xs font-mono text-slate-400">
                    ID: {selectedVictim.id}
                  </span>
                </div>

                <div className="mt-3">
                  <h3 className="text-lg font-bold text-white tracking-wide">
                    {selectedVictim.victimName}
                  </h3>
                  <div className="text-xs font-mono text-slate-400 mt-0.5">
                    {selectedVictim.domain} • {selectedVictim.country} ({selectedVictim.industry})
                  </div>
                </div>

                {/* Key Telemetry Metrics */}
                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-800">
                  <div className="p-2.5 rounded bg-slate-900/80 border border-slate-800 text-xs font-mono">
                    <div className="text-slate-400 text-[10px] uppercase">Ransom Demanded</div>
                    <div className="text-sm font-bold text-emerald-400 mt-0.5">
                      {selectedVictim.ransomAmountUsd || 'Private Escrow'}
                    </div>
                  </div>

                  <div className="p-2.5 rounded bg-slate-900/80 border border-slate-800 text-xs font-mono">
                    <div className="text-slate-400 text-[10px] uppercase">Data Exfiltrated</div>
                    <div className="text-sm font-bold text-rose-400 mt-0.5">
                      {selectedVictim.dataSizeGb} GB
                    </div>
                  </div>
                </div>

                {/* Cross-Hub Pivots */}
                <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-slate-800">
                  {onPivotToSurface && (
                    <button
                      onClick={() => onPivotToSurface(selectedVictim.domain)}
                      className="flex-1 flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/50 text-xs font-mono transition"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>Spider Perimeter</span>
                    </button>
                  )}

                  {onPivotToGraph && (
                    <button
                      onClick={() => onPivotToGraph(selectedVictim.groupName, 'ACTOR')}
                      className="flex-1 flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-950/60 hover:bg-indigo-900 text-indigo-300 border border-indigo-700/50 text-xs font-mono transition"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Graph Threat Group</span>
                    </button>
                  )}

                  {onPivotToSoc && (
                    <button
                      onClick={() => onPivotToSoc(selectedVictim.domain)}
                      className="w-full flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-700/50 text-xs font-mono transition"
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>Pivot to SOC Telemetry</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Sample Leaked File Directory Tree */}
              <div className="p-4 rounded-xl bg-[#090e1c] border border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2 text-xs font-mono font-bold text-slate-200 uppercase">
                    <FileText className="w-4 h-4 text-amber-400" />
                    <span>Proof of Work / Leaked File Samples</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    {selectedVictim.proofFiles.length} files staged
                  </span>
                </div>

                <div className="space-y-1.5 font-mono text-xs">
                  {selectedVictim.proofFiles.map((file, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between text-slate-300"
                    >
                      <span className="text-emerald-400 truncate pr-2">{file}</span>
                      <span className="text-[10px] text-slate-500 uppercase shrink-0">STAGED</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Threat Actor Profiling */}
              <div className="p-4 rounded-xl bg-[#090e1c] border border-slate-800">
                <div className="flex items-center space-x-2 text-xs font-mono font-bold text-slate-200 uppercase mb-3">
                  <Cpu className="w-4 h-4 text-purple-400" />
                  <span>Threat Actor Profile: {selectedVictim.groupName}</span>
                </div>

                {(() => {
                  const grp = MOCK_GROUPS.find(g => g.id === selectedVictim.groupId);
                  if (!grp) return null;
                  return (
                    <div className="space-y-2.5 text-xs font-mono">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Active Tor Onion:</span>
                        <span className="text-slate-300">{grp.torAddress}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Encryption Suite:</span>
                        <span className="text-white font-bold">{grp.encryptionAlgo}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Average Ransom Demand:</span>
                        <span className="text-emerald-400 font-bold">{grp.avgRansomUsd}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-1">Observed Initial Vectors:</span>
                        <div className="flex flex-wrap gap-1">
                          {grp.primaryVectors.map(vec => (
                            <span key={vec} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px]">
                              {vec}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 text-xs font-mono">
              <Eye className="w-8 h-8 mb-2 text-slate-600" />
              <span>Select a victim incident from the stream to view full extortion dossier.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
