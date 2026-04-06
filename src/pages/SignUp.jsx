import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function SignUp() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSignUp(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // 1. Create auth user
      const { data, error: authError } = await supabase.auth.signUp({ email, password });
      if (authError) throw authError;

      // 2. Insert profile row — id matches auth.uid() so RLS works immediately
      const { error: insertError } = await supabase
        .from('users')
        .insert({ id: data.user.id, first_name: firstName, last_name: lastName, email });
      if (insertError) throw insertError;

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
            className="text-text active:scale-95 duration-200 p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto w-full max-w-md mx-auto relative flex flex-col px-6 pt-24 pb-12 z-10">

        {/* Headline Section */}
        <div className="mb-10">
          <h1 className="font-sans font-extrabold text-4xl tracking-tight text-text mb-2">Create an Account</h1>
          <p className="text-text/80 text-sm">Join the future of kinetic social finance today.</p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 px-4 py-3 rounded-2xl bg-[#FF007F]/10 border border-[#FF007F]/30 text-[#FF007F] text-sm font-medium">
            {error}
          </div>
        )}

        {/* Form Section */}
        <form className="space-y-5" onSubmit={handleSignUp}>
          {/* Name Row */}
          <div className="flex gap-4">
            <div className="space-y-2 flex-1">
              <label className="text-xs font-bold uppercase tracking-widest text-subtext ml-1">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                className="w-full bg-subground border border-border rounded-2xl py-4 px-5 text-text placeholder:text-subtext/40 focus:ring-2 focus:ring-accent-pink/50 focus:border-transparent transition-all outline-none"
                placeholder="Daniel"
                required
              />
            </div>
            <div className="space-y-2 flex-1">
              <label className="text-xs font-bold uppercase tracking-widest text-subtext ml-1">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                className="w-full bg-subground border border-border rounded-2xl py-4 px-5 text-text placeholder:text-subtext/40 focus:ring-2 focus:ring-accent-pink/50 focus:border-transparent transition-all outline-none"
                placeholder="Hafiz"
                required
              />
            </div>
          </div>

          {/* Email Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-subtext ml-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-subground border border-border rounded-2xl py-4 px-5 text-text placeholder:text-subtext/40 focus:ring-2 focus:ring-accent-pink/50 focus:border-transparent transition-all outline-none"
              placeholder="name@example.com"
              required
            />
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-subtext ml-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-subground border border-border rounded-2xl py-4 px-5 text-text placeholder:text-subtext/40 focus:ring-2 focus:ring-accent-pink/50 focus:border-transparent transition-all outline-none"
                placeholder="••••••••"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-subtext/60 hover:text-text transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Action Section */}
          <div className="pt-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent-pink text-text font-sans font-extrabold py-4 rounded-full text-lg tracking-tight active:scale-[0.98] duration-200 transition-transform dark:shadow-[0_0_20px_rgba(255,0,127,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account…' : 'Sign Up'}
            </button>
            <p className="mt-4 text-center text-[11px] text-subtext px-4 leading-relaxed">
              By signing up, you agree to our <span className="underline decoration-white/20 cursor-pointer">Terms of Service</span> and <span className="underline decoration-white/20 cursor-pointer">Privacy Policy</span>.
            </p>
          </div>
        </form>

        {/* Footer Section */}
        <footer className="mt-auto pt-8 flex justify-center pb-4">
          <p className="text-center text-text/80 text-sm">
            Already have an account?
            <button onClick={() => navigate('/login')} className="text-accent-pink font-bold hover:brightness-110 transition-all ml-1">
              Log in instead
            </button>
          </p>
        </footer>
      </div>
    </div>
  );
}
