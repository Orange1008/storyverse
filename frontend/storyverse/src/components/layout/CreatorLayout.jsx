import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, PenTool, BarChart3, LogOut, BookOpen, Menu, X, Sun, Moon } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { ToastContainer } from '../ui/Toast';

const CreatorLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, darkMode, toggleDarkMode } = useAppStore();

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const sidebarLinks = [
    { name: 'Dashboard', path: '/creator/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Write Story', path: '/creator/editor', icon: <PenTool size={20} /> },
    { name: 'Analytics', path: '/creator/analytics', icon: <BarChart3 size={20} /> },
  ];

  return (
    <div className={`flex min-h-screen selection:bg-purple-500 selection:text-white font-serif ${darkMode ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Mobile Top Header */}
      <div className={`lg:hidden fixed top-0 w-full z-30 flex items-center justify-between p-4 shadow-sm border-b transition-colors ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center gap-3">
          <button onClick={() => setIsSidebarOpen(prev => !prev)} className={`focus:outline-none hover:text-purple-600 transition-colors ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <span className="font-serif font-bold text-lg tracking-widest uppercase">
             <span className="text-purple-600">Story</span><span className={darkMode ? 'text-slate-100' : 'text-slate-900'}>Verse</span>
          </span>
        </div>
        <button onClick={toggleDarkMode} className={`p-1.5 rounded-full transition-colors ${darkMode ? 'bg-slate-800 text-yellow-500' : 'bg-slate-100 text-blue-500'}`}>
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Focus (Scribe Tools) */}
      <aside className={`w-64 h-screen border-r shadow-lg flex flex-col z-50 fixed left-0 top-0 overflow-hidden transition-all duration-300 ease-in-out ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      } ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className={`p-6 border-b relative flex justify-between items-center ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
          <div>
            <Link to="/home" className="text-2xl font-bold flex items-center gap-2 font-serif tracking-widest uppercase drop-shadow-sm relative z-10" onClick={() => setIsSidebarOpen(false)}>
              <span className="text-purple-600">Story</span><span className={darkMode ? 'text-slate-100' : 'text-slate-900'}>Verse</span>
            </Link>
            <p className={`text-[10px] uppercase tracking-widest mt-2 font-bold font-sans relative z-10 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Creator Tools</p>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className={`lg:hidden transition-colors ${darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-900'}`}>
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 py-6 flex flex-col gap-1 overflow-y-auto px-1">
          {sidebarLinks.map((link) => {
             const isActive = location.pathname === link.path;
             return (
               <Link 
                 key={link.name}
                 to={link.path}
                 onClick={() => setIsSidebarOpen(false)}
                 className={`flex items-center gap-4 px-6 py-4 transition-all font-sans font-bold tracking-wider uppercase text-sm ${
                   isActive 
                     ? (darkMode ? 'bg-slate-800 text-purple-400 border-l-4 border-purple-500 shadow-sm' : 'bg-purple-50 text-purple-600 border-l-4 border-purple-600 shadow-sm') 
                     : (darkMode ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800 border-l-4 border-transparent' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border-l-4 border-transparent')
                 }`}
               >
                 {link.icon}
                 <span>{link.name}</span>
               </Link>
             );
          })}
        </nav>

        <div className={`p-6 border-t flex flex-col gap-3 font-sans ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
          <button onClick={toggleDarkMode} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-xs font-bold uppercase tracking-widest ${darkMode ? 'text-yellow-500 hover:bg-slate-800' : 'text-blue-500 hover:bg-slate-100'}`}>
             {darkMode ? <Sun size={16} /> : <Moon size={16} />} {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
          
          <Link to="/home" className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-xs font-bold uppercase tracking-widest ${darkMode ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}>
             <BookOpen size={16} /> Back Home
          </Link>
          <button onClick={handleLogout} className={`flex items-center gap-3 px-4 py-2.5 w-full transition-colors text-xs font-bold uppercase tracking-widest rounded-lg border ${darkMode ? 'text-red-400 hover:bg-red-900/30 border-red-900 hover:border-red-800' : 'text-red-600 hover:bg-red-50 border-red-200 hover:border-red-300'}`}>
             <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={`flex-1 flex flex-col min-h-screen overflow-y-auto relative pt-16 lg:pt-0 pb-24 lg:pb-0 lg:pl-64 transition-colors ${darkMode ? 'bg-slate-900' : 'bg-linear-to-br from-slate-50 via-slate-100 to-slate-50'}`}>

        <div className="relative z-10 w-full p-4 lg:p-8 pb-24 lg:pb-8">
           <Outlet />
        </div>
      </main>

      {/* Mobile Creator Header fallback */}
      <div className={`lg:hidden fixed bottom-0 w-full p-4 flex justify-around border-t z-50 shadow-lg ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
         {sidebarLinks.map(link => (
            <Link key={link.name} to={link.path} className={`${location.pathname === link.path ? 'text-purple-600' : (darkMode ? 'text-slate-500' : 'text-slate-400')}`}>
              {link.icon}
            </Link>
         ))}
         <Link to="/home" className={darkMode ? 'text-slate-500' : 'text-slate-400'}>
           <BookOpen size={16} />
         </Link>
         <button onClick={handleLogout} className={darkMode ? 'text-slate-500' : 'text-slate-400'}>
           <LogOut size={16} />
         </button>
      </div>
      <ToastContainer />
    </div>
  );
};

export default CreatorLayout;
