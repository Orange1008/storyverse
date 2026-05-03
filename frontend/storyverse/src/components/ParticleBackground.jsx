import { useEffect, useRef } from 'react';

const PARTICLE_COUNT = 40;
const COLORS = ['#a78bfa', '#c4b5fd', '#818cf8', '#e879f9', '#f0abfc'];

/**
 * Pure CSS/JS canvas-free particle background.
 * Replaces the broken react-tsparticles (v2) + tsparticles (v3) combo
 * that caused "engine.checkVersion is not a function" crashes.
 */
export default function ParticleBackground() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Create particles
    const particles = Array.from({ length: PARTICLE_COUNT }, () => {
      const el = document.createElement('span');
      const size = Math.random() * 4 + 1.5;
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      const x = Math.random() * 100;
      const delay = Math.random() * 8;
      const duration = 6 + Math.random() * 10;

      Object.assign(el.style, {
        position: 'absolute',
        borderRadius: '50%',
        width: `${size}px`,
        height: `${size}px`,
        background: color,
        left: `${x}%`,
        bottom: '-10px',
        opacity: '0',
        animation: `particle-float ${duration}s ${delay}s infinite ease-in`,
        pointerEvents: 'none',
      });

      container.appendChild(el);
      return el;
    });

    return () => particles.forEach(p => p.remove());
  }, []);

  return (
    <>
      <style>{`
        @keyframes particle-float {
          0%   { transform: translateY(0) scale(1);    opacity: 0; }
          10%  { opacity: 0.5; }
          90%  { opacity: 0.3; }
          100% { transform: translateY(-110vh) scale(0.4); opacity: 0; }
        }
      `}</style>
      <div
        ref={containerRef}
        className="absolute inset-0 -z-10 overflow-hidden pointer-events-none"
        aria-hidden="true"
      />
    </>
  );
}
