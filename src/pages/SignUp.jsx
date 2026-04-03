import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';

export default function SignUp() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex-1 flex flex-col h-full bg-black relative isolate font-sans text-white w-full">
      {/* Decorative Elements */}
      <div className="absolute -z-10 -bottom-24 -right-24 w-64 h-64 bg-accent-pink/10 blur-[80px] rounded-full pointer-events-none" />
      <div className="absolute -z-10 top-1/2 -left-32 w-48 h-48 bg-accent-pink/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Header */}
      <header className="bg-black/80 backdrop-blur-xl absolute top-0 left-0 w-full z-50 flex items-center justify-between px-6 h-16 border-b border-white/5">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/welcome')}
            className="text-white active:scale-95 duration-200 p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto w-full max-w-md mx-auto relative flex flex-col px-6 pt-24 pb-12 z-10">
        
        {/* Headline Section */}
        <div className="mb-10">
          <h1 className="font-sans font-extrabold text-4xl tracking-tight text-white mb-2">Create an Account</h1>
          <p className="text-white/80 text-sm">Join the future of kinetic social finance today.</p>
        </div>

        {/* Form Section */}
        <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); navigate('/dashboard'); }}>
          {/* Full Name Input */}
          <div className="flex gap-4">
            <div className="space-y-2 flex-1">
              <label className="text-xs font-bold uppercase tracking-widest text-white/60 ml-1">First Name</label>
              <input 
                type="text"
                className="w-full bg-[#121212] border border-white/10 rounded-2xl py-4 px-5 text-white placeholder:text-white/20 focus:ring-2 focus:ring-accent-pink/50 focus:border-transparent transition-all outline-none" 
                placeholder="Daniel" 
                required
              />
            </div>
            <div className="space-y-2 flex-1">
              <label className="text-xs font-bold uppercase tracking-widest text-white/60 ml-1">Last Name</label>
              <input 
                type="text"
                className="w-full bg-[#121212] border border-white/10 rounded-2xl py-4 px-5 text-white placeholder:text-white/20 focus:ring-2 focus:ring-accent-pink/50 focus:border-transparent transition-all outline-none" 
                placeholder="Hafiz" 
                required
              />
            </div>
          </div>

          {/* Email Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-white/60 ml-1">Email Address</label>
            <input 
              type="email"
              className="w-full bg-[#121212] border border-white/10 rounded-2xl py-4 px-5 text-white placeholder:text-white/20 focus:ring-2 focus:ring-accent-pink/50 focus:border-transparent transition-all outline-none" 
              placeholder="name@example.com" 
              required
            />
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-white/60 ml-1">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'}
                className="w-full bg-[#121212] border border-white/10 rounded-2xl py-4 px-5 text-white placeholder:text-white/20 focus:ring-2 focus:ring-accent-pink/50 focus:border-transparent transition-all outline-none" 
                placeholder="••••••••" 
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Action Section */}
          <div className="pt-6">
            <button 
              type="submit"
              className="w-full bg-accent-pink text-white font-sans font-extrabold py-4 rounded-full text-lg tracking-tight active:scale-[0.98] duration-200 transition-transform shadow-[0_0_20px_rgba(255,0,127,0.3)]"
            >
              Sign Up
            </button>
            <p className="mt-4 text-center text-[11px] text-white/60 px-4 leading-relaxed">
              By signing up, you agree to our <span className="underline decoration-white/20 cursor-pointer">Terms of Service</span> and <span className="underline decoration-white/20 cursor-pointer">Privacy Policy</span>.
            </p>
          </div>
        </form>

        {/* Footer Section */}
        <footer className="mt-auto pt-8 flex justify-center pb-4">
          <p className="text-center text-white/80 text-sm">
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
