// ==========================================
// ZAK'S SPIDER — LIVE CYBER ATTACK STREAM DECK
// Matching wireframe media_1788987543371.png (Right Column Deck)
// Real-time worldwide attack feed with click-to-focus on 3D Globe
// ==========================================

import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Flame, 
  Activity, 
  ArrowRight, 
  Filter, 
  Play, 
  Pause, 
  Crosshair, 
  Lock, 
  ExternalLink,
  Terminal,
  ShieldCheck,
  AlertTriangle,
  Zap,
  Globe
} from 'lucide-react';
import type { GlobalCyberAttack } from '../../types';

interface LiveAttackStreamDeckProps {
  onSelectAttack: (attack: GlobalCyberAttack) => void;
  selectedAttackId?: string | null;
  onWeaveToBrain?: (attack: GlobalCyberAttack) => void;
}

// Authentic global nation-state cyber attack incident seed library
export const REAL_WORLD_ATTACK_POOL: Omit<GlobalCyberAttack, 'id' | 'timestamp'>[] = [
  {
    sourceCountry: 'Russia',
    sourceFlag: '🇷🇺',
    sourceCity: 'Moscow',
    sourceCoords: [55.7558, 37.6173],
    targetCountry: 'United States',
    targetFlag: '🇺🇸',
    targetCity: 'Washington, D.C.',
    targetCoords: [38.9072, -77.0369],
    threatActor: 'APT29 (Cozy Bear)',
    vector: 'Cloud Identity Token Theft (OAuth Bypass)',
    severity: 'CRITICAL',
    port: 443,
    status: 'BLOCKED',
    cve: 'CVE-2024-3400',
  },
  {
    sourceCountry: 'China',
    sourceFlag: '🇨🇳',
    sourceCity: 'Shanghai',
    sourceCoords: [31.2304, 121.4737],
    targetCountry: 'Germany',
    targetFlag: '🇩🇪',
    targetCity: 'Frankfurt',
    targetCoords: [50.1109, 8.6821],
    threatActor: 'Volt Typhoon',
    vector: 'Living-off-the-Land SOHO Router Mesh',
    severity: 'CRITICAL',
    port: 445,
    status: 'ISOLATED',
    cve: 'CVE-2024-21887',
  },
  {
    sourceCountry: 'North Korea',
    sourceFlag: '🇰🇵',
    sourceCity: 'Pyongyang',
    sourceCoords: [39.0392, 125.7625],
    targetCountry: 'Japan',
    targetFlag: '🇯🇵',
    targetCity: 'Tokyo',
    targetCoords: [35.6762, 139.6503],
    threatActor: 'Lazarus Group',
    vector: 'Operation DreamJob Crypto Backdoor',
    severity: 'CRITICAL',
    port: 8080,
    status: 'CONTAINED',
    cve: 'CVE-2023-38606',
  },
  {
    sourceCountry: 'Iran',
    sourceFlag: '🇮🇷',
    sourceCity: 'Tehran',
    sourceCoords: [35.6892, 51.3890],
    targetCountry: 'Israel',
    targetFlag: '🇮🇱',
    targetCity: 'Tel Aviv',
    targetCoords: [32.0853, 34.7818],
    threatActor: 'MuddyWater / CyberAv3ngers',
    vector: 'Unitronics PLC SCADA Logic Overwrite',
    severity: 'HIGH',
    port: 502,
    status: 'BLOCKED',
    cve: 'CVE-2023-6448',
  },
  {
    sourceCountry: 'Russia',
    sourceFlag: '🇷🇺',
    sourceCity: 'Saint Petersburg',
    sourceCoords: [59.9343, 30.3351],
    targetCountry: 'Algeria',
    targetFlag: '🇩🇿',
    targetCity: 'Algiers',
    targetCoords: [36.7538, 3.0588],
    threatActor: 'LockBit 3.0 Affiliate',
    vector: 'SonicWall SSL-VPN Auth Bypass',
    severity: 'HIGH',
    port: 4433,
    status: 'MITIGATED',
    cve: 'CVE-2024-40766',
  },
  {
    sourceCountry: 'Brazil',
    sourceFlag: '🇧🇷',
    sourceCity: 'São Paulo',
    sourceCoords: [-23.5505, -46.6333],
    targetCountry: 'United Kingdom',
    targetFlag: '🇬🇧',
    targetCity: 'London',
    targetCoords: [51.5074, -0.1278],
    threatActor: 'FIN7 / Carbanak',
    vector: 'Banking Trojan Injection via WebInject',
    severity: 'HIGH',
    port: 443,
    status: 'BLOCKED',
  },
  {
    sourceCountry: 'Vietnam',
    sourceFlag: '🇻🇳',
    sourceCity: 'Hanoi',
    sourceCoords: [21.0285, 105.8542],
    targetCountry: 'South Korea',
    targetFlag: '🇰🇷',
    targetCity: 'Seoul',
    targetCoords: [37.5665, 126.9780],
    threatActor: 'OceanLotus (APT32)',
    vector: 'Spear-Phishing Macro Word Attachment',
    severity: 'MEDIUM',
    port: 80,
    status: 'CONTAINED',
  },
  {
    sourceCountry: 'Netherlands',
    sourceFlag: '🇳🇱',
    sourceCity: 'Amsterdam',
    sourceCoords: [52.3676, 4.9041],
    targetCountry: 'France',
    targetFlag: '🇫🇷',
    targetCity: 'Paris',
    targetCoords: [48.8566, 2.3522],
    threatActor: 'Akira Ransomware Group',
    vector: 'Cisco ASA AnyConnect VPN Credential Spray',
    severity: 'CRITICAL',
    port: 8443,
    status: 'ISOLATED',
    cve: 'CVE-2023-20269',
  },
  {
    sourceCountry: 'Algeria',
    sourceFlag: '🇩🇿',
    sourceCity: 'Oran',
    sourceCoords: [35.6971, -0.6308],
    targetCountry: 'United States',
    targetFlag: '🇺🇸',
    targetCity: 'San Francisco',
    targetCoords: [37.7749, -122.4194],
    threatActor: 'Security Research Cluster (Zaks)',
    vector: 'Simulated Ethical Penetration Audit',
    severity: 'MEDIUM',
    port: 22,
    status: 'DETECTED',
  },
  {
    sourceCountry: 'China',
    sourceFlag: '🇨🇳',
    sourceCity: 'Beijing',
    sourceCoords: [39.9042, 116.4074],
    targetCountry: 'Australia',
    targetFlag: '🇦🇺',
    targetCity: 'Sydney',
    targetCoords: [-33.8688, 151.2093],
    threatActor: 'Mustang Panda (Bronze President)',
    vector: 'PlugX DLL Sideloading via USB Drive',
    severity: 'HIGH',
    port: 53,
    status: 'BLOCKED',
  },
  {
    sourceCountry: 'Russia',
    sourceFlag: '🇷🇺',
    sourceCity: 'Novosibirsk',
    sourceCoords: [55.0084, 82.9357],
    targetCountry: 'Ukraine',
    targetFlag: '🇺🇦',
    targetCity: 'Kyiv',
    targetCoords: [50.4501, 30.5234],
    threatActor: 'Sandworm (Unit 74455)',
    vector: 'Industroyer2 High-Voltage Telecontrol Strike',
    severity: 'CRITICAL',
    port: 2404,
    status: 'BLOCKED',
    cve: 'CVE-2022-21587',
  }
];

export const LiveAttackStreamDeck: React.FC<LiveAttackStreamDeckProps> = ({
  onSelectAttack,
  selectedAttackId,
  onWeaveToBrain,
}) => {
  const [attacks, setAttacks] = useState<GlobalCyberAttack[]>(() => {
    return REAL_WORLD_ATTACK_POOL.slice(0, 6).map((item, idx) => ({
      ...item,
      id: `live-atk-${Date.now()}-${idx}`,
      timestamp: new Date(Date.now() - idx * 4500).toLocaleTimeString(),
    }));
  });

  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [filter, setFilter] = useState<'ALL' | 'CRITICAL' | 'RANSOMWARE' | 'APT'>('ALL');
  const [inspectedAttack, setInspectedAttack] = useState<GlobalCyberAttack | null>(null);

  // Streaming real-time tick engine
  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      // Pick random incident from pool
      const randomSeed = REAL_WORLD_ATTACK_POOL[Math.floor(Math.random() * REAL_WORLD_ATTACK_POOL.length)];
      const newAttack: GlobalCyberAttack = {
        ...randomSeed,
        id: `live-atk-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
      };

      setAttacks(prev => [newAttack, ...prev.slice(0, 18)]);
    }, 2800);

    return () => clearInterval(interval);
  }, [isStreaming]);

  // Filtered list
  const filteredAttacks = attacks.filter(atk => {
    if (filter === 'CRITICAL') return atk.severity === 'CRITICAL';
    if (filter === 'RANSOMWARE') return atk.threatActor.toLowerCase().includes('lockbit') || atk.threatActor.toLowerCase().includes('akira');
    if (filter === 'APT') return atk.threatActor.toLowerCase().includes('apt') || atk.threatActor.toLowerCase().includes('typhoon') || atk.threatActor.toLowerCase().includes('lazarus');
    return true;
  });

  const getSeverityBadge = (severity: GlobalCyberAttack['severity']) => {
    switch (severity) {
      case 'CRITICAL':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
      case 'HIGH':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'MEDIUM':
      default:
        return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'BLOCKED':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'ISOLATED':
        return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
      case 'CONTAINED':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      default:
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#080d16]/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-3 shadow-2xl overflow-hidden select-none">
      {/* Deck Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400">
            <Flame className="w-4 h-4 animate-pulse" />
          </span>
          <div>
            <h3 className="text-xs font-mono font-bold text-white tracking-wider flex items-center gap-1.5">
              <span>LIVE ATTACK STREAM</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            </h3>
            <p className="text-[9px] font-mono text-zinc-400">
              Worldwide Nation-State Threat Ticker
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsStreaming(prev => !prev)}
          className={`px-2 py-1 rounded-lg text-[9px] font-mono font-bold flex items-center gap-1 border transition ${
            isStreaming
              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
              : 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
          }`}
        >
          {isStreaming ? (
            <>
              <Pause className="w-3 h-3" />
              <span>PAUSE</span>
            </>
          ) : (
            <>
              <Play className="w-3 h-3" />
              <span>RESUME</span>
            </>
          )}
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 py-2 overflow-x-auto border-b border-white/5 scrollbar-none">
        {(['ALL', 'CRITICAL', 'APT', 'RANSOMWARE'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-2 py-1 rounded-lg text-[9px] font-mono font-bold transition whitespace-nowrap ${
              filter === tab
                ? 'bg-white/15 text-white border border-white/20'
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Ticking Attacks List */}
      <div className="flex-1 overflow-y-auto space-y-2 py-2 pr-1 scrollbar-thin scrollbar-thumb-white/10">
        {filteredAttacks.map((atk) => {
          const isSelected = selectedAttackId === atk.id;

          return (
            <div
              key={atk.id}
              onClick={() => {
                onSelectAttack(atk);
                setInspectedAttack(atk);
              }}
              className={`p-2.5 rounded-xl border transition-all duration-200 cursor-pointer group ${
                isSelected
                  ? 'bg-cyan-500/10 border-cyan-500/50 shadow-[0_0_12px_rgba(0,240,255,0.15)]'
                  : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/15'
              }`}
            >
              {/* Top Row: Countries & Flags */}
              <div className="flex items-center justify-between text-[11px] font-mono font-bold text-white mb-1">
                <div className="flex items-center gap-1.5 truncate">
                  <span>{atk.sourceFlag}</span>
                  <span className="truncate">{atk.sourceCity || atk.sourceCountry}</span>
                  <ArrowRight className="w-3 h-3 text-zinc-500 shrink-0" />
                  <span>{atk.targetFlag}</span>
                  <span className="text-cyan-300 truncate">{atk.targetCity || atk.targetCountry}</span>
                </div>
                <span className="text-[9px] font-mono text-zinc-500 shrink-0 ml-1">
                  {atk.timestamp}
                </span>
              </div>

              {/* Threat Actor & Vector */}
              <div className="text-[10px] font-mono text-zinc-300 truncate">
                <span className="text-rose-400 font-semibold">{atk.threatActor}</span>: {atk.vector}
              </div>

              {/* Badges Footer */}
              <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-white/5 text-[9px] font-mono">
                <div className="flex items-center gap-1.5">
                  <span className={`px-1.5 py-0.5 rounded border font-bold ${getSeverityBadge(atk.severity)}`}>
                    {atk.severity}
                  </span>
                  {atk.port && (
                    <span className="px-1.5 py-0.5 rounded bg-black/40 border border-white/10 text-zinc-400">
                      PORT {atk.port}
                    </span>
                  )}
                  {atk.cve && (
                    <span className="px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300">
                      {atk.cve}
                    </span>
                  )}
                </div>

                <span className={`px-1.5 py-0.5 rounded border font-bold ${getStatusBadge(atk.status)}`}>
                  {atk.status || 'BLOCKED'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Deck Footer / Incident Inspection Quick Bar */}
      <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[9px] font-mono text-zinc-400">
        <span className="flex items-center gap-1">
          <Crosshair className="w-3 h-3 text-cyan-400" />
          Click card to lock 3D Globe
        </span>
        <span className="text-zinc-500">{filteredAttacks.length} active threats</span>
      </div>

      {/* Incident Triage Modal / Drawer when an attack is clicked */}
      {inspectedAttack && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0c1322] border border-cyan-500/30 rounded-2xl p-5 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400">
                  <ShieldAlert className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-sm font-mono font-bold text-white">
                    INCIDENT TRIAGE: {inspectedAttack.threatActor}
                  </h3>
                  <p className="text-xs font-mono text-zinc-400">
                    {inspectedAttack.sourceCountry} ({inspectedAttack.sourceCity}) ➔ {inspectedAttack.targetCountry} ({inspectedAttack.targetCity})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectedAttack(null)}
                className="text-zinc-400 hover:text-white text-sm font-mono p-1"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                <div className="text-[10px] text-zinc-500">ATTACK VECTOR</div>
                <div className="text-white font-semibold">{inspectedAttack.vector}</div>
                {inspectedAttack.cve && (
                  <div className="text-amber-400 text-[11px]">{inspectedAttack.cve}</div>
                )}
              </div>
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                <div className="text-[10px] text-zinc-500">SEVERITY / STATUS</div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${getSeverityBadge(inspectedAttack.severity)}`}>
                    {inspectedAttack.severity}
                  </span>
                  <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${getStatusBadge(inspectedAttack.status)}`}>
                    {inspectedAttack.status || 'BLOCKED'}
                  </span>
                </div>
                <div className="text-zinc-400 text-[10px]">Port {inspectedAttack.port || 443} / TLS</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#070b12] border border-cyan-500/20 text-xs font-mono space-y-1.5">
              <div className="text-cyan-400 font-bold flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5" />
                <span>TACTICAL MITIGATION PLAYBOOK</span>
              </div>
              <div className="p-2 rounded bg-black/60 border border-white/10 text-zinc-300 text-[11px] font-mono overflow-x-auto">
                <code>
                  iptables -A INPUT -s {inspectedAttack.sourceCoords[0] > 0 ? '185.220.101.5' : '103.14.26.8'} -p tcp --dport {inspectedAttack.port || 443} -j DROP
                </code>
              </div>
              <p className="text-[10px] text-zinc-400">
                Next-Gen WAF signature deployed across external perimeter ingress gateways.
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <button
                onClick={() => {
                  if (onWeaveToBrain) onWeaveToBrain(inspectedAttack);
                  setInspectedAttack(null);
                }}
                className="px-3 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-mono font-bold flex items-center gap-2 transition"
              >
                <span>🕸️ WEAVE INCIDENT TO SECOND BRAIN</span>
              </button>

              <button
                onClick={() => setInspectedAttack(null)}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs transition"
              >
                CLOSE TRIAGE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
