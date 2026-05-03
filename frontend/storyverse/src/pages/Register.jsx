import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import axiosInstance from '../lib/axios';

const Register = () => {
  const { login, addToast } = useAppStore();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await axiosInstance.post('/auth/register', { username, email, password });
      login(data); // data includes _id, username, email, role, token
      addToast(`Welcome to StoryVerse, ${data.username}! ✨`, 'success');
      navigate('/home');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative bg-[#030712] overflow-hidden">

      {/* Anime Background Effect */}
      <div className="absolute inset-0 bg-[url('/src/assets/hero.png')] bg-cover bg-center opacity-30 blur-sm scale-105"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900/40 via-[#030712]/80 to-[#030712]"></div>

      <div className="glass-card w-full max-w-md p-8 relative z-10 shadow-2xl border-t-4 border-t-[var(--color-primary)] backdrop-blur-xl bg-black/60 rounded-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 text-white">Join StoryVerse</h1>
          <p className="text-gray-300">Create an account and start writing your world.</p>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-red-900/40 border border-red-500/50 text-red-300 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input py-2 bg-black/50 text-white border-gray-700 focus:border-[var(--color-primary)]"
              placeholder="Your pen name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input py-2 bg-black/50 text-white border-gray-700 focus:border-[var(--color-primary)]"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input py-2 bg-black/50 text-white border-gray-700 focus:border-[var(--color-primary)]"
              placeholder="Create a strong password (min 6 chars)"
              minLength={6}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 text-lg mt-6 shadow-lg shadow-indigo-500/30 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Creating account...
              </>
            ) : 'Create Account'}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-gray-400">
          Already have an account?{' '}
          <a href="/login" className="text-[var(--color-primary)] font-semibold hover:underline">
            Log in
          </a>
        </p>
      </div>
    </div>
  );
};

export default Register;
