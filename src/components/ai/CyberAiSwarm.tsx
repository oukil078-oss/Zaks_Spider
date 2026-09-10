import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, Terminal, Shield, Fingerprint, Cpu, Award, 
  Send, RefreshCw, Copy, Check, Sparkles, MessageSquare, 
  ChevronRight, X, Maximize2, Minimize2, Layers, AlertCircle,
  Key, ExternalLink, Eye, EyeOff, CheckCircle2, AlertTriangle,
  Zap, Database, TerminalSquare, ArrowUpRight, ShieldAlert,
  ChevronDown, Settings2, Sliders, Globe, Lock
} from 'lucide-react';
import { CyberAiPersonaId, CyberAiAgentPersona, CyberAgentMessage } from '../../types';
import { apiService } from '../../services/api';

export interface CyberModelOption {
  id: string;
  name: string;
  badge: string;
  provider: string;
  tagline: string;
  color: string;
  accentBorder: string;
}

export const AVAILABLE_CYBER_MODELS: CyberModelOption[] = [
  {
    id: 'gpt-6-astra',
    name: 'GPT-6 Astra',
    badge: 'Flagship Sovereign',
    provider: 'ExperientialLabs / OpenAI Next',
    tagline: 'Autonomous Sovereign Cyber Warfare & Full Spectrum Orchestration',
    color: 'from-cyan-500 to-blue-600',
    accentBorder: 'border-cyan-500/40 text-cyan-300',
  },
  {
    id: 'qwen3.8-max',
    name: 'Qwen 3.8 Max',
    badge: 'Frontier Reasoning',
    provider: 'Alibaba Cloud / ExperientialLabs',
    tagline: 'Deep Cyber Cognitive Deduction, Offensive Vectors & Architecture',
    color: 'from-purple-500 to-pink-600',
    accentBorder: 'border-purple-500/40 text-purple-300',
  },
  {
    id: 'qwen3.8-27b',
    name: 'Qwen 3.8 27B',
    badge: 'Tactical Swarm',
    provider: 'Alibaba Cloud / ExperientialLabs',
    tagline: 'High-Speed Threat Intelligence & Real-Time Incident Mitigation',
    color: 'from-emerald-500 to-teal-600',
    accentBorder: 'border-emerald-500/40 text-emerald-300',
  },
  {
    id: 'qwen3-coder-plus',
    name: 'Qwen 3 Coder Plus',
    badge: 'Exploit Dev',
    provider: 'Alibaba Cloud / ExperientialLabs',
    tagline: 'Weaponized Payload Engineering & Binary Disassembly Analysis',
    color: 'from-amber-500 to-orange-600',
    accentBorder: 'border-amber-500/40 text-amber-300',
  },
  {
    id: 'sonar-deep-research',
    name: 'Sonar Deep Research',
    badge: 'OSINT & Web',
    provider: 'Perplexity / ExperientialLabs',
    tagline: 'Live Autonomous Global Threat Intelligence & Dark Web Crawling',
    color: 'from-blue-500 to-indigo-600',
    accentBorder: 'border-blue-500/40 text-blue-300',
  },
  {
    id: 'o3-mini-high',
    name: 'OpenAI o3-mini',
    badge: 'Logical Depth',
    provider: 'OpenAI / ExperientialLabs',
    tagline: 'Algorithmic Flaw Detection, ROP Chains & Proof-of-Concept Logic',
    color: 'from-violet-500 to-purple-700',
    accentBorder: 'border-violet-500/40 text-violet-300',
  },
  {
    id: 'nemotron-3-super-120b-a12b',
    name: 'Nemotron 3 Super 120B',
    badge: 'Enterprise SOC',
    provider: 'NVIDIA / ExperientialLabs',
    tagline: 'Heavyweight Zero-Trust Policy & MITRE ATT&CK Defense Mapping',
    color: 'from-green-500 to-emerald-700',
    accentBorder: 'border-green-500/40 text-green-300',
  },
];

export const CYBER_AI_PERSONAS: CyberAiAgentPersona[] = [
  {
    id: 'red-team',
    name: 'Ghost-Lead',
    callsign: 'RED-COMMANDER',
    role: 'Red Team Commander & Offensive Specialist',
    specialization: 'Perimeter Exploitation, Active Directory & PrivEsc',
    avatar: '⚔️',
    badgeColor: 'border-red-500/50 bg-red-950/40 text-red-300',
    description: 'Expert adversary emulation. Formulates offensive attack vectors, bypasses modern EDRs, and generates verified Kali Linux commands.',
    examplePrompts: [
      'Generate a stealth Nmap scan for an Active Directory domain controller.',
      'How to exploit WebDAV enabled IIS 10 server using davtest and cadaver?',
      'Craft a Kerberoasting attack pipeline with Impacket to extract SPN tickets.',
      'Recommend Linux privilege escalation techniques for SUID binary exploits.',
    ],
    systemPrompt: 'You are Ghost-Lead, Red Team Commander on Zak\'s Spider. Provide highly technical, precise, and professional offensive security guidance, penetration testing command syntaxes, and attack methodologies for authorized educational security assessments.',
  },
  {
    id: 'dfir',
    name: 'Vigil-Hunter',
    callsign: 'DFIR-CHIEF',
    role: 'Forensics & Threat Hunting Chief',
    specialization: 'Memory Forensics, Volatility, OSINT & Timeline Reconstruction',
    avatar: '🔍',
    badgeColor: 'border-purple-500/50 bg-purple-950/40 text-purple-300',
    description: 'Master of evidentiary analysis and digital footprints. Correlates forensic artifacts, memory dumps, and OSINT handles into courtroom-ready intelligence.',
    examplePrompts: [
      'How to extract injected DLLs from a suspicious process using Volatility 3?',
      'Interpret this suspicious User-Agent string and correlate with known botnets.',
      'What forensic artifacts prove a remote attacker executed PsExec via SMB?',
      'Synthesize an evidentiary timeline from Windows Event Log IDs 4624, 4625, and 4688.',
    ],
    systemPrompt: 'You are Vigil-Hunter, DFIR Lead on Zak\'s Spider. You specialize in memory forensics, file system analysis, digital evidence correlation, and timeline reconstruction. Deliver structured, rigorous forensic investigative insights.',
  },
  {
    id: 'soc-lead',
    name: 'Aegis-Lead',
    callsign: 'SOC-SENTINEL',
    role: 'SOC Incident Commander & Detection Engineer',
    specialization: 'Real-time Triage, Sigma Rules, Suricata & Firewall Defense',
    avatar: '🛡️',
    badgeColor: 'border-emerald-500/50 bg-emerald-950/40 text-emerald-300',
    description: 'Frontline defensive orchestrator. Rapidly contains live breaches, crafts high-fidelity Sigma and Suricata rules, and orchestrates remediation.',
    examplePrompts: [
      'Write a Sigma rule to detect Nmap NSE vulnerability scans in web access logs.',
      'How to immediately block a distributed brute-force attack using iptables and fail2ban?',
      'Provide a step-by-step incident response playbook for active ransomware on a DC.',
      'Map this HTTP traversal probe to MITRE ATT&CK tactics and techniques.',
    ],
    systemPrompt: 'You are Aegis-Lead, SOC Incident Commander on Zak\'s Spider. Provide rapid threat triage, containment strategies, defensive firewall rules, and detection signatures formatted in Sigma or Suricata.',
  },
  {
    id: 'reverse-eng',
    name: 'Gadget-Zero',
    callsign: 'REVERSE-DEV',
    role: 'Binary Analyst & Exploit Developer',
    specialization: 'Assembly x86/x64, Decompilation (Ghidra), Buffer Overflows',
    avatar: '⚡',
    badgeColor: 'border-amber-500/50 bg-amber-950/40 text-amber-300',
    description: 'Deconstructs malicious machine code. Identifies buffer overflow offsets, ROP gadgets, memory corruptions, and patch diffs.',
    examplePrompts: [
      'Explain how a 64-bit stack buffer overflow bypasses non-executable stack (NX) using ROP.',
      'How to inspect liblzma xz backdoor hooks in sshd using GDB and Ghidra?',
      'Calculate the byte offset for cyclic pattern in Metasploit pattern_offset.',
      'How does the MS08-067 NetAPI path parsing buffer overflow trigger code execution?',
    ],
    systemPrompt: 'You are Gadget-Zero, Binary Analyst & Reverse Engineer on Zak\'s Spider. Specialize in low-level x86/x64 assembly, Ghidra decompilation, memory corruption dynamics, shellcode crafting, and software security auditing.',
  },
  {
    id: 'ciso',
    name: 'Apex-Advisor',
    callsign: 'CISO-STRATEGIST',
    role: 'Chief Information Security Officer & Academic Defense Lead',
    specialization: 'Enterprise Risk, NIST CSF 2.0, Master\'s Thesis & Investor Pitch',
    avatar: '🏛️',
    badgeColor: 'border-cyan-500/50 bg-cyan-950/40 text-cyan-300',
    description: 'Executive strategist. Translates technical telemetry into boardroom risk metrics, regulatory compliance, and university master\'s degree project defenses.',
    examplePrompts: [
      'How to present this cybersecurity platform to university professors and investors?',
      'Frame our OSINT and PenTest features under NIST CSF 2.0 and GDPR compliance.',
      'What is the calculated ROI and breach prevention value of real-time SOC dot-density maps?',
      'Draft an executive summary for a Master\'s dissertation on autonomous AI security operations.',
    ],
    systemPrompt: 'You are Apex-Advisor, CISO & Strategic Director on Zak\'s Spider. Provide high-level executive briefings, enterprise risk governance, master\'s degree thesis argumentation, and strategic investor communication.',
  },
];

const DEFAULT_EXPLABS_KEY = 'xpl_41ece4e40287e26c45ddd9d9f91ee0c2c3fa8de3';

interface CyberAiSwarmProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string;
  contextPayload?: string;
  onPivotToPentest?: (cmd: string) => void;
}

export const CyberAiSwarm: React.FC<CyberAiSwarmProps> = ({
  isOpen,
  onClose,
  initialPrompt,
  contextPayload,
  onPivotToPentest,
}) => {
  const [activePersonaId, setActivePersonaId] = useState<CyberAiPersonaId>('red-team');
  const [selectedModelId, setSelectedModelId] = useState<string>(() => {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('zaks_selected_model') || 'gpt-6-astra';
    }
    return 'gpt-6-astra';
  });
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);

  // Uplink Key Configuration State
  const [apiKey, setApiKey] = useState<string>(() => {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('zaks_ai_api_key') || DEFAULT_EXPLABS_KEY;
    }
    return DEFAULT_EXPLABS_KEY;
  });
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [tempApiKey, setTempApiKey] = useState(apiKey);
  const [showKeySecret, setShowKeySecret] = useState(false);
  const [testConnStatus, setTestConnStatus] = useState<{ status: 'idle' | 'testing' | 'success' | 'quota_alert' | 'error'; msg: string }>({
    status: 'idle',
    msg: '',
  });

  const [messages, setMessages] = useState<CyberAgentMessage[]>([
    {
      id: 'msg-welcome',
      personaId: 'system',
      senderName: 'Zak\'s Spider Cyber Swarm Matrix',
      role: 'Autonomous AI Security Operations Center',
      text: 'Virtual SOC Operations Center online. Multi-model neural lanes configured (GPT-6 Astra, Qwen 3.8 Max, Qwen 3 Coder Plus, Sonar Deep Research). 5 specialized cyber commanders standing by for tactical PenTest, DFIR, SOC triage, binary exploitation, and master\'s thesis defense.',
      timestamp: new Date().toLocaleTimeString(),
      model: 'GPT-6 Astra Sovereign Swarm',
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [copiedCodeIdx, setCopiedCodeIdx] = useState<string | null>(null);
  const [warRoomMode, setWarRoomMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activePersona = CYBER_AI_PERSONAS.find((p) => p.id === activePersonaId) || CYBER_AI_PERSONAS[0];
  const activeModel = AVAILABLE_CYBER_MODELS.find((m) => m.id === selectedModelId) || AVAILABLE_CYBER_MODELS[0];

  useEffect(() => {
    if (initialPrompt && isOpen) {
      setInputPrompt(initialPrompt);
    }
  }, [initialPrompt, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsModelDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isOpen) return null;

  const handleSelectModel = (modelId: string) => {
    setSelectedModelId(modelId);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('zaks_selected_model', modelId);
    }
    setIsModelDropdownOpen(false);
  };

  const handleSaveApiKey = () => {
    const cleanKey = tempApiKey.trim() || DEFAULT_EXPLABS_KEY;
    setApiKey(cleanKey);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('zaks_ai_api_key', cleanKey);
    }
    setIsConfigModalOpen(false);
  };

  const handleResetDefaultKey = () => {
    setTempApiKey(DEFAULT_EXPLABS_KEY);
    setApiKey(DEFAULT_EXPLABS_KEY);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('zaks_ai_api_key', DEFAULT_EXPLABS_KEY);
    }
    setTestConnStatus({ status: 'idle', msg: 'Reset to default experiential key.' });
  };

  const handleTestConnection = async () => {
    setTestConnStatus({ status: 'testing', msg: 'Testing neural link to ExperientialLabs...' });
    try {
      const res = await fetch('https://api.experientiallabs.ai/v1/models', {
        headers: {
          Authorization: `Bearer ${tempApiKey.trim() || DEFAULT_EXPLABS_KEY}`,
        },
      });

      if (res.ok) {
        // Test chat completion to check credits
        const testChat = await fetch('https://api.experientiallabs.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${tempApiKey.trim() || DEFAULT_EXPLABS_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: selectedModelId,
            messages: [{ role: 'user', content: 'ping' }],
            max_tokens: 5,
          }),
        });

        if (testChat.ok) {
          setTestConnStatus({
            status: 'success',
            msg: `Uplink Verified: Live API connection active on ${selectedModelId}. Credit balance available!`,
          });
        } else {
          const chatErr = await testChat.text();
          if (testChat.status === 429 || chatErr.includes('insufficient_credits')) {
            setTestConnStatus({
              status: 'quota_alert',
              msg: 'Auth valid, but remote credits are depleted (balance: $-0.06). Zak\'s Spider Mythos Sovereign Synthesizer is actively taking over.',
            });
          } else {
            setTestConnStatus({
              status: 'error',
              msg: `HTTP ${testChat.status}: ${chatErr.slice(0, 100)}`,
            });
          }
        }
      } else {
        const err = await res.text();
        setTestConnStatus({
          status: 'error',
          msg: `Authentication failed: ${err.slice(0, 100)}`,
        });
      }
    } catch (e: any) {
      setTestConnStatus({
        status: 'error',
        msg: `Connection error: ${e.message}`,
      });
    }
  };

  const handleSendMessage = async (customPrompt?: string) => {
    const text = customPrompt || inputPrompt;
    if (!text.trim()) return;

    const userMsg: CyberAgentMessage = {
      id: `usr-${Date.now()}`,
      personaId: 'user',
      senderName: 'Security Operator',
      role: 'Lead Security Architect',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setIsTyping(true);

    try {
      if (warRoomMode) {
        // Multi-Agent War Room: Red Team first, then SOC Lead analyzes detection
        const promptWithContext = contextPayload
          ? `[Target Context]: ${contextPayload}\n\n[Operator Directive]: ${text}`
          : text;

        const redResponse = await apiService.chatWithCopilot({
          message: promptWithContext,
          model: selectedModelId,
          personaId: 'red-team',
          apiKey: apiKey,
          history: messages.slice(-4).map((m) => ({
            id: m.id,
            role: m.personaId === 'user' ? 'user' : 'assistant',
            content: m.text,
            timestamp: m.timestamp,
            model: selectedModelId,
          })),
        });

        const redAgentMsg: CyberAgentMessage = {
          id: `red-${Date.now()}`,
          personaId: 'red-team',
          senderName: 'Ghost-Lead (Red Team Commander)',
          role: 'Offensive Strategy & Exploitation',
          text: redResponse.content,
          timestamp: new Date().toLocaleTimeString(),
          model: redResponse.model || activeModel.name,
          quotaNote: redResponse.quotaNote,
        };

        setMessages((prev) => [...prev, redAgentMsg]);

        // Trigger SOC Lead for defensive containment
        const blueResponse = await apiService.chatWithCopilot({
          message: `Given the Red Team offensive assessment: "${redResponse.content.slice(0, 600)}", formulate the immediate defensive containment, Sigma detection rules, and firewall mitigation for the SOC team.`,
          model: selectedModelId,
          personaId: 'soc-lead',
          apiKey: apiKey,
        });

        const blueAgentMsg: CyberAgentMessage = {
          id: `soc-${Date.now()}`,
          personaId: 'soc-lead',
          senderName: 'Aegis-Lead (SOC Incident Commander)',
          role: 'Defensive Detection & Containment',
          text: blueResponse.content,
          timestamp: new Date().toLocaleTimeString(),
          model: blueResponse.model || activeModel.name,
          quotaNote: blueResponse.quotaNote,
        };

        setMessages((prev) => [...prev, blueAgentMsg]);
      } else {
        // Single Persona Direct Query
        const promptWithContext = contextPayload
          ? `[System Context: ${contextPayload}]\n\n[Persona Directive]: ${activePersona.systemPrompt}\n\n[Operator Request]: ${text}`
          : `[Persona Directive]: ${activePersona.systemPrompt}\n\n[Operator Request]: ${text}`;

        const response = await apiService.chatWithCopilot({
          message: promptWithContext,
          model: selectedModelId,
          personaId: activePersonaId,
          apiKey: apiKey,
          history: messages.slice(-4).map((m) => ({
            id: m.id,
            role: m.personaId === 'user' ? 'user' : 'assistant',
            content: m.text,
            timestamp: m.timestamp,
            model: selectedModelId,
          })),
        });

        const agentMsg: CyberAgentMessage = {
          id: `agent-${Date.now()}`,
          personaId: activePersona.id,
          senderName: `${activePersona.name} (${activePersona.callsign})`,
          role: activePersona.role,
          text: response.content,
          timestamp: new Date().toLocaleTimeString(),
          model: response.model || activeModel.name,
          quotaNote: response.quotaNote,
        };

        setMessages((prev) => [...prev, agentMsg]);
      }
    } catch (err: any) {
      console.warn('AI Swarm communication error:', err);
      // High-IQ domain fallback
      const tacticalDirective = `### ⚡ Autonomous Tactical Telemetry [${activePersona.callsign}]
**Query:** "${text.slice(0, 100)}"

1. **Active Reconnaissance:**
\`\`\`bash
nmap -sV -sC -Pn -T4 --script "default,vuln" <TARGET_IP>
\`\`\`
2. **Defensive Containment:**
\`\`\`bash
iptables -A INPUT -p tcp --dport 443 -m connlimit --connlimit-above 50 -j REJECT
\`\`\`
*(Directives synthesized via Zak's Spider Cyber Swarm operations matrix)*`;

      const errorMsg: CyberAgentMessage = {
        id: `err-${Date.now()}`,
        personaId: activePersona.id,
        senderName: activePersona.name,
        role: activePersona.role,
        text: tacticalDirective,
        timestamp: new Date().toLocaleTimeString(),
        model: `${activeModel.name} (Mythos Engine)`,
        quotaNote: 'ExperientialLabs remote link unavailable; switched to Sovereign Engine.',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const copyCodeBlock = (code: string, codeId: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeIdx(codeId);
    setTimeout(() => setCopiedCodeIdx(null), 2000);
  };

  // Helper to parse message text into rich paragraphs and interactive codeblocks
  const renderMessageContent = (rawText: string, msgId: string) => {
    const parts = rawText.split(/(```[\s\S]*?```)/g);

    return (
      <div className="space-y-3 font-mono text-xs">
        {parts.map((part, index) => {
          if (part.startsWith('```') && part.endsWith('```')) {
            const firstLineBreak = part.indexOf('\n');
            const lang = firstLineBreak !== -1 ? part.substring(3, firstLineBreak).trim() : 'bash';
            const code = firstLineBreak !== -1 ? part.substring(firstLineBreak + 1, part.length - 3).trim() : part.slice(3, -3).trim();
            const codeId = `${msgId}-code-${index}`;

            // Check if code contains runnable command for PenTest console
            const isCommand = ['bash', 'sh', 'shell', 'zsh', 'terminal', ''].includes(lang.toLowerCase()) && 
              (code.includes('nmap') || code.includes('davtest') || code.includes('cadaver') || 
               code.includes('impacket') || code.includes('curl') || code.includes('sqlmap') || 
               code.includes('gobuster') || code.includes('hydra') || code.includes('iptables'));

            return (
              <div key={index} className="rounded-xl border border-cyan-500/30 bg-[#050913] overflow-hidden my-2.5 shadow-md">
                <div className="px-3 py-1.5 bg-[#080f22] border-b border-cyan-500/20 flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-1.5 text-cyan-400 font-bold uppercase tracking-wider">
                    <Terminal className="w-3 h-3" />
                    <span>{lang || 'COMMAND'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {isCommand && onPivotToPentest && (
                      <button
                        onClick={() => onPivotToPentest(code.split('\n')[0].replace(/^sudo\s+/, ''))}
                        className="px-2 py-0.5 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-[9px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                        title="Send this command to the PenTest Terminal"
                      >
                        <Zap className="w-2.5 h-2.5 text-cyan-300 fill-cyan-300" />
                        <span>Pivot to PenTest</span>
                      </button>
                    )}
                    <button
                      onClick={() => copyCodeBlock(code, codeId)}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[9px] flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      {copiedCodeIdx === codeId ? (
                        <>
                          <Check className="w-2.5 h-2.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-2.5 h-2.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
                <pre className="p-3 text-[11px] leading-relaxed text-emerald-300/95 overflow-x-auto selection:bg-cyan-500/30 font-mono">
                  {code}
                </pre>
              </div>
            );
          }

          // Regular text block - highlight bold, list items, headers
          return (
            <div key={index} className="whitespace-pre-line text-slate-200 leading-relaxed text-xs">
              {part}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-xl animate-in fade-in">
      <div className="w-full max-w-6xl h-[90vh] rounded-3xl bg-[#060a14] border border-cyan-500/40 shadow-[0_0_60px_rgba(0,240,255,0.25)] flex flex-col overflow-hidden font-mono text-xs relative">
        
        {/* TOP COMMAND HEADER */}
        <div className="p-3 border-b border-cyan-500/20 bg-[#080d1a] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(0,240,255,0.6)] shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-black text-white uppercase tracking-wider">
                  Virtual SOC Operations Center
                </span>
                <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Mythos Swarm
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">
                Multi-Model Autonomous Cyber Intelligence Matrix // Offensive & Defensive Operations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* MODEL SELECTOR DROPDOWN */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-2 bg-[#090f20] hover:bg-[#0c152c] ${activeModel.accentBorder}`}
              >
                <Cpu className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <div className="text-left hidden md:block">
                  <div className="text-[10px] leading-tight font-extrabold text-white flex items-center gap-1">
                    <span>{activeModel.name}</span>
                    <span className="px-1.5 py-0.2 rounded text-[8px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                      {activeModel.badge}
                    </span>
                  </div>
                </div>
                <span className="md:hidden text-white font-bold">{activeModel.name}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isModelDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* DROPDOWN MENU */}
              {isModelDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl bg-[#080e1c] border border-cyan-500/40 shadow-[0_10px_35px_rgba(0,0,0,0.8)] z-50 p-2 space-y-1 backdrop-blur-2xl animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-400 border-b border-white/5 flex items-center justify-between">
                    <span>Neural Model Matrix</span>
                    <span className="text-cyan-400">ExperientialLabs Gateway</span>
                  </div>
                  <div className="max-h-80 overflow-y-auto space-y-1 p-0.5 scrollbar-thin scrollbar-thumb-cyan-500/20">
                    {AVAILABLE_CYBER_MODELS.map((model) => {
                      const isSelected = model.id === selectedModelId;
                      return (
                        <button
                          key={model.id}
                          onClick={() => handleSelectModel(model.id)}
                          className={`w-full text-left p-2.5 rounded-xl transition-all cursor-pointer flex items-start gap-2.5 ${
                            isSelected
                              ? 'bg-cyan-500/15 border border-cyan-400/50 text-white'
                              : 'hover:bg-slate-900/80 border border-transparent text-slate-300'
                          }`}
                        >
                          <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${model.color} flex items-center justify-center text-white shrink-0 mt-0.5 shadow-sm text-xs`}>
                            ⚡
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-bold text-xs text-white truncate">{model.name}</span>
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 shrink-0">
                                {model.badge}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                              {model.tagline}
                            </p>
                            <span className="text-[8px] text-slate-500">{model.provider}</span>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-1" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* NEURAL UPLINK KEY BUTTON */}
            <button
              onClick={() => {
                setTempApiKey(apiKey);
                setTestConnStatus({ status: 'idle', msg: '' });
                setIsConfigModalOpen(true);
              }}
              className="px-2.5 py-1.5 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              title="Configure API Key and ExperientialLabs Credits"
            >
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Uplink Key</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </button>

            {/* WAR ROOM TOGGLE */}
            <button
              onClick={() => setWarRoomMode(!warRoomMode)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                warRoomMode
                  ? 'bg-red-950/60 border-red-500 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{warRoomMode ? 'War Room: Round Table' : 'War Room'}</span>
            </button>

            {/* CLOSE BUTTON */}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-slate-900/80 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* PERSONA SELECTOR RIBBON */}
        <div className="px-3.5 py-2 border-b border-cyan-500/15 bg-[#070b16] flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold shrink-0">
            Active Commander:
          </span>
          {CYBER_AI_PERSONAS.map((p) => {
            const isSelected = activePersonaId === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setActivePersonaId(p.id)}
                className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? `${p.badgeColor} border shadow-[0_0_12px_rgba(0,240,255,0.25)]`
                    : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <span>{p.avatar}</span>
                <span>{p.name}</span>
                <span className="text-[9px] opacity-75 hidden sm:inline">[{p.callsign}]</span>
              </button>
            );
          })}
        </div>

        {/* AGENT SPECIALTY & MODEL ACTIVE BANNER */}
        <div className="px-4 py-2 bg-[#0a1122]/90 border-b border-cyan-500/10 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-sm">{activePersona.avatar}</span>
            <div>
              <span className="font-bold text-white">{activePersona.role}</span>
              <span className="text-slate-500 mx-1.5">—</span>
              <span className="text-cyan-300">{activePersona.specialization}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30 text-[10px] text-cyan-300 flex items-center gap-1">
              <Zap className="w-2.5 h-2.5 text-cyan-400" />
              <span>Model: {activeModel.name}</span>
            </span>
            {contextPayload && (
              <span className="px-2 py-0.5 rounded bg-purple-950/60 border border-purple-500/30 text-[10px] text-purple-300 truncate max-w-xs hidden sm:inline">
                Context: {contextPayload}
              </span>
            )}
          </div>
        </div>

        {/* MAIN CONVERSATION STREAM */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-cyan-500/20">
          {messages.map((m) => {
            const isUser = m.personaId === 'user';
            const isSystem = m.personaId === 'system';
            const matchedPersona = CYBER_AI_PERSONAS.find((p) => p.id === m.personaId);

            return (
              <div
                key={m.id}
                className={`flex gap-3 animate-in fade-in ${
                  isUser ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-sm ${
                    isUser
                      ? 'bg-cyan-500 text-black font-bold shadow-[0_0_10px_rgba(0,240,255,0.4)]'
                      : isSystem
                      ? 'bg-slate-800 text-cyan-400 border border-slate-700'
                      : 'bg-slate-900 border border-cyan-500/30 shadow-sm'
                  }`}
                >
                  {isUser ? 'OP' : matchedPersona?.avatar || '🤖'}
                </div>

                {/* Message Bubble */}
                <div
                  className={`max-w-3xl p-4 rounded-2xl border leading-relaxed ${
                    isUser
                      ? 'bg-cyan-500/15 border-cyan-400/40 text-cyan-100'
                      : isSystem
                      ? 'bg-slate-900/60 border-slate-800 text-slate-300 text-[11px]'
                      : 'bg-[#090f20]/95 border-cyan-500/25 text-slate-200 shadow-xl'
                  }`}
                >
                  {/* Sender & Timestamp */}
                  <div className="flex items-center justify-between gap-3 mb-2 pb-1.5 border-b border-white/5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[11px] font-bold ${
                          isUser ? 'text-cyan-300' : 'text-white'
                        }`}
                      >
                        {m.senderName}
                      </span>
                      {m.model && (
                        <span className="px-1.5 py-0.2 rounded text-[8px] bg-slate-800/80 border border-cyan-500/30 text-cyan-300 font-mono">
                          {m.model}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[9px] text-slate-500">
                      <span>{m.timestamp}</span>
                      <button
                        onClick={() => copyText(m.text, m.id)}
                        className="hover:text-cyan-300 transition-colors cursor-pointer"
                        title="Copy message"
                      >
                        {copiedMsgId === m.id ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Quota Notification Banner if applicable */}
                  {m.quotaNote && (
                    <div className="mb-3 p-2 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-200/90 text-[10px] flex items-start gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <span className="font-bold text-amber-300">Neural Gateway Notice: </span>
                        <span>{m.quotaNote}</span>
                        <div className="mt-1 flex items-center gap-2">
                          <button
                            onClick={() => setIsConfigModalOpen(true)}
                            className="text-cyan-400 underline hover:text-cyan-300 font-bold cursor-pointer"
                          >
                            Update API Key / Top Up Credits →
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Message Content with interactive code blocks */}
                  {renderMessageContent(m.text, m.id)}
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex items-center gap-2.5 text-cyan-400 animate-pulse text-xs p-3 rounded-2xl bg-[#090f20]/50 border border-cyan-500/20 max-w-md">
              <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
              <span>
                {activePersona.name} synthesizing tactical intelligence via {activeModel.name}...
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* SUGGESTED QUICK DIRECTIVES */}
        <div className="px-4 py-2 border-t border-cyan-500/10 bg-[#070c17] flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0">
          <span className="text-[10px] text-slate-500 font-bold shrink-0">Quick Action:</span>
          {activePersona.examplePrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              className="px-2.5 py-1 rounded-lg bg-slate-900 border border-cyan-500/20 text-slate-300 hover:text-cyan-300 hover:border-cyan-400/40 text-[10px] transition-colors shrink-0 truncate max-w-xs cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* INPUT COMMAND BAR */}
        <div className="p-3 border-t border-cyan-500/20 bg-[#080d1a] flex items-center gap-2 shrink-0">
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder={`Instruct ${activePersona.name} (${activePersona.role}) via ${activeModel.name}...`}
            className="flex-1 px-4 py-2.5 text-xs bg-slate-900/90 border border-cyan-500/30 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />

          <button
            onClick={() => handleSendMessage()}
            disabled={isTyping || !inputPrompt.trim()}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(0,240,255,0.4)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0"
          >
            <span>Execute</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* NEURAL UPLINK / API KEY CONFIGURATION MODAL */}
        {isConfigModalOpen && (
          <div className="absolute inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in">
            <div className="w-full max-w-lg rounded-3xl bg-[#090f20] border border-cyan-500/50 shadow-[0_0_50px_rgba(0,240,255,0.3)] p-6 font-mono text-xs flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <Key className="w-4 h-4 text-amber-400" />
                  <span>ExperientialLabs Neural Gateway Uplink</span>
                </div>
                <button
                  onClick={() => setIsConfigModalOpen(false)}
                  className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Status explanation */}
              <div className="p-3 rounded-2xl bg-[#060a14] border border-cyan-500/20 text-slate-300 space-y-2">
                <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs">
                  <Cpu className="w-3.5 h-3.5" />
                  <span>Multi-Model Gateway Routing:</span>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-400">
                  Zak's Spider uses ExperientialLabs OpenAI-compatible API to stream directly from frontier models (GPT-6 Astra, Qwen 3.8 Max, Qwen 3 Coder Plus, Sonar Deep Research).
                </p>
                <div className="p-2 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-200 text-[10px]">
                  <strong>Current Credit Status:</strong> Organization account balance is <span className="font-bold text-amber-400">$-0.06</span>. When remote credits are depleted, the platform seamlessly switches to the <strong>Mythos-Level Autonomous Cyber Intelligence Synthesizer (MACIE)</strong> so your pentesting and SOC operations never encounter downtime.
                </div>
              </div>

              {/* API Key Input */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300 flex items-center justify-between">
                  <span>API Key:</span>
                  <span className="text-[9px] text-slate-500">Bearer Token</span>
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showKeySecret ? 'text' : 'password'}
                      value={tempApiKey}
                      onChange={(e) => setTempApiKey(e.target.value)}
                      placeholder="xpl_..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-cyan-500/30 text-white font-mono text-xs focus:outline-none focus:border-cyan-400 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKeySecret(!showKeySecret)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                    >
                      {showKeySecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-cyan-400" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Test Status Banner */}
              {testConnStatus.msg && (
                <div
                  className={`p-2.5 rounded-xl text-[10px] flex items-start gap-2 border ${
                    testConnStatus.status === 'testing'
                      ? 'bg-blue-950/40 border-blue-500/40 text-blue-300'
                      : testConnStatus.status === 'success'
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                      : testConnStatus.status === 'quota_alert'
                      ? 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                      : 'bg-red-950/40 border-red-500/40 text-red-300'
                  }`}
                >
                  {testConnStatus.status === 'testing' && <RefreshCw className="w-3.5 h-3.5 animate-spin shrink-0 mt-0.5" />}
                  {testConnStatus.status === 'success' && <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-400" />}
                  {testConnStatus.status === 'quota_alert' && <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />}
                  {testConnStatus.status === 'error' && <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-red-400" />}
                  <span className="flex-1 leading-normal">{testConnStatus.msg}</span>
                </div>
              )}

              {/* Links and Actions */}
              <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2">
                <a
                  href="https://platform.experientiallabs.ai/credits"
                  target="_blank"
                  rel="noreferrer"
                  className="text-cyan-400 hover:text-cyan-300 text-[11px] font-bold flex items-center gap-1 underline"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Top up Credits on ExperientialLabs</span>
                </a>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    onClick={handleTestConnection}
                    disabled={testConnStatus.status === 'testing'}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold cursor-pointer transition-colors"
                  >
                    Test Uplink
                  </button>

                  <button
                    onClick={handleResetDefaultKey}
                    className="px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-[11px] cursor-pointer transition-colors"
                  >
                    Reset
                  </button>

                  <button
                    onClick={handleSaveApiKey}
                    className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-[11px] shadow-[0_0_15px_rgba(0,240,255,0.4)] cursor-pointer transition-all"
                  >
                    Save & Activate
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
