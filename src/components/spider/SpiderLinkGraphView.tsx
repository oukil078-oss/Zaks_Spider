import React, { useState, useRef } from 'react';
import { 
  Share2, Search, Plus, Filter, RefreshCw, ZoomIn, ZoomOut, 
  Maximize2, ShieldAlert, Globe, Server, Bug, Cpu, Key, 
  Crosshair, ExternalLink, Download, Check, Copy, ArrowRight
} from 'lucide-react';

export type NodeType = 'IP' | 'DOMAIN' | 'CVE' | 'ACTOR' | 'HASH' | 'CERT';

export interface GraphNode {
  id: string;
  label: string;
  type: NodeType;
  details: string;
  x: number;
  y: number;
  vx?: number;
  vy?: number;
  connectionsCount?: number;
  risk?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'INFO';
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  relation: string;
}

interface SpiderLinkGraphViewProps {
  onPivotToSoc?: (ip: string) => void;
  onPivotToForensics?: (ioc: string) => void;
  onPivotToSwarm?: (prompt: string) => void;
  seedNodeId?: string;
}

export const SpiderLinkGraphView: React.FC<SpiderLinkGraphViewProps> = ({
  onPivotToSoc,
  onPivotToForensics,
  onPivotToSwarm,
  seedNodeId,
}) => {
  // Baseline Threat Graph Data (APT29 / Cozy Bear supply chain campaign)
  const [nodes, setNodes] = useState<GraphNode[]>([
    { id: 'node-apt29', label: 'APT29 (Cozy Bear)', type: 'ACTOR', details: 'Sovereign state-sponsored threat group specializing in cyber espionage and stealthy supply-chain intrusions.', x: 400, y: 280, risk: 'CRITICAL' },
    { id: 'node-cve-2024-3400', label: 'CVE-2024-3400', type: 'CVE', details: 'Palo Alto PAN-OS Command Injection RCE (CVSS 10.0, actively exploited).', x: 250, y: 160, risk: 'CRITICAL' },
    { id: 'node-cve-2023-3519', label: 'CVE-2023-3519', type: 'CVE', details: 'Citrix NetScaler ADC & Gateway Remote Code Execution.', x: 230, y: 380, risk: 'HIGH' },
    { id: 'node-c2-ip-1', label: '194.26.29.112', type: 'IP', details: 'Malicious C2 node in AS44477 (STARK-INDUSTRIES), active Cobalt Strike listener.', x: 580, y: 180, risk: 'CRITICAL' },
    { id: 'node-c2-ip-2', label: '91.92.241.103', type: 'IP', details: 'Staging drop server in AS48693 (DATAPRO-AS).', x: 570, y: 390, risk: 'HIGH' },
    { id: 'node-domain-1', label: 'sec-update-cloud[.]com', type: 'DOMAIN', details: 'Typosquatted infrastructure masquerading as CDN telemetry endpoint.', x: 740, y: 160, risk: 'CRITICAL' },
    { id: 'node-domain-2', label: 'telemetry-azure-sync[.]net', type: 'DOMAIN', details: 'Dynamic DNS beaconing endpoint for backdoor payload extraction.', x: 730, y: 370, risk: 'HIGH' },
    { id: 'node-cert-1', label: 'Let\'s Encrypt (R3)', type: 'CERT', details: 'Serial 04:d8:22:91 � Validated TLS cert issued 2026-08-14, shared across 4 C2 domains.', x: 670, y: 270, risk: 'MEDIUM' },
  ]);

  const [edges, setEdges] = useState<GraphEdge[]>([
    { id: 'e-1', source: 'node-apt29', target: 'node-cve-2024-3400', relation: 'WEAPONIZES' },
    { id: 'e-2', source: 'node-apt29', target: 'node-cve-2023-3519', relation: 'EXPLOITS' },
    { id: 'e-3', source: 'node-apt29', target: 'node-c2-ip-1', relation: 'CONTROLS_C2' },
    { id: 'e-4', source: 'node-apt29', target: 'node-c2-ip-2', relation: 'EXFIL_DROP' },
    { id: 'e-5', source: 'node-c2-ip-1', target: 'node-domain-1', relation: 'RESOLVES_TO' },
    { id: 'e-6', source: 'node-c2-ip-2', target: 'node-domain-2', relation: 'HOSTS_DOMAIN' },
    { id: 'e-7', source: 'node-domain-1', target: 'node-cert-1', relation: 'SHARES_CERT' },
    { id: 'e-8', source: 'node-domain-2', target: 'node-cert-1', relation: 'SHARES_CERT' },
  ]);

  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(nodes[0]);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchSeed, setSearchSeed] = useState('');
  const [isSpidering, setIsSpidering] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  // Spider out 1-hop from selected node
  const handleSpiderNode = (node: GraphNode) => {
    setIsSpidering(true);
    setTimeout(() => {
      const newNodes: GraphNode[] = [];
      const newEdges: GraphEdge[] = [];
      const baseAngle = Math.random() * Math.PI;

      if (node.type === 'IP') {
        // Expand IP into new hostnames and ASN
        const domId = `dyn-dom-${Date.now()}`;
        const asnId = `dyn-asn-${Date.now()}`;
        newNodes.push(
          { id: domId, label: `co-hosted-probe[.]org`, type: 'DOMAIN', details: `Co-hosted virtual host identified on ${node.label} via passive DNS records.`, x: node.x + 130 * Math.cos(baseAngle), y: node.y + 130 * Math.sin(baseAngle), risk: 'HIGH' },
          { id: asnId, label: `ASN Pivot: Autonomous Uplink`, type: 'INFO' as any, details: `BGP transit provider with 48 registered CIDR subnets.`, x: node.x + 130 * Math.cos(baseAngle + 1.5), y: node.y + 130 * Math.sin(baseAngle + 1.5), risk: 'INFO' }
        );
        newEdges.push(
          { id: `dyn-e-${Date.now()}-1`, source: node.id, target: domId, relation: 'CO_HOSTED' },
          { id: `dyn-e-${Date.now()}-2`, source: node.id, target: asnId, relation: 'ROUTED_VIA' }
        );
      } else if (node.type === 'ACTOR') {
        // Expand Actor into new campaign CVEs and Hash
        const cveId = `dyn-cve-${Date.now()}`;
        const hashId = `dyn-hash-${Date.now()}`;
        newNodes.push(
          { id: cveId, label: 'CVE-2024-21887', type: 'CVE', details: 'Ivanti Connect Secure Command Injection Zero-Day.', x: node.x - 140, y: node.y - 120, risk: 'CRITICAL' },
          { id: hashId, label: '7f9a2b8... (Backdoor)', type: 'HASH', details: 'ELF 64-bit implant drop with XOR payload obfuscation.', x: node.x + 150, y: node.y + 130, risk: 'CRITICAL' }
        );
        newEdges.push(
          { id: `dyn-e-${Date.now()}-3`, source: node.id, target: cveId, relation: 'EXPLOITS_ZERO_DAY' },
          { id: `dyn-e-${Date.now()}-4`, source: node.id, target: hashId, relation: 'DROPS_PAYLOAD' }
        );
      } else {
        // Generic expansion
        const ipId = `dyn-ip-${Date.now()}`;
        newNodes.push({
          id: ipId,
          label: `185.220.101.${Math.floor(10 + Math.random() * 80)}`,
          type: 'IP',
          details: `Correlated upstream network bridge discovered via certificate pivot.`,
          x: node.x + 120 * Math.cos(baseAngle),
          y: node.y + 120 * Math.sin(baseAngle),
          risk: 'HIGH',
        });
        newEdges.push({
          id: `dyn-e-${Date.now()}-5`,
          source: node.id,
          target: ipId,
          relation: 'CORRELATED_LINK',
        });
      }

      setNodes(prev => [...prev, ...newNodes]);
      setEdges(prev => [...prev, ...newEdges]);
      setIsSpidering(false);
    }, 600);
  };

  const handleAddSeed = () => {
    if (!searchSeed.trim()) return;
    const seed = searchSeed.trim();
    const isIp = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(seed);
    const isCve = seed.toUpperCase().startsWith('CVE-');
    const isDomain = seed.includes('.');

    const newNode: GraphNode = {
      id: `seed-${Date.now()}`,
      label: seed,
      type: isIp ? 'IP' : isCve ? 'CVE' : isDomain ? 'DOMAIN' : 'ACTOR',
      details: `Operator-injected seed entity for multi-hop graph expansion.`,
      x: 350 + (Math.random() - 0.5) * 100,
      y: 250 + (Math.random() - 0.5) * 100,
      risk: 'CRITICAL',
    };

    setNodes(prev => [newNode, ...prev]);
    setSelectedNode(newNode);
    setSearchSeed('');
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName === 'svg' || (e.target as HTMLElement).id === 'canvas-bg') {
      setIsDraggingCanvas(true);
      dragStart.current = {
        x: e.clientX,
        y: e.clientY,
        panX: panOffset.x,
        panY: panOffset.y,
      };
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingCanvas) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setPanOffset({
      x: dragStart.current.panX + dx,
      y: dragStart.current.panY + dy,
    });
  };

  const handleCanvasMouseUp = () => {
    setIsDraggingCanvas(false);
  };

  const getNodeColor = (type: NodeType) => {
    switch (type) {
      case 'ACTOR': return 'border-red-500 bg-red-950/80 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.4)]';
      case 'CVE': return 'border-amber-500 bg-amber-950/80 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.3)]';
      case 'IP': return 'border-blue-500 bg-blue-950/80 text-blue-300 shadow-[0_0_12px_rgba(59,130,246,0.3)]';
      case 'DOMAIN': return 'border-cyan-500 bg-cyan-950/80 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)]';
      case 'CERT': return 'border-purple-500 bg-purple-950/80 text-purple-300';
      case 'HASH': return 'border-emerald-500 bg-emerald-950/80 text-emerald-300';
      default: return 'border-slate-700 bg-slate-900 text-slate-300';
    }
  };

  const getNodeIcon = (type: NodeType) => {
    switch (type) {
      case 'ACTOR': return <ShieldAlert className="w-3.5 h-3.5 text-red-400" />;
      case 'CVE': return <Bug className="w-3.5 h-3.5 text-amber-400" />;
      case 'IP': return <Server className="w-3.5 h-3.5 text-blue-400" />;
      case 'DOMAIN': return <Globe className="w-3.5 h-3.5 text-cyan-400" />;
      case 'CERT': return <Key className="w-3.5 h-3.5 text-purple-400" />;
      case 'HASH': return <Cpu className="w-3.5 h-3.5 text-emerald-400" />;
      default: return <Crosshair className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const filteredNodes = nodes.filter(n => {
    if (filterType === 'ALL') return true;
    return n.type === filterType;
  });

  return (
    <div className="flex-1 h-full overflow-hidden flex flex-col bg-[#070b14] font-mono text-xs select-none">
      
      {/* 1. TOP TOOLBAR & CONTROLS */}
      <div className="p-3 border-b border-slate-800 bg-[#090e1a] flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-sm">
            <Share2 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white uppercase tracking-wider">
                Threat Link-Graph Spider
              </span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                MALTEGO ENGINE
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              Interactive Multi-Hop Entity Relationship & Adversary Infrastructure Visualizer
            </p>
          </div>
        </div>

        {/* Seed Input & Graph Filter */}
        <div className="flex items-center gap-2">
          <div className="relative w-56">
            <input
              type="text"
              value={searchSeed}
              onChange={(e) => setSearchSeed(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddSeed()}
              placeholder="Inject Seed (IP, Domain, CVE, Actor)..."
              className="w-full px-3 py-1.5 bg-black/60 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-xs"
            />
          </div>

          <button
            onClick={handleAddSeed}
            className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-black font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Seed</span>
          </button>

          {/* Node Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 text-xs focus:outline-none"
          >
            <option value="ALL">All Types ({nodes.length})</option>
            <option value="ACTOR">Threat Actors</option>
            <option value="IP">IP Addresses</option>
            <option value="DOMAIN">Domains</option>
            <option value="CVE">CVEs</option>
            <option value="CERT">Certificates</option>
          </select>

          {/* Zoom & Reset Controls */}
          <div className="flex items-center bg-black/40 border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => setZoomLevel(prev => Math.min(prev + 0.15, 2.5))}
              className="p-1 text-slate-400 hover:text-white cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(prev => Math.max(prev - 0.15, 0.4))}
              className="p-1 text-slate-400 hover:text-white cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => { setZoomLevel(1); setPanOffset({ x: 0, y: 0 }); }}
              className="p-1 text-slate-400 hover:text-white cursor-pointer"
              title="Reset View"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. MAIN INTERACTIVE GRAPH CANVAS + INSPECTION DECK */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* SVG Graph Canvas */}
        <div 
          id="canvas-bg"
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          className="flex-1 h-full relative cursor-grab active:cursor-grabbing overflow-hidden bg-[#060913]"
        >
          <svg
            className="w-full h-full pointer-events-auto"
            style={{
              transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
              transformOrigin: 'center center',
            }}
          >
            <defs>
              <marker
                id="arrow"
                viewBox="0 0 10 10"
                refX="22"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" opacity="0.6" />
              </marker>
            </defs>

            {/* Render Edges */}
            {edges.map((edge) => {
              const src = nodes.find(n => n.id === edge.source);
              const tgt = nodes.find(n => n.id === edge.target);
              if (!src || !tgt) return null;

              const midX = (src.x + tgt.x) / 2;
              const midY = (src.y + tgt.y) / 2;

              return (
                <g key={edge.id}>
                  <line
                    x1={src.x}
                    y1={src.y}
                    x2={tgt.x}
                    y2={tgt.y}
                    stroke="#334155"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                    markerEnd="url(#arrow)"
                  />
                  <text
                    x={midX}
                    y={midY - 4}
                    fill="#64748b"
                    fontSize="8"
                    fontFamily="monospace"
                    textAnchor="middle"
                    className="select-none pointer-events-none"
                  >
                    {edge.relation}
                  </text>
                </g>
              );
            })}

            {/* Render Nodes */}
            {filteredNodes.map((node) => {
              const isSelected = selectedNode?.id === node.id;
              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedNode(node);
                  }}
                  className="cursor-pointer group"
                >
                  <circle
                    r={isSelected ? 22 : 18}
                    className={`transition-all ${
                      isSelected
                        ? 'fill-cyan-950 stroke-cyan-400 stroke-2 filter drop-shadow-[0_0_12px_rgba(6,182,212,0.8)]'
                        : node.type === 'ACTOR'
                        ? 'fill-red-950/80 stroke-red-500 stroke-1.5'
                        : node.type === 'CVE'
                        ? 'fill-amber-950/80 stroke-amber-500 stroke-1.5'
                        : node.type === 'IP'
                        ? 'fill-blue-950/80 stroke-blue-500 stroke-1.5'
                        : 'fill-slate-900 stroke-slate-700 stroke-1.5'
                    }`}
                  />
                  <text
                    y={32}
                    textAnchor="middle"
                    fill={isSelected ? '#38bdf8' : '#cbd5e1'}
                    fontSize="10"
                    fontWeight={isSelected ? 'bold' : 'normal'}
                    fontFamily="monospace"
                    className="select-none drop-shadow"
                  >
                    {node.label}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Floating Canvas Quick Legend */}
          <div className="absolute bottom-4 left-4 p-2.5 rounded-xl bg-[#090e1a]/90 border border-slate-800 backdrop-blur-md space-y-1.5 text-[10px] text-slate-400">
            <div className="font-bold uppercase text-slate-300 text-[9px] mb-1">Graph Legend:</div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> Threat Actor</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> CVE Zero-Day</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> IP Host</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-500" /> C2 Domain</span>
            </div>
          </div>
        </div>

        {/* Right Side Entity Inspector Deck */}
        {selectedNode && (
          <div className="w-80 border-l border-slate-800 bg-[#090e1a] p-4 flex flex-col justify-between overflow-y-auto space-y-4 shrink-0 shadow-2xl">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${getNodeColor(selectedNode.type)}`}>
                    {selectedNode.type}
                  </span>
                  {selectedNode.risk && (
                    <span className="text-[9px] font-bold text-red-400">
                      [{selectedNode.risk}]
                    </span>
                  )}
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(selectedNode.label);
                    setCopiedText(true);
                    setTimeout(() => setCopiedText(false), 2000);
                  }}
                  className="text-slate-400 hover:text-white cursor-pointer"
                  title="Copy Entity Identifier"
                >
                  {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white break-all">{selectedNode.label}</h3>
                <p className="text-[11px] text-slate-300 leading-relaxed mt-2 font-sans bg-black/40 p-2.5 rounded-lg border border-slate-800/80">
                  {selectedNode.details}
                </p>
              </div>

              {/* Connected Infrastructure List */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800">
                <div className="text-[10px] uppercase font-bold text-slate-400">
                  Connected Links ({edges.filter(e => e.source === selectedNode.id || e.target === selectedNode.id).length}):
                </div>
                <div className="space-y-1">
                  {edges.filter(e => e.source === selectedNode.id || e.target === selectedNode.id).map(edge => {
                    const peerId = edge.source === selectedNode.id ? edge.target : edge.source;
                    const peerNode = nodes.find(n => n.id === peerId);
                    if (!peerNode) return null;
                    return (
                      <div
                        key={edge.id}
                        onClick={() => setSelectedNode(peerNode)}
                        className="p-2 rounded bg-black/50 border border-slate-800/80 hover:border-slate-700 flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          {getNodeIcon(peerNode.type)}
                          <span className="truncate text-slate-200">{peerNode.label}</span>
                        </div>
                        <span className="text-[8px] text-slate-500 uppercase">{edge.relation}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => handleSpiderNode(selectedNode)}
                disabled={isSpidering}
                className="w-full py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-black font-extrabold flex items-center justify-center gap-2 cursor-pointer transition-all shadow-[0_0_12px_rgba(6,182,212,0.3)] disabled:opacity-50 text-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSpidering ? 'animate-spin' : ''}`} />
                <span>{isSpidering ? 'Spidering 1-Hop...' : 'Spider Out (1-Hop)'}</span>
              </button>

              {selectedNode.type === 'IP' && onPivotToSoc && (
                <button
                  onClick={() => onPivotToSoc(selectedNode.label)}
                  className="w-full py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 border border-red-800 text-red-300 font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors text-xs"
                >
                  <span>Drop IP in SOC Firewall</span>
                </button>
              )}

              {(selectedNode.type === 'DOMAIN' || selectedNode.type === 'IP') && onPivotToForensics && (
                <button
                  onClick={() => onPivotToForensics(selectedNode.label)}
                  className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors text-xs"
                >
                  <span>Defang in Forensics</span>
                </button>
              )}

              {onPivotToSwarm && (
                <button
                  onClick={() => onPivotToSwarm(`Investigate threat graph cluster around entity: ${selectedNode.label} (${selectedNode.type}). Synthesize adversary attribution and containment blueprint.`)}
                  className="w-full py-1.5 rounded-lg bg-blue-950/60 hover:bg-blue-900 border border-blue-800 text-blue-300 font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors text-xs"
                >
                  <span>Task AI Swarm on Entity</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
