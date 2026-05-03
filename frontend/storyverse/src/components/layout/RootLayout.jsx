import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './navbar';
import BottomNav from './BottomNav';
import { ToastContainer } from '../ui/Toast';

const RootLayout = () => {
  return (
    <div className="flex flex-col min-h-screen font-serif relative text-[#2D3748]">
      
      {/* Global Magical Background */}
      <div className="fixed inset-0 bg-[url('/src/assets/hero.png')] bg-cover bg-center animate-pulse-slow z-0 opacity-80"></div>
      <div className="fixed inset-0 bg-gradient-to-b from-[#1a0b2e]/95 via-[#3b1754]/85 to-[#FAF8F5]/95 z-0"></div>

      {/* Persistent Floating Particles */}
      <div className="fixed top-1/4 left-1/4 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl animate-float pointer-events-none z-0"></div>
      <div className="fixed bottom-1/3 right-1/4 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl animate-float-delayed pointer-events-none z-0"></div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        
        {/* Main Content Area */}
        <main className="flex-1 w-full pb-20 md:pb-0 pt-16">
          <Outlet />
        </main>

        <BottomNav />
      </div>
      <ToastContainer />
    </div>
  );
};

export default RootLayout;
