import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, Terminal, Shield, Fingerprint, Cpu, Award, 
  Send, RefreshCw, Copy, Check, Sparkles, MessageSquare, 
  ChevronRight, X, Maximize2, Minimize2, Layers, AlertCircle
} from 'lucide-react';
import { CyberAiPersonaId, CyberAiAgentPersona, CyberAgentMessage } from '../../types';
import { apiService } from '../../services/api';

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
  const [messages, setMessages] = useState<CyberAgentMessage[]>([
    {
      id: 'msg-welcome',
      personaId: 'system',
      senderName: 'Zak\'s Spider Cyber Swarm',
      role: 'Autonomous AI Security Operations Center',
      text: 'Virtual SOC Operations Center online. 5 specialized AI cyber operators standing by for PenTest, DFIR, SOC triage, binary reverse engineering, and executive briefing.',
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [warRoomMode, setWarRoomMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activePersona = CYBER_AI_PERSONAS.find((p) => p.id === activePersonaId) || CYBER_AI_PERSONAS[0];

  useEffect(() => {
    if (initialPrompt && isOpen) {
      setInputPrompt(initialPrompt);
    }
  }, [initialPrompt, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (!isOpen) return null;

  const handleSendMessage = async (customPrompt?: string) => {
    const text = customPrompt || inputPrompt;
    if (!text.trim()) return;

    const userMsg: CyberAgentMessage = {
      id: `usr-${Date.now()}`,
      personaId: 'user',
      senderName: 'Security Operator',
      role: 'Lead Researcher',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setIsTyping(true);

    try {
      if (warRoomMode) {
        // Multi-Agent Round Table: Red Team speaks first, then Blue Team generates response
        const promptWithContext = contextPayload
          ? `[Target Context]: ${contextPayload}\n\n[Operator Directive]: ${text}`
          : text;

        const response = await apiService.chatWithCopilot({
          message: promptWithContext,
          model: 'gpt-6-astra',
          personaId: 'widow-lead',
          history: messages.slice(-4).map((m) => ({
            id: m.id,
            role: m.personaId === 'user' ? 'user' : 'assistant',
            content: m.text,
            timestamp: m.timestamp,
            model: 'gpt-6-astra',
          })),
        });

        const redAgentMsg: CyberAgentMessage = {
          id: `red-${Date.now()}`,
          personaId: 'red-team',
          senderName: 'Ghost-Lead (Red Team)',
          role: 'Offensive Strategy',
          text: response.content || 'Offensive posture analyzed.',
          timestamp: new Date().toLocaleTimeString(),
        };

        setMessages((prev) => [...prev, redAgentMsg]);

        // Trigger SOC Lead for defensive containment
        const blueResponse = await apiService.chatWithCopilot({
          message: `Given the Red Team assessment: "${response.content.slice(0, 500)}", formulate the defensive detection and containment playbook for the SOC team.`,
          model: 'gpt-6-astra',
          personaId: 'blue-team',
        });

        const blueAgentMsg: CyberAgentMessage = {
          id: `soc-${Date.now()}`,
          personaId: 'soc-lead',
          senderName: 'Aegis-Lead (SOC Lead)',
          role: 'Defensive Mitigation',
          text: blueResponse.content || 'Defensive rules synchronized.',
          timestamp: new Date().toLocaleTimeString(),
        };

        setMessages((prev) => [...prev, blueAgentMsg]);
      } else {
        // Single Persona Direct Query
        const promptWithContext = contextPayload
          ? `[System Context: ${contextPayload}]\n\n[Persona Directive]: ${activePersona.systemPrompt}\n\n[Operator Request]: ${text}`
          : `[Persona Directive]: ${activePersona.systemPrompt}\n\n[Operator Request]: ${text}`;

        const response = await apiService.chatWithCopilot({
          message: promptWithContext,
          model: 'gpt-6-astra',
          personaId: activePersonaId === 'red-team' ? 'widow-lead' : 'blue-team',
          history: messages.slice(-4).map((m) => ({
            id: m.id,
            role: m.personaId === 'user' ? 'user' : 'assistant',
            content: m.text,
            timestamp: m.timestamp,
            model: 'gpt-6-astra',
          })),
        });

        const agentMsg: CyberAgentMessage = {
          id: `agent-${Date.now()}`,
          personaId: activePersona.id,
          senderName: `${activePersona.name} (${activePersona.callsign})`,
          role: activePersona.role,
          text: response.content || 'Operation complete.',
          timestamp: new Date().toLocaleTimeString(),
        };

        setMessages((prev) => [...prev, agentMsg]);
      }
    } catch (err) {
      console.warn('AI Swarm communication error:', err);
      const errorMsg: CyberAgentMessage = {
        id: `err-${Date.now()}`,
        personaId: activePersona.id,
        senderName: activePersona.name,
        role: activePersona.role,
        text: 'Neural uplink established with fallback telemetry. Operator recommendation: Proceed with authorized methodology and inspect local signature databases.',
        timestamp: new Date().toLocaleTimeString(),
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl animate-in fade-in">
      <div className="w-full max-w-5xl h-[88vh] rounded-3xl bg-[#060a14] border border-cyan-500/40 shadow-[0_0_50px_rgba(0,240,255,0.25)] flex flex-col overflow-hidden font-mono text-xs relative">
        {/* Top Header */}
        <div className="p-3.5 border-b border-cyan-500/20 bg-[#080d1a] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white shadow-[0_0_12px_rgba(0,240,255,0.5)]">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-white uppercase tracking-wider">
                  Virtual SOC Operations Center
                </span>
                <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  GPT-6 Astra Cyber Swarm
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                Autonomous Multi-Agent Collaboration Matrix // Classified Defense
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* War Room Toggle */}
            <button
              onClick={() => setWarRoomMode(!warRoomMode)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                warRoomMode
                  ? 'bg-red-950/60 border-red-500 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{warRoomMode ? 'War Room: Round Table (Active)' : 'War Room Mode'}</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-slate-900/80 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Persona Selector Ribbon */}
        <div className="px-3.5 py-2 border-b border-cyan-500/15 bg-[#070b16] flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold shrink-0">
            Active Agent:
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

        {/* Agent Specialty Banner */}
        <div className="px-4 py-2 bg-[#0a1122]/90 border-b border-cyan-500/10 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm">{activePersona.avatar}</span>
            <div>
              <span className="font-bold text-white">{activePersona.role}</span>
              <span className="text-slate-400 mx-1.5">—</span>
              <span className="text-cyan-300">{activePersona.specialization}</span>
            </div>
          </div>
          {contextPayload && (
            <span className="px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30 text-[10px] text-cyan-300 truncate max-w-xs">
              Context: {contextPayload}
            </span>
          )}
        </div>

        {/* Main Conversation Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5 scrollbar-thin scrollbar-thumb-cyan-500/20">
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
                  className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-sm ${
                    isUser
                      ? 'bg-cyan-500 text-black font-bold'
                      : isSystem
                      ? 'bg-slate-800 text-cyan-400'
                      : 'bg-slate-900 border border-cyan-500/30'
                  }`}
                >
                  {isUser ? 'OP' : matchedPersona?.avatar || '🤖'}
                </div>

                {/* Message Bubble */}
                <div
                  className={`max-w-2xl p-3.5 rounded-2xl border leading-relaxed ${
                    isUser
                      ? 'bg-cyan-500/15 border-cyan-400/40 text-cyan-100'
                      : isSystem
                      ? 'bg-slate-900/60 border-slate-800 text-slate-400 text-[11px]'
                      : 'bg-[#090f20]/90 border-cyan-500/25 text-slate-200 shadow-lg'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 mb-1.5 pb-1 border-b border-white/5">
                    <span
                      className={`text-[10px] font-bold ${
                        isUser ? 'text-cyan-300' : 'text-slate-300'
                      }`}
                    >
                      {m.senderName}
                    </span>
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

                  <div className="whitespace-pre-line text-xs font-mono text-slate-200">
                    {m.text}
                  </div>
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex items-center gap-2.5 text-cyan-400 animate-pulse text-xs">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>{activePersona.name} formulating tactical response via GPT-6 Astra...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Directives */}
        <div className="px-4 py-2 border-t border-cyan-500/10 bg-[#070c17] flex items-center gap-2 overflow-x-auto scrollbar-none">
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

        {/* Input Bar */}
        <div className="p-3 border-t border-cyan-500/20 bg-[#080d1a] flex items-center gap-2">
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
            placeholder={`Instruct ${activePersona.name} (${activePersona.role})...`}
            className="flex-1 px-4 py-2.5 text-xs bg-slate-900/90 border border-cyan-500/30 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />

          <button
            onClick={() => handleSendMessage()}
            disabled={isTyping || !inputPrompt.trim()}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(0,240,255,0.4)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <span>Execute</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
