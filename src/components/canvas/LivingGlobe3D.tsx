import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { 
  Globe, 
  Crosshair, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Layers, 
  Radio, 
  ShieldAlert, 
  Search, 
  MapPin, 
  Compass, 
  Satellite,
  Maximize2,
  Info
} from 'lucide-react';
import { geoOrthographic, geoPath, geoGraticule10 } from 'd3-geo';
import * as topojson from 'topojson-client';
import type { GlobalCyberAttack } from '../../types';

interface LivingGlobe3DProps {
  mode?: 'aerospace' | 'tactical' | 'attack-map';
  activeAttacks?: GlobalCyberAttack[];
  selectedCoords?: [number, number]; // [lat, lng]
  onSelectDistrict?: (district: any) => void;
  className?: string;
  showSatellites?: boolean;
  showWilayas?: boolean;
}

interface CommuneFeature {
  id: string;
  commune_name: string;
  commune_name_fr: string;
  daira_name_fr: string;
  wilaya_code: number;
  wilaya_name: string;
  wilaya_name_fr: string;
  coordinates: [number, number]; // [lng, lat]
}

export const LivingGlobe3D: React.FC<LivingGlobe3DProps> = ({
  mode = 'aerospace',
  activeAttacks = [],
  selectedCoords,
  onSelectDistrict,
  className = '',
  showSatellites = true,
  showWilayas = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Projection & View state
  const [rotation, setRotation] = useState<[number, number, number]>([-3, -36, 0]); // Centered on Algeria/Mediterranean
  const [zoom, setZoom] = useState<number>(1);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  
  // GIS Datasets
  const [worldData, setWorldData] = useState<any | null>(null);
  const [algeriaCommunes, setAlgeriaCommunes] = useState<CommuneFeature[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCommune, setSelectedCommune] = useState<CommuneFeature | null>(null);
  const [searchResults, setSearchResults] = useState<CommuneFeature[]>([]);
  const [viewMode, setViewMode] = useState<'aerospace' | 'tactical'>(mode === 'tactical' ? 'tactical' : 'aerospace');

  // Animation frame ref
  const animFrameRef = useRef<number | null>(null);
  const arcProgressRef = useRef<number>(0);

  // Load World TopoJSON and Algeria Cities GeoJSON
  useEffect(() => {
    // 1. Fetch world countries
    fetch('/world_countries_110m.json')
      .then(res => res.json())
      .then(topo => {
        if (topo && topo.objects && topo.objects.countries) {
          const countriesGeo = topojson.feature(topo, topo.objects.countries);
          setWorldData(countriesGeo);
        }
      })
      .catch(err => console.warn('World TopoJSON fallback:', err));

    // 2. Fetch Algeria Communes/Wilayas
    fetch('/algeria_cities.json')
      .then(res => res.json())
      .then(data => {
        if (data && data.features) {
          const parsed: CommuneFeature[] = data.features.map((f: any) => ({
            id: f.properties.id || String(f.properties.code_commune),
            commune_name: f.properties.commune_name,
            commune_name_fr: f.properties.commune_name_fr,
            daira_name_fr: f.properties.daira_name_fr,
            wilaya_code: f.properties.wilaya_code,
            wilaya_name: f.properties.wilaya_name,
            wilaya_name_fr: f.properties.wilaya_name_fr,
            coordinates: f.geometry.coordinates, // [lng, lat]
          }));
          setAlgeriaCommunes(parsed);
        }
      })
      .catch(err => console.warn('Algeria GeoJSON fallback:', err));
  }, []);

  // Filter Search Results
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const q = searchQuery.toLowerCase();
    const matches = algeriaCommunes
      .filter(c => 
        c.commune_name_fr.toLowerCase().includes(q) || 
        c.wilaya_name_fr.toLowerCase().includes(q) ||
        String(c.wilaya_code) === q
      )
      .slice(0, 8);
    setSearchResults(matches);
  }, [searchQuery, algeriaCommunes]);

  // When selectedCoords is passed from parent, rotate to it
  useEffect(() => {
    if (selectedCoords) {
      const [lat, lng] = selectedCoords;
      setRotation([-lng, -lat, 0]);
      setZoom(prev => Math.max(prev, 1.8));
      setAutoRotate(false);
    }
  }, [selectedCoords]);

  // Handle targeting a specific commune/wilaya
  const handleSelectCommune = useCallback((commune: CommuneFeature) => {
    setSelectedCommune(commune);
    setSearchQuery('');
    setSearchResults([]);
    setAutoRotate(false);
    // Animate rotation to target [ -lng, -lat, 0 ]
    setRotation([-commune.coordinates[0], -commune.coordinates[1], 0]);
    setZoom(3.5); // Deep zoom into the district
    if (onSelectDistrict) {
      onSelectDistrict(commune);
    }
  }, [onSelectDistrict]);

  // Interactive Mouse handlers for 3D Drag & Zoom
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setAutoRotate(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    setDragStart({ x: e.clientX, y: e.clientY });

    setRotation(prev => {
      const sensitivity = 0.4 / zoom;
      const newYaw = prev[0] + dx * sensitivity;
      const newPitch = Math.max(-85, Math.min(85, prev[1] - dy * sensitivity));
      return [newYaw, newPitch, prev[2]];
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomDelta = e.deltaY * -0.0015;
    setZoom(prev => Math.max(0.7, Math.min(8.0, prev + zoomDelta)));
  };

  // Render Loop on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let localRotation = [...rotation] as [number, number, number];

    const render = () => {
      // Auto-rotation if enabled
      if (autoRotate && !isDragging) {
        localRotation[0] -= 0.15 / zoom;
      } else {
        localRotation = [...rotation] as [number, number, number];
      }

      const width = canvas.width;
      const height = canvas.height;
      const radius = (Math.min(width, height) / 2.3) * zoom;
      const center: [number, number] = [width / 2, height / 2];

      ctx.clearRect(0, 0, width, height);

      // 1. Outer Deep Space Ambient Glow & Stars
      const bgGrad = ctx.createRadialGradient(center[0], center[1], radius * 0.8, center[0], center[1], radius * 1.8);
      bgGrad.addColorStop(0, 'rgba(10, 16, 26, 0.4)');
      bgGrad.addColorStop(0.5, 'rgba(251, 146, 60, 0.04)');
      bgGrad.addColorStop(1, 'rgba(6, 9, 14, 0)');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Setup D3 Orthographic Projection
      const projection = geoOrthographic()
        .scale(radius)
        .translate(center)
        .rotate(localRotation)
        .clipAngle(90);

      const path = geoPath(projection, ctx);

      // 3. Globe Sphere Base (Dark Obsidian Ocean)
      ctx.beginPath();
      ctx.arc(center[0], center[1], radius, 0, 2 * Math.PI);
      const oceanGrad = ctx.createRadialGradient(
        center[0] - radius * 0.3,
        center[1] - radius * 0.3,
        radius * 0.1,
        center[0],
        center[1],
        radius
      );
      oceanGrad.addColorStop(0, '#0c1524');
      oceanGrad.addColorStop(0.7, '#070b12');
      oceanGrad.addColorStop(1, '#030508');
      ctx.fillStyle = oceanGrad;
      ctx.fill();

      // 4. Globe Atmospheric Rim Glow (Aerospace Amber & Cyan Halo)
      ctx.beginPath();
      ctx.arc(center[0], center[1], radius, 0, 2 * Math.PI);
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = 'rgba(251, 146, 60, 0.35)'; // Amber atmosphere
      ctx.stroke();

      // Outer Corona
      ctx.beginPath();
      ctx.arc(center[0], center[1], radius * 1.025, 0, 2 * Math.PI);
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.2)';
      ctx.stroke();

      // 5. Graticule Lines (Coordinate Grid)
      ctx.beginPath();
      path(geoGraticule10());
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.06)';
      ctx.lineWidth = 0.5;
      ctx.stroke();

      // 6. Draw Real Country Boundaries (from TopoJSON)
      if (worldData) {
        ctx.beginPath();
        path(worldData);
        ctx.fillStyle = 'rgba(20, 32, 48, 0.85)'; // Continent landmass
        ctx.fill();
        ctx.strokeStyle = 'rgba(251, 146, 60, 0.45)'; // Amber/Gold borders like uploaded image
        ctx.lineWidth = Math.max(0.6, 0.8 / zoom);
        ctx.stroke();

        // City cluster glow / night lights on continents
        if (viewMode === 'aerospace') {
          // Major global telemetry hubs (City Lights)
          const cityHubs: [number, number][] = [
            [3.0588, 36.7538], // Algiers
            [-0.6331, 35.6987], // Oran
            [6.6147, 36.365], // Constantine
            [-74.006, 40.7128], // New York
            [-0.1278, 51.5074], // London
            [139.6917, 35.6895], // Tokyo
            [2.3522, 48.8566], // Paris
            [55.2708, 25.2048], // Dubai
            [37.6173, 55.7558], // Moscow
            [-122.4194, 37.7749], // San Francisco
            [126.9780, 37.5665], // Seoul
            [103.8198, 1.3521], // Singapore
            [151.2093, -33.8688], // Sydney
            [31.2357, 30.0444], // Cairo
          ];

          cityHubs.forEach(([lng, lat]) => {
            const pt = projection([lng, lat]);
            if (pt) {
              const [px, py] = pt;
              // Check if visible on current hemisphere
              const distFromCenter = Math.hypot(px - center[0], py - center[1]);
              if (distFromCenter <= radius) {
                const glow = ctx.createRadialGradient(px, py, 1, px, py, 10);
                glow.addColorStop(0, 'rgba(255, 180, 50, 0.9)');
                glow.addColorStop(0.5, 'rgba(251, 146, 60, 0.4)');
                glow.addColorStop(1, 'rgba(251, 146, 60, 0)');
                ctx.fillStyle = glow;
                ctx.beginPath();
                ctx.arc(px, py, 10, 0, 2 * Math.PI);
                ctx.fill();

                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.arc(px, py, 1.2, 0, 2 * Math.PI);
                ctx.fill();
              }
            }
          });
        }
      }

      // 7. Tactical Algerian Wilayas & Communes (When Zoomed or Wilayas Enabled)
      if (showWilayas && zoom >= 1.2 && algeriaCommunes.length > 0) {
        // Sample communes based on zoom to maintain 60 FPS
        const step = zoom > 3.0 ? 1 : zoom > 2.0 ? 4 : 12;
        for (let i = 0; i < algeriaCommunes.length; i += step) {
          const c = algeriaCommunes[i];
          const pt = projection(c.coordinates);
          if (pt) {
            const [px, py] = pt;
            const dist = Math.hypot(px - center[0], py - center[1]);
            if (dist <= radius) {
              // District point
              ctx.beginPath();
              ctx.arc(px, py, zoom > 3.0 ? 2.5 : 1.5, 0, 2 * Math.PI);
              ctx.fillStyle = c.wilaya_code === 16 ? '#00f0ff' : 'rgba(251, 146, 60, 0.75)';
              ctx.fill();

              // If deeply zoomed, render commune labels
              if (zoom >= 3.5) {
                ctx.font = '9px JetBrains Mono, monospace';
                ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
                ctx.fillText(c.commune_name_fr, px + 4, py + 2);
              }
            }
          }
        }
      }

      // 8. High-Tech Targeting Reticle for Selected Commune/IP
      if (selectedCommune) {
        const targetPt = projection(selectedCommune.coordinates);
        if (targetPt) {
          const [tx, ty] = targetPt;
          const dist = Math.hypot(tx - center[0], ty - center[1]);
          if (dist <= radius) {
            // Pulsing target HUD rings
            const pulse = (Math.sin(Date.now() / 250) + 1) * 4;
            ctx.strokeStyle = '#00f0ff';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(tx, ty, 14 + pulse, 0, 2 * Math.PI);
            ctx.stroke();

            // Crosshair ticks
            ctx.strokeStyle = 'rgba(0, 240, 255, 0.9)';
            ctx.beginPath();
            ctx.moveTo(tx - 24, ty); ctx.lineTo(tx - 16, ty);
            ctx.moveTo(tx + 16, ty); ctx.lineTo(tx + 24, ty);
            ctx.moveTo(tx, ty - 24); ctx.lineTo(tx, ty - 16);
            ctx.moveTo(tx, ty + 16); ctx.lineTo(tx, ty + 24);
            ctx.stroke();

            // HUD Callout Box
            ctx.fillStyle = 'rgba(6, 9, 14, 0.92)';
            ctx.strokeStyle = '#00f0ff';
            ctx.lineWidth = 1;
            const boxX = tx + 20;
            const boxY = ty - 40;
            ctx.fillRect(boxX, boxY, 150, 48);
            ctx.strokeRect(boxX, boxY, 150, 48);

            ctx.fillStyle = '#00f0ff';
            ctx.font = 'bold 10px JetBrains Mono, monospace';
            ctx.fillText(`WILAYA ${selectedCommune.wilaya_code}: ${selectedCommune.wilaya_name_fr}`, boxX + 8, boxY + 16);
            ctx.fillStyle = '#fff';
            ctx.font = '9px JetBrains Mono, monospace';
            ctx.fillText(`${selectedCommune.commune_name_fr} (${selectedCommune.commune_name})`, boxX + 8, boxY + 30);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.fillText(`${selectedCommune.coordinates[1].toFixed(3)}°N, ${selectedCommune.coordinates[0].toFixed(3)}°E`, boxX + 8, boxY + 42);
          }
        }
      }

      // 9. Aerospace Orbital Satellite Rings & Satellites (Inspired by uploaded image)
      if (showSatellites) {
        const time = Date.now() / 3000;

        // Orbital Ring 1 (Starlink Belt)
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(center[0], center[1], radius * 1.35, radius * 0.45, Math.PI / 6, 0, 2 * Math.PI);
        ctx.strokeStyle = 'rgba(251, 146, 60, 0.22)';
        ctx.setLineDash([4, 6]);
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.restore();

        // Orbital Ring 2 (Polar Orbit)
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(center[0], center[1], radius * 0.5, radius * 1.3, -Math.PI / 4, 0, 2 * Math.PI);
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.18)';
        ctx.setLineDash([3, 5]);
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();

        // Starlink-175 Satellite Position
        const satAngle = time % (2 * Math.PI);
        const satX = center[0] + Math.cos(satAngle) * radius * 1.35 * Math.cos(Math.PI / 6) - Math.sin(satAngle) * radius * 0.45 * Math.sin(Math.PI / 6);
        const satY = center[1] + Math.cos(satAngle) * radius * 1.35 * Math.sin(Math.PI / 6) + Math.sin(satAngle) * radius * 0.45 * Math.cos(Math.PI / 6);

        // Draw 3D Solar Panel Array for Starlink-175
        ctx.save();
        ctx.translate(satX, satY);
        ctx.rotate(satAngle + Math.PI / 4);

        // Satellite Main Bus
        ctx.fillStyle = '#d4d4d8';
        ctx.fillRect(-6, -4, 12, 8);
        ctx.strokeStyle = '#3f3f46';
        ctx.strokeRect(-6, -4, 12, 8);

        // Solar Array Wings
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(-28, -6, 20, 12);
        ctx.fillRect(8, -6, 20, 12);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 0.8;
        ctx.strokeRect(-28, -6, 20, 12);
        ctx.strokeRect(8, -6, 20, 12);
        // Solar grid segments
        ctx.beginPath();
        ctx.moveTo(-18, -6); ctx.lineTo(-18, 6);
        ctx.moveTo(18, -6); ctx.lineTo(18, 6);
        ctx.stroke();

        ctx.restore();

        // Starlink HUD Callout Card (Matching uploaded screenshot)
        ctx.fillStyle = 'rgba(10, 16, 26, 0.88)';
        ctx.strokeStyle = 'rgba(251, 146, 60, 0.5)';
        ctx.lineWidth = 1;
        const sCardX = satX + 18;
        const sCardY = satY - 24;
        ctx.fillRect(sCardX, sCardY, 110, 42);
        ctx.strokeRect(sCardX, sCardY, 110, 42);

        ctx.fillStyle = '#fb923c';
        ctx.font = 'bold 9px JetBrains Mono, monospace';
        ctx.fillText('Starlink-175', sCardX + 8, sCardY + 14);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = '8px JetBrains Mono, monospace';
        ctx.fillText('Signal: Weak', sCardX + 8, sCardY + 26);
        ctx.fillText('Freq: 45.5 MHz', sCardX + 8, sCardY + 36);

        // NCV-16950 Orbiting Satellite
        const ncvAngle = (time * 0.8 + Math.PI) % (2 * Math.PI);
        const ncvX = center[0] + Math.cos(ncvAngle) * radius * 0.5 * Math.cos(-Math.PI / 4) - Math.sin(ncvAngle) * radius * 1.3 * Math.sin(-Math.PI / 4);
        const ncvY = center[1] + Math.cos(ncvAngle) * radius * 0.5 * Math.sin(-Math.PI / 4) + Math.sin(ncvAngle) * radius * 1.3 * Math.cos(-Math.PI / 4);

        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(ncvX, ncvY, 3.5, 0, 2 * Math.PI);
        ctx.fill();

        // NCV Callout Box
        ctx.fillStyle = 'rgba(10, 16, 26, 0.88)';
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
        ctx.fillRect(ncvX + 12, ncvY - 18, 120, 28);
        ctx.strokeRect(ncvX + 12, ncvY - 18, 120, 28);
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 8px JetBrains Mono, monospace';
        ctx.fillText('NCV - 16950', ncvX + 18, ncvY - 6);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillText('Chance of failure: 94%', ncvX + 18, ncvY + 6);
      }

      // 10. Dynamic Parabolic Cyber Attack Arcs (for Live Attacks)
      arcProgressRef.current = (arcProgressRef.current + 0.008) % 1;
      const progress = arcProgressRef.current;

      const attacksToRender = activeAttacks.length > 0 ? activeAttacks : [
        // Default realistic threat arcs if none passed
        {
          id: 'def-1',
          sourceCoords: [55.7558, 37.6173] as [number, number], // Moscow
          targetCoords: [38.9072, -77.0369] as [number, number], // Washington
          threatActor: 'APT29 (Cozy Bear)',
          vector: 'Zero-Day RCE',
          severity: 'CRITICAL' as const
        },
        {
          id: 'def-2',
          sourceCoords: [39.9042, 116.4074] as [number, number], // Beijing
          targetCoords: [52.5200, 13.4050] as [number, number], // Berlin
          threatActor: 'Volt Typhoon',
          vector: 'Industrial SCADA Probe',
          severity: 'HIGH' as const
        },
        {
          id: 'def-3',
          sourceCoords: [39.0392, 125.7625] as [number, number], // Pyongyang
          targetCoords: [35.6762, 139.6503] as [number, number], // Tokyo
          threatActor: 'Lazarus Group',
          vector: 'Crypto SWIFT Heist',
          severity: 'CRITICAL' as const
        },
        {
          id: 'def-4',
          sourceCoords: [32.0853, 34.7818] as [number, number], // Tel Aviv
          targetCoords: [35.6892, 51.3890] as [number, number], // Tehran
          threatActor: 'Cyber Partisans',
          vector: 'BGP Hijacking',
          severity: 'HIGH' as const
        }
      ];

      attacksToRender.forEach((atk) => {
        const p1 = projection([atk.sourceCoords[1], atk.sourceCoords[0]]);
        const p2 = projection([atk.targetCoords[1], atk.targetCoords[0]]);

        if (p1 && p2) {
          const dist1 = Math.hypot(p1[0] - center[0], p1[1] - center[1]);
          const dist2 = Math.hypot(p2[0] - center[0], p2[1] - center[1]);

          // Render if at least one endpoint is on visible hemisphere
          if (dist1 <= radius || dist2 <= radius) {
            const midX = (p1[0] + p2[0]) / 2;
            const midY = (p1[1] + p2[1]) / 2;
            // Arc parabolic lift towards space
            const arcHeight = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) * 0.45;
            const ctrlX = midX;
            const ctrlY = midY - arcHeight;

            // Parabolic curve
            ctx.beginPath();
            ctx.moveTo(p1[0], p1[1]);
            ctx.quadraticCurveTo(ctrlX, ctrlY, p2[0], p2[1]);
            ctx.strokeStyle = atk.severity === 'CRITICAL' ? 'rgba(239, 68, 68, 0.45)' : 'rgba(251, 146, 60, 0.45)';
            ctx.lineWidth = 1.6;
            ctx.stroke();

            // Traveling photon head
            const t = progress;
            const photonX = (1 - t) * (1 - t) * p1[0] + 2 * (1 - t) * t * ctrlX + t * t * p2[0];
            const photonY = (1 - t) * (1 - t) * p1[1] + 2 * (1 - t) * t * ctrlY + t * t * p2[1];

            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(photonX, photonY, 2.5, 0, 2 * Math.PI);
            ctx.fill();

            const photonGlow = ctx.createRadialGradient(photonX, photonY, 1, photonX, photonY, 8);
            photonGlow.addColorStop(0, atk.severity === 'CRITICAL' ? '#ef4444' : '#fb923c');
            photonGlow.addColorStop(1, 'transparent');
            ctx.fillStyle = photonGlow;
            ctx.beginPath();
            ctx.arc(photonX, photonY, 8, 0, 2 * Math.PI);
            ctx.fill();

            // Source & Target Beacon Rings
            ctx.fillStyle = atk.severity === 'CRITICAL' ? '#ef4444' : '#fb923c';
            ctx.beginPath();
            ctx.arc(p1[0], p1[1], 3, 0, 2 * Math.PI);
            ctx.fill();

            ctx.strokeStyle = atk.severity === 'CRITICAL' ? '#ef4444' : '#00f0ff';
            ctx.beginPath();
            ctx.arc(p2[0], p2[1], 4 + (Math.sin(Date.now() / 200) + 1) * 2, 0, 2 * Math.PI);
            ctx.stroke();
          }
        }
      });

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [rotation, zoom, isDragging, autoRotate, worldData, algeriaCommunes, selectedCommune, viewMode, showSatellites, showWilayas, activeAttacks]);

  return (
    <div className={`relative overflow-hidden rounded-xl border border-white/10 bg-[#06090e] ${className}`}>
      {/* 3D Living Globe Canvas */}
      <canvas
        ref={canvasRef}
        width={900}
        height={650}
        className="w-full h-full cursor-grab active:cursor-grabbing block"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      />

      {/* Top Left: Optical Cam HUD Telemetry Feed (Inspired by uploaded image) */}
      <div className="absolute top-3 left-3 bg-[#0a101a]/85 backdrop-blur-md border border-white/10 rounded-lg p-2.5 shadow-2xl flex flex-col gap-1 z-20 pointer-events-auto">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-[10px] font-mono tracking-wider text-emerald-400 font-bold uppercase">LIVE OPTICAL FEED</span>
          <span className="text-[10px] font-mono text-zinc-400 ml-auto">08:39:16:52</span>
        </div>
        <div className="text-[11px] font-mono text-white flex items-center gap-3 mt-1">
          <span className="text-amber-400 font-semibold">SAT-Error: 25854-54</span>
          <span className="text-zinc-400">94/300</span>
          <span className="text-emerald-400">99.96%</span>
          <span className="text-cyan-400">720 Mbps</span>
        </div>
      </div>

      {/* Top Right: Wilaya & District Deep Search Reticle */}
      <div className="absolute top-3 right-3 z-20 flex flex-col items-end gap-2 pointer-events-auto">
        <div className="relative w-64">
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Wilaya (Algiers, Oran, etc.)..."
              className="w-full bg-[#0a101a]/90 backdrop-blur-md border border-white/15 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 font-mono focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Search Dropdown Results */}
          {searchResults.length > 0 && (
            <div className="absolute top-full mt-1 right-0 w-full bg-[#0b121d] border border-cyan-500/30 rounded-lg shadow-2xl overflow-hidden max-h-56 overflow-y-auto">
              {searchResults.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelectCommune(item)}
                  className="w-full text-left px-3 py-2 hover:bg-cyan-500/15 border-b border-white/5 flex items-center justify-between text-xs font-mono transition-colors"
                >
                  <div>
                    <span className="text-white font-semibold">{item.commune_name_fr}</span>
                    <span className="text-zinc-400 text-[10px] ml-1.5">({item.commune_name})</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                    W{item.wilaya_code} {item.wilaya_name_fr}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* View Mode & Layer Controls */}
        <div className="flex items-center gap-1.5 bg-[#0a101a]/80 backdrop-blur-md p-1 rounded-lg border border-white/10">
          <button
            onClick={() => setViewMode(prev => prev === 'aerospace' ? 'tactical' : 'aerospace')}
            className={`px-2.5 py-1 rounded text-[10px] font-mono flex items-center gap-1.5 transition-all ${
              viewMode === 'aerospace' 
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>{viewMode === 'aerospace' ? 'AEROSPACE ORBIT' : 'TACTICAL VECTOR'}</span>
          </button>

          <button
            onClick={() => setAutoRotate(prev => !prev)}
            title={autoRotate ? 'Pause Rotation' : 'Resume Auto Rotation'}
            className={`p-1.5 rounded transition-all ${
              autoRotate ? 'text-emerald-400 bg-emerald-500/20' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              setRotation([-3, -36, 0]);
              setZoom(1);
              setSelectedCommune(null);
            }}
            title="Reset to Mediterranean/Algeria Centered View"
            className="p-1.5 text-zinc-400 hover:text-white rounded transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Floating Tactical Zoom Controls */}
      <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-1.5 pointer-events-auto">
        <button
          onClick={() => setZoom(prev => Math.min(8.0, prev + 0.5))}
          className="p-2 bg-[#0a101a]/85 backdrop-blur-md border border-white/10 hover:border-cyan-400 text-zinc-300 hover:text-white rounded-lg transition-all shadow-lg"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom(prev => Math.max(0.7, prev - 0.5))}
          className="p-2 bg-[#0a101a]/85 backdrop-blur-md border border-white/10 hover:border-cyan-400 text-zinc-300 hover:text-white rounded-lg transition-all shadow-lg"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <div className="px-2 py-1 bg-[#0a101a]/90 border border-white/10 rounded text-[10px] font-mono text-zinc-400 text-center">
          {(zoom * 100).toFixed(0)}%
        </div>
      </div>

      {/* Bottom Left: Live Telemetry Status Bar */}
      <div className="absolute bottom-3 left-3 z-20 flex items-center gap-3 bg-[#0a101a]/85 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-lg text-[10px] font-mono text-zinc-400">
        <div className="flex items-center gap-1 text-amber-400">
          <Satellite className="w-3 h-3" />
          <span>Starlink-175: ACTIVE</span>
        </div>
        <span>•</span>
        <div className="flex items-center gap-1 text-cyan-400">
          <MapPin className="w-3 h-3" />
          <span>1,541 Wilaya Districts Loaded</span>
        </div>
        <span>•</span>
        <div className="flex items-center gap-1 text-red-400">
          <ShieldAlert className="w-3 h-3" />
          <span>{activeAttacks.length > 0 ? `${activeAttacks.length} Active Attacks` : 'Global Threat Feed Live'}</span>
        </div>
      </div>
    </div>
  );
};
