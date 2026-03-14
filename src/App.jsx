import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  ChevronLeft, 
  Users, 
  QrCode, 
  Check, 
  Sparkles,
  Receipt,
  UtensilsCrossed,
  Coffee,
  Share,
  Info
} from 'lucide-react';

// Hardened Math Helper for Malaysian Ringgit (Avoids Floating-Point errors)
function calculateProportionalTotal(myItemsSubtotal, receiptSubtotal, totalTaxAndService, roundingAdjustment = 0) {
  if (receiptSubtotal === 0) return 0;
  
  // Convert everything to cents to use integers
  const mySubCents = Math.round(myItemsSubtotal * 100);
  const totalSubCents = Math.round(receiptSubtotal * 100);
  const taxCents = Math.round(totalTaxAndService * 100);
  const roundCents = Math.round(roundingAdjustment * 100);
  
  // Proportional tax (in cents)
  const myTaxCents = Math.round((mySubCents / totalSubCents) * taxCents);
  
  // Total in cents (add rounding adjustment ONLY if this user is the host, handled elsewhere)
  const myTotalCents = mySubCents + myTaxCents;
  
  return myTotalCents / 100;
}

// Complex OCR Mock Data Structure
const MOCK_RECEIPT = {
  id: "receipt-992",
  merchant: "Mamak Maju",
  subtotal: 36.00,
  extractedTax: 2.16, // 6% SST
  extractedServiceCharge: 3.60, // 10%
  roundingAdjustment: 0.04, // e.g. .04 cents to hit exact .00 cash rounding
  items: [
    { id: 1, name: "Nasi Lemak Ayam", price: 12.00, claimedBy: [], icon: UtensilsCrossed },
    { id: 2, name: "Milo Ais", price: 3.50, claimedBy: [], icon: Coffee },
    { id: 3, name: "Maggi Goreng", price: 8.00, claimedBy: [], icon: UtensilsCrossed },
    { id: 4, name: "Cheese Naan", price: 10.00, claimedBy: [], icon: UtensilsCrossed },
    { id: 5, name: "Teh Tarik", price: 2.50, claimedBy: [], icon: Coffee },
  ]
};

const MOCK_FRIENDS = [
  { id: 'user-2', name: 'Sarah', avatar: 'S', totalOwed: 15.20, status: 'paid' },
  { id: 'user-3', name: 'Adam', avatar: 'A', totalOwed: 22.40, status: 'pending' }
];

export default function App() {
  const [view, setView] = useState('dashboard'); // dashboard, scanning, host_claim, session_lobby, guest_claim, settlement
  const [role, setRole] = useState('host'); // 'host' or 'guest'
  const [receipt, setReceipt] = useState(MOCK_RECEIPT);
  const [isProcessing, setIsProcessing] = useState(false);
  const [slideDirection, setSlideDirection] = useState(1); // 1 for forward, -1 for back

  // Directional Native Slide Transitions
  const pageTransition = {
    initial: (direction) => ({ opacity: 0, x: direction > 0 ? '100%' : '-100%' }),
    animate: { opacity: 1, x: 0 },
    exit: (direction) => ({ opacity: 0, x: direction > 0 ? '-100%' : '100%' }),
    transition: { type: 'spring', damping: 25, stiffness: 200 }
  };

  const navigate = (newView, direction = 1) => {
    setSlideDirection(direction);
    setView(newView);
  };

  const handleCapture = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      navigate('host_claim', 1);
    }, 2000);
  };

  const toggleClaimItem = (itemId, userId = 'me') => {
    setReceipt(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === itemId) {
          const isClaimedByMe = item.claimedBy.includes(userId);
          return {
            ...item,
            claimedBy: isClaimedByMe 
              ? item.claimedBy.filter(id => id !== userId)
              : [...item.claimedBy, userId]
          };
        }
        return item;
      })
    }));
  };

  const resetFlow = () => {
    setReceipt(MOCK_RECEIPT);
    navigate('dashboard', -1);
  };

  // Math Engine Usage
  const myClaimedItems = receipt.items.filter(i => i.claimedBy.includes('me'));
  const mySubtotal = myClaimedItems.reduce((acc, curr) => acc + curr.price, 0);
  
  // Base mathematical logic utilizing /harden
  const taxAndService = receipt.extractedTax + receipt.extractedServiceCharge;
  
  // Calculate raw proportional total
  let myFinalTotal = calculateProportionalTotal(mySubtotal, receipt.subtotal, taxAndService);
  
  // Apply rounding adjustments ONLY if this user is the host
  if (role === 'host' && myFinalTotal > 0) {
    // Add rounding adjustment at the cent level safely
    myFinalTotal = (Math.round(myFinalTotal * 100) + Math.round(receipt.roundingAdjustment * 100)) / 100;
  }

  return (
    <div className="mobile-container flex flex-col">
      <AnimatePresence mode="wait" custom={slideDirection}>
        
        {/* VIEW 1: DASHBOARD */}
        {view === 'dashboard' && (
          <motion.div key="dashboard" custom={slideDirection} variants={pageTransition} initial="initial" animate="animate" exit="exit" className="flex-1 flex flex-col h-full bg-background relative isolate">
            <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-accent-pink/10 to-transparent -z-10" />
            
            <header className="px-6 pt-12 pb-6 flex justify-between items-center">
              <div>
                <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="text-secondary text-sm font-medium mb-1">
                  Hey, Daniel
                </motion.p>
                <motion.h1 initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="text-3xl font-bold tracking-tight text-primary number-font">
                  RM 0.00
                </motion.h1>
                <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="text-secondary text-xs mt-1">
                  No active tabs
                </motion.p>
              </div>
              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="w-12 h-12 rounded-full bg-surface-light border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Daniel" alt="Avatar" className="w-10 h-10" />
              </motion.div>
            </header>

            <main className="flex-1 px-6 pb-24 overflow-y-auto no-scrollbar">
              <h2 className="text-sm font-semibold text-secondary uppercase tracking-wider mb-4 mt-8 flex items-center gap-2">
                <Receipt className="w-4 h-4" /> Recent Splits
              </h2>
              
              <div className="flex flex-col gap-3">
                <motion.div
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setRole('host'); navigate('session_lobby', 1); }}
                  className="p-4 rounded-2xl bg-surface border border-white/5 flex items-center justify-between cursor-pointer hover:border-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent-pink/20 text-accent-pink flex items-center justify-center font-bold">M</div>
                    <div>
                      <p className="font-medium text-sm text-primary">Mamak Maju <span className="text-xs font-normal text-secondary ml-1">(Host)</span></p>
                      <p className="text-xs text-secondary mt-0.5">Today • 3 Participants</p>
                    </div>
                  </div>
                  <ChevronLeft className="w-4 h-4 rotate-180 text-secondary" />
                </motion.div>

                <motion.div
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setRole('guest'); navigate('guest_claim', 1); }}
                  className="p-4 rounded-2xl bg-surface border border-white/5 flex items-center justify-between cursor-pointer hover:border-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent-green/20 text-accent-green flex items-center justify-center font-bold">H</div>
                    <div>
                      <p className="font-medium text-sm text-primary">HDL Friday <span className="text-xs font-normal text-secondary ml-1">(Guest)</span></p>
                      <p className="text-xs text-secondary mt-0.5">Yesterday • Open Tab</p>
                    </div>
                  </div>
                  <ChevronLeft className="w-4 h-4 rotate-180 text-secondary" />
                </motion.div>
              </div>
            </main>

            <div className="absolute bottom-8 left-0 right-0 px-6 flex justify-center pointer-events-none">
              <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={() => { setRole('host'); navigate('scanning', 1); }}
                className="pointer-events-auto shadow-[0_0_40px_rgba(255,20,147,0.4)] flex items-center gap-3 bg-accent-pink text-white font-semibold py-4 px-8 rounded-full border border-white/20"
              >
                <Camera className="w-5 h-5" />
                <span>Scan Receipt</span>
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* VIEW 2: SCANNING STATE */}
        {view === 'scanning' && (
          <motion.div key="scanning" custom={slideDirection} variants={pageTransition} initial="initial" animate="animate" exit="exit" className="flex-1 h-full bg-black relative flex flex-col">
            <div className="absolute inset-0 z-20 flex flex-col pointer-events-none">
              <div className="flex-1 bg-black/60 backdrop-blur-sm relative">
                <button 
                  onClick={() => navigate('dashboard', -1)}
                  className="pointer-events-auto absolute top-12 left-6 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <p className="absolute top-16 left-0 right-0 text-center font-medium tracking-wide">Align receipt within frame</p>
              </div>
              
              <div className="h-[400px] flex">
                <div className="flex-1 bg-black/60 backdrop-blur-sm" />
                <div className="w-[300px] border-2 border-white/20 relative flex items-center justify-center">
                  <motion.div animate={{ y: ['-180px', '180px', '-180px'] }} transition={{ repeat: Infinity, duration: 3, ease: 'linear' }} className="absolute inset-x-0 h-0.5 bg-accent-pink shadow-[0_0_15px_rgba(255,20,147,1)]" />
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-accent-pink -mt-1 -ml-1 border-tl-xl" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-accent-pink -mt-1 -mr-1" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-accent-pink -mb-1 -ml-1" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-accent-pink -mb-1 -mr-1" />
                  
                  {isProcessing && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-black/80 rounded-xl px-6 py-4 flex flex-col items-center gap-3 backdrop-blur-md">
                      <Sparkles className="w-6 h-6 text-accent-pink animate-pulse" />
                      <span className="text-sm font-medium">Extracting items...</span>
                    </motion.div>
                  )}
                </div>
                <div className="flex-1 bg-black/60 backdrop-blur-sm" />
              </div>
              
              <div className="flex-1 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-end pb-12">
                <motion.button whileTap={{ scale: 0.9 }} disabled={isProcessing} onClick={handleCapture} className="pointer-events-auto w-20 h-20 rounded-full border-4 border-white flex items-center justify-center">
                  <div className="w-16 h-16 bg-white rounded-full transition-transform active:scale-95" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* VIEW 3: HOST CLAIM SCREEN */}
        {view === 'host_claim' && (
          <motion.div key="host_claim" custom={slideDirection} variants={pageTransition} initial="initial" animate="animate" exit="exit" className="flex-1 h-full bg-background flex flex-col">
            <header className="px-4 pt-12 pb-4 flex items-center justify-between border-b border-white/10 bg-surface/50 backdrop-blur-md sticky top-0 z-20">
              <button onClick={() => navigate('dashboard', -1)} className="p-2">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <div className="text-center">
                <h2 className="font-semibold tracking-tight text-primary">Host: Select Yours</h2>
                <div className="flex items-center gap-1.5 justify-center text-accent-pink text-xs font-medium bg-accent-pink/10 px-2 py-0.5 rounded-full inline-flex mt-1">
                  <Receipt className="w-3 h-3" />
                  <span>{receipt.merchant}</span>
                </div>
              </div>
              <div className="w-10" />
            </header>

            <main className="flex-1 overflow-y-auto px-4 py-6 pb-48 no-scrollbar">
              <div className="flex flex-col gap-3">
                {receipt.items.map((item) => {
                  const Icon = item.icon;
                  const isMine = item.claimedBy.includes('me');
                  return (
                    <motion.div layout whileTap={{ scale: 0.98 }} onClick={() => toggleClaimItem(item.id)} key={item.id} className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-4 ${isMine ? 'bg-accent-pink/5 border-accent-pink/30 shadow-[0_0_20px_rgba(255,20,147,0.05)]' : 'bg-surface border-white/5'}`}>
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors ${isMine ? 'bg-accent-pink text-white' : 'bg-surface-light text-secondary'}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium text-sm transition-colors text-primary`}>{item.name}</p>
                        <p className="text-secondary text-xs mt-0.5 number-font">RM {item.price.toFixed(2)}</p>
                      </div>
                      <div className="shrink-0 flex items-center">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${isMine ? 'border-accent-pink bg-accent-pink text-white' : 'border-surface-light bg-transparent'}`}>
                          {isMine && <Check className="w-4 h-4" />}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </main>

            {/* Host Generate Link Sheet */}
            <motion.div drag="y" dragConstraints={{ top: 0, bottom: 0 }} dragElastic={0.05} className="absolute bottom-0 inset-x-0 bg-surface border-t border-white/10 rounded-t-[32px] p-6 pb-8 shadow-[0_-10px_40px_rgba(0,0,0,0.8)] z-30 touch-none">
              <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6" />
              <div className="flex justify-between items-end mb-6">
                <div>
                  <p className="text-sm text-secondary mb-1">Your Host Share</p>
                  <span className="text-3xl font-bold text-white number-font">RM {myFinalTotal.toFixed(2)}</span>
                </div>
                <div className="text-right text-xs text-secondary space-y-1">
                  <p>Sub: RM {mySubtotal.toFixed(2)}</p>
                  <p>Tax: RM {(calculateProportionalTotal(mySubtotal, receipt.subtotal, taxAndService) - mySubtotal).toFixed(2)}</p>
                  <p>Adj: {receipt.roundingAdjustment > 0 ? '+' : ''}RM {receipt.roundingAdjustment.toFixed(2)}</p>
                </div>
              </div>

              <motion.button whileTap={{ scale: 0.96 }} disabled={mySubtotal === 0} onClick={() => navigate('session_lobby', 1)} className="w-full py-4 rounded-xl font-semibold transition-all relative overflow-hidden flex items-center justify-center gap-2 bg-primary text-black shadow-[0_4px_20px_rgba(255,255,255,0.2)]">
                <Share className="w-5 h-5" />
                <span>Generate Share Link</span>
              </motion.button>
            </motion.div>
          </motion.div>
        )}

        {/* VIEW 4: SESSION LOBBY (HOST VIEW) */}
        {view === 'session_lobby' && (
          <motion.div key="session_lobby" custom={slideDirection} variants={pageTransition} initial="initial" animate="animate" exit="exit" className="flex-1 h-full bg-background flex flex-col">
            <header className="px-4 pt-12 pb-4 flex items-center justify-between border-b border-white/10 bg-surface/50">
              <button onClick={() => navigate('dashboard', -1)} className="p-2"><ChevronLeft className="w-6 h-6" /></button>
              <h2 className="font-semibold tracking-tight text-primary">Session Lobby</h2>
              <div className="w-10" />
            </header>

            <main className="flex-1 px-6 py-8 overflow-y-auto">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2 tracking-tight">{receipt.merchant}</h3>
                <p className="text-sm text-secondary number-font">Total Bill: RM {(receipt.subtotal + receipt.extractedTax + receipt.extractedServiceCharge + receipt.roundingAdjustment).toFixed(2)}</p>
              </div>

              <div className="bg-surface-light border border-white/10 rounded-2xl p-4 flex items-center justify-between mb-8 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent-pink/20 text-accent-pink flex items-center justify-center"><QrCode className="w-5 h-5" /></div>
                  <p className="text-sm font-medium">Link Active in code</p>
                </div>
                <button className="text-xs font-semibold bg-white/10 px-3 py-1.5 rounded-full hover:bg-white/20">Copy</button>
              </div>

              <h4 className="text-sm font-semibold text-secondary uppercase tracking-wider mb-4">Participants (3)</h4>
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-surface border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary text-black flex items-center justify-center font-bold">D</div>
                    <p className="font-medium text-sm">Daniel (Host)</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm number-font mb-1">RM 20.45</p>
                    <span className="text-[10px] uppercase tracking-wider bg-white/10 text-secondary px-2 py-0.5 rounded-sm font-semibold">Self</span>
                  </div>
                </div>

                {MOCK_FRIENDS.map(friend => (
                  <div key={friend.id} className="p-4 rounded-xl bg-surface border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-surface-light text-secondary flex items-center justify-center font-bold">{friend.avatar}</div>
                      <p className="font-medium text-sm">{friend.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm number-font mb-1">RM {friend.totalOwed.toFixed(2)}</p>
                      <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-sm font-semibold ${
                        friend.status === 'paid' ? 'bg-accent-green/20 text-accent-green' : 'bg-accent-pink/20 text-accent-pink'
                      }`}>
                        {friend.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </main>
          </motion.div>
        )}

        {/* VIEW 5: GUEST CLAIM SCREEN */}
        {view === 'guest_claim' && (
          <motion.div key="guest_claim" custom={slideDirection} variants={pageTransition} initial="initial" animate="animate" exit="exit" className="flex-1 h-full bg-background flex flex-col">
            <header className="px-4 pt-12 pb-4 flex items-center justify-between border-b border-white/10 bg-surface/50 backdrop-blur-md sticky top-0 z-20">
              <button onClick={() => navigate('dashboard', -1)} className="p-2"><ChevronLeft className="w-6 h-6" /></button>
              <div className="text-center">
                <h2 className="font-semibold tracking-tight text-primary">{receipt.merchant}</h2>
                <div className="flex items-center gap-1.5 justify-center text-accent-pink text-xs font-medium bg-accent-pink/10 px-2 py-0.5 rounded-full inline-flex mt-1">
                  <span>Invited by Daniel</span>
                </div>
              </div>
              <div className="w-10" />
            </header>

            <main className="flex-1 overflow-y-auto px-4 py-6 pb-48 no-scrollbar">
              <div className="bg-accent-pink/10 border border-accent-pink/20 rounded-xl p-3 mb-6 flex items-start gap-3">
                <Info className="w-5 h-5 text-accent-pink shrink-0 mt-0.5" />
                <p className="text-xs text-accent-pink/90 leading-relaxed">Only unclaimed items are shown. Tap to claim what you ordered.</p>
              </div>

              <div className="flex flex-col gap-3">
                {receipt.items.map((item) => {
                  const Icon = item.icon;
                  const isMine = item.claimedBy.includes('me');
                  return (
                    <motion.div layout whileTap={{ scale: 0.98 }} onClick={() => toggleClaimItem(item.id)} key={item.id} className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-4 ${isMine ? 'bg-accent-green/10 border-accent-green/30 shadow-[0_0_20px_rgba(0,255,100,0.05)]' : 'bg-surface border-white/5'}`}>
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors ${isMine ? 'bg-accent-green text-black' : 'bg-surface-light text-secondary'}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium text-sm transition-colors text-primary`}>{item.name}</p>
                        <p className="text-secondary text-xs mt-0.5 number-font">RM {item.price.toFixed(2)}</p>
                      </div>
                      <div className="shrink-0 flex items-center">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${isMine ? 'border-accent-green bg-accent-green text-black' : 'border-surface-light bg-transparent'}`}>
                          {isMine && <Check className="w-4 h-4" />}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </main>

            {/* Guest Calculator Bottom Sheet */}
            <motion.div drag="y" dragConstraints={{ top: 0, bottom: 0 }} dragElastic={0.05} className="absolute bottom-0 inset-x-0 bg-surface border-t border-white/10 rounded-t-[32px] p-6 pb-8 shadow-[0_-10px_40px_rgba(0,0,0,0.8)] z-30 touch-none">
              <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6" />
              <div className="flex justify-between items-end mb-6">
                <div>
                  <p className="text-sm text-secondary mb-1">Your Total</p>
                  <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent-green to-teal-400 number-font">RM {myFinalTotal.toFixed(2)}</span>
                </div>
                <div className="text-right text-xs text-secondary space-y-1">
                  <p>Subtotal: RM {mySubtotal.toFixed(2)}</p>
                  <p>Tax: RM {(myFinalTotal - mySubtotal).toFixed(2)}</p>
                </div>
              </div>

              <motion.button whileTap={{ scale: 0.96 }} disabled={mySubtotal === 0} onClick={() => navigate('settlement', 1)} className={`w-full py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${mySubtotal > 0 ? 'bg-primary text-black' : 'bg-surface-light text-secondary'}`}>
                <span>Confirm My Tab</span>
              </motion.button>
            </motion.div>
          </motion.div>
        )}

        {/* VIEW 6: SETTLEMENT SCREEN (GUEST PACING) */}
        {view === 'settlement' && (
          <motion.div key="settlement" custom={slideDirection} variants={pageTransition} initial="initial" animate="animate" exit="exit" className="flex-1 h-full bg-background flex flex-col px-6">
            <header className="pt-16 pb-8 text-center flex flex-col items-center">
              <h2 className="text-xl text-secondary mb-2">You owe</h2>
              <p className="text-5xl font-bold number-font text-white mb-2 tracking-tight">RM {myFinalTotal.toFixed(2)}</p>
              <p className="text-sm text-secondary font-medium">to Daniel (Host)</p>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center pb-12">
              <div className="text-center mb-6">
                <span className="font-bold text-lg tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-500">DuitNow</span>
                <p className="text-xs text-secondary mt-1">Scan to automatically pay host</p>
              </div>
              
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-64 h-64 bg-white rounded-[32px] p-6 shadow-[0_0_50px_rgba(255,20,147,0.15)] flex flex-col items-center justify-center">
                <QrCode className="w-full h-full text-black/80" strokeWidth={1} />
              </motion.div>
            </main>

            <div className="pb-10 pt-4 w-full">
              <motion.button whileTap={{ scale: 0.96 }} onClick={resetFlow} className="w-full bg-accent-green text-black font-semibold py-4 rounded-xl flex items-center justify-center shadow-[0_4px_20px_rgba(0,255,100,0.2)]">
                Mark as Paid
              </motion.button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
