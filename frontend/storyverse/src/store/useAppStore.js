import { create } from "zustand";

export const useAppStore = create((set) => ({
  /* ================= AUTH ================= */

  // Load from localStorage (user object includes token)
  isAuthenticated: JSON.parse(localStorage.getItem("auth")) || false,

  user: JSON.parse(localStorage.getItem("user")) || null,

  // LOGIN — called with the full API response object (includes token)
  login: (userData) => {
    localStorage.setItem("auth", JSON.stringify(true));
    localStorage.setItem("user", JSON.stringify(userData));
    set({
      isAuthenticated: true,
      user: userData,
    });
  },

  // LOGOUT
  logout: () => {
    localStorage.removeItem("auth");
    localStorage.removeItem("user");
    localStorage.removeItem("continueReading");
    localStorage.removeItem("progress");
    set({
      isAuthenticated: false,
      user: null,
      continueReading: null,
      progress: {},
    });
  },

  /* ================= UI ================= */

  darkMode: JSON.parse(localStorage.getItem("darkMode")) ?? true,

  toggleDarkMode: () =>
    set((state) => {
      const next = !state.darkMode;
      localStorage.setItem("darkMode", JSON.stringify(next));
      if (next) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      return { darkMode: next };
    }),

  /* ================= CONTINUE READING ================= */

  continueReading: JSON.parse(localStorage.getItem("continueReading")) || null,

  setContinueReading: (story) => {
    localStorage.setItem("continueReading", JSON.stringify(story));
    set({ continueReading: story });
  },

  /* ================= PER STORY PROGRESS ================= */

  progress: JSON.parse(localStorage.getItem("progress")) || {},

  setProgress: (storyId, chapter) =>
    set((state) => {
      const updated = { ...state.progress, [storyId]: chapter };
      localStorage.setItem("progress", JSON.stringify(updated));
      return { progress: updated };
    }),

  /* ================= GLOBALS & TOASTS ================= */

  toasts: [],

  addToast: (message, type = "default") => {
    const id = Date.now().toString() + Math.random().toString(36).substring(7);
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }]
    }));
    // Auto remove after 3.5s
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id)
      }));
    }, 3500);
  },

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id)
    })),

}));