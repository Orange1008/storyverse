import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAppStore } from "../../store/useAppStore";
import {
  Compass,
  Home,
  BookOpen,
  PenTool,
  User,
  LogOut,
  Bell,
  Sun,
  Moon,
} from "lucide-react";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, darkMode, toggleDarkMode } = useAppStore();

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const [open, setOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => {
    const handleClick = () => {
      setOpen(false);
      setNotifOpen(false);
    };
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  const navLinks = [
    { name: "Home", path: "/home", icon: <Home size={18} /> },
    { name: "Explore", path: "/explore", icon: <Compass size={18} /> },
    { name: "Library", path: "/library", icon: <BookOpen size={18} /> },
  ];

  return (
    <>
      {/* ================= TOP NAV ================= */}
      <header className="fixed top-0 w-full z-50 bg-[#1a0b2e]/60 backdrop-blur-xl border-b border-amber-500/20 shadow">

        <div className="w-full container-custom py-3 mx-auto flex justify-between items-center ">

          {/* LOGO */}
          <Link to="/home" className="text-2xl font-bold text-amber-400">
            StoryVerse
          </Link>

          {/* LINKS */}
          <nav className="hidden md:flex gap-8">
            {navLinks.map((link) => {
              const active = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={active ? "text-amber-400" : "text-gray-300"}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-4">
            {/* THEME TOGGLE */}
            <button onClick={toggleDarkMode} className="text-gray-300 hover:text-amber-400 transition-colors">
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <Link to="/creator/dashboard" className="text-gray-300 flex items-center gap-1.5 hover:text-amber-400">
              <PenTool size={16} />
              Write
            </Link>

            {/* 🔔 NOTIFICATIONS */}
            <div className="relative">
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setNotifOpen(!notifOpen);
                }}
                className="cursor-pointer relative"
              >
                <Bell className="text-white" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              </div>

              {notifOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-black text-white p-4 rounded-xl">
                  <p>🔔 New chapter released</p>
                  <p>💬 New comment</p>
                  <p>❤️ Someone liked your story</p>
                </div>
              )}
            </div>

            {/* 👤 PROFILE */}
            <div className="relative">
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen(!open);
                }}
                className="flex items-center gap-2 cursor-pointer"
              >
                <div className="w-9 h-9 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold text-sm">
                  {user?.username?.[0]?.toUpperCase() || <User size={16} />}
                </div>
                <span className="hidden md:block text-white">
                  {user?.username || "Guest"}
                </span>
              </div>

              {open && (
                <div className="absolute right-0 mt-3 w-48 bg-black text-white rounded-xl">

                  <Link to="/profile" className="block px-4 py-2">
                    Profile
                  </Link>

                  <Link to="/library" className="block px-4 py-2">
                    Library
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="block px-4 py-2 text-red-400"
                  >
                    Logout
                  </button>

                </div>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* ================= MOBILE NAV ================= */}
      <div className="fixed bottom-0 w-full bg-black text-white md:hidden flex justify-around py-3">
        <Link to="/home">Home</Link>
        <Link to="/explore">Explore</Link>
        <Link to="/library">Library</Link>
        <Link to="/profile">Profile</Link>
      </div>
    </>
  );
};

export default Navbar;