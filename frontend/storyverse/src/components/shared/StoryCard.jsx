import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// Deterministically generate a gradient from a string (story ID or coverColor)
const GRADIENTS = [
  "from-purple-400 to-indigo-600",
  "from-rose-400 to-pink-600",
  "from-amber-400 to-orange-600",
  "from-teal-400 to-cyan-600",
  "from-emerald-400 to-green-600",
  "from-sky-400 to-blue-600",
  "from-violet-400 to-purple-700",
  "from-red-400 to-rose-700",
  "from-fuchsia-400 to-violet-600",
  "from-lime-400 to-emerald-600",
];

function getGradient(idOrColor) {
  if (!idOrColor) return GRADIENTS[0];
  // Sum char codes for a stable, deterministic index
  const chars = String(idOrColor);
  const sum = chars.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return GRADIENTS[sum % GRADIENTS.length];
}

const StoryCard = ({
  id,
  title = "Untitled",
  genre = "Fantasy",
  views = "0",
  rating = "New",
  coverImage = "",
  coverColor = "",
}) => {
  const navigate = useNavigate();
  const [isFlipping, setIsFlipping] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const gradient = coverImage ? "" : getGradient(coverColor || id);

  const handleOpen = () => {
    setIsFlipping(true);
    setShowPreview(false);
    setTimeout(() => {
      navigate(`/story/${id}`);
    }, 800);
  };

  return (
    <>
      {/* BOOK */}
      <div
        className="relative group cursor-pointer perspective-1000"
        onMouseEnter={() => setShowPreview(true)}
        onMouseLeave={() => setShowPreview(false)}
        onClick={handleOpen}
      >
        <div
          className={`relative w-36 h-56 sm:w-44 sm:h-64 mx-auto transition-all duration-700 transform-style-preserve-3d
          ${isFlipping ? "animate-flip-open" : "hover:animate-page-flip"}`}
        >
          {/* SHADOW */}
          <div className="absolute inset-0 bg-black/40 blur-xl rounded-xl transform translate-y-2"></div>

          {/* BOOK FRONT COVER */}
          <div
            className={`absolute inset-0 w-full h-full rounded-lg shadow-xl overflow-hidden backface-hidden ${
              coverImage ? "" : `bg-gradient-to-br ${gradient}`
            }`}
            style={coverImage ? { backgroundImage: `url(${coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
          >
            {/* HOVER PREVIEW OVERLAY */}
            <div
              className={`absolute inset-0 bg-black/60 backdrop-blur-md z-10 transition-opacity duration-300 pointer-events-none flex flex-col p-3 ${
                showPreview && !isFlipping ? "opacity-100" : "opacity-0"
              }`}
            >
              <div className="text-white text-[11px] space-y-1.5 overflow-hidden">
                <div className="uppercase tracking-[0.2em] text-purple-300 font-bold">{genre}</div>
                <h4 className="font-semibold text-xs leading-tight line-clamp-2">{title}</h4>
                <div className="text-[9px] text-purple-200">
                  {typeof views === 'number' ? (views > 999 ? `${(views/1000).toFixed(1)}k` : views) : views} reads • ⭐ {rating}
                </div>
                <p className="text-[10px] text-gray-200/90 leading-snug line-clamp-4 mt-2">
                  Tap to explore this story and start reading for free.
                </p>
              </div>
            </div>

            {/* SPINE */}
            <div className="absolute left-0 w-2 h-full bg-black/30"></div>

            {/* TITLE STRIP */}
            <div className="absolute bottom-0 w-full p-3 md:p-4 text-white bg-gradient-to-t from-black/80 via-black/40 to-transparent z-0">
              <h3 className="font-bold text-sm leading-tight line-clamp-2 drop-shadow-md">{title}</h3>
              <p className="text-[10px] md:text-xs opacity-90 mt-0.5 truncate drop-shadow-md pb-1">{genre}</p>
            </div>
          </div>

          {/* BOOK BACK COVER */}
          <div
            className={`absolute inset-0 w-full h-full rounded-lg shadow-xl overflow-hidden backface-hidden rotate-y-180 bg-gradient-to-br ${gradient}`}
          >
            <div className="absolute right-0 w-2 h-full bg-black/30"></div>
            <div className="absolute inset-0 p-4 text-white flex flex-col justify-center items-center text-center">
              <div className="text-xs opacity-80 mb-2">⭐ {rating}</div>
              <div className="text-xs opacity-80">
                {typeof views === 'number' ? (views > 999 ? `${(views/1000).toFixed(1)}k` : views) : views} reads
              </div>
              <div className="text-[10px] mt-3 opacity-60">Free to read</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StoryCard;