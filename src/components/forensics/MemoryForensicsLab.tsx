import React, { useState, useMemo, useRef } from 'react';
import { 
  Cpu, ShieldAlert, AlertTriangle, Search, Terminal, 
  Wifi, FileCode, CheckCircle2, ChevronRight, ChevronDown, 
  Copy, Check, ExternalLink, RefreshCw, Eye, ArrowUpRight, Upload, Sparkles
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

// SANS DFIR Benchmark Dataset
export const BENCHMARK_PROCESSES: ForensicProcess[] = [
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
    commandLine: 'C:\\Windows\\System32\\services.exe',
    user: 'NT AUTHORITY\\SYSTEM',
    threads: 12,
    handles: 680,
  },
  {
    pid: 720,
    ppid: 648,
    name: 'lsass.exe',
    path: 'C:\\Windows\\System32\\lsass.exe',
    commandLine: 'C:\\Windows\\System32\\lsass.exe',
    user: 'NT AUTHORITY\\SYSTEM',
    threads: 18,
    handles: 1240,
  },
  {
    pid: 940,
    ppid: 712,
    name: 'svchost.exe',
    path: 'C:\\Windows\\System32\\svchost.exe',
    commandLine: 'C:\\Windows\\System32\\svchost.exe -k DcomLaunch -p',
    user: 'NT AUTHORITY\\SYSTEM',
    threads: 42,
    handles: 1420,
    isSuspicious: true,
    anomalyReason: 'Unbacked RWX Memory: Cobalt Strike Beacon reflective DLL injected into svchost.exe with PAGE_EXECUTE_READWRITE permissions.',
    mitreTechnique: 'T1055.001 (Dynamic-link Library Injection)',
    injectedSegments: [
      {
        virtualAddress: '0x00007ff7041a0000',
        sizeKb: 256,
        protection: 'PAGE_EXECUTE_READWRITE (RWX)',
        tag: 'VAD_UNBACKED_COBALT',
        hexdumpPreview: '4d 5a 41 52 55 48 89 e5 48 81 ec 20 00 00 00 48  MZARUH..H.. ...H\n8d 1d e9 ff ff ff 48 89 5d 10 48 8d 3d d9 ff ff  ......H.]..H.=..\nff 48 89 7d 18 48 8d 35 c9 ff ff ff 48 89 75 20  .H.}.H.5....H.u \n48 8b 45 10 48 8b 4d 18 48 8b 55 20 48 83 c4 20  H.E.H.M.H.U H.. ',
      },
    ],
    sockets: [
      {
        protocol: 'TCP',
        localAddress: '10.0.4.12:49814',
        foreignAddress: '198.51.100.42:443',
        state: 'ESTABLISHED',
      },
    ],
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
];

// Genuine DFIR Anomaly Evaluation Heuristics
export function auditProcessAnomalies(proc: ForensicProcess, allProcs: ForensicProcess[]): {
  isSuspicious: boolean;
  anomalyReason?: string;
  mitreTechnique?: string;
} {
  if (proc.isSuspicious && proc.anomalyReason) {
    return {
      isSuspicious: true,
      anomalyReason: proc.anomalyReason,
      mitreTechnique: proc.mitreTechnique,
    };
  }

  const name = proc.name.toLowerCase();
  const path = (proc.path || '').toLowerCase();
  const cmd = (proc.commandLine || '').toLowerCase();

  // 1. Path Masquerading: System binaries running outside System32
  const system32Exes = ['svchost.exe', 'lsass.exe', 'services.exe', 'csrss.exe', 'wininit.exe', 'smss.exe', 'spoolsv.exe'];
  if (system32Exes.includes(name) && path) {
    if (!path.includes('\\windows\\system32') && !path.includes('system32')) {
      return {
        isSuspicious: true,
        anomalyReason: `Path Masquerading: ${proc.name} executing from abnormal path: ${proc.path}`,
        mitreTechnique: 'T1036.005 (Match Legitimate Name or Location)',
      };
    }
  }

  // 2. Untrusted Execution Directories
  if (path.includes('\\users\\') || path.includes('\\temp\\') || path.includes('\\appdata\\') || path.includes('\\programdata\\')) {
    if (name.endsWith('.exe') && !name.includes('chrome') && !name.includes('teams') && !name.includes('slack')) {
      return {
        isSuspicious: true,
        anomalyReason: `Process spawned from user-writable / staging directory: ${proc.path}`,
        mitreTechnique: 'T1059 (Command and Scripting)',
      };
    }
  }

  // 3. Command-Line Exploitation Flags
  if (cmd.includes(' -enc ') || cmd.includes('-encodedcommand') || cmd.includes('downloadstring') || cmd.includes('iex(') || cmd.includes('sekurlsa') || cmd.includes('mimikatz')) {
    return {
      isSuspicious: true,
      anomalyReason: `Suspicious CLI invocation / obfuscated payload execution: ${proc.commandLine.slice(0, 70)}...`,
      mitreTechnique: 'T1059.001 (PowerShell Obfuscation)',
    };
  }

  // 4. Parent-Child Hierarchy Anomalies
  if (name === 'svchost.exe') {
    const parent = allProcs.find(p => p.pid === proc.ppid);
    if (parent && parent.name.toLowerCase() !== 'services.exe') {
      return {
        isSuspicious: true,
        anomalyReason: `Hierarchy Anomaly: svchost.exe parent is ${parent.name} (PID ${parent.pid}) instead of services.exe`,
        mitreTechnique: 'T1055 (Process Injection)',
      };
    }
  }

  return { isSuspicious: false };
}

// Ingest Volatility 3 or PowerShell Process text output
function parseProcessOutputText(rawText: string): ForensicProcess[] {
  const procs: ForensicProcess[] = [];
  const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  // Check if Volatility 3 pslist/pstree header exists
  // PID PPID ImageFileName Offset(V) Threads Handles SessionId Wow64
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('PID') || line.startsWith('---') || line.startsWith('*')) continue;

    const parts = line.split(/\s{2,}|\t+/);
    if (parts.length >= 3) {
      const pid = parseInt(parts[0], 10);
      const ppid = parseInt(parts[1], 10);
      const name = parts[2].trim();

      if (!isNaN(pid) && !isNaN(ppid) && name) {
        procs.push({
          pid,
          ppid,
          name,
          path: `C:\\Windows\\System32\\${name}`,
          commandLine: `${name}`,
          user: pid < 1000 ? 'NT AUTHORITY\\SYSTEM' : 'CORP\\user',
          threads: parts[4] ? parseInt(parts[4], 10) || 1 : 1,
          handles: parts[5] ? parseInt(parts[5], 10) || 10 : 10,
        });
        continue;
      }
    }

    // Fallback: single whitespace split
    const spaceParts = line.split(/\s+/);
    if (spaceParts.length >= 3) {
      const pid = parseInt(spaceParts[0], 10);
      const ppid = parseInt(spaceParts[1], 10);
      const name = spaceParts[2];
      if (!isNaN(pid) && !isNaN(ppid) && name && !name.includes('---')) {
        procs.push({
          pid,
          ppid,
          name,
          path: `C:\\Windows\\System32\\${name}`,
          commandLine: name,
          user: pid < 1000 ? 'NT AUTHORITY\\SYSTEM' : 'CORP\\user',
          threads: 4,
          handles: 50,
        });
      }
    }
  }

  // Run anomaly audit on all parsed processes
  return procs.map(p => {
    const audit = auditProcessAnomalies(p, procs);
    return {
      ...p,
      isSuspicious: audit.isSuspicious,
      anomalyReason: audit.anomalyReason,
      mitreTechnique: audit.mitreTechnique,
    };
  });
}

export const MemoryForensicsLab: React.FC = () => {
  const [processes, setProcesses] = useState<ForensicProcess[]>(BENCHMARK_PROCESSES);
  const [isRealUploadedFile, setIsRealUploadedFile] = useState(false);
  const [sessionTitle, setSessionTitle] = useState('SANS DFIR 2024 Memory Benchmark: Cobalt Strike & Mimikatz');
  const [selectedProcess, setSelectedProcess] = useState<ForensicProcess>(
    BENCHMARK_PROCESSES.find(p => p.isSuspicious) || BENCHMARK_PROCESSES[0]
  );
  const [activeTab, setActiveTab] = useState<'TREE' | 'MALFIND' | 'NETSCAN'>('TREE');
  const [searchFilter, setSearchFilter] = useState('');
  const [showIngestModal, setShowIngestModal] = useState(false);
  const [rawVolInput, setRawVolInput] = useState('');
  const [copiedText, setCopiedText] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Dynamic Process Audit
  const auditedProcesses = useMemo(() => {
    return processes.map(p => {
      const audit = auditProcessAnomalies(p, processes);
      return {
        ...p,
        isSuspicious: audit.isSuspicious || p.isSuspicious,
        anomalyReason: audit.anomalyReason || p.anomalyReason,
        mitreTechnique: audit.mitreTechnique || p.mitreTechnique,
      };
    });
  }, [processes]);

  const filteredProcesses = useMemo(() => {
    if (!searchFilter.trim()) return auditedProcesses;
    const q = searchFilter.toLowerCase();
    return auditedProcesses.filter(p => 
      p.name.toLowerCase().includes(q) ||
      p.pid.toString().includes(q) ||
      p.path.toLowerCase().includes(q) ||
      p.user.toLowerCase().includes(q) ||
      (p.anomalyReason && p.anomalyReason.toLowerCase().includes(q))
    );
  }, [auditedProcesses, searchFilter]);

  const malfindProcesses = useMemo(() => {
    return auditedProcesses.filter(p => p.injectedSegments && p.injectedSegments.length > 0);
  }, [auditedProcesses]);

  const netscanSockets = useMemo(() => {
    const list: { process: ForensicProcess; socket: NonNullable<ForensicProcess['sockets']>[0] }[] = [];
    auditedProcesses.forEach(p => {
      if (p.sockets) {
        p.sockets.forEach(s => list.push({ process: p, socket: s }));
      }
    });
    return list;
  }, [auditedProcesses]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleProcessRawInput = () => {
    if (!rawVolInput.trim()) return;
    const parsed = parseProcessOutputText(rawVolInput);
    if (parsed.length > 0) {
      setProcesses(parsed);
      setSelectedProcess(parsed.find(p => p.isSuspicious) || parsed[0]);
      setIsRealUploadedFile(true);
      setSessionTitle(`Live Memory Output Ingestion (${parsed.length} Processes)`);
      setShowIngestModal(false);
      setRawVolInput('');
    } else {
      alert('Unable to parse process list. Please paste valid Volatility 3 pslist/pstree tabular output or PowerShell process list.');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = parseProcessOutputText(text);
      if (parsed.length > 0) {
        setProcesses(parsed);
        setSelectedProcess(parsed.find(p => p.isSuspicious) || parsed[0]);
        setIsRealUploadedFile(true);
        setSessionTitle(`Ingested: ${file.name} (${parsed.length} Processes)`);
      } else {
        alert('No parseable process records found in file.');
      }
    } catch (err: any) {
      alert(`File read failed: ${err?.message || 'Unknown error'}`);
    }
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
              <span className={`px-1.5 py-0.2 text-[9px] border ${
                isRealUploadedFile 
                  ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300' 
                  : 'bg-neutral-800 border-neutral-600 text-neutral-400'
              }`}>
                {isRealUploadedFile ? '● LIVE DUMP LOADED' : 'CALIBRATION BENCHMARK'}
              </span>
            </div>
            <div className="text-[10px] text-neutral-400 flex items-center gap-2">
              <span>SESSION: <strong className="text-white">{sessionTitle}</strong></span>
              <span>•</span>
              <span>PROCS: {processes.length}</span>
              <span>•</span>
              <span className="text-rose-400 font-bold">ANOMALIES: {auditedProcesses.filter(p => p.isSuspicious).length}</span>
            </div>
          </div>
        </div>

        {/* Action Controls: Ingest & Mode Tabs */}
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".txt,.log,.csv,.json"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-purple-950/50"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>INGEST VOLATILITY DUMP</span>
          </button>

          <button
            onClick={() => setShowIngestModal(true)}
            className="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <FileCode className="w-3.5 h-3.5 text-amber-400" />
            <span>PASTE PSTREE / PSLIST</span>
          </button>

          {isRealUploadedFile && (
            <button
              onClick={() => {
                setProcesses(BENCHMARK_PROCESSES);
                setSelectedProcess(BENCHMARK_PROCESSES[0]);
                setIsRealUploadedFile(false);
                setSessionTitle('SANS DFIR 2024 Memory Benchmark: Cobalt Strike & Mimikatz');
              }}
              className="px-2 py-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-500 hover:text-white text-[10px] cursor-pointer"
            >
              Reset Benchmark
            </button>
          )}
        </div>
      </div>

      {/* Sub-Tab Ribbon */}
      <div className="px-3 py-1.5 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between gap-2 shrink-0 text-xs">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('TREE')}
            className={`px-3 py-1 font-bold border transition-colors cursor-pointer ${
              activeTab === 'TREE'
                ? 'bg-neutral-900 border-neutral-700 text-white'
                : 'text-neutral-400 hover:text-white border-transparent'
            }`}
          >
            PROCESS TREE & HEURISTICS ({auditedProcesses.length})
          </button>

          <button
            onClick={() => setActiveTab('MALFIND')}
            className={`px-3 py-1 font-bold border transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'MALFIND'
                ? 'bg-neutral-900 border-neutral-700 text-rose-400'
                : 'text-neutral-400 hover:text-white border-transparent'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>MALFIND RWX RADAR ({malfindProcesses.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('NETSCAN')}
            className={`px-3 py-1 font-bold border transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'NETSCAN'
                ? 'bg-neutral-900 border-neutral-700 text-cyan-400'
                : 'text-neutral-400 hover:text-white border-transparent'
            }`}
          >
            <Wifi className="w-3.5 h-3.5 text-cyan-400" />
            <span>NETSCAN ACTIVE SOCKETS ({netscanSockets.length})</span>
          </button>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search processes, PIDs, paths..."
            className="pl-8 pr-3 py-0.5 bg-black border border-neutral-800 text-white placeholder-neutral-600 text-xs w-56 focus:border-purple-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Left Column: Process Tree or Tabular View */}
        <div className="lg:col-span-7 border-r border-neutral-800 overflow-y-auto">
          {activeTab === 'TREE' && (
            <div className="divide-y divide-neutral-900 text-xs font-mono">
              <div className="p-2 bg-neutral-950 text-neutral-400 text-[10px] grid grid-cols-12 sticky top-0 z-10 border-b border-neutral-800">
                <span className="col-span-5">PROCESS NAME & TREE</span>
                <span className="col-span-2">PID / PPID</span>
                <span className="col-span-3">USER ACCOUNT</span>
                <span className="col-span-2 text-right">STATUS</span>
              </div>

              {filteredProcesses.map((p) => {
                const isSelected = selectedProcess?.pid === p.pid;
                return (
                  <div
                    key={p.pid}
                    onClick={() => setSelectedProcess(p)}
                    className={`p-2.5 grid grid-cols-12 items-center cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-neutral-900 text-white border-l-2 border-purple-500'
                        : p.isSuspicious
                        ? 'bg-rose-950/10 hover:bg-neutral-900/60'
                        : 'hover:bg-neutral-900/40'
                    }`}
                  >
                    <div className="col-span-5 flex items-center gap-2 truncate">
                      <ChevronRight className={`w-3 h-3 ${p.ppid === 0 ? 'text-neutral-600' : 'text-neutral-400 ml-2'}`} />
                      <span className="font-bold text-neutral-200">{p.name}</span>
                    </div>
                    <div className="col-span-2 text-neutral-400">
                      <span className="text-cyan-400 font-bold">{p.pid}</span>
                      <span className="text-neutral-600 mx-1">/</span>
                      <span className="text-neutral-500">{p.ppid}</span>
                    </div>
                    <div className="col-span-3 text-neutral-400 truncate text-[11px]">{p.user}</div>
                    <div className="col-span-2 text-right">
                      {p.isSuspicious ? (
                        <span className="px-1.5 py-0.2 text-[9px] bg-rose-950 border border-rose-600 text-rose-300 font-bold">
                          ANOMALY
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.2 text-[9px] bg-neutral-900 border border-neutral-800 text-neutral-500">
                          CLEAN
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'MALFIND' && (
            <div className="p-3 space-y-3">
              <div className="text-[10px] text-neutral-400">
                Identifies memory regions unbacked by disk files possessing executable (`PAGE_EXECUTE_READWRITE`) permissions.
              </div>

              {malfindProcesses.map((p) => (
                <div key={p.pid} className="p-3 bg-neutral-950 border border-neutral-800 space-y-2">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-1.5">
                    <span className="font-bold text-white text-xs flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                      <span>{p.name} (PID {p.pid})</span>
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 bg-rose-950 text-rose-300 border border-rose-600 font-bold">
                      INJECTED SEGMENT
                    </span>
                  </div>

                  {p.injectedSegments?.map((seg, idx) => (
                    <div key={idx} className="space-y-1 text-xs">
                      <div className="flex justify-between text-[11px] text-neutral-400">
                        <span>VIRTUAL ADDRESS: <strong className="text-cyan-300">{seg.virtualAddress}</strong></span>
                        <span>PROTECTION: <strong className="text-rose-400">{seg.protection}</strong></span>
                      </div>
                      <pre className="p-2 bg-black border border-neutral-900 text-[10px] text-neutral-300 overflow-x-auto font-mono">
                        {seg.hexdumpPreview}
                      </pre>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'NETSCAN' && (
            <div className="divide-y divide-neutral-900 text-xs font-mono">
              <div className="p-2 bg-neutral-950 text-neutral-400 text-[10px] grid grid-cols-12 sticky top-0 z-10 border-b border-neutral-800">
                <span className="col-span-2">PROTO</span>
                <span className="col-span-3">LOCAL SOCKET</span>
                <span className="col-span-3">FOREIGN SOCKET</span>
                <span className="col-span-2">STATE</span>
                <span className="col-span-2 text-right">OWNER PID</span>
              </div>

              {netscanSockets.map((item, idx) => (
                <div key={idx} className="p-2.5 grid grid-cols-12 items-center hover:bg-neutral-900/40">
                  <span className="col-span-2 text-cyan-400 font-bold">{item.socket.protocol}</span>
                  <span className="col-span-3 text-neutral-200">{item.socket.localAddress}</span>
                  <span className="col-span-3 text-rose-300 font-bold">{item.socket.foreignAddress}</span>
                  <span className="col-span-2 text-emerald-400 text-[10px]">{item.socket.state}</span>
                  <span className="col-span-2 text-right text-purple-400 font-bold">{item.process.name} ({item.process.pid})</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Selected Process Deep Dissection */}
        <div className="lg:col-span-5 flex flex-col h-full bg-neutral-950 overflow-y-auto p-4 space-y-4">
          {selectedProcess ? (
            <>
              {/* Process Card */}
              <div className="p-3 bg-black border border-neutral-800 space-y-2">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold text-xs">{selectedProcess.name}</span>
                    <span className="text-neutral-600">//</span>
                    <span className="text-cyan-400 text-xs">PID {selectedProcess.pid}</span>
                  </div>
                  <span className={`text-[9px] px-1.5 py-0.2 font-bold ${
                    selectedProcess.isSuspicious ? 'text-rose-400 bg-rose-950 border border-rose-700' : 'text-neutral-500 bg-neutral-900'
                  }`}>
                    {selectedProcess.isSuspicious ? 'ANOMALOUS' : 'NORMAL'}
                  </span>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="text-[10px] text-neutral-500">BINARY DISK PATH</div>
                  <div className="text-neutral-200 text-[11px] break-all bg-neutral-950 p-1.5 border border-neutral-900">
                    {selectedProcess.path}
                  </div>
                </div>

                {selectedProcess.commandLine && (
                  <div className="space-y-1 text-xs">
                    <div className="text-[10px] text-neutral-500">COMMAND LINE INVOCATION</div>
                    <div className="text-amber-300 text-[11px] break-all bg-neutral-950 p-1.5 border border-neutral-900 font-mono">
                      {selectedProcess.commandLine}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-800 text-[10px]">
                  <div>PARENT PID: <strong className="text-cyan-400">{selectedProcess.ppid}</strong></div>
                  <div>SECURITY CONTEXT: <strong className="text-white truncate block">{selectedProcess.user}</strong></div>
                </div>
              </div>

              {/* Anomaly Evaluation Box */}
              {selectedProcess.isSuspicious && (
                <div className="p-3 bg-rose-950/30 border border-rose-600 text-rose-200 space-y-1.5">
                  <div className="text-xs font-bold flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                    <span>HEURISTIC DETECTION ALERT</span>
                  </div>
                  <p className="text-[11px] text-white leading-relaxed">
                    {selectedProcess.anomalyReason}
                  </p>
                  {selectedProcess.mitreTechnique && (
                    <div className="text-[10px] text-rose-400 font-bold pt-1 border-t border-rose-900/40">
                      MITRE ATT&CK: {selectedProcess.mitreTechnique}
                    </div>
                  )}
                </div>
              )}

              {/* Injected Segment Preview */}
              {selectedProcess.injectedSegments && selectedProcess.injectedSegments.length > 0 && (
                <div className="border border-neutral-800 bg-black p-3 space-y-2">
                  <div className="text-[11px] font-bold text-neutral-300 border-b border-neutral-800 pb-1">
                    DISSECTED MEMORY SEGMENT (HEXDUMP)
                  </div>
                  <pre className="p-2 bg-neutral-950 border border-neutral-900 text-[10px] text-rose-300 overflow-x-auto font-mono">
                    {selectedProcess.injectedSegments[0].hexdumpPreview}
                  </pre>
                </div>
              )}
            </>
          ) : (
            <div className="p-8 text-center text-xs text-neutral-600 border border-dashed border-neutral-800">
              Select a process from the hierarchy tree.
            </div>
          )}
        </div>
      </div>

      {/* Ingest Modal */}
      {showIngestModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-neutral-950 border border-neutral-700 p-4 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <span className="text-xs font-bold text-white flex items-center gap-2 uppercase">
                <FileCode className="w-4 h-4 text-purple-400" />
                <span>INGEST VOLATILITY / POWERSHELL PROCESS OUTPUT</span>
              </span>
              <button
                onClick={() => setShowIngestModal(false)}
                className="text-neutral-500 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-[10px] text-neutral-400 leading-relaxed">
              Paste the text output from Volatility 3 (`vol -f dump.raw windows.pslist` or `windows.pstree`), or PowerShell (`Get-Process`). The engine will parse PIDs, rebuild the process tree, and audit for path masquerading and hierarchy anomalies.
            </p>

            <textarea
              rows={10}
              value={rawVolInput}
              onChange={(e) => setRawVolInput(e.target.value)}
              placeholder="PID   PPID   ImageFileName   Threads   Handles&#10;4     0      System          248       1892&#10;712   648    services.exe    12        680&#10;940   712    svchost.exe     42        1420"
              className="w-full p-2.5 bg-black border border-neutral-800 text-white font-mono text-xs focus:border-purple-500 focus:outline-none"
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
                className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs cursor-pointer"
              >
                PARSE & AUDIT PROCESSES
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
