// ==========================================
// ZAK'S SPIDER — SECURITY OPERATIONS CENTER (SOC BASE)
// Modeled directly after User Reference Designs (Images 1 & 2)
// 3D Living Globe, Live IDS & Honeypot Telemetry, Packet Flows, and MITRE ATT&CK
// ==========================================

import React, { useState, useEffect } from 'react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Activity,
  Globe,
  Radio,
  Wifi,
  Server,
  Terminal,
  Cpu,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Search,
  RotateCw,
  Bell,
  Lock,
  Layers,
  BarChart3,
  ExternalLink,
  ChevronRight,
  Crosshair,
  User,
  Zap,
  Flame,
  FileCode,
  Sliders,
  Maximize2
} from 'lucide-react';
import { LivingGlobeCanvas } from '../canvas/LivingGlobeCanvas';
import { SocEvent, SocStats, ThreatArc } from '../../types';

interface SocCommandCenterViewProps {
  onSendToCopilot?: (prompt: string) => void;
  onWeaveEventToBrain?: (event: SocEvent) => void;
}

// Default High-Fidelity Incident Log matching Image 2
const INITIAL_SECURITY_LOG: SocEvent[] = [
  {
    id: 'sec-evt-1',
    timestamp: '03:24:01 UTC',
    sourceIp: '185.220.101.42',
    country: 'Germany (Tor Exit)',
    countryFlag: '🇩🇪',
    targetPort: 443,
    targetEndpoint: '/api/v1/auth/login',
    eventType: 'Tor Exit Credential Stuffing',
    signature: 'High-Velocity Tor Node Brute-Force Spray',
    severity: 'High',
    status: 'Blocked',
    attackPhase: 'Credential Access',
    mitigationTip: 'Deploy Cloudflare Turnstile CAPTCHA and enforce strict IP rate-limiting (max 5 req/min per IP).',
    mitreTechnique: 'T1110.004 - Credential Stuffing',
  },
  {
    id: 'sec-evt-2',
    timestamp: '03:18:44 UTC',
    sourceIp: '194.26.29.112',
    country: 'Russia (APT C04)',
    countryFlag: '🇷🇺',
    targetPort: 443,
    targetEndpoint: '/.env',
    eventType: 'Sensitive Environment Reconnaissance',
    signature: 'Masscan / ZGrab Automated Traversal',
    severity: 'Medium',
    status: 'Blocked',
    attackPhase: 'Reconnaissance',
    mitigationTip: 'Deny all hidden dotfile requests at web server layer (`location ~ /\\. { deny all; }`).',
    mitreTechnique: 'T1595.002 - Active Scanning',
  },
  {
    id: 'sec-evt-3',
    timestamp: '03:02:50 UTC',
    sourceIp: '103.203.57.18',
    country: 'China',
    countryFlag: '🇨🇳',
    targetPort: 80,
    targetEndpoint: '/wp-login.php',
    eventType: 'CMS Exploitation Attempt',
    signature: 'WPScan Automated Vulnerability Discovery',
    severity: 'Medium',
    status: 'Blocked',
    attackPhase: 'Initial Access',
    mitigationTip: 'Implement WAF rules to drop traffic targeting non-existent CMS platforms.',
    mitreTechnique: 'T1190 - Exploit Public-Facing Application',
  },
  {
    id: 'sec-evt-4',
    timestamp: '02:55:12 UTC',
    sourceIp: '172.56.21.9',
    country: 'United States',
    countryFlag: '🇺🇸',
    targetPort: 443,
    targetEndpoint: '/api/crawl',
    eventType: 'API Layer Fuzzing / Parameter Injection',
    signature: 'Burp Suite Intruder Fuzzing Pattern',
    severity: 'Low',
    status: 'Inspected',
    attackPhase: 'Discovery',
    mitigationTip: 'Sanitize all input via strict Zod schemas and reject malformed JSON bodies.',
    mitreTechnique: 'T1083 - File and Directory Discovery',
  },
];

export const SocCommandCenterView: React.FC<SocCommandCenterViewProps> = ({
  onSendToCopilot,
  onWeaveEventToBrain,
}) => {
  // Live State
  const [events, setEvents] = useState<SocEvent[]>(INITIAL_SECURITY_LOG);
  const [activeThreatFilter, setActiveThreatFilter] = useState<'All' | 'DDoS' | 'Malware' | 'Intrusion' | 'PortScan'>('All');
  const [selectedEvent, setSelectedEvent] = useState<SocEvent | null>(INITIAL_SECURITY_LOG[0]);
  const [activeSocTab, setActiveSocTab] = useState<'overview' | 'ids' | 'mitre' | 'soar'>('overview');
  const [isSimulatingKaliScan, setIsSimulatingKaliScan] = useState(false);
  const [bannerAlert, setBannerAlert] = useState<string | null>(null);

  // Real-time Traffic Counters (simulating continuous live throughput)
  const [packetsIn, setPacketsIn] = useState(148720);
  const [packetsOut, setPacketsOut] = useState(98432);
  const [bandwidthIn, setBandwidthIn] = useState(4.8);
  const [bandwidthOut, setBandwidthOut] = useState(5.1);

  // Periodic Telemetry Jitter
  useEffect(() => {
    const interval = setInterval(() => {
      setPacketsIn(prev => prev + Math.floor(Math.random() * 45) + 12);
      setPacketsOut(prev => prev + Math.floor(Math.random() * 30) + 8);
      setBandwidthIn(prev => +(prev + (Math.random() * 0.02 - 0.01)).toFixed(2));
      setBandwidthOut(prev => +(prev + (Math.random() * 0.02 - 0.01)).toFixed(2));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Poll /api/ids for live detected scans
  useEffect(() => {
    const pollIds = async () => {
      try {
        const res = await fetch('/api/ids?action=events');
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.events) && json.events.length > 0) {
            setEvents(prev => {
              // Merge unique events
              const map = new Map<string, SocEvent>();
              [...json.events, ...prev].forEach(e => map.set(e.id, e));
              return Array.from(map.values()).slice(0, 15);
            });
          }
        }
      } catch {}
    };

    const interval = setInterval(pollIds, 6000);
    return () => clearInterval(interval);
  }, []);

  // Handler: Test Kali Linux Nmap Scan Simulation
  const handleTriggerKaliNmapScan = async () => {
    setIsSimulatingKaliScan(true);
    setBannerAlert('🚨 NMAP PORT SCAN DETECTED FROM KALI LINUX (192.168.1.105)');

    // Call live /api/ids with Nmap User-Agent
    try {
      const res = await fetch('/api/ids', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (compatible; Nmap Scripting Engine; https://nmap.org/book/nse.html)',
        },
        body: JSON.stringify({ action: 'probe', script: 'http-enum' }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.detectedEvent) {
          setEvents(prev => [json.detectedEvent, ...prev]);
          setSelectedEvent(json.detectedEvent);
        }
      }
    } catch {}

    setTimeout(() => {
      setIsSimulatingKaliScan(false);
    }, 1500);
  };

  // Filtered Events
  const filteredEvents = events.filter(e => {
    if (activeThreatFilter === 'All') return true;
    if (activeThreatFilter === 'PortScan') return e.eventType.toLowerCase().includes('nmap') || e.eventType.toLowerCase().includes('scan');
    if (activeThreatFilter === 'Intrusion') return e.eventType.toLowerCase().includes('traversal') || e.eventType.toLowerCase().includes('stuffing');
    if (activeThreatFilter === 'Malware') return e.eventType.toLowerCase().includes('c04') || e.eventType.toLowerCase().includes('malware');
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 select-none font-sans">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER & HUD BAR (Matching Images 1 & 2 Top Panels)                */}
      {/* ========================================================================= */}
      <div className="rounded-3xl bg-gradient-to-r from-[#070e1a]/95 via-[#060b14]/98 to-[#091120]/95 border border-cyan-500/25 p-5 shadow-2xl backdrop-blur-2xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Pulsing Tactical Insignia */}
            <div className="w-11 h-11 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center shadow-[0_0_20px_rgba(0,240,255,0.3)]">
              <ShieldAlert className="w-6 h-6 text-cyan-400 animate-pulse" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold font-mono tracking-tight bg-gradient-to-r from-cyan-300 via-sky-200 to-purple-300 bg-clip-text text-transparent">
                  SECURITY OPERATIONS CENTER | SOC COMMAND BASE
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                  DEFCON 1 ACTIVE
                </span>
              </div>
              <p className="text-xs text-gray-400 font-mono">
                Real-time threat intelligence, live IDS heuristics, packet telemetry, and automated mitigation.
              </p>
            </div>
          </div>

          {/* Top Context Selectors & Threat Filter Toggles (Matching Image 1 & 2) */}
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            <div className="flex items-center gap-1 bg-black/60 p-1 rounded-2xl border border-white/10">
              {(['All', 'PortScan', 'Intrusion', 'Malware'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setActiveThreatFilter(t)}
                  className={`px-3 py-1.5 rounded-xl transition text-xs ${
                    activeThreatFilter === t
                      ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-400/40 font-bold shadow-sm'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {t === 'PortScan' ? 'Port Scans (Nmap)' : t}
                </button>
              ))}
            </div>

            {/* Live Kali Linux Nmap Simulation Trigger Button */}
            <button
              onClick={handleTriggerKaliNmapScan}
              disabled={isSimulatingKaliScan}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-mono font-bold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(239,68,68,0.4)] transition disabled:opacity-50"
              title="Send an active Nmap probe from terminal or simulation"
            >
              {isSimulatingKaliScan ? (
                <>
                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                  <span>PROBING PORT 443...</span>
                </>
              ) : (
                <>
                  <Flame className="w-3.5 h-3.5" />
                  <span>SIMULATE KALI NMAP SCAN</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Real-time System Status HUD (Matching Image 2 Top Ribbon) */}
        <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 font-mono text-xs">
          <div className="p-3 bg-black/40 rounded-2xl border border-white/5">
            <span className="text-[10px] text-gray-500 block uppercase">System Health</span>
            <span className="text-sm font-bold text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> 98.4% Operational
            </span>
          </div>

          <div className="p-3 bg-black/40 rounded-2xl border border-white/5">
            <span className="text-[10px] text-gray-500 block uppercase">Edge Latency</span>
            <span className="text-sm font-bold text-cyan-300">12ms (IAD1-East)</span>
          </div>

          <div className="p-3 bg-black/40 rounded-2xl border border-white/5">
            <span className="text-[10px] text-gray-500 block uppercase">Packets In / Out</span>
            <span className="text-sm font-bold text-purple-300">
              {packetsIn.toLocaleString()} / {packetsOut.toLocaleString()}
            </span>
          </div>

          <div className="p-3 bg-black/40 rounded-2xl border border-white/5">
            <span className="text-[10px] text-gray-500 block uppercase">Network Bandwidth</span>
            <span className="text-sm font-bold text-white">
              {bandwidthIn} TB In / {bandwidthOut} TB Out
            </span>
          </div>

          <div className="p-3 bg-black/40 rounded-2xl border border-white/5">
            <span className="text-[10px] text-gray-500 block uppercase">Threats Blocked</span>
            <span className="text-sm font-bold text-emerald-400">14,872 Attacks</span>
          </div>

          <div className="p-3 bg-black/40 rounded-2xl border border-white/5">
            <span className="text-[10px] text-gray-500 block uppercase">Protected Assets</span>
            <span className="text-sm font-bold text-cyan-400">24,389 Endpoints</span>
          </div>
        </div>

        {/* Live Attack Warning Banner (if Kali scan is triggered) */}
        {bannerAlert && (
          <div className="mt-4 p-3 rounded-2xl bg-red-950/80 border border-red-500/50 flex items-center justify-between gap-3 text-xs font-mono text-red-200 animate-pulse">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              <span className="font-bold">{bannerAlert}</span>
            </div>
            <button
              onClick={() => setBannerAlert(null)}
              className="text-gray-400 hover:text-white text-[10px]"
            >
              ✕ Dismiss
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2. THREE-COLUMN SOC COMMAND DECK (Matching Images 1 & 2 Layout)          */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ----------------------------------------------------------------------- */}
        {/* LEFT COLUMN: Threat Activity Timeline & Active Threats (Cols 3/12)       */}
        {/* ----------------------------------------------------------------------- */}
        <div className="lg:col-span-3 space-y-4">
          {/* Active Threats Counter (Matching Image 2) */}
          <div className="rounded-3xl bg-[#09101d]/85 border border-red-500/20 p-5 shadow-xl backdrop-blur-xl space-y-3 font-mono">
            <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs">
              <span className="font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                Active Threats
              </span>
              <span className="text-[10px] text-red-400 font-bold animate-pulse">LIVE INCIDENTS</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 bg-red-950/30 rounded-2xl border border-red-500/30">
                <span className="text-[10px] text-gray-400 block uppercase">Critical High</span>
                <span className="text-xl font-bold text-red-400">3</span>
              </div>
              <div className="p-3 bg-amber-950/30 rounded-2xl border border-amber-500/30">
                <span className="text-[10px] text-gray-400 block uppercase">Elevated</span>
                <span className="text-xl font-bold text-amber-400">14</span>
              </div>
            </div>

            {/* Mini Network Traffic Histogram (Matching Image 2 left side) */}
            <div className="space-y-1.5 pt-2">
              <span className="text-[10px] text-gray-500 uppercase block">Network Traffic Velocity</span>
              <div className="h-16 flex items-end gap-1 px-1 bg-black/40 rounded-xl p-2 border border-white/5">
                {[45, 60, 30, 80, 95, 40, 70, 85, 90, 65, 50, 75, 100, 60, 45].map((h, i) => (
                  <div
                    key={i}
                    className={`flex-1 rounded-sm ${h > 75 ? 'bg-red-500' : h > 50 ? 'bg-amber-400' : 'bg-cyan-400'}`}
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Threat Analytics Distribution (Donut & Categories - Image 2) */}
          <div className="rounded-3xl bg-[#09101d]/85 border border-white/10 p-5 shadow-xl backdrop-blur-xl space-y-3 font-mono text-xs">
            <span className="font-bold text-white uppercase tracking-wider block pb-2 border-b border-white/10">
              Threat Vector Vectors
            </span>

            <div className="space-y-2">
              {[
                { name: 'DDoS Attacks', pct: 41, color: 'bg-cyan-400' },
                { name: 'Malware & Ransomware', pct: 28, color: 'bg-red-500' },
                { name: 'Intrusion & Port Scans', pct: 19, color: 'bg-amber-400' },
                { name: 'Phishing & Identity', pct: 12, color: 'bg-purple-400' },
              ].map(item => (
                <div key={item.name} className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-gray-300">{item.name}</span>
                    <span className="font-bold text-white">{item.pct}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-black/60 rounded-full overflow-hidden">
                    <div className={`h-full ${item.color}`} style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Alert Callouts (Matching Image 2 Alert boxes) */}
          <div className="space-y-2">
            <div className="p-3 rounded-2xl bg-red-950/40 border border-red-500/30 text-xs font-mono">
              <span className="text-red-400 font-bold block">⚠️ Malware Alert: APT C04</span>
              <span className="text-[10px] text-gray-400">Origin: RU Subnet • Target: Web Node</span>
            </div>

            <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-xs font-mono">
              <span className="text-amber-400 font-bold block">▲ Intrusion Attempt: 192.168.5.12</span>
              <span className="text-[10px] text-gray-400">Nmap Scripting Engine SYN Sweep</span>
            </div>
          </div>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* CENTER COLUMN: 3D Living Globe & Telemetry Stage (Cols 6/12 - Image 1)  */}
        {/* ----------------------------------------------------------------------- */}
        <div className="lg:col-span-6 rounded-3xl bg-[#070c16]/95 border border-cyan-500/25 p-5 shadow-2xl backdrop-blur-2xl flex flex-col justify-between min-h-[580px] relative overflow-hidden">
          {/* Top Stage Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10 z-10">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                Global Threat Radar & Interceptor Matrix
              </h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              3D ORBITAL VIEW // 60 FPS
            </span>
          </div>

          {/* Interactive 3D Living Globe Canvas */}
          <div className="relative w-full h-[380px] my-2">
            <LivingGlobeCanvas
              activeTargetCoords={{
                lat: 36.75,
                lon: 3.05,
                label: 'ALGIERS SOC BASE',
              }}
            />
          </div>

          {/* AI Threat Intelligence Query Bar (Matching Image 1 prompt bar) */}
          <div className="z-10 p-3 rounded-2xl bg-black/60 border border-white/10 flex items-center justify-between gap-3 font-mono text-xs">
            <div className="flex items-center gap-2 text-gray-400 flex-1">
              <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
              <input
                type="text"
                placeholder="Ask Threat Intelligence AI (GPT-6 Astra)..."
                onKeyDown={e => {
                  if (e.key === 'Enter' && onSendToCopilot) {
                    onSendToCopilot((e.target as HTMLInputElement).value);
                  }
                }}
                className="w-full bg-transparent text-white placeholder-gray-500 focus:outline-none text-xs"
              />
            </div>
            <span className="text-[10px] px-2 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 whitespace-nowrap">
              GPT-6 ASTRA
            </span>
          </div>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* RIGHT COLUMN: AI Threat Detection & Speedometer Radar (Cols 3/12)       */}
        {/* ----------------------------------------------------------------------- */}
        <div className="lg:col-span-3 space-y-4">
          {/* Global Threat Radar Radial Gauge (Matching Image 1) */}
          <div className="rounded-3xl bg-[#09101d]/85 border border-cyan-500/20 p-5 shadow-xl backdrop-blur-xl text-center font-mono space-y-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
              Global Threat Radar
            </span>

            {/* Stylized Radial Speedometer Gauge */}
            <div className="relative w-36 h-20 mx-auto overflow-hidden flex items-end justify-center">
              <div className="w-36 h-36 rounded-full border-8 border-cyan-500/20 border-t-cyan-400 border-r-cyan-400 transform -rotate-45" />
              <div className="absolute bottom-1 text-center">
                <span className="text-2xl font-extrabold text-white block">983</span>
                <span className="text-[9px] text-gray-400 uppercase">Active Sources</span>
              </div>
            </div>
          </div>

          {/* Attack Volume Trend (Matching Image 1 Area Chart) */}
          <div className="rounded-3xl bg-[#09101d]/85 border border-white/10 p-5 shadow-xl backdrop-blur-xl space-y-2 font-mono text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-white/10">
              <span className="font-bold text-white uppercase">Attack Volume Trend</span>
              <span className="text-cyan-300 font-bold">983,421</span>
            </div>

            <div className="h-16 flex items-end gap-1 bg-black/40 p-2 rounded-xl border border-white/5">
              {[20, 35, 45, 60, 50, 75, 90, 85, 60, 45, 70, 95, 80, 60, 40].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 bg-gradient-to-t from-cyan-500/40 to-cyan-400 rounded-sm"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>

          {/* AI Confidence Progress Bars (Matching Image 1) */}
          <div className="rounded-3xl bg-[#09101d]/85 border border-white/10 p-5 shadow-xl backdrop-blur-xl space-y-3 font-mono text-xs">
            <span className="font-bold text-white uppercase tracking-wider block pb-2 border-b border-white/10">
              AI Detection Confidence
            </span>

            <div className="space-y-2.5">
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-gray-400">Malware Classification</span>
                  <span className="font-bold text-emerald-400">97%</span>
                </div>
                <div className="h-1.5 w-full bg-black/60 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400" style={{ width: '97%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-gray-400">Anomaly Detection</span>
                  <span className="font-bold text-cyan-400">94%</span>
                </div>
                <div className="h-1.5 w-full bg-black/60 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-400" style={{ width: '94%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-gray-400">Threat Attribution</span>
                  <span className="font-bold text-purple-400">89%</span>
                </div>
                <div className="h-1.5 w-full bg-black/60 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-400" style={{ width: '89%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. LIVE SECURITY EVENTS LOG & ATTACK MITIGATION CONSOLE (Matching Image 2)*/}
      {/* ========================================================================= */}
      <div className="rounded-3xl bg-[#080e18]/95 border border-white/10 p-5 shadow-2xl backdrop-blur-2xl space-y-4 font-mono text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Real-Time Security Events Log & Intrusion Telemetry
            </h3>
          </div>
          <span className="text-[10px] text-gray-500">Auto-refreshing via Web IDS</span>
        </div>

        {/* Events Table (Matching Image 2 Layout) */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-gray-400 text-[11px] uppercase">
                <th className="py-2.5 px-3">Time (UTC)</th>
                <th className="py-2.5 px-3">Severity</th>
                <th className="py-2.5 px-3">Source Origin</th>
                <th className="py-2.5 px-3">Attack Vector / Signature</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">SOC Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredEvents.map(evt => (
                <tr
                  key={evt.id}
                  onClick={() => setSelectedEvent(evt)}
                  className={`hover:bg-white/5 transition cursor-pointer ${
                    selectedEvent?.id === evt.id ? 'bg-cyan-500/10' : ''
                  }`}
                >
                  <td className="py-3 px-3 text-gray-400 whitespace-nowrap">{evt.timestamp}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        evt.severity === 'Critical'
                          ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                          : evt.severity === 'High'
                          ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                          : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      }`}
                    >
                      {evt.severity}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-bold text-white whitespace-nowrap">
                    {evt.countryFlag} {evt.sourceIp}
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-gray-200 block">{evt.eventType}</span>
                    <span className="text-[10px] text-gray-500">{evt.signature}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                        evt.status === 'Blocked'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-red-500/20 text-red-300 animate-pulse'
                      }`}
                    >
                      {evt.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setSelectedEvent(evt);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-[11px] transition"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Selected Event Detail & AI Defensive Tips Drawer */}
        {selectedEvent && (
          <div className="mt-4 p-4 rounded-2xl bg-black/60 border border-cyan-500/30 space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-white">
                  SOC DEFENSIVE PLAYBOOK: {selectedEvent.eventType} ({selectedEvent.sourceIp})
                </span>
              </div>
              <span className="text-[10px] text-purple-400 font-mono">
                MITRE ATT&CK: {selectedEvent.mitreTechnique || 'T1595.002'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[10px] text-gray-500 block uppercase">Observed Attacker Payload / Snippet</span>
                <p className="bg-black/80 p-2.5 rounded-xl border border-white/5 text-red-300 font-mono select-all">
                  {selectedEvent.payloadSnippet || 'Nmap SYN Half-Open Stealth Probe'}
                </p>
              </div>

              <div>
                <span className="text-[10px] text-gray-500 block uppercase">Recommended Countermeasure & IPTables Rule</span>
                <p className="bg-black/80 p-2.5 rounded-xl border border-white/5 text-emerald-300 font-mono select-all">
                  {selectedEvent.mitigationTip}
                </p>
              </div>
            </div>

            {onWeaveEventToBrain && (
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => onWeaveEventToBrain(selectedEvent)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs transition"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Weave Incident to Second Brain</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
