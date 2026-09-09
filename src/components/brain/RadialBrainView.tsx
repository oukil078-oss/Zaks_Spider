// ==========================================
// ZAK'S SPIDER — RADIAL NODE CLUSTERING NEURAL WEB
// High-Fidelity Implementation modeled directly after User Reference Design (Image 4)
// Target-Centric Constellation with Orbiting Clusters, Branching Leaves & Full CRUD
// ==========================================

import React, { useState, useMemo } from 'react';
import {
  Network,
  Search,
  Plus,
  Trash2,
  Edit3,
  Save,
  Check,
  ExternalLink,
  Shield,
  ShieldAlert,
  User,
  Globe,
  Phone,
  Terminal,
  FileText,
  Key,
  Database,
  Cpu,
  Sparkles,
  Layers,
  ChevronRight,
  Filter,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { 
  TargetProfile, 
  RadialClusterDef, 
  RadialLeafItem, 
  RadialClusterCategory, 
  BrainNoteItem 
} from '../../types';

interface RadialBrainViewProps {
  notes: BrainNoteItem[];
  onSaveNote: (note: BrainNoteItem) => Promise<void>;
  onDeleteNote: (id: string) => Promise<void>;
}

// Initial Preloaded Targets for Institutional / Investor Demo
const INITIAL_TARGETS: TargetProfile[] = [
  {
    id: 'target-zakarya',
    name: 'Zakarya Oukil',
    handle: 'oukil078',
    role: 'Principal Investigator & Offensive Architect',
    category: 'Audited Asset',
    organization: 'Master of Science in Cybersecurity',
    email: 'oukil078@gmail.com',
    phone: '+213 555 12 34 56',
    ip: '105.101.44.12',
    location: 'Algiers, Algeria (Wilaya 16)',
    wilaya: 'Algiers',
    riskLevel: 'Low',
    tags: ['investigator', 'eJPTv2', 'algeria', 'core-anchor'],
    notesCount: 4,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'target-alpha',
    name: 'Subject Alpha (Red Team Target)',
    handle: 'sec_infiltrator',
    role: 'Simulated Threat Actor / Penetration Objective',
    category: 'Threat Actor',
    organization: 'FinTech Demo Perimeter',
    email: 'alpha.recon@perimeter-vault.io',
    phone: '+1 650 253 0000',
    ip: '194.26.29.112',
    location: 'Frankfurt / Moscow Node',
    riskLevel: 'Critical',
    tags: ['apt', 'tor-exit', 'fuzzer'],
    notesCount: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const RadialBrainView: React.FC<RadialBrainViewProps> = ({
  notes,
  onSaveNote,
  onDeleteNote,
}) => {
  // Target Management State
  const [targets, setTargets] = useState<TargetProfile[]>(INITIAL_TARGETS);
  const [selectedTargetId, setSelectedTargetId] = useState<string>('target-zakarya');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeClusterFilter, setActiveClusterFilter] = useState<string>('all');

  // Selected Leaf / Node for Right Sidebar Inspector
  const [selectedLeaf, setSelectedLeaf] = useState<RadialLeafItem | null>(null);
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');

  // Target Create Modal State
  const [showAddTargetModal, setShowAddTargetModal] = useState(false);
  const [newTargetName, setNewTargetName] = useState('');
  const [newTargetHandle, setNewTargetHandle] = useState('');
  const [newTargetRole, setNewTargetRole] = useState('Audited Target');
  const [newTargetCategory, setNewTargetCategory] = useState<TargetProfile['category']>('Audited Asset');

  const currentTarget = targets.find(t => t.id === selectedTargetId) || targets[0];

  // Dynamic Clusters & Satellite Leaves derived from Target & Notes
  const clusters: RadialClusterDef[] = useMemo(() => {
    return [
      {
        id: 'social',
        title: 'Social Footprint',
        color: '#a855f7', // Purple
        ringIndex: 1,
        icon: 'User',
        count: 5,
        riskScore: 24,
        leaves: [
          { id: 's-1', clusterId: 'social', label: 'X (Twitter)', value: `@${currentTarget.handle}`, url: `https://x.com/${currentTarget.handle}`, status: 'verified', strength: 'strong' },
          { id: 's-2', clusterId: 'social', label: 'Telegram', value: `t.me/${currentTarget.handle}`, url: `https://t.me/${currentTarget.handle}`, status: 'verified', strength: 'strong' },
          { id: 's-3', clusterId: 'social', label: 'Reddit', value: `u/${currentTarget.handle}`, url: `https://reddit.com/user/${currentTarget.handle}`, status: 'verified', strength: 'medium' },
          { id: 's-4', clusterId: 'social', label: 'Medium', value: `@${currentTarget.handle}`, url: `https://medium.com/@${currentTarget.handle}`, status: 'verified', strength: 'medium' },
        ],
      },
      {
        id: 'developer',
        title: 'Developer Repos',
        color: '#38bdf8', // Sky Blue
        ringIndex: 2,
        icon: 'Terminal',
        count: 4,
        riskScore: 28,
        leaves: [
          { id: 'd-1', clusterId: 'developer', label: 'GitHub', value: `github.com/${currentTarget.handle}`, url: `https://github.com/${currentTarget.handle}`, status: 'verified', strength: 'strong' },
          { id: 'd-2', clusterId: 'developer', label: 'GitLab', value: `gitlab.com/${currentTarget.handle}`, url: `https://gitlab.com/${currentTarget.handle}`, status: 'verified', strength: 'strong' },
          { id: 'd-3', clusterId: 'developer', label: 'Docker Hub', value: `hub.docker.com/u/${currentTarget.handle}`, url: `https://hub.docker.com/u/${currentTarget.handle}`, status: 'verified', strength: 'medium' },
        ],
      },
      {
        id: 'network',
        title: 'Network Perimeter',
        color: '#10b981', // Emerald
        ringIndex: 3,
        icon: 'Globe',
        count: 3,
        riskScore: 35,
        leaves: [
          { id: 'n-1', clusterId: 'network', label: 'Primary Host', value: currentTarget.ip || '127.0.0.1', status: 'verified', strength: 'strong' },
          { id: 'n-2', clusterId: 'network', label: 'Autonomous System', value: 'AS36947 Algérie Télécom', status: 'verified', strength: 'strong' },
          { id: 'n-3', clusterId: 'network', label: 'Reverse DNS', value: `${currentTarget.handle}.perimeter.net`, status: 'verified', strength: 'medium' },
        ],
      },
      {
        id: 'telephony',
        title: 'Telephony & Wilaya',
        color: '#eab308', // Yellow
        ringIndex: 4,
        icon: 'Phone',
        count: 3,
        riskScore: 38,
        leaves: [
          { id: 't-1', clusterId: 'telephony', label: 'E.164 Number', value: currentTarget.phone || '+213 555 12 34 56', status: 'verified', strength: 'strong' },
          { id: 't-2', clusterId: 'telephony', label: 'Regional Wilaya', value: currentTarget.wilaya || 'Algiers (Wilaya 16)', status: 'verified', strength: 'strong' },
          { id: 't-3', clusterId: 'telephony', label: 'Carrier Line', value: 'Ooredoo / Mobilis Cellular', status: 'verified', strength: 'medium' },
        ],
      },
      {
        id: 'personal',
        title: 'Personal Identifiers',
        color: '#f97316', // Orange
        ringIndex: 5,
        icon: 'User',
        count: 4,
        riskScore: 33,
        leaves: [
          { id: 'p-1', clusterId: 'personal', label: 'Full Legal Name', value: currentTarget.name, status: 'verified', strength: 'strong' },
          { id: 'p-2', clusterId: 'personal', label: 'Verified Email', value: currentTarget.email || 'oukil078@gmail.com', status: 'verified', strength: 'strong' },
          { id: 'p-3', clusterId: 'personal', label: 'Academic Role', value: currentTarget.organization || 'M.Sc. Cybersecurity', status: 'verified', strength: 'medium' },
        ],
      },
      {
        id: 'vulnerabilities',
        title: 'Exposures & CVEs',
        color: '#ef4444', // Red
        ringIndex: 6,
        icon: 'ShieldAlert',
        count: 2,
        riskScore: currentTarget.riskLevel === 'Critical' ? 88 : 22,
        leaves: [
          { id: 'v-1', clusterId: 'vulnerabilities', label: 'Security Headers', value: 'Grade B (CSP Hardened)', status: 'verified', strength: 'strong' },
          { id: 'v-2', clusterId: 'vulnerabilities', label: 'Attack Surface', value: 'Port 443 / Cloudflare Edge', status: 'verified', strength: 'strong' },
        ],
      },
      {
        id: 'notes',
        title: 'Case Intelligence Notes',
        color: '#ec4899', // Pink
        ringIndex: 7,
        icon: 'FileText',
        count: notes.length,
        riskScore: 18,
        leaves: notes.slice(0, 4).map((n, i) => ({
          id: `note-${n.id}`,
          clusterId: 'notes',
          label: n.title.slice(0, 20),
          value: n.category,
          status: 'verified' as const,
          strength: 'strong' as const,
          metadata: { noteId: n.id, content: n.content },
        })),
      },
    ];
  }, [currentTarget, notes]);

  // Create Target Handler
  const handleCreateTarget = () => {
    if (!newTargetName.trim()) return;
    const newTarget: TargetProfile = {
      id: `target-${Date.now()}`,
      name: newTargetName.trim(),
      handle: newTargetHandle.trim() || newTargetName.toLowerCase().replace(/\s+/g, '_'),
      role: newTargetRole,
      category: newTargetCategory,
      riskLevel: 'Medium',
      tags: ['investigated', 'active-target'],
      notesCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTargets(prev => [newTarget, ...prev]);
    setSelectedTargetId(newTarget.id);
    setShowAddTargetModal(false);
    setNewTargetName('');
    setNewTargetHandle('');
  };

  // Add Note directly to current target
  const handleAddNoteToTarget = async () => {
    if (!newNoteTitle.trim()) return;
    const newNote: BrainNoteItem = {
      id: `note-${Date.now()}`,
      title: `${currentTarget.name}: ${newNoteTitle.trim()}`,
      path: `Targets/${currentTarget.handle}/${newNoteTitle.trim()}.md`,
      relativePath: `Targets/${currentTarget.handle}/${newNoteTitle.trim()}.md`,
      category: 'Investigation Notes',
      tags: ['target', currentTarget.handle, 'forensic-note'],
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      frontmatter: {
        target: currentTarget.name,
        handle: currentTarget.handle,
      },
      links: ['Arachnid Web Crawler & Threat Intelligence Architecture'],
      wordCount: newNoteContent.split(/\s+/).length || 50,
      content: `# 📝 ${currentTarget.name} — ${newNoteTitle}\n\n${newNoteContent || 'No additional investigator notes.'}`,
    };
    await onSaveNote(newNote);
    setIsEditingNote(false);
    setNewNoteTitle('');
    setNewNoteContent('');
  };

  // Delete Target Handler
  const handleDeleteTarget = (id: string) => {
    if (targets.length <= 1) return;
    setTargets(prev => prev.filter(t => t.id !== id));
    setSelectedTargetId(targets.find(t => t.id !== id)?.id || targets[0].id);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* ========================================================================= */}
      {/* 1. TOP TELEMETRY BAR (Matching Image 4 Header)                            */}
      {/* ========================================================================= */}
      <div className="rounded-3xl bg-gradient-to-r from-[#09101d]/90 via-[#070b14]/95 to-[#0b1424]/90 border border-cyan-500/25 p-5 shadow-2xl backdrop-blur-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 font-mono text-[10px] font-bold border border-cyan-500/30">
                RADIAL NODE CONSTELLATION MATRIX
              </span>
              <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 font-mono text-[10px] border border-purple-500/30">
                7 ORBITAL CLUSTERS
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold font-mono text-white tracking-tight">
              TARGET INTELLIGENCE CLUSTERING OVERVIEW
            </h1>
            <p className="text-xs text-gray-400 font-mono mt-0.5">
              Multi-vector forensic constellation visualizing relationships, attribution strength, and attack surfaces.
            </p>
          </div>

          {/* Quick Metrics (Matching Image 4 Summary Counters) */}
          <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
            <div className="px-3.5 py-2 rounded-2xl bg-black/50 border border-white/10">
              <span className="text-[10px] text-gray-500 block uppercase">Total Artifacts</span>
              <span className="text-base font-bold text-cyan-300">
                {clusters.reduce((acc, c) => acc + c.leaves.length, 0)} Items
              </span>
            </div>
            <div className="px-3.5 py-2 rounded-2xl bg-black/50 border border-white/10">
              <span className="text-[10px] text-gray-500 block uppercase">Orbital Clusters</span>
              <span className="text-base font-bold text-purple-300">{clusters.length} Rings</span>
            </div>
            <div className="px-3.5 py-2 rounded-2xl bg-black/50 border border-white/10">
              <span className="text-[10px] text-gray-500 block uppercase">Avg Risk Factor</span>
              <span className="text-base font-bold text-emerald-400">32 / 100</span>
            </div>
            <div className="px-3.5 py-2 rounded-2xl bg-black/50 border border-white/10">
              <span className="text-[10px] text-gray-500 block uppercase">Target Exposure</span>
              <span className={`text-base font-bold ${currentTarget.riskLevel === 'Critical' ? 'text-red-400' : 'text-emerald-400'}`}>
                {currentTarget.riskLevel.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. THREE-COLUMN ENTERPRISE WORKSPACE                                       */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ----------------------------------------------------------------------- */}
        {/* LEFT COLUMN: Target Profiles & Clusters Sidebar (Cols 3/12)             */}
        {/* ----------------------------------------------------------------------- */}
        <div className="lg:col-span-3 space-y-4">
          {/* Target Selector & New Target Button */}
          <div className="rounded-3xl bg-[#09101c]/85 border border-cyan-500/20 p-4 shadow-xl backdrop-blur-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-xs font-mono font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-cyan-400" />
                Target Profiles
              </span>
              <button
                onClick={() => setShowAddTargetModal(true)}
                className="p-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 transition"
                title="Add New Target to Constellation"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Target Radio List */}
            <div className="space-y-2">
              {targets.map(target => (
                <div
                  key={target.id}
                  onClick={() => setSelectedTargetId(target.id)}
                  className={`group p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    target.id === selectedTargetId
                      ? 'bg-gradient-to-r from-cyan-500/25 to-blue-500/20 border-cyan-400 text-white shadow-sm'
                      : 'bg-black/40 border-white/5 text-gray-400 hover:bg-white/5 hover:text-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-xl bg-black/60 border border-white/10 flex items-center justify-center font-mono text-xs text-cyan-400 font-bold">
                      {target.name.slice(0, 1).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-xs font-mono font-bold truncate max-w-[140px]">{target.name}</h4>
                      <p className="text-[10px] font-mono text-gray-500">@{target.handle}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                        target.riskLevel === 'Critical'
                          ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {target.riskLevel}
                    </span>
                    {targets.length > 1 && (
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleDeleteTarget(target.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-red-400 transition"
                        title="Delete Target"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Clusters Category Breakdown (Matching Image 4 Left Sidebar List) */}
          <div className="rounded-3xl bg-[#09101c]/85 border border-white/10 p-4 shadow-xl backdrop-blur-xl space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs font-mono">
              <span className="font-bold text-gray-300 uppercase tracking-wider">Clusters</span>
              <span className="text-[10px] text-gray-500">{clusters.length} Rings</span>
            </div>

            <div className="space-y-1.5">
              {clusters.map(cluster => (
                <button
                  key={cluster.id}
                  onClick={() => setActiveClusterFilter(cluster.id)}
                  className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between text-xs font-mono transition ${
                    activeClusterFilter === cluster.id
                      ? 'bg-white/10 border-white/30 text-white font-bold'
                      : 'bg-black/30 border-white/5 text-gray-400 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: cluster.color }}
                    />
                    <span className="truncate">{cluster.title}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-gray-500">{cluster.leaves.length} items</span>
                    <span
                      className="text-[9px] px-1.5 py-0.2 rounded font-bold"
                      style={{ backgroundColor: `${cluster.color}20`, color: cluster.color }}
                    >
                      {cluster.riskScore}
                    </span>
                  </div>
                </button>
              ))}

              <button
                onClick={() => setActiveClusterFilter('all')}
                className="w-full mt-2 py-1.5 rounded-xl bg-black/40 hover:bg-white/5 border border-white/10 text-center text-xs font-mono text-cyan-300 transition"
              >
                Reset Cluster Filter (View All)
              </button>
            </div>
          </div>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* CENTER STAGE: Radial Constellation Diagram (Cols 6/12 - Image 4)        */}
        {/* ----------------------------------------------------------------------- */}
        <div className="lg:col-span-6 rounded-3xl bg-[#070b14]/95 border border-cyan-500/25 p-6 shadow-2xl backdrop-blur-2xl flex flex-col items-center justify-between min-h-[580px] relative overflow-hidden">
          {/* Subtle Cyber Grid Background */}
          <div className="absolute inset-0 bg-[radial-gradient(#00f0ff_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

          {/* Radial Graph Visual Stage */}
          <div className="relative w-full h-[480px] flex items-center justify-center select-none">
            {/* Concentric Dashed Orbital Rings */}
            <div className="absolute w-80 h-80 rounded-full border border-dashed border-cyan-500/15 pointer-events-none animate-spin [animation-duration:120s]" />
            <div className="absolute w-[440px] h-[440px] rounded-full border border-dashed border-purple-500/10 pointer-events-none" />

            {/* Central Anchor Node: Selected Target Identity */}
            <div className="relative z-20 group cursor-pointer flex flex-col items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#0c1e34] via-[#091524] to-[#040810] border-2 border-cyan-400 flex flex-col items-center justify-center shadow-[0_0_30px_rgba(0,240,255,0.35)] group-hover:scale-105 transition-transform duration-300 p-2 text-center">
                <User className="w-6 h-6 text-cyan-400 mb-1" />
                <span className="text-[11px] font-mono font-extrabold text-white leading-tight truncate max-w-[80px]">
                  {currentTarget.name.split(' ')[0]}
                </span>
                <span className="text-[9px] font-mono text-cyan-300 truncate max-w-[70px]">
                  @{currentTarget.handle}
                </span>
              </div>
              <span className="mt-2 text-[10px] font-mono text-gray-400 bg-black/60 px-2 py-0.5 rounded-full border border-cyan-500/20">
                Core Anchor Node
              </span>
            </div>

            {/* Orbiting Category Clusters (Arranged in a circle) */}
            {clusters.map((cluster, idx) => {
              const total = clusters.length;
              const angle = (idx / total) * (Math.PI * 2) - Math.PI / 2;
              const radiusDistance = 160; // Distance from center
              const cx = Math.cos(angle) * radiusDistance;
              const cy = Math.sin(angle) * radiusDistance;

              const isHighlighted = activeClusterFilter === 'all' || activeClusterFilter === cluster.id;

              return (
                <div
                  key={cluster.id}
                  style={{
                    transform: `translate(${cx}px, ${cy}px)`,
                  }}
                  className={`absolute z-10 transition-all duration-300 flex flex-col items-center ${
                    isHighlighted ? 'opacity-100 scale-100' : 'opacity-25 scale-95'
                  }`}
                >
                  {/* Connecting Silk Line from Center to Cluster */}
                  <div
                    className="absolute w-px bg-gradient-to-t pointer-events-none"
                    style={{
                      height: `${radiusDistance}px`,
                      bottom: '50%',
                      left: '50%',
                      transformOrigin: 'bottom center',
                      transform: `rotate(${angle + Math.PI / 2}rad)`,
                      backgroundImage: `linear-gradient(to top, rgba(0,240,255,0.1), ${cluster.color}60)`,
                    }}
                  />

                  {/* Circular Cluster Hub Node */}
                  <button
                    onClick={() => {
                      setActiveClusterFilter(cluster.id);
                      if (cluster.leaves[0]) setSelectedLeaf(cluster.leaves[0]);
                    }}
                    className="group/node relative w-12 h-12 rounded-full border-2 flex flex-col items-center justify-center transition-all duration-200 hover:scale-110 shadow-lg"
                    style={{
                      backgroundColor: '#0a101b',
                      borderColor: cluster.color,
                      boxShadow: `0 0 15px ${cluster.color}40`,
                    }}
                  >
                    <span
                      className="text-xs font-mono font-bold"
                      style={{ color: cluster.color }}
                    >
                      {cluster.leaves.length}
                    </span>
                  </button>

                  {/* Cluster Title Label */}
                  <span
                    className="mt-1 text-[9px] font-mono font-bold whitespace-nowrap px-1.5 py-0.5 rounded bg-black/70 border border-white/10"
                    style={{ color: cluster.color }}
                  >
                    {cluster.title}
                  </span>

                  {/* Satellite Leaves Radiating Around the Cluster */}
                  {cluster.leaves.map((leaf, leafIdx) => {
                    const leafTotal = cluster.leaves.length;
                    const leafAngle = angle + ((leafIdx - (leafTotal - 1) / 2) * 0.45);
                    const leafDist = 48; // Distance from cluster center
                    const lx = Math.cos(leafAngle) * leafDist;
                    const ly = Math.sin(leafAngle) * leafDist;

                    return (
                      <div
                        key={leaf.id}
                        style={{
                          transform: `translate(${lx}px, ${ly}px)`,
                        }}
                        onClick={() => setSelectedLeaf(leaf)}
                        className="absolute cursor-pointer group/leaf"
                        title={`${leaf.label}: ${leaf.value}`}
                      >
                        <div
                          className="w-3.5 h-3.5 rounded-full border border-white/20 transition-all hover:scale-150 flex items-center justify-center"
                          style={{
                            backgroundColor: leaf.status === 'critical' ? '#ef4444' : cluster.color,
                            boxShadow: `0 0 8px ${cluster.color}`,
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Bottom Legend (Matching Image 4 Footer) */}
          <div className="w-full pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-gray-400">
            <div className="flex items-center gap-3">
              <span className="text-[10px] uppercase text-gray-500">Relationship Strength:</span>
              <span className="flex items-center gap-1 text-[11px] text-gray-300">
                <span className="w-3 h-0.5 bg-cyan-400" /> Strong
              </span>
              <span className="flex items-center gap-1 text-[11px] text-gray-400">
                <span className="w-3 h-0.5 border-b border-dashed border-gray-400" /> Medium
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Verified Attribution
              </span>
            </div>
          </div>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* RIGHT COLUMN: Evidence Inspector & Note CRUD (Cols 3/12)                 */}
        {/* ----------------------------------------------------------------------- */}
        <div className="lg:col-span-3 space-y-4">
          {/* Selected Evidence Item Inspector */}
          <div className="rounded-3xl bg-[#09101c]/85 border border-white/10 p-5 shadow-xl backdrop-blur-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs font-mono">
              <span className="font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Evidence Inspector
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                LIVE
              </span>
            </div>

            {selectedLeaf ? (
              <div className="space-y-3 font-mono text-xs">
                <div className="p-3 bg-black/40 rounded-2xl border border-white/5 space-y-1">
                  <span className="text-[10px] text-gray-500 block uppercase">Cluster Category</span>
                  <span className="text-cyan-300 font-bold uppercase">{selectedLeaf.clusterId}</span>
                </div>

                <div className="p-3 bg-black/40 rounded-2xl border border-white/5 space-y-1">
                  <span className="text-[10px] text-gray-500 block uppercase">Artifact Label</span>
                  <span className="text-white font-bold">{selectedLeaf.label}</span>
                </div>

                <div className="p-3 bg-black/40 rounded-2xl border border-white/5 space-y-1">
                  <span className="text-[10px] text-gray-500 block uppercase">Discovered Value</span>
                  <span className="text-emerald-300 font-bold select-all break-all">{selectedLeaf.value}</span>
                </div>

                {selectedLeaf.url && (
                  <a
                    href={selectedLeaf.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 px-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 flex items-center justify-center gap-1.5 text-xs font-bold transition"
                  >
                    <span>Launch External URL</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            ) : (
              <div className="py-8 text-center text-gray-500 font-mono text-xs space-y-2">
                <Network className="w-8 h-8 mx-auto text-gray-600" />
                <p>Click any node or satellite leaf to inspect details.</p>
              </div>
            )}
          </div>

          {/* Quick Note Attachment CRUD for Current Target */}
          <div className="rounded-3xl bg-[#09101c]/85 border border-purple-500/20 p-5 shadow-xl backdrop-blur-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs font-mono">
              <span className="font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                Attach Target Note
              </span>
              <button
                onClick={() => setIsEditingNote(!isEditingNote)}
                className="text-[10px] text-purple-400 hover:text-purple-300 font-bold"
              >
                {isEditingNote ? 'Cancel' : '+ New Note'}
              </button>
            </div>

            {isEditingNote ? (
              <div className="space-y-2.5 font-mono text-xs">
                <input
                  type="text"
                  value={newNoteTitle}
                  onChange={e => setNewNoteTitle(e.target.value)}
                  placeholder="Note Title (e.g. Pivot Discovery)..."
                  className="w-full px-3 py-2 bg-black/60 border border-purple-500/30 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-400"
                />
                <textarea
                  value={newNoteContent}
                  onChange={e => setNewNoteContent(e.target.value)}
                  rows={4}
                  placeholder="Investigator remarks, indicators, or credentials..."
                  className="w-full px-3 py-2 bg-black/60 border border-purple-500/30 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 resize-none"
                />
                <button
                  onClick={handleAddNoteToTarget}
                  className="w-full py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-black font-bold flex items-center justify-center gap-1.5 transition"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save to Target Mesh</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-[11px] font-mono text-gray-400">
                  Target <span className="text-white font-bold">@{currentTarget.handle}</span> currently has{' '}
                  <span className="text-purple-300 font-bold">{notes.length}</span> active notes linked.
                </p>
                <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                  {notes.slice(0, 3).map(n => (
                    <div
                      key={n.id}
                      className="p-2 rounded-xl bg-black/40 border border-white/5 text-[11px] font-mono flex items-center justify-between text-gray-300"
                    >
                      <span className="truncate max-w-[150px]">{n.title}</span>
                      <span className="text-[9px] text-purple-400">{n.category}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. ADD NEW TARGET MODAL                                                   */}
      {/* ========================================================================= */}
      {showAddTargetModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-[#09101c] border border-cyan-500/40 p-6 shadow-2xl space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Plus className="w-4 h-4 text-cyan-400" />
                Initialize New Target Subject
              </h3>
              <button
                onClick={() => setShowAddTargetModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-gray-400 block mb-1 uppercase">Target Full Name / Label</label>
                <input
                  type="text"
                  value={newTargetName}
                  onChange={e => setNewTargetName(e.target.value)}
                  placeholder="e.g. John Doe / Subject Gamma"
                  className="w-full px-3 py-2 bg-black/60 border border-cyan-500/30 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-[10px] text-gray-400 block mb-1 uppercase">Primary Handle / Identifier</label>
                <input
                  type="text"
                  value={newTargetHandle}
                  onChange={e => setNewTargetHandle(e.target.value)}
                  placeholder="e.g. jdoe_ops"
                  className="w-full px-3 py-2 bg-black/60 border border-cyan-500/30 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-[10px] text-gray-400 block mb-1 uppercase">Investigation Classification</label>
                <select
                  value={newTargetCategory}
                  onChange={e => setNewTargetCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-black/60 border border-cyan-500/30 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="Audited Asset">Audited Asset (Authorized Scope)</option>
                  <option value="High-Value Target">High-Value Target (HVT)</option>
                  <option value="Threat Actor">Threat Actor / Malicious Entity</option>
                  <option value="Person of Interest">Person of Interest (POI)</option>
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowAddTargetModal(false)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTarget}
                disabled={!newTargetName.trim()}
                className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold disabled:opacity-50"
              >
                Create Target Hub
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
