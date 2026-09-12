import React, { useState, useMemo } from 'react';
import { 
  ShieldAlert, ShieldCheck, Search, Info, ExternalLink, 
  X, Check, AlertTriangle, Layers, Crosshair, ChevronRight 
} from 'lucide-react';

export interface MitreTechniqueDef {
  id: string;
  name: string;
  tacticId: string;
  tacticName: string;
  description: string;
  detection: string;
  mitigation: string;
  aptActors: string[];
}

export const ENTERPRISE_MITRE_TACTICS: { id: string; name: string; shortName: string }[] = [
  { id: 'TA0043', name: 'Reconnaissance', shortName: 'Recon' },
  { id: 'TA0042', name: 'Resource Development', shortName: 'Resource Dev' },
  { id: 'TA0001', name: 'Initial Access', shortName: 'Initial Access' },
  { id: 'TA0002', name: 'Execution', shortName: 'Execution' },
  { id: 'TA0003', name: 'Persistence', shortName: 'Persistence' },
  { id: 'TA0004', name: 'Privilege Escalation', shortName: 'Priv Escalation' },
  { id: 'TA0005', name: 'Defense Evasion', shortName: 'Defense Evasion' },
  { id: 'TA0006', name: 'Credential Access', shortName: 'Cred Access' },
  { id: 'TA0007', name: 'Discovery', shortName: 'Discovery' },
  { id: 'TA0008', name: 'Lateral Movement', shortName: 'Lateral Move' },
  { id: 'TA0009', name: 'Collection', shortName: 'Collection' },
  { id: 'TA0011', name: 'Command and Control', shortName: 'C2' },
  { id: 'TA0010', name: 'Exfiltration', shortName: 'Exfiltration' },
  { id: 'TA0040', name: 'Impact', shortName: 'Impact' },
];

export const CORE_TECHNIQUES: MitreTechniqueDef[] = [
  // Reconnaissance
  {
    id: 'T1595',
    name: 'Active Scanning',
    tacticId: 'TA0043',
    tacticName: 'Reconnaissance',
    description: 'Adversaries may execute active scans to probe IP blocks, open listener ports, and vulnerable services.',
    detection: 'Correlate high-velocity SYN packets, rapid port traversal, or repetitive URI probing patterns.',
    mitigation: 'Implement rate-limiting, WAF throttling, and automated perimeter threat intelligence feeds.',
    aptActors: ['APT28', 'Volt Typhoon', 'Lazarus Group'],
  },
  {
    id: 'T1592',
    name: 'Gather Victim Host Information',
    tacticId: 'TA0043',
    tacticName: 'Reconnaissance',
    description: 'Adversaries may gather host configuration, software versions, and patch levels prior to exploitation.',
    detection: 'Inspect anomalous requests probing for /.env, /wp-config.php, /server-status, or IIS trace logs.',
    mitigation: 'Enforce strict URI filtering to block dotfiles and unneeded administrative diagnostic pages.',
    aptActors: ['FIN7', 'Sandworm', 'APT41'],
  },

  // Initial Access
  {
    id: 'T1190',
    name: 'Exploit Public-Facing Application',
    tacticId: 'TA0001',
    tacticName: 'Initial Access',
    description: 'Adversaries take advantage of a weakness in an Internet-facing program or service to cause unintended code execution.',
    detection: 'Monitor WAF and reverse-proxy logs for known CVE signatures (e.g. Log4j JNDI expressions, SQL injection unions).',
    mitigation: 'Maintain continuous patch management, deploy WAF virtual patching, and isolate DMZ servers.',
    aptActors: ['APT29', 'HAFNIUM', 'Volt Typhoon', 'LockBit'],
  },
  {
    id: 'T1133',
    name: 'External Remote Services',
    tacticId: 'TA0001',
    tacticName: 'Initial Access',
    description: 'Adversaries leverage VPN, RDP, Citrix, or SSH gateways to gain initial access to an enterprise environment.',
    detection: 'Alert on sudden spikes in failed logins, abnormal geolocation logins, or logins bypassing MFA.',
    mitigation: 'Enforce phishing-resistant MFA (FIDO2/WebAuthn) on all external gateways.',
    aptActors: ['Scattered Spider', 'BlackCat', 'APT33'],
  },

  // Execution
  {
    id: 'T1059',
    name: 'Command and Scripting Interpreter',
    tacticId: 'TA0002',
    tacticName: 'Execution',
    description: 'Adversaries execute arbitrary commands using shell interpreters (Bash, sh, PowerShell, cmd.exe).',
    detection: 'Track web-tier child processes invoking /bin/bash, cmd.exe, or powershell.exe from www-data/nginx users.',
    mitigation: 'Enforce process execution restrictions (AppLocker, SELinux, noexec mount points).',
    aptActors: ['Sandworm', 'Turla', 'APT29'],
  },

  // Persistence
  {
    id: 'T1505.003',
    name: 'Server Software Component: Web Shell',
    tacticId: 'TA0003',
    tacticName: 'Persistence',
    description: 'Adversaries place backdoor scripts (PHP, JSP, ASPX) in web root directories for continuous remote access.',
    detection: 'File integrity monitoring (FIM) alerting on modified or newly created executable scripts in public web directories.',
    mitigation: 'Make web root directories read-only to web server user and disallow execution of scripts in upload paths.',
    aptActors: ['HAFNIUM', 'APT41', 'China Chopper Operators'],
  },

  // Privilege Escalation
  {
    id: 'T1548.003',
    name: 'Abuse Elevation Control: Sudo and Sudo Caching',
    tacticId: 'TA0004',
    tacticName: 'Privilege Escalation',
    description: 'Adversaries leverage misconfigured sudoers privileges or cached sudo tokens to elevate from unprivileged user to root.',
    detection: 'Audit /var/log/auth.log for repeated sudo authentication failures or execution of non-standard binaries via sudo.',
    mitigation: 'Enforce strict sudoers principle of least privilege and require re-authentication without sudo caching.',
    aptActors: ['Sandworm', 'Lazarus Group'],
  },

  // Defense Evasion
  {
    id: 'T1070',
    name: 'Indicator Removal: Clear Host Logs',
    tacticId: 'TA0005',
    tacticName: 'Defense Evasion',
    description: 'Adversaries delete event logs or shell history (rm -f /var/log/*, Clear-EventLog) to conceal tracks.',
    detection: 'Alert on unexpected stops in syslog forwarding or sudden drops in log ingestion volume from active endpoints.',
    mitigation: 'Transmit logs in real-time to an immutable, write-once SIEM/data lake with restricted analyst access.',
    aptActors: ['APT38', 'Volt Typhoon'],
  },

  // Credential Access
  {
    id: 'T1110',
    name: 'Brute Force',
    tacticId: 'TA0006',
    tacticName: 'Credential Access',
    description: 'Adversaries systematically guess passwords or spray common credentials across multiple accounts.',
    detection: 'Cluster authentication failures by source IP and target account; flag when threshold exceeds 3 failures.',
    mitigation: 'Implement exponential account lockouts, CAPTCHAs, and IP reputation blocklists.',
    aptActors: ['APT28', 'Cozy Bear', 'FIN8'],
  },

  // Discovery
  {
    id: 'T1083',
    name: 'File and Directory Discovery',
    tacticId: 'TA0007',
    tacticName: 'Discovery',
    description: 'Adversaries enumerate files, directories, or path traversal sequences to locate sensitive assets or keys.',
    detection: 'Inspect web ingress for repeated /.. sequences, %2e%2e encoded characters, or queries targeting /etc/passwd.',
    mitigation: 'Canonicalize and sanitize all path inputs before filesystem calls; enforce strict chroot environments.',
    aptActors: ['FIN7', 'Volt Typhoon', 'APT39'],
  },

  // Lateral Movement
  {
    id: 'T1021.004',
    name: 'Remote Services: SSH',
    tacticId: 'TA0008',
    tacticName: 'Lateral Movement',
    description: 'Adversaries pivot across the internal network by establishing SSH sessions using compromised credentials or private keys.',
    detection: 'Track lateral SSH connections between internal non-bastion workstations and sensitive server subnets.',
    mitigation: 'Restrict SSH ingress with host-based firewalls and require hardware-backed SSH keys.',
    aptActors: ['Sandworm', 'Turla'],
  },

  // Command and Control
  {
    id: 'T1071',
    name: 'Application Layer Protocol',
    tacticId: 'TA0011',
    tacticName: 'Command and Control',
    description: 'Adversaries blend command and control traffic into standard protocols like HTTP, HTTPS, or DNS.',
    detection: 'Analyze network telemetry for beaconing periodicity, high entropy payloads, or unusual User-Agent headers.',
    mitigation: 'Deploy TLS inspection and deep packet inspection (DPI) at network egress inspection points.',
    aptActors: ['APT29', 'APT40', 'Lazarus Group'],
  },

  // Impact
  {
    id: 'T1499',
    name: 'Endpoint Denial of Service',
    tacticId: 'TA0040',
    tacticName: 'Impact',
    description: 'Adversaries degrade or crash target endpoints by flooding connection pools or exploiting algorithmic complexity.',
    detection: 'Monitor socket saturation, high CPU spikes under HTTP GET/POST flood, or persistent 504 Gateway Timeouts.',
    mitigation: 'Utilize upstream DDoS mitigation proxies (Cloudflare, AWS Shield) and connection rate limiters.',
    aptActors: ['Killnet', 'Anonymous Sudan'],
  },
];

interface MitreAttackMatrixProps {
  activeTechniqueIds?: string[];
  onSelectTechnique?: (techniqueId: string) => void;
}

export const MitreAttackMatrix: React.FC<MitreAttackMatrixProps> = ({
  activeTechniqueIds = [],
  onSelectTechnique,
}) => {
  const [selectedTechnique, setSelectedTechnique] = useState<MitreTechniqueDef | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Active technique normalization
  const activeSet = useMemo(() => {
    const set = new Set<string>();
    activeTechniqueIds.forEach(id => {
      set.add(id);
      // Also match base technique if sub-technique supplied (e.g. T1110.001 -> T1110)
      if (id.includes('.')) {
        set.add(id.split('.')[0]);
      }
    });
    return set;
  }, [activeTechniqueIds]);

  // Group techniques by tactic
  const matrixColumns = useMemo(() => {
    return ENTERPRISE_MITRE_TACTICS.map(tactic => {
      const techniques = CORE_TECHNIQUES.filter(t => t.tacticId === tactic.id);
      const activeCount = techniques.filter(t => activeSet.has(t.id)).length;
      return {
        tactic,
        techniques,
        activeCount,
      };
    });
  }, [activeSet]);

  const totalActiveTechniques = useMemo(() => {
    return CORE_TECHNIQUES.filter(t => activeSet.has(t.id)).length;
  }, [activeSet]);

  return (
    <div className="flex-1 w-full h-full flex flex-col overflow-hidden bg-[#000000] font-mono text-neutral-200">
      {/* 1. Header & Coverage Metrics */}
      <div className="p-3 bg-[#0a0a0a] border-b border-neutral-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-none bg-cyan-400" />
            <span className="text-neutral-400 font-bold uppercase">ENTERPRISE ATT&CK MATRIX:</span>
            <span className="text-white font-bold">14 TACTICS</span>
          </div>

          <div className="h-4 w-[1px] bg-neutral-800 hidden sm:block" />

          <div className="flex items-center gap-2 text-xs">
            <span className="text-neutral-400">DETECTED COVERAGE:</span>
            <span className="px-2 py-0.5 bg-rose-950 text-rose-300 border border-rose-800/80 font-bold">
              {totalActiveTechniques} ACTIVE INGRESS PATTERNS
            </span>
          </div>
        </div>

        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search technique or ID..."
            className="w-full pl-8 pr-3 py-1 bg-[#000000] border border-neutral-800 text-neutral-200 placeholder-neutral-600 text-xs focus:outline-none focus:border-neutral-600"
          />
        </div>
      </div>

      {/* 2. Full-Width Horizontal Scrolling Matrix Deck */}
      <div className="flex-1 overflow-x-auto overflow-y-auto p-3 bg-[#000000]">
        <div className="flex gap-2 min-w-max pb-4">
          {matrixColumns.map(({ tactic, techniques, activeCount }) => {
            const hasActive = activeCount > 0;

            return (
              <div
                key={tactic.id}
                className="w-48 flex flex-col shrink-0 border border-neutral-850 bg-[#050505]"
              >
                {/* Tactic Column Header */}
                <div className={`p-2 border-b border-neutral-800 flex items-center justify-between ${
                  hasActive ? 'bg-rose-950/30' : 'bg-[#0a0a0a]'
                }`}>
                  <div>
                    <div className="text-[10px] text-neutral-500 font-bold">
                      {tactic.id}
                    </div>
                    <div className="text-xs font-bold text-neutral-200 truncate" title={tactic.name}>
                      {tactic.shortName}
                    </div>
                  </div>
                  {hasActive && (
                    <span className="px-1.5 py-0.2 bg-rose-900/60 border border-rose-700 text-rose-300 text-[9px] font-bold">
                      {activeCount}
                    </span>
                  )}
                </div>

                {/* Techniques List */}
                <div className="p-1.5 space-y-1.5 flex-1">
                  {techniques.length === 0 ? (
                    <div className="p-3 text-[10px] text-neutral-600 text-center">
                      No mapped techniques
                    </div>
                  ) : (
                    techniques.map(tech => {
                      const isActive = activeSet.has(tech.id);
                      const matchesSearch = !searchQuery.trim() || 
                        tech.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        tech.name.toLowerCase().includes(searchQuery.toLowerCase());

                      if (!matchesSearch) return null;

                      return (
                        <div
                          key={tech.id}
                          onClick={() => {
                            setSelectedTechnique(tech);
                            if (onSelectTechnique) onSelectTechnique(tech.id);
                          }}
                          className={`p-2 border transition-all cursor-pointer ${
                            isActive
                              ? 'bg-rose-950/70 border-rose-600 shadow-[0_0_12px_rgba(225,29,72,0.2)] text-white'
                              : 'bg-[#000000] border-neutral-850 hover:border-neutral-700 text-neutral-300 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-[10px] font-bold ${isActive ? 'text-rose-300' : 'text-cyan-400'}`}>
                              {tech.id}
                            </span>
                            {isActive && (
                              <span className="w-2 h-2 rounded-none bg-rose-500 animate-pulse" />
                            )}
                          </div>
                          <div className="text-[11px] font-bold leading-tight">
                            {tech.name}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Technique Inspection Modal */}
      {selectedTechnique && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#0a0a0a] border border-neutral-800 p-5 font-mono text-neutral-200 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 bg-neutral-900 border border-neutral-800 text-cyan-400 font-bold">
                  {selectedTechnique.id}
                </span>
                <span className="text-sm font-bold text-white uppercase">
                  {selectedTechnique.name}
                </span>
              </div>
              <button
                onClick={() => setSelectedTechnique(null)}
                className="p-1 text-neutral-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="p-3 bg-[#000000] border border-neutral-850 space-y-1">
                <div className="text-[10px] text-neutral-500 uppercase font-bold">MITRE TACTIC:</div>
                <div className="text-neutral-300 font-bold">
                  {selectedTechnique.tacticName} ({selectedTechnique.tacticId})
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-[10px] text-neutral-500 uppercase font-bold">TECHNIQUE OVERVIEW:</div>
                <div className="p-2.5 bg-[#000000] border border-neutral-850 text-neutral-300 text-[11px] leading-relaxed">
                  {selectedTechnique.description}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-[10px] text-neutral-500 uppercase font-bold">DETECTION RATIONALE (SIGMA / SIEM):</div>
                <div className="p-2.5 bg-[#000000] border border-neutral-850 text-cyan-300 text-[11px] leading-relaxed">
                  {selectedTechnique.detection}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-[10px] text-neutral-500 uppercase font-bold">MITIGATION GUIDELINES:</div>
                <div className="p-2.5 bg-[#000000] border border-neutral-850 text-emerald-400 text-[11px] leading-relaxed">
                  {selectedTechnique.mitigation}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-[10px] text-neutral-500 uppercase font-bold">NOTABLE ADVERSARY USAGE:</div>
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {selectedTechnique.aptActors.map(actor => (
                    <span key={actor} className="px-2 py-0.5 bg-neutral-900 border border-neutral-800 text-neutral-300 text-[10px]">
                      {actor}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-neutral-800 flex justify-end">
              <button
                onClick={() => setSelectedTechnique(null)}
                className="px-4 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-xs font-bold transition-colors cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
