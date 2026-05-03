import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { Compass, Home, BookOpen, PenTool, User } from 'lucide-react';

const BottomNav = () => {
  const { userRole } = useAppStore();
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/home', icon: <Home size={22} /> },
    { name: 'Explore', path: '/explore', icon: <Compass size={22} /> },
    ...(userRole === 'creator' ? [{ name: 'Create', path: '/editor', icon: <PenTool size={22} /> }] : []),
    { name: 'Library', path: '/library', icon: <BookOpen size={22} /> },
    { name: 'Profile', path: '/profile', icon: <User size={22} /> },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 w-full bg-[#1a0b2e]/80 backdrop-blur-xl border-t border-amber-500/20 z-50 rounded-none pb-safe">
      <div className="flex justify-around items-center py-3 font-serif">
        {navLinks.map((link) => {
          const isActive = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path));
          return (
            <Link 
              key={link.name} 
              to={link.path}
              className={`flex flex-col items-center gap-1 transition-all duration-300 ${
                isActive ? 'text-amber-400 font-bold scale-105 drop-shadow-[0_0_5px_rgba(251,191,36,0.5)]' : 'text-gray-400 opacity-80'
              }`}
            >
              {link.icon}
              <span className="text-[10px] tracking-wider uppercase mt-1">{link.name}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
