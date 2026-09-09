import React, { useEffect, useRef } from 'react';

interface SpiderWebCanvasProps {
  interactive?: boolean;
  intensity?: number;
  className?: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseColor: string;
  pulseOffset: number;
}

export const SpiderWebCanvas: React.FC<SpiderWebCanvasProps> = ({
  interactive = true,
  intensity = 1,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const mouse = {
      x: -1000,
      y: -1000,
      radius: 180,
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initParticles();
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    // Color palette for spider web nodes
    const colors = [
      'rgba(0, 240, 255, 0.7)',   // Neon Silk Cyan
      'rgba(16, 185, 129, 0.65)', // Venom Green
      'rgba(168, 85, 247, 0.6)',  // Arachnid Violet
      'rgba(239, 68, 68, 0.55)',  // Black Widow Red
    ];

    let particles: Particle[] = [];
    const particleCount = Math.floor(Math.min(width, 1600) / 18 * intensity);

    const initParticles = () => {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.45,
          vy: (Math.random() - 0.5) * 0.45,
          radius: Math.random() * 1.8 + 0.8,
          baseColor: colors[Math.floor(Math.random() * colors.length)],
          pulseOffset: Math.random() * Math.PI * 2,
        });
      }
    };

    initParticles();

    let frame = 0;

    const render = () => {
      frame++;
      ctx.clearRect(0, 0, width, height);

      // Render radial web background glow
      const radialGrad = ctx.createRadialGradient(
        width / 2,
        height / 3,
        20,
        width / 2,
        height / 3,
        Math.max(width, height) * 0.85
      );
      radialGrad.addColorStop(0, 'rgba(0, 240, 255, 0.03)');
      radialGrad.addColorStop(0.4, 'rgba(168, 85, 247, 0.015)');
      radialGrad.addColorStop(1, 'rgba(6, 9, 14, 0)');
      ctx.fillStyle = radialGrad;
      ctx.fillRect(0, 0, width, height);

      // Update & render particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.x += p.vx;
        p.y += p.vy;

        // Bounce off canvas boundaries
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Connect silk threads between close particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 115) {
            const alpha = (1 - dist / 115) * 0.22;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(0, 240, 255, ${alpha})`;
            ctx.lineWidth = 0.75;
            ctx.stroke();
          }
        }

        // Connect silk threads to mouse cursor (Spider Web Weaver effect)
        if (interactive && mouse.x > 0) {
          const mdx = p.x - mouse.x;
          const mdy = p.y - mouse.y;
          const mDist = Math.sqrt(mdx * mdx + mdy * mdy);

          if (mDist < mouse.radius) {
            const mAlpha = (1 - mDist / mouse.radius) * 0.45;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = `rgba(0, 240, 255, ${mAlpha})`;
            ctx.lineWidth = 1.1;
            ctx.stroke();
          }
        }

        // Draw particle node
        const pulse = Math.sin(frame * 0.03 + p.pulseOffset) * 0.4 + 1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * pulse, 0, Math.PI * 2);
        ctx.fillStyle = p.baseColor;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [interactive, intensity]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-0 ${className}`}
    />
  );
};
