import React, { useState, useEffect, useMemo } from 'react';
import { geoMercator, geoPath } from 'd3-geo';
import { 
  Compass, Crosshair, MapPin, Search, Layers, 
  ZoomIn, ZoomOut, RotateCcw, Radio, 
  Activity, Navigation, CheckCircle2, Signal, Globe
} from 'lucide-react';
import algeriaWilayasData from '../../data/algeriaWilayas69.json';

export interface WilayaItem {
  code: number;
  name: string;
  name_fr: string;
  communesCount: number;
  lng: number;
  lat: number;
}

export interface CommuneFeature {
  properties: {
    id: string;
    commune_name: string;
    commune_name_fr: string;
    daira_name: string;
    daira_name_fr: string;
    wilaya_code: number;
    wilaya_name: string;
    wilaya_name_fr: string;
    code_commune: number;
  };
  geometry: {
    type: string;
    coordinates: [number, number];
  };
}

interface AlgeriaGisMapProps {
  onSelectCommune?: (commune: CommuneFeature['properties'], coords: [number, number]) => void;
  targetIp?: string;
}

export const AlgeriaGisMap: React.FC<AlgeriaGisMapProps> = ({
  onSelectCommune,
  targetIp = '105.101.42.18'
}) => {
  const wilayas: WilayaItem[] = algeriaWilayasData;
  const [selectedCode, setSelectedCode] = useState<number>(16); // Default 16 - Algiers
  const [geoJson, setGeoJson] = useState<any | null>(null);
  const [allCommunes, setAllCommunes] = useState<CommuneFeature[]>([]);
  const [isLoadingCommunes, setIsLoadingCommunes] = useState<boolean>(true);
  const [selectedCommune, setSelectedCommune] = useState<CommuneFeature | null>(null);
  const [hoveredNode, setHoveredNode] = useState<{
    name: string;
    name_fr: string;
    daira?: string;
    code: number;
    coords: [number, number];
    x: number;
    y: number;
  } | null>(null);

  // Search & Navigation State
  const [communeSearch, setCommuneSearch] = useState('');
  const [viewMode, setViewMode] = useState<'wilaya' | 'national'>('wilaya');
  const [zoomScaleMultiplier, setZoomScaleMultiplier] = useState(1.0);
  const [ipInput, setIpInput] = useState(targetIp);
  const [isPinging, setIsPinging] = useState(false);
  const [pingLatency, setPingLatency] = useState(14);

  // Load Algeria Border GeoJSON
  useEffect(() => {
    fetch('/algeria_wilayas.json')
      .then((r) => r.json())
      .then((data) => setGeoJson(data))
      .catch((err) => console.error('Failed to load algeria_wilayas.json', err));
  }, []);

  // Load 1,541 Communes GeoJSON
  useEffect(() => {
    setIsLoadingCommunes(true);
    fetch('/algeria_cities.json')
      .then((r) => r.json())
      .then((data) => {
        if (data && data.features) {
          setAllCommunes(data.features);
          // Auto select first commune of Wilaya 16 (Algiers)
          const algCommune = data.features.find((f: any) => f.properties.wilaya_code === 16);
          if (algCommune) {
            setSelectedCommune(algCommune);
          }
        }
      })
      .catch((err) => console.error('Failed to load algeria_cities.json', err))
      .finally(() => setIsLoadingCommunes(false));
  }, []);

  // Active selected Wilaya object
  const currentWilaya = useMemo(() => {
    return wilayas.find((w) => w.code === selectedCode) || wilayas[15]; // Wilaya 16
  }, [wilayas, selectedCode]);

  // Communes belonging to currently selected Wilaya
  const currentWilayaCommunes = useMemo(() => {
    return allCommunes.filter((f) => Number(f.properties.wilaya_code) === selectedCode);
  }, [allCommunes, selectedCode]);

  // Filtered Communes by user search
  const filteredCommunes = useMemo(() => {
    if (!communeSearch.trim()) return currentWilayaCommunes;
    const q = communeSearch.toLowerCase().trim();
    return currentWilayaCommunes.filter(
      (c) =>
        c.properties.commune_name_fr.toLowerCase().includes(q) ||
        c.properties.commune_name.includes(q) ||
        c.properties.daira_name_fr.toLowerCase().includes(q)
    );
  }, [currentWilayaCommunes, communeSearch]);

  // Target coordinates for Reticle
  const targetCoords: [number, number] = useMemo(() => {
    if (selectedCommune) {
      return selectedCommune.geometry.coordinates;
    }
    return [currentWilaya.lng, currentWilaya.lat];
  }, [selectedCommune, currentWilaya]);

  // D3 Projection Calculation
  const { projection, pathGenerator } = useMemo(() => {
    const width = 800;
    const height = 600;

    let center: [number, number] = [3.0, 28.0];
    let baseScale = 1600;

    if (viewMode === 'wilaya') {
      center = [currentWilaya.lng, currentWilaya.lat];
      baseScale = 4600;
      // If northern coastal wilayas (higher latitude), zoom slightly tighter
      if (currentWilaya.lat > 35) {
        baseScale = 6800;
      }
    }

    const proj = geoMercator()
      .center(center)
      .scale(baseScale * zoomScaleMultiplier)
      .translate([width / 2, height / 2]);

    const pathGen = geoPath().projection(proj);

    return { projection: proj, pathGenerator: pathGen };
  }, [viewMode, currentWilaya, zoomScaleMultiplier]);

  // Rendered SVG path for Algerian polygon
  const algeriaPath = useMemo(() => {
    if (!geoJson) return null;
    try {
      return pathGenerator(geoJson);
    } catch (e) {
      return null;
    }
  }, [geoJson, pathGenerator]);

  // Projected Reticle Position
  const reticlePoint = useMemo(() => {
    const p = projection(targetCoords);
    return p ? { x: p[0], y: p[1] } : { x: 400, y: 300 };
  }, [projection, targetCoords]);

  // Handle Wilaya selection
  const handleSelectWilaya = (code: number) => {
    setSelectedCode(code);
    setViewMode('wilaya');
    setCommuneSearch('');
    // Pick first commune in this wilaya
    const firstCommune = allCommunes.find((f) => Number(f.properties.wilaya_code) === code);
    if (firstCommune) {
      setSelectedCommune(firstCommune);
      if (onSelectCommune) {
        onSelectCommune(firstCommune.properties, firstCommune.geometry.coordinates);
      }
    } else {
      setSelectedCommune(null);
    }
  };

  // Handle Commune click
  const handleSelectCommune = (commune: CommuneFeature) => {
    setSelectedCommune(commune);
    if (onSelectCommune) {
      onSelectCommune(commune.properties, commune.geometry.coordinates);
    }
  };

  // Simulated IP trace
  const handleTraceIp = () => {
    setIsPinging(true);
    setPingLatency(10 + Math.floor(Math.random() * 20));
    setTimeout(() => {
      setIsPinging(false);
    }, 450);
  };

  return (
    <div className="w-full h-full flex flex-col gap-2.5 overflow-hidden text-slate-200 select-none">
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-[#080d18] border border-cyan-500/25 shrink-0">
        {/* Wilaya Selector (All 69 Wilayas) */}
        <div className="flex items-center gap-2 flex-1 min-w-[280px]">
          <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
          <div className="flex-1 flex items-center gap-1.5">
            <select
              value={selectedCode}
              onChange={(e) => handleSelectWilaya(Number(e.target.value))}
              className="w-full max-w-[340px] px-2.5 py-1.5 text-xs bg-black/80 border border-cyan-500/40 rounded-lg text-cyan-300 font-mono font-bold focus:outline-none focus:border-cyan-400 cursor-pointer"
            >
              {wilayas.map((w) => (
                <option key={w.code} value={w.code} className="bg-[#090f1e] text-white">
                  {String(w.code).padStart(2, '0')} - {w.name_fr} ({w.name}) • {w.communesCount} Communes
                </option>
              ))}
            </select>

            <span className="text-[10px] px-2 py-1 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-mono font-bold whitespace-nowrap">
              69 WILAYAS READY
            </span>
          </div>
        </div>

        {/* View Mode & Zoom Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg bg-black/60 border border-cyan-500/30 p-0.5 text-xs font-mono font-bold">
            <button
              onClick={() => setViewMode('wilaya')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                viewMode === 'wilaya' ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-400/50' : 'text-slate-400 hover:text-white'
              }`}
            >
              Focus Wilaya
            </button>
            <button
              onClick={() => setViewMode('national')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                viewMode === 'national' ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-400/50' : 'text-slate-400 hover:text-white'
              }`}
            >
              National (69)
            </button>
          </div>

          <div className="flex items-center gap-1 bg-black/60 border border-cyan-500/30 rounded-lg p-1">
            <button
              onClick={() => setZoomScaleMultiplier((z) => Math.min(3.5, z + 0.25))}
              title="Zoom In"
              className="p-1 text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomScaleMultiplier((z) => Math.max(0.6, z - 0.25))}
              title="Zoom Out"
              className="p-1 text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                setZoomScaleMultiplier(1.0);
                setViewMode('wilaya');
              }}
              title="Reset Zoom"
              className="p-1 text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Map & HUD Layout */}
      <div className="flex-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-2.5 overflow-hidden">
        {/* Left/Center Interactive SVG Map (8 cols) */}
        <div className="lg:col-span-8 flex flex-col h-full rounded-xl bg-[#040812] border border-cyan-500/30 relative overflow-hidden shadow-2xl">
          {/* Top Canvas HUD Overlay */}
          <div className="absolute top-2.5 left-2.5 right-2.5 z-10 flex items-center justify-between pointer-events-none text-xs font-mono">
            <div className="flex items-center gap-2 bg-[#060c18]/90 border border-cyan-500/30 px-2.5 py-1 rounded-lg backdrop-blur-md pointer-events-auto">
              <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span className="text-cyan-300 font-bold">
                {viewMode === 'wilaya'
                  ? `WILAYA ${String(currentWilaya.code).padStart(2, '0')}: ${currentWilaya.name_fr.toUpperCase()} (${currentWilaya.name})`
                  : 'ALGERIA NATIONAL AIRSPACE // 69 ADMINISTRATIVE WILAYAS'}
              </span>
            </div>

            <div className="bg-[#060c18]/90 border border-cyan-500/30 px-2.5 py-1 rounded-lg backdrop-blur-md pointer-events-auto text-[11px] text-emerald-400 font-bold flex items-center gap-1.5">
              <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
              <span>RADAR RETICLE LOCKED</span>
            </div>
          </div>

          {/* SVG Map Canvas */}
          <div className="flex-1 w-full h-full relative flex items-center justify-center">
            <svg
              viewBox="0 0 800 600"
              className="w-full h-full object-contain cursor-crosshair"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                {/* Neon Cyan Glow Filter */}
                <filter id="cyan-neon-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                {/* Radar Grid Pattern */}
                <pattern id="grid-matrix" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(0, 240, 255, 0.05)" strokeWidth="1" />
                </pattern>
              </defs>

              {/* Background Radar Grid */}
              <rect width="800" height="600" fill="url(#grid-matrix)" />

              {/* Concentric Tactical Rings */}
              <circle cx="400" cy="300" r="280" fill="none" stroke="rgba(0, 240, 255, 0.06)" strokeDasharray="4 8" />
              <circle cx="400" cy="300" r="180" fill="none" stroke="rgba(0, 240, 255, 0.08)" strokeDasharray="2 6" />
              <circle cx="400" cy="300" r="90" fill="none" stroke="rgba(0, 240, 255, 0.1)" />

              {/* National Border Polygon */}
              {algeriaPath && (
                <path
                  d={algeriaPath}
                  fill="rgba(6, 18, 38, 0.75)"
                  stroke="rgba(0, 240, 255, 0.85)"
                  strokeWidth="1.5"
                  filter="url(#cyan-neon-glow)"
                  className="transition-all duration-300"
                />
              )}

              {/* National View: Plot All 69 Wilaya Centroid Nodes */}
              {viewMode === 'national' &&
                wilayas.map((w) => {
                  const pt = projection([w.lng, w.lat]);
                  if (!pt) return null;
                  const isSelected = w.code === selectedCode;

                  return (
                    <g
                      key={w.code}
                      transform={`translate(${pt[0]}, ${pt[1]})`}
                      className="cursor-pointer group"
                      onClick={() => handleSelectWilaya(w.code)}
                      onMouseEnter={() => {
                        setHoveredNode({
                          name: w.name,
                          name_fr: w.name_fr,
                          code: w.code,
                          coords: [w.lng, w.lat],
                          x: pt[0],
                          y: pt[1],
                        });
                      }}
                      onMouseLeave={() => setHoveredNode(null)}
                    >
                      <circle
                        r={isSelected ? 6 : 3.5}
                        fill={isSelected ? '#00f0ff' : 'rgba(0, 240, 255, 0.4)'}
                        stroke="#00f0ff"
                        strokeWidth="1"
                        className="transition-all duration-150"
                      />
                      {isSelected && (
                        <circle
                          r="12"
                          fill="none"
                          stroke="#00f0ff"
                          strokeWidth="1"
                          strokeDasharray="2 2"
                          className="animate-ping"
                        />
                      )}
                      <text
                        x="7"
                        y="3"
                        fill={isSelected ? '#00f0ff' : '#94a3b8'}
                        fontSize="8"
                        fontFamily="monospace"
                        fontWeight="bold"
                      >
                        {String(w.code).padStart(2, '0')}
                      </text>
                    </g>
                  );
                })}

              {/* Wilaya Focused View: Plot All Communes of this Wilaya */}
              {viewMode === 'wilaya' &&
                currentWilayaCommunes.map((commune) => {
                  const coords = commune.geometry.coordinates;
                  const pt = projection(coords);
                  if (!pt) return null;
                  const isSelected = selectedCommune?.properties.id === commune.properties.id;

                  return (
                    <g
                      key={commune.properties.id}
                      transform={`translate(${pt[0]}, ${pt[1]})`}
                      className="cursor-pointer group"
                      onClick={() => handleSelectCommune(commune)}
                      onMouseEnter={() => {
                        setHoveredNode({
                          name: commune.properties.commune_name,
                          name_fr: commune.properties.commune_name_fr,
                          daira: commune.properties.daira_name_fr,
                          code: Number(commune.properties.wilaya_code),
                          coords: coords,
                          x: pt[0],
                          y: pt[1],
                        });
                      }}
                      onMouseLeave={() => setHoveredNode(null)}
                    >
                      <circle
                        r={isSelected ? 5 : 2.8}
                        fill={isSelected ? '#10b981' : 'rgba(0, 240, 255, 0.6)'}
                        stroke={isSelected ? '#10b981' : '#00f0ff'}
                        strokeWidth="1"
                      />
                      {isSelected && (
                        <circle
                          r="10"
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="1"
                          className="animate-ping opacity-75"
                        />
                      )}
                      <text
                        x="6"
                        y="2.5"
                        fill={isSelected ? '#34d399' : '#cbd5e1'}
                        fontSize="7.5"
                        fontFamily="monospace"
                        className="opacity-80 group-hover:opacity-100"
                      >
                        {commune.properties.commune_name_fr}
                      </text>
                    </g>
                  );
                })}

              {/* Laser Target Reticle over selected point */}
              <g transform={`translate(${reticlePoint.x}, ${reticlePoint.y})`}>
                {/* Horizontal & Vertical Crosshair Lines */}
                <line x1="-30" y1="0" x2="-10" y2="0" stroke="#00f0ff" strokeWidth="1.5" />
                <line x1="10" y1="0" x2="30" y2="0" stroke="#00f0ff" strokeWidth="1.5" />
                <line x1="0" y1="-30" x2="0" y2="-10" stroke="#00f0ff" strokeWidth="1.5" />
                <line x1="0" y1="10" x2="0" y2="30" stroke="#00f0ff" strokeWidth="1.5" />

                {/* Inner target circle */}
                <circle cx="0" cy="0" r="8" fill="none" stroke="#00f0ff" strokeWidth="1.5" />
                <circle cx="0" cy="0" r="2" fill="#00f0ff" />

                {/* Outer animated rotating radar ring */}
                <circle
                  cx="0"
                  cy="0"
                  r="20"
                  fill="none"
                  stroke="#00f0ff"
                  strokeWidth="1"
                  strokeDasharray="6 4"
                  className="animate-spin-slow"
                />

                {/* Target Lat / Long Readout Label */}
                <text
                  x="16"
                  y="-14"
                  fill="#00f0ff"
                  fontSize="8"
                  fontFamily="monospace"
                  fontWeight="bold"
                  className="select-none"
                >
                  [{targetCoords[1].toFixed(4)}°N, {targetCoords[0].toFixed(4)}°E]
                </text>
              </g>

              {/* Tooltip Hover Bubble */}
              {hoveredNode && (
                <g transform={`translate(${hoveredNode.x + 12}, ${hoveredNode.y - 12})`} className="pointer-events-none">
                  <rect
                    x="0"
                    y="-28"
                    width="170"
                    height="34"
                    rx="5"
                    fill="rgba(8, 14, 26, 0.95)"
                    stroke="#00f0ff"
                    strokeWidth="1"
                  />
                  <text x="8" y="-14" fill="#ffffff" fontSize="9" fontFamily="monospace" fontWeight="bold">
                    {hoveredNode.name_fr} ({hoveredNode.name})
                  </text>
                  <text x="8" y="-3" fill="#38bdf8" fontSize="7.5" fontFamily="monospace">
                    {hoveredNode.daira ? `Daïra: ${hoveredNode.daira} // ` : ''}W{hoveredNode.code}
                  </text>
                </g>
              )}
            </svg>
          </div>

          {/* Bottom Canvas Telemetry Bar */}
          <div className="p-2 border-t border-cyan-500/20 bg-[#060c18] flex items-center justify-between text-[11px] font-mono text-slate-300">
            <div className="flex items-center gap-3">
              <div>
                <span className="text-slate-500">LAT:</span>{' '}
                <span className="text-cyan-300 font-bold">{targetCoords[1].toFixed(5)}° N</span>
              </div>
              <div>
                <span className="text-slate-500">LON:</span>{' '}
                <span className="text-cyan-300 font-bold">{targetCoords[0].toFixed(5)}° E</span>
              </div>
              <div className="hidden md:block">
                <span className="text-slate-500">DAÏRA:</span>{' '}
                <span className="text-purple-300 font-bold">
                  {selectedCommune ? selectedCommune.properties.daira_name_fr : currentWilaya.name_fr}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-500">COMMUNES:</span>
              <span className="text-emerald-400 font-bold">
                {currentWilayaCommunes.length} in W{currentWilaya.code}
              </span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-400">1,541 National Total</span>
            </div>
          </div>
        </div>

        {/* Right Side: Commune Explorer & IP Telemetry HUD (4 cols) */}
        <div className="lg:col-span-4 flex flex-col h-full gap-2.5 overflow-hidden">
          {/* 1. Selected Commune Telemetry Card */}
          <div className="p-3 rounded-xl bg-[#080e1a] border border-cyan-500/25 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-cyan-400 font-bold">
              <div className="flex items-center gap-1.5">
                <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
                <span>ACTIVE TARGET HUD</span>
              </div>
              <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[9px]">
                LOCKED
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-black/70 border border-cyan-500/15 space-y-1.5 text-xs font-mono">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">COMMUNE:</span>
                <span className="text-white font-bold">
                  {selectedCommune ? selectedCommune.properties.commune_name_fr : currentWilaya.name_fr}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">ARABIC:</span>
                <span className="text-cyan-300 font-bold">
                  {selectedCommune ? selectedCommune.properties.commune_name : currentWilaya.name}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">DAÏRA / DISTRICT:</span>
                <span className="text-purple-300 font-bold">
                  {selectedCommune ? selectedCommune.properties.daira_name_fr : currentWilaya.name_fr}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">WILAYA:</span>
                <span className="text-emerald-400 font-bold">
                  {String(currentWilaya.code).padStart(2, '0')} - {currentWilaya.name_fr}
                </span>
              </div>
            </div>

            {/* IP Geolocation Pin & Simulated Fiber Gateway */}
            <div className="pt-1 space-y-1.5">
              <label className="text-[10px] text-slate-400 font-mono font-bold flex items-center justify-between">
                <span>IP ROUTING & GATEWAY NODE:</span>
                <span className="text-emerald-400 font-normal">AS36947 Algérie Télécom</span>
              </label>

              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={ipInput}
                  onChange={(e) => setIpInput(e.target.value)}
                  className="flex-1 px-2 py-1 text-xs bg-black/80 border border-cyan-500/30 rounded-lg text-white font-mono"
                  placeholder="105.101.42.18"
                />
                <button
                  onClick={handleTraceIp}
                  disabled={isPinging}
                  className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-cyan-500/40 to-blue-600/40 border border-cyan-400/50 text-cyan-300 text-xs font-mono font-bold hover:brightness-110 cursor-pointer disabled:opacity-50"
                >
                  {isPinging ? 'PINGING...' : 'TRACE'}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono mt-1">
                <div className="p-1.5 rounded bg-black/50 border border-slate-800">
                  <span className="text-slate-500">LATENCY:</span>{' '}
                  <span className="text-emerald-400 font-bold">{pingLatency}ms (Fiber POP)</span>
                </div>
                <div className="p-1.5 rounded bg-black/50 border border-slate-800">
                  <span className="text-slate-500">CARRIER:</span>{' '}
                  <span className="text-cyan-300 font-bold">FTTH Broadband</span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Communes Explorer List within Selected Wilaya */}
          <div className="flex-1 flex flex-col rounded-xl bg-[#080e1a] border border-cyan-500/25 overflow-hidden">
            <div className="p-2.5 border-b border-cyan-500/20 bg-[#091222] flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-white">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>COMMUNES ({currentWilayaCommunes.length})</span>
              </div>

              <div className="relative w-36">
                <Search className="w-3 h-3 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={communeSearch}
                  onChange={(e) => setCommuneSearch(e.target.value)}
                  placeholder="Filter commune..."
                  className="w-full pl-6 pr-2 py-0.5 text-[11px] bg-black/60 border border-cyan-500/30 rounded-lg text-white font-mono placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="flex-1 p-2 overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-cyan-500/20 scrollbar-track-transparent">
              {isLoadingCommunes ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs py-8 font-mono">
                  <Activity className="w-6 h-6 text-cyan-400 animate-spin mb-2" />
                  <span>Loading 1,541 Communes...</span>
                </div>
              ) : filteredCommunes.length === 0 ? (
                <div className="text-center text-slate-500 text-xs py-6 font-mono">
                  No commune matches "{communeSearch}"
                </div>
              ) : (
                filteredCommunes.map((commune) => {
                  const isSelected = selectedCommune?.properties.id === commune.properties.id;
                  return (
                    <div
                      key={commune.properties.id}
                      onClick={() => handleSelectCommune(commune)}
                      className={`p-2 rounded-lg border transition-all cursor-pointer flex items-center justify-between text-xs font-mono ${
                        isSelected
                          ? 'bg-[#0c182c] border-emerald-500/50 text-white shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                          : 'bg-black/50 border-slate-800 text-slate-300 hover:border-cyan-500/30 hover:bg-[#0a1222]'
                      }`}
                    >
                      <div>
                        <div className="font-bold flex items-center gap-1.5">
                          <span className={isSelected ? 'text-emerald-400' : 'text-white'}>
                            {commune.properties.commune_name_fr}
                          </span>
                          <span className="text-cyan-400 text-[10px]">({commune.properties.commune_name})</span>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          Daïra: {commune.properties.daira_name_fr}
                        </div>
                      </div>

                      <div className="text-right text-[10px] text-slate-400">
                        <div>{commune.geometry.coordinates[1].toFixed(2)}°N</div>
                        <div>{commune.geometry.coordinates[0].toFixed(2)}°E</div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};