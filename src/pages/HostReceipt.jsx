import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus, Users, UtensilsCrossed } from 'lucide-react';

export default function HostReceipt() {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col h-full bg-black relative isolate font-sans text-white w-full overflow-hidden">
      
      {/* Background elements */}
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

      {/* Main Flow */}
      <main className="flex-1 pt-24 pb-12 px-6 overflow-y-auto space-y-8 z-10 no-scrollbar">
        {/* Status */}
        <section className="flex flex-col items-center text-center space-y-4">
          <div className="bg-[#eab308]/10 text-[#eab308] px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase border border-[#eab308]/20">
            WAITING FOR CLAIMS
          </div>
          <div className="space-y-1">
            <p className="text-white/60 text-sm font-medium">Receipt Total</p>
            <h1 className="text-5xl font-extrabold tabular-nums tracking-tighter text-white">
              RM 128.80
            </h1>
          </div>
        </section>

        {/* Actions */}
        <section className="space-y-4">
          <button className="w-full bg-accent-pink py-4 rounded-full flex items-center justify-center gap-3 active:scale-[0.98] transition-transform drop-shadow-[0_4px_24px_rgba(255,0,127,0.4)]">
            <UserPlus className="w-5 h-5 text-white" />
            <span className="text-white font-bold text-lg tracking-tight">Share Tab</span>
          </button>
          <div className="bg-[#111111]/50 backdrop-blur-md border border-white/5 p-1.5 pl-5 rounded-full flex items-center justify-between">
            <span className="text-[#9ca3af] text-xs font-medium truncate">aa-mate.app/t/mrni-892</span>
            <button className="bg-[#1e1b1f] text-white px-6 py-2.5 rounded-full text-[10px] font-bold tracking-widest uppercase hover:bg-white/10 transition-colors">
              Copy
            </button>
          </div>
        </section>

        {/* Metrics */}
        <section className="flex gap-4">
          <div className="flex-1 p-4 bg-[#111111]/50 border border-white/5 rounded-2xl flex flex-col gap-2">
            <span className="text-[10px] uppercase tracking-widest text-white/50 font-bold">CATEGORY</span>
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="w-4 h-4 text-accent-green" />
              <span className="text-xs font-bold text-white">Dining & Social</span>
            </div>
          </div>
          <div className="flex-1 p-4 bg-[#111111]/50 border border-white/5 rounded-2xl flex flex-col gap-2">
            <span className="text-[10px] uppercase tracking-widest text-white/50 font-bold">SPLIT MODE</span>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-accent-pink" />
              <span className="text-xs font-bold text-white">Item Claim</span>
            </div>
          </div>
        </section>

        {/* Breakdown */}
        <section className="space-y-4">
          <h2 className="text-white/50 text-[10px] font-bold tracking-widest uppercase px-1">Items Breakdown</h2>
          <div className="bg-[#111111]/50 backdrop-blur-md border border-white/5 rounded-2xl p-6 relative overflow-hidden">
            <div className="flex justify-between items-start mb-8 relative z-10">
              <div>
                <h3 className="font-bold text-xl text-white">Murni Discovery</h3>
                <p className="text-white/50 text-[10px] mt-1 uppercase tracking-wider font-bold">OCT 24, 2023 • 08:42 PM</p>
              </div>
            </div>

            <div className="space-y-5 relative z-10">
              <div className="flex justify-between items-start group">
                <div className="flex flex-col">
                  <span className="text-white/90 text-sm font-semibold">Signature Wagyu Burger</span>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-[10px] font-bold text-[#9ca3af] tracking-wider uppercase">Claimed by</span>
                    <span className="text-[10px] font-extrabold text-[#23e4ff] tracking-wider uppercase">Alex</span>
                    <span className="text-[10px] font-extrabold text-[#9ca3af] tracking-wider">&</span>
                    <span className="text-[10px] font-extrabold text-accent-pink tracking-wider uppercase">Sarah</span>
                  </div>
                </div>
                <span className="text-white tabular-nums font-semibold tracking-tight">RM 68.00</span>
              </div>
              <div className="flex justify-between items-start group">
                <div className="flex flex-col">
                  <span className="text-white/90 text-sm font-semibold">Neon Gin & Tonic</span>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-[10px] font-bold text-[#9ca3af] tracking-wider uppercase">Claimed by</span>
                    <span className="text-[10px] font-extrabold text-accent-pink tracking-wider uppercase">Sarah</span>
                  </div>
                </div>
                <span className="text-white tabular-nums font-semibold tracking-tight">RM 38.00</span>
              </div>
              <div class="flex justify-between items-start group">
                  <div class="flex flex-col">
                      <span class="text-white/90 text-sm font-semibold">Truffle Fries</span>
                      <div class="flex items-center gap-1 mt-0.5">
                          <span class="text-[10px] font-bold text-white/50 tracking-wider uppercase">Claimed by</span>
                          <div class="flex items-center gap-1">
                              <span class="text-[10px] font-extrabold text-[#23e4ff] tracking-wider uppercase">Alex</span>
                              <span class="text-[10px] font-extrabold text-[#9ca3af] tracking-wider">&amp;</span>
                              <span class="text-[10px] font-extrabold text-accent-pink tracking-wider uppercase">Marcus</span>
                          </div>
                      </div>
                  </div>
                  <span class="text-white tabular-nums font-semibold tracking-tight">RM 22.80</span>
              </div>
            </div>

            <div className="my-6 border-t border-dashed border-white/10" />

            <div className="space-y-3 relative z-10 mb-6">
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-[#9ca3af]">
                <span>Subtotal</span>
                <span className="tabular-nums">RM 128.80</span>
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
                RM 128.80
              </span>
            </div>
          </div>
        </section>

        {/* Participant Shares */}
        <section className="space-y-4">
          <h2 className="text-[#9ca3af] text-[10px] font-bold tracking-widest uppercase px-1">Participant Shares</h2>
          <div className="space-y-3">
            <div className="bg-[#111111]/50 backdrop-blur-md border border-white/5 flex justify-between items-center p-5 rounded-2xl">
              <div className="flex flex-col">
                <span className="text-white font-bold text-base">Alex (You)</span>
                <span className="text-[10px] font-extrabold text-[#23e4ff] tracking-widest uppercase">HOST</span>
              </div>
              <span className="tabular-nums font-extrabold text-xl text-white">RM 42.93</span>
            </div>
            <div className="bg-[#111111]/50 backdrop-blur-md border border-white/5 flex justify-between items-center p-5 rounded-2xl">
              <div className="flex flex-col">
                <span className="text-white font-bold text-base">Sarah Chen</span>
                <span className="text-[10px] font-extrabold text-accent-pink tracking-widest uppercase">PENDING PAYMENT</span>
              </div>
              <span className="tabular-nums font-extrabold text-xl text-white">RM 42.93</span>
            </div>
            <div className="bg-[#111111]/50 backdrop-blur-md border border-white/5 flex justify-between items-center p-5 rounded-2xl">
              <div className="flex flex-col">
                <span className="text-white font-bold text-base">Marcus Holloway</span>
                <span className="text-[10px] font-extrabold text-accent-pink tracking-widest uppercase">PENDING PAYMENT</span>
              </div>
              <span className="tabular-nums font-extrabold text-xl text-white">RM 42.94</span>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
