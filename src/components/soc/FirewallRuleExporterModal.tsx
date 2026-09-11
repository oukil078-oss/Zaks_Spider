import React, { useState, useMemo } from 'react';
import {
  ShieldAlert, ShieldCheck, Copy, Check, X, Terminal,
  Download, ExternalLink, Code2, Server, Globe2, ArrowRight
} from 'lucide-react';

interface FirewallRuleExporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultIp?: string;
  defaultPort?: number;
  threatContext?: string;
}

export const FirewallRuleExporterModal: React.FC<FirewallRuleExporterModalProps> = ({
  isOpen,
  onClose,
  defaultIp = '198.51.100.42',
  defaultPort,
  threatContext = 'Hostile Recon / JNDI Exploit Probe'
}) => {
  const [targetIp, setTargetIp] = useState(defaultIp);
  const [targetPort, setTargetPort] = useState<string>(defaultPort ? String(defaultPort) : '');
  const [protocol, setProtocol] = useState<'ALL' | 'TCP' | 'UDP'>('ALL');
  const [activePlatform, setActivePlatform] = useState<'IPTABLES' | 'UFW' | 'NFTABLES' | 'CISCO' | 'PALOALTO' | 'CLOUDFLARE' | 'AWS'>('IPTABLES');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Sync prop changes
  React.useEffect(() => {
    if (defaultIp) setTargetIp(defaultIp);
    if (defaultPort) setTargetPort(String(defaultPort));
  }, [defaultIp, defaultPort]);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const cleanIp = targetIp.trim() || '198.51.100.42';
  const cleanPort = targetPort.trim();

  // Generated rules across 7 platforms
  const generatedRules = useMemo(() => {
    // 1. iptables
    let iptablesCmd = `# Linux Netfilter / iptables Containment Rule\n# Incident: ${threatContext}\nsudo iptables -I INPUT -s ${cleanIp} `;
    if (cleanPort && protocol !== 'ALL') {
      iptablesCmd += `-p ${protocol.toLowerCase()} --dport ${cleanPort} `;
    }
    iptablesCmd += `-j DROP -m comment --comment "Spider SOC Block: ${cleanIp}"\n\n# Persist rule across reboots\nsudo iptables-save | sudo tee /etc/iptables/rules.v4 > /dev/null`;

    // 2. ufw
    let ufwCmd = `# Ubuntu Uncomplicated Firewall (UFW)\n# Incident: ${threatContext}\n`;
    if (cleanPort && protocol !== 'ALL') {
      ufwCmd += `sudo ufw deny from ${cleanIp} to any port ${cleanPort} proto ${protocol.toLowerCase()} comment 'Spider SOC Block'\n`;
    } else {
      ufwCmd += `sudo ufw deny from ${cleanIp} to any comment 'Spider SOC Block'\n`;
    }
    ufwCmd += `sudo ufw reload`;

    // 3. nftables
    const nftablesCmd = `# Modern Linux nftables Containment\n# Incident: ${threatContext}\nsudo nft add rule inet filter input ip saddr ${cleanIp} drop comment "Spider SOC Quarantine"\n\n# Verify status\nsudo nft list chain inet filter input`;

    // 4. Cisco ASA / IOS
    const ciscoCmd = `! Cisco ASA / IOS Access-List Configuration Mode
enable
configure terminal
! Define blocking ACE for perimeter outside interface
access-list OUTSIDE_BLOCK_SOC extended deny ip host ${cleanIp} any log interval 300
access-group OUTSIDE_BLOCK_SOC in interface outside
exit
write memory`;

    // 5. Palo Alto Networks CLI
    const paloCmd = `# Palo Alto PAN-OS Firewall CLI
configure
set rulebase security rules "DROP_HOSTILE_${cleanIp.replace(/\./g, '_')}" from any to any source ${cleanIp} destination any application any service any action drop log-start yes
commit
exit`;

    // 6. Cloudflare WAF
    const cfExpression = cleanPort 
      ? `(ip.src eq ${cleanIp} and tcp.dstport eq ${cleanPort})` 
      : `(ip.src eq ${cleanIp})`;

    const cloudflarePayload = JSON.stringify({
      description: `Spider SOC Automated Block: ${cleanIp}`,
      action: 'block',
      filter: {
        expression: cfExpression,
        paused: false
      }
    }, null, 2);

    const cloudflareCurl = `# Cloudflare WAF Custom Rules v4 API
curl -X POST "https://api.cloudflare.com/client/v4/zones/{ZONE_ID}/firewall/rules" \\
  -H "Authorization: Bearer ${'{CF_API_TOKEN}'}" \\
  -H "Content-Type: application/json" \\
  --data '${JSON.stringify([{ filter: { expression: cfExpression }, action: 'block', description: `Spider SOC: ${cleanIp}` }])}'`;

    // 7. AWS VPC NACL
    const awsCmd = `# AWS CLI: Network Access Control List (NACL) Ingress Deny Rule
# Set Rule Number to priority before allow rules (e.g. 100)
aws ec2 create-network-acl-entry \\
  --network-acl-id acl-0123456789abcdef0 \\
  --ingress \\
  --rule-number 100 \\
  --protocol -1 \\
  --cidr-block ${cleanIp.includes('/') ? cleanIp : cleanIp + '/32'} \\
  --rule-action deny`;

    return {
      IPTABLES: iptablesCmd,
      UFW: ufwCmd,
      NFTABLES: nftablesCmd,
      CISCO: ciscoCmd,
      PALOALTO: paloCmd,
      CLOUDFLARE: cloudflareCurl + '\n\n# Rule JSON Definition:\n' + cloudflarePayload,
      AWS: awsCmd
    };
  }, [cleanIp, cleanPort, protocol, threatContext]);

  const activeSnippet = generatedRules[activePlatform];

  const handleDownloadScript = () => {
    const blob = new Blob([activeSnippet], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `firewall-block-${cleanIp.replace(/[^a-zA-Z0-9]/g, '_')}-${activePlatform.toLowerCase()}.sh`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const PLATFORMS = [
    { id: 'IPTABLES' as const, label: 'iptables', tag: 'Linux' },
    { id: 'UFW' as const, label: 'ufw', tag: 'Ubuntu' },
    { id: 'NFTABLES' as const, label: 'nftables', tag: 'Linux' },
    { id: 'CISCO' as const, label: 'Cisco ASA', tag: 'Enterprise' },
    { id: 'PALOALTO' as const, label: 'Palo Alto', tag: 'NextGen' },
    { id: 'CLOUDFLARE' as const, label: 'Cloudflare WAF', tag: 'Cloud / Edge' },
    { id: 'AWS' as const, label: 'AWS NACL', tag: 'Cloud VPC' }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 font-mono select-text">
      <div className="w-full max-w-3xl rounded-2xl bg-[#0b101b] border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 bg-[#0e1626] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-red-950/60 border border-red-800 flex items-center justify-center text-red-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Real-World Firewall Rule Exporter
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-red-900/40 text-red-300 border border-red-800 font-bold">
                  SOC DEFENSIVE
                </span>
              </div>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Generate production-ready blocking syntax for perimeter firewalls, Linux servers, and cloud edge WAFs.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Configuration Bar */}
        <div className="p-4 bg-[#080d18] border-b border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
              Target Attacker IP / CIDR
            </label>
            <input
              type="text"
              value={targetIp}
              onChange={(e) => setTargetIp(e.target.value)}
              placeholder="e.g. 198.51.100.42"
              className="w-full p-2 rounded-lg bg-[#070b13] border border-slate-800 text-white font-mono focus:outline-none focus:border-red-500 text-xs"
            />
          </div>

          <div>
            <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
              Port Constraint (Optional)
            </label>
            <input
              type="text"
              value={targetPort}
              onChange={(e) => setTargetPort(e.target.value)}
              placeholder="e.g. 443, 80, 22 (blank = all)"
              className="w-full p-2 rounded-lg bg-[#070b13] border border-slate-800 text-white font-mono focus:outline-none focus:border-red-500 text-xs"
            />
          </div>

          <div>
            <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
              Protocol Filter
            </label>
            <div className="grid grid-cols-3 gap-1">
              {(['ALL', 'TCP', 'UDP'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setProtocol(p)}
                  className={`p-2 rounded-lg text-center transition cursor-pointer text-xs font-bold ${
                    protocol === p
                      ? 'bg-red-950 text-red-300 border border-red-800'
                      : 'bg-[#070b13] text-slate-400 border border-slate-800 hover:text-white'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Platform Tabs */}
        <div className="px-4 pt-3 bg-[#090e1b] border-b border-slate-800 flex items-center space-x-2 overflow-x-auto">
          {PLATFORMS.map(plat => (
            <button
              key={plat.id}
              onClick={() => setActivePlatform(plat.id)}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-t-lg transition shrink-0 text-xs cursor-pointer ${
                activePlatform === plat.id
                  ? 'bg-[#0b101b] text-white border-t border-x border-slate-700 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <span>{plat.label}</span>
              <span className="text-[9px] px-1 py-0.2 rounded bg-slate-900 text-slate-400 font-mono">
                {plat.tag}
              </span>
            </button>
          ))}
        </div>

        {/* Code Snippet Stage */}
        <div className="p-4 flex-1 overflow-y-auto bg-[#0b101b] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 flex items-center space-x-1.5">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span>Containment Command Template:</span>
            </span>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleDownloadScript}
                className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs border border-slate-700 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save Script (.sh)</span>
              </button>

              <button
                onClick={() => copyToClipboard(activeSnippet, 'snippet')}
                className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow transition cursor-pointer"
              >
                {copiedKey === 'snippet' ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Command</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <pre className="p-3.5 rounded-xl bg-[#060a12] border border-slate-800 text-xs text-slate-200 font-mono overflow-x-auto whitespace-pre leading-relaxed">
            {activeSnippet}
          </pre>

          <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800/80 text-[11px] text-slate-400 font-sans flex items-start space-x-2">
            <span className="text-emerald-400 font-bold shrink-0">Defensive Note:</span>
            <span>
              Always verify existing firewall rule chains before running destructive drop commands in production environments to avoid inadvertently blocking corporate NAT egress gateways or DNS resolvers.
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-[#080d18] border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-mono text-[11px]">
            Target Context: {threatContext}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
