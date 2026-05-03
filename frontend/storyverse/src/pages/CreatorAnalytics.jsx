import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import axiosInstance from '../lib/axios';

const CreatorAnalytics = () => {
  const { darkMode, user } = useAppStore();
  const [myStories, setMyStories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await axiosInstance.get('/stories/me');
        setMyStories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  // ── Computed Stats ──────────────────────────────────
  const totalViews    = useMemo(() => myStories.reduce((s, x) => s + (x.views || 0), 0), [myStories]);
  const totalChapters = useMemo(() => myStories.reduce((s, x) => s + (x.chapterCount || 0), 0), [myStories]);
  const totalLikes    = useMemo(() => myStories.reduce((s, x) => s + ((x.likes && x.likes.length) || 0), 0), [myStories]);
  const totalStories  = myStories.length;

  // Top 5 stories by views
  const topStories = useMemo(() =>
    [...myStories].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5),
    [myStories]
  );

  // Genre breakdown
  const genreMap = useMemo(() => {
    const map = {};
    myStories.forEach(s => {
      map[s.genre] = (map[s.genre] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [myStories]);

  const maxViews = topStories[0]?.views || 1;

  const card = `p-6 rounded-3xl border shadow-sm hover:shadow-md transition-all ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`;
  const label = `text-[10px] font-bold uppercase tracking-widest ${darkMode ? 'text-slate-400' : 'text-slate-500'}`;
  const heading = `text-2xl font-serif font-bold mt-1 ${darkMode ? 'text-slate-100' : 'text-slate-900'}`;

  return (
    <div className={`min-h-full py-8 px-4 md:px-8 transition-colors ${darkMode ? 'bg-slate-900 text-slate-100' : 'bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 text-slate-900'}`}>
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <header className={`p-6 md:p-8 rounded-3xl border shadow-lg backdrop-blur-xl transition-colors ${darkMode ? 'bg-slate-800/80 border-slate-700/50' : 'bg-white/80 border-slate-200/50'}`}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className={`font-semibold text-xs font-sans tracking-widest uppercase ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                Creator Analytics
              </span>
              <h1 className={`mt-2 text-3xl md:text-4xl font-serif tracking-tight ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                {user?.username}'s Performance
              </h1>
              <p className={`mt-1 text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Real-time stats from your published stories
              </p>
            </div>
            <Link to="/creator/editor">
              <button className={`px-5 py-2.5 text-sm font-semibold rounded-full transition-all border ${darkMode ? 'text-purple-300 bg-purple-900/30 border-purple-800 hover:bg-purple-900/50' : 'text-purple-600 bg-purple-50 border-purple-200 hover:bg-purple-100'}`}>
                + New Story
              </button>
            </Link>
          </div>
        </header>

        {loading ? (
          <div className="grid grid-cols-3 gap-4">
            {[1,2,3].map(i => (
              <div key={i} className={`h-28 rounded-3xl animate-pulse ${darkMode ? 'bg-slate-800' : 'bg-slate-200'}`} />
            ))}
          </div>
        ) : (
          <>
            {/* ── Quick Stats ── */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Reads',    value: totalViews.toLocaleString(),    icon: '👁',  sub: 'across all stories' },
                { label: 'Total Likes',    value: totalLikes.toLocaleString(),    icon: '❤️', sub: 'hearts received' },
                { label: 'Published',      value: totalStories,                   icon: '📚', sub: 'stories live' },
                { label: 'Chapters',       value: totalChapters,                  icon: '📖', sub: 'written & published' },
              ].map((stat) => (
                <div key={stat.label} className={card}>
                  <div className="flex justify-between items-start mb-3">
                    <span className={label}>{stat.label}</span>
                    <span className="text-2xl">{stat.icon}</span>
                  </div>
                  <div className={`text-4xl font-serif font-black ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                    {stat.value}
                  </div>
                  <div className={`text-xs mt-1 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                    {stat.sub}
                  </div>
                </div>
              ))}
            </section>

            {totalStories === 0 ? (
              /* Empty state */
              <div className={`${card} text-center py-16`}>
                <p className="text-5xl mb-4">✍️</p>
                <p className={`font-serif text-xl font-bold ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                  No data yet
                </p>
                <p className={`text-sm mt-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Publish your first story to see analytics here.
                </p>
                <Link to="/creator/editor">
                  <button className="mt-6 bg-purple-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-purple-700 transition">
                    Write a Story
                  </button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

                {/* ── Top Stories by Views ── */}
                <div className={card}>
                  <div className="mb-6">
                    <span className={label}>Story Performance</span>
                    <h2 className={heading}>Top Stories by Views</h2>
                  </div>
                  <div className="space-y-4">
                    {topStories.length > 0 ? topStories.map((story, i) => {
                      const barWidth = maxViews > 0 ? Math.max(4, Math.round((story.views / maxViews) * 100)) : 4;
                      return (
                        <div key={story._id}>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className={`text-xs font-black w-5 flex-shrink-0 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                #{i + 1}
                              </span>
                              <div
                                className="w-6 h-8 rounded flex-shrink-0"
                                style={{
                                  background: story.coverImage
                                    ? `url(${story.coverImage}) center/cover`
                                    : `linear-gradient(135deg, ${story.coverColor || '#7C3AED'}, #4F46E5)`,
                                }}
                              />
                              <Link to={`/story/${story._id}`} className={`text-sm font-semibold truncate hover:text-purple-500 transition ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                                {story.title}
                              </Link>
                            </div>
                            <span className={`text-xs font-bold flex-shrink-0 ml-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                              {(story.views || 0).toLocaleString()} reads
                            </span>
                          </div>
                          {/* Progress bar */}
                          <div className={`h-1.5 rounded-full overflow-hidden ml-7 ${darkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-700"
                              style={{ width: `${barWidth}%` }}
                            />
                          </div>
                          <div className={`text-[10px] ml-7 mt-0.5 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                            {story.genre} • {story.chapterCount || 0} chapters
                          </div>
                        </div>
                      );
                    }) : (
                      <p className={`text-sm ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                        No views yet — share your stories to get readers!
                      </p>
                    )}
                  </div>
                </div>

                {/* ── Genre Breakdown ── */}
                <div className={card}>
                  <div className="mb-6">
                    <span className={label}>Your Library</span>
                    <h2 className={heading}>Genre Breakdown</h2>
                  </div>

                  {genreMap.length > 0 ? (
                    <div className="space-y-3">
                      {genreMap.map(([genre, count]) => {
                        const pct = Math.round((count / totalStories) * 100);
                        return (
                          <div key={genre} className={`rounded-2xl border p-4 ${darkMode ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                            <div className={`flex items-center justify-between text-sm mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                              <span className="font-medium">{genre}</span>
                              <span className="font-bold">{count} {count === 1 ? 'story' : 'stories'} • {pct}%</span>
                            </div>
                            <div className={`w-full h-2 rounded-full overflow-hidden ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`}>
                              <div
                                className="h-full bg-purple-500 rounded-full transition-all duration-700"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className={`text-sm ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>No genre data available.</p>
                  )}

                  {/* Total reads summary */}
                  <div className={`mt-6 pt-4 border-t flex items-center justify-between ${darkMode ? 'border-slate-700' : 'border-slate-100'}`}>
                    <span className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Total reads across all genres</span>
                    <span className={`text-sm font-black ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                      {totalViews.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* ── All Stories Table ── */}
                <div className={`${card} xl:col-span-2`}>
                  <div className="mb-6">
                    <span className={label}>All Stories</span>
                    <h2 className={heading}>Complete Story List</h2>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className={`border-b ${darkMode ? 'border-slate-700' : 'border-slate-100'}`}>
                          {['Story', 'Genre', 'Views', 'Chapters', 'Published'].map(col => (
                            <th key={col} className={`pb-3 text-left text-[10px] font-bold uppercase tracking-widest ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-transparent">
                        {myStories.map((story) => (
                          <tr key={story._id} className={`group transition-colors ${darkMode ? 'hover:bg-slate-700/30' : 'hover:bg-purple-50/50'}`}>
                            <td className="py-3 pr-4">
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-8 h-10 rounded flex-shrink-0"
                                  style={{
                                    background: story.coverImage
                                      ? `url(${story.coverImage}) center/cover`
                                      : `linear-gradient(135deg, ${story.coverColor || '#7C3AED'}, #4F46E5)`,
                                  }}
                                />
                                <Link
                                  to={`/story/${story._id}`}
                                  className={`font-semibold line-clamp-1 hover:text-purple-500 transition ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}
                                >
                                  {story.title}
                                </Link>
                              </div>
                            </td>
                            <td className="py-3 pr-4">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${darkMode ? 'bg-purple-900/40 text-purple-300' : 'bg-purple-100 text-purple-700'}`}>
                                {story.genre}
                              </span>
                            </td>
                            <td className={`py-3 pr-4 font-bold ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                              {(story.views || 0).toLocaleString()}
                            </td>
                            <td className={`py-3 pr-4 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                              {story.chapterCount || 0}
                            </td>
                            <td className={`py-3 text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                              {new Date(story.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CreatorAnalytics;
