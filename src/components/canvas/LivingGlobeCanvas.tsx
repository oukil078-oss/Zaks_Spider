// ==========================================
// ZAK'S SPIDER — 3D LIVING GLOBE & THREAT ARCS CANVAS
// High-performance HTML5 Canvas 3D particle sphere inspired by Silicon Valley SOC Dashboards
// ==========================================

import React, { useRef, useEffect, useState } from 'react';
import { ThreatArc } from '../../types';

interface LivingGlobeCanvasProps {
  activeTargetCoords?: { lat: number; lon: number; label?: string } | null;
  threatArcs?: ThreatArc[];
  height?: number;
  width?: number;
  interactive?: boolean;
}

// Major continental landmark points [lat, lon]
const CONTINENT_DOTS: [number, number][] = [
  // North America
  [37.77, -122.41], [40.71, -74.0], [34.05, -118.24], [41.87, -87.62], [29.76, -95.36],
  [45.5, -73.56], [49.28, -123.12], [25.76, -80.19], [19.43, -99.13], [32.77, -96.79],
  // South America
  [-23.55, -46.63], [-34.6, -58.38], [-12.04, -77.04], [4.71, -74.07], [-33.44, -70.66],
  [-15.79, -47.88], [-0.18, -78.46], [-16.5, -68.11],
  // Europe
  [48.85, 2.35], [51.5, -0.12], [52.52, 13.4], [40.41, -3.7], [41.9, 12.49],
  [52.36, 4.9], [59.32, 18.06], [50.07, 14.43], [48.2, 16.37], [50.85, 4.35],
  // Africa (Detailed, including Algeria)
  [36.75, 3.05], // Algiers, Algeria
  [35.69, -0.63], // Oran, Algeria
  [36.36, 6.61], // Constantine, Algeria
  [36.9, 7.76], // Annaba, Algeria
  [36.19, 5.41], // Setif, Algeria
  [33.88, -5.55], // Morocco
  [36.8, 10.18], // Tunisia
  [30.04, 31.23], // Egypt
  [9.03, 38.74], // Ethiopia
  [-1.29, 36.82], // Kenya
  [6.52, 3.37], // Nigeria
  [-26.2, 28.04], // South Africa
  [-33.92, 18.42], // Cape Town
  // Asia & Middle East
  [35.67, 139.65], [31.23, 121.47], [39.9, 116.4], [22.31, 114.16], [37.56, 126.97],
  [1.35, 103.81], [13.75, 100.5], [28.61, 77.2], [19.07, 72.87], [25.2, 55.27],
  [24.71, 46.67], [32.08, 34.78], [55.75, 37.61], [39.03, 125.75],
  // Oceania
  [-33.86, 151.2], [-37.81, 144.96], [-31.95, 115.86], [-27.46, 153.02], [-36.84, 174.76],
];

// Default threat trajectories if none provided
const DEFAULT_ARCS: ThreatArc[] = [
  { id: 'arc-1', startLat: 55.75, startLon: 37.61, endLat: 36.75, endLon: 3.05, color: '#ef4444', sourceCity: 'Moscow', targetCity: 'Algiers (SOC)', severity: 'High' },
  { id: 'arc-2', startLat: 31.23, startLon: 121.47, endLat: 48.85, endLon: 2.35, color: '#f59e0b', sourceCity: 'Shanghai', targetCity: 'Paris (Gateway)', severity: 'Medium' },
  { id: 'arc-3', startLat: 37.77, startLon: -122.41, endLat: 36.75, endLon: 3.05, color: '#00f0ff', sourceCity: 'San Francisco', targetCity: 'Algiers (SOC)', severity: 'Low' },
  { id: 'arc-4', startLat: 52.52, startLon: 13.4, endLat: 40.71, endLon: -74.0, color: '#a855f7', sourceCity: 'Berlin', targetCity: 'New York', severity: 'Medium' },
];

export const LivingGlobeCanvas: React.FC<LivingGlobeCanvasProps> = ({
  activeTargetCoords,
  threatArcs = DEFAULT_ARCS,
  interactive = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [rotation, setRotation] = useState({ x: 0.2, y: -0.8 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  // Smooth target rotation lock
  useEffect(() => {
    if (activeTargetCoords) {
      // Convert lat/lon to target Euler rotation
      const targetY = -(activeTargetCoords.lon * Math.PI) / 180 - Math.PI / 2;
      const targetX = (activeTargetCoords.lat * Math.PI) / 180;
      setRotation({ x: Math.max(-0.8, Math.min(0.8, targetX)), y: targetY });
    }
  }, [activeTargetCoords]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let localRotationY = rotation.y;
    let localRotationX = rotation.x;
    let arcProgress = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) * 0.38 * zoom;

      // Slowly rotate when idle
      if (!isDragging) {
        localRotationY += 0.003;
      }

      ctx.clearRect(0, 0, width, height);

      // 1. Atmosphere Radial Glow Haze
      const grad = ctx.createRadialGradient(centerX, centerY, radius * 0.7, centerX, centerY, radius * 1.3);
      grad.addColorStop(0, 'rgba(0, 240, 255, 0.04)');
      grad.addColorStop(0.5, 'rgba(0, 240, 255, 0.015)');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 1.3, 0, Math.PI * 2);
      ctx.fill();

      // 2. Globe Silhouette Sphere
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(6, 12, 22, 0.85)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.25)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Helper: 3D Spherical to 2D Projected Screen Coordinates
      const project = (lat: number, lon: number, alt: number = 0) => {
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lon + 180) * (Math.PI / 180) + localRotationY;
        const currentR = radius * (1 + alt);

        // 3D Cartesian coords
        let x = -currentR * Math.sin(phi) * Math.cos(theta);
        let z = currentR * Math.sin(phi) * Math.sin(theta);
        let y = currentR * Math.cos(phi);

        // Rotate along X axis (pitch)
        const cosX = Math.cos(localRotationX);
        const sinX = Math.sin(localRotationX);
        const y2 = y * cosX - z * sinX;
        const z2 = y * sinX + z * cosX;

        // Front-facing check (z2 > 0 is visible hemisphere)
        const visible = z2 > -radius * 0.2;
        const scale = (radius * 1.8) / (radius * 1.8 - z2 * 0.35);

        return {
          x: centerX + x * (scale / 1.8),
          y: centerY - y2 * (scale / 1.8),
          z: z2,
          visible,
        };
      };

      // 3. Draw Latitude and Longitude Coordinate Rings (Wireframe)
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.06)';
      ctx.lineWidth = 0.8;
      for (let lat = -60; lat <= 60; lat += 30) {
        ctx.beginPath();
        let first = true;
        for (let lon = -180; lon <= 180; lon += 10) {
          const pt = project(lat, lon);
          if (pt.visible) {
            if (first) {
              ctx.moveTo(pt.x, pt.y);
              first = false;
            } else {
              ctx.lineTo(pt.x, pt.y);
            }
          } else {
            first = true;
          }
        }
        ctx.stroke();
      }

      // 4. Draw Continental Particle Dots
      CONTINENT_DOTS.forEach(([lat, lon]) => {
        const pt = project(lat, lon);
        if (pt.visible) {
          const alpha = Math.max(0.15, (pt.z / radius) * 0.85);
          ctx.fillStyle = `rgba(0, 240, 255, ${alpha})`;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 1.8, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // 5. Draw Dynamic Glowing Threat Arcs
      arcProgress = (arcProgress + 0.015) % 1;
      threatArcs.forEach(arc => {
        const p1 = project(arc.startLat, arc.startLon);
        const p2 = project(arc.endLat, arc.endLon);

        if (p1.visible || p2.visible) {
          // Draw parabolic curve through midpoint
          const midLat = (arc.startLat + arc.endLat) / 2;
          const midLon = (arc.startLon + arc.endLon) / 2;
          const midP = project(midLat, midLon, 0.28); // Height altitude of arc

          ctx.strokeStyle = arc.color === '#ef4444' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(0, 240, 255, 0.4)';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.quadraticCurveTo(midP.x, midP.y, p2.x, p2.y);
          ctx.stroke();

          // Traveling glowing pulse photon along the arc
          const t = arcProgress;
          const qx = (1 - t) * (1 - t) * p1.x + 2 * (1 - t) * t * midP.x + t * t * p2.x;
          const qy = (1 - t) * (1 - t) * p1.y + 2 * (1 - t) * t * midP.y + t * t * p2.y;

          ctx.fillStyle = arc.color || '#00f0ff';
          ctx.beginPath();
          ctx.arc(qx, qy, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // 6. Draw Active Targeted Coordinate Reticle (if present)
      if (activeTargetCoords) {
        const targetPt = project(activeTargetCoords.lat, activeTargetCoords.lon);
        if (targetPt.visible) {
          // Pulsing targeting ring
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(targetPt.x, targetPt.y, 7 + Math.sin(Date.now() / 200) * 2, 0, Math.PI * 2);
          ctx.stroke();

          // Target Center Dot
          ctx.fillStyle = '#10b981';
          ctx.beginPath();
          ctx.arc(targetPt.x, targetPt.y, 2.5, 0, Math.PI * 2);
          ctx.fill();

          // Target Label Pill
          if (activeTargetCoords.label) {
            ctx.font = '10px monospace';
            ctx.fillStyle = '#10b981';
            ctx.fillText(activeTargetCoords.label, targetPt.x + 12, targetPt.y + 3);
          }
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [rotation, isDragging, zoom, activeTargetCoords, threatArcs]);

  // Mouse / Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!interactive) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !interactive) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    setRotation(prev => ({
      x: Math.max(-1, Math.min(1, prev.x + dy * 0.005)),
      y: prev.y + dx * 0.005,
    }));
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleWheel = (e: React.WheelEvent) => {
    if (!interactive) return;
    e.preventDefault();
    setZoom(prev => Math.max(0.7, Math.min(1.6, prev - e.deltaY * 0.001)));
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center select-none overflow-hidden">
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      />
      {/* HUD Coordinate readout */}
      <div className="absolute bottom-3 left-3 bg-black/60 border border-cyan-500/20 px-2.5 py-1 rounded-xl text-[10px] font-mono text-cyan-300 backdrop-blur-md pointer-events-none">
        GRID: 3D PARTICLE WIREFRAME // 60 FPS
      </div>
    </div>
  );
};
