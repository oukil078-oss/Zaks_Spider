import React, { useState } from 'react';
import { 
  Satellite, 
  Radio, 
  ShieldAlert, 
  Activity, 
  Wifi, 
  Compass, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  ChevronUp, 
  ChevronDown, 
  AlertTriangle, 
  RefreshCw, 
  Sliders, 
  Crosshair,
  Server,
  Zap,
  Eye,
  Layers,
  Database
} from 'lucide-react';
import { LivingGlobe3D } from '../canvas/LivingGlobe3D';
import type { GroundTower, SatelliteTelemetry } from '../../types';

export const AerospaceDefenseView: React.FC = () => {
  // Active pill filter
  const [activePill, setActivePill] = useState<'overview' | 'firewall' | 'alerts' | 'attacks'>('overview');
  const [filterSatellites, setFilterSatellites] = useState<boolean>(true);
  const [filterTowers, setFilterTowers] = useState<boolean>(true);
  const [searchTower, setSearchTower] = useState<string>('');
  
  // Starlink interactive control state
  const [currentSpeed, setCurrentSpeed] = useState<number>(12);
  const [targetSpeed, setTargetSpeed] = useState<number>(22);
  const [collisionAlertEta, setCollisionAlertEta] = useState<string>('2h 30m 13s');

  // Towers Data Grid
  const towersData: GroundTower[] = [
    { id: 'TWR-001', name: 'Portland Alpha', location: 'Portland, OR', status: 'Active', loadPercent: 95, devicesCount: 1258, coordinates: [45.5152, -122.6784] },
    { id: 'RD-35', name: 'Seattle Radar', location: 'Seattle, WA', status: 'Offline', loadPercent: 83, devicesCount: 1738, coordinates: [47.6062, -122.3321] },
    { id: 'HFK-456', name: 'Bay Sensor', location: 'San Francisco, CA', status: 'Active', loadPercent: 78, devicesCount: 1884, coordinates: [37.7749, -122.4194] },
    { id: 'AL-ALG-16', name: 'Wilaya 16 Defense Grid', location: 'Algiers, Algeria', status: 'Active', loadPercent: 98, devicesCount: 4120, coordinates: [36.7538, 3.0588] },
    { id: 'AL-ORN-31', name: 'Wilaya 31 Telemetry', location: 'Oran, Algeria', status: 'Active', loadPercent: 91, devicesCount: 2890, coordinates: [35.6987, -0.6331] },
    { id: 'AL-CST-25', name: 'Wilaya 25 Relay Hub', location: 'Constantine, Algeria', status: 'Active', loadPercent: 89, devicesCount: 1940, coordinates: [36.3650, 6.6147] },
  ];

  const filteredTowers = towersData.filter(t => 
    t.id.toLowerCase().includes(searchTower.toLowerCase()) || 
    t.location.toLowerCase().includes(searchTower.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-4 w-full h-full text-white font-mono">
      {/* Top Banner & Sub-Navigation Pills (Matching Uploaded Image) */}
      <div className="flex items-center justify-between bg-[#0a101a]/90 backdrop-blur-md border border-white/10 px-4 py-2.5 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-xs font-bold tracking-widest text-zinc-300 uppercase">AEROSPACE & PERIMETER DEFENSE</span>
        </div>

        {/* Center Pill Navigation */}
        <div className="flex items-center gap-1 bg-[#06090e] p-1 rounded-lg border border-white/10">
          {(['overview', 'firewall', 'alerts', 'attacks'] as const).map((pill) => (
            <button
              key={pill}
              onClick={() => setActivePill(pill)}
              className={`px-3 py-1 rounded text-xs font-semibold uppercase transition-all flex items-center gap-1.5 ${
                activePill === pill
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {activePill === pill && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
              <span>{pill}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 text-xs text-zinc-400">
          <span className="text-emerald-400 font-bold">DEFCON 1</span>
          <div className="h-4 w-px bg-white/10" />
          <span>UTC 23:45:12</span>
        </div>
      </div>

      {/* Main Command Stage: Side Toolbar + Center 3D Globe */}
      <div className="relative flex gap-3 h-[520px]">
        {/* Left Floating Action Toolbar (Matching Uploaded Image) */}
        <div className="w-14 flex flex-col items-center justify-between py-4 bg-[#0a101a]/90 backdrop-blur-md border border-white/10 rounded-xl z-20">
          {/* SIMULATE Section */}
          <div className="flex flex-col items-center gap-3">
            <span className="text-[8px] tracking-widest text-zinc-500 uppercase">SIM</span>
            <button 
              title="Simulate Spacecraft"
              className="p-2 rounded-lg bg-zinc-800/80 hover:bg-cyan-500/20 text-zinc-300 hover:text-cyan-400 border border-white/5 transition-all"
            >
              <Satellite className="w-4 h-4" />
            </button>
            <button 
              title="Simulate Space Debris"
              className="p-2 rounded-lg bg-zinc-800/80 hover:bg-amber-500/20 text-zinc-300 hover:text-amber-400 border border-white/5 transition-all"
            >
              <Zap className="w-4 h-4" />
            </button>
          </div>

          <div className="w-6 h-px bg-white/10" />

          {/* FILTERS Section */}
          <div className="flex flex-col items-center gap-3">
            <span className="text-[8px] tracking-widest text-zinc-500 uppercase">FLTR</span>
            <button 
              onClick={() => setFilterSatellites(prev => !prev)}
              title="Filter Satellites"
              className={`p-2 rounded-lg border transition-all ${
                filterSatellites ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' : 'text-zinc-500 border-transparent hover:text-white'
              }`}
            >
              <Satellite className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setFilterTowers(prev => !prev)}
              title="Filter Ground Towers"
              className={`p-2 rounded-lg border transition-all ${
                filterTowers ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40' : 'text-zinc-500 border-transparent hover:text-white'
              }`}
            >
              <Radio className="w-4 h-4" />
            </button>
            <button 
              title="Layers / Boundaries"
              className="p-2 rounded-lg text-zinc-400 hover:text-white transition-all"
            >
              <Layers className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Center 3D Living Globe (Aerospace Orbit + Satellite Tracks) */}
        <div className="flex-1 relative h-full rounded-xl overflow-hidden">
          <LivingGlobe3D
            mode="aerospace"
            showSatellites={filterSatellites}
            showWilayas={filterTowers}
            className="w-full h-full"
          />
        </div>
      </div>

      {/* Bottom 3 Telemetry Cards (Matching Uploaded Image) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Card 1: SpaceX Starlink Telemetry & Directional Controller (3 Cols) */}
        <div className="lg:col-span-3 bg-[#0a101a]/90 backdrop-blur-md border border-white/10 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <div className="flex items-center gap-2">
              <Satellite className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-white uppercase">SpaceX Starlink</span>
            </div>
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
          </div>

          {/* Satellite Graphic + Speed Gauges */}
          <div className="flex items-center justify-between my-3">
            {/* 3D Wireframe Satellite Representation */}
            <div className="relative w-24 h-28 flex items-center justify-center">
              <div className="w-16 h-20 border-2 border-cyan-400/40 rounded-sm transform -rotate-12 bg-gradient-to-tr from-cyan-950/40 to-blue-900/20 flex flex-col justify-between p-1">
                <div className="w-full h-1 bg-cyan-400/60" />
                <div className="w-full h-1 bg-cyan-400/60" />
                <div className="w-full h-1 bg-cyan-400/60" />
                <div className="w-full h-1 bg-cyan-400/60" />
              </div>
              <div className="absolute w-4 h-6 bg-zinc-300 border border-zinc-500 rounded-sm" />
            </div>

            {/* Speeds & D-Pad */}
            <div className="flex flex-col gap-2 items-end">
              <div className="text-right">
                <span className="text-xl font-bold text-white">{currentSpeed}</span>
                <span className="text-[10px] text-zinc-400 ml-1">km/h</span>
                <div className="text-[9px] text-zinc-500">Current Speed</div>
              </div>

              <div className="text-right">
                <span className="text-xl font-bold text-amber-400">{targetSpeed}</span>
                <span className="text-[10px] text-zinc-400 ml-1">km/h</span>
                <div className="text-[9px] text-zinc-500">Target Speed</div>
              </div>

              {/* D-Pad Directional Controller */}
              <div className="relative w-16 h-16 bg-[#06090e] border border-white/15 rounded-full flex items-center justify-center mt-1">
                <button 
                  onClick={() => setTargetSpeed(prev => prev + 1)}
                  className="absolute top-1 text-zinc-400 hover:text-cyan-400"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={() => setTargetSpeed(prev => Math.max(0, prev - 1))}
                  className="absolute bottom-1 text-zinc-400 hover:text-cyan-400"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={() => setCurrentSpeed(prev => Math.max(0, prev - 1))}
                  className="absolute left-1 text-zinc-400 hover:text-cyan-400"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={() => setCurrentSpeed(prev => prev + 1)}
                  className="absolute right-1 text-zinc-400 hover:text-cyan-400"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <div className="w-3 h-3 rounded-full bg-cyan-400/80" />
              </div>
            </div>
          </div>

          {/* Targets & Collision Alert Status */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 text-xs">
            <div className="bg-[#06090e]/80 p-2 rounded border border-white/5">
              <div className="text-[9px] text-zinc-500">Targets detected</div>
              <div className="text-sm font-bold text-white mt-0.5">2 Satellites</div>
            </div>
            <div className="bg-[#06090e]/80 p-2 rounded border border-amber-500/30">
              <div className="text-[9px] text-amber-400 flex items-center gap-1">
                <AlertTriangle className="w-2.5 h-2.5" />
                <span>Alert Collision</span>
              </div>
              <div className="text-xs font-bold text-amber-300 mt-0.5">{collisionAlertEta}</div>
            </div>
          </div>
        </div>

        {/* Card 2: Ground Towers & Radar Sensor Array Data Grid (5 Cols) */}
        <div className="lg:col-span-5 bg-[#0a101a]/90 backdrop-blur-md border border-white/10 rounded-xl p-4 flex flex-col justify-between">
          <div>
            {/* Header with Search and Active Status */}
            <div className="flex items-center justify-between border-b border-white/5 pb-2.5 mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white uppercase">Towers</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                  Active towers: {towersData.filter(t => t.status === 'Active').length}
                </span>
              </div>

              <div className="relative w-40">
                <Search className="w-3 h-3 text-zinc-500 absolute left-2 top-2 pointer-events-none" />
                <input
                  type="text"
                  value={searchTower}
                  onChange={(e) => setSearchTower(e.target.value)}
                  placeholder="Search..."
                  className="w-full bg-[#06090e] border border-white/10 rounded pl-7 pr-2 py-1 text-[10px] text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            {/* Data Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-[10px] text-zinc-500 border-b border-white/5">
                    <th className="pb-1.5 font-normal">ID</th>
                    <th className="pb-1.5 font-normal">Location</th>
                    <th className="pb-1.5 font-normal">Status</th>
                    <th className="pb-1.5 font-normal">Load</th>
                    <th className="pb-1.5 font-normal text-right">Devices</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredTowers.slice(0, 4).map((tower) => (
                    <tr key={tower.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-2 text-zinc-300 font-bold">{tower.id}</td>
                      <td className="py-2 text-zinc-400">{tower.location}</td>
                      <td className="py-2">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold ${
                          tower.status === 'Active' ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            tower.status === 'Active' ? 'bg-emerald-400' : 'bg-red-400'
                          }`} />
                          {tower.status}
                        </span>
                      </td>
                      <td className="py-2 w-28">
                        <div className="flex items-center gap-1.5">
                          <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                tower.loadPercent > 90 ? 'bg-amber-400' : 'bg-cyan-400'
                              }`} 
                              style={{ width: `${tower.loadPercent}%` }} 
                            />
                          </div>
                          <span className="text-[10px] text-zinc-400">{tower.loadPercent}%</span>
                        </div>
                      </td>
                      <td className="py-2 text-right text-zinc-200 font-bold">{tower.devicesCount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer Pagination */}
          <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[10px] text-zinc-500">
            <span>1-4 of {filteredTowers.length} items</span>
            <div className="flex items-center gap-2">
              <span>Page 01 of 02</span>
              <div className="flex items-center gap-1">
                <button className="p-1 rounded bg-[#06090e] border border-white/5 text-zinc-400 hover:text-white">
                  <ChevronLeft className="w-3 h-3" />
                </button>
                <button className="p-1 rounded bg-[#06090e] border border-white/5 text-zinc-400 hover:text-white">
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Chance of Failure Threat Seismic Waveform (4 Cols) */}
        <div className="lg:col-span-4 bg-[#0a101a]/90 backdrop-blur-md border border-white/10 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <span className="text-xs font-bold text-white uppercase">Chance of failure</span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-400">ST-389 (Critical)</span>
            </div>
          </div>

          {/* Glowing Plasma Energy Waveform Ribbon */}
          <div className="relative h-28 my-2 flex items-center justify-center overflow-hidden rounded bg-[#06090e]/60 border border-white/5">
            {/* Background Grid Lines */}
            <div className="absolute inset-0 grid grid-cols-6 grid-rows-3 opacity-10">
              {Array.from({ length: 18 }).map((_, i) => (
                <div key={i} className="border border-white/20" />
              ))}
            </div>

            {/* SVG Glowing Plasma Energy Waveform */}
            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 400 100">
              <defs>
                <linearGradient id="plasmaGlow" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#f97316" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#fbbf24" stopOpacity="1" />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0.8" />
                </linearGradient>
                <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Oscillating background wave */}
              <path
                d="M 0 50 Q 50 20, 100 50 T 200 50 T 300 50 T 400 50"
                fill="none"
                stroke="rgba(251, 146, 60, 0.25)"
                strokeWidth="4"
              />

              {/* Main Hot Energy Filament */}
              <path
                d="M 0 50 C 60 25, 80 80, 140 45 C 190 15, 230 85, 280 40 C 330 20, 360 70, 400 50"
                fill="none"
                stroke="url(#plasmaGlow)"
                strokeWidth="3"
                filter="url(#glowFilter)"
              />

              {/* High Frequency Spike Core */}
              <path
                d="M 0 50 Q 30 40, 60 55 T 120 40 T 180 60 T 240 35 T 300 65 T 360 45 T 400 50"
                fill="none"
                stroke="#fff"
                strokeWidth="1.2"
              />

              {/* Diamond Nodes along timeline */}
              {[70, 160, 260, 350].map((cx, idx) => (
                <g key={idx} transform={`translate(${cx}, 50)`}>
                  <rect x="-4" y="-4" width="8" height="8" transform="rotate(45)" fill="#fbbf24" stroke="#fff" strokeWidth="1" />
                </g>
              ))}
            </svg>
          </div>

          {/* Timeline Cities & Downlink Waypoints */}
          <div className="grid grid-cols-4 gap-1 text-[9px] pt-1 border-t border-white/5">
            <div>
              <div className="text-white font-bold">Los Angeles</div>
              <div className="text-zinc-500">21-11-02T 13:45</div>
            </div>
            <div>
              <div className="text-white font-bold">Chicago</div>
              <div className="text-zinc-500">21-11-02T 14:10</div>
            </div>
            <div>
              <div className="text-white font-bold">St. Louis</div>
              <div className="text-zinc-500">21-11-02T 14:45</div>
            </div>
            <div className="text-right">
              <div className="text-amber-400 font-bold">New York</div>
              <div className="text-zinc-500">21-11-02T 15:20</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
