import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import StoryCard from "../components/shared/StoryCard";
import WriterMiniCard from "../components/creator/WriterMiniCard";
import { useAppStore } from "../store/useAppStore";
import axiosInstance from "../lib/axios";

const Profile = () => {
  const { username: paramUsername } = useParams();
  const navigate = useNavigate();
  const { addToast, darkMode, user, login } = useAppStore();

  // Own profile if no username in URL, or URL username matches logged-in user
  const isOwnProfile = !paramUsername || paramUsername === user?.username;

  const [isFollowing, setIsFollowing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [myStories, setMyStories] = useState([]);
  const [storiesLoading, setStoriesLoading] = useState(true);

  // Profile data — seeded from the logged-in user for own profile
  const [profileUser, setProfileUser] = useState({
    username: user?.username || paramUsername || "Unknown",
    headline: user?.headline || "Writer, reader, and dreamer.",
    bio: user?.bio || "Exploring the spaces between imagination and reality.",
    followers: "0",
    following: "0",
    reads: "0",
  });

  // Edit form state
  const [editForm, setEditForm] = useState({
    username: profileUser.username,
    headline: profileUser.headline,
    bio: profileUser.bio,
  });

  // Fetch own stories for profile grid
  useEffect(() => {
    if (!isOwnProfile) { setStoriesLoading(false); return; }
    const fetchStories = async () => {
      try {
        const { data } = await axiosInstance.get("/auth/my-stories");
        setMyStories(Array.isArray(data) ? data : []);
      } catch {
        // silently fail
      } finally {
        setStoriesLoading(false);
      }
    };
    fetchStories();
  }, [isOwnProfile]);

  // Sync profileUser from store whenever user changes (e.g. after save)
  useEffect(() => {
    if (isOwnProfile && user) {
      setProfileUser(prev => ({
        ...prev,
        username: user.username || prev.username,
        headline: user.headline || prev.headline,
        bio: user.bio || prev.bio,
      }));
      setEditForm({
        username: user.username || "",
        headline: user.headline || "",
        bio: user.bio || "",
      });
    }
  }, [user, isOwnProfile]);

  // Save profile changes to backend
  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      const { data } = await axiosInstance.put("/auth/profile", {
        headline: editForm.headline,
        bio: editForm.bio,
      });
      // Update Zustand store so navbar immediately reflects the change
      login({ ...user, headline: data.headline, bio: data.bio });
      setProfileUser(prev => ({
        ...prev,
        headline: data.headline,
        bio: data.bio,
      }));
      setIsEditing(false);
      addToast("Profile updated! ✨", "success");
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to save profile.", "error");
    } finally {
      setSavingProfile(false);
    }
  };

  const displayName = isOwnProfile ? (user?.username || "You") : (paramUsername || "Unknown");
  const avatarLetter = displayName[0]?.toUpperCase() || "?";

  const followingWriters = [
    { username: 'ElenaVance', headline: 'Neon-noir storyteller', followers: '24.8k', works: 18 },
    { username: 'LunaQuill', headline: 'Dreamweaver', followers: '18.2k', works: 12 },
    { username: 'AstridVale', headline: 'Future mythmaker', followers: '9.5k', works: 9 },
  ];

  return (
    <div className={`min-h-screen px-6 md:px-12 py-10 space-y-10 font-serif transition-colors ${darkMode ? 'bg-[#0f0f0f]' : 'bg-[#faf7f2]'}`}>

      {/* ===== PROFILE HEADER CARD ===== */}
      <div className={`relative rounded-3xl overflow-hidden shadow-2xl border ${darkMode ? 'border-slate-800 bg-slate-900/90' : 'border-black/5 bg-white/90'}`}>
        {/* Banner */}
        <div className="h-44 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500" />

        <div className={`px-6 sm:px-8 pb-10 pt-20 md:pt-16 relative ${darkMode ? 'bg-slate-900/90' : 'bg-white/90'}`}>
          {/* Avatar */}
          <div className="absolute -top-12 left-6 md:left-8 flex h-24 w-24 md:h-28 md:w-28 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 border-4 border-white text-3xl md:text-4xl font-bold text-white shadow-xl select-none">
            {avatarLetter}
          </div>

          <div className="mt-4 md:mt-0 md:ml-40 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl flex-1">

              {isEditing ? (
                /* ===== EDIT FORM ===== */
                <div className="space-y-4">
                  {/* Username (read-only in edit — can't change username) */}
                  <div>
                    <label className={`text-xs font-bold uppercase tracking-widest mb-1 block ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Username (cannot be changed)
                    </label>
                    <input
                      value={displayName}
                      disabled
                      className={`w-full text-lg font-bold rounded-xl px-4 py-3 border opacity-50 cursor-not-allowed ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-500'}`}
                    />
                  </div>

                  <div>
                    <label className={`text-xs font-bold uppercase tracking-widest mb-1 block ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Headline</label>
                    <input
                      value={editForm.headline}
                      onChange={e => setEditForm({ ...editForm, headline: e.target.value })}
                      className={`w-full text-lg rounded-xl px-4 py-3 border outline-none focus:ring-2 focus:ring-purple-400/50 ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500' : 'bg-white border-slate-200 text-slate-900'}`}
                      placeholder="Short intro shown on your profile"
                    />
                  </div>

                  <div>
                    <label className={`text-xs font-bold uppercase tracking-widest mb-1 block ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Bio</label>
                    <textarea
                      value={editForm.bio}
                      onChange={e => setEditForm({ ...editForm, bio: e.target.value })}
                      className={`w-full text-base rounded-xl px-4 py-3 border outline-none focus:ring-2 focus:ring-purple-400/50 min-h-[120px] resize-none ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500' : 'bg-white border-slate-200 text-slate-900'}`}
                      placeholder="Tell readers about yourself..."
                    />
                  </div>

                  <div className="flex gap-3 mt-2">
                    <button
                      onClick={handleSaveProfile}
                      disabled={savingProfile}
                      className="rounded-full bg-purple-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:opacity-60 flex items-center gap-2"
                    >
                      {savingProfile ? (
                        <><span className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
                      ) : 'Save Changes'}
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className={`rounded-full border px-6 py-2.5 text-sm font-semibold transition ${darkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 bg-slate-100 text-slate-900 hover:bg-slate-200'}`}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                /* ===== VIEW MODE ===== */
                <>
                  <h1 className={`text-4xl md:text-5xl font-bold ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                    {displayName}
                  </h1>
                  {profileUser.headline && (
                    <p className={`mt-2 text-lg font-medium ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                      {profileUser.headline}
                    </p>
                  )}
                  {profileUser.bio && (
                    <p className={`mt-3 text-lg leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      {profileUser.bio}
                    </p>
                  )}
                  <div className={`mt-6 flex flex-wrap gap-6 text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    <span><strong className={darkMode ? 'text-slate-100' : 'text-slate-900'}>{myStories.length}</strong> Stories</span>
                    <span><strong className={darkMode ? 'text-slate-100' : 'text-slate-900'}>{profileUser.followers}</strong> Followers</span>
                    <span><strong className={darkMode ? 'text-slate-100' : 'text-slate-900'}>{profileUser.following}</strong> Following</span>
                  </div>
                </>
              )}
            </div>

            {/* ===== ACTION BUTTONS ===== */}
            {!isEditing && (
              <div className="flex flex-wrap gap-3">
                {isOwnProfile ? (
                  <>
                    <button
                      onClick={() => {
                        setEditForm({ headline: profileUser.headline, bio: profileUser.bio });
                        setIsEditing(true);
                      }}
                      className={`rounded-full border px-6 py-2.5 text-sm font-semibold transition shadow-sm ${darkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 bg-slate-100 text-slate-900 hover:bg-slate-200'}`}
                    >
                      ✏️ Edit Profile
                    </button>
                    <button
                      onClick={() => navigate('/creator/dashboard')}
                      className="rounded-full bg-purple-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-700 shadow-lg shadow-purple-500/20"
                    >
                      ✍️ Creator Studio
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setIsFollowing(!isFollowing);
                      addToast(isFollowing ? `Unfollowed ${displayName}` : `Following ${displayName}`, "success");
                    }}
                    className={`rounded-full px-6 py-2.5 text-sm font-semibold transition ${
                      isFollowing
                        ? `${darkMode ? 'bg-slate-700 text-slate-200' : 'bg-slate-200 text-slate-900'}`
                        : 'bg-purple-600 text-white hover:bg-purple-700'
                    }`}
                  >
                    {isFollowing ? '✓ Following' : 'Follow'}
                  </button>
                )}
                <button
                  onClick={() => addToast("Messaging system coming soon!", "default")}
                  className={`rounded-full border px-6 py-2.5 text-sm font-semibold transition ${darkMode ? 'border-purple-700/50 bg-purple-900/20 text-purple-300 hover:bg-purple-900/40' : 'border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100'}`}
                >
                  💬 Message
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===== OWN PROFILE CONTENT ===== */}
      {isOwnProfile ? (
        <>
          {/* Following + Activity grid */}
          <section className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
            <div className={`rounded-3xl border p-8 shadow-lg ${darkMode ? 'border-slate-800 bg-slate-900/90' : 'border-black/5 bg-white/90'}`}>
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>Writers You Follow</h2>
              <p className={`mt-2 text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Stay connected to your favourite authors.</p>
              <div className="mt-6 space-y-4">
                {followingWriters.map((writer) => (
                  <WriterMiniCard key={writer.username} {...writer} />
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className={`rounded-3xl border p-8 shadow-lg ${darkMode ? 'border-slate-800 bg-slate-900/90' : 'border-black/5 bg-white/90'}`}>
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>Recent Activity</h2>
                <div className={`mt-6 space-y-3 text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  <p>• You published <strong>{myStories[0]?.title || 'your first story'}</strong> to StoryVerse.</p>
                  <p>• 8 followed writers published new chapters in the last 24 hours.</p>
                  <p>• Your reading list gained 3 new featured pieces.</p>
                </div>
              </div>

              <div className={`rounded-3xl border p-8 shadow-lg ${darkMode ? 'border-slate-800 bg-slate-900/90' : 'border-black/5 bg-white/90'}`}>
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>Suggested Creators</h2>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {followingWriters.map((writer) => (
                    <Link
                      to={`/profile/${writer.username}`}
                      key={writer.username}
                      className={`rounded-2xl border p-4 transition-all block group hover:-translate-y-1 ${darkMode ? 'border-slate-700 bg-slate-800/50 hover:bg-slate-800 hover:shadow-md' : 'border-slate-200 bg-slate-50 hover:bg-white hover:shadow-md'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {writer.username[0].toUpperCase()}
                        </div>
                        <div>
                          <h3 className={`font-semibold text-sm transition-colors ${darkMode ? 'text-slate-100 group-hover:text-purple-400' : 'text-slate-900 group-hover:text-purple-600'}`}>{writer.username}</h3>
                          <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{writer.headline}</p>
                        </div>
                      </div>
                      <p className={`mt-2 text-[11px] ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{writer.followers} followers • {writer.works} works</p>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* My Published Stories */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm uppercase tracking-[0.2em] ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>Your stories</p>
                <h2 className={`text-3xl font-bold ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>Published & saved</h2>
              </div>
              <Link to="/library">
                <button className={`rounded-full border px-6 py-2.5 text-sm font-semibold transition ${darkMode ? 'border-purple-700/50 bg-purple-900/20 text-purple-300 hover:bg-purple-900/40' : 'border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100'}`}>
                  Manage library
                </button>
              </Link>
            </div>

            {storiesLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[1,2,3,4].map(i => (
                  <div key={i} className={`w-36 h-56 sm:w-44 sm:h-64 mx-auto rounded-xl animate-pulse ${darkMode ? 'bg-slate-800' : 'bg-gray-200'}`} />
                ))}
              </div>
            ) : myStories.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {myStories.map((story) => (
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
              <div className={`text-center py-16 rounded-3xl border ${darkMode ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-white/60'}`}>
                <p className="text-4xl mb-3">✍️</p>
                <p className={`font-serif text-lg font-bold ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>No stories published yet.</p>
                <button
                  onClick={() => navigate('/creator/editor')}
                  className="mt-4 bg-purple-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-purple-700 transition"
                >
                  Write Your First Story
                </button>
              </div>
            )}
          </div>
        </>
      ) : (
        /* ===== OTHER USER PROFILE ===== */
        <section className="grid gap-6 lg:grid-cols-[0.95fr_0.7fr]">
          <div className={`rounded-3xl border p-8 shadow-lg ${darkMode ? 'border-slate-800 bg-slate-900/90' : 'border-black/5 bg-white/90'}`}>
            <div className="space-y-6">
              <div>
                <p className={`text-sm uppercase tracking-[0.2em] ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>About the writer</p>
                <h2 className={`mt-3 text-3xl font-bold ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                  {displayName}'s World
                </h2>
                <p className={`mt-4 leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  {profileUser.bio || profileUser.headline || "This author hasn't written a bio yet."}
                </p>
              </div>
              <div className={`grid gap-3 grid-cols-3 text-center text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                {[
                  { label: 'Stories', value: profileUser.stories || '0' },
                  { label: 'Followers', value: profileUser.followers || '0' },
                  { label: 'Reads', value: profileUser.reads || '0' },
                ].map(stat => (
                  <div key={stat.label} className={`rounded-2xl p-4 ${darkMode ? 'bg-purple-900/20' : 'bg-purple-50'}`}>
                    <p className={`text-xl font-semibold ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>{stat.value}</p>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500 mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className={`rounded-3xl border p-8 shadow-lg ${darkMode ? 'border-slate-800 bg-slate-900/90' : 'border-black/5 bg-white/90'}`}>
              <h3 className={`text-xl font-bold ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>Writer Stats</h3>
              <div className={`mt-4 space-y-3 text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                {[
                  { label: 'Average completion', value: '78%' },
                  { label: 'Response time', value: '2h 14m' },
                  { label: 'Featured in', value: 'Weekly Spotlight' },
                ].map(item => (
                  <div key={item.label} className={`flex justify-between rounded-xl px-4 py-3 ${darkMode ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                    <span>{item.label}</span>
                    <strong className={darkMode ? 'text-slate-200' : 'text-slate-800'}>{item.value}</strong>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </section>
      )}
    </div>
  );
};

export default Profile;
