import React from 'react';
import { Link } from 'react-router-dom';
import heroImage from '../../assets/hero.png';

const HeroBanner = () => {
  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-[#0a0a0a] border border-[var(--color-border)] shadow-2xl group flex flex-col md:flex-row">
      
      {/* Text Content (Left side on desktop) */}
      <div className="w-full md:w-1/2 p-8 md:p-12 z-10 flex flex-col justify-center bg-gradient-to-r from-black/80 to-transparent text-white">
        <div className="inline-block px-3 py-1 bg-[var(--color-primary)]/20 text-purple-300 rounded-full text-xs font-semibold mb-6 w-max uppercase tracking-wider">
          Featured Story
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold mb-4 tracking-tight drop-shadow-lg">
          The Neon <br/>Horizon
        </h1>
        <p className="text-gray-300 text-lg mb-8 max-w-md line-clamp-3 leading-relaxed">
          In a city where the sun never rises, a rogue AI discovers a secret that could unmake the world. Begin your journey into the sprawling cyberpunk metropolis.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link to="/reader" className="btn-primary flex items-center gap-2 shadow-lg shadow-[var(--color-primary)]/40 hover:scale-105 transition-transform font-bold px-8 py-3 bg-[var(--color-primary)] text-white rounded-full">
            Read Now
          </Link>
          <Link to="/story/1" className="btn-secondary px-6 py-3 font-medium bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-colors border border-white/20">
            Details
          </Link>
        </div>
      </div>
      
      {/* Image Content (Right side on desktop) */}
      <div className="w-full md:w-1/2 min-h-[300px] md:h-auto relative overflow-hidden order-first md:order-last">
        <img 
          src={heroImage} 
          alt="The Neon Horizon visual" 
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out opacity-80"
          onError={(e) => {
             // Fallback gradient if missing
             e.target.style.display = 'none';
          }}
        />
        {/* Right side gradient fade into image for seamless blending */}
        <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/80 md:from-[#0a0a0a] via-transparent to-transparent"></div>
        {/* Subtle top/bottom shadow for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60"></div>
      </div>
      
    </div>
  );
};

export default HeroBanner;   