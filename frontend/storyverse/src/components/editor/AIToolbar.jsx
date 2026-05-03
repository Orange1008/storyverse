import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Wand2, X, Loader2, ListTree, MessageSquareText,
  UserRound, HeartHandshake, ChevronDown, RefreshCcw,
  History, ImagePlus, CheckCheck, Copy, CornerDownLeft,
  Sparkles, Clock, ChevronRight,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

// ─── Constants ────────────────────────────────────────────────────────────────

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const TONES = ['romantic', 'horror', 'fantasy', 'comedy', 'dramatic', 'mysterious', 'suspenseful', 'poetic'];

const AI_ACTIONS = [
  { mode: 'continue',  icon: CornerDownLeft,    color: 'text-purple-400', bg: 'bg-purple-500/10', label: 'Continue Writing'      },
  { mode: 'improve',   icon: RefreshCcw,         color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Improve Phrasing'   },
  { mode: 'plot',      icon: ListTree,           color: 'text-yellow-400', bg: 'bg-yellow-500/10', label: 'Suggest Plot Twist'    },
  { mode: 'dialogue',  icon: MessageSquareText,  color: 'text-blue-400',   bg: 'bg-blue-500/10',   label: 'Generate Dialogue'    },
  { mode: 'character', icon: UserRound,          color: 'text-pink-400',   bg: 'bg-pink-500/10',   label: 'Character Arc'         },
];

const MODE_LABELS = {
  continue: 'Continue', improve: 'Improve', plot: 'Plot Twist',
  dialogue: 'Dialogue', character: 'Character', tone: 'Tone', image: 'AI Image',
};

// ─── Tiny helpers ─────────────────────────────────────────────────────────────

const getAuthToken = () => {
  try { return JSON.parse(localStorage.getItem('user'))?.token || ''; }
  catch { return ''; }
};

const timeAgo = (iso) => {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

// ─── Sub-components ───────────────────────────────────────────────────────────

// Streaming cursor blink
const Cursor = () => (
  <span className="inline-block w-0.5 h-4 bg-purple-400 ml-0.5 align-middle animate-pulse" />
);

// History card
const HistoryCard = ({ gen, isDark, onReuse }) => {
  const [expanded, setExpanded] = useState(false);
  const preview = gen.result.slice(0, 120);
  const isImage = gen.mode === 'image';

  return (
    <div className={`rounded-xl border p-3 text-xs transition-all ${
      isDark ? 'border-gray-700/60 bg-gray-800/50 hover:border-gray-600' : 'border-gray-200 bg-gray-50 hover:border-gray-300'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
          isDark ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-100 text-purple-700'
        }`}>
          {MODE_LABELS[gen.mode] || gen.mode}{gen.tone ? ` · ${gen.tone}` : ''}
        </span>
        <span className={`flex items-center gap-1 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
          <Clock size={10} /> {timeAgo(gen.createdAt)}
        </span>
      </div>

      {isImage ? (
        <img src={gen.result} alt="AI generated" className="w-full rounded-lg mb-2 object-cover h-28" />
      ) : (
        <p className={`font-serif leading-relaxed mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          {expanded ? gen.result : preview}{!expanded && gen.result.length > 120 ? '...' : ''}
        </p>
      )}

      <div className="flex items-center gap-2">
        {!isImage && (
          <button
            onClick={() => setExpanded(v => !v)}
            className={`text-[10px] transition ${isDark ? 'text-gray-600 hover:text-gray-400' : 'text-gray-400 hover:text-gray-600'}`}
          >
            {expanded ? 'Show less' : 'Show more'}
          </button>
        )}
        <div className="flex-1" />
        <button
          onClick={() => onReuse(gen)}
          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold transition ${
            isDark ? 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/30' : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
          }`}
        >
          {isImage ? <ImagePlus size={10} /> : <CornerDownLeft size={10} />}
          {isImage ? 'Insert' : 'Reuse'}
        </button>
      </div>
    </div>
  );
};

// ─── Main AIToolbar ────────────────────────────────────────────────────────────

const AIToolbar = ({ currentContext, isDark, chapterId, storyId }) => {
  const [isOpen, setIsOpen]                 = useState(false);
  const [activeTab, setActiveTab]           = useState('generate'); // generate | history | image
  const [streaming, setStreaming]           = useState(false);
  const [streamedText, setStreamedText]     = useState('');
  const [activeMode, setActiveMode]         = useState('');
  const [showToneMenu, setShowToneMenu]     = useState(false);
  const [history, setHistory]               = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [imagePrompt, setImagePrompt]       = useState('');
  const [imageLoading, setImageLoading]     = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const abortRef                            = useRef(null);
  const textRef                             = useRef('');
  const { addToast } = useAppStore();

  // ── Fetch history when History tab opened ───────────────────────────────────
  useEffect(() => {
    if (activeTab !== 'history' || !chapterId) return;
    setHistoryLoading(true);
    const token = getAuthToken();
    fetch(`${API_BASE}/ai/history/${chapterId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => setHistory(Array.isArray(data) ? data : []))
      .catch(() => setHistory([]))
      .finally(() => setHistoryLoading(false));
  }, [activeTab, chapterId]);

  // ── Streaming AI call ────────────────────────────────────────────────────────
  const handleAI = useCallback(async (mode, tone = null) => {
    if (!currentContext?.trim() && mode !== 'plot' && mode !== 'character') {
      addToast('Write something first so AI has context! ✍️', 'error');
      return;
    }

    // Abort any previous stream
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setStreaming(true);
    setStreamedText('');
    textRef.current = '';
    setActiveMode(mode);
    setShowToneMenu(false);

    const cleanContext = currentContext
      ? currentContext.replace(/<[^>]*>/g, '').trim().slice(-2000)
      : '';

    const token = getAuthToken();
    try {
      const res = await fetch(`${API_BASE}/ai/stream`, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ mode, context: cleanContext, tone, storyId, chapterId }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        addToast(err.message || 'AI generation failed', 'error');
        setStreaming(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop(); // keep incomplete line in buffer

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const raw = line.slice(6).trim();
          if (raw === '[DONE]') { setStreaming(false); break; }
          try {
            const { token: tok, error } = JSON.parse(raw);
            if (error) { addToast(error, 'error'); setStreaming(false); break; }
            if (tok) {
              textRef.current += tok;
              setStreamedText(prev => prev + tok);
            }
          } catch {}
        }
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        addToast('Connection to AI failed. Is the server running?', 'error');
      }
    } finally {
      setStreaming(false);
    }
  }, [currentContext, storyId, chapterId, addToast]);

  // ── Actions ─────────────────────────────────────────────────────────────────

  const insertText = () => {
    window.dispatchEvent(new CustomEvent('ai-insert-text', { detail: textRef.current }));
    addToast('Magic inserted ✨', 'success');
    setStreamedText('');
    setActiveMode('');
  };

  const copyText = () => {
    navigator.clipboard.writeText(textRef.current).then(() => addToast('Copied!', 'success'));
  };

  const reset = () => { setStreamedText(''); setActiveMode(''); abortRef.current?.abort(); setStreaming(false); };

  const handleReuseHistory = (gen) => {
    if (gen.mode === 'image') {
      window.dispatchEvent(new CustomEvent('ai-insert-image', { detail: { url: gen.result, alt: 'AI generated image' } }));
      addToast('Image inserted ✨', 'success');
    } else {
      window.dispatchEvent(new CustomEvent('ai-insert-text', { detail: gen.result }));
      addToast('Generation reused ✨', 'success');
    }
  };

  // ── Image Generation ────────────────────────────────────────────────────────
  const handleImageGenerate = async () => {
    if (!imagePrompt.trim()) { addToast('Describe the image you want!', 'error'); return; }
    setImageLoading(true);
    setGeneratedImage(null);
    const token = getAuthToken();
    try {
      const res = await fetch(`${API_BASE}/ai/image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ prompt: imagePrompt, storyId, chapterId }),
      });
      const data = await res.json();
      if (!res.ok) { addToast(data.message || 'Image generation failed', 'error'); return; }
      setGeneratedImage(data.imageUrl);
    } catch {
      addToast('Failed to generate image.', 'error');
    } finally {
      setImageLoading(false);
    }
  };

  const insertImage = () => {
    if (!generatedImage) return;
    window.dispatchEvent(new CustomEvent('ai-insert-image', { detail: { url: generatedImage, alt: imagePrompt } }));
    addToast('Image inserted into story ✨', 'success');
    setGeneratedImage(null);
    setImagePrompt('');
  };

  // ── Collapsed tab ────────────────────────────────────────────────────────────
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        title="Open AI Writing Assistant"
        className="fixed bottom-24 right-6 md:bottom-10 md:right-10 group flex items-center gap-2 pl-3 pr-4 py-3 bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-full shadow-2xl shadow-purple-500/30 hover:scale-105 active:scale-95 transition-all z-40"
      >
        <Sparkles size={18} className="group-hover:rotate-12 transition-transform" />
        <span className="text-sm font-semibold">AI</span>
      </button>
    );
  }

  // ── Expanded panel ────────────────────────────────────────────────────────────
  const panelBg = isDark ? 'bg-[#111827]/98 border-gray-700/60' : 'bg-white/98 border-gray-200';
  const tabActive = isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-900 shadow-sm';
  const tabInactive = isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-700';

  return (
    <div className={`fixed bottom-24 right-4 md:bottom-8 md:right-8 w-80 rounded-2xl border shadow-2xl shadow-black/20 z-40 flex flex-col overflow-hidden max-h-[80vh] ${panelBg}`}>

      {/* ── Header ── */}
      <div className={`flex items-center justify-between px-4 py-3 border-b flex-shrink-0 ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
        <span className="font-bold text-sm flex items-center gap-2">
          <Sparkles size={14} className="text-purple-500" />
          <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
            StoryVerse AI
          </span>
        </span>
        <button onClick={() => { setIsOpen(false); reset(); }} className={`p-1.5 rounded-lg transition ${isDark ? 'hover:bg-gray-800 text-gray-500' : 'hover:bg-gray-100 text-gray-400'}`}>
          <X size={14} />
        </button>
      </div>

      {/* ── Tabs ── */}
      <div className={`flex gap-1 p-2 flex-shrink-0 ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
        {[
          { id: 'generate', icon: Wand2,    label: 'Generate' },
          { id: 'history',  icon: History,   label: 'History'  },
          { id: 'image',    icon: ImagePlus, label: 'Image'    },
        ].map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === id ? tabActive : tabInactive
            }`}
          >
            <Icon size={12} /> {label}
          </button>
        ))}
      </div>

      {/* ── Body ── */}
      <div className="flex-1 overflow-y-auto">

        {/* ════ GENERATE TAB ════ */}
        {activeTab === 'generate' && (
          <div className="p-3 space-y-2">

            {/* Streaming output */}
            {(streaming || streamedText) && (
              <div className={`rounded-xl p-3 text-sm leading-relaxed font-serif max-h-52 overflow-y-auto ${
                isDark ? 'bg-gray-800/70 text-gray-300' : 'bg-gray-50 text-gray-700'
              }`}>
                {streamedText || <span className={`text-xs ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>Generating...</span>}
                {streaming && <Cursor />}
              </div>
            )}

            {/* Actions after streaming done */}
            {!streaming && streamedText && (
              <div className="flex gap-2">
                <button
                  onClick={insertText}
                  className="flex-1 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-xs font-bold hover:brightness-110 transition flex items-center justify-center gap-1.5"
                >
                  <CheckCheck size={13} /> Insert
                </button>
                <button
                  onClick={copyText}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 ${
                    isDark ? 'border-gray-700 text-gray-400 hover:bg-gray-800' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Copy size={12} /> Copy
                </button>
                <button onClick={reset} className={`px-3 py-2 rounded-xl text-xs border transition ${isDark ? 'border-gray-700 text-gray-500 hover:bg-gray-800' : 'border-gray-200 text-gray-400 hover:bg-gray-50'}`}>
                  ✕
                </button>
              </div>
            )}

            {/* Action buttons — always visible */}
            {!streaming && (
              <div className={`rounded-xl overflow-hidden border ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
                {AI_ACTIONS.map(({ mode, icon: Icon, color, bg, label }) => (
                  <button
                    key={mode}
                    onClick={() => handleAI(mode)}
                    className={`w-full text-left px-3 py-2.5 text-xs font-medium flex items-center gap-3 transition-colors border-b last:border-0 ${
                      isDark ? 'border-gray-800 hover:bg-gray-800/80' : 'border-gray-100 hover:bg-gray-50'
                    } ${activeMode === mode && !streamedText ? (isDark ? 'bg-gray-800' : 'bg-gray-50') : ''}`}
                  >
                    <span className={`p-1.5 rounded-lg ${bg}`}>
                      <Icon size={13} className={color} />
                    </span>
                    {label}
                    <ChevronRight size={12} className={`ml-auto opacity-30 ${color}`} />
                  </button>
                ))}

                {/* Tone selector */}
                <div>
                  <button
                    onClick={() => setShowToneMenu(v => !v)}
                    className={`w-full text-left px-3 py-2.5 text-xs font-medium flex items-center gap-3 transition-colors ${
                      isDark ? 'hover:bg-gray-800/80' : 'hover:bg-gray-50'
                    }`}
                  >
                    <span className="p-1.5 rounded-lg bg-rose-500/10">
                      <HeartHandshake size={13} className="text-rose-400" />
                    </span>
                    Change Tone...
                    <ChevronDown size={12} className={`ml-auto opacity-40 transition-transform ${showToneMenu ? 'rotate-180' : ''}`} />
                  </button>
                  {showToneMenu && (
                    <div className={`px-3 pb-3 grid grid-cols-2 gap-1.5`}>
                      {TONES.map(tone => (
                        <button
                          key={tone}
                          onClick={() => handleAI('tone', tone)}
                          className={`px-2.5 py-1.5 text-[11px] rounded-lg capitalize font-medium text-left transition ${
                            isDark ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                          }`}
                        >
                          {tone}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Stop streaming button */}
            {streaming && (
              <button
                onClick={() => { abortRef.current?.abort(); setStreaming(false); }}
                className={`w-full py-2 text-xs font-semibold rounded-xl border transition ${
                  isDark ? 'border-gray-700 text-red-400 hover:bg-red-500/10' : 'border-red-200 text-red-500 hover:bg-red-50'
                }`}
              >
                ⬛ Stop generating
              </button>
            )}
          </div>
        )}

        {/* ════ HISTORY TAB ════ */}
        {activeTab === 'history' && (
          <div className="p-3 space-y-2">
            {!chapterId && (
              <p className={`text-xs text-center py-6 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                Save your story first to see AI history.
              </p>
            )}
            {chapterId && historyLoading && (
              <div className="flex justify-center py-8">
                <Loader2 size={20} className="animate-spin text-purple-500" />
              </div>
            )}
            {chapterId && !historyLoading && history.length === 0 && (
              <p className={`text-xs text-center py-8 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                No AI generations yet for this chapter.<br />
                <span className="opacity-60">Use Generate tab to create some!</span>
              </p>
            )}
            {chapterId && !historyLoading && history.map(gen => (
              <HistoryCard key={gen._id} gen={gen} isDark={isDark} onReuse={handleReuseHistory} />
            ))}
          </div>
        )}

        {/* ════ IMAGE TAB ════ */}
        {activeTab === 'image' && (
          <div className="p-3 space-y-3">
            <p className={`text-[11px] leading-relaxed ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              Describe a scene or illustration for your story — AI will paint it for you.
            </p>

            <textarea
              value={imagePrompt}
              onChange={e => setImagePrompt(e.target.value)}
              placeholder="e.g. A misty forest at dawn, ancient ruins glowing with purple magic..."
              rows={3}
              className={`w-full text-xs rounded-xl px-3 py-2.5 border resize-none outline-none focus:ring-2 focus:ring-purple-500/30 transition leading-relaxed ${
                isDark ? 'bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-600' : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400'
              }`}
            />

            <button
              onClick={handleImageGenerate}
              disabled={imageLoading || !imagePrompt.trim()}
              className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold rounded-xl hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
            >
              {imageLoading
                ? <><Loader2 size={13} className="animate-spin" /> Painting your scene...</>
                : <><ImagePlus size={13} /> Generate Image (512×512)</>
              }
            </button>

            {generatedImage && (
              <div className="space-y-2">
                <img
                  src={generatedImage}
                  alt="AI generated scene"
                  className="w-full rounded-xl object-cover shadow-lg"
                />
                <div className="flex gap-2">
                  <button
                    onClick={insertImage}
                    className="flex-1 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold rounded-xl hover:brightness-110 transition flex items-center justify-center gap-1.5"
                  >
                    <CheckCheck size={13} /> Insert into Story
                  </button>
                  <button
                    onClick={() => { setGeneratedImage(null); setImagePrompt(''); }}
                    className={`px-3 py-2 rounded-xl text-xs border transition ${
                      isDark ? 'border-gray-700 text-gray-500 hover:bg-gray-800' : 'border-gray-200 text-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    ✕
                  </button>
                </div>
                <p className={`text-[10px] text-center ${isDark ? 'text-gray-700' : 'text-gray-300'}`}>
                  Free · FLUX.1-schnell via HuggingFace
                </p>
              </div>
            )}

            {imageLoading && (
              <p className={`text-[10px] text-center ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                This takes ~15-20 seconds on first run (model warm-up)
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <div className={`px-4 py-2 text-[10px] text-center flex-shrink-0 border-t ${
        isDark ? 'border-gray-800 text-gray-700' : 'border-gray-100 text-gray-300'
      }`}>
        Powered by Groq · Llama 3.3 · FLUX.1
      </div>
    </div>
  );
};

export default AIToolbar;
