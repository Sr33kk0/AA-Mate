import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex-1 flex flex-col h-full bg-black relative isolate font-sans text-white w-full">
      {/* Background Accents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] right-[-10%] w-[80vw] h-[80vw] bg-accent-pink/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-5%] left-[-10%] w-[60vw] h-[60vw] bg-accent-green/10 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <header className="bg-black/80 backdrop-blur-xl absolute top-0 left-0 w-full z-50 flex items-center justify-between px-6 h-16 border-b border-white/5">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/welcome')}
            className="flex items-center justify-center p-2 rounded-full hover:bg-white/10 transition-colors active:scale-95 duration-200"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto w-full max-w-md mx-auto relative flex flex-col px-6 pt-24 pb-10">
        {/* Hero Section */}
        <div className="mb-10">
          <h1 className="font-sans text-4xl font-extrabold tracking-tight text-white mb-2">Welcome Back!</h1>
          <p className="text-white/70 text-lg">Sign in to continue your kinetic journey.</p>
        </div>

        {/* Login Form */}
        <form className="space-y-6 flex flex-col" onSubmit={(e) => { e.preventDefault(); navigate('/dashboard'); }}>
          {/* Email Input */}
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest font-bold text-white/60 ml-4 px-1" htmlFor="email">
              Email Address
            </label>
            <div className="relative group">
              <input 
                id="email" 
                type="email" 
                className="w-full bg-[#121212] border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-accent-pink/40 focus:border-accent-pink transition-all text-white placeholder:text-white/30" 
                placeholder="name@example.com"
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest font-bold text-white/60 ml-4 px-1" htmlFor="password">
              Password
            </label>
            <div className="relative group">
              <input 
                id="password" 
                type={showPassword ? 'text' : 'password'} 
                className="w-full bg-[#121212] border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-accent-pink/40 focus:border-accent-pink transition-all text-white placeholder:text-white/30" 
                placeholder="••••••••"
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <div className="flex justify-end pt-1">
              <a href="#" className="text-sm font-medium text-white/60 hover:text-white transition-colors">Forgot Password?</a>
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="pt-4">
            <button 
              type="submit"
              className="w-full text-white font-sans font-extrabold text-lg py-4 rounded-full active:scale-[0.98] transition-all hover:brightness-110 bg-accent-pink drop-shadow-[0_8px_32px_rgba(255,0,127,0.2)]"
            >
              Log In
            </button>
          </div>
        </form>

        {/* Footer */}
        <footer className="mt-auto pt-10 pb-4 text-center">
          <p className="text-white/60 text-sm">
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
