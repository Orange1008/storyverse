import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";
import axiosInstance from "../lib/axios";

const AuthSection = () => {
  const navigate = useNavigate();
  const { login, addToast } = useAppStore();

  const [authMode, setAuthMode] = useState("register");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);

  /* AUTO FILL remembered email */
  useEffect(() => {
    const saved = localStorage.getItem("rememberEmail");
    if (saved) setEmail(saved);
  }, []);

  /* PASSWORD STRENGTH — 5 rules */
  const rules = [
    { id: 'len',     label: 'At least 8 characters',        test: (p) => p.length >= 8 },
    { id: 'upper',   label: 'One uppercase letter (A-Z)',    test: (p) => /[A-Z]/.test(p) },
    { id: 'lower',   label: 'One lowercase letter (a-z)',    test: (p) => /[a-z]/.test(p) },
    { id: 'digit',   label: 'One number (0-9)',              test: (p) => /\d/.test(p) },
    { id: 'special', label: 'One special character (!@#$…)', test: (p) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p) },
  ];

  const passedRules = rules.filter(r => r.test(password));
  const strength = passedRules.length <= 1 ? 'weak'
                 : passedRules.length <= 3 ? 'fair'
                 : passedRules.length === 4 ? 'good'
                 : 'strong';
  const strengthColor = { weak: 'bg-red-500', fair: 'bg-orange-400', good: 'bg-yellow-400', strong: 'bg-green-500' };
  const strengthWidth = { weak: '20%', fair: '50%', good: '80%', strong: '100%' };

  const handleAuth = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) { setError('All fields are required.'); return; }
    if (authMode === 'register' && !username.trim()) { setError('Please enter a username.'); return; }
    if (authMode === 'register' && passedRules.length < 5) {
      setError('Please make your password stronger — check all requirements below.');
      return;
    }
    if (authMode === 'login' && password.length < 1) { setError('Please enter your password.'); return; }

    setIsLoading(true);
    try {
      let data;
      if (authMode === "login") {
        const res = await axiosInstance.post("/auth/login", { email, password });
        data = res.data;
      } else {
        const res = await axiosInstance.post("/auth/register", { username, email, password });
        data = res.data;
      }

      if (remember) localStorage.setItem("rememberEmail", email);
      else localStorage.removeItem("rememberEmail");

      login(data); // saves token + user into Zustand + localStorage
      addToast(`Welcome, ${data.username}! ✨`, "success");
      navigate("/home");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="auth-section" className="py-32 flex justify-center scroll-mt-24">
      <div className="w-full max-w-md bg-white/95 border border-purple-100 backdrop-blur-xl p-10 rounded-2xl shadow-xl text-slate-900">

        {/* TAB SWITCHER */}
        <div className="flex rounded-xl border border-purple-100 overflow-hidden mb-8">
          {["register", "login"].map((mode) => (
            <button
              key={mode}
              onClick={() => { setAuthMode(mode); setError(""); }}
              className={`flex-1 py-2.5 text-sm font-bold transition-all ${
                authMode === mode
                  ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white"
                  : "text-slate-500 hover:text-purple-600"
              }`}
            >
              {mode === "register" ? "Sign Up" : "Log In"}
            </button>
          ))}
        </div>

        <h2 className="text-2xl font-bold text-center mb-6 text-slate-900">
          {authMode === "login" ? "Welcome Back 👋" : "Join the Universe ✨"}
        </h2>

        <form onSubmit={handleAuth} className="space-y-5">

          {/* USERNAME — only on register */}
          <AnimatePresence>
            {authMode === "register" && (
              <motion.div
                key="username"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="input-group">
                  <input
                    placeholder=" "
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="input-field"
                  />
                  <motion.label className="input-label text-slate-700">
                    Username (your pen name)
                  </motion.label>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* EMAIL */}
          <div className="input-group">
            <input
              type="email"
              placeholder=" "
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
            />
            <motion.label className="input-label text-slate-700">
              Email
            </motion.label>
          </div>

          {/* PASSWORD */}
          <div className="input-group relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder=" "
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field pr-10"
            />
            <motion.label className="input-label text-slate-700">
              Password
            </motion.label>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
            >
              {showPassword ? "🙈" : "👁"}
            </button>
          </div>

          {/* PASSWORD STRENGTH BAR + CHECKLIST (register only) */}
          {password && authMode === 'register' && (
            <div className="space-y-2">
              {/* Bar */}
              <div className="h-1.5 rounded-full bg-gray-200 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: strengthWidth[strength] }}
                  className={`h-full rounded-full transition-all ${strengthColor[strength]}`}
                />
              </div>
              <p className="text-xs text-slate-400 text-right capitalize font-semibold tracking-wide">
                {strength}
              </p>
              {/* Requirement checklist */}
              <ul className="space-y-1">
                {rules.map(r => {
                  const passed = r.test(password);
                  return (
                    <li key={r.id} className={`flex items-center gap-2 text-xs transition-colors ${
                      passed ? 'text-green-600' : 'text-slate-400'
                    }`}>
                      <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] ${passed ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                        {passed ? '✓' : '•'}
                      </span>
                      {r.label}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          {/* Strength bar on login (simple) */}
          {password && authMode === 'login' && (
            <div className="h-1 rounded-full bg-gray-100 overflow-hidden" />
          )}

          {/* REMEMBER + FORGOT */}
          <div className="flex justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={remember}
                onChange={() => setRemember(!remember)}
                className="accent-purple-600"
              />
              Remember me
            </label>
            {authMode === "login" && (
              <button type="button" className="text-purple-600 hover:underline">Forgot password?</button>
            )}
          </div>

          {/* ERROR */}
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: [0, -8, 8, -8, 8, 0] }}
                exit={{ opacity: 0 }}
                className="text-red-500 text-sm text-center"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-purple-500/30 hover:brightness-110 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                {authMode === "login" ? "Signing in..." : "Creating account..."}
              </>
            ) : (
              authMode === "login" ? "Sign In →" : "Create Account →"
            )}
          </button>

        </form>

        {/* SWITCH MODE */}
        <p className="text-center mt-6 text-sm text-slate-500">
          {authMode === "login" ? "Don't have an account?" : "Already have one?"}
          <button
            onClick={() => { setAuthMode(authMode === "login" ? "register" : "login"); setError(""); }}
            className="text-purple-600 ml-2 font-semibold hover:underline"
          >
            {authMode === "login" ? "Sign Up" : "Log In"}
          </button>
        </p>

      </div>
    </section>
  );
};

export default AuthSection;