import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import StoryCard from "../components/shared/StoryCard";
import { useAppStore } from "../store/useAppStore";
import axiosInstance from "../lib/axios";

/* ANIMATION */
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const StoryDetail = () => {
  const { id } = useParams();
  const { addToast, user, darkMode } = useAppStore();

  const [story, setStory] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [relatedStories, setRelatedStories] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [likeLoading, setLikeLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch story + chapters + bookmark status
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [storyRes, chaptersRes, bookmarkRes] = await Promise.all([
          axiosInstance.get(`/stories/${id}`),
          axiosInstance.get(`/chapters/${id}`),
          user ? axiosInstance.get(`/bookmarks/check/${id}`) : Promise.resolve({ data: { isBookmarked: false } }),
        ]);
        setStory(storyRes.data);
        setChapters(chaptersRes.data || []);
        setIsBookmarked(bookmarkRes.data.isBookmarked);
        
        setLikesCount(storyRes.data.likes?.length || 0);
        if (user) {
          setIsLiked(storyRes.data.likes?.includes(user._id));
        }

        // Fetch related stories (same genre)
        if (storyRes.data.genre) {
          const relatedRes = await axiosInstance.get('/stories', { params: { genre: storyRes.data.genre } });
          setRelatedStories((relatedRes.data || []).filter(s => s._id !== id).slice(0, 4));
        }
      } catch (err) {
        console.error("Failed to load story:", err);
        addToast("Failed to load story.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id, user]);

  const toggleBookmark = useCallback(async () => {
    if (!user) {
      addToast("Please log in to save stories.", "error");
      return;
    }
    setBookmarkLoading(true);
    try {
      if (isBookmarked) {
        await axiosInstance.delete(`/bookmarks/${id}`);
        setIsBookmarked(false);
        addToast("Removed from Library", "default");
      } else {
        await axiosInstance.post(`/bookmarks/${id}`);
        setIsBookmarked(true);
        addToast("Saved to Library 🔖", "success");
      }
    } catch (err) {
      addToast("Couldn't update bookmark.", "error");
    } finally {
      setBookmarkLoading(false);
    }
  }, [id, isBookmarked, user]);

  const toggleLike = useCallback(async () => {
    if (!user) {
      addToast("Please log in to like stories.", "error");
      return;
    }
    setLikeLoading(true);
    try {
      const { data } = await axiosInstance.post(`/stories/${id}/like`);
      setIsLiked(data.isLiked);
      setLikesCount(data.likes);
    } catch (err) {
      addToast("Failed to like story.", "error");
    } finally {
      setLikeLoading(false);
    }
  }, [id, user]);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-[#0f0f0f]' : 'bg-[#faf7f2]'}`}>
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center gap-4 ${darkMode ? 'bg-[#0f0f0f] text-slate-100' : 'bg-[#faf7f2] text-gray-900'}`}>
        <p className="text-2xl font-serif">Story not found.</p>
        <Link to="/explore" className="text-purple-500 hover:underline">← Back to Explore</Link>
      </div>
    );
  }

  const authorName = story.authorId?.username || "Unknown Author";
  const coverGradient = story.coverColor
    ? `linear-gradient(135deg, ${story.coverColor}, #4F46E5)`
    : 'linear-gradient(135deg, #a78bfa, #4F46E5)';

  return (
    <div className={`min-h-screen px-6 md:px-12 py-10 ${darkMode ? 'bg-[#0f0f0f]' : 'bg-[#faf7f2]'}`}>

      {/* ================= MAIN GRID ================= */}
      <div className="grid md:grid-cols-12 gap-12">

        {/* ================= LEFT: COVER ================= */}
        <div className="md:col-span-5 relative md:sticky top-24 h-fit pb-8 md:pb-0 z-10">
          <div
            className="aspect-[3/4] rounded-2xl shadow-2xl overflow-hidden"
            style={story.coverImage
              ? { backgroundImage: `url(${story.coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
              : { background: coverGradient }
            }
          >
            {!story.coverImage && (
              <div className="w-full h-full flex items-end p-6">
                <div className="text-white">
                  <p className="text-xs uppercase tracking-widest opacity-70 mb-1">{story.genre}</p>
                  <h2 className="text-2xl font-serif font-bold">{story.title}</h2>
                </div>
              </div>
            )}
          </div>

          {/* BUTTONS */}
          <div className="mt-6 flex gap-4">
            {chapters.length > 0 ? (
              <Link to={`/reader/${id}`} className="flex-1">
                <button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-xl font-semibold shadow-lg hover:scale-105 transition">
                  ▶ Start Reading — Free
                </button>
              </Link>
            ) : (
              <div className="flex-1">
                <button disabled className="w-full bg-slate-400 text-white py-4 rounded-xl font-semibold opacity-60 cursor-not-allowed">
                  No Chapters Yet
                </button>
              </div>
            )}

            <button
              onClick={toggleBookmark}
              disabled={bookmarkLoading}
              className={`p-4 border rounded-xl hover:scale-105 transition ${
                isBookmarked
                  ? `${darkMode ? 'bg-purple-900/60 border-purple-500' : 'bg-purple-100 border-purple-300'}`
                  : `${darkMode ? 'border-slate-700 hover:bg-slate-800' : 'border-gray-200 hover:bg-gray-100'}`
              }`}
            >
              <span className={isBookmarked ? 'opacity-100' : 'opacity-60'}>{bookmarkLoading ? '...' : '🔖'}</span>
            </button>

            <button
              onClick={toggleLike}
              disabled={likeLoading}
              className={`flex-1 flex items-center justify-center gap-2 border rounded-xl hover:scale-105 transition font-semibold ${
                isLiked
                  ? `${darkMode ? 'bg-rose-900/40 border-rose-500 text-rose-400' : 'bg-rose-50 border-rose-300 text-rose-600'}`
                  : `${darkMode ? 'border-slate-700 hover:bg-slate-800 text-slate-300' : 'border-gray-200 hover:bg-gray-100 text-gray-700'}`
              }`}
            >
              <span className={isLiked ? 'opacity-100 text-rose-500' : 'opacity-60'}>{likeLoading ? '...' : '❤️'}</span>
              <span>{likesCount} {likesCount === 1 ? 'Like' : 'Likes'}</span>
            </button>
          </div>
        </div>

        {/* ================= RIGHT SIDE ================= */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="md:col-span-7 space-y-10"
        >
          {/* GENRE TAG */}
          <div className="flex gap-3">
            <span className={`px-3 py-1 text-xs rounded-full ${darkMode ? 'bg-purple-900/60 text-purple-300' : 'bg-purple-200 text-purple-700'}`}>
              {story.genre}
            </span>
            {story.tags?.map(tag => (
              <span key={tag} className={`px-3 py-1 text-xs rounded-full ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-gray-200 text-gray-600'}`}>
                {tag}
              </span>
            ))}
          </div>

          {/* TITLE */}
          <h1 className={`text-4xl md:text-5xl font-serif font-bold leading-tight ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>
            {story.title}
          </h1>

          {/* AUTHOR */}
          <div className="flex items-center justify-between">
            <Link to={`/profile/${authorName}`} className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-full overflow-hidden"
                style={story.authorId?.profileImage
                  ? { backgroundImage: `url(${story.authorId.profileImage})`, backgroundSize: 'cover' }
                  : { background: coverGradient }
                }
              ></div>
              <div>
                <p className={`font-semibold ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>{authorName}</p>
                <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Author</p>
              </div>
            </Link>

            <button
              onClick={() => {
                setIsFollowing(!isFollowing);
                addToast(isFollowing ? `Unfollowed ${authorName}` : `Following ${authorName}`, "success");
              }}
              className={`px-5 py-2 rounded-full font-semibold transition ${
                isFollowing
                  ? `${darkMode ? 'bg-slate-700 text-slate-200' : 'bg-gray-200 text-gray-800'}`
                  : "bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
              }`}
            >
              {isFollowing ? "Following" : "Follow"}
            </button>
          </div>

          {/* STATS */}
          <div className={`flex gap-6 text-sm ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>
            <span>👁 {story.views?.toLocaleString() || 0} views</span>
            <span>⭐ {story.rating > 0 ? story.rating.toFixed(1) : 'New'}</span>
            <span>📖 {chapters.length} chapter{chapters.length !== 1 ? 's' : ''}</span>
          </div>

          {/* DESCRIPTION */}
          <p className={`text-lg leading-relaxed max-w-2xl ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
            {story.description}
          </p>

          {/* ================= CHAPTERS ================= */}
          <div>
            <h2 className={`text-2xl font-serif font-bold mb-6 ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>
              Chapters
            </h2>

            {chapters.length === 0 ? (
              <div className={`text-center py-8 rounded-xl border ${darkMode ? 'border-slate-700 text-slate-400' : 'border-gray-200 text-gray-500'}`}>
                <p>No chapters published yet. Check back soon!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {chapters.map((ch, idx) => (
                  <Link
                    key={ch._id}
                    to={`/reader/${id}?chapter=${idx}`}
                    className={`flex justify-between items-center p-5 rounded-xl border hover:scale-[1.02] transition ${darkMode ? 'bg-slate-800/70 border-slate-700 hover:border-purple-500' : 'bg-white/70 backdrop-blur shadow hover:shadow-md'}`}
                  >
                    <div>
                      <p className={`font-semibold ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>
                        Chapter {idx + 1}: {ch.title}
                      </p>
                      <p className={`text-sm mt-0.5 text-green-500 font-medium`}>✓ Free</p>
                    </div>
                    <span className="text-purple-500">▶</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* ================= COMMENTS (Redirect to Reader) ================= */}
          <div className="mt-10">
            <div className={`p-8 rounded-2xl border text-center ${darkMode ? 'bg-slate-800/40 border-slate-700' : 'bg-purple-50/50 border-purple-100'}`}>
              <h2 className={`text-2xl font-serif font-bold mb-3 ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>
                Discussion
              </h2>
              <p className={`mb-6 ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>Read the chapters to view and add comments!</p>
              {chapters.length > 0 && (
                 <Link to={`/reader/${id}`} className="inline-block bg-purple-600 text-white px-8 py-3 rounded-xl font-bold hover:scale-105 transition shadow-lg shadow-purple-500/30">
                   Start Reading
                 </Link>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* ================= RELATED ================= */}
      {relatedStories.length > 0 && (
        <div className="mt-24">
          <h2 className={`text-2xl font-serif font-bold mb-6 ${darkMode ? 'text-slate-100' : 'text-gray-900'}`}>
            More {story.genre} Stories
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedStories.map((s) => (
              <StoryCard
                key={s._id}
                id={s._id}
                title={s.title}
                genre={s.genre}
                views={s.views}
                rating={s.rating > 0 ? s.rating.toFixed(1) : 'New'}
                coverImage={s.coverImage}
                coverColor={s.coverColor}
              />
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default StoryDetail;