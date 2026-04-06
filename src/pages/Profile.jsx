import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  ArrowLeft,
  Edit2,
  User,
  UserCircle,
  Wallet,
  Bell,
  Moon,
  Lock,
  LogOut,
  ChevronRight,
  Receipt,
  Users,
  UserPlus
} from 'lucide-react';

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(
    () => localStorage.getItem('theme') !== 'light'
  );

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setLoading(false);
    };
    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const toggleDarkMode = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    if (next) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const displayName = user?.user_metadata?.full_name || 'Alex Chen';
  const displayEmail = user?.email || '@alexchen';

  return (
    <div
      style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-text)' }}
      className="flex-1 flex flex-col font-sans w-full h-full relative max-w-md mx-auto"
    >
      {/* Header */}
      <header
        style={{ backgroundColor: 'var(--color-background)', borderBottomColor: 'var(--color-border)' }}
        className="absolute top-0 w-full z-50 backdrop-blur-xl flex items-center justify-between px-6 h-16 border-b transition-colors duration-200"
      >
        <button
          onClick={() => navigate(-1)}
          className="hover:bg-white/10 p-2 rounded-full transition-all active:scale-95"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
      </header>

      {/* Scrollable content — no scrollbar */}
      <main className="flex-1 overflow-y-auto pt-24 pb-32 px-6 w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

        {/* ── Profile hero ── */}
        <section className="flex flex-col items-center mb-10">
          <div className="relative mb-4">
            <div
              style={{ borderColor: 'var(--color-background)' }}
              className="w-24 h-24 rounded-full border-4 overflow-hidden shadow-2xl"
            >
              <img
                alt="Profile"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBl-tXvlXmWrVdTZHytesOcQWx0td47EXL6CbGyf6JE3p1QyXsy_rHjVEbz0Hz_J2s3OCrm-T0x30-R1hlUsVWezZJlLB0ExYWvZCT5Y5cC89jNUnHt10PgdkvZbC0oDU0G6dAu2A9iFz9wZrBtnpQsG6haL9XWWcXWSqYL3NpxLpo2U2ibuy3kF5pjYy2s5TkS-AxW_lzMdI7Hu6iYKeBet-MF9lod9Z7VGE0gpKj0gH2QAUbv6AVteUeIz4vY5drUM4vz2Lk4hxLv"
              />
            </div>
            <div
              style={{ borderColor: 'var(--color-background)' }}
              className="absolute bottom-0 right-0 bg-[#FF007F] text-text rounded-full p-1.5 border-4"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </div>
          </div>

          <h2 className="font-extrabold text-2xl tracking-tight mb-0.5">
            {loading ? '…' : displayName}
          </h2>
          <p style={{ color: 'var(--color-subtext)' }} className="font-medium text-sm mb-6">
            {loading ? '…' : displayEmail} •{' '}
            <span style={{ color: '#FF007F' }} className="font-bold">Premium Member</span>
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 w-full">
            {[
              { label: 'Member Since', value: '2021', valueColor: 'var(--color-text)' },
              { label: 'Total Splits',  value: '142',  valueColor: 'var(--color-secondary)' },
            ].map(({ label, value, valueColor }) => (
              <div
                key={label}
                style={{ backgroundColor: 'var(--color-subground)', borderColor: 'var(--color-border)' }}
                className="p-4 rounded-2xl border flex flex-col items-center justify-center transition-colors duration-200"
              >
                <span style={{ color: 'var(--color-subtext)' }} className="text-[10px] uppercase tracking-[0.15em] font-bold mb-1.5">{label}</span>
                <span style={{ color: valueColor }} className="font-black text-xl tabular-nums">{value}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Settings ── */}
        <div className="space-y-8">

          {/* Account */}
          <SettingsGroup title="Account">
            <SettingsRow icon={<User className="w-6 h-6" />} iconColor="#FF007F" label="Personal Information" />
            <SettingsRow icon={<Wallet className="w-6 h-6" />} iconColor="#FF007F" label="Payment Methods" />
          </SettingsGroup>

          {/* Preferences */}
          <SettingsGroup title="Preferences">
            <SettingsRow icon={<Bell className="w-6 h-6" />} iconColor="var(--color-secondary)" label="Push Notifications" />
            {/* Dark mode row — no chevron, has toggle */}
            <div className="flex items-center justify-between p-4 gap-4">
              <div className="flex items-center gap-4">
                <div style={{ color: 'var(--color-secondary)' }} className="flex items-center justify-center">
                  <Moon className="w-6 h-6" />
                </div>
                <span className="font-semibold">Dark Mode</span>
              </div>
              {/* Toggle */}
              <button
                onClick={toggleDarkMode}
                aria-pressed={isDarkMode}
                style={{ backgroundColor: isDarkMode ? '#FF007F' : '#555555' }}
                className="w-12 h-6 rounded-full relative transition-colors duration-200 focus:outline-none flex-shrink-0"
              >
                <span
                  style={{
                    position: 'absolute',
                    top: '4px',
                    left: isDarkMode ? '28px' : '4px',
                    width: '16px',
                    height: '16px',
                    backgroundColor: 'white',
                    borderRadius: '50%',
                    transition: 'left 0.2s ease',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                  }}
                />
              </button>
            </div>
          </SettingsGroup>

          {/* Security */}
          <SettingsGroup title="Security">
            <SettingsRow icon={<Lock className="w-6 h-6" />} iconColor="var(--color-text)" label="Change Password" />
          </SettingsGroup>

          {/* Log Out */}
          <div className="pt-4 flex flex-col items-center">
            <button
              onClick={handleSignOut}
              className="w-full py-4 px-6 rounded-full bg-[#FF007F]/10 border border-[#FF007F]/30 text-[#FF007F] font-extrabold hover:bg-[#FF007F]/20 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <LogOut className="w-5 h-5" />
              Log Out
            </button>
            <p style={{ color: 'var(--color-subtext)' }} className="mt-8 text-center text-[10px] font-bold tracking-[0.2em] uppercase tabular-nums">
              AA-Mate Version 1.0.0 (2026)
            </p>
          </div>
        </div>
      </main>

      {/* Bottom Nav — matches Dashboard */}
      <nav
        style={{ backgroundColor: 'var(--color-background)', borderTopColor: 'var(--color-border)' }}
        className="absolute bottom-0 w-full flex justify-around items-center px-6 pb-8 pt-4 backdrop-blur-xl border-t z-50"
      >
        <button onClick={() => navigate('/dashboard')} className="flex flex-col items-center justify-center text-subtext hover:text-text transition-colors active:scale-90">
          <Receipt className="w-6 h-6" />
          <span className="font-medium text-[10px] mt-1">Activity</span>
        </button>
        <button onClick={() => navigate('/dashboard')} className="flex flex-col items-center justify-center text-subtext hover:text-text transition-colors active:scale-90">
          <Users className="w-6 h-6" />
          <span className="font-medium text-[10px] mt-1">Groups</span>
        </button>
        <button onClick={() => navigate('/dashboard')} className="flex flex-col items-center justify-center text-subtext hover:text-text transition-colors active:scale-90">
          <UserPlus className="w-6 h-6" />
          <span className="font-medium text-[10px] mt-1">Friends</span>
        </button>
        <button className="flex flex-col items-center justify-center active:scale-90 transition-transform" style={{ color: '#FF007F' }}>
          <UserCircle className="w-6 h-6" />
          <span className="font-medium text-[10px] mt-1">Profile</span>
        </button>
      </nav>
    </div>
  );
}

/* ── Helper components ── */

function SettingsGroup({ title, children }) {
  return (
    <div>
      <h3 style={{ color: 'var(--color-subtext)' }} className="font-bold text-sm uppercase tracking-widest mb-3 ml-1">
        {title}
      </h3>
      <div
        style={{ backgroundColor: 'var(--color-subground)', borderColor: 'var(--color-border)' }}
        className="rounded-2xl border overflow-hidden divide-y transition-colors duration-200"
      >
        {children}
      </div>
    </div>
  );
}

function SettingsRow({ icon, iconColor, label }) {
  return (
    <div className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors cursor-pointer group">
      <div className="flex items-center gap-4">
        <div style={{ color: iconColor }} className="flex items-center justify-center">
          {icon}
        </div>
        <span className="font-semibold">{label}</span>
      </div>
      <ChevronRight style={{ color: 'var(--color-subtext)' }} className="w-6 h-6 group-hover:text-text transition-colors" />
    </div>
  );
}
