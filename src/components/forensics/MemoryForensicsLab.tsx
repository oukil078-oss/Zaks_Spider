import React, { useState, useMemo } from 'react';
import { 
  Cpu, ShieldAlert, AlertTriangle, Search, Terminal, 
  Wifi, FileCode, CheckCircle2, ChevronRight, ChevronDown, 
  Copy, Check, ExternalLink, RefreshCw, Eye, ArrowUpRight
} from 'lucide-react';

export interface ForensicProcess {
  pid: number;
  ppid: number;
  name: string;
  path: string;
  commandLine: string;
  user: string;
  threads: number;
  handles: number;
  isSuspicious?: boolean;
  anomalyReason?: string;
  mitreTechnique?: string;
  injectedSegments?: {
    virtualAddress: string;
    sizeKb: number;
    protection: string;
    tag: string;
    hexdumpPreview: string;
  }[];
  sockets?: {
    protocol: 'TCP' | 'UDP';
    localAddress: string;
    foreignAddress: string;
    state: string;
  }[];
}

export interface MemoryIncidentPreset {
  id: string;
  name: string;
  targetOs: string;
  dumpSize: string;
  capturedAt: string;
  incidentType: string;
  summary: string;
  processes: ForensicProcess[];
}

export const MEMORY_INCIDENT_PRESETS: MemoryIncidentPreset[] = [
  {
    id: 'cobalt-strike-dc01',
    name: 'CORP-DC01 Cobalt Strike Beacon Injection',
    targetOs: 'Windows Server 2022 x64 (Build 20348)',
    dumpSize: '16.0 GB RAW',
    capturedAt: '2026-09-11 11:42:09 UTC',
    incidentType: 'Process Injection (T1055.001) & C2 Beaconing',
    summary: 'Cobalt Strike Beacon reflective DLL injected into svchost.exe memory segment with PAGE_EXECUTE_READWRITE permissions, beaconing to 198.51.100.42:443.',
    processes: [
      {
        pid: 4,
        ppid: 0,
        name: 'System',
        path: 'ntoskrnl.exe',
        commandLine: '',
        user: 'NT AUTHORITY\\SYSTEM',
        threads: 248,
        handles: 1892,
      },
      {
        pid: 92,
        ppid: 4,
        name: 'smss.exe',
        path: 'C:\\Windows\\System32\\smss.exe',
        commandLine: '\\SystemRoot\\System32\\smss.exe',
        user: 'NT AUTHORITY\\SYSTEM',
        threads: 4,
        handles: 82,
      },
      {
        pid: 580,
        ppid: 92,
        name: 'csrss.exe',
        path: 'C:\\Windows\\System32\\csrss.exe',
        commandLine: '%SystemRoot%\\System32\\csrss.exe ObjectDirectory=\\Windows SharedSection=1024,20480,768',
        user: 'NT AUTHORITY\\SYSTEM',
        threads: 14,
        handles: 490,
      },
      {
        pid: 648,
        ppid: 92,
        name: 'wininit.exe',
        path: 'C:\\Windows\\System32\\wininit.exe',
        commandLine: 'wininit.exe',
        user: 'NT AUTHORITY\\SYSTEM',
        threads: 3,
        handles: 124,
      },
      {
        pid: 712,
        ppid: 648,
        name: 'services.exe',
        path: 'C:\\Windows\\System32\\services.exe',
        commandLine: 'C:\\Windows\\system32\\services.exe',
        user: 'NT AUTHORITY\\SYSTEM',
        threads: 18,
        handles: 620,
      },
      {
        pid: 720,
        ppid: 648,
        name: 'lsass.exe',
        path: 'C:\\Windows\\System32\\lsass.exe',
        commandLine: 'C:\\Windows\\system32\\lsass.exe',
        user: 'NT AUTHORITY\\SYSTEM',
        threads: 22,
        handles: 1420,
      },
      {
        pid: 988,
        ppid: 712,
        name: 'svchost.exe',
        path: 'C:\\Windows\\System32\\svchost.exe',
        commandLine: 'C:\\Windows\\system32\\svchost.exe -k DcomLaunch -p',
        user: 'NT AUTHORITY\\SYSTEM',
        threads: 42,
        handles: 840,
      },
      {
        pid: 1428,
        ppid: 712,
        name: 'svchost.exe',
        path: 'C:\\Windows\\System32\\svchost.exe',
        commandLine: 'C:\\Windows\\system32\\svchost.exe -k netsvcs -p -s BITS',
        user: 'NT AUTHORITY\\SYSTEM',
        threads: 31,
        handles: 980,
        isSuspicious: true,
        anomalyReason: 'Unbacked executable memory segment (PAGE_EXECUTE_READWRITE) containing reflective DLL loader and MZ header (Cobalt Strike Beacon payload).',
        mitreTechnique: 'T1055.001 (Dynamic-link Library Injection)',
        injectedSegments: [
          {
            virtualAddress: '0x000001f4c9a80000',
            sizeKb: 288,
            protection: 'PAGE_EXECUTE_READWRITE (RWX)',
            tag: 'REFLECTIVE_PE_LOADER',
            hexdumpPreview: '4d 5a 90 00 03 00 00 00 04 00 00 00 ff ff 00 00  MZ..............\nb8 00 00 00 00 00 00 00 40 00 00 00 00 00 00 00  ........@.......\n00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00  ................\n50 45 00 00 64 86 06 00 e8 8c a2 66 00 00 00 00  PE..d......f....',
          },
        ],
        sockets: [
          {
            protocol: 'TCP',
            localAddress: '10.0.4.12:49812',
            foreignAddress: '198.51.100.42:443',
            state: 'ESTABLISHED',
          },
        ],
      },
      {
        pid: 2044,
        ppid: 1428,
        name: 'powershell.exe',
        path: 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe',
        commandLine: 'powershell.exe -nop -w hidden -enc JABjAGwAaQBlAG4AdAAgAD0AIABOAGUAdwAtAE8AYgBqAGUAYwB0AA==',
        user: 'NT AUTHORITY\\SYSTEM',
        threads: 9,
        handles: 310,
        isSuspicious: true,
        anomalyReason: 'Anomalous parent-child relationship: svchost.exe (BITS) spawned encoded PowerShell CLI payload.',
        mitreTechnique: 'T1059.001 (Command and Scripting Interpreter: PowerShell)',
      },
    ],
  },
  {
    id: 'mimikatz-lsass-dump',
    name: 'FINANCE-W10 LSASS Credential Harvest',
    targetOs: 'Windows 10 Pro 22H2 (Build 19045)',
    dumpSize: '8.0 GB RAW',
    capturedAt: '2026-09-11 13:22:15 UTC',
    incidentType: 'Credential Dumping (T1003.001)',
    summary: 'Process tampering detected against lsass.exe via MiniDumpWriteDump API call initiated by rogue spoolsv.exe process thread.',
    processes: [
      {
        pid: 4,
        ppid: 0,
        name: 'System',
        path: 'ntoskrnl.exe',
        commandLine: '',
        user: 'NT AUTHORITY\\SYSTEM',
        threads: 190,
        handles: 1200,
      },
      {
        pid: 672,
        ppid: 4,
        name: 'lsass.exe',
        path: 'C:\\Windows\\System32\\lsass.exe',
        commandLine: 'C:\\Windows\\system32\\lsass.exe',
        user: 'NT AUTHORITY\\SYSTEM',
        threads: 34,
        handles: 1890,
        isSuspicious: true,
        anomalyReason: 'Handle duplication and memory region open with PROCESS_VM_READ | PROCESS_QUERY_INFORMATION from untrusted PID 1844.',
        mitreTechnique: 'T1003.001 (OS Credential Dumping: LSASS Memory)',
      },
      {
        pid: 1844,
        ppid: 712,
        name: 'spoolsv.exe',
        path: 'C:\\Users\\Public\\spoolsv.exe',
        commandLine: 'C:\\Users\\Public\\spoolsv.exe sekurlsa::logonpasswords exit',
        user: 'CORP\\contractor_svc',
        threads: 4,
        handles: 240,
        isSuspicious: true,
        anomalyReason: 'Path Masquerading: spoolsv.exe executing out of C:\\Users\\Public instead of System32 with Mimikatz CLI syntax.',
        mitreTechnique: 'T1036.005 (Match Legitimate Name or Location)',
        injectedSegments: [
          {
            virtualAddress: '0x00007ff819000000',
            sizeKb: 1024,
            protection: 'PAGE_EXECUTE_READWRITE (RWX)',
            tag: 'MIMIKATZ_SEKURLSA_BUNDLE',
            hexdumpPreview: '4d 5a 90 00 03 00 00 00 04 00 00 00 ff ff 00 00  MZ..............\n6d 69 6d 69 6b 61 74 7a 20 6f 66 20 67 65 6e 74  mimikatz of gent\n69 6c 6b 69 77 69 00 00 00 00 00 00 00 00 00 00  ilkiwi..........\n50 45 00 00 64 86 07 00 9f a4 c1 65 00 00 00 00  PE..d......e....',
          },
        ],
      },
    ],
  },
];

export const MemoryForensicsLab: React.FC = () => {
  const [selectedIncident, setSelectedIncident] = useState<MemoryIncidentPreset>(MEMORY_INCIDENT_PRESETS[0]);
  const [selectedProcess, setSelectedProcess] = useState<ForensicProcess>(
    MEMORY_INCIDENT_PRESETS[0].processes.find(p => p.isSuspicious) || MEMORY_INCIDENT_PRESETS[0].processes[0]
  );
  const [activeTab, setActiveTab] = useState<'TREE' | 'MALFIND' | 'NETSCAN'>('TREE');
  const [searchFilter, setSearchFilter] = useState('');
  const [copiedText, setCopiedText] = useState(false);

  const filteredProcesses = useMemo(() => {
    if (!searchFilter.trim()) return selectedIncident.processes;
    const q = searchFilter.toLowerCase();
    return selectedIncident.processes.filter(p => 
      p.name.toLowerCase().includes(q) ||
      p.pid.toString().includes(q) ||
      p.path.toLowerCase().includes(q) ||
      p.user.toLowerCase().includes(q) ||
      (p.anomalyReason && p.anomalyReason.toLowerCase().includes(q))
    );
  }, [selectedIncident, searchFilter]);

  const malfindProcesses = useMemo(() => {
    return selectedIncident.processes.filter(p => p.injectedSegments && p.injectedSegments.length > 0);
  }, [selectedIncident]);

  const netscanSockets = useMemo(() => {
    const list: { process: ForensicProcess; socket: NonNullable<ForensicProcess['sockets']>[0] }[] = [];
    selectedIncident.processes.forEach(p => {
      if (p.sockets) {
        p.sockets.forEach(s => list.push({ process: p, socket: s }));
      }
    });
    return list;
  }, [selectedIncident]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  return (
    <div className="flex flex-col h-full w-full bg-black text-neutral-100 font-mono select-none overflow-hidden">
      {/* Top Incident Profile Header */}
      <div className="p-3 bg-neutral-950 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-neutral-900 border border-neutral-700 text-purple-400">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-100">
                VOLATILITY 3 MEMORY TRIAGE & PROCESS ANOMALY RADAR
              </span>
              <span className="px-1.5 py-0.2 text-[9px] bg-purple-950/80 border border-purple-600 text-purple-300">
                LIME / RAW
              </span>
            </div>
            <div className="text-[10px] text-neutral-400 flex items-center gap-2">
              <span>IMAGE: {selectedIncident.dumpSize}</span>
              <span>•</span>
              <span>OS: {selectedIncident.targetOs}</span>
              <span>•</span>
              <span className="text-rose-400">{selectedIncident.incidentType}</span>
            </div>
          </div>
        </div>

        {/* Incident Switcher Pills */}
        <div className="flex items-center gap-1.5 bg-neutral-900 p-0.5 border border-neutral-800">
          <span className="text-[10px] text-neutral-500 px-2 uppercase">INCIDENT PRESET:</span>
          {MEMORY_INCIDENT_PRESETS.map((inc) => (
            <button
              key={inc.id}
              onClick={() => {
                setSelectedIncident(inc);
                setSelectedProcess(inc.processes.find(p => p.isSuspicious) || inc.processes[0]);
              }}
              className={`px-2 py-1 text-[10px] font-bold transition-all cursor-pointer ${
                selectedIncident.id === inc.id
                  ? 'bg-neutral-800 text-cyan-300 border-b-2 border-cyan-400'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {inc.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Mode Sub-nav & Filter Bar */}
      <div className="px-3 py-1.5 bg-black border-b border-neutral-800 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('TREE')}
            className={`px-2.5 py-1 text-xs font-bold flex items-center gap-1.5 cursor-pointer border ${
              activeTab === 'TREE'
                ? 'bg-neutral-900 border-cyan-500 text-cyan-300'
                : 'bg-transparent border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>PROCESS TREE ({filteredProcesses.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('MALFIND')}
            className={`px-2.5 py-1 text-xs font-bold flex items-center gap-1.5 cursor-pointer border ${
              activeTab === 'MALFIND'
                ? 'bg-neutral-900 border-rose-500 text-rose-300'
                : 'bg-transparent border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>MALFIND INJECTIONS ({malfindProcesses.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('NETSCAN')}
            className={`px-2.5 py-1 text-xs font-bold flex items-center gap-1.5 cursor-pointer border ${
              activeTab === 'NETSCAN'
                ? 'bg-neutral-900 border-indigo-500 text-indigo-300'
                : 'bg-transparent border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Wifi className="w-3.5 h-3.5 text-indigo-400" />
            <span>NETSCAN SOCKETS ({netscanSockets.length})</span>
          </button>
        </div>

        {/* Quick Search input */}
        <div className="relative w-64">
          <Search className="w-3 h-3 text-neutral-500 absolute left-2 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Filter PID, Process, Path..."
            className="w-full pl-7 pr-2 py-0.5 bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-cyan-500 font-mono placeholder:text-neutral-600"
          />
        </div>
      </div>

      {/* Main Workspace: Left List / Right Details Inspector */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Data Grid / Tree */}
        <div className="flex-1 flex flex-col border-r border-neutral-800 overflow-y-auto">
          {/* TAB 1: PROCESS TREE (pstree) */}
          {activeTab === 'TREE' && (
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse font-mono">
                <thead>
                  <tr className="bg-neutral-950 text-neutral-400 border-b border-neutral-800 text-[10px] uppercase">
                    <th className="p-2">PID / PPID</th>
                    <th className="p-2">PROCESS NAME</th>
                    <th className="p-2">SECURITY CONTEXT</th>
                    <th className="p-2">THREADS</th>
                    <th className="p-2">ANOMALY STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-900">
                  {filteredProcesses.map((proc) => {
                    const isSelected = selectedProcess.pid === proc.pid;
                    return (
                      <tr
                        key={proc.pid}
                        onClick={() => setSelectedProcess(proc)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-neutral-900 text-cyan-300 font-bold border-l-2 border-cyan-400'
                            : proc.isSuspicious
                            ? 'bg-rose-950/20 text-rose-200 hover:bg-rose-950/30'
                            : 'text-neutral-300 hover:bg-neutral-950'
                        }`}
                      >
                        <td className="p-2 whitespace-nowrap text-[11px]">
                          <span className="text-cyan-400 font-bold">{proc.pid}</span>
                          <span className="text-neutral-600 mx-1">/</span>
                          <span className="text-neutral-400">{proc.ppid}</span>
                        </td>
                        <td className="p-2 whitespace-nowrap flex items-center gap-1.5 font-bold">
                          {proc.isSuspicious ? (
                            <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                          ) : (
                            <FileCode className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                          )}
                          <span>{proc.name}</span>
                        </td>
                        <td className="p-2 whitespace-nowrap text-[10px] text-neutral-400">
                          {proc.user}
                        </td>
                        <td className="p-2 whitespace-nowrap text-[11px] text-neutral-400">
                          {proc.threads}
                        </td>
                        <td className="p-2 whitespace-nowrap text-[10px]">
                          {proc.isSuspicious ? (
                            <span className="px-1.5 py-0.5 bg-rose-950 border border-rose-600 text-rose-300 font-bold animate-pulse">
                              FLAGGED: {proc.mitreTechnique?.split(' ')[0] || 'INJECTION'}
                            </span>
                          ) : (
                            <span className="text-neutral-500">NOMINAL</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 2: MALFIND CODE INJECTION RADAR */}
          {activeTab === 'MALFIND' && (
            <div className="p-3 space-y-3">
              <div className="text-[10px] text-neutral-400 bg-rose-950/20 border border-rose-800/40 p-2 leading-relaxed">
                <span className="font-bold text-rose-300">MALFIND HEURISTIC:</span> Scans for virtual memory regions tagged with <code className="text-rose-400 bg-black px-1">PAGE_EXECUTE_READWRITE</code> containing unbacked PE headers (<code className="text-cyan-400 bg-black px-1">MZ / 4D 5A</code>) or anomalous shellcode trampolines.
              </div>

              {malfindProcesses.map((proc) => (
                <div
                  key={proc.pid}
                  onClick={() => setSelectedProcess(proc)}
                  className={`p-3 border transition-colors cursor-pointer ${
                    selectedProcess.pid === proc.pid
                      ? 'bg-neutral-900 border-rose-500'
                      : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-rose-400" />
                      <span className="text-xs font-bold text-white">{proc.name} (PID {proc.pid})</span>
                      <span className="text-[9px] px-1 bg-rose-950 text-rose-300 border border-rose-700">
                        {proc.mitreTechnique}
                      </span>
                    </div>
                    <span className="text-[10px] text-neutral-500">{proc.user}</span>
                  </div>

                  {proc.injectedSegments?.map((seg, idx) => (
                    <div key={idx} className="mt-2 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-neutral-400">VIRTUAL ADDRESS: <span className="text-cyan-400 font-bold">{seg.virtualAddress}</span></span>
                        <span className="text-rose-400 font-bold">{seg.protection}</span>
                        <span className="text-neutral-400">SIZE: {seg.sizeKb} KB</span>
                      </div>
                      <pre className="p-2 bg-black border border-neutral-900 text-[10px] text-emerald-400 overflow-x-auto leading-relaxed">
                        {seg.hexdumpPreview}
                      </pre>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: NETSCAN SOCKET CONNECTIONS */}
          {activeTab === 'NETSCAN' && (
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse font-mono">
                <thead>
                  <tr className="bg-neutral-950 text-neutral-400 border-b border-neutral-800 text-[10px] uppercase">
                    <th className="p-2">PID</th>
                    <th className="p-2">PROCESS</th>
                    <th className="p-2">PROTO</th>
                    <th className="p-2">LOCAL ADDRESS</th>
                    <th className="p-2">FOREIGN ADDRESS</th>
                    <th className="p-2">STATE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-900">
                  {netscanSockets.map(({ process: proc, socket }, idx) => (
                    <tr
                      key={idx}
                      onClick={() => setSelectedProcess(proc)}
                      className={`cursor-pointer ${
                        selectedProcess.pid === proc.pid
                          ? 'bg-neutral-900 text-cyan-300 font-bold'
                          : proc.isSuspicious
                          ? 'bg-rose-950/20 text-rose-200'
                          : 'text-neutral-300 hover:bg-neutral-950'
                      }`}
                    >
                      <td className="p-2 text-cyan-400 font-bold">{proc.pid}</td>
                      <td className="p-2 font-bold">{proc.name}</td>
                      <td className="p-2 text-neutral-400">{socket.protocol}</td>
                      <td className="p-2 text-neutral-300">{socket.localAddress}</td>
                      <td className="p-2 text-rose-400 font-bold">{socket.foreignAddress}</td>
                      <td className="p-2">
                        <span className="px-1.5 py-0.2 bg-emerald-950 border border-emerald-700 text-emerald-300 text-[9px]">
                          {socket.state}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column: Deep Forensic Process Inspector */}
        <div className="w-96 bg-neutral-950 flex flex-col overflow-y-auto p-3 space-y-3 shrink-0">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <div className="flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold uppercase text-neutral-200">PROCESS PEB INSPECTOR</span>
            </div>
            <span className="text-[10px] text-neutral-500 font-bold">PID {selectedProcess.pid}</span>
          </div>

          {/* Anomaly Banner if suspicious */}
          {selectedProcess.isSuspicious && (
            <div className="p-2.5 bg-rose-950/40 border border-rose-600 text-rose-200 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-rose-400">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>FORENSIC ANOMALY DETECTED</span>
              </div>
              <p className="text-[11px] leading-relaxed text-rose-200">
                {selectedProcess.anomalyReason}
              </p>
              {selectedProcess.mitreTechnique && (
                <div className="pt-1 text-[10px] text-rose-300 font-bold">
                  ATT&CK: {selectedProcess.mitreTechnique}
                </div>
              )}
            </div>
          )}

          {/* Key Properties */}
          <div className="space-y-1.5 text-xs">
            <div className="p-2 bg-neutral-900 border border-neutral-800 space-y-1">
              <div className="text-[10px] text-neutral-500 uppercase">Binary File Path:</div>
              <div className="text-neutral-200 break-all select-all font-mono text-[11px]">{selectedProcess.path}</div>
            </div>

            <div className="p-2 bg-neutral-900 border border-neutral-800 space-y-1">
              <div className="text-[10px] text-neutral-500 uppercase">Command Line Execution:</div>
              <div className="text-neutral-200 break-all select-all font-mono text-[10px]">
                {selectedProcess.commandLine || '<SYSTEM INTERNAL KERNEL THREAD>'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 bg-neutral-900 border border-neutral-800">
                <div className="text-[9px] text-neutral-500">PARENT PID</div>
                <div className="text-cyan-400 font-bold">{selectedProcess.ppid}</div>
              </div>
              <div className="p-2 bg-neutral-900 border border-neutral-800">
                <div className="text-[9px] text-neutral-500">THREADS / HANDLES</div>
                <div className="text-neutral-200">{selectedProcess.threads} / {selectedProcess.handles}</div>
              </div>
            </div>
          </div>

          {/* Sockets / Injections in Inspector */}
          {selectedProcess.sockets && selectedProcess.sockets.length > 0 && (
            <div className="space-y-1">
              <div className="text-[10px] text-neutral-500 uppercase font-bold">Active Sockets at Dump:</div>
              {selectedProcess.sockets.map((sock, sIdx) => (
                <div key={sIdx} className="p-2 bg-black border border-neutral-800 text-[10px] space-y-0.5">
                  <div className="text-rose-400 font-bold">➔ {sock.foreignAddress} ({sock.protocol})</div>
                  <div className="text-neutral-400">Local: {sock.localAddress} • State: {sock.state}</div>
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 border-t border-neutral-800 space-y-1.5">
            <button
              onClick={() => handleCopy(JSON.stringify(selectedProcess, null, 2))}
              className="w-full py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedText ? 'COPIED JSON' : 'COPY PROCESS JSON'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
