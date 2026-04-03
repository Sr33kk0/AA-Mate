import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UtensilsCrossed, Users } from 'lucide-react';

export default function DigitalReceipt() {
  const navigate = useNavigate();

  const handleReturnToDashboard = () => {
    navigate('/dashboard');
  };

  // Mock data structure to simulate a database fetch
  const receiptData = {
    restaurantName: "Murni Discovery",
    date: "Oct 24, 2023 • 08:42 PM",
    status: "pending", 
    subtotal: 13.34,
    tax: "Included", // e.g. SST 6%
    serviceCharge: "Included",
    total: 13.34,
    items: [
      { id: 1, name: "Nasi Lemak Special", price: 10.00 },
      { id: 2, name: "Teh Tarik", price: 3.34 }
    ],
    category: "Dining & Social",
    splitMode: "Item Claim"
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-black relative isolate text-white font-sans w-full">
      {/* Background Asset */}
      <div className="absolute inset-0 -z-10 pointer-events-none opacity-[0.05]">
        <img 
          alt="Kinetic digital waves" 
          className="w-full h-full object-cover" 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuB9tf0KEuJsMaDXlO72NBrVUBD5roGznYPlYQC5JmV9G1Pvbgq3rsP-KdqkyPL2nzczUcm6sG_0vywApYteMVPlXQ6qAUEfIzghSaCdI2T83tdMIt3eZVHy_ZWggKzKRjj5raHMpct9vBaq_EL3_6MsjW5O_26aeDl5r0prT94Czx3rHl2bSoVlZDiwchH5S5373VWVi3ObUe45A2OlefRBR9QCxd-p9CbiJU39PTn2yHAxabefemogGNRYdE4Lar7SKN7YWzjePE8-" 
        />
      </div>

      {/* Ambient glows */}
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-accent-pink/10 blur-[100px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-1/2 -right-24 w-48 h-48 bg-accent-green/5 blur-[80px] rounded-full pointer-events-none -z-10" />
      
      {/* Header */}
      <header className="absolute top-0 inset-x-0 z-50 bg-black/60 backdrop-blur-xl flex justify-between items-center px-6 h-16 border-b border-white/5">
        <div className="flex items-center gap-3">
          <button 
            onClick={handleReturnToDashboard}
            className="hover:bg-white/10 transition-colors p-2 -ml-2 rounded-full active:scale-95 duration-150 flex items-center justify-center text-white outline-none"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 mt-16 px-6 overflow-y-auto pb-32 no-scrollbar z-10 relative">
        {/* Hero Section */}
        <section className="flex flex-col items-center justify-center text-center pt-12 pb-8">
          <div className="mb-4">
            <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#23e4ff]/10 text-[#23e4ff] text-[10px] font-bold tracking-widest uppercase border border-[#23e4ff]/20">
              {receiptData.status === 'pending' ? 'Pending Verification' : receiptData.status}
            </span>
          </div>
          <h2 className="font-sans font-extrabold text-5xl tracking-tighter tabular-nums text-white mb-3">
            RM {receiptData.total.toFixed(2)}
          </h2>
          <p className="text-white/60 text-sm font-sans max-w-[240px] leading-relaxed">
            Waiting for <span className="text-white font-medium">Daniel</span> to confirm your payment.
          </p>
        </section>

        {/* Receipt Card */}
        <div className="bg-[#111111]/50 backdrop-blur-md border border-white/10 rounded-2xl p-6 relative overflow-hidden">
          {/* Card Glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent-pink/5 blur-[40px] -mr-16 -mt-16 pointer-events-none" />
          
          <div className="flex justify-between items-start mb-8 relative z-10">
            <div>
              <h3 className="font-sans font-bold text-xl text-white tracking-tight">{receiptData.restaurantName}</h3>
              <p className="text-white/60 text-[10px] mt-1 uppercase tracking-wider font-bold">{receiptData.date}</p>
            </div>
          </div>

          {/* Items List */}
          <div className="space-y-5 relative z-10">
            {receiptData.items.map((item) => (
              <div key={item.id} className="flex justify-between items-center group">
                <span className="text-white/80 text-sm">{item.name}</span>
                <span className="text-white tabular-nums font-semibold tracking-tight">RM {item.price.toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="my-6 border-t border-dashed border-white/10" />

          {/* Breakdown */}
          <div className="space-y-3 relative z-10 mb-6">
            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-white/50">
              <span>Subtotal</span>
              <span className="tabular-nums">RM {receiptData.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-white/50">
              <span>Service Charge (10%)</span>
              <span className="tabular-nums text-accent-pink/80">{receiptData.serviceCharge}</span>
            </div>
            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-white/50">
              <span>SST (6%)</span>
              <span className="tabular-nums text-accent-pink/80">{receiptData.tax}</span>
            </div>
          </div>

          <div className="h-[1px] bg-white/5 mb-6" />

          {/* Total Row */}
          <div className="flex justify-between items-center relative z-10">
            <span className="font-sans font-bold text-lg text-white">Total Spent</span>
            <span className="font-sans font-black text-2xl tabular-nums text-accent-pink drop-shadow-[0_0_12px_rgba(255,0,127,0.4)]">
              RM {receiptData.total.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Transaction Detail Accessory */}
        <div className="mt-6 flex gap-4">
          <div className="flex-1 p-4 bg-[#111111] border border-white/5 rounded-2xl flex flex-col gap-2">
            <span className="text-[10px] uppercase tracking-widest text-white/50 font-bold">CATEGORY</span>
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="w-4 h-4 text-accent-green" />
              <span className="text-xs font-bold text-white tracking-wide">{receiptData.category}</span>
            </div>
          </div>
          <div className="flex-1 p-4 bg-[#111111] border border-white/5 rounded-2xl flex flex-col gap-2">
            <span className="text-[10px] uppercase tracking-widest text-white/50 font-bold">SPLIT MODE</span>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-accent-pink" />
              <span className="text-xs font-bold text-white tracking-wide">{receiptData.splitMode}</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Button */}
      <footer className="absolute bottom-0 inset-x-0 p-8 pt-24 bg-gradient-to-t from-black via-black/90 to-transparent pointer-events-none z-20">
        <button 
          onClick={handleReturnToDashboard}
          className="w-full h-14 bg-accent-pink text-white font-sans font-bold rounded-full transition-all active:scale-[0.98] drop-shadow-[0_4px_24px_rgba(255,0,127,0.4)] flex items-center justify-center pointer-events-auto shadow-lg"
        >
          Return to Dashboard
        </button>
      </footer>
    </div>
  );
}
