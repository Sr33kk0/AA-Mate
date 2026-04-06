import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col h-full bg-bg relative isolate text-text font-sans w-full">
      {/* Background Asset */}
      <div className="hidden dark:block absolute inset-0 -z-10 pointer-events-none opacity-[0.1]">
        <img
          alt="Kinetic abstract background"
          className="w-full h-full object-cover"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuANICbxiSQ42KlipONQkVL30ZBpu0YeTdgS00L3GYJaGbptLbkeKHDUKagY4QAffjS4EtJOUNhqDtP9otNJtjE3j7KUArNKe-dgVn5G77ujIV5-PsXStwBlJLUZyX72zUF5NEiFYpPUGyGmJzEGdUcpr0T6DSqPJu8LQg_ZsCo73fLKgrXqQraPUjkz-bG-yqjLiKYClFvHdFFSkZ7FGzqkYTVlWSUIExLf9tWU9TvJ-Qb4bFMqhcKQ1P1gIbocS6uPSFAh3Db354K7"
        />
      </div>

      <header className="flex items-center justify-center h-20 w-full z-50">
        <span className="font-sans font-black tracking-tighter text-3xl text-text">AA-Mate</span>
      </header>

{/* Visual Centerpiece */}
      <main className="flex-1 flex flex-col items-center justify-center relative px-6 text-center z-10 w-full">
        <div className="relative w-72 h-72 flex items-center justify-center">
          {/* Center Icon */}
          <div className="bg-white/5 backdrop-blur-[12px] border border-border w-32 h-32 rounded-full flex items-center justify-center z-20 overflow-hidden dark:shadow-[0_0_24px_rgba(255,0,127,0.4)]">
            <img 
              alt="AA-Mate Logo" 
              className="w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida/ADBb0ujbzya0Tw-SsPTnnl41nS-fZ_bOWaOHrozNdYpP6I9_6dCmvG88a2rTnJERK-7UnwOSeQCxwXf03zPrq1Acev-Fa2BrtL-t0b1JcHT4dTOPbDljQVyTzMqIBSTSanQHXTqyWNP8K5FqDB4KQWsCXsCPg6IAiQ3uHyWRbPO-B5OGm_poohRlkk5XnH1pvxre7nIZgqUODAQj2tPmelrxHe7BGlCMTRMLnaNNgxWKzHurgU9r31Yh8pWzwCUSiov0xXdmE8_epSQadAE" 
            />
          </div>
          {/* Ambient Glow */}
          <div className="hidden dark:block absolute inset-0 bg-accent-pink/5 rounded-full blur-3xl scale-125 -z-10" />
        </div>

        {/* Typography */}
        <div className="mt-12 px-4">
          <h1 className="font-sans font-extrabold text-4xl tracking-tight leading-tight text-text">
            Start splitting <span className="text-accent-pink">seamlessly!</span>
          </h1>
          <p className="mt-4 text-[#ababab] text-lg leading-relaxed max-w-sm mx-auto">
            The premium way to manage group expenses and settle instantly.
          </p>
        </div>
      </main>

      {/* Actions */}
      <footer className="pb-12 pt-6 px-6 flex flex-col gap-4 w-full z-10">
        <button 
          onClick={() => navigate('/login')}
          className="w-full h-16 text-text font-sans font-bold text-lg rounded-full active:scale-[0.98] transition-all bg-accent-pink dark:drop-shadow-[0_4px_24px_rgba(255,0,127,0.4)]"
        >
          Log In
        </button>
        <button 
          onClick={() => navigate('/signup')}
          className="w-full h-16 text-text font-sans font-bold text-lg rounded-full active:scale-[0.98] transition-all bg-subground border border-border"
        >
          Sign Up
        </button>
        <p className="text-center text-[#ababab]/40 text-xs uppercase tracking-widest mt-4">
          POWERED BY NEON KINETIC ENGINE
        </p>
      </footer>
    </div>
  );
}
