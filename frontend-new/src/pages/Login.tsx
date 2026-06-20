import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setAuth } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await authAPI.login(username, password);
      setAuth(res.data.token, res.data.username, res.data.role);
      navigate('/');
    } catch {
      setError('Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative"
      style={{
        backgroundImage: 'url(/ram-aircraft-bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center 60%',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(13, 27, 46, 0.72)' }}
      />

      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="w-full max-w-sm mx-auto">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Red header band */}
          <div className="bg-[#C41E3A] h-1.5" />

          <div className="p-8">
            {/* Logo */}
            <div className="flex flex-col items-center mb-8">
              <img
                src="/ram-logo.png"
                alt="Royal Air Maroc"
                className="h-14 object-contain mb-4"
              />
              <h1 className="text-lg font-semibold text-gray-800">
                CabineIQ
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">
                Royal Air Maroc — Internal Operations
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label
                  className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wider"
                >
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-[#C41E3A] focus:ring-1 focus:ring-[#C41E3A]/20 transition-colors placeholder:text-gray-300"
                  required
                />
              </div>

              <div>
                <label
                  className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wider"
                >
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-[#C41E3A] focus:ring-1 focus:ring-[#C41E3A]/20 transition-colors placeholder:text-gray-300"
                  required
                />
              </div>

              {error && (
                <p className="text-xs text-[#C41E3A] text-center bg-red-50 py-2 rounded-lg">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#C41E3A] text-white rounded-lg py-2.5 text-sm font-medium hover:bg-[#a01830] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <p className="text-center text-xs text-gray-300 mt-6">
              Royal Air Maroc © 2026 — Confidential
            </p>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}

