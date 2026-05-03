import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Trash2, Eye, BookOpen } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import axiosInstance from '../lib/axios';

const Dashboard = () => {
  const { addToast, darkMode, user } = useAppStore();
  const navigate = useNavigate();
  const [myStories, setMyStories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyStories = async () => {
      try {
        const { data } = await axiosInstance.get('/auth/my-stories');
        setMyStories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to fetch my stories:', err);
        addToast('Could not load your stories.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchMyStories();
  }, []);

  const handleDelete = async (storyId, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await axiosInstance.delete(`/stories/${storyId}`);
      setMyStories(prev => prev.filter(s => s._id !== storyId));
      addToast(`"${title}" deleted.`, 'default');
    } catch (err) {
      addToast('Failed to delete story.', 'error');
    }
  };

  const totalViews = myStories.reduce((acc, s) => acc + (s.views || 0), 0);
  const totalChapters = myStories.reduce((acc, s) => acc + (s.chapterCount || 0), 0);

  return (
    <div className={`relative min-h-full py-8 px-4 md:px-8 transition-colors ${darkMode ? 'bg-slate-900 text-slate-100' : 'bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 text-slate-900'}`}>

      {/* Header Banner */}
      <header className={`mb-8 rounded-3xl border shadow-lg backdrop-blur-xl overflow-hidden transition-colors ${darkMode ? 'bg-slate-800/80 border-slate-700/50' : 'bg-white/80 border-slate-200/50'}`}>
        <div className="max-w-7xl mx-auto">

          {/* Top row: welcome + actions */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 p-6 md:p-8 pb-4">
            <div className="space-y-2">
              <span className={`font-semibold text-xs font-sans tracking-widest uppercase ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>Creator Dashboard</span>
              <h1 className={`text-3xl md:text-4xl font-serif tracking-tight leading-tight ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                Welcome back,{' '}
                <span className={`italic ${darkMode ? 'text-purple-400' : 'text-purple-700'}`}>
                  {user?.username || 'Creator'}.
                </span>
              </h1>
              <p className={`text-sm leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Your studio is ready. Write, publish, and manage your stories.
              </p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                onClick={() => {
                  addToast("Opening a new canvas...", "magic");
                  setTimeout(() => navigate('/creator/editor'), 600);
                }}
                className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-full font-semibold text-sm shadow-lg shadow-purple-500/20 hover:brightness-110 transition-all"
              >
                <Sparkles size={15} /> New Story
              </button>
              <Link to="/explore" className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm border transition-all ${darkMode ? 'bg-slate-700 text-slate-100 border-slate-600 hover:bg-slate-600' : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'}`}>
                Explore <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Bottom row: stat cards — always in a proper grid */}
          <div className={`grid grid-cols-3 gap-px border-t ${darkMode ? 'border-slate-700 bg-slate-700' : 'border-slate-200 bg-slate-200'}`}>
            {[
              { label: 'My Stories',   value: myStories.length,             icon: '📚', sub: 'published' },
              { label: 'Total Views',  value: totalViews.toLocaleString(),   icon: '👁',  sub: 'all time' },
              { label: 'Chapters',     value: totalChapters,                 icon: '📖', sub: 'written' },
            ].map((metric) => (
              <div
                key={metric.label}
                className={`flex items-center gap-4 px-6 py-5 transition-colors ${darkMode ? 'bg-slate-800/90 hover:bg-slate-800' : 'bg-white/90 hover:bg-white'}`}
              >
                <span className="text-2xl">{metric.icon}</span>
                <div>
                  <div className={`text-2xl font-black font-serif tracking-tight ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                    {metric.value}
                  </div>
                  <div className={`text-[11px] font-bold uppercase tracking-wider mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    {metric.label}
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </header>

      <main className="max-w-7xl mx-auto">

        {/* My Stories */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className={`font-semibold text-xs font-sans tracking-widest uppercase ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>Your Work</span>
              <h2 className={`text-2xl font-serif font-bold mt-1 ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                {loading ? 'Loading...' : myStories.length > 0 ? 'Your Published Stories' : 'No stories yet'}
              </h2>
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1,2,3].map(i => (
                <div key={i} className={`h-24 rounded-3xl animate-pulse ${darkMode ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
              ))}
            </div>
          ) : myStories.length === 0 ? (
            <div className={`p-12 rounded-3xl border text-center ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
              <div className="text-5xl mb-4">✍️</div>
              <p className={`text-lg font-serif font-bold ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                Your story universe is empty.
              </p>
              <p className={`text-sm mt-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Click "New Story" to start writing your first book.</p>
              <button
                onClick={() => navigate('/creator/editor')}
                className="mt-6 px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition"
              >
                Write My First Story
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {myStories.map((story) => (
                <div
                  key={story._id}
                  className={`group p-6 rounded-3xl border transition-all shadow-sm hover:shadow-md ${darkMode ? 'bg-slate-800 border-slate-700 hover:border-purple-400' : 'bg-white border-slate-200 hover:border-purple-300'}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Cover swatch */}
                    <div
                      className="w-12 h-16 rounded-lg flex-shrink-0 shadow-md"
                      style={story.coverImage
                        ? { backgroundImage: `url(${story.coverImage})`, backgroundSize: 'cover' }
                        : { background: `linear-gradient(135deg, ${story.coverColor || '#7C3AED'}, #4F46E5)` }
                      }
                    ></div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${darkMode ? 'bg-purple-900/40 text-purple-300' : 'bg-purple-100 text-purple-700'}`}>
                          {story.genre}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${darkMode ? 'bg-green-900/40 text-green-400' : 'bg-green-100 text-green-700'}`}>
                          Published
                        </span>
                      </div>
                      <h4 className={`text-lg font-serif font-bold truncate ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                        {story.title}
                      </h4>
                      <p className={`text-sm mt-0.5 line-clamp-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        {story.description}
                      </p>
                      <div className={`mt-2 text-xs flex items-center gap-4 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                        <span>👁 {story.views?.toLocaleString() || 0} views</span>
                        <span>📖 {story.chapterCount || 0} chapters</span>
                        <span>Updated {new Date(story.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => navigate(`/story/${story._id}`)}
                        className={`p-2 rounded-lg transition ${darkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-50 text-slate-500'}`}
                        title="View story"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => navigate(`/creator/editor?storyId=${story._id}`)}
                        className={`p-2 rounded-lg transition ${darkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-50 text-slate-500'}`}
                        title="Edit story"
                      >
                        <BookOpen size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(story._id, story.title)}
                        className="p-2 rounded-lg transition text-red-400 hover:text-red-500 hover:bg-red-500/10"
                        title="Delete story"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </main>
    </div>
  );
};

export default Dashboard;
