import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Heart } from "lucide-react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";
import axiosInstance from "../lib/axios";
import ChapterComments from "../components/shared/ChapterComments";

const Reader = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, setContinueReading, setProgress, progress, addToast } = useAppStore();

  const [fontSize, setFontSize]       = useState(20);
  const [theme, setTheme]             = useState("light");
  const [story, setStory]             = useState(null);
  const [chapters, setChapters]       = useState([]);
  const [chapterIndex, setChapterIndex] = useState(
    Number(searchParams.get('chapter')) || Number(progress[id]) || 0
  );
  const [loading, setLoading]         = useState(true);

  // Like state
  const [liked, setLiked]             = useState(false);
  const [likeCount, setLikeCount]     = useState(0);
  const [likeBounce, setLikeBounce]   = useState(false);

  // ── Fetch story + chapters ──────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [storyRes, chaptersRes] = await Promise.all([
          axiosInstance.get(`/stories/${id}`),
          axiosInstance.get(`/chapters/${id}`),
        ]);
        const s = storyRes.data;
        setStory(s);
        setChapters(chaptersRes.data || []);
        setLikeCount(s.likes?.length || 0);
        setLiked(user ? s.likes?.includes(user._id) : false);
      } catch (err) {
        console.error("Failed to load reader:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, user]);

  // ── Track progress ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!story || chapters.length === 0) return;
    setProgress(id, chapterIndex);
    setContinueReading({
      id,
      title: story.title,
      genre: story.genre,
      coverColor: story.coverColor,
      chapter: chapterIndex + 1,
      totalChapters: chapters.length,
    });
  }, [chapterIndex, story, chapters]);

  // ── Like handler ────────────────────────────────────────────────────────
  const handleLike = useCallback(async () => {
    if (!user) { addToast('Login to like stories ❤️', 'error'); return; }
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikeCount(c => wasLiked ? c - 1 : c + 1);
    setLikeBounce(true);
    setTimeout(() => setLikeBounce(false), 300);
    try {
      const { data } = await axiosInstance.post(`/stories/${id}/like`);
      setLikeCount(data.likes);
      setLiked(data.isLiked);
    } catch {
      setLiked(wasLiked);
      setLikeCount(c => wasLiked ? c + 1 : c - 1);
      addToast('Failed to update like', 'error');
    }
  }, [user, liked, id, addToast]);

  const currentChapter = chapters[chapterIndex];
  const isDark = theme === 'dark';

  const next = () => {
    if (chapterIndex < chapters.length - 1) {
      setChapterIndex(c => c + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prev = () => {
    if (chapterIndex > 0) {
      setChapterIndex(c => c - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-[#0f0f0f]' : 'bg-[#faf7f2]'}`}>
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500" />
      </div>
    );
  }

  if (!loading && chapters.length === 0) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center gap-6 px-6 ${isDark ? 'bg-[#0f0f0f] text-gray-200' : 'bg-[#faf7f2] text-gray-900'}`}>
        <div className="text-6xl">📭</div>
        <h2 className="text-2xl font-serif font-bold">No chapters yet</h2>
        <p className="text-gray-500 text-center">The author hasn't published any chapters yet. Check back soon!</p>
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-purple-600 hover:underline">
          <ArrowLeft size={16} /> Go Back
        </button>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-[#0f0f0f] text-gray-200' : 'bg-[#faf7f2] text-gray-900'}`}>

      {/* Progress bar */}
      <div className="fixed top-0 left-0 w-full h-1 z-[999]">
        <div
          className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 transition-all duration-500"
          style={{ width: `${chapters.length > 0 ? ((chapterIndex + 1) / chapters.length) * 100 : 0}%` }}
        />
      </div>

      {/* Toolbar */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-2xl">
        <div className={`backdrop-blur-xl shadow rounded-full px-5 py-2.5 flex justify-between items-center gap-3 ${
          isDark ? 'bg-gray-800/90 text-gray-200 shadow-black/40' : 'bg-white/80 text-gray-900 shadow-gray-200'
        }`}>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="hover:opacity-70 transition p-1">
              <ArrowLeft size={18} />
            </button>
            <button onClick={() => setFontSize(f => Math.max(16, f - 2))} className="text-sm font-bold">A-</button>
            <button onClick={() => setFontSize(f => Math.min(28, f + 2))} className="text-sm font-bold">A+</button>
          </div>

          <div className="hidden sm:flex items-center flex-1 justify-center">
            <select
              value={chapterIndex}
              onChange={(e) => { setChapterIndex(Number(e.target.value)); window.scrollTo(0, 0); }}
              className={`text-xs rounded-lg px-2 py-1.5 border outline-none max-w-[180px] ${
                isDark ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-200 text-gray-800'
              }`}
            >
              {chapters.map((ch, i) => (
                <option key={ch._id} value={i}>Ch. {i + 1}: {ch.title}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => setTheme("light")} className="hover:scale-110 transition text-base">☀️</button>
            <button onClick={() => setTheme("dark")} className="hover:scale-110 transition text-base">🌙</button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="pt-28 pb-36 px-6 flex justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={chapterIndex}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35 }}
            className="max-w-2xl w-full"
            style={{ fontSize: `${fontSize}px`, lineHeight: '1.9' }}
          >
            {/* Chapter header */}
            <div className="mb-8">
              <p className="text-sm text-purple-500 uppercase tracking-widest font-semibold">
                {story?.title} — Chapter {chapterIndex + 1} of {chapters.length}
              </p>
              <h1 className="text-3xl sm:text-4xl font-serif font-bold mt-2">
                {currentChapter?.title || `Chapter ${chapterIndex + 1}`}
              </h1>
              <p className={`text-sm mt-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                by {story?.authorId?.username || 'Unknown'} · Free to read
              </p>
            </div>

            {/* Chapter content */}
            <div
              className="font-serif leading-loose chapter-content-html"
              dangerouslySetInnerHTML={{ __html: currentChapter?.content || 'Loading content...' }}
            />

            {/* Comments */}
            {currentChapter?._id && (
              <div id="comments-section" className="mt-12">
                <ChapterComments chapterId={currentChapter._id} isDark={isDark} />
              </div>
            )}

            {/* Inline chapter navigation */}
            <div className={`mt-16 pt-8 border-t flex gap-4 justify-between ${isDark ? 'border-slate-800' : 'border-gray-200'}`}>
              {chapterIndex > 0 ? (
                <button
                  onClick={prev}
                  className={`px-6 py-3 rounded-xl border font-medium transition ${isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-gray-200 text-gray-700 hover:bg-amber-50'}`}
                >
                  ← Previous Chapter
                </button>
              ) : <div />}
              {chapterIndex < chapters.length - 1 ? (
                <button
                  onClick={next}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:scale-105 transition shadow-lg"
                >
                  Next Chapter →
                </button>
              ) : (
                <div className="text-center w-full">
                  <p className="text-purple-600 font-serif text-xl font-bold">✨ You've finished this story!</p>
                  <button onClick={() => navigate('/explore')} className="mt-3 text-sm text-gray-500 hover:text-purple-600 transition">
                    Find more stories →
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Floating reaction bar */}
      <div className={`fixed bottom-20 left-1/2 -translate-x-1/2 backdrop-blur-xl px-5 py-2.5 rounded-full shadow flex items-center gap-5 z-50 text-xs sm:text-sm ${
        isDark ? 'bg-gray-800/90 text-gray-300 shadow-black/40' : 'bg-white/80 text-gray-800 shadow-gray-200'
      }`}>
        {/* Like */}
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 transition-all ${likeBounce ? 'scale-125' : 'scale-100'}`}
          title={liked ? 'Unlike' : 'Like'}
        >
          <Heart
            size={18}
            className={`transition-colors duration-200 ${liked ? 'fill-red-500 text-red-500' : isDark ? 'text-gray-400' : 'text-gray-500'}`}
          />
          <span className={liked ? 'text-red-500 font-semibold' : ''}>{likeCount.toLocaleString()}</span>
        </button>

        {/* Comments */}
        <button
          onClick={() => document.getElementById('comments-section')?.scrollIntoView({ behavior: 'smooth' })}
          className="hover:scale-110 transition flex items-center gap-1.5"
        >
          <span className="text-base">💬</span>
          <span>Comments</span>
        </button>

        {/* Story detail */}
        <button onClick={() => navigate(`/story/${id}`)} className="hover:scale-110 transition" title="Story details">
          <span className="text-base">📋</span>
        </button>
      </div>

      {/* Bottom navigation */}
      <div className={`fixed bottom-0 w-full backdrop-blur border-t p-4 flex justify-between z-40 ${
        isDark ? 'bg-[#0f0f0f]/90 border-gray-800' : 'bg-[#faf7f2]/90 border-amber-100'
      }`}>
        <button onClick={prev} disabled={chapterIndex === 0} className="disabled:opacity-40 hover:text-purple-600 transition">
          ← Previous
        </button>
        <span className="text-sm opacity-40">{chapterIndex + 1} / {chapters.length}</span>
        <button onClick={next} disabled={chapterIndex >= chapters.length - 1} className="disabled:opacity-40 text-purple-600 font-semibold hover:text-purple-500 transition">
          Next →
        </button>
      </div>
    </div>
  );
};

export default Reader;