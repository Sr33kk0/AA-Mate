import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Camera, Receipt, Users, UserPlus, UserCircle } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex w-full max-w-md mx-auto h-full bg-black relative flex-col">
      {/* Header */}
      <header className="bg-black/80 backdrop-blur-xl absolute top-0 z-50 flex justify-between items-center w-full px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <Menu className="w-6 h-6 text-white hover:opacity-80 transition-opacity active:scale-95 duration-200 ease-out cursor-pointer" />
          <h1 className="text-xl font-bold tracking-tight text-white font-sans">AA-Mate</h1>
        </div>
        <div 
          className="w-10 h-10 rounded-full border border-white/10 overflow-hidden hover:opacity-80 transition-opacity active:scale-95 duration-200 cursor-pointer"
        >
          <img 
            alt="User Profile" 
            className="w-full h-full object-cover" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuB04hfs9-r7Z3uS2588xEf5MJeC0wOZooy03L9EZqQ_iRvu6sQb_oBmV4IMMWYSTHtFIYI8VSMSPYwe28Dh1YluHZHdJRBb5q2dRrESvqxCr_VBBXvjxC8b7P7_wG3RM7oZFM7ijmIiGJhAjGv32R06znQt6Afkk_H2z_3rbgl0Bm-WGfzyuV-ku6NwxC9AkVS9xtKo3jiFj22_lc9cGu67DS2AXFoLmNgbwgHjTwtaxh5IWvMstSrm1xOnlgP4PLzwkcgjWVVLh6WA" 
          />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto px-6 pt-24 pb-32 space-y-8 scroll-smooth z-10 font-sans">
        
        {/* Balance Section */}
        <section className="grid grid-cols-2 gap-4">
          <div className="bg-[#111111] border border-white/5 rounded-2xl p-5 flex flex-col justify-between h-32 hover:bg-white/5 transition-colors">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white">You Owe</span>
            <div className="flex flex-col">
              <span className="text-2xl font-black text-accent-pink tabular-nums drop-shadow-[0_0_12px_rgba(255,0,127,0.4)]">RM 21.46</span>
            </div>
          </div>
          <div className="bg-[#111111] border border-white/5 rounded-2xl p-5 flex flex-col justify-between h-32 hover:bg-white/5 transition-colors">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white">Owed to You</span>
            <div className="flex flex-col">
              <span className="text-2xl font-black text-accent-green tabular-nums drop-shadow-[0_0_12px_rgba(74,222,128,0.4)]">RM 22.40</span>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="flex bg-[#1a1c22] p-1 rounded-xl w-full border border-white/5">
          <button className="flex-1 bg-white text-black font-bold py-2.5 rounded-lg text-xs active:scale-95 transition-transform">
            Active Tabs
          </button>
          <button className="flex-1 text-white font-medium py-2.5 rounded-lg text-xs hover:text-white transition-colors">
            Settled
          </button>
        </section>

        {/* History List */}
        <section className="space-y-4">
          <div className="flex justify-between items-end mb-4">
            <h2 className="text-lg font-bold tracking-tight text-white">Recent Splits</h2>
            <span className="text-xs text-white font-medium hover:underline cursor-pointer">View All</span>
          </div>

          <div className="space-y-3">
            {/* Host Item */}
            <div 
              onClick={() => navigate('/host-receipt')}
              className="bg-[#111111] border border-white/5 rounded-2xl p-4 flex items-center justify-between group active:scale-[0.98] transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center border border-white/10">
                  <span className="text-accent-pink font-black text-xl">M</span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white text-sm">Murni Discovery</h3>
                    <span className="text-[10px] text-white/60 font-medium">(Host)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                    <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-tighter">Verification Needed</span>
                  </div>
                  <p className="text-[10px] text-white/60 font-medium">Oct 24, 2023 • 4 Participants</p>
                </div>
              </div>
            </div>

            {/* Client Item */}
            <div 
              onClick={() => navigate('/client-receipt')}
              className="bg-[#111111] border border-white/5 rounded-2xl p-4 flex items-center justify-between group active:scale-[0.98] transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center border border-white/10">
                  <span className="text-accent-green font-black text-xl">S</span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white text-sm">Sae Ma Eul BBQ</h3>
                    <span className="text-[10px] text-white/60 font-medium">(Guest)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-green" />
                    <span className="text-[10px] font-bold text-accent-green uppercase tracking-tighter">Pending Payment</span>
                  </div>
                  <p className="text-[10px] text-white/60 font-medium">Oct 22, 2023 • 6 Participants</p>
                </div>
              </div>
            </div>

          </div>
        </section>
      </main>

      {/* Floating Action Button */}
      <div className="absolute bottom-28 left-0 right-0 px-8 z-40 pointer-events-none">
        <button className="bg-accent-pink pointer-events-auto text-white w-full py-4 rounded-full shadow-[0_4px_24px_rgba(255,0,127,0.4)] flex items-center justify-center gap-2 active:scale-[0.98] transition-transform font-bold text-sm">
          <Camera className="w-5 h-5" />
          Scan Receipt
        </button>
      </div>

      {/* Bottom Nav */}
      <nav className="absolute bottom-0 w-full flex justify-around items-center px-6 pb-8 pt-4 bg-black/80 backdrop-blur-xl border-t border-white/5 z-50">
        <button onClick={() => navigate('/dashboard')} className="flex flex-col items-center justify-center text-accent-pink active:scale-90 transition-transform">
          <Receipt className="w-6 h-6" />
          <span className="font-medium text-[10px] font-sans mt-1">Activity</span>
        </button>
        <button onClick={() => navigate('/dashboard')} className="flex flex-col items-center justify-center text-white/60 hover:text-white transition-colors active:scale-90">
          <Users className="w-6 h-6" />
          <span className="font-medium text-[10px] font-sans mt-1">Groups</span>
        </button>
        <button onClick={() => navigate('/dashboard')} className="flex flex-col items-center justify-center text-white/60 hover:text-white transition-colors active:scale-90">
          <UserPlus className="w-6 h-6" />
          <span className="font-medium text-[10px] font-sans mt-1">Friends</span>
        </button>
        <button onClick={() => navigate('/profile')} className="flex flex-col items-center justify-center text-white/60 hover:text-white transition-colors active:scale-90">
          <UserCircle className="w-6 h-6" />
          <span className="font-medium text-[10px] font-sans mt-1">Profile</span>
        </button>
      </nav>
    </div>
  );
}
