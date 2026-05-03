import React from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';

const WriterMiniCard = ({ username, headline, followers, works, avatar }) => {
  const { darkMode } = useAppStore();
  return (
    <Link to={`/profile/${username}`} className={`group rounded-3xl border p-4 transition-all block ${darkMode ? 'border-white/10 bg-white/5 hover:bg-white/10 hover:-translate-y-1' : 'border-slate-200 bg-slate-50 hover:bg-slate-100 hover:-translate-y-1'}`}>
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-lg font-bold text-white">
          {avatar || username[0].toUpperCase()}
        </div>
        <div className="min-w-0">
          <h4 className={`text-base font-semibold truncate transition-colors ${darkMode ? 'text-slate-100 group-hover:text-purple-400' : 'text-slate-900 group-hover:text-purple-600'}`}>{username}</h4>
          <p className={`text-sm truncate ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{headline}</p>
        </div>
      </div>
      <div className={`mt-4 flex items-center justify-between text-xs ${darkMode ? 'text-slate-500' : 'text-slate-500'}`}>
        <span>{followers} followers</span>
        <span>{works} works</span>
      </div>
    </Link>
  );
};

export default WriterMiniCard;
