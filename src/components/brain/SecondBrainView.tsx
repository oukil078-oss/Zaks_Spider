import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Network, 
  FileText, 
  Plus, 
  Trash2, 
  Save, 
  Search, 
  Send, 
  Sparkles, 
  RotateCcw, 
  Maximize2, 
  Tag, 
  Folder, 
  Check, 
  Copy,
  Terminal,
  Shield,
  Layers,
  Bot
} from 'lucide-react';
import { marked } from 'marked';
import { BrainNoteItem, ChatMessage, SpiderWebNode, SpiderWebLink } from '../../types';
import { api } from '../../services/api';

interface SecondBrainViewProps {
  notes: BrainNoteItem[];
  onSaveNote: (note: BrainNoteItem) => Promise<void>;
  onDeleteNote: (id: string) => Promise<void>;
  selectedNoteId?: string | null;
}

export const SecondBrainView: React.FC<SecondBrainViewProps> = ({
  notes,
  onSaveNote,
  onDeleteNote,
  selectedNoteId: initialSelectedNoteId,
}) => {
  const [activeTab, setActiveTab] = useState<'graph' | 'editor' | 'chat'>('graph');
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(initialSelectedNoteId || (notes[0]?.id ?? null));
  const [noteSearch, setNoteSearch] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  // Editor form state
  const currentNote = notes.find(n => n.id === selectedNoteId);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editTags, setEditTags] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editorMode, setEditorMode] = useState<'write' | 'preview'>('write');

  // Widow-AI Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: '🕷️ **Widow-AI Online:** Second Brain knowledge matrix connected. I have indexed your penetration testing notes, active recon targets, and exploit payloads. How can I assist your operation?',
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Canvas Graph Ref & State
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (currentNote) {
      setEditTitle(currentNote.title);
      setEditCategory(currentNote.category);
      setEditTags(currentNote.tags.join(', '));
      setEditContent(currentNote.content);
    }
  }, [currentNote]);

  // Build Spiderweb Graph Nodes and Silk Links
  const graphData = useMemo(() => {
    const nodes: SpiderWebNode[] = [
      {
        id: 'spider-hub',
        label: "ZAK'S SPIDER NUCLEUS",
        category: 'core',
        color: '#00f0ff',
        tier: 1,
        tags: ['core', 'nexus'],
        val: 20,
        linkCount: notes.length,
      },
    ];

    const links: SpiderWebLink[] = [];

    notes.forEach((note, idx) => {
      const color = 
        note.category === 'Methodology' ? '#a855f7' :
        note.category === 'Active Directory' ? '#38bdf8' :
        note.category === 'Target Recon' ? '#10b981' : '#f59e0b';

      nodes.push({
        id: note.id,
        label: note.title,
        category: 'note',
        color,
        tier: 2,
        tags: note.tags,
        path: note.path,
        val: 12,
        linkCount: 1,
      });

      links.push({
        source: 'spider-hub',
        target: note.id,
        type: 'silk',
      });
    });

    return { nodes, links };
  }, [notes]);

  // Canvas Interactive Spiderweb Simulation
  useEffect(() => {
    if (activeTab !== 'graph') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 550);

    let frame = 0;

    const render = () => {
      frame++;
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2 + pan.x;
      const cy = height / 2 + pan.y;

      // Draw concentric spiderweb silk rings
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(zoom, zoom);

      const rings = [60, 120, 180, 240, 300];
      rings.forEach((r, idx) => {
        ctx.beginPath();
        const sides = 8;
        for (let i = 0; i <= sides; i++) {
          const angle = (i * Math.PI * 2) / sides;
          const x = Math.cos(angle) * r;
          const y = Math.sin(angle) * r;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(0, 240, 255, ${0.08 + idx * 0.02})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      });

      // Draw radial web spokes
      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI * 2) / 8;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(angle) * 320, Math.sin(angle) * 320);
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.1)';
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      // Draw Silk Links between Hub and Notes
      const totalNotes = graphData.nodes.length - 1;
      const positions: Record<string, { x: number; y: number }> = {
        'spider-hub': { x: 0, y: 0 },
      };

      graphData.nodes.slice(1).forEach((node, i) => {
        const angle = (i * Math.PI * 2) / Math.max(1, totalNotes);
        const dist = 160 + (i % 2) * 50;
        positions[node.id] = {
          x: Math.cos(angle) * dist,
          y: Math.sin(angle) * dist,
        };
      });

      // Render links with glowing electrical pulses
      graphData.links.forEach((l) => {
        const p1 = positions[l.source];
        const p2 = positions[l.target];
        if (!p1 || !p2) return;

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.35)';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Traveling electrical pulse along silk thread
        const progress = (frame * 0.015 + (parseInt(l.target.slice(-3)) || 0)) % 1;
        const pulseX = p1.x + (p2.x - p1.x) * progress;
        const pulseY = p1.y + (p2.y - p1.y) * progress;
        ctx.beginPath();
        ctx.arc(pulseX, pulseY, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#00f0ff';
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Render Nodes
      graphData.nodes.forEach((node) => {
        const pos = positions[node.id];
        if (!pos) return;

        ctx.beginPath();
        ctx.arc(pos.x, pos.y, node.val, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.shadowColor = node.color;
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Label
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(node.label.slice(0, 18), pos.x, pos.y + node.val + 14);
      });

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [activeTab, graphData, zoom, pan]);

  // Handle Save Note
  const handleSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle) return;

    const noteToSave: BrainNoteItem = {
      id: currentNote?.id || `note-${Date.now()}`,
      title: editTitle,
      path: `Notes/${editTitle.replace(/[\\/:*?"<>|]/g, '')}.md`,
      relativePath: `Notes/${editTitle.replace(/[\\/:*?"<>|]/g, '')}.md`,
      category: editCategory || 'General',
      tags: editTags.split(',').map(t => t.trim()).filter(Boolean),
      created: currentNote?.created || new Date().toISOString(),
      updated: new Date().toISOString(),
      content: editContent,
      frontmatter: {
        title: editTitle,
        category: editCategory,
        tags: editTags.split(',').map(t => t.trim()).filter(Boolean),
      },
      links: [],
      wordCount: editContent.split(/\s+/).filter(Boolean).length,
    };

    await onSaveNote(noteToSave);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  // Handle Send Chat
  const handleSendChat = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = chatInput.trim();
    if (!text || isChatLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString(),
    };

    const updated = [...chatMessages, userMsg];
    setChatMessages(updated);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const reply = await api.chatWithWidow(updated, { notesCount: notes.length });
      setChatMessages(prev => [
        ...prev,
        {
          id: `reply-${Date.now()}`,
          role: 'assistant',
          content: reply,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } catch {
      setChatMessages(prev => [
        ...prev,
        {
          id: `reply-err-${Date.now()}`,
          role: 'assistant',
          content: '🕷️ Connection to Widow-AI mesh timed out. Heuristic fallback engaged.',
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const filteredNotes = notes.filter(n =>
    n.title.toLowerCase().includes(noteSearch.toLowerCase()) ||
    n.category.toLowerCase().includes(noteSearch.toLowerCase()) ||
    n.tags.some(t => t.toLowerCase().includes(noteSearch.toLowerCase()))
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-r from-spider-card via-spider-surface to-spider-void border border-purple-500/20 shadow-purple-glow">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400">
                <Network className="w-5 h-5" />
              </span>
              <h1 className="text-xl sm:text-2xl font-black font-mono tracking-tight text-white flex items-center gap-2">
                ARACHNID AI SECOND BRAIN
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-gray-300 font-mono">
              The Neural Web: 3D interactive knowledge graph, Obsidian-compatible markdown vault, and Widow-AI assistant.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('graph')}
              className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition ${
                activeTab === 'graph'
                  ? 'bg-purple-500 text-black shadow-purple-glow'
                  : 'bg-black/40 text-gray-400 hover:text-white border border-white/5'
              }`}
            >
              Neural Web Graph
            </button>
            <button
              onClick={() => setActiveTab('editor')}
              className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition ${
                activeTab === 'editor'
                  ? 'bg-purple-500 text-black shadow-purple-glow'
                  : 'bg-black/40 text-gray-400 hover:text-white border border-white/5'
              }`}
            >
              Vault Studio
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 ${
                activeTab === 'chat'
                  ? 'bg-purple-500 text-black shadow-purple-glow'
                  : 'bg-black/40 text-gray-400 hover:text-white border border-white/5'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Widow-AI</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tab 1: Interactive Spiderweb Knowledge Graph */}
      {activeTab === 'graph' && (
        <div className="relative rounded-2xl spider-glass border border-cyan-500/30 overflow-hidden h-[600px] flex flex-col">
          {/* Top Controls Overlay */}
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
            <span className="px-3 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-cyan-500/30 text-xs font-mono text-cyan-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
              <span>THE NEURAL SILK MESH ({graphData.nodes.length} NODES)</span>
            </span>
          </div>

          <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5">
            <button
              onClick={() => setZoom(z => Math.min(z + 0.2, 2.5))}
              className="w-8 h-8 rounded-lg bg-black/60 border border-white/10 text-white font-mono text-sm hover:border-cyan-400 transition flex items-center justify-center"
            >
              +
            </button>
            <button
              onClick={() => setZoom(z => Math.max(z - 0.2, 0.4))}
              className="w-8 h-8 rounded-lg bg-black/60 border border-white/10 text-white font-mono text-sm hover:border-cyan-400 transition flex items-center justify-center"
            >
              -
            </button>
            <button
              onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
              className="px-2.5 h-8 rounded-lg bg-black/60 border border-white/10 text-gray-300 font-mono text-xs hover:border-cyan-400 transition flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          <canvas
            ref={canvasRef}
            className="w-full h-full cursor-grab active:cursor-grabbing bg-[#070b12]"
            onMouseDown={(e) => {
              setIsDragging(true);
              setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
            }}
            onMouseMove={(e) => {
              if (isDragging) {
                setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
              }
            }}
            onMouseUp={() => setIsDragging(false)}
            onMouseLeave={() => setIsDragging(false)}
          />
        </div>
      )}

      {/* Tab 2: Vault Studio & Markdown Editor */}
      {activeTab === 'editor' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left: Notes Navigator */}
          <div className="p-4 rounded-2xl spider-glass space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-purple-300 uppercase">
                VAULT NOTES ({notes.length})
              </span>
              <button
                onClick={() => {
                  setSelectedNoteId(null);
                  setEditTitle('New Cyber Debrief');
                  setEditCategory('Recon');
                  setEditTags('target, cve');
                  setEditContent('# 🕷️ Target Debrief\n\n- Host:\n- Discovered Services:\n- Exploit Vectors:');
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-mono hover:bg-purple-500/30 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New</span>
              </button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search notes..."
                value={noteSearch}
                onChange={(e) => setNoteSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-black/50 border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-purple-400"
              />
            </div>

            <div className="space-y-1.5 max-h-[500px] overflow-y-auto">
              {filteredNotes.map((note) => {
                const isSel = note.id === selectedNoteId;
                return (
                  <div
                    key={note.id}
                    onClick={() => setSelectedNoteId(note.id)}
                    className={`p-3 rounded-xl cursor-pointer transition border ${
                      isSel
                        ? 'bg-purple-500/20 border-purple-500/40 text-white'
                        : 'bg-black/30 border-white/5 text-gray-300 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-mono font-bold mb-1">
                      <span className="truncate mr-2">{note.title}</span>
                      <span className="text-[10px] text-purple-400 shrink-0">{note.category}</span>
                    </div>
                    <p className="text-[11px] text-gray-400 line-clamp-2">
                      {note.content.replace(/[#*`_]/g, '')}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Markdown Editor Studio */}
          <div className="md:col-span-2 p-5 rounded-2xl spider-glass space-y-4">
            <form onSubmit={handleSaveSubmit} className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <input
                  type="text"
                  required
                  placeholder="Note Title..."
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-black/50 border border-purple-500/20 text-white font-mono font-bold text-sm focus:outline-none focus:border-purple-400"
                />

                <div className="flex items-center gap-2">
                  <div className="flex items-center p-0.5 rounded-lg bg-black/40 border border-white/10 text-xs font-mono">
                    <button
                      type="button"
                      onClick={() => setEditorMode('write')}
                      className={`px-3 py-1 rounded ${editorMode === 'write' ? 'bg-purple-500 text-black font-bold' : 'text-gray-400'}`}
                    >
                      Write
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditorMode('preview')}
                      className={`px-3 py-1 rounded ${editorMode === 'preview' ? 'bg-purple-500 text-black font-bold' : 'text-gray-400'}`}
                    >
                      Preview
                    </button>
                  </div>

                  <button
                    type="submit"
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-mono text-xs font-bold transition shadow-sm ${
                      isSaved
                        ? 'bg-emerald-500 text-black'
                        : 'bg-purple-500 hover:bg-purple-400 text-black'
                    }`}
                  >
                    {isSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                    <span>{isSaved ? 'SAVED' : 'SAVE'}</span>
                  </button>

                  {currentNote && (
                    <button
                      type="button"
                      onClick={() => onDeleteNote(currentNote.id)}
                      className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition"
                      title="Delete Note"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Category (e.g. Methodology, Active Directory)..."
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-purple-400"
                />
                <input
                  type="text"
                  placeholder="Tags (comma-separated)..."
                  value={editTags}
                  onChange={(e) => setEditTags(e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-purple-400"
                />
              </div>

              {editorMode === 'write' ? (
                <textarea
                  rows={14}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full p-4 rounded-xl bg-black/70 border border-purple-500/20 text-cyan-100 font-mono text-xs leading-relaxed focus:outline-none focus:border-purple-400 resize-y"
                  placeholder="Write Markdown notes, code snippets, or [[wikilinks]]..."
                />
              ) : (
                <div 
                  className="p-4 rounded-xl bg-black/70 border border-purple-500/20 min-h-[320px] spider-markdown text-xs overflow-y-auto"
                  dangerouslySetInnerHTML={{ __html: marked.parse(editContent) as string }}
                />
              )}
            </form>
          </div>
        </div>
      )}

      {/* Tab 3: Widow-AI Interactive Chat */}
      {activeTab === 'chat' && (
        <div className="rounded-2xl spider-glass border border-purple-500/30 overflow-hidden flex flex-col h-[600px]">
          <div className="p-4 border-b border-purple-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Bot className="w-4 h-4" />
              </span>
              <span className="font-mono text-xs font-bold text-white">
                WIDOW-AI AUTONOMOUS DIRECTIVE CHAT
              </span>
            </div>
            <span className="text-[11px] font-mono text-purple-300">
              ● SECOND BRAIN VAULT SYNCHRONIZED
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-2xl rounded-2xl p-4 text-xs font-mono leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-200'
                      : 'bg-black/60 border border-purple-500/20 text-gray-200 spider-markdown'
                  }`}
                  dangerouslySetInnerHTML={{ __html: marked.parse(msg.content) as string }}
                />
              </div>
            ))}
            {isChatLoading && (
              <div className="flex gap-2 items-center text-xs font-mono text-purple-400 p-2">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>Widow-AI is weaving cybersecurity intelligence...</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSendChat} className="p-3 border-t border-purple-500/20 bg-black/40 flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask Widow-AI for pentest advice, CVE exploit guidance, or note synthesis..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-black/60 border border-purple-500/20 text-white font-mono text-xs focus:outline-none focus:border-purple-400"
            />
            <button
              type="submit"
              disabled={isChatLoading}
              className="px-5 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-black font-mono font-bold text-xs shadow-purple-glow transition flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>TRANSMIT</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
