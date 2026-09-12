import React, { useState, useMemo } from 'react';
import { 
  Wifi, ShieldAlert, AlertTriangle, Search, Terminal, 
  Layers, Lock, Copy, Check, Filter, ExternalLink, 
  ArrowRight, ShieldCheck, Database, FileText
} from 'lucide-react';

export interface PcapPacket {
  frameNo: number;
  timeOffset: string;
  sourceIp: string;
  destIp: string;
  protocol: 'DNS' | 'TLS' | 'HTTP' | 'SMB' | 'TCP' | 'ICMP';
  lengthBytes: number;
  info: string;
  isFlagged?: boolean;
  threatTag?: string;
}

export interface Ja3FingerprintDef {
  hash: string;
  name: string;
  category: 'MALWARE_C2' | 'SUSPICIOUS' | 'BENIGN_BROWSER';
  threatActor?: string;
  description: string;
  clientHelloHexSnippet: string;
}

export interface DnsAnomalyRecord {
  query: string;
  type: string;
  entropy: number;
  length: number;
  exfilRisk: 'CRITICAL_EXFIL' | 'SUSPICIOUS_DGA' | 'BENIGN';
  reason: string;
}

export interface PcapPreset {
  id: string;
  title: string;
  captureSource: string;
  packetCount: number;
  totalBytes: string;
  duration: string;
  summary: string;
  protocolBreakdown: { proto: string; packets: number; bytes: number; percentage: number }[];
  packets: PcapPacket[];
  ja3Matches: Ja3FingerprintDef[];
  dnsAnomalies: DnsAnomalyRecord[];
  tcpStream: {
    clientToServer: string;
    serverToClient: string;
  };
}

export const PCAP_PRESETS: PcapPreset[] = [
  {
    id: 'dns-tunnel-exfil',
    title: 'DNS Tunneling & Base64 Data Exfiltration Capture',
    captureSource: 'EDGE-FW01 / eth0 Ingress Mirror',
    packetCount: 1420,
    totalBytes: '3.4 MB',
    duration: '04m 12s',
    summary: 'Attacker utilizing dnscat2 / iodine payload encapsulation across high-entropy TXT subdomains querying rogue nameserver ns1.evil-apt.ru.',
    protocolBreakdown: [
      { proto: 'DNS', packets: 980, bytes: 2450000, percentage: 72.1 },
      { proto: 'TLS', packets: 240, bytes: 680000, percentage: 20.0 },
      { proto: 'TCP', packets: 160, bytes: 210000, percentage: 6.2 },
      { proto: 'ICMP', packets: 40, bytes: 58000, percentage: 1.7 },
    ],
    packets: [
      { frameNo: 1, timeOffset: '0.000000', sourceIp: '10.0.4.12', destIp: '198.51.100.42', protocol: 'DNS', lengthBytes: 294, info: 'Standard query 0x1a4b TXT aW52b2ljZV9maW5hbmNlX3NlY3JldF9kYXRh.tunnel.evil-apt.ru', isFlagged: true, threatTag: 'DNS Exfil Chunk #1' },
      { frameNo: 2, timeOffset: '0.012450', sourceIp: '198.51.100.42', destIp: '10.0.4.12', protocol: 'DNS', lengthBytes: 310, info: 'Standard query response 0x1a4b TXT "ACK_CHUNK_001_RECEIVED_NEXT"', isFlagged: true, threatTag: 'C2 Handshake ACK' },
      { frameNo: 3, timeOffset: '0.045120', sourceIp: '10.0.4.12', destIp: '198.51.100.42', protocol: 'DNS', lengthBytes: 420, info: 'Standard query 0x1a4c TXT YWRtaW5fcGFzc3dvcmRfaGFzaGVzX250bG1fdjI.tunnel.evil-apt.ru', isFlagged: true, threatTag: 'Credential Dump Exfil' },
      { frameNo: 4, timeOffset: '0.059880', sourceIp: '198.51.100.42', destIp: '10.0.4.12', protocol: 'DNS', lengthBytes: 280, info: 'Standard query response 0x1a4c TXT "ACK_CHUNK_002_OK"', isFlagged: true, threatTag: 'C2 Handshake ACK' },
      { frameNo: 5, timeOffset: '0.120400', sourceIp: '10.0.4.12', destIp: '1.1.1.1', protocol: 'DNS', lengthBytes: 74, info: 'Standard query 0x0002 A updates.microsoft.com', isFlagged: false },
      { frameNo: 6, timeOffset: '0.134200', sourceIp: '1.1.1.1', destIp: '10.0.4.12', protocol: 'DNS', lengthBytes: 90, info: 'Standard query response 0x0002 A 20.112.52.29', isFlagged: false },
    ],
    ja3Matches: [
      {
        hash: 'a0e9f5d64349fb13191bc781f81f42e1',
        name: 'Cobalt Strike Malleable C2 Beacon',
        category: 'MALWARE_C2',
        threatActor: 'APT29 / Nobelium / DarkHalo',
        description: 'Hardcoded cipher suites [49199-49195-49200-49196] and TLS extension grease absence typical of default Cobalt Strike HTTPS profile.',
        clientHelloHexSnippet: '16 03 01 01 0a 01 00 01 06 03 03 a0 e9 f5 d6 43 49 fb 13 ...',
      },
      {
        hash: 'b32309a26951912be7dba376398abc3b',
        name: 'Metasploit windows/meterpreter/reverse_https',
        category: 'SUSPICIOUS',
        description: 'Randomized CN SSL certificate and predictable TLS 1.2 client hello parameter handshake.',
        clientHelloHexSnippet: '16 03 03 00 c8 01 00 00 c4 03 03 b3 23 09 a2 69 51 91 2b ...',
      },
    ],
    dnsAnomalies: [
      {
        query: 'aW52b2ljZV9maW5hbmNlX3NlY3JldF9kYXRh.tunnel.evil-apt.ru',
        type: 'TXT',
        entropy: 4.62,
        length: 56,
        exfilRisk: 'CRITICAL_EXFIL',
        reason: 'Shannon entropy 4.62 > 3.8 threshold. High-density alphanumeric base64 payload in subdomain chunk.',
      },
      {
        query: 'YWRtaW5fcGFzc3dvcmRfaGFzaGVzX250bG1fdjI.tunnel.evil-apt.ru',
        type: 'TXT',
        entropy: 4.81,
        length: 59,
        exfilRisk: 'CRITICAL_EXFIL',
        reason: 'Large payload with repeating base64 padding format querying external authoritative name-server.',
      },
      {
        query: 'djk2381fhz92147hfas912.evil-apt.ru',
        type: 'A',
        entropy: 3.94,
        length: 34,
        exfilRisk: 'SUSPICIOUS_DGA',
        reason: 'Domain generation algorithm (DGA) pseudo-random consonant clustering detected.',
      },
    ],
    tcpStream: {
      clientToServer: 'POST /v2/api/sync HTTP/1.1\r\nHost: update-microsoft-cdn.evil-apt.ru\r\nUser-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)\r\nCookie: SESSIONID=9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08\r\nContent-Length: 64\r\n\r\n[STAGE-2-ENCRYPTED-HEARTBEAT-PAYLOAD-AES256-HEX]',
      serverToClient: 'HTTP/1.1 200 OK\r\nServer: nginx/1.24.0\r\nContent-Type: application/octet-stream\r\nContent-Length: 32\r\n\r\n[CMD: SLEEP 60; JITTER 20; MIGRATETO 1428]',
    },
  },
  {
    id: 'cobalt-strike-tls-beacon',
    title: 'Cobalt Strike C2 HTTPS Beaconing & JA3 Match',
    captureSource: 'SOC-DMZ-SENSOR-03 / span port',
    packetCount: 890,
    totalBytes: '1.8 MB',
    duration: '12m 45s',
    summary: 'Periodic regular outbound beaconing pulses to external IP 198.51.100.42:443 with 60s jitter tolerance matching known Cobalt Strike JA3 signature.',
    protocolBreakdown: [
      { proto: 'TLS', packets: 620, bytes: 1420000, percentage: 78.9 },
      { proto: 'DNS', packets: 180, bytes: 240000, percentage: 13.3 },
      { proto: 'TCP', packets: 90, bytes: 140000, percentage: 7.8 },
    ],
    packets: [
      { frameNo: 1, timeOffset: '0.000000', sourceIp: '10.0.4.12', destIp: '198.51.100.42', protocol: 'TCP', lengthBytes: 66, info: '49812 → 443 [SYN] Seq=0 Win=64240 Len=0 MSS=1460 WS=256' },
      { frameNo: 2, timeOffset: '0.021000', sourceIp: '198.51.100.42', destIp: '10.0.4.12', protocol: 'TCP', lengthBytes: 66, info: '443 → 49812 [SYN, ACK] Seq=0 Ack=1 Win=65535 Len=0' },
      { frameNo: 3, timeOffset: '0.021100', sourceIp: '10.0.4.12', destIp: '198.51.100.42', protocol: 'TCP', lengthBytes: 54, info: '49812 → 443 [ACK] Seq=1 Ack=1 Win=64240 Len=0' },
      { frameNo: 4, timeOffset: '0.024500', sourceIp: '10.0.4.12', destIp: '198.51.100.42', protocol: 'TLS', lengthBytes: 517, info: 'Client Hello (JA3: a0e9f5d64349fb13191bc781f81f42e1)', isFlagged: true, threatTag: 'Cobalt Strike JA3 Match' },
      { frameNo: 5, timeOffset: '0.048900', sourceIp: '198.51.100.42', destIp: '10.0.4.12', protocol: 'TLS', lengthBytes: 1420, info: 'Server Hello, Certificate (Self-Signed untrusted CA)' },
    ],
    ja3Matches: [
      {
        hash: 'a0e9f5d64349fb13191bc781f81f42e1',
        name: 'Cobalt Strike Malleable C2 Beacon',
        category: 'MALWARE_C2',
        threatActor: 'APT29 / Nobelium',
        description: 'TLS Client Hello fingerprint matching Cobalt Strike 4.x beaconing configuration.',
        clientHelloHexSnippet: '16 03 01 01 0a 01 00 01 06 03 03 a0 e9 f5 d6 43 49 fb 13 ...',
      },
    ],
    dnsAnomalies: [],
    tcpStream: {
      clientToServer: 'TLS 1.2 Handshake [Encrypted Application Data]\r\nClient Random: 4a 12 b9 e0 19 ...',
      serverToClient: 'TLS 1.2 Handshake [Encrypted Application Data]\r\nServer Random: 88 df 11 02 c1 ...',
    },
  },
];

export const PcapForensicsAnalyzer: React.FC = () => {
  const [selectedPreset, setSelectedPreset] = useState<PcapPreset>(PCAP_PRESETS[0]);
  const [activeTab, setActiveTab] = useState<'PACKETS' | 'JA3' | 'DNS' | 'STREAM'>('PACKETS');
  const [filterProtocol, setFilterProtocol] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const filteredPackets = useMemo(() => {
    return selectedPreset.packets.filter(pkt => {
      if (filterProtocol !== 'ALL' && pkt.protocol !== filterProtocol) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        pkt.sourceIp.includes(q) ||
        pkt.destIp.includes(q) ||
        pkt.info.toLowerCase().includes(q) ||
        (pkt.threatTag && pkt.threatTag.toLowerCase().includes(q))
      );
    });
  }, [selectedPreset, filterProtocol, searchQuery]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(id);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  return (
    <div className="flex flex-col h-full w-full bg-black text-neutral-100 font-mono select-none overflow-hidden">
      {/* Top PCAP Meta Strip */}
      <div className="p-3 bg-neutral-950 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-neutral-900 border border-neutral-700 text-indigo-400">
            <Wifi className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-100">
                PCAP PACKET FORENSICS & TLS JA3/JA4 FINGERPRINT CORRELATOR
              </span>
              <span className="px-1.5 py-0.2 text-[9px] bg-indigo-950/80 border border-indigo-600 text-indigo-300">
                LIBPCAP / PCAPNG
              </span>
            </div>
            <div className="text-[10px] text-neutral-400 flex items-center gap-2">
              <span>SOURCE: {selectedPreset.captureSource}</span>
              <span>•</span>
              <span>PACKETS: {selectedPreset.packetCount.toLocaleString()}</span>
              <span>•</span>
              <span>SIZE: {selectedPreset.totalBytes}</span>
              <span>•</span>
              <span className="text-cyan-400">TIME: {selectedPreset.duration}</span>
            </div>
          </div>
        </div>

        {/* Preset Selector */}
        <div className="flex items-center gap-1.5 bg-neutral-900 p-0.5 border border-neutral-800">
          <span className="text-[10px] text-neutral-500 px-2 uppercase">CAPTURE PRESET:</span>
          {PCAP_PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedPreset(p)}
              className={`px-2 py-1 text-[10px] font-bold transition-all cursor-pointer ${
                selectedPreset.id === p.id
                  ? 'bg-neutral-800 text-cyan-300 border-b-2 border-cyan-400'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {p.title.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Protocol Bandwidth Bar */}
      <div className="px-3 py-2 bg-[#050505] border-b border-neutral-800 flex items-center justify-between gap-4 shrink-0 text-xs">
        <div className="flex items-center gap-2 flex-1">
          <span className="text-[10px] text-neutral-500 uppercase font-bold shrink-0">BANDWIDTH:</span>
          <div className="flex-1 h-3 bg-neutral-900 border border-neutral-800 flex overflow-hidden">
            {selectedPreset.protocolBreakdown.map((item, idx) => (
              <div
                key={idx}
                style={{ width: `${item.percentage}%` }}
                className={`h-full ${
                  item.proto === 'DNS' ? 'bg-cyan-500' :
                  item.proto === 'TLS' ? 'bg-indigo-500' :
                  item.proto === 'HTTP' ? 'bg-emerald-500' : 'bg-neutral-600'
                }`}
                title={`${item.proto}: ${item.percentage}% (${(item.bytes / 1024).toFixed(1)} KB)`}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 text-[10px]">
          {selectedPreset.protocolBreakdown.map((item, idx) => (
            <div key={idx} className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-none ${
                item.proto === 'DNS' ? 'bg-cyan-400' :
                item.proto === 'TLS' ? 'bg-indigo-400' :
                item.proto === 'HTTP' ? 'bg-emerald-400' : 'bg-neutral-500'
              }`} />
              <span className="text-neutral-300 font-bold">{item.proto}</span>
              <span className="text-neutral-500">({item.percentage}%)</span>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Sub-Tabs & Filtering */}
      <div className="px-3 py-1.5 bg-black border-b border-neutral-800 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('PACKETS')}
            className={`px-2.5 py-1 text-xs font-bold flex items-center gap-1.5 cursor-pointer border ${
              activeTab === 'PACKETS'
                ? 'bg-neutral-900 border-cyan-500 text-cyan-300'
                : 'bg-transparent border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>PACKET FRAMES ({selectedPreset.packets.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('JA3')}
            className={`px-2.5 py-1 text-xs font-bold flex items-center gap-1.5 cursor-pointer border ${
              activeTab === 'JA3'
                ? 'bg-neutral-900 border-indigo-500 text-indigo-300'
                : 'bg-transparent border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-indigo-400" />
            <span>JA3 FINGERPRINTS ({selectedPreset.ja3Matches.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('DNS')}
            className={`px-2.5 py-1 text-xs font-bold flex items-center gap-1.5 cursor-pointer border ${
              activeTab === 'DNS'
                ? 'bg-neutral-900 border-rose-500 text-rose-300'
                : 'bg-transparent border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>DNS TUNNELING RADAR ({selectedPreset.dnsAnomalies.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('STREAM')}
            className={`px-2.5 py-1 text-xs font-bold flex items-center gap-1.5 cursor-pointer border ${
              activeTab === 'STREAM'
                ? 'bg-neutral-900 border-emerald-500 text-emerald-300'
                : 'bg-transparent border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            <span>TCP STREAM FOLLOWER</span>
          </button>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-2">
          {activeTab === 'PACKETS' && (
            <select
              value={filterProtocol}
              onChange={(e) => setFilterProtocol(e.target.value)}
              className="bg-neutral-950 border border-neutral-800 text-neutral-300 text-xs px-2 py-0.5 focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">ALL PROTOCOLS</option>
              <option value="DNS">DNS</option>
              <option value="TLS">TLS</option>
              <option value="TCP">TCP</option>
              <option value="ICMP">ICMP</option>
            </select>
          )}

          <div className="relative w-56">
            <Search className="w-3 h-3 text-neutral-500 absolute left-2 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search IP, info, tag..."
              className="w-full pl-7 pr-2 py-0.5 bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-cyan-500 font-mono placeholder:text-neutral-600"
            />
          </div>
        </div>
      </div>

      {/* Main Workspace Area */}
      <div className="flex-1 overflow-y-auto">
        {/* TAB 1: PACKET FRAMES */}
        {activeTab === 'PACKETS' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="bg-neutral-950 text-neutral-400 border-b border-neutral-800 text-[10px] uppercase">
                  <th className="p-2 w-16">NO.</th>
                  <th className="p-2 w-24">TIME</th>
                  <th className="p-2 w-32">SOURCE</th>
                  <th className="p-2 w-32">DESTINATION</th>
                  <th className="p-2 w-20">PROTO</th>
                  <th className="p-2 w-20">BYTES</th>
                  <th className="p-2">INFO / PAYLOAD PREVIEW</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-900">
                {filteredPackets.map((pkt) => (
                  <tr
                    key={pkt.frameNo}
                    className={`transition-colors ${
                      pkt.isFlagged
                        ? 'bg-rose-950/25 text-rose-200 hover:bg-rose-950/40'
                        : 'text-neutral-300 hover:bg-neutral-950'
                    }`}
                  >
                    <td className="p-2 text-neutral-500 text-[11px] font-bold">{pkt.frameNo}</td>
                    <td className="p-2 text-neutral-400 text-[10px]">{pkt.timeOffset}</td>
                    <td className="p-2 text-cyan-300 font-bold whitespace-nowrap">{pkt.sourceIp}</td>
                    <td className="p-2 text-neutral-200 whitespace-nowrap">{pkt.destIp}</td>
                    <td className="p-2 font-bold">
                      <span className={`px-1.5 py-0.2 text-[9px] border ${
                        pkt.protocol === 'DNS' ? 'bg-cyan-950 text-cyan-300 border-cyan-700' :
                        pkt.protocol === 'TLS' ? 'bg-indigo-950 text-indigo-300 border-indigo-700' :
                        'bg-neutral-900 text-neutral-400 border-neutral-700'
                      }`}>
                        {pkt.protocol}
                      </span>
                    </td>
                    <td className="p-2 text-neutral-400 text-[11px]">{pkt.lengthBytes} B</td>
                    <td className="p-2 text-[11px] flex items-center justify-between gap-2">
                      <span className="truncate font-mono">{pkt.info}</span>
                      {pkt.threatTag && (
                        <span className="shrink-0 px-1.5 py-0.2 bg-rose-950 border border-rose-600 text-rose-300 text-[9px] font-bold">
                          {pkt.threatTag}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 2: JA3 TLS FINGERPRINTS */}
        {activeTab === 'JA3' && (
          <div className="p-4 space-y-4 max-w-5xl">
            <div className="text-[11px] text-neutral-400 bg-neutral-950 border border-neutral-800 p-3 leading-relaxed">
              <span className="font-bold text-cyan-300">JA3 TLS FINGERPRINTING:</span> Computes an MD5 hash from the exact sequence of TLS Version, Accepted Ciphers, List of Extensions, Elliptic Curves, and Elliptic Curve Point Formats in the Client Hello packet. Malicious C2 frameworks retain constant JA3 hashes regardless of IP or domain rotation.
            </div>

            <div className="space-y-3">
              {selectedPreset.ja3Matches.map((ja3, idx) => (
                <div key={idx} className="p-3 bg-neutral-950 border border-neutral-800 space-y-2.5">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-rose-400" />
                      <span className="text-xs font-bold text-white">{ja3.name}</span>
                      <span className="px-1.5 py-0.2 bg-rose-950 border border-rose-600 text-rose-300 text-[9px] font-bold">
                        {ja3.category}
                      </span>
                      {ja3.threatActor && (
                        <span className="text-[10px] text-amber-400 font-mono">[{ja3.threatActor}]</span>
                      )}
                    </div>

                    <button
                      onClick={() => handleCopy(ja3.hash, ja3.hash)}
                      className="flex items-center gap-1 px-2 py-0.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 text-[10px] cursor-pointer"
                    >
                      {copiedHash === ja3.hash ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedHash === ja3.hash ? 'COPIED' : 'COPY JA3'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-2 bg-neutral-900 border border-neutral-800">
                      <div className="text-[9px] text-neutral-500 uppercase">JA3 MD5 HASH:</div>
                      <div className="text-cyan-300 font-mono font-bold select-all">{ja3.hash}</div>
                    </div>
                    <div className="p-2 bg-neutral-900 border border-neutral-800">
                      <div className="text-[9px] text-neutral-500 uppercase">SIGNATURE CONTEXT:</div>
                      <div className="text-neutral-300 text-[11px] leading-snug">{ja3.description}</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-[9px] text-neutral-500 uppercase mb-1">CLIENT HELLO RAW HANDSHAKE:</div>
                    <pre className="p-2 bg-black border border-neutral-900 text-[10px] text-emerald-400 overflow-x-auto">
                      {ja3.clientHelloHexSnippet}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: DNS TUNNELING & ENTROPY RADAR */}
        {activeTab === 'DNS' && (
          <div className="p-4 space-y-4 max-w-5xl">
            <div className="text-[11px] text-neutral-400 bg-neutral-950 border border-neutral-800 p-3 leading-relaxed">
              <span className="font-bold text-rose-300">SHANNON ENTROPY RADAR:</span> Legitimate human-readable domain names typically have an entropy between 2.2 and 3.2 bits/char. Encrypted or base64 data exfiltrated through DNS subdomains consistently scores &gt; 3.8 bits/char with length &gt; 40 characters.
            </div>

            <div className="space-y-2">
              {selectedPreset.dnsAnomalies.map((dns, idx) => (
                <div key={idx} className="p-3 bg-neutral-950 border border-neutral-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                      <span className="text-xs font-bold text-cyan-300 font-mono select-all">{dns.query}</span>
                      <span className="px-1.5 py-0.2 bg-neutral-900 border border-neutral-700 text-neutral-300 text-[9px]">
                        TYPE {dns.type}
                      </span>
                    </div>

                    <span className={`px-2 py-0.5 text-[10px] font-bold border ${
                      dns.exfilRisk === 'CRITICAL_EXFIL' ? 'bg-rose-950 border-rose-600 text-rose-300 animate-pulse' :
                      'bg-amber-950 border-amber-600 text-amber-300'
                    }`}>
                      {dns.exfilRisk}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="p-2 bg-neutral-900 border border-neutral-800">
                      <div className="text-[9px] text-neutral-500">SHANNON ENTROPY</div>
                      <div className="text-rose-400 font-bold text-sm font-mono">{dns.entropy} <span className="text-[10px] text-neutral-500">bits/char</span></div>
                    </div>
                    <div className="p-2 bg-neutral-900 border border-neutral-800">
                      <div className="text-[9px] text-neutral-500">SUBDOMAIN LENGTH</div>
                      <div className="text-neutral-200 font-bold text-sm font-mono">{dns.length} <span className="text-[10px] text-neutral-500">characters</span></div>
                    </div>
                    <div className="p-2 bg-neutral-900 border border-neutral-800">
                      <div className="text-[9px] text-neutral-500">HEURISTIC VERDICT</div>
                      <div className="text-neutral-300 text-[11px] truncate">{dns.reason}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: TCP STREAM FOLLOWER */}
        {activeTab === 'STREAM' && (
          <div className="p-4 space-y-4 max-w-5xl">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
              <div className="text-xs font-bold text-neutral-200 uppercase">
                RECONSTRUCTED TCP STREAM CONVERSATION (0x0001)
              </div>
              <div className="text-[10px] text-neutral-400">
                <span className="text-rose-400 font-bold">CLIENT (RED)</span> ➔ <span className="text-blue-400 font-bold">SERVER (BLUE)</span>
              </div>
            </div>

            <div className="p-3 bg-black border border-neutral-800 text-xs space-y-3 font-mono">
              <div className="space-y-1">
                <div className="text-[10px] text-rose-400 font-bold uppercase">Client Payload (10.0.4.12 ➔ 198.51.100.42):</div>
                <pre className="p-2 bg-neutral-950 border border-neutral-900 text-rose-300 text-[11px] whitespace-pre-wrap leading-relaxed">
                  {selectedPreset.tcpStream.clientToServer}
                </pre>
              </div>

              <div className="space-y-1">
                <div className="text-[10px] text-cyan-400 font-bold uppercase">Server Response (198.51.100.42 ➔ 10.0.4.12):</div>
                <pre className="p-2 bg-neutral-950 border border-neutral-900 text-cyan-300 text-[11px] whitespace-pre-wrap leading-relaxed">
                  {selectedPreset.tcpStream.serverToClient}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
