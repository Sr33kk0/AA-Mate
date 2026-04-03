import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, UtensilsCrossed } from 'lucide-react';

export default function ClientReceiptSettled() {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col h-full bg-black relative isolate font-sans text-white w-full overflow-hidden">
      
      {/* Background glow */}
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-accent-pink/10 blur-[100px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-1/2 -right-24 w-48 h-48 bg-accent-green/5 blur-[80px] rounded-full pointer-events-none -z-10" />

      {/* Header */}
      <header className="absolute top-0 w-full z-50 bg-black/60 backdrop-blur-xl border-b border-white/5 h-16 px-6 flex items-center justify-between">
        <button 
          onClick={() => navigate('/dashboard')}
          className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
      </header>

      {/* Main flow */}
      <main className="flex-1 pt-24 pb-32 px-6 overflow-y-auto space-y-8 z-10 no-scrollbar">
        <section className="flex flex-col items-center justify-center text-center pb-4">
          <div className="mb-4">
            <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-accent-green text-black text-[10px] font-bold tracking-widest uppercase border border-accent-green/20">PAID</span>
          </div>
          <h2 className="font-extrabold text-5xl tracking-tighter tabular-nums text-white mb-3">
            RM 13.34
          </h2>
          <p className="text-[#9ca3af] text-sm max-w-[240px] leading-relaxed">
            Payment confirmed by <span className="text-white font-medium">Daniel</span>. Your split is now settled.
          </p>
        </section>

        <section className="bg-[#111111]/50 backdrop-blur-md border border-white/5 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent-pink/5 blur-[40px] -mr-16 -mt-16" />
          
          <div className="flex justify-between items-start mb-8 relative z-10">
            <div>
              <h3 className="font-bold text-xl text-white">Murni Discovery</h3>
              <p className="text-[#9ca3af] text-[10px] mt-1 uppercase tracking-wider font-bold">Oct 24, 2023 • 08:42 PM</p>
            </div>
          </div>

          <div className="space-y-5 relative z-10">
            <div className="flex justify-between items-center group">
              <span className="text-white/80 text-sm">Nasi Lemak Special</span>
              <span className="text-white tabular-nums font-semibold tracking-tight">RM 10.00</span>
            </div>
            <div className="flex justify-between items-center group">
              <span className="text-white/80 text-sm">Teh Tarik</span>
              <span className="text-white tabular-nums font-semibold tracking-tight">RM 3.34</span>
            </div>
          </div>

          <div className="my-6 border-t border-dashed border-white/10" />

          <div className="space-y-3 relative z-10 mb-6">
            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-[#9ca3af]">
              <span>Subtotal</span>
              <span className="tabular-nums">RM 13.34</span>
            </div>
            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-[#9ca3af]">
              <span>Service Charge (10%)</span>
              <span className="tabular-nums text-accent-pink/70">Included</span>
            </div>
            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-[#9ca3af]">
              <span>SST (6%)</span>
              <span className="tabular-nums text-accent-pink/70">Included</span>
            </div>
          </div>

          <div className="h-[1px] bg-white/5 mb-6" />

          <div className="flex justify-between items-center relative z-10">
            <span className="font-bold text-lg text-white">Total Spent</span>
            <span className="font-black text-2xl tabular-nums text-accent-pink drop-shadow-[0_0_12px_rgba(255,0,127,0.4)]">
              RM 13.34
            </span>
          </div>
        </section>

        <section className="flex gap-4">
          <div className="flex-1 p-4 bg-[#111111]/50 border border-white/5 rounded-2xl flex flex-col gap-2">
            <span className="text-[10px] uppercase tracking-widest text-[#9ca3af] font-bold">CATEGORY</span>
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="text-sm text-accent-green" />
              <span className="text-xs font-bold text-white">Dining & Social</span>
            </div>
          </div>
          <div className="flex-1 p-4 bg-[#111111]/50 border border-white/5 rounded-2xl flex flex-col gap-2">
            <span className="text-[10px] uppercase tracking-widest text-[#9ca3af] font-bold">SPLIT MODE</span>
            <div className="flex items-center gap-2">
              <Users className="text-sm text-accent-pink" />
              <span className="text-xs font-bold text-white">Item Claim</span>
            </div>
          </div>
        </section>
      </main>

      <footer className="absolute bottom-0 w-full p-8 z-50 bg-gradient-to-t from-black via-black/90 to-transparent">
        <button 
          onClick={() => navigate('/dashboard')}
          className="w-full h-14 bg-[#111111] text-accent-pink border border-accent-pink/50 font-bold rounded-full transition-all active:scale-[0.98] drop-shadow-[0_4px_24px_rgba(255,0,127,0.2)] flex items-center justify-center"
        >
          Return to Dashboard
        </button>
      </footer>
    </div>
  );
}
