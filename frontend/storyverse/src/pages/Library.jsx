import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import StoryCard from "../components/shared/StoryCard";
import { Link } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";
import axiosInstance from "../lib/axios";

/* ANIMATION */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const Library = () => {
  const { darkMode, continueReading } = useAppStore();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        const { data } = await axiosInstance.get('/bookmarks');
        setBookmarks(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch bookmarks:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookmarks();
  }, []);

  return (
    <div className={`min-h-screen px-6 md:px-12 py-10 space-y-12 transition-colors ${darkMode ? 'bg-[#0f0f0f]' : 'bg-gradient-to-br from-[#F5F1E8] via-[#F8F4EC] to-[#EFE9DC]'}`}>

      {/* HEADER */}
      <motion.div variants={fadeUp} initial="hidden" animate="show">
        <h1 className={`text-4xl font-serif font-bold ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>
          Your Library
        </h1>
        <p className={`mt-2 ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
          Stories you've bookmarked — all free to read.
        </p>
      </motion.div>

      {/* ================= CONTINUE READING ================= */}
      {continueReading && (
        <motion.section
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className={`backdrop-blur-xl rounded-3xl p-6 shadow-xl border flex flex-col md:flex-row gap-6 items-center ${darkMode ? 'bg-slate-800/70 border-slate-700/40' : 'bg-white/70 border-white/40'}`}
        >
          <div
            className="w-40 h-40 rounded-2xl flex-shrink-0"
            style={{ background: `linear-gradient(135deg, ${continueReading.coverColor || '#7C3AED'}, #4F46E5)` }}
          ></div>

          <div className="flex-1">
            <p className={`text-xs uppercase ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
              Continue Reading
            </p>
            <h3 className={`text-2xl font-serif font-bold ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>
              {continueReading.title}
            </h3>
            <p className={`text-sm mt-1 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
              Chapter {continueReading.chapter} • {continueReading.genre}
            </p>

            {/* PROGRESS */}
            <div className={`mt-4 h-2 rounded-full overflow-hidden ${darkMode ? 'bg-slate-700' : 'bg-gray-200'}`}>
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-indigo-500"
                style={{ width: `${Math.min((continueReading.chapter / (continueReading.totalChapters || 10)) * 100, 100)}%` }}
              ></div>
            </div>
          </div>

          <Link to={`/reader/${continueReading.id}`}>
            <button className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl shadow hover:scale-105 transition">
              Resume →
            </button>
          </Link>
        </motion.section>
      )}

      {/* ================= BOOKMARKS GRID ================= */}
      <motion.section variants={fadeUp} initial="hidden" animate="show">
        <h2 className={`text-2xl font-serif font-bold mb-6 ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>
          Saved Stories
        </h2>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => (
              <div key={i} className={`w-36 h-56 sm:w-44 sm:h-64 mx-auto rounded-xl animate-pulse ${darkMode ? 'bg-slate-800' : 'bg-gray-200'}`}></div>
            ))}
          </div>
        ) : bookmarks.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {bookmarks.map((story) => (
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
            <p className="text-4xl mb-4">🔖</p>
            <p className="text-xl font-medium">No bookmarks yet.</p>
            <p className="mt-2 text-sm">Go to any story and tap the bookmark icon to save it here.</p>
            <Link to="/explore" className="mt-4 inline-block bg-purple-600 text-white px-6 py-2 rounded-xl hover:bg-purple-700 transition">
              Explore Stories →
            </Link>
          </div>
        )}
      </motion.section>

    </div>
  );
};

export default Library;