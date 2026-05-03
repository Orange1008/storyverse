import React, { useState, useEffect, useMemo } from "react";
import StoryCard from "../components/shared/StoryCard";
import { useAppStore } from "../store/useAppStore";
import axiosInstance from "../lib/axios";

const GENRES = [
  { label: "All",        emoji: "✨" },
  { label: "Fantasy",    emoji: "🧙" },
  { label: "Sci-Fi",     emoji: "🚀" },
  { label: "Romance",    emoji: "💕" },
  { label: "Thriller",   emoji: "🔪" },
  { label: "Mystery",    emoji: "🕵️" },
  { label: "Drama",      emoji: "🎭" },
  { label: "Historical", emoji: "🏛️" },
  { label: "Horror",     emoji: "👻" },
  { label: "Adventure",  emoji: "🗺️" },
  { label: "Other",      emoji: "📚" },
];

const SORT_OPTIONS = [
  { label: "All",      key: "" },
  { label: "Trending", key: "trending" },
  { label: "Newest",   key: "newest" },
];

const Explore = () => {
  const [activeGenre, setActiveGenre] = useState("All");
  const [sortMode, setSortMode] = useState("");
  const { darkMode } = useAppStore();
  const [allStories, setAllStories] = useState([]);   // raw fetch — full list
  const [loading, setLoading] = useState(true);

  // Fetch all stories once (or when genre changes)
  useEffect(() => {
    const fetchStories = async () => {
      setLoading(true);
      try {
        const params = activeGenre !== "All" ? { genre: activeGenre } : {};
        const { data } = await axiosInstance.get('/stories', { params });
        setAllStories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch stories:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStories();
  }, [activeGenre]);   // only refetch on genre change

  // Client-side sort — instant, no extra API call
  const stories = useMemo(() => {
    const list = [...allStories];
    if (sortMode === "trending") {
      return list.sort((a, b) => (b.views || 0) - (a.views || 0));
    }
    if (sortMode === "newest") {
      return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    return list; // default (already sorted by backend)
  }, [allStories, sortMode]);

  return (
    <div className={`min-h-screen px-6 md:px-12 py-10 space-y-8 transition-colors ${darkMode ? 'bg-[#0f0f0f]' : 'bg-[#F5F1E8]'}`}>

      {/* HEADER */}
      <div>
        <h1 className={`text-4xl font-serif font-bold ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>
          Explore Stories
        </h1>
        <p className={`mt-2 ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
          Discover new worlds — all stories are free to read.
        </p>
      </div>

      {/* FILTER CONTROLS */}
      <div className="space-y-3">

        {/* Genre pills — scrolls horizontally on mobile */}
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {GENRES.map(({ label, emoji }) => (
            <button
              key={label}
              onClick={() => setActiveGenre(label)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full transition text-sm font-medium whitespace-nowrap ${
                activeGenre === label
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-500/30"
                  : darkMode
                    ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                    : "bg-white text-gray-700 hover:bg-purple-50 shadow-sm border border-gray-100"
              }`}
            >
              <span>{emoji}</span> {label}
            </button>
          ))}
        </div>

        {/* Sort row + result count */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1.5">
            {SORT_OPTIONS.map(({ label, key }) => (
              <button
                key={key}
                onClick={() => setSortMode(key)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                  sortMode === key
                    ? "bg-slate-700 text-white"
                    : darkMode
                      ? "text-slate-500 hover:text-slate-300 hover:bg-slate-800"
                      : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          {!loading && (
            <span className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
              {stories.length} {stories.length === 1 ? 'story' : 'stories'}
              {activeGenre !== "All" ? ` in ${activeGenre}` : ''}
            </span>
          )}
        </div>
      </div>

      {/* GRID */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4,5,6,7,8].map(i => (
            <div key={i} className={`w-36 h-56 sm:w-44 sm:h-64 mx-auto rounded-xl animate-pulse ${darkMode ? 'bg-slate-800' : 'bg-gray-200'}`} />
          ))}
        </div>
      ) : stories.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stories.map((story) => (
            <StoryCard
              key={story._id}
              id={story._id}
              title={story.title}
              genre={story.genre}
              views={story.views}
              rating={story.rating > 0 ? story.rating.toFixed(1) : 'New'}
              coverImage={story.coverImage}
              coverColor={story.coverColor}
            />
          ))}
        </div>
      ) : (
        <div className={`text-center py-20 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          <p className="text-4xl mb-4">📭</p>
          <p className="text-xl font-medium">
            No stories found{activeGenre !== "All" ? ` in ${activeGenre}` : ""}.
          </p>
          <p className="mt-2 text-sm">Be the first to publish in this genre!</p>
        </div>
      )}

    </div>
  );
};

export default Explore;