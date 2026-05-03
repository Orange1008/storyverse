import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import axiosInstance from '../lib/axios';

const Login = () => {
  const { login, addToast } = useAppStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await axiosInstance.post('/auth/login', { email, password });
      login(data); // data includes _id, username, email, role, token
      addToast(`Welcome back, ${data.username}! 👋`, 'success');
      navigate('/home');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative bg-[#030712] overflow-hidden">

      {/* Anime Background Effect */}
      <div className="absolute inset-0 bg-[url('/src/assets/hero.png')] bg-cover bg-center opacity-30 blur-sm scale-105"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-[#030712]/80 to-purple-900/40"></div>

      <div className="glass-card w-full max-w-md p-8 relative z-10 shadow-2xl border border-[var(--color-primary)]/30 backdrop-blur-xl bg-black/60 rounded-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 text-white drop-shadow-md">
            Story<span className="text-[var(--color-primary)]">Verse</span>
          </h1>
          <p className="text-gray-300">Log in to enter the universe.</p>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-red-900/40 border border-red-500/50 text-red-300 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input bg-black/50 text-white border-gray-700 focus:border-[var(--color-primary)]"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input bg-black/50 text-white border-gray-700 focus:border-[var(--color-primary)]"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 text-lg mt-4 shadow-lg shadow-purple-500/30 font-bold tracking-wide disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Signing in...
              </>
            ) : 'Sign In'}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-gray-400">
          Don't have an account?{' '}
          <a href="/register" className="text-[var(--color-primary)] font-semibold hover:text-purple-400 transition-colors">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
