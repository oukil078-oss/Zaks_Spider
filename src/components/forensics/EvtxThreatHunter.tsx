import React, { useState, useMemo } from 'react';
import { 
  ShieldAlert, AlertTriangle, Search, Terminal, 
  Layers, Clock, Copy, Check, Filter, ShieldCheck, 
  Flame, CheckCircle2, ChevronRight, FileCode, UserCheck
} from 'lucide-react';

export interface WindowsEventLogRecord {
  recordId: number;
  eventId: number;
  provider: 'Microsoft-Windows-Security-Auditing' | 'Microsoft-Windows-Sysmon' | 'Service Control Manager';
  channel: 'Security' | 'System' | 'Sysmon/Operational';
  timestamp: string;
  computer: string;
  user: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'INFO';
  title: string;
  description: string;
  mitreTechnique: string;
  sigmaRuleMatched?: string;
  eventData: Record<string, string>;
}

export interface SigmaRuleDef {
  id: string;
  title: string;
  status: 'STABLE';
  mitre: string;
  description: string;
  detectionCondition: string;
}

export const SIGMA_RULES: SigmaRuleDef[] = [
  {
    id: 'sigma-win-001',
    title: 'Encoded PowerShell Command Execution',
    status: 'STABLE',
    mitre: 'T1059.001 (Command and Scripting Interpreter: PowerShell)',
    description: 'Detects execution of powershell.exe with -enc, -encodedcommand, or -e flags often used to conceal malicious payload scripts.',
    detectionCondition: 'CommandLine|contains: [" -enc ", " -encodedcommand ", " -e "]',
  },
  {
    id: 'sigma-win-002',
    title: 'Volume Shadow Copy Deletion via Vssadmin',
    status: 'STABLE',
    mitre: 'T1490 (Inhibit System Recovery)',
    description: 'Detects execution of vssadmin or wmic commands intended to purge volume shadow copies prior to ransomware encryption.',
    detectionCondition: 'Image|endswith: "vssadmin.exe" AND CommandLine|contains: "delete shadows"',
  },
  {
    id: 'sigma-win-003',
    title: 'Security Audit Log Cleared (Anti-Forensics)',
    status: 'STABLE',
    mitre: 'T1070.001 (Indicator Removal: Clear Windows Event Logs)',
    description: 'Detects Event ID 1102 or 104 signifying that the security log was intentionally cleared by a local administrator or malware.',
    detectionCondition: 'EventID in [1102, 104]',
  },
  {
    id: 'sigma-win-004',
    title: 'Suspicious Service Installation in Non-Standard Path',
    status: 'STABLE',
    mitre: 'T1543.003 (Create or Modify System Process: Windows Service)',
    description: 'Detects Event 7045 where binary path is located in %TEMP%, C:\Users\Public, or AppData directory.',
    detectionCondition: 'ImagePath|contains: ["\\Users\\Public\\", "\\AppData\\", "\\Temp\\"]',
  },
];

export const INITIAL_EVTX_LOGS: WindowsEventLogRecord[] = [
  {
    recordId: 48912,
    eventId: 1102,
    provider: 'Microsoft-Windows-Security-Auditing',
    channel: 'Security',
    timestamp: '2026-09-11 13:58:02 UTC',
    computer: 'CORP-DC01.corp.internal',
    user: 'CORP\\admin_temp',
    severity: 'CRITICAL',
    title: 'The audit log was cleared',
    description: 'The security event audit log was wiped. This action is typical of advanced threat actors attempting to eradicate incident response traces.',
    mitreTechnique: 'T1070.001 (Clear Windows Event Logs)',
    sigmaRuleMatched: 'sigma-win-003 (Security Audit Log Cleared)',
    eventData: {
      SubjectUserSid: 'S-1-5-21-28491024-918239-1002',
      SubjectUserName: 'admin_temp',
      SubjectDomainName: 'CORP',
      SubjectLogonId: '0x3e7',
    },
  },
  {
    recordId: 48911,
    eventId: 4688,
    provider: 'Microsoft-Windows-Security-Auditing',
    channel: 'Security',
    timestamp: '2026-09-11 13:54:19 UTC',
    computer: 'CORP-DC01.corp.internal',
    user: 'NT AUTHORITY\\SYSTEM',
    severity: 'CRITICAL',
    title: 'A new process has been created: vssadmin.exe',
    description: 'Command line execution attempting to purge shadow copy snapshots before encrypting network volumes.',
    mitreTechnique: 'T1490 (Inhibit System Recovery)',
    sigmaRuleMatched: 'sigma-win-002 (Volume Shadow Copy Deletion via Vssadmin)',
    eventData: {
      NewProcessId: '0x814',
      NewProcessName: 'C:\\Windows\\System32\\vssadmin.exe',
      CommandLine: 'vssadmin.exe delete shadows /all /quiet',
      ParentProcessName: 'C:\\Windows\\System32\\cmd.exe',
      ParentProcessId: '0x594',
    },
  },
  {
    recordId: 48910,
    eventId: 7045,
    provider: 'Service Control Manager',
    channel: 'System',
    timestamp: '2026-09-11 13:48:45 UTC',
    computer: 'CORP-DC01.corp.internal',
    user: 'NT AUTHORITY\\SYSTEM',
    severity: 'HIGH',
    title: 'A service was installed in the system: svc_updater_payload',
    description: 'New Windows service binary registered pointing to an anomalous untrusted directory in C:\Users\Public.',
    mitreTechnique: 'T1543.003 (Windows Service Persistence)',
    sigmaRuleMatched: 'sigma-win-004 (Suspicious Service Installation)',
    eventData: {
      ServiceName: 'svc_updater_payload',
      ImagePath: 'C:\\Users\\Public\\Libraries\\svchost_stub.exe -service',
      ServiceType: 'user mode service',
      StartType: 'auto start',
      AccountName: 'LocalSystem',
    },
  },
  {
    recordId: 48909,
    eventId: 4688,
    provider: 'Microsoft-Windows-Security-Auditing',
    channel: 'Security',
    timestamp: '2026-09-11 13:41:10 UTC',
    computer: 'FINANCE-W10.corp.internal',
    user: 'CORP\\contractor_svc',
    severity: 'HIGH',
    title: 'A new process has been created: powershell.exe',
    description: 'Obfuscated PowerShell invocation with -enc parameter executing stage-2 payload.',
    mitreTechnique: 'T1059.001 (PowerShell Command Execution)',
    sigmaRuleMatched: 'sigma-win-001 (Encoded PowerShell Command Execution)',
    eventData: {
      NewProcessId: '0x7fc',
      NewProcessName: 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe',
      CommandLine: 'powershell.exe -nop -w hidden -enc JABjAGwAaQBlAG4AdAAgAD0AIABOAGUAdwAtAE8AYgBqAGUAYwB0AA==',
      ParentProcessName: 'C:\\Windows\\System32\\svchost.exe',
      ParentProcessId: '0x594',
    },
  },
  {
    recordId: 48908,
    eventId: 4624,
    provider: 'Microsoft-Windows-Security-Auditing',
    channel: 'Security',
    timestamp: '2026-09-11 13:35:55 UTC',
    computer: 'CORP-DC01.corp.internal',
    user: 'CORP\\contractor_svc',
    severity: 'MEDIUM',
    title: 'An account was successfully logged on (Logon Type 10 - RDP)',
    description: 'Remote Desktop Protocol interactive session established from foreign pivot workstation IP 198.51.100.42.',
    mitreTechnique: 'T1078.002 (Valid Accounts: Domain Accounts)',
    eventData: {
      LogonType: '10 (RemoteInteractive / RDP)',
      IpAddress: '198.51.100.42',
      IpPort: '49812',
      WorkstationName: 'EXTERNAL-RELAY',
      TargetUserName: 'contractor_svc',
      AuthenticationPackage: 'Negotiate',
    },
  },
  {
    recordId: 48907,
    eventId: 4625,
    provider: 'Microsoft-Windows-Security-Auditing',
    channel: 'Security',
    timestamp: '2026-09-11 13:30:12 UTC',
    computer: 'CORP-DC01.corp.internal',
    user: 'CORP\\contractor_svc',
    severity: 'MEDIUM',
    title: 'An account failed to log on (Bad Password)',
    description: 'Logon attempt failed with SubStatus 0xC000006A (STATUS_WRONG_PASSWORD) during dictionary burst.',
    mitreTechnique: 'T1110.001 (Brute Force: Password Guessing)',
    eventData: {
      FailureReason: '%%2313 (Unknown user name or bad password)',
      SubStatus: '0xc000006a',
      IpAddress: '198.51.100.42',
      TargetUserName: 'contractor_svc',
    },
  },
];

export const EvtxThreatHunter: React.FC = () => {
  const [logs] = useState<WindowsEventLogRecord[]>(INITIAL_EVTX_LOGS);
  const [selectedRecord, setSelectedRecord] = useState<WindowsEventLogRecord>(INITIAL_EVTX_LOGS[0]);
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [eventIdFilter, setEventIdFilter] = useState<string>('ALL');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [copiedText, setCopiedText] = useState<boolean>(false);

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      if (severityFilter !== 'ALL' && log.severity !== severityFilter) return false;
      if (eventIdFilter !== 'ALL' && log.eventId.toString() !== eventIdFilter) return false;
      if (!searchFilter.trim()) return true;
      const q = searchFilter.toLowerCase();
      return (
        log.computer.toLowerCase().includes(q) ||
        log.user.toLowerCase().includes(q) ||
        log.title.toLowerCase().includes(q) ||
        log.eventId.toString().includes(q) ||
        log.description.toLowerCase().includes(q)
      );
    });
  }, [logs, severityFilter, eventIdFilter, searchFilter]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  return (
    <div className="flex flex-col h-full w-full bg-black text-neutral-100 font-mono select-none overflow-hidden">
      {/* Top Threat Hunting Banner */}
      <div className="p-3 bg-neutral-950 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-neutral-900 border border-neutral-700 text-rose-400">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-100">
                WINDOWS EVENT LOG (EVTX) THREAT HUNTER & SIGMA RULE ENGINE
              </span>
              <span className="px-1.5 py-0.2 text-[9px] bg-rose-950/80 border border-rose-600 text-rose-300">
                AUDIT LOGS
              </span>
            </div>
            <div className="text-[10px] text-neutral-400 flex items-center gap-2">
              <span>EVENTS INGESTED: {logs.length}</span>
              <span>•</span>
              <span className="text-rose-400 font-bold">CRITICAL ALERTS: {logs.filter(l => l.severity === 'CRITICAL').length}</span>
              <span>•</span>
              <span className="text-cyan-400">ACTIVE SIGMA RULES: {SIGMA_RULES.length}</span>
            </div>
          </div>
        </div>

        {/* Quick Filter Counters */}
        <div className="flex items-center gap-1.5 text-xs">
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-2 py-0.5 text-[10px] font-bold border transition-all cursor-pointer ${
                severityFilter === sev
                  ? 'bg-neutral-800 text-cyan-300 border-cyan-500'
                  : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Filter and Search Ribbon */}
      <div className="px-3 py-1.5 bg-black border-b border-neutral-800 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-neutral-500 uppercase font-bold">EVENT ID:</span>
          <select
            value={eventIdFilter}
            onChange={(e) => setEventIdFilter(e.target.value)}
            className="bg-neutral-950 border border-neutral-800 text-neutral-300 text-xs px-2 py-0.5 focus:outline-none focus:border-cyan-500 font-mono"
          >
            <option value="ALL">ALL EVENT IDS</option>
            <option value="1102">1102 (Log Cleared)</option>
            <option value="4688">4688 (Process Created)</option>
            <option value="7045">7045 (Service Installed)</option>
            <option value="4624">4624 (Logon Success)</option>
            <option value="4625">4625 (Logon Failed)</option>
          </select>
        </div>

        <div className="relative w-64">
          <Search className="w-3 h-3 text-neutral-500 absolute left-2 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search Event, CLI, Host, User..."
            className="w-full pl-7 pr-2 py-0.5 bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-cyan-500 font-mono placeholder:text-neutral-600"
          />
        </div>
      </div>

      {/* Main Grid: Left Event Table / Right Detailed Event XML Inspector */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Event Stream Table */}
        <div className="flex-1 flex flex-col border-r border-neutral-800 overflow-y-auto">
          <table className="w-full text-left text-xs border-collapse font-mono">
            <thead>
              <tr className="bg-neutral-950 text-neutral-400 border-b border-neutral-800 text-[10px] uppercase">
                <th className="p-2 w-20">EVENT ID</th>
                <th className="p-2 w-32">TIME (UTC)</th>
                <th className="p-2 w-20">SEVERITY</th>
                <th className="p-2 w-36">COMPUTER / USER</th>
                <th className="p-2">EVENT TITLE & SIGMA DETECTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-900">
              {filteredLogs.map((log) => {
                const isSelected = selectedRecord.recordId === log.recordId;
                return (
                  <tr
                    key={log.recordId}
                    onClick={() => setSelectedRecord(log)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-neutral-900 text-cyan-300 font-bold border-l-2 border-cyan-400'
                        : log.severity === 'CRITICAL'
                        ? 'bg-rose-950/20 text-rose-200 hover:bg-rose-950/30'
                        : 'text-neutral-300 hover:bg-neutral-950'
                    }`}
                  >
                    <td className="p-2 font-bold text-cyan-400">
                      #{log.eventId}
                    </td>
                    <td className="p-2 text-neutral-400 text-[10px] whitespace-nowrap">
                      {log.timestamp.split(' ')[1]}
                    </td>
                    <td className="p-2">
                      <span className={`px-1.5 py-0.2 text-[9px] border font-bold ${
                        log.severity === 'CRITICAL' ? 'bg-rose-950 text-rose-300 border-rose-600' :
                        log.severity === 'HIGH' ? 'bg-amber-950 text-amber-300 border-amber-600' :
                        'bg-blue-950 text-blue-300 border-blue-700'
                      }`}>
                        {log.severity}
                      </span>
                    </td>
                    <td className="p-2 whitespace-nowrap text-[10px]">
                      <div className="text-neutral-200 font-bold">{log.computer.split('.')[0]}</div>
                      <div className="text-neutral-500">{log.user}</div>
                    </td>
                    <td className="p-2 text-[11px]">
                      <div className="font-bold truncate">{log.title}</div>
                      {log.sigmaRuleMatched && (
                        <div className="text-[9px] text-rose-400 font-mono flex items-center gap-1 mt-0.5">
                          <span>⚡ SIGMA:</span>
                          <span className="underline">{log.sigmaRuleMatched}</span>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Right: Deep Event Record Inspector */}
        <div className="w-96 bg-neutral-950 flex flex-col overflow-y-auto p-3 space-y-3 shrink-0">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <div className="flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold uppercase text-neutral-200">EVTX EVENT INSPECTOR</span>
            </div>
            <span className="text-[10px] text-neutral-500 font-mono">RECORD #{selectedRecord.recordId}</span>
          </div>

          {/* Severity & MITRE ATT&CK Pill */}
          <div className="p-2.5 bg-neutral-900 border border-neutral-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className={`px-1.5 py-0.2 text-[10px] font-bold border ${
                selectedRecord.severity === 'CRITICAL' ? 'bg-rose-950 text-rose-300 border-rose-600' :
                selectedRecord.severity === 'HIGH' ? 'bg-amber-950 text-amber-300 border-amber-600' :
                'bg-blue-950 text-blue-300 border-blue-700'
              }`}>
                {selectedRecord.severity} SEVERITY
              </span>
              <span className="text-[10px] text-neutral-400">{selectedRecord.channel} CHANNEL</span>
            </div>

            <div className="text-xs font-bold text-neutral-100">{selectedRecord.title}</div>
            <p className="text-[11px] text-neutral-400 leading-relaxed">{selectedRecord.description}</p>

            <div className="pt-1 text-[10px] text-rose-400 font-bold">
              MITRE: {selectedRecord.mitreTechnique}
            </div>
          </div>

          {/* Structured Event Data Fields */}
          <div className="space-y-1">
            <div className="text-[10px] text-neutral-500 uppercase font-bold">Event Parameter Data:</div>
            <div className="space-y-1">
              {Object.entries(selectedRecord.eventData).map(([k, v]) => (
                <div key={k} className="p-2 bg-black border border-neutral-900 text-xs">
                  <div className="text-[9px] text-neutral-500 font-bold uppercase">{k}</div>
                  <div className="text-cyan-300 break-all select-all font-mono text-[11px] mt-0.5">{v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Sigma Rule Details if matched */}
          {selectedRecord.sigmaRuleMatched && (() => {
            const rule = SIGMA_RULES.find(r => selectedRecord.sigmaRuleMatched?.includes(r.id));
            if (!rule) return null;
            return (
              <div className="p-2.5 bg-rose-950/20 border border-rose-700 text-xs space-y-1">
                <div className="font-bold text-rose-400 flex items-center gap-1 text-[11px]">
                  <span>⚡ MATCHED SIGMA RULE:</span>
                  <span>{rule.title}</span>
                </div>
                <div className="text-[10px] text-neutral-400">{rule.description}</div>
                <div className="p-1.5 bg-black border border-rose-900 text-[9px] text-rose-300 font-mono">
                  {rule.detectionCondition}
                </div>
              </div>
            );
          })()}

          {/* Actions */}
          <div className="pt-2 border-t border-neutral-800">
            <button
              onClick={() => handleCopy(JSON.stringify(selectedRecord, null, 2))}
              className="w-full py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedText ? 'COPIED EVENT JSON' : 'COPY EVENT JSON'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
