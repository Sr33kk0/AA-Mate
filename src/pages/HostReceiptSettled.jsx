import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Utensils, Users, CheckCircle2 } from 'lucide-react';

export default function HostReceiptSettled() {
  const navigate = useNavigate();

  return (
    <div className="flex-1 w-full max-w-md mx-auto h-full bg-black text-white font-sans selection:bg-[#FF007F]/30 relative flex flex-col">
      {/* TopAppBar */}
      <header className="absolute top-0 z-50 bg-black/60 backdrop-blur-xl border-b border-white/5 flex justify-between items-center w-full px-6 h-16">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)}
            className="hover:bg-white/10 transition-colors p-2 -ml-2 rounded-full active:scale-95 duration-150 flex items-center justify-center text-white"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        </div>
        <div className="flex items-center"></div>
      </header>

      <main className="flex-1 pt-24 pb-12 px-6 space-y-8 relative overflow-y-auto scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
        {/* Ambient Background Glows */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-[#FF007F]/10 blur-[100px] rounded-full -z-10"></div>
        <div className="absolute top-1/2 -right-24 w-48 h-48 bg-[#4ade80]/5 blur-[80px] rounded-full -z-10"></div>

        {/* Hero Section */}
        <section className="flex flex-col items-center text-center space-y-4">
          <div className="bg-[#00FF87]/10 text-[#00FF87] px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase border border-[#00FF87]/20">
            FULLY SETTLED
          </div>
          <div className="space-y-1">
            <p className="text-[#9ca3af] text-sm font-medium">Receipt Total</p>
            <h1 className="text-5xl font-extrabold tabular-nums tracking-tighter text-white">
              RM 128.80
            </h1>
          </div>
        </section>

        {/* Metric Cards */}
        <section className="flex gap-4">
          <div className="flex-1 p-4 bg-[#111111]/50 border border-white/5 rounded-2xl flex flex-col gap-2">
            <span className="text-[10px] uppercase tracking-widest text-[#9ca3af] font-bold">CATEGORY</span>
            <div className="flex items-center gap-2">
              <Utensils className="w-4 h-4 text-[#4ade80]" />
              <span className="text-xs font-bold text-white">Dining & Social</span>
            </div>
          </div>
          <div className="flex-1 p-4 bg-[#111111]/50 border border-white/5 rounded-2xl flex flex-col gap-2">
            <span className="text-[10px] uppercase tracking-widest text-[#9ca3af] font-bold">SPLIT MODE</span>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#FF007F]" />
              <span className="text-xs font-bold text-white">Item Claim</span>
            </div>
          </div>
        </section>

        {/* Items Breakdown */}
        <section className="space-y-4">
          <h2 className="text-[#9ca3af] text-[10px] font-bold tracking-widest uppercase px-1">Items Breakdown</h2>
          <div className="bg-[#111111]/50 backdrop-blur-md border border-white/5 rounded-2xl p-6 relative overflow-hidden">
            {/* Restaurant Header */}
            <div className="flex justify-between items-start mb-8 relative z-10">
              <div>
                <h3 className="font-bold text-xl text-white">Murni Discovery</h3>
                <p className="text-[#9ca3af] text-[10px] mt-1 uppercase tracking-wider font-bold">OCT 24, 2023 • 08:42 PM</p>
              </div>
            </div>

            {/* Items List */}
            <div className="space-y-5 relative z-10">
              {/* Item 1 */}
              <div className="flex justify-between items-start group">
                <div className="flex flex-col">
                  <span className="text-white/90 text-sm font-semibold">Signature Wagyu Burger</span>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-[10px] font-bold text-[#9ca3af] tracking-wider uppercase">Claimed by</span>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-extrabold text-[#23e4ff] tracking-wider uppercase">Alex</span>
                      <span className="text-[10px] font-extrabold text-[#9ca3af] tracking-wider">&</span>
                      <span className="text-[10px] font-extrabold text-[#FF007F] tracking-wider uppercase">Sarah</span>
                    </div>
                  </div>
                </div>
                <span className="text-white tabular-nums font-semibold tracking-tight">RM 68.00</span>
              </div>

              {/* Item 2 */}
              <div className="flex justify-between items-start group">
                <div className="flex flex-col">
                  <span className="text-white/90 text-sm font-semibold">Neon Gin & Tonic</span>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-[10px] font-bold text-[#9ca3af] tracking-wider uppercase">Claimed by</span>
                    <span className="text-[10px] font-extrabold text-[#FF007F] tracking-wider uppercase">Sarah</span>
                  </div>
                </div>
                <span className="text-white tabular-nums font-semibold tracking-tight">RM 38.00</span>
              </div>

              {/* Item 3 */}
              <div className="flex justify-between items-start group">
                <div className="flex flex-col">
                  <span className="text-white/90 text-sm font-semibold">Truffle Fries</span>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-[10px] font-bold text-[#9ca3af] tracking-wider uppercase">Claimed by</span>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-extrabold text-[#23e4ff] tracking-wider uppercase">Alex</span>
                      <span className="text-[10px] font-extrabold text-[#9ca3af] tracking-wider">&</span>
                      <span className="text-[10px] font-extrabold text-[#FF007F] tracking-wider uppercase">Marcus</span>
                    </div>
                  </div>
                </div>
                <span className="text-white tabular-nums font-semibold tracking-tight">RM 22.80</span>
              </div>
            </div>

            {/* Divider: Dashed */}
            <div className="my-6 border-t border-dashed border-white/10"></div>

            {/* Financial Breakdown */}
            <div className="space-y-3 relative z-10 mb-6">
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-[#9ca3af]">
                <span>Subtotal</span>
                <span className="tabular-nums">RM 128.80</span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-[#9ca3af]">
                <span>Service Charge (10%)</span>
                <span className="tabular-nums text-[#FF007F]/70">Included</span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-[#9ca3af]">
                <span>SST (6%)</span>
                <span className="tabular-nums text-[#FF007F]/70">Included</span>
              </div>
            </div>

            {/* Final Divider: Solid */}
            <div className="h-[1px] bg-white/5 mb-6"></div>

            {/* Total Row */}
            <div className="flex justify-between items-center relative z-10">
              <span className="font-bold text-lg text-white">Total Spent</span>
              <span className="font-black text-2xl tabular-nums text-[#FF007F] drop-shadow-[0_0_12px_rgba(255,0,127,0.4)]">
                RM 128.80
              </span>
            </div>
          </div>
        </section>

        {/* Participant Shares */}
        <section className="space-y-4">
          <h2 className="text-[#9ca3af] text-[10px] font-bold tracking-widest uppercase px-1">Participant Shares</h2>
          <div className="space-y-3">
            {/* Host Item */}
            <div className="bg-[#111111]/50 backdrop-blur-md border border-white/5 flex justify-between items-center p-5 rounded-2xl">
              <div className="flex flex-col">
                <span className="text-white font-bold text-base">Alex (You)</span>
                <span className="text-[10px] font-extrabold text-[#23e4ff] tracking-widest uppercase mt-0.5">HOST</span>
              </div>
              <span className="tabular-nums font-extrabold text-xl text-white">RM 42.93</span>
            </div>

            {/* Settled Item 1 */}
            <div className="bg-[#111111]/50 backdrop-blur-md border border-white/5 flex justify-between items-center p-5 rounded-2xl">
              <div className="flex flex-col">
                <span className="text-white font-bold text-base">Sarah Chen</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] font-extrabold text-[#00FF87] tracking-widest uppercase">SETTLED</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-black fill-[#00FF87]" />
                </div>
              </div>
              <span className="tabular-nums font-extrabold text-xl text-white">RM 42.93</span>
            </div>

            {/* Settled Item 2 */}
            <div className="bg-[#111111]/50 backdrop-blur-md border border-white/5 flex justify-between items-center p-5 rounded-2xl">
              <div className="flex flex-col">
                <span className="text-white font-bold text-base">Marcus Holloway</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] font-extrabold text-[#00FF87] tracking-widest uppercase">SETTLED</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-black fill-[#00FF87]" />
                </div>
              </div>
              <span className="tabular-nums font-extrabold text-xl text-white">RM 42.94</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
