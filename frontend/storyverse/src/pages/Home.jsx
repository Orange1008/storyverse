import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import StoryCard from "../components/shared/StoryCard";
import { Link } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";
import axiosInstance from "../lib/axios";

/* ================= ANIMATION ================= */
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 }
  }
};

/* ================= SECTION TITLE ================= */
const SectionTitle = ({ title, link }) => {
  const { darkMode } = useAppStore();
  return (
    <div className="flex justify-between items-center mb-6">
      <h2 className={`text-2xl font-serif font-bold ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>
        {title}
      </h2>
      {link && (
        <Link to={link} className={`text-sm hover:underline ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
          View all →
        </Link>
      )}
    </div>
  );
};

/* ================= STORY SECTION ================= */
const StorySection = ({ stories, loading }) => {
  const { darkMode } = useAppStore();
  if (loading) {
    return (
      <div className="flex gap-4">
        {[1,2,3,4].map(i => (
          <div key={i} className={`w-36 h-56 sm:w-44 sm:h-64 rounded-xl animate-pulse ${darkMode ? 'bg-slate-800' : 'bg-gray-200'}`}></div>
        ))}
      </div>
    );
  }
  if (!stories.length) {
    return (
      <div className={`text-center py-12 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
        <p className="text-lg">No stories yet.</p>
        <Link to="/creator/editor" className="mt-3 inline-block text-purple-500 hover:underline text-sm">
          Be the first to publish one! →
        </Link>
      </div>
    );
  }
  return (
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
  );
};

/* ================= MAIN ================= */
const Home = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast, darkMode, user, continueReading } = useAppStore();

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const { data } = await axiosInstance.get('/stories');
        setStories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch stories:", err);
        addToast("Couldn't load stories. Is the backend running?", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchStories();
  }, []);

  // Split into trending (top by views) and recommended (next 4)
  const trending = stories.slice(0, 4);
  const recommended = stories.slice(4, 8);

  return (
    <div className={`relative min-h-screen px-6 md:px-12 py-10 space-y-20 overflow-hidden transition-colors ${darkMode ? 'bg-[#0f0f0f]' : 'bg-gradient-to-br from-[#F5F1E8] via-[#F8F4EC] to-[#EFE9DC]'}`}>

      {/* BACKGROUND GLOW */}
      <div className={`absolute top-0 left-0 w-[400px] h-[400px] blur-[120px] rounded-full ${darkMode ? 'bg-purple-900/40' : 'bg-purple-300/20'}`}></div>
      <div className={`absolute bottom-0 right-0 w-[400px] h-[400px] blur-[120px] rounded-full ${darkMode ? 'bg-indigo-900/40' : 'bg-yellow-200/20'}`}></div>

      {/* ================= HERO ================= */}
      <motion.section
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="grid md:grid-cols-2 gap-12 items-center relative z-10"
      >
        {/* TEXT */}
        <div>
          <p className={`text-sm uppercase tracking-widest mb-3 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
            StoryVerse AI
          </p>

          <h1 className={`text-4xl md:text-6xl font-serif font-bold leading-tight ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>
            Welcome back,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-500">
              {user?.username || "Creator"}
            </span>
            .
          </h1>

          <p className={`mt-4 max-w-md text-lg ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
            Discover infinite worlds. Write yours. Every story is free.
          </p>

          <div className="flex gap-4 mt-6">
            <Link to="/explore">
              <button className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl shadow-lg hover:scale-105 transition">
                Explore Stories
              </button>
            </Link>
            <Link to="/creator/editor">
              <button className={`px-6 py-3 border rounded-xl transition ${darkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'text-gray-700 hover:bg-gray-100 border-gray-200'}`}>
                ✍️ Write a Story
              </button>
            </Link>
          </div>
        </div>

        {/* HERO BOOK VISUAL */}
        <div className="flex justify-center">
          <div className={`w-80 h-[420px] backdrop-blur-xl rounded-3xl shadow-2xl border p-4 rotate-3 hover:rotate-0 transition duration-500 ${darkMode ? 'bg-slate-800/60 border-slate-700/40' : 'bg-white/60 border-white/40'}`}>
            <div className={`w-full h-full rounded-2xl flex items-center justify-center ${darkMode ? 'bg-gradient-to-br from-indigo-900 to-purple-800' : 'bg-gradient-to-br from-indigo-300 to-purple-200'}`}>
              <div className="text-center text-white/80 p-6">
                <div className="text-5xl mb-4">📖</div>
                <p className="font-serif text-lg font-bold">
                  {stories[0]?.title || "Your next story awaits"}
                </p>
                <p className="text-sm mt-2 opacity-70">
                  {stories[0]?.genre || "Start writing today"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ================= CONTINUE READING ================= */}
      {continueReading && (
        <motion.section
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="relative z-10"
        >
          <SectionTitle title="Continue Reading" />

          <div className={`backdrop-blur-xl rounded-3xl p-6 shadow-xl border flex flex-col md:flex-row gap-6 items-center ${darkMode ? 'bg-slate-800/70 border-slate-700/40' : 'bg-white/70 border-white/40'}`}>
            <div
              className="w-40 h-40 rounded-2xl flex-shrink-0"
              style={{ background: `linear-gradient(135deg, ${continueReading.coverColor || '#7C3AED'}, #4F46E5)` }}
            ></div>

            <div className="flex-1">
              <p className={`text-xs uppercase ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                Chapter {continueReading.chapter}
              </p>
              <h3 className={`text-2xl font-serif font-bold ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>
                {continueReading.title}
              </h3>
              <p className={`text-sm mt-1 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                {continueReading.genre}
              </p>
              <div className={`mt-4 h-2 rounded-full overflow-hidden ${darkMode ? 'bg-slate-700' : 'bg-gray-200'}`}>
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-500"
                  style={{ width: `${Math.min((continueReading.chapter / (continueReading.totalChapters || 10)) * 100, 100)}%` }}
                ></div>
              </div>
            </div>

            <Link to={`/reader/${continueReading.id}`}>
              <button className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl shadow-lg hover:scale-105 transition">
                Resume →
              </button>
            </Link>
          </div>
        </motion.section>
      )}

      {/* ================= TRENDING ================= */}
      <motion.section
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="relative z-10"
      >
        <SectionTitle title="Trending Now" link="/explore" />
        <StorySection stories={trending} loading={loading} />
      </motion.section>

      {/* ================= RECOMMENDED ================= */}
      {(recommended.length > 0 || loading) && (
        <motion.section
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="relative z-10"
        >
          <SectionTitle title="More Stories" link="/explore" />
          <StorySection stories={recommended} loading={loading} />
        </motion.section>
      )}

      {/* ================= CTA for empty state ================= */}
      {!loading && stories.length === 0 && (
        <motion.section
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="relative z-10 text-center py-20"
        >
          <p className={`text-xl font-serif font-bold mb-4 ${darkMode ? 'text-slate-200' : 'text-gray-800'}`}>
            The library is empty — be the first author! 🖊️
          </p>
          <Link to="/creator/editor">
            <button className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-4 rounded-xl shadow-lg hover:scale-105 transition text-lg">
              Write Your First Story
            </button>
          </Link>
        </motion.section>
      )}

    </div>
  );
};

export default Home;