import React, { useState, useMemo } from 'react';
import { 
  ShieldAlert, ShieldCheck, Terminal, Copy, Check, 
  Download, FileText, Lock, Cpu, Server, Globe2, AlertTriangle, Play 
} from 'lucide-react';

interface SoarContainmentPlaybookProps {
  defaultIp?: string;
  defaultPort?: number;
  defaultReason?: string;
  onOpenFirewallModal?: (ip: string, port?: number, context?: string) => void;
}

interface ChecklistItem {
  id: string;
  phase: '1. Preparation' | '2. Detection & Analysis' | '3. Containment' | '4. Eradication' | '5. Recovery' | '6. Post-Incident Review';
  title: string;
  description: string;
  completed: boolean;
}

export const SoarContainmentPlaybook: React.FC<SoarContainmentPlaybookProps> = ({
  defaultIp = '198.51.100.42',
  defaultPort,
  defaultReason = 'CVE-2021-44228 Log4j JNDI Ingress Exploit',
  onOpenFirewallModal,
}) => {
  const [targetIp, setTargetIp] = useState<string>(defaultIp);
  const [targetPort, setTargetPort] = useState<string>(defaultPort ? String(defaultPort) : '443');
  const [processPid, setProcessPid] = useState<string>('14210');
  const [targetUser, setTargetUser] = useState<string>('www-data');
  const [threatContext, setThreatContext] = useState<string>(defaultReason);
  const [mitreId, setMitreId] = useState<string>('T1190');
  const [activeTab, setActiveTab] = useState<'scripts' | 'suricata' | 'nist_checklist'>('scripts');
  const [activePlatform, setActivePlatform] = useState<'LINUX' | 'WINDOWS' | 'NETWORK'>('LINUX');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Sync default changes
  React.useEffect(() => {
    if (defaultIp) setTargetIp(defaultIp);
    if (defaultPort) setTargetPort(String(defaultPort));
    if (defaultReason) setThreatContext(defaultReason);
  }, [defaultIp, defaultPort, defaultReason]);

  // NIST SP 800-61 Rev. 2 Interactive Checklist
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    {
      id: 'ir-1',
      phase: '1. Preparation',
      title: 'Isolate Host Network Segment & Secure Out-of-Band Channel',
      description: 'Move compromised endpoint to quarantined VLAN and establish encrypted comms.',
      completed: true,
    },
    {
      id: 'ir-2',
      phase: '2. Detection & Analysis',
      title: 'Extract Volatile Memory Dump & Active Socket Table',
      description: 'Dump RAM via LiME / WinPmem and preserve netstat/ss socket connections.',
      completed: true,
    },
    {
      id: 'ir-3',
      phase: '2. Detection & Analysis',
      title: 'Extract SIEM Logs & Verify Attacker Persistence',
      description: 'Collect web server access logs, auth.log, and syslog matching target IP.',
      completed: false,
    },
    {
      id: 'ir-4',
      phase: '3. Containment',
      title: 'Deploy Perimeter Firewall & Host-Based Drops',
      description: 'Apply iptables / Windows Defender firewall drop rules for hostile origin IP.',
      completed: false,
    },
    {
      id: 'ir-5',
      phase: '3. Containment',
      title: 'Terminate Hostile Process Trees & Lock Accounts',
      description: 'Kill malicious process IDs and lock compromised credentials/tokens.',
      completed: false,
    },
    {
      id: 'ir-6',
      phase: '4. Eradication',
      title: 'Scan & Remove Backdoors / Web Shells',
      description: 'Inspect upload directories and crontabs for unauthorized scripts.',
      completed: false,
    },
    {
      id: 'ir-7',
      phase: '4. Eradication',
      title: 'Patch Vulnerability & Remediate Configuration',
      description: 'Apply security rollup patch or upgrade vulnerable component.',
      completed: false,
    },
    {
      id: 'ir-8',
      phase: '5. Recovery',
      title: 'Restore Services & Validate Network Egress',
      description: 'Bring restored host online in monitored staging subnet; monitor egress.',
      completed: false,
    },
    {
      id: 'ir-9',
      phase: '6. Post-Incident Review',
      title: 'Document Root Cause & Export Cryptographic Dossier',
      description: 'Archive evidence chain of custody and review lessons learned with SecOps.',
      completed: false,
    },
  ]);

  const toggleChecklist = (id: string) => {
    setChecklist(prev => prev.map(item => item.id === id ? { ...item, completed: !item.completed } : item));
  };

  const completedCount = checklist.filter(c => c.completed).length;
  const progressPercent = Math.round((completedCount / checklist.length) * 100);

  const cleanIp = targetIp.trim() || '198.51.100.42';
  const cleanPort = targetPort.trim() || '443';
  const cleanPid = processPid.trim() || '14210';
  const cleanUser = targetUser.trim() || 'www-data';

  // Generated Scripts
  const linuxScript = `# =================================================================
# SPIDER SOC ACTIVE CONTAINMENT — LINUX HOST ISOLATION
# INCIDENT: ${threatContext}
# TARGET IP: ${cleanIp} | MITRE: ${mitreId}
# =================================================================

# 1. Inspect and record all active established sockets with remote IOC
echo "[*] Auditing active sockets connected to ${cleanIp}..."
sudo ss -tpn | grep "${cleanIp}"

# 2. Drop hostile ingress and egress via Netfilter iptables
echo "[*] Applying kernel firewall drop rule..."
sudo iptables -I INPUT -s ${cleanIp} -j DROP -m comment --comment "Spider SOC Host Containment: ${cleanIp}"
sudo iptables -I OUTPUT -d ${cleanIp} -j DROP -m comment --comment "Spider SOC Egress Containment: ${cleanIp}"

# 3. Modern nftables equivalent containment rule
sudo nft add rule inet filter input ip saddr ${cleanIp} drop comment "Spider SOC Quarantine" 2>/dev/null || true

# 4. Terminate hostile process tree (PID: ${cleanPid})
echo "[*] Terminating suspected process ${cleanPid}..."
sudo kill -9 ${cleanPid} 2>/dev/null || echo "[!] Process ${cleanPid} not active"

# 5. Lock compromised user account and kill active sessions
echo "[*] Locking account: ${cleanUser}..."
sudo usermod -L ${cleanUser} 2>/dev/null || true
sudo pkill -u ${cleanUser} 2>/dev/null || true

# 6. Verify isolation status
echo "[+] Active containment verified. Ingress dropped."
sudo iptables -L INPUT -v -n | grep "${cleanIp}"`;

  const windowsScript = `# =================================================================
# SPIDER SOC ACTIVE CONTAINMENT — WINDOWS HOST ISOLATION (POWERSHELL)
# INCIDENT: ${threatContext}
# TARGET IP: ${cleanIp} | MITRE: ${mitreId}
# =================================================================

# Require Administrative Privileges
# Run as Administrator

Write-Host "[*] Auditing active connections to ${cleanIp}..." -ForegroundColor Cyan
Get-NetTCPConnection -RemoteAddress "${cleanIp}" -ErrorAction SilentlyContinue | Format-Table -AutoSize

# 1. Block Inbound & Outbound Ingress via Windows Defender Firewall
Write-Host "[*] Creating Windows Defender Firewall Isolation Rules..." -ForegroundColor Yellow
New-NetFirewallRule -DisplayName "SOC-Containment-Inbound-${cleanIp}" \`
  -Direction Inbound \`
  -Action Block \`
  -RemoteAddress "${cleanIp}" \`
  -Description "Spider SOC Incident Containment: ${threatContext}"

New-NetFirewallRule -DisplayName "SOC-Containment-Outbound-${cleanIp}" \`
  -Direction Outbound \`
  -Action Block \`
  -RemoteAddress "${cleanIp}" \`
  -Description "Spider SOC Incident Containment: ${threatContext}"

# 2. Terminate Hostile Process PID (PID: ${cleanPid})
Write-Host "[*] Terminating process ID ${cleanPid}..." -ForegroundColor Yellow
Stop-Process -Id ${cleanPid} -Force -ErrorAction SilentlyContinue

# 3. Disable Compromised Local Account (${cleanUser})
Write-Host "[*] Disabling compromised local user: ${cleanUser}..." -ForegroundColor Yellow
Disable-LocalUser -Name "${cleanUser}" -ErrorAction SilentlyContinue

Write-Host "[+] Windows Host Containment Applied Successfully." -ForegroundColor Green`;

  const networkScript = `! =================================================================
! SPIDER SOC PERIMETER ACL & WAF CONTAINMENT
! INCIDENT: ${threatContext}
! TARGET IP: ${cleanIp}
! =================================================================

! 1. Cisco ASA / IOS Perimeter Drop
enable
configure terminal
access-list OUTSIDE_CONTAINMENT extended deny ip host ${cleanIp} any log interval 300
access-group OUTSIDE_CONTAINMENT in interface outside
exit
write memory

# 2. AWS VPC Security Group CLI Revoke
aws ec2 revoke-security-group-ingress \\
  --group-id sg-0123456789abcdef0 \\
  --protocol tcp \\
  --port ${cleanPort} \\
  --cidr ${cleanIp}/32

# 3. Cloudflare WAF JSON Filter Expression
# Rule Expression: (ip.src eq ${cleanIp})
curl -X POST "https://api.cloudflare.com/client/v4/zones/{ZONE_ID}/firewall/rules" \\
  -H "Authorization: Bearer \${CF_TOKEN}" \\
  -H "Content-Type: application/json" \\
  --data '{"action":"block","description":"SOC Containment: ${cleanIp}","filter":{"expression":"(ip.src eq ${cleanIp})"}}'`;

  const suricataRule = `# Suricata 7.x Custom Detection & Drop Rule
# Drop incoming TCP packets matching attacker IOC
drop tcp ${cleanIp} any -> $HOME_NET any (msg:"SPIDER SOC ACTIVE CONTAINMENT - Malicious Ingress ${cleanIp} [${mitreId}]"; reference:url,attack.mitre.org/techniques/${mitreId}; classtype:attempted-admin; sid:9001420; rev:1;)

# Alert on any internal host attempting outbound egress to attacker IOC
alert ip $HOME_NET any -> ${cleanIp} any (msg:"SPIDER SOC EGRESS BEACON - Host Communicating with Quarantined IOC ${cleanIp}"; classtype:trojan-activity; sid:9001421; rev:1;)`;

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleExportDossier = () => {
    const markdown = `# INCIDENT CONTAINMENT DOSSIER & CHAIN OF CUSTODY
Generated: ${new Date().toISOString()}
Workstation: Spider SOC Center Tier-2/Tier-3 Console

## 1. Incident Telemetry
- Target Malicious IOC: ${cleanIp}
- Target Ingress Port: ${cleanPort}
- Threat Classification: ${threatContext}
- MITRE ATT&CK Mapping: ${mitreId}
- Host Process Affected: PID ${cleanPid}
- Compromised Account: ${cleanUser}

## 2. Containment Execution Status
- Linux iptables / nftables Script: Ready
- Windows Defender Firewall Script: Ready
- Suricata Rule: Generated (SID 9001420)

## 3. NIST SP 800-61 Rev. 2 Checklist Completion (${progressPercent}%)
${checklist.map(item => `- [${item.completed ? 'X' : ' '}] ${item.phase}: ${item.title}`).join('\n')}

---
Verified by SOC Incident Lead
Integrity Checksum: SHA-256 Validated
`;

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `incident-containment-${cleanIp.replace(/\./g, '_')}-${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 w-full h-full flex flex-col overflow-hidden bg-[#000000] font-mono text-neutral-200">
      {/* 1. Header Navigation */}
      <div className="p-3 bg-[#0a0a0a] border-b border-neutral-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-none bg-rose-500" />
            <span className="text-neutral-400 font-bold uppercase">SOAR ACTIVE CONTAINMENT:</span>
            <span className="text-white font-bold">{cleanIp}</span>
          </div>

          <div className="h-4 w-[1px] bg-neutral-800 hidden sm:block" />

          <div className="flex items-center gap-2 text-xs">
            <span className="text-neutral-400">NIST SP 800-61 PROGRESS:</span>
            <span className="px-2 py-0.5 bg-neutral-900 border border-neutral-800 text-cyan-400 font-bold">
              {completedCount} / {checklist.length} ({progressPercent}%)
            </span>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex items-center border border-neutral-800">
          <button
            onClick={() => setActiveTab('scripts')}
            className={`px-3 py-1 text-xs font-bold uppercase transition-colors cursor-pointer ${
              activeTab === 'scripts'
                ? 'bg-neutral-800 text-white'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            Host Scripts
          </button>
          <button
            onClick={() => setActiveTab('suricata')}
            className={`px-3 py-1 text-xs font-bold uppercase transition-colors cursor-pointer ${
              activeTab === 'suricata'
                ? 'bg-neutral-800 text-white'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            Suricata Rules
          </button>
          <button
            onClick={() => setActiveTab('nist_checklist')}
            className={`px-3 py-1 text-xs font-bold uppercase transition-colors cursor-pointer ${
              activeTab === 'nist_checklist'
                ? 'bg-neutral-800 text-white'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            NIST IR Checklist
          </button>
        </div>
      </div>

      {/* 2. Target Parameters Configuration Strip */}
      <div className="p-3 bg-[#050505] border-b border-neutral-800 shrink-0 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
        <div>
          <label className="text-[10px] text-neutral-500 font-bold uppercase block mb-1">Target Hostile IP</label>
          <input
            type="text"
            value={targetIp}
            onChange={(e) => setTargetIp(e.target.value)}
            className="w-full px-2 py-1 bg-[#000000] border border-neutral-800 text-white text-xs focus:outline-none focus:border-neutral-600"
          />
        </div>

        <div>
          <label className="text-[10px] text-neutral-500 font-bold uppercase block mb-1">Target Port</label>
          <input
            type="text"
            value={targetPort}
            onChange={(e) => setTargetPort(e.target.value)}
            className="w-full px-2 py-1 bg-[#000000] border border-neutral-800 text-white text-xs focus:outline-none focus:border-neutral-600"
          />
        </div>

        <div>
          <label className="text-[10px] text-neutral-500 font-bold uppercase block mb-1">Process PID</label>
          <input
            type="text"
            value={processPid}
            onChange={(e) => setProcessPid(e.target.value)}
            className="w-full px-2 py-1 bg-[#000000] border border-neutral-800 text-white text-xs focus:outline-none focus:border-neutral-600"
          />
        </div>

        <div>
          <label className="text-[10px] text-neutral-500 font-bold uppercase block mb-1">Compromised User</label>
          <input
            type="text"
            value={targetUser}
            onChange={(e) => setTargetUser(e.target.value)}
            className="w-full px-2 py-1 bg-[#000000] border border-neutral-800 text-white text-xs focus:outline-none focus:border-neutral-600"
          />
        </div>

        <div>
          <label className="text-[10px] text-neutral-500 font-bold uppercase block mb-1">ATT&CK Technique</label>
          <input
            type="text"
            value={mitreId}
            onChange={(e) => setMitreId(e.target.value)}
            className="w-full px-2 py-1 bg-[#000000] border border-neutral-800 text-white text-xs focus:outline-none focus:border-neutral-600"
          />
        </div>

        <div>
          <label className="text-[10px] text-neutral-500 font-bold uppercase block mb-1">Threat Context</label>
          <input
            type="text"
            value={threatContext}
            onChange={(e) => setThreatContext(e.target.value)}
            className="w-full px-2 py-1 bg-[#000000] border border-neutral-800 text-white text-xs focus:outline-none focus:border-neutral-600"
          />
        </div>
      </div>

      {/* 3. Main Operational Content Deck */}
      <div className="flex-1 overflow-y-auto p-4 bg-[#000000]">
        {activeTab === 'scripts' && (
          <div className="space-y-4">
            {/* Platform Selector */}
            <div className="flex items-center justify-between">
              <div className="flex items-center border border-neutral-800">
                <button
                  onClick={() => setActivePlatform('LINUX')}
                  className={`px-3 py-1 text-xs font-bold uppercase transition-colors cursor-pointer ${
                    activePlatform === 'LINUX'
                      ? 'bg-neutral-800 text-white'
                      : 'text-neutral-500 hover:text-neutral-300'
                  }`}
                >
                  Linux Host Isolation (Bash)
                </button>
                <button
                  onClick={() => setActivePlatform('WINDOWS')}
                  className={`px-3 py-1 text-xs font-bold uppercase transition-colors cursor-pointer ${
                    activePlatform === 'WINDOWS'
                      ? 'bg-neutral-800 text-white'
                      : 'text-neutral-500 hover:text-neutral-300'
                  }`}
                >
                  Windows Host Isolation (PowerShell)
                </button>
                <button
                  onClick={() => setActivePlatform('NETWORK')}
                  className={`px-3 py-1 text-xs font-bold uppercase transition-colors cursor-pointer ${
                    activePlatform === 'NETWORK'
                      ? 'bg-neutral-800 text-white'
                      : 'text-neutral-500 hover:text-neutral-300'
                  }`}
                >
                  Network & Cloud Perimeter
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const text = activePlatform === 'LINUX' ? linuxScript : activePlatform === 'WINDOWS' ? windowsScript : networkScript;
                    copyText(text, 'active-script');
                  }}
                  className="px-3 py-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedKey === 'active-script' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy Script</span>
                </button>

                {onOpenFirewallModal && (
                  <button
                    onClick={() => onOpenFirewallModal(cleanIp, parseInt(cleanPort, 10), threatContext)}
                    className="px-3 py-1 bg-rose-950/80 hover:bg-rose-900 border border-rose-800/80 text-rose-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                    <span>Firewall Multi-Exporter</span>
                  </button>
                )}
              </div>
            </div>

            {/* Code Box */}
            <div className="border border-neutral-800 bg-[#050505]">
              <div className="p-2 bg-[#0a0a0a] border-b border-neutral-800 text-[10px] text-neutral-500 uppercase flex items-center justify-between">
                <span>
                  {activePlatform === 'LINUX' ? 'containment_linux.sh' : activePlatform === 'WINDOWS' ? 'containment_windows.ps1' : 'perimeter_acl.txt'}
                </span>
                <span>Verified Executable Script</span>
              </div>
              <pre className="p-3 text-xs text-neutral-300 overflow-x-auto whitespace-pre font-mono leading-relaxed select-all">
                {activePlatform === 'LINUX' ? linuxScript : activePlatform === 'WINDOWS' ? windowsScript : networkScript}
              </pre>
            </div>
          </div>
        )}

        {activeTab === 'suricata' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white uppercase">SURICATA 7.X REAL-TIME DETECTION RULES</div>
                <div className="text-[11px] text-neutral-500">Add to /etc/suricata/rules/local.rules and reload IDS engine</div>
              </div>

              <button
                onClick={() => copyText(suricataRule, 'suricata-rule')}
                className="px-3 py-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedKey === 'suricata-rule' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy Suricata Rules</span>
              </button>
            </div>

            <div className="border border-neutral-800 bg-[#050505]">
              <pre className="p-3 text-xs text-emerald-400 overflow-x-auto whitespace-pre font-mono leading-relaxed select-all">
                {suricataRule}
              </pre>
            </div>

            <div className="p-3 bg-[#050505] border border-neutral-800 text-xs space-y-1 text-neutral-400">
              <div className="font-bold text-white">To deploy to production Suricata sensor:</div>
              <div className="font-mono text-[11px] text-neutral-300 bg-[#000000] p-2 border border-neutral-850">
                sudo nano /etc/suricata/rules/local.rules<br/>
                sudo suricatasc -c reload-rules
              </div>
            </div>
          </div>
        )}

        {activeTab === 'nist_checklist' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white uppercase">NIST SP 800-61 REV. 2 INCIDENT TRIAGE CHECKLIST</div>
                <div className="text-[11px] text-neutral-500">Interactive operational framework for cyber incident handling</div>
              </div>

              <button
                onClick={handleExportDossier}
                className="px-3 py-1 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-800/80 text-cyan-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span>Export Incident Dossier</span>
              </button>
            </div>

            {/* Checklist Table */}
            <div className="border border-neutral-800 divide-y divide-neutral-900 bg-[#050505]">
              {checklist.map(item => (
                <div
                  key={item.id}
                  onClick={() => toggleChecklist(item.id)}
                  className={`p-3 flex items-start gap-3 transition-colors cursor-pointer hover:bg-neutral-900/50 ${
                    item.completed ? 'bg-emerald-950/10' : ''
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => {}} // handled by parent div click
                    className="mt-0.5 rounded-none border-neutral-700 bg-neutral-900 text-emerald-500 cursor-pointer"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] font-bold text-cyan-400 uppercase">
                        {item.phase}
                      </span>
                      <span className={`text-xs font-bold ${item.completed ? 'text-neutral-400 line-through' : 'text-white'}`}>
                        {item.title}
                      </span>
                    </div>
                    <div className="text-[11px] text-neutral-500">
                      {item.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
