import React, { useRef, useEffect, useState, useCallback } from 'react';
import { geoOrthographic, geoPath, geoGraticule10, geoInterpolate } from 'd3-geo';
import * as topojson from 'topojson-client';
import { ZoomIn, ZoomOut, RotateCcw, Play, Pause, Globe2, Radio, Layers, Sparkles } from 'lucide-react';
import { GlobalCyberAttack } from '../../types';
import { REAL_COUNTRY_THREATS, CountryThreatNode } from '../../data/threatFeed';

export type GlobeViewMode = 'dots' | 'hybrid' | 'arcs';

interface Globe3DProps {
  attacks: GlobalCyberAttack[];
  selectedAttack?: GlobalCyberAttack | null;
  onSelectAttack?: (attack: GlobalCyberAttack) => void;
  focusCoords?: [number, number] | null; // [lat, lng]
  onSelectCountry?: (country: CountryThreatNode) => void;
}

interface CityBeacon {
  name: string;
  coords: [number, number]; // [lat, lng]
  color: string;
}

const STRATEGIC_CITIES: CityBeacon[] = [
  { name: 'Washington, D.C.', coords: [38.9072, -77.0369], color: '#00f0ff' },
  { name: 'Moscow', coords: [55.7558, 37.6173], color: '#ef4444' },
  { name: 'Shanghai', coords: [31.2304, 121.4737], color: '#f59e0b' },
  { name: 'Frankfurt', coords: [50.1109, 8.6821], color: '#10b981' },
  { name: 'Tokyo', coords: [35.6762, 139.6503], color: '#a855f7' },
  { name: 'Tel Aviv', coords: [32.0853, 34.7818], color: '#38bdf8' },
  { name: 'Tehran', coords: [35.6892, 51.389], color: '#f97316' },
  { name: 'Algiers', coords: [36.7538, 3.0588], color: '#34d399' },
  { name: 'Paris', coords: [48.8566, 2.3522], color: '#c084fc' },
  { name: 'San Francisco', coords: [37.7749, -122.4194], color: '#06b6d4' },
  { name: 'London', coords: [51.5074, -0.1278], color: '#60a5fa' },
  { name: 'Sydney', coords: [-33.8688, 151.2093], color: '#ec4899' },
];

export const Globe3D: React.FC<Globe3DProps> = ({
  attacks,
  selectedAttack,
  onSelectAttack,
  focusCoords,
  onSelectCountry,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Visualization mode: 'dots' (country attack density), 'hybrid', or 'arcs'
  const [viewMode, setViewMode] = useState<GlobeViewMode>('dots');
  const viewModeRef = useRef<GlobeViewMode>('dots');
  viewModeRef.current = viewMode;

  // Projection state: [yaw (lon), pitch (lat), roll]
  const rotationRef = useRef<[number, number, number]>([-15, -20, 0]);
  const targetRotationRef = useRef<[number, number, number] | null>(null);
  const zoomRef = useRef<number>(1);
  const isDraggingRef = useRef<boolean>(false);
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isAutoRotateRef = useRef<boolean>(true);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);

  // TopoJSON land features
  const countriesRef = useRef<any>(null);

  // Photon pulses state
  const pulsesRef = useRef<{ attackIndex: number; progress: number; speed: number }[]>([]);

  // Load world countries TopoJSON
  useEffect(() => {
    fetch('/world_countries_110m.json')
      .then((res) => res.json())
      .then((topology) => {
        if (topology && topology.objects && topology.objects.countries) {
          const geoData = topojson.feature(topology, topology.objects.countries);
          countriesRef.current = geoData;
        }
      })
      .catch((err) => console.warn('Failed to load world TopoJSON:', err));
  }, []);

  // Smooth focus lerp when focusCoords changes
  useEffect(() => {
    if (focusCoords && focusCoords.length === 2) {
      const [lat, lng] = focusCoords;
      targetRotationRef.current = [-lng, -lat, 0];
      isAutoRotateRef.current = false;
      setAutoRotate(false);
    }
  }, [focusCoords]);

  // Handle selected attack focus
  useEffect(() => {
    if (selectedAttack) {
      const [tLat, tLng] = selectedAttack.targetCoords;
      targetRotationRef.current = [-tLng, -tLat, 0];
      isAutoRotateRef.current = false;
      setAutoRotate(false);
    }
  }, [selectedAttack]);

  // Main 60fps render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    // Initialize photon pulses
    if (pulsesRef.current.length === 0 && attacks.length > 0) {
      pulsesRef.current = attacks.map((_, i) => ({
        attackIndex: i,
        progress: i / attacks.length,
        speed: 0.003 + (i % 5) * 0.0015,
      }));
    }

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      if (width === 0 || height === 0) {
        animId = requestAnimationFrame(render);
        return;
      }

      const radius = (Math.min(width, height) / 2.2) * zoomRef.current;

      // Smooth rotation interpolation
      if (targetRotationRef.current) {
        const [curYaw, curPitch, curRoll] = rotationRef.current;
        const [tgtYaw, tgtPitch, tgtRoll] = targetRotationRef.current;

        let diffYaw = (tgtYaw - curYaw) % 360;
        if (diffYaw > 180) diffYaw -= 360;
        if (diffYaw < -180) diffYaw += 360;

        const diffPitch = tgtPitch - curPitch;

        if (Math.abs(diffYaw) < 0.2 && Math.abs(diffPitch) < 0.2) {
          rotationRef.current = [tgtYaw, tgtPitch, tgtRoll];
          targetRotationRef.current = null;
        } else {
          rotationRef.current = [
            curYaw + diffYaw * 0.06,
            curPitch + diffPitch * 0.06,
            curRoll,
          ];
        }
      } else if (isAutoRotateRef.current && !isDraggingRef.current) {
        rotationRef.current[0] += 0.15; // Ambient slow orbit
      }

      // Configure D3 Orthographic Projection
      const projection = geoOrthographic()
        .scale(radius)
        .translate([width / 2, height / 2])
        .rotate(rotationRef.current)
        .clipAngle(90);

      const pathGenerator = geoPath(projection, ctx);

      // 1. Clear background
      ctx.clearRect(0, 0, width, height);

      // Deep Space Star Dust
      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      for (let s = 0; s < 45; s++) {
        const sx = (s * 137.5) % width;
        const sy = (s * 241.3) % height;
        ctx.fillRect(sx, sy, 1, 1);
      }
      ctx.restore();

      // 2. Outer Atmospheric Glow
      const center = [width / 2, height / 2];
      const glowGrad = ctx.createRadialGradient(
        center[0], center[1], radius * 0.88,
        center[0], center[1], radius * 1.25
      );
      glowGrad.addColorStop(0, 'rgba(0, 240, 255, 0.12)');
      glowGrad.addColorStop(0.5, 'rgba(168, 85, 247, 0.06)');
      glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.beginPath();
      ctx.arc(center[0], center[1], radius * 1.25, 0, Math.PI * 2);
      ctx.fillStyle = glowGrad;
      ctx.fill();

      // 3. Globe Sphere Base
      const sphereGrad = ctx.createRadialGradient(
        center[0] - radius * 0.35, center[1] - radius * 0.35, radius * 0.1,
        center[0], center[1], radius
      );
      sphereGrad.addColorStop(0, '#0f172a');
      sphereGrad.addColorStop(0.65, '#070d18');
      sphereGrad.addColorStop(1, '#02050b');

      ctx.beginPath();
      ctx.arc(center[0], center[1], radius, 0, Math.PI * 2);
      ctx.fillStyle = sphereGrad;
      ctx.fill();

      // Sphere border ring
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.35)';
      ctx.stroke();

      // 4. Graticule
      ctx.beginPath();
      ctx.lineWidth = 0.5;
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
      pathGenerator(geoGraticule10());
      ctx.stroke();

      // 5. Landmass Polygons (TopoJSON)
      if (countriesRef.current) {
        ctx.save();
        ctx.beginPath();
        pathGenerator(countriesRef.current);
        ctx.fillStyle = '#111f38';
        ctx.fill();

        ctx.lineWidth = 0.8;
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.35)';
        ctx.stroke();
        ctx.restore();
      }

      // Helper to test if a coordinate is on the visible front hemisphere
      const isCoordVisible = (lat: number, lng: number): boolean => {
        const [yaw, pitch] = rotationRef.current;
        const rad = Math.PI / 180;
        const centerLat = -pitch;
        const centerLng = -yaw;
        const dLat = (lat - centerLat) * rad;
        const dLng = (lng - centerLng) * rad;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(centerLat * rad) * Math.cos(lat * rad) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return c < Math.PI / 2;
      };

      const time = Date.now() * 0.003;
      const currentMode = viewModeRef.current;

      // 6. COUNTRY ATTACK DOT DENSITY & HOTSPOT CLUSTERS (Primary Request!)
      if (currentMode === 'dots' || currentMode === 'hybrid') {
        REAL_COUNTRY_THREATS.forEach((ct) => {
          const [cLat, cLng] = ct.centerCoords;
          if (!isCoordVisible(cLat, cLng)) return;

          const centerProj = projection([cLng, cLat]);
          if (!centerProj) return;

          const [cx, cy] = centerProj;

          // Concentric Threat Pulse Ring (radius scaled by incident volume)
          const baseRadius = 8 + Math.min(24, Math.log10(ct.incidentCount) * 6);
          const pulseR = baseRadius + Math.sin(time * 1.5 + cLat) * 4;

          const beaconColor =
            ct.severity === 'CRITICAL' ? '#ef4444' : ct.severity === 'HIGH' ? '#f59e0b' : '#00f0ff';

          // Outer shockwave wave
          ctx.beginPath();
          ctx.arc(cx, cy, pulseR + 6, 0, Math.PI * 2);
          ctx.strokeStyle = `${beaconColor}33`;
          ctx.lineWidth = 1;
          ctx.stroke();

          // Core country anchor
          ctx.beginPath();
          ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
          ctx.fillStyle = beaconColor;
          ctx.shadowColor = beaconColor;
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.shadowBlur = 0;

          // Country Label + Ingress Count Badge
          ctx.font = 'bold 10px "JetBrains Mono", monospace';
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
          ctx.shadowBlur = 4;
          ctx.fillText(`${ct.flag} ${ct.country}`, cx + 8, cy - 4);
          ctx.font = '9px "JetBrains Mono", monospace';
          ctx.fillStyle = beaconColor;
          ctx.fillText(`⚡ ${ct.incidentCount.toLocaleString()} Ingress`, cx + 8, cy + 8);
          ctx.shadowBlur = 0;

          // RENDER INDIVIDUAL INCIDENT DOTS INSIDE THE COUNTRY
          ct.dots.forEach((dot, dIdx) => {
            if (!isCoordVisible(dot.lat, dot.lng)) return;
            const dotProj = projection([dot.lng, dot.lat]);
            if (!dotProj) return;

            const [dx, dy] = dotProj;
            const dotPulse = Math.sin(time * 2 + dIdx * 1.2) * 0.4 + 0.6; // 0.2 to 1.0

            // Glowing threat dot
            ctx.beginPath();
            ctx.arc(dx, dy, 2 + dot.intensity * 1.5, 0, Math.PI * 2);
            ctx.fillStyle = `${beaconColor}${Math.floor(dotPulse * 255).toString(16).padStart(2, '0')}`;
            ctx.fill();

            // Tiny dot halo
            ctx.beginPath();
            ctx.arc(dx, dy, 4 + dot.intensity * 2, 0, Math.PI * 2);
            ctx.strokeStyle = `${beaconColor}40`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          });
        });
      }

      // 7. BALLISTIC ARCS & PHOTON PULSES (Rendered when in 'arcs' or 'hybrid' mode)
      if (currentMode === 'arcs' || currentMode === 'hybrid') {
        attacks.forEach((atk, idx) => {
          const [sLat, sLng] = atk.sourceCoords;
          const [tLat, tLng] = atk.targetCoords;

          const isSourceVis = isCoordVisible(sLat, sLng);
          const isTargetVis = isCoordVisible(tLat, tLng);

          if (!isSourceVis && !isTargetVis) return;

          const interpolator = geoInterpolate([sLng, sLat], [tLng, tLat]);
          const pointsCount = 36;
          const arcPoints: [number, number][] = [];

          for (let p = 0; p <= pointsCount; p++) {
            const t = p / pointsCount;
            const [lon, lat] = interpolator(t);
            const proj = projection([lon, lat]);
            if (proj) {
              const elevation = Math.sin(t * Math.PI) * (radius * 0.14);
              const dx = proj[0] - center[0];
              const dy = proj[1] - center[1];
              const dist = Math.sqrt(dx * dx + dy * dy) || 1;
              const ex = proj[0] + (dx / dist) * elevation;
              const ey = proj[1] + (dy / dist) * elevation;
              arcPoints.push([ex, ey]);
            }
          }

          if (arcPoints.length < 2) return;

          const arcColors = ['#00f0ff', '#a855f7', '#ef4444', '#f59e0b', '#10b981'];
          const baseColor = atk.severity === 'CRITICAL' ? '#ef4444' : arcColors[idx % arcColors.length];

          // Trajectory curve
          ctx.beginPath();
          ctx.moveTo(arcPoints[0][0], arcPoints[0][1]);
          for (let i = 1; i < arcPoints.length; i++) {
            ctx.lineTo(arcPoints[i][0], arcPoints[i][1]);
          }
          ctx.strokeStyle = `${baseColor}44`;
          ctx.lineWidth = atk === selectedAttack ? 2.5 : 1.2;
          ctx.stroke();

          // Photon Head
          let pulse = pulsesRef.current.find((p) => p.attackIndex === idx);
          if (!pulse) {
            pulse = { attackIndex: idx, progress: (idx * 0.2) % 1, speed: 0.004 };
            pulsesRef.current.push(pulse);
          }

          pulse.progress += pulse.speed;
          if (pulse.progress > 1) pulse.progress = 0;

          const t = pulse.progress;
          const pointIdx = Math.min(arcPoints.length - 1, Math.floor(t * (arcPoints.length - 1)));
          const curPt = arcPoints[pointIdx];

          if (curPt) {
            ctx.beginPath();
            ctx.arc(curPt[0], curPt[1], 3.5, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = baseColor;
            ctx.shadowBlur = 10;
            ctx.fill();
            ctx.shadowBlur = 0;
          }

          // Destination Impact Ring
          if (isTargetVis && t > 0.85) {
            const tProj = projection([tLng, tLat]);
            if (tProj) {
              const rippleR = ((t - 0.85) / 0.15) * 22;
              const rippleAlpha = 1 - (t - 0.85) / 0.15;
              ctx.beginPath();
              ctx.arc(tProj[0], tProj[1], rippleR, 0, Math.PI * 2);
              ctx.strokeStyle = `${baseColor}${Math.floor(rippleAlpha * 255).toString(16).padStart(2, '0')}`;
              ctx.lineWidth = 1.5;
              ctx.stroke();
            }
          }
        });
      }

      // 8. Strategic Cities
      STRATEGIC_CITIES.forEach((city) => {
        const [lat, lng] = city.coords;
        if (!isCoordVisible(lat, lng)) return;
        const proj = projection([lng, lat]);
        if (!proj) return;

        const [cx, cy] = proj;
        ctx.beginPath();
        ctx.arc(cx, cy, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = city.color;
        ctx.fill();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [attacks, selectedAttack]);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Mouse / Drag Rotation Controls
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    targetRotationRef.current = null;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastMousePosRef.current.x;
    const dy = e.clientY - lastMousePosRef.current.y;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };

    const sensitivity = 0.35 / zoomRef.current;
    rotationRef.current[0] += dx * sensitivity;
    rotationRef.current[1] = Math.max(-85, Math.min(85, rotationRef.current[1] - dy * sensitivity));
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomDelta = e.deltaY < 0 ? 0.08 : -0.08;
    zoomRef.current = Math.max(0.65, Math.min(3.2, zoomRef.current + zoomDelta));
  };

  const handleReset = () => {
    targetRotationRef.current = [-15, -20, 0];
    zoomRef.current = 1;
  };

  const toggleAutoRotate = () => {
    isAutoRotateRef.current = !isAutoRotateRef.current;
    setAutoRotate(isAutoRotateRef.current);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full rounded-2xl overflow-hidden bg-[#040812] flex items-center justify-center cursor-grab active:cursor-grabbing border border-cyan-500/20 shadow-inner"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* Floating Tactical Overlay HUD */}
      <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none font-mono">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#080d18]/85 border border-cyan-500/30 text-[11px] text-cyan-300 backdrop-blur-md">
          <Globe2 className="w-3.5 h-3.5 text-cyan-400 animate-spin-slow" />
          <span className="font-bold">COUNTRY ATTACK DOT DENSITY MATRIX</span>
        </div>
        <div className="text-[9px] text-slate-400 px-1">
          Density Mode: {viewMode.toUpperCase()} // TopoJSON Real World Borders
        </div>
      </div>

      {/* Visualization Mode Switcher Pill */}
      <div className="absolute top-3 right-3 flex items-center gap-1 p-1 rounded-xl bg-[#080d18]/90 border border-cyan-500/30 shadow-xl backdrop-blur-md text-xs font-mono">
        <button
          onClick={() => setViewMode('dots')}
          className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
            viewMode === 'dots'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-[0_0_8px_rgba(0,240,255,0.4)]'
              : 'text-slate-400 hover:text-white'
          }`}
          title="Country Threat Dots Density"
        >
          <Radio className="w-3 h-3 text-cyan-400" />
          <span>Country Dots</span>
        </button>

        <button
          onClick={() => setViewMode('hybrid')}
          className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
            viewMode === 'hybrid'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-400/50 shadow-[0_0_8px_rgba(168,85,247,0.4)]'
              : 'text-slate-400 hover:text-white'
          }`}
          title="Hybrid: Dots & Ballistic Arcs"
        >
          <Layers className="w-3 h-3 text-purple-400" />
          <span>Hybrid</span>
        </button>

        <button
          onClick={() => setViewMode('arcs')}
          className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
            viewMode === 'arcs'
              ? 'bg-blue-500/20 text-blue-300 border border-blue-400/50 shadow-[0_0_8px_rgba(59,130,246,0.4)]'
              : 'text-slate-400 hover:text-white'
          }`}
          title="DeepAstro Ballistic Arcs Only"
        >
          <Sparkles className="w-3 h-3 text-blue-400" />
          <span>Arcs</span>
        </button>
      </div>

      {/* Interactive Navigation Controls Pill */}
      <div className="absolute bottom-3 right-3 flex items-center gap-1.5 p-1 rounded-xl bg-[#080d18]/90 border border-cyan-500/30 shadow-xl backdrop-blur-md">
        <button
          onClick={() => {
            zoomRef.current = Math.min(3.2, zoomRef.current + 0.2);
          }}
          title="Zoom In"
          className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-800/80 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => {
            zoomRef.current = Math.max(0.65, zoomRef.current - 0.2);
          }}
          title="Zoom Out"
          className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-800/80 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleReset}
          title="Reset Vantage"
          className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-800/80 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={toggleAutoRotate}
          title={autoRotate ? 'Pause Orbit' : 'Resume Orbit'}
          className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-800/80 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer"
        >
          {autoRotate ? <Pause className="w-3.5 h-3.5 text-cyan-400" /> : <Play className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
};
