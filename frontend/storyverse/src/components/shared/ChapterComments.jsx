import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import axiosInstance from '../../lib/axios';

const ChapterComments = ({ chapterId, isDark }) => {
  const { user, addToast } = useAppStore();
  const [comments, setComments] = useState([]);
  const [newText, setNewText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!chapterId) return;
    const fetchComments = async () => {
      setLoading(true);
      try {
        const { data } = await axiosInstance.get(`/comments/${chapterId}`);
        setComments(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
  }, [chapterId]);

  const handlePost = async () => {
    if (!user) {
      addToast('Please login to comment', 'error');
      return;
    }
    if (!newText.trim()) return;

    try {
      const { data } = await axiosInstance.post('/comments', {
        chapterId,
        content: newText,
      });
      setComments([data, ...comments]);
      setNewText('');
      addToast('Comment posted!', 'success');
    } catch (err) {
      addToast('Failed to post comment', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/comments/${id}`);
      setComments(comments.filter(c => c._id !== id));
      addToast('Comment deleted', 'default');
    } catch (err) {
      addToast('Failed to delete comment', 'error');
    }
  };

  return (
    <div className={`mt-12 pt-8 border-t ${isDark ? 'border-slate-800 text-slate-200' : 'border-slate-200 text-slate-800'}`}>
      <h3 className="text-xl font-bold font-serif mb-6">Discussion ({comments.length})</h3>

      {/* Input */}
      <div className="flex gap-3 mb-8">
        {user ? (
          <div className="w-10 h-10 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold flex-shrink-0">
            {user.username?.[0]?.toUpperCase()}
          </div>
        ) : (
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0 ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
            ?
          </div>
        )}
        <div className="flex-1 flex flex-col gap-2">
          <textarea
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder={user ? "What are your thoughts on this chapter?" : "Login to join the discussion"}
            disabled={!user}
            className={`w-full p-3 rounded-xl border resize-none focus:ring-2 outline-none transition ${
              isDark ? 'bg-slate-800 border-slate-700 focus:ring-purple-500/50' : 'bg-slate-50 border-slate-200 focus:ring-purple-200'
            }`}
            rows={3}
          />
          <div className="flex justify-end">
            <button
              onClick={handlePost}
              disabled={!user || !newText.trim()}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-2 rounded-lg font-bold text-sm disabled:opacity-50 transition"
            >
              Post
            </button>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center opacity-50">Loading comments...</div>
        ) : comments.length === 0 ? (
          <div className="text-center opacity-50 py-4">No comments yet. Be the first to share your thoughts!</div>
        ) : (
          comments.map((comment) => (
            <div key={comment._id} className={`flex gap-3 p-4 rounded-xl border ${isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}>
              <div
                className="w-8 h-8 rounded-full bg-cover bg-center flex-shrink-0"
                style={{ backgroundImage: `url(${comment.authorId?.profileImage || `https://ui-avatars.com/api/?name=${comment.authorId?.username}&background=random`})` }}
              />
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <span className={`font-semibold text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {comment.authorId?.username || 'Unknown User'}
                  </span>
                  <span className="text-xs opacity-40">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{comment.content}</p>
                
                {user?._id === comment.authorId?._id && (
                  <button 
                    onClick={() => handleDelete(comment._id)}
                    className="text-xs text-red-400 hover:text-red-500 mt-2 hover:underline"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ChapterComments;
