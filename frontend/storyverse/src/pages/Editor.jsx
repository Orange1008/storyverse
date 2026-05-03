import React, { useState, useEffect, useRef, useCallback } from 'react';
import AIToolbar from '../components/editor/AIToolbar';
import RichTextEditor from '../components/editor/RichTextEditor';
import { useAppStore } from '../store/useAppStore';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axiosInstance from '../lib/axios';
import { BookOpen, Upload, Plus, Trash2, ChevronDown, X, List, GripVertical } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const GENRES = ['Fantasy', 'Sci-Fi', 'Romance', 'Thriller', 'Mystery', 'Drama', 'Historical', 'Horror', 'Adventure', 'Other'];

const COVER_COLORS = [
  '#7C3AED', '#DB2777', '#D97706', '#059669',
  '#2563EB', '#DC2626', '#0F766E', '#0891B2',
  '#65A30D', '#9333EA',
];

// --- DND Sortable Item ---
const SortableChapterItem = ({ id, chapter, isActive, onClick, onRemove, isDark }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onClick}
      className={`group flex items-center justify-between px-2 py-2 mb-1 rounded-lg cursor-pointer transition text-sm select-none ${
        isActive
          ? 'bg-purple-600 text-white'
          : isDark ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-100'
      }`}
    >
      <div className="flex items-center gap-2 overflow-hidden flex-1">
        <button
          {...attributes}
          {...listeners}
          className={`cursor-grab p-1 rounded opacity-50 hover:opacity-100 transition-opacity ${isActive ? 'text-white' : ''}`}
        >
          <GripVertical size={14} />
        </button>
        <span className="truncate flex-1">{chapter.title || 'Untitled Chapter'}</span>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        className={`opacity-0 group-hover:opacity-100 p-1.5 ml-1 rounded transition flex-shrink-0 ${
          isActive ? 'text-white/70 hover:text-white' : 'text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10'
        }`}
      >
        <Trash2 size={12} />
      </button>
    </div>
  );
};

/* =====================================================
   CHAPTER LIST
===================================================== */
const ChapterList = ({
  chapters, setChapters, activeChapter, setActiveChapter,
  removeChapter, addChapter, isDark, storyId
}) => {
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (e) => setActiveId(e.active.id);

  const handleDragEnd = async (e) => {
    const { active, over } = e;
    setActiveId(null);
    if (!over || active.id === over.id) return;

    const oldIndex = chapters.findIndex((c) => c.customId === active.id);
    const newIndex = chapters.findIndex((c) => c.customId === over.id);

    // Swap locally
    const newOrder = arrayMove(chapters, oldIndex, newIndex);
    setChapters(newOrder);

    // If active chapter moved, update active pointer
    if (activeChapter === oldIndex) setActiveChapter(newIndex);
    else if (activeChapter === newIndex) setActiveChapter(oldIndex);

    // Save reorder to DB
    if (storyId) {
      try {
        const orderPayload = newOrder.map((ch, idx) => ({ _id: ch._id, order: idx + 1 })).filter(ch => ch._id);
        if (orderPayload.length > 0) {
          await axiosInstance.post('/chapters/reorder', { storyId, order: orderPayload });
        }
      } catch (err) {
        console.error('Failed to save chapter reorder', err);
      }
    }
  };

  return (
    <>
      <div className="flex-1 overflow-y-auto p-2">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <SortableContext items={chapters.map(c => c.customId)} strategy={verticalListSortingStrategy}>
            {chapters.map((ch, idx) => (
              <SortableChapterItem
                key={ch.customId}
                id={ch.customId}
                chapter={ch}
                isActive={activeChapter === idx}
                onClick={() => setActiveChapter(idx)}
                onRemove={() => removeChapter(idx)}
                isDark={isDark}
              />
            ))}
          </SortableContext>
          <DragOverlay>
            {activeId ? (
              <div className={`p-2 rounded-lg opacity-80 shadow-2xl ${isDark ? 'bg-slate-700 text-white' : 'bg-white text-slate-800'}`}>
                <div className="flex items-center gap-2">
                  <GripVertical size={14} />
                  <span className="text-sm font-medium">{chapters.find(c => c.customId === activeId)?.title}</span>
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
      <div className={`p-3 border-t flex-shrink-0 ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
        <button
          onClick={addChapter}
          className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium transition active:scale-95 ${
            isDark
              ? 'border border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white'
              : 'border border-dashed border-slate-300 text-slate-600 hover:bg-slate-100 hover:border-slate-400'
          }`}
        >
          <Plus size={16} /> Add Chapter
        </button>
      </div>
    </>
  );
};

const SettingsPanel = ({
  isDark, description, setDescription, genre, setGenre,
  coverColor, setCoverColor, coverImage, setCoverImage, tags, setTags, tagInput, setTagInput,
  title, uploading, fileInputRef, handleCoverUpload, wordCount, status, setStatus
}) => {
  const addTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (newTag && !tags.includes(newTag)) setTags([...tags, newTag]);
      setTagInput('');
    }
  };

  const removeTag = (t) => setTags(tags.filter(tag => tag !== t));

  return (
    <div className="p-4 space-y-5">
      <p className={`text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
        ⚙️ Story Settings
      </p>

      {/* Description */}
      <div>
        <label className={`text-xs font-semibold mb-1 block ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Synopsis / Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="A brief description of your masterpiece..."
          rows={4}
          className={`w-full text-sm rounded-lg px-3 py-2 border resize-none outline-none focus:ring-2 focus:ring-purple-500/40 transition ${isDark ? 'bg-slate-800 border-slate-600 text-slate-200 placeholder-slate-500' : 'bg-white border-slate-200 text-slate-800'}`}
        />
      </div>

      {/* Genre & Tags */}
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className={`text-xs font-semibold mb-1 block ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Primary Genre</label>
          <select
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            className={`w-full text-sm rounded-lg px-3 py-2 border outline-none focus:ring-2 focus:ring-purple-500/40 transition ${isDark ? 'bg-slate-800 border-slate-600 text-slate-200' : 'bg-white border-slate-200 text-slate-800'}`}
          >
            {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>

        <div className="col-span-2">
          <label className={`text-xs font-semibold mb-1 block ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Tags</label>
          <div className={`p-1.5 border rounded-lg focus-within:ring-2 focus-within:ring-purple-500/40 transition ${isDark ? 'bg-slate-800 border-slate-600' : 'bg-white border-slate-200'}`}>
            <div className="flex flex-wrap gap-1.5 mb-1">
              {tags.map(t => (
                <span key={t} className={`text-xs px-2 py-0.5 rounded flex items-center gap-1 ${isDark ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-100 text-purple-700'}`}>
                  {t} <X size={10} className="cursor-pointer hover:text-red-400" onClick={() => removeTag(t)} />
                </span>
              ))}
            </div>
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={addTag}
              placeholder="Press enter to add tags"
              className={`w-full bg-transparent outline-none text-sm px-1 ${isDark ? 'text-white placeholder-slate-500' : 'text-slate-800 placeholder-slate-400'}`}
            />
          </div>
        </div>
      </div>

      {/* Cover Color & Image */}
      <div>
        <label className={`text-xs font-semibold mb-2 block ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Book Cover Identity
        </label>
        <div className="grid grid-cols-5 gap-2 mb-3">
          {COVER_COLORS.map(color => (
            <button
              key={color}
              onClick={() => setCoverColor(color)}
              className={`w-8 h-8 rounded-full border-2 transition hover:scale-110 ${
                coverColor === color ? 'border-white shadow-lg scale-110' : 'border-transparent'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
        
        {/* Cover Image Upload UI */}
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
        <div
          onClick={() => fileInputRef.current?.click()}
          className="relative w-full h-32 rounded-xl flex items-end p-3 cursor-pointer overflow-hidden group border-2 border-dashed border-transparent hover:border-purple-400 transition-colors"
          style={{
            background: coverImage ? `url(${coverImage}) center/cover` : `linear-gradient(135deg, ${coverColor}, #4F46E5)`,
          }}
        >
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Upload size={24} className="text-white" />
          </div>
          <p className="text-white text-sm font-serif font-bold drop-shadow-md truncate w-full z-10">
            {title || 'Untitled Story'}
          </p>
        </div>
        {coverImage && (
          <button onClick={() => setCoverImage('')} className="w-full mt-2 text-xs text-red-400 hover:text-red-500 transition">
            ✕ Remove uploaded image
          </button>
        )}
      </div>

      {/* Visibility Toggle */}
      <div className={`p-3 rounded-xl border-2 ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-amber-50 border-amber-200'}`}>
        <label className={`text-xs font-bold mb-3 block uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Story Visibility</label>
        <div className={`flex rounded-xl overflow-hidden border ${isDark ? 'border-gray-700 bg-gray-800' : 'border-amber-200 bg-white'}`}>
          <button
            onClick={() => setStatus('draft')}
            className={`flex-1 py-2.5 text-sm font-bold transition-all ${
              status === 'draft'
                ? isDark ? 'bg-slate-600 text-white' : 'bg-gray-800 text-white'
                : isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            🔒 Private
          </button>
          <button
            onClick={() => setStatus('published')}
            className={`flex-1 py-2.5 text-sm font-bold transition-all ${
              status === 'published'
                ? 'bg-green-500 text-white'
                : isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            🌍 Public
          </button>
        </div>
        <p className={`text-xs mt-2 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
          {status === 'published' ? 'Visible to all readers on StoryVerse' : 'Only you can see this story'}
        </p>
      </div>

      {/* Stats */}
      <div className={`flex items-center justify-between pt-4 border-t text-xs ${isDark ? 'border-slate-700 text-slate-500' : 'border-slate-100 text-slate-400'}`}>
        <span>Words this chapter</span>
        <span className={`font-bold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{wordCount}</span>
      </div>
    </div>
  );
};

const Editor = () => {
  const { addToast, darkMode } = useAppStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const existingStoryId = searchParams.get('storyId');

  const isDark = darkMode;

  // --- Story Meta ---
  const [storyId, setStoryId] = useState(existingStoryId || null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [genre, setGenre] = useState('Fantasy');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [status, setStatus] = useState('draft');
  const [coverColor, setCoverColor] = useState(COVER_COLORS[0]);
  const [coverImage, setCoverImage] = useState('');

  // --- Chapters ---
  // Using customId for drag & drop keys before they have real _ids
  const generateCustomId = () => Math.random().toString(36).substr(2, 9);
  const [chapters, setChapters] = useState([{ customId: generateCustomId(), title: 'Chapter 1', content: '', _id: null }]);
  const [activeChapter, setActiveChapter] = useState(0);

  // --- UI State ---
  const [saving, setSaving] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState(''); // 'saving', 'saved', ''
  const [uploading, setUploading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showChapterPanel, setShowChapterPanel] = useState(window.innerWidth >= 768);
  const [loadingExisting, setLoadingExisting] = useState(!!existingStoryId);
  const fileInputRef = useRef(null);
  
  // Track previous state for auto-save detection
  const prevChapterData = useRef('');

  // Compute word count for active chapter (stripping HTML)
  const activeWordCount = (chapters[activeChapter]?.content || '').replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length;

  // --- Load Existing Story ---
  useEffect(() => {
    if (!existingStoryId) return;
    const loadStory = async () => {
      try {
        const [storyRes, chaptersRes] = await Promise.all([
          axiosInstance.get(`/stories/${existingStoryId}`),
          axiosInstance.get(`/chapters/${existingStoryId}`),
        ]);
        const s = storyRes.data;
        setTitle(s.title || '');
        setDescription(s.description || '');
        setGenre(s.genre || 'Fantasy');
        setTags(s.tags || []);
        setStatus(s.status || 'draft');
        setCoverColor(s.coverColor || COVER_COLORS[0]);
        setCoverImage(s.coverImage || '');
        setStoryId(s._id);

        const chs = chaptersRes.data;
        if (chs && chs.length > 0) {
          const loadedChapters = chs.map(c => ({
            _id: c._id, 
            customId: c._id, // use db id for dnd
            title: c.title, 
            content: c.content || ''
          }));
          setChapters(loadedChapters);
          prevChapterData.current = JSON.stringify(loadedChapters[0]);
        }
      } catch (err) {
        addToast('Failed to load story.', 'error');
      } finally {
        setLoadingExisting(false);
      }
    };
    loadStory();
  }, [existingStoryId, addToast]);

  // --- Auto Save Logic ---
  useEffect(() => {
    // We only auto-save if an ID exists (meaning it was created at least once manually)
    if (!storyId || saving || loadingExisting) return;

    const currentData = JSON.stringify(chapters[activeChapter]);
    if (currentData === prevChapterData.current) return;

    const timeoutId = setTimeout(async () => {
      setAutoSaveStatus('saving...');
      try {
        const ch = chapters[activeChapter];
        if (ch._id) {
          await axiosInstance.put(`/chapters/${ch._id}`, { title: ch.title, content: ch.content });
        }
        await axiosInstance.put(`/stories/${storyId}`, { title, description, genre, coverColor, coverImage, tags, status });
        
        prevChapterData.current = currentData;
        setAutoSaveStatus('Saved');
        setTimeout(() => setAutoSaveStatus(''), 2000);
      } catch (error) {
        setAutoSaveStatus('Save Error');
      }
    }, 2000); // 2 second debounce

    return () => clearTimeout(timeoutId);
  }, [chapters, activeChapter, title, description, genre, coverColor, coverImage, tags, status, storyId, saving, loadingExisting]);

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const { data } = await axiosInstance.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setCoverImage(data.imageUrl);
      addToast('Cover magic! ✨', 'success');
    } catch (err) {
      addToast('Upload failed.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const addChapter = () => {
    const newIdx = chapters.length;
    setChapters([...chapters, { customId: generateCustomId(), title: `Chapter ${newIdx + 1}`, content: '', _id: null }]);
    setActiveChapter(newIdx);
  };

  const removeChapter = async (idx) => {
    if (chapters.length === 1) { addToast('A story needs at least one chapter.', 'error'); return; }
    
    // If it's saved in DB, delete it from DB
    const ch = chapters[idx];
    if (ch._id) {
      try {
        await axiosInstance.delete(`/chapters/${ch._id}`);
      } catch (err) {
        addToast('Failed to delete chapter permanently', 'error');
        return;
      }
    }

    const updated = chapters.filter((_, i) => i !== idx);
    setChapters(updated);
    setActiveChapter(Math.max(0, idx - 1));
    addToast('Chapter deleted 🗑️', 'default');
  };

  const updateChapterField = (idx, field, value) => {
    const updated = [...chapters];
    updated[idx] = { ...updated[idx], [field]: value };
    setChapters(updated);
  };

  // --- Manual Save / Publish ---
  const handlePublish = async () => {
    if (!title.trim()) { addToast('Title is missing! 📖', 'error'); return; }
    setSaving(true);
    try {
      let savedStoryId = storyId;

      if (!savedStoryId) {
        // CREATE new story
        const { data: newStory } = await axiosInstance.post('/stories', {
          title, description, genre, coverColor, coverImage, tags, status
        });
        savedStoryId = newStory._id;
        setStoryId(savedStoryId);
        addToast(status === 'published' ? 'Going live...' : 'Setting up draft...', 'magic');
      } else {
        // UPDATE existing story meta
        await axiosInstance.put(`/stories/${savedStoryId}`, {
          title, description, genre, coverColor, coverImage, tags, status, chapterCount: chapters.length
        });
      }

      // Save all chapters (Update existing, create new)
      for (let i = 0; i < chapters.length; i++) {
        const ch = chapters[i];
        if (ch._id) {
          await axiosInstance.put(`/chapters/${ch._id}`, { title: ch.title, content: ch.content, isDraft: status === 'draft' });
        } else {
          const { data: savedChapter } = await axiosInstance.post('/chapters', {
            storyId: savedStoryId, title: ch.title, content: ch.content, order: i + 1,
          });
          const updated = [...chapters];
          updated[i] = { ...updated[i], _id: savedChapter._id, customId: savedChapter._id };
          setChapters(updated);
        }
      }

      prevChapterData.current = JSON.stringify(chapters[activeChapter]);
      
      addToast(status === 'published' ? 'Published successfully! 🎉' : 'Draft saved securely 💾', 'success');
      if (status === 'published') {
        setTimeout(() => navigate(`/story/${savedStoryId}`), 1000);
      }
    } catch (err) {
      console.error(err);
      addToast(err.response?.data?.message || 'Failed to process.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loadingExisting) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col transition-colors ${isDark ? 'bg-[#0f0f0f] text-gray-200' : 'bg-[#faf7f2] text-gray-900'}`}>

      {/* ===== TOP TOOLBAR ===== */}
      <div className={`sticky top-0 z-30 px-4 md:px-8 py-3 border-b flex items-center justify-between gap-3 transition-all shadow-sm ${isDark ? 'border-gray-800 bg-[#0f0f0f]/95 backdrop-blur-md' : 'border-amber-100 bg-[#faf7f2]/95 backdrop-blur-md'}`}>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            onClick={() => setShowChapterPanel(!showChapterPanel)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
              showChapterPanel ? 'bg-purple-500 text-white shadow-md shadow-purple-500/20' : isDark ? 'text-gray-400 hover:bg-gray-800 border border-gray-700' : 'text-gray-600 hover:bg-amber-50 border border-amber-200'
            }`}
          >
            <List size={14} /> <span className="hidden md:inline">Chapters</span>
          </button>
          
          <div className="flex flex-col flex-1 min-w-0">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your story a name..."
              className={`text-lg md:text-xl font-bold font-serif bg-transparent border-none outline-none w-full truncate ${isDark ? 'text-gray-100 placeholder-gray-700' : 'text-gray-900 placeholder-gray-400'}`}
            />
            {/* Auto-save indicator */}
            <span className={`text-[10px] uppercase tracking-wider font-bold h-3 transition-opacity duration-300 ${autoSaveStatus ? 'opacity-100' : 'opacity-0'} ${autoSaveStatus === 'Save Error' ? 'text-red-500' : 'text-green-500'}`}>
              {autoSaveStatus}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
              showSidebar ? 'bg-purple-500 text-white shadow-md shadow-purple-500/20' : isDark ? 'text-gray-400 hover:bg-gray-800 border border-gray-700' : 'text-gray-600 hover:bg-amber-50 border border-amber-200'
            }`}
          >
            ⚙️ <span className="hidden sm:inline">Settings</span>
          </button>
          
          <button
            onClick={handlePublish}
            disabled={saving}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold shadow-lg hover:brightness-110 transition disabled:opacity-50 disabled:cursor-wait ${
              status === 'published' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white' : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
            }`}
          >
            {saving ? 'Processing...' : status === 'published' ? '🚀 Publish' : '💾 Save Draft'}
          </button>
        </div>
      </div>

      {/* ===== MAIN LAYOUT ===== */}
      <div className="flex flex-1 overflow-hidden">

        {/* ===== LEFT: CHAPTERS (Desktop) ===== */}
        {showChapterPanel && (
          <div className={`hidden md:flex w-60 flex-shrink-0 border-r flex-col z-10 ${isDark ? 'border-gray-800 bg-[#0f0f0f]' : 'border-amber-100 bg-[#faf7f2]'}`}>
            <ChapterList
              chapters={chapters} setChapters={setChapters}
              activeChapter={activeChapter} setActiveChapter={setActiveChapter}
              removeChapter={removeChapter} addChapter={addChapter}
              isDark={isDark} storyId={storyId}
            />
          </div>
        )}

        {/* ===== LEFT: CHAPTERS (MobileDrawer) ===== */}
        {showChapterPanel && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            <div className={`w-3/4 max-w-sm h-full flex flex-col shadow-2xl safe-paddings ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
              <div className={`flex items-center justify-between px-4 py-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                <p className="text-sm font-extrabold uppercase tracking-widest text-purple-500">Chapters</p>
                <button onClick={() => setShowChapterPanel(false)} className={`p-2 rounded-full ${isDark ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  <X size={16} />
                </button>
              </div>
              <ChapterList
                chapters={chapters} setChapters={setChapters}
                activeChapter={activeChapter} setActiveChapter={(idx) => { setActiveChapter(idx); setShowChapterPanel(false); }}
                removeChapter={removeChapter} addChapter={addChapter} isDark={isDark} storyId={storyId}
              />
            </div>
            <div className="flex-1 bg-black/60 backdrop-blur-sm" onClick={() => setShowChapterPanel(false)} />
          </div>
        )}

        {/* ===== CENTER: WRITING CANVAS (Book/Reader Style) ===== */}
        <div className="flex-1 overflow-y-auto relative scroll-smooth">
          <div className="max-w-2xl mx-auto px-6 md:px-12 pb-40 pt-10">

            {/* Story meta breadcrumb */}
            <p className={`text-xs uppercase tracking-widest font-semibold mb-8 ${isDark ? 'text-purple-400' : 'text-purple-500'}`}>
              {title || 'Your Story'} — Editing
            </p>

            {/* Chapter Title (reader-style) */}
            <input
              type="text"
              value={chapters[activeChapter]?.title || ''}
              onChange={(e) => updateChapterField(activeChapter, 'title', e.target.value)}
              placeholder="Chapter Title"
              className={`text-3xl sm:text-4xl font-serif font-bold w-full bg-transparent border-none outline-none mb-2 focus:ring-0 leading-tight ${
                isDark ? 'text-gray-100 placeholder-gray-700' : 'text-gray-900 placeholder-gray-300'
              }`}
            />
            <div className={`h-px w-full mb-8 ${isDark ? 'bg-gray-800' : 'bg-amber-200'}`} />

            {/* Tiptap Rich Text Editor — reader prose style */}
            <RichTextEditor
              content={chapters[activeChapter]?.content || ''}
              onChange={(html) => updateChapterField(activeChapter, 'content', html)}
              isDark={isDark}
            />
          </div>
        </div>

        {/* ===== RIGHT: SETTINGS (Universal Drawer) ===== */}
        {showSidebar && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <div className="flex-1 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setShowSidebar(false)} />
            <div className={`w-full max-w-sm h-full overflow-y-auto shadow-2xl safe-paddings flex flex-col ${isDark ? 'bg-[#0f0f0f]' : 'bg-white'}`}>
              <div className={`flex items-center justify-between px-4 py-4 border-b flex-shrink-0 ${isDark ? 'border-gray-800' : 'border-amber-100'}`}>
                <p className={`text-sm font-extrabold uppercase tracking-widest ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>Story Settings</p>
                <button onClick={() => setShowSidebar(false)} className={`p-2 rounded-full transition-colors ${isDark ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                  <X size={16} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <SettingsPanel
                  isDark={isDark} description={description} setDescription={setDescription}
                  genre={genre} setGenre={setGenre} tags={tags} setTags={setTags} tagInput={tagInput} setTagInput={setTagInput}
                  coverColor={coverColor} setCoverColor={setCoverColor} coverImage={coverImage} setCoverImage={setCoverImage}
                  title={title} uploading={uploading} fileInputRef={fileInputRef} handleCoverUpload={handleCoverUpload}
                  wordCount={activeWordCount}
                  status={status} setStatus={setStatus}
                />
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Floating AI Panel */}
      <AIToolbar
        currentContext={chapters[activeChapter]?.content}
        isDark={isDark}
        chapterId={chapters[activeChapter]?._id || null}
        storyId={storyId}
      />
    </div>
  );
};

export default Editor;
