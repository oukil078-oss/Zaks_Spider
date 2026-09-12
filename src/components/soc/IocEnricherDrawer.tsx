import React, { useState, useEffect } from 'react';
import { 
  Globe2, ShieldAlert, ShieldCheck, ExternalLink, Copy, 
  Check, X, Search, Terminal, AlertTriangle, Cpu, ArrowRight 
} from 'lucide-react';

interface IocEnricherDrawerProps {
  ip: string | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenContainment?: (ip: string, port?: number, reason?: string) => void;
}

export const IocEnricherDrawer: React.FC<IocEnricherDrawerProps> = ({
  ip,
  isOpen,
  onClose,
  onOpenContainment,
}) => {
  const [ptrRecord, setPtrRecord] = useState<string | null>(null);
  const [isResolvingPtr, setIsResolvingPtr] = useState<boolean>(false);
  const [ptrError, setPtrError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const cleanIp = (ip || '').trim();

  // Deterministic RFC IP Classification
  const classifyIp = (rawIp: string): { type: string; isBogon: boolean; description: string } => {
    if (!rawIp) return { type: 'UNKNOWN', isBogon: false, description: 'No IP supplied' };
    const parts = rawIp.split('.').map(Number);
    if (parts.length !== 4 || parts.some(p => isNaN(p) || p < 0 || p > 255)) {
      return { type: 'INVALID', isBogon: true, description: 'Non-standard IPv4 format' };
    }

    const [a, b, c, d] = parts;
    if (a === 10) {
      return { type: 'RFC 1918 Private (Class A)', isBogon: true, description: 'Internal Enterprise Intranet (10.0.0.0/8)' };
    }
    if (a === 172 && b >= 16 && b <= 31) {
      return { type: 'RFC 1918 Private (Class B)', isBogon: true, description: 'Internal Segment / Container Network (172.16.0.0/12)' };
    }
    if (a === 192 && b === 168) {
      return { type: 'RFC 1918 Private (Class C)', isBogon: true, description: 'Internal LAN / Subnet (192.168.0.0/16)' };
    }
    if (a === 127) {
      return { type: 'RFC 1122 Loopback', isBogon: true, description: 'Host Local Loopback (127.0.0.0/8)' };
    }
    if (a === 169 && b === 254) {
      return { type: 'RFC 3927 Link-Local', isBogon: true, description: 'APIPA / Link-Local Unicast (169.254.0.0/16)' };
    }
    if (a === 100 && b >= 64 && b <= 127) {
      return { type: 'RFC 6598 Carrier-Grade NAT', isBogon: true, description: 'ISP Shared Address Space (100.64.0.0/10)' };
    }
    if (a === 192 && b === 0 && c === 2) {
      return { type: 'RFC 5737 TEST-NET-1', isBogon: true, description: 'Documentation & Calibration Benchmark (192.0.2.0/24)' };
    }
    if (a === 198 && b === 51 && c === 100) {
      return { type: 'RFC 5737 TEST-NET-2', isBogon: true, description: 'Documentation & Calibration Benchmark (198.51.100.0/24)' };
    }
    if (a === 203 && b === 0 && c === 113) {
      return { type: 'RFC 5737 TEST-NET-3', isBogon: true, description: 'Documentation & Calibration Benchmark (203.0.113.0/24)' };
    }
    if (a >= 224 && a <= 239) {
      return { type: 'RFC 5771 Multicast', isBogon: true, description: 'Multicast Group (224.0.0.0/4)' };
    }
    if (a >= 240) {
      return { type: 'RFC 1112 Reserved', isBogon: true, description: 'Reserved for Future Use (240.0.0.0/4)' };
    }

    return { type: 'Public Internet', isBogon: false, description: 'Public Globally-Routable Autonomous Endpoint' };
  };

  const ipClass = classifyIp(cleanIp);

  // Live DNS-over-HTTPS (DoH) Reverse DNS Query
  useEffect(() => {
    if (!cleanIp || !isOpen) {
      setPtrRecord(null);
      setPtrError(null);
      return;
    }

    const parts = cleanIp.split('.');
    if (parts.length !== 4) {
      setPtrRecord(null);
      return;
    }

    // Skip DoH for internal bogons to avoid query leaks
    if (ipClass.isBogon && !cleanIp.startsWith('198.51.') && !cleanIp.startsWith('203.0.')) {
      setPtrRecord(`[INTERNAL_BOGON] No Public Ingress Record for ${ipClass.type}`);
      setIsResolvingPtr(false);
      setPtrError(null);
      return;
    }

    let isMounted = true;
    setIsResolvingPtr(true);
    setPtrError(null);
    setPtrRecord(null);

    const reverseArpa = `${parts[3]}.${parts[2]}.${parts[1]}.${parts[0]}.in-addr.arpa`;

    const resolveDoH = async () => {
      try {
        const response = await fetch(
          `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(reverseArpa)}&type=PTR`,
          {
            headers: { Accept: 'application/dns-json' },
          }
        );
        if (!response.ok) throw new Error(`DoH HTTP ${response.status}`);
        const data = await response.json();
        if (!isMounted) return;

        if (data.Answer && data.Answer.length > 0) {
          const ptr = data.Answer[0].data;
          setPtrRecord(ptr);
        } else if (data.Status === 3) {
          setPtrRecord('NXDOMAIN (No PTR Record Found)');
        } else {
          setPtrRecord('NOERROR (No PTR Record Configured)');
        }
      } catch (err: any) {
        if (!isMounted) return;
        setPtrError('DoH Gateway Timeout or Strict Filter');
      } finally {
        if (isMounted) setIsResolvingPtr(false);
      }
    };

    resolveDoH();

    return () => {
      isMounted = false;
    };
  }, [cleanIp, isOpen, ipClass.isBogon]);

  if (!isOpen || !cleanIp) return null;

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const quickIptables = `sudo iptables -I INPUT -s ${cleanIp} -j DROP -m comment --comment "Spider SOC Containment"`;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-[#000000] border-l border-neutral-800 shadow-2xl flex flex-col font-mono text-neutral-200 animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-3 bg-[#0a0a0a] border-b border-neutral-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-none bg-rose-500" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            IOC TACTICAL ENRICHER
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-none hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Target IP Header Card */}
        <div className="p-3 bg-[#050505] border border-neutral-800 rounded-none">
          <div className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold mb-1">
            TARGET INGRESS IOC
          </div>
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-rose-400 tracking-wide select-all">
              {cleanIp}
            </span>
            <button
              onClick={() => copyText(cleanIp, 'ip')}
              className="p-1.5 border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-none cursor-pointer"
              title="Copy IP"
            >
              {copiedKey === 'ip' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Network & Bogon Classification */}
        <div className="p-3 bg-[#050505] border border-neutral-800 rounded-none space-y-2">
          <div className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold">
            ROUTING & BOGON CLASSIFICATION
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-400">Class:</span>
            <span className={`text-xs font-bold ${ipClass.isBogon ? 'text-amber-400' : 'text-emerald-400'}`}>
              {ipClass.type}
            </span>
          </div>
          <div className="text-[11px] text-neutral-400 bg-[#000000] p-2 border border-neutral-800">
            {ipClass.description}
          </div>
        </div>

        {/* Live DNS-over-HTTPS (DoH) PTR Lookup */}
        <div className="p-3 bg-[#050505] border border-neutral-800 rounded-none space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold">
              LIVE REVERSE DNS (DOH PTR)
            </span>
            <span className="text-[9px] px-1.5 py-0.2 bg-neutral-900 border border-neutral-800 text-neutral-400">
              Cloudflare DoH
            </span>
          </div>

          <div className="p-2.5 bg-[#000000] border border-neutral-800 min-h-[48px] flex items-center justify-between">
            {isResolvingPtr ? (
              <span className="text-xs text-neutral-500 flex items-center gap-2">
                <span className="w-2 h-2 rounded-none bg-cyan-400 animate-pulse" />
                Querying in-addr.arpa over TLS...
              </span>
            ) : ptrError ? (
              <span className="text-xs text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                {ptrError}
              </span>
            ) : (
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-bold text-neutral-200 truncate pr-2">
                  {ptrRecord || 'No PTR response'}
                </span>
                {ptrRecord && (
                  <button
                    onClick={() => copyText(ptrRecord, 'ptr')}
                    className="text-neutral-500 hover:text-white p-1"
                    title="Copy Hostname"
                  >
                    {copiedKey === 'ptr' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Quick Active Containment Snippet */}
        <div className="p-3 bg-[#050505] border border-neutral-800 rounded-none space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold">
              CONTAINMENT CLIPBOARD
            </span>
            <button
              onClick={() => copyText(quickIptables, 'iptables')}
              className="text-[10px] text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
            >
              {copiedKey === 'iptables' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>Copy iptables</span>
            </button>
          </div>
          <pre className="p-2 bg-[#000000] border border-neutral-800 text-[10px] text-neutral-300 overflow-x-auto whitespace-pre-wrap select-all">
            {quickIptables}
          </pre>
        </div>

        {/* Authentic External CTI Repositories */}
        <div className="p-3 bg-[#050505] border border-neutral-800 rounded-none space-y-2">
          <div className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold">
            AUTHENTIC CTI PIVOTS (PRE-QUERY)
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <a
              href={`https://www.abuseipdb.com/check/${encodeURIComponent(cleanIp)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-neutral-950 border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white flex items-center justify-between transition-colors"
            >
              <span>AbuseIPDB</span>
              <ExternalLink className="w-3 h-3 text-neutral-500" />
            </a>

            <a
              href={`https://www.virustotal.com/gui/ip-address/${encodeURIComponent(cleanIp)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-neutral-950 border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white flex items-center justify-between transition-colors"
            >
              <span>VirusTotal</span>
              <ExternalLink className="w-3 h-3 text-neutral-500" />
            </a>

            <a
              href={`https://www.shodan.io/host/${encodeURIComponent(cleanIp)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-neutral-950 border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white flex items-center justify-between transition-colors"
            >
              <span>Shodan</span>
              <ExternalLink className="w-3 h-3 text-neutral-500" />
            </a>

            <a
              href={`https://viz.greynoise.io/ip/${encodeURIComponent(cleanIp)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-neutral-950 border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white flex items-center justify-between transition-colors"
            >
              <span>GreyNoise</span>
              <ExternalLink className="w-3 h-3 text-neutral-500" />
            </a>

            <a
              href={`https://search.censys.io/hosts/${encodeURIComponent(cleanIp)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-neutral-950 border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white flex items-center justify-between transition-colors"
            >
              <span>Censys</span>
              <ExternalLink className="w-3 h-3 text-neutral-500" />
            </a>

            <a
              href={`https://ipinfo.io/${encodeURIComponent(cleanIp)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-neutral-950 border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white flex items-center justify-between transition-colors"
            >
              <span>IPinfo BGP</span>
              <ExternalLink className="w-3 h-3 text-neutral-500" />
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 bg-[#0a0a0a] border-t border-neutral-800 flex items-center justify-between gap-2 shrink-0">
        <button
          onClick={onClose}
          className="px-3 py-1.5 border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white text-xs cursor-pointer"
        >
          Close Drawer
        </button>
        {onOpenContainment && (
          <button
            onClick={() => {
              onOpenContainment(cleanIp, undefined, 'SOC Telemetry Anomaly Ingress');
              onClose();
            }}
            className="px-3 py-1.5 bg-rose-950/80 hover:bg-rose-900 border border-rose-800/80 text-rose-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>Open Containment Playbook</span>
          </button>
        )}
      </div>
    </div>
  );
};
