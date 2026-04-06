import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleLogin(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw authError;
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-bg relative isolate font-sans text-text w-full">
      {/* Header */}
      <header className="bg-bg/80 backdrop-blur-xl absolute top-0 left-0 w-full z-50 flex items-center justify-between px-6 h-16 border-b border-border">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/welcome')}
            className="flex items-center justify-center p-2 rounded-full hover:bg-white/10 transition-colors active:scale-95 duration-200"
          >
            <ArrowLeft className="w-6 h-6 text-text" />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto w-full max-w-md mx-auto relative flex flex-col px-6 pt-24 pb-10">
        {/* Hero Section */}
        <div className="mb-10">
          <h1 className="font-sans text-4xl font-extrabold tracking-tight text-text mb-2">Welcome Back!</h1>
          <p className="text-subtext text-lg">Sign in to continue your kinetic journey.</p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 px-4 py-3 rounded-2xl bg-[#FF007F]/10 border border-[#FF007F]/30 text-[#FF007F] text-sm font-medium">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form className="space-y-6 flex flex-col" onSubmit={handleLogin}>
          {/* Email Input */}
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest font-bold text-subtext ml-4 px-1" htmlFor="email">
              Email Address
            </label>
            <div className="relative group">
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-subground border border-border rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-accent-pink/40 focus:border-accent-pink transition-all text-text placeholder:text-subtext/50"
                placeholder="name@example.com"
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest font-bold text-subtext ml-4 px-1" htmlFor="password">
              Password
            </label>
            <div className="relative group">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-subground border border-border rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-accent-pink/40 focus:border-accent-pink transition-all text-text placeholder:text-subtext/50"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-subtext hover:text-text transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <div className="flex justify-end pt-1">
              <a href="#" className="text-sm font-medium text-subtext hover:text-text transition-colors">Forgot Password?</a>
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full text-text font-sans font-extrabold text-lg py-4 rounded-full active:scale-[0.98] transition-all hover:brightness-110 bg-accent-pink dark:drop-shadow-[0_8px_32px_rgba(255,0,127,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in…' : 'Log In'}
            </button>
          </div>
        </form>

        {/* Footer */}
        <footer className="mt-auto pt-10 pb-4 text-center">
          <p className="text-subtext text-sm">
            Don't have an account?
            <button onClick={() => navigate('/signup')} className="font-bold ml-1 hover:underline text-accent-pink">
              Sign up instead
            </button>
          </p>
        </footer>
      </div>
    </div>
  );
}
