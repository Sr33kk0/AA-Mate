import React, { useState, useEffect } from 'react';
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
  Info,
  User,
  Settings,
  Phone,
  Mail,
  ShieldCheck,
  UserPlus,
  Clock,
  X
} from 'lucide-react';

import { supabase } from './lib/supabase';

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

// Single Source of Truth for historical sessions
// Each session embeds its own participants[] — no loose globals
const mockSessionHistory = [
  {
    id: 'receipt-992',
    merchant: 'Mamak Maju',
    date: 'Oct 24, 2023',
    total: 45.50,
    role: 'host',
    participants: [
      {
        id: 'me',
        name: 'Daniel (You)',
        avatar: 'D',
        totalOwed: 7.90,
        payment_status: 'self',
        items: [{ name: 'Milo Ais', price: 3.50 }, { name: 'Teh Tarik', price: 2.50 }]
      },
      {
        id: 'user-2',
        name: 'Sarah',
        avatar: 'S',
        totalOwed: 15.20,
        payment_status: 'confirmed_paid',
        items: [{ name: 'Nasi Lemak Ayam', price: 12.00 }]
      },
      {
        id: 'user-3',
        name: 'Adam',
        avatar: 'A',
        totalOwed: 22.40,
        payment_status: 'payment_declared',
        items: [{ name: 'Cheese Naan', price: 10.00 }, { name: 'Maggi Goreng (Share)', price: 7.68 }]
      },
    ]
  },
  {
    id: 'hdl-friday',
    merchant: 'HDL Friday',
    date: 'Oct 23, 2023',
    total: null,
    role: 'guest',
    participants: []
  }
];

// NEW: Fresh Scan Mock Data - Murni Discovery
const NEW_OCR_RECEIPT = {
  id: "receipt-993",
  merchant: "Murni Discovery",
  subtotal: 34.50,
  extractedTax: 2.07,        // 6% SST
  extractedServiceCharge: 3.45, // 10%
  roundingAdjustment: 0.00,
  items: [
    { id: 1, name: "Roti Hawaii",            price: 12.00, claimedBy: [], icon: UtensilsCrossed },
    { id: 2, name: "Nasi Goreng Meletup",    price: 15.00, claimedBy: [], icon: UtensilsCrossed },
    { id: 3, name: "Sirap Bandung",          price:  4.00, claimedBy: [], icon: Coffee },
    { id: 4, name: "Teh O Ais",             price:  3.50, claimedBy: [], icon: Coffee },
  ]
};

export default function App() {
  useEffect(() => {
    const testDatabaseConnection = async () => {
      console.log("Attempting to connect to Supabase...");

      // Let's try to fetch from the 'users' table
      const { data, error } = await supabase.from('users').select('*').limit(1);

      if (error) {
        console.error("❌ Supabase connection failed:", error.message);
      } else {
        console.log("✅ Supabase connection successful! Fetched data:", data);
      }
    };

    testDatabaseConnection();
  }, []);

  const [view, setView] = useState('dashboard'); // dashboard, scanning, host_claim, session_lobby, guest_claim, settlement, profile
  const [role, setRole] = useState('host'); // 'host' or 'guest'
  const [receipt, setReceipt] = useState(MOCK_RECEIPT);
  const [isProcessing, setIsProcessing] = useState(false);
  const [slideDirection, setSlideDirection] = useState(1); // 1 for forward, -1 for back
  const [expandedUserId, setExpandedUserId] = useState(null);
  
  // Settlement & Claims State
  const [isPaymentDeclared, setIsPaymentDeclared] = useState(false);
  const [isClaimsLocked, setIsClaimsLocked] = useState(false);
  const [isHdlVerified, setIsHdlVerified] = useState(false); // New: Track HDL guest verification status

  // Profile / Auth State
  const [isOtpOpen, setIsOtpOpen] = useState(false);
  const [otpType, setOtpType] = useState(null); // 'phone' or 'email'
  const [otpValue, setOtpValue] = useState(['', '', '', '', '', '']);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const otpRefs = [React.useRef(null), React.useRef(null), React.useRef(null), React.useRef(null), React.useRef(null), React.useRef(null)];

  // Friends State
  const [friendsList, setFriendsList] = useState([
    { id: 'user-2', name: 'Sarah', avatar: 'S', friendshipStatus: 'accepted' },
    { id: 'user-3', name: 'Adam', avatar: 'A', friendshipStatus: 'accepted' },
    { id: 'user-4', name: 'Elena', avatar: 'E', friendshipStatus: 'pending_incoming' } // Mock Request
  ]);
  const [isAddFriendOpen, setIsAddFriendOpen] = useState(false);
  const [addFriendId, setAddFriendId] = useState('');

  // Session Lobby State
  const [sessionGuests, setSessionGuests] = useState([]);
  const [isInviteFriendsOpen, setIsInviteFriendsOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [activeSessions, setActiveSessions] = useState([]); // Holds finalized scanned sessions

  const handleAcceptFriend = (friendId) => {
    setFriendsList(prev => prev.map(f => f.id === friendId ? { ...f, friendshipStatus: 'accepted' } : f));
  };

  const handleRejectFriend = (friendId) => {
    setFriendsList(prev => prev.filter(f => f.id !== friendId));
  };

  // Ledger / Dashboard State
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'settled'
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const [isVerifyPaymentOpen, setIsVerifyPaymentOpen] = useState(false);
  const [guestToVerify, setGuestToVerify] = useState(null);

  // SINGLE SOURCE OF TRUTH: session routing state
  const [selectedSession, setSelectedSession] = useState(null); // set when viewing a historical session
  const [activeScan, setActiveScan] = useState(null);           // set when a new OCR scan completes

  // Reactive payment status — seeded from mockSessionHistory so mutations update the UI
  const [sessionParticipants, setSessionParticipants] = useState(() => {
    const map = {};
    mockSessionHistory.forEach(s =>
      s.participants.forEach(p => { map[`${s.id}::${p.id}`] = p.payment_status; })
    );
    return map;
  });

  // Derived State for Mamak Maju (reads from reactive sessionParticipants)
  const mamakSession = mockSessionHistory.find(s => s.id === 'receipt-992');
  const mamakGuests = mamakSession?.participants.filter(p => p.id !== 'me') ?? [];
  const allMamakPaid = mamakGuests.every(
    p => sessionParticipants[`receipt-992::${p.id}`] === 'confirmed_paid'
  );
  const pendingCount = mamakGuests.filter(
    p => sessionParticipants[`receipt-992::${p.id}`] !== 'confirmed_paid'
  ).length;

  // Derive total collected for Mamak Maju (Settled view)
  const mamakTotalCollected = mamakGuests
    .filter(p => sessionParticipants[`receipt-992::${p.id}`] === 'confirmed_paid' || sessionParticipants[`receipt-992::${p.id}`] === 'payment_declared')
    .reduce((acc, p) => acc + (p.totalOwed ?? 0), 0);

  // Directional Native Slide Transitions
  const pageTransition = {
    initial: (direction) => ({ opacity: 0, x: direction > 0 ? '100%' : '-100%' }),
    animate: { opacity: 1, x: 0 },
    exit: (direction) => ({ opacity: 0, x: direction > 0 ? '-100%' : '100%' }),
    transition: { type: 'spring', damping: 25, stiffness: 200 }
  };

  const navigate = (newView, direction = 1, sessionData = null) => {
    if (newView === 'dashboard') {
      setExpandedUserId(null);
      setIsLedgerOpen(false);
      setIsVerifyPaymentOpen(false);
      setIsOtpOpen(false);
      // Push a new active session if coming back from lobby with finalized data
      if (sessionData) {
        setActiveSessions(prev => [...prev, sessionData]);
      }
      // DO NOT reset isClaimsLocked or isPaymentDeclared here to simulate DB persistence
    }
    setSlideDirection(direction);
    setView(newView);
  };

  const handleCapture = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setReceipt(NEW_OCR_RECEIPT); // Load fresh scan data
      setSessionGuests([]);        // Reset participants to Host only
      setActiveScan({ receipt: NEW_OCR_RECEIPT }); // Mark as fresh scan context
      setSelectedSession(null);    // HARDEN: clear any historical session context
      navigate('host_claim', 1);
    }, 2000);
  };

  const toggleClaimItem = (itemId, userId = 'me') => {
    // HARDEN: Disallow any claim selection changes if locked, or if payment already declared
    if (isClaimsLocked || isPaymentDeclared) return; 
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
    // Just navigate back. Do NOT wipe the MOCK_RECEIPT to simulate saved DB state.
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

  // Display Helper Logic for Tax Percentages
  const serviceChargePercentage = receipt.subtotal > 0 ? (receipt.extractedServiceCharge / receipt.subtotal) * 100 : 0;
  const sstPercentage = receipt.subtotal > 0 ? (receipt.extractedTax / receipt.subtotal) * 100 : 0;
  const myServiceChargeAmount = calculateProportionalTotal(mySubtotal, receipt.subtotal, receipt.extractedServiceCharge) - mySubtotal;
  const mySstAmount = calculateProportionalTotal(mySubtotal, receipt.subtotal, receipt.extractedTax) - mySubtotal;

  // Header Balances Calculation
  // 1. Owed to You: sum of unpaid guest amounts for Mamak Maju from sessionParticipants
  const owedToYou = mamakGuests.reduce((acc, p) => {
    if (sessionParticipants[`receipt-992::${p.id}`] !== 'confirmed_paid') {
      return acc + p.totalOwed;
    }
    return acc;
  }, 0);

  // 2. You Owe: Total debt from HDL Friday (guest role)
  const isHdlSettled = false; // Mocking that the HDL host hasn't verified yet
  const youOwe = isHdlSettled ? 0 : myFinalTotal;
  // DERIVED LISTS FOR DASHBOARD
  const activeTabsList = [
    ...activeSessions,
    ...(!allMamakPaid ? [mockSessionHistory.find(s => s.id === 'receipt-992')] : []),
    ...(!isHdlVerified ? [mockSessionHistory.find(s => s.id === 'hdl-friday')] : [])
  ].filter(Boolean);

  const settledTabsList = [
    ...(allMamakPaid ? [mockSessionHistory.find(s => s.id === 'receipt-992')] : []),
    ...(isHdlVerified ? [mockSessionHistory.find(s => s.id === 'hdl-friday')] : []),
    { id: 'zus-coffee', merchant: 'Zus Coffee', date: 'Oct 19, 2023', role: 'guest', total: 14.50, avatar: 'Z' },
    { id: 'kyochon', merchant: 'Kyochon', date: 'Oct 15, 2023', role: 'host', total: 84.00, avatar: 'K' }
  ].filter(Boolean);


  return (
    <div className="mobile-container flex flex-col">
      <AnimatePresence mode="wait" custom={slideDirection}>
        
        {/* VIEW 1: DASHBOARD */}
        {view === 'dashboard' && (
          <motion.div key="dashboard" custom={slideDirection} variants={pageTransition} initial="initial" animate="animate" exit="exit" className="flex-1 flex flex-col h-full bg-background relative isolate">
            <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-accent-pink/10 to-transparent -z-10" />
            
            <header className="px-6 pt-12 pb-3 flex flex-col gap-6">
              <div className="flex justify-between items-start">
                <div>
                  <motion.p initial={{ opacity: 0, x: -10, y: 15}} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="text-secondary text-sm font-medium mb-1">
                  AA-Mate logo here
                  </motion.p>
                </div>
                <motion.button 
                  initial={{ opacity: 0, scale: 0.8 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  whileHover={{ scale: 1.05 }}
                  onClick={() => navigate('profile', 1)}
                  className="w-12 h-12 rounded-full bg-surface-light border border-white/10 overflow-hidden flex items-center justify-center shrink-0 cursor-pointer"
                >
                  <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Daniel" alt="Avatar" className="w-10 h-10" />
                </motion.button>
              </div>

              {/* Double Header Metrics */}
              <div className="flex gap-4 px-6 pt-6">
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 glass-card rounded-2xl p-4 flex flex-col items-center justify-center relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-accent-pink/5 to-transparent block" />
                  <p className="text-[10px] font-bold text-secondary uppercase tracking-[0.1em] mb-1 relative z-10">You Owe</p>
                  <p className="text-xl font-bold text-accent-pink tabular-nums relative z-10">
                    RM {youOwe.toFixed(2)}
                  </p>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 glass-card rounded-2xl p-4 flex flex-col items-center justify-center relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-accent-green/5 to-transparent block" />
                  <p className="text-[10px] font-bold text-secondary uppercase tracking-[0.1em] mb-1 relative z-10">Owed to You</p>
                  <p className="text-xl font-bold text-accent-green tabular-nums relative z-10">
                    RM {owedToYou.toFixed(2)}
                  </p>
                </motion.div>
              </div>

              {/* Segmented Toggle Control */}
              <div className="bg-surface-light border border-white/10 p-1 rounded-xl flex relative">
                <button
                  onClick={() => setActiveTab('active')}
                  className={`flex-1 py-2 text-sm font-semibold rounded-lg relative z-10 transition-colors ${activeTab === 'active' ? 'text-black' : 'text-secondary hover:text-white'}`}
                >
                  Active Tabs
                </button>
                <button
                  onClick={() => setActiveTab('settled')}
                  className={`flex-1 py-2 text-sm font-semibold rounded-lg relative z-10 transition-colors ${activeTab === 'settled' ? 'text-black' : 'text-secondary hover:text-white'}`}
                >
                  Settled
                </button>
                <motion.div 
                   layoutId="activeTabBadge"
                   transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                   className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-lg shadow-sm z-0"
                   initial={false}
                   animate={{ 
                     left: activeTab === 'active' ? '4px' : 'calc(50%)'
                   }}
                />
              </div>
            </header>

            <main className="flex-1 px-6 pb-24 overflow-y-auto no-scrollbar">
              {/* Removed Recent Splits Heading */}

              <div className="flex flex-col gap-3 mt-3">
                <AnimatePresence mode="wait">
                  {activeTab === 'active' ? (
                    <motion.div
                      key="active-list"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col gap-3"
                    >
                    {/* Active Empty State */}
                    {activeTabsList.length === 0 && (
                      <div className="py-20 flex flex-col items-center justify-center opacity-40">
                        <Receipt className="w-16 h-16 text-secondary mb-4 stroke-1" />
                        <p className="text-sm font-medium text-secondary">No active tabs right now.</p>
                        <p className="text-xs text-secondary/60">Scan a receipt to get started!</p>
                      </div>
                    )}   

                    {/* Dynamic active sessions from fresh scans */}
                    {activeSessions.map((session, index) => (
                      <motion.div
                        key={session.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ 
                          type: "spring", 
                          stiffness: 400, 
                          damping: 30, 
                          delay: index * 0.05 
                        }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                        // Build a lightweight selectedSession shape from the active scan record
                        setSelectedSession({
                          id: session.id,
                          merchant: session.receipt.merchant,
                          date: session.date,
                          total: (session.receipt.subtotal + session.receipt.extractedTax + session.receipt.extractedServiceCharge + session.receipt.roundingAdjustment),
                          role: 'host',
                          receipt: session.receipt,
                          participants: [
                            { id: 'me', name: 'Daniel (Host)', avatar: 'D', totalOwed: 0, payment_status: 'self', items: [] },
                            ...(session.guests ?? []).map(g => ({
                              id: g.id, name: g.name, avatar: g.avatar,
                              totalOwed: 0, payment_status: 'pending', items: []
                            }))
                          ],
                        });
                        setIsLedgerOpen(true);
                      }}
                      className="p-4 rounded-2xl glass-card flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-accent-pink/10 text-accent-pink border border-accent-pink/20 flex items-center justify-center font-bold shrink-0">
                          {session.receipt.merchant.charAt(0)}
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <p className="font-semibold text-sm text-white mb-0.5">{session.receipt.merchant} <span className="text-[10px] font-normal text-secondary ml-1 uppercase tracking-wider">(Host)</span></p>
                          <div className="flex items-center gap-1.5">
                            <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }} className="w-1.5 h-1.5 rounded-full bg-[oklch(0.85_0.15_220)] shrink-0" />
                            <span className="text-[10px] uppercase tracking-wider font-bold text-[oklch(0.85_0.15_220)]">Awaiting Claims</span>
                          </div>
                          <p className="text-[10px] text-secondary mt-0.5 uppercase tracking-tight">{session.date} • {session.participantCount} Participants</p>
                        </div>
                      </div>
                      <ChevronLeft className="w-4 h-4 rotate-180 text-secondary" />
                    </motion.div>
                  ))}

                  {!allMamakPaid && (
                    <motion.div
                      key="mamak-active"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ 
                        type: "spring", 
                        stiffness: 400, 
                        damping: 30, 
                        delay: (activeSessions.length) * 0.05 
                      }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        const session = mockSessionHistory.find(s => s.id === 'receipt-992');
                        setSelectedSession(session);
                        setIsLedgerOpen(true);
                      }}
                       className="p-4 rounded-2xl glass-card flex items-center justify-between cursor-pointer"
                     >
                       <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-accent-pink/10 text-accent-pink border border-accent-pink/20 flex items-center justify-center font-bold shrink-0">
                           M
                         </div>
                         <div className="flex flex-col gap-0.5">
                           <p className="font-semibold text-sm text-white mb-0.5">Mamak Maju <span className="text-[10px] font-normal text-secondary ml-1 uppercase tracking-wider">(Host)</span></p>
                           
                           {mamakGuests.some(p => sessionParticipants[`receipt-992::${p.id}`] === 'payment_declared') ? (
                             <div className="flex items-center gap-1.5 focus:outline-none">
                               <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }} className="w-1.5 h-1.5 rounded-full bg-[oklch(0.85_0.22_85)] shrink-0" />
                               <span className="text-[10px] uppercase tracking-wider font-bold text-[oklch(0.85_0.22_85)] focus:outline-none">Verification Needed</span>
                             </div>
                           ) : (
                             <div className="flex items-center gap-1.5 focus:outline-none">
                               <div className="w-1.5 h-1.5 rounded-full bg-accent-pink shrink-0" />
                               <span className="text-[10px] uppercase tracking-wider font-bold text-accent-pink focus:outline-none">Pending {pendingCount} Payments</span>
                             </div>
                           )}
                           
                           <p className="text-[10px] text-secondary mt-0.5 uppercase tracking-tight">Oct 24, 2023 • 3 Participants</p>
                         </div>
                       </div>
                       <ChevronLeft className="w-4 h-4 rotate-180 text-secondary" />
                     </motion.div>
                  )}

                  {!isHdlVerified && (
                    <motion.div
                      key="hdl-active"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ 
                        type: "spring", 
                        stiffness: 400, 
                        damping: 30, 
                        delay: (activeSessions.length + (!allMamakPaid ? 1 : 0)) * 0.05 
                      }}
                       whileTap={{ scale: 0.98 }}
                       onClick={() => { setRole('guest'); navigate(isPaymentDeclared ? 'settlement' : 'guest_claim', 1); }}
                       className="p-4 rounded-2xl glass-card flex items-center justify-between cursor-pointer"
                     >
                       <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-accent-green/10 text-accent-green border border-accent-green/20 flex items-center justify-center font-bold shrink-0">
                           H
                         </div>
                         <div className="flex flex-col gap-0.5">
                           <p className="font-semibold text-sm text-white mb-0.5">HDL Friday <span className="text-[10px] font-normal text-secondary ml-1 uppercase tracking-wider">(Guest)</span></p>
                           
                           {isPaymentDeclared ? (
                              <div className="flex items-center gap-1.5 focus:outline-none">
                                <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }} className="w-1.5 h-1.5 rounded-full bg-[oklch(0.85_0.15_220)] shrink-0" />
                                <span className="text-[10px] uppercase tracking-wider font-bold text-[oklch(0.85_0.15_220)] focus:outline-none">Pending Verification</span>
                              </div>
                           ) : myClaimedItems.length > 0 ? (
                             <div className="flex items-center gap-1.5">
                               <div className="w-1.5 h-1.5 rounded-full bg-accent-pink shrink-0" />
                               <span className="text-[10px] uppercase tracking-wider font-bold text-accent-pink">You Owe <span className="tabular-nums ml-1">RM {myFinalTotal.toFixed(2)}</span></span>
                             </div>
                           ) : (
                             <div className="flex items-center gap-1.5">
                               <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }} className="w-1.5 h-1.5 rounded-full bg-accent-pink shrink-0" />
                               <span className="text-[10px] uppercase tracking-wider font-bold text-accent-pink">Unclaimed</span>
                             </div>
                           )}

                           <p className="text-[10px] text-secondary mt-0.5 uppercase tracking-tight">Oct 23, 2023 • Open Tab</p>
                         </div>
                       </div>
                       <ChevronLeft className="w-4 h-4 rotate-180 text-secondary" />
                     </motion.div>
                  )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="settled-list"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col gap-3"
                  >
                    {/* Settled Empty State */}
                    {settledTabsList.length === 0 && (
                      <div className="py-20 flex flex-col items-center justify-center opacity-40">
                        <Check className="w-16 h-16 text-secondary mb-4 stroke-1" />
                        <p className="text-sm font-medium text-secondary">No settled bills yet.</p>
                        <p className="text-xs text-secondary/60">Everything you settle moves here.</p>
                      </div>
                    )}

                    {allMamakPaid && (
                      <motion.div
                        key="mamak-settled"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ 
                          type: "spring", 
                          stiffness: 400, 
                          damping: 30, 
                          delay: 0.05 
                        }}
                        whileTap={{ scale: 0.98 }}
                        className="p-4 rounded-2xl glass-card flex items-center justify-between cursor-pointer"
                        onClick={() => {
                          const session = mockSessionHistory.find(s => s.id === 'receipt-992');
                          setSelectedSession(session);
                          setIsLedgerOpen(true);
                        }}
                      >
                         <div className="flex items-center gap-3 opacity-60">
                           <div className="w-10 h-10 rounded-full bg-white/5 text-secondary border border-white/10 flex items-center justify-center font-bold">M</div>
                           <div>
                             <p className="font-semibold text-sm text-white">Mamak Maju <span className="text-[10px] font-normal text-secondary/70 ml-1 uppercase tracking-wider">(Host)</span></p>
                             <p className="text-[10px] text-secondary/70 mt-0.5 uppercase tracking-tight">Oct 24, 2023 • Total Collected <span className="tabular-nums">RM {mamakTotalCollected.toFixed(2)}</span></p>
                           </div>
                         </div>
                         <div className="w-6 h-6 rounded-full bg-accent-green/10 flex items-center justify-center border border-accent-green/20">
                           <Check className="w-3 h-3 text-accent-green" />
                         </div>
                       </motion.div>
                    )}

                    {isHdlVerified && (
                      <motion.div
                        key="hdl-settled"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ 
                          type: "spring", 
                          stiffness: 400, 
                          damping: 30, 
                          delay: (allMamakPaid ? 1 : 0) * 0.05 
                        }}
                        whileTap={{ scale: 0.98 }}
                        className="p-4 rounded-2xl glass-card flex items-center justify-between cursor-default"
                      >
                         <div className="flex items-center gap-3 opacity-60">
                           <div className="w-10 h-10 rounded-full bg-white/5 text-secondary border border-white/10 flex items-center justify-center font-bold">H</div>
                           <div>
                             <p className="font-semibold text-sm text-white">HDL Friday <span className="text-[10px] font-normal text-secondary/70 ml-1 uppercase tracking-wider">(Guest)</span></p>
                             <p className="text-[10px] text-secondary/70 mt-0.5 uppercase tracking-tight">Oct 23, 2023 • Paid <span className="tabular-nums">RM {myFinalTotal.toFixed(2)}</span></p>
                           </div>
                         </div>
                         <div className="w-6 h-6 rounded-full bg-accent-green/10 flex items-center justify-center border border-accent-green/20">
                           <Check className="w-3 h-3 text-accent-green" />
                         </div>
                       </motion.div>
                    )}

                    <motion.div
                      key="zus-settled"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ 
                        type: "spring", 
                        stiffness: 400, 
                        damping: 30, 
                        delay: (allMamakPaid ? 1 : 0) * 0.05 + 0.1
                      }}
                      whileTap={{ scale: 0.98 }}
                      className="p-4 rounded-2xl glass-card flex items-center justify-between cursor-default"
                    >
                      <div className="flex items-center gap-3 opacity-60">
                        <div className="w-10 h-10 rounded-full bg-white/5 text-secondary border border-white/10 flex items-center justify-center font-bold">Z</div>
                        <div>
                          <p className="font-semibold text-sm text-white">Zus Coffee <span className="text-[10px] font-normal text-secondary/70 ml-1 uppercase tracking-wider">(Guest)</span></p>
                          <p className="text-[10px] text-secondary/70 mt-0.5 uppercase tracking-tight">Oct 19, 2023 • Paid <span className="tabular-nums">RM 14.50</span></p>
                        </div>
                      </div>
                      <div className="w-6 h-6 rounded-full bg-accent-green/10 flex items-center justify-center border border-accent-green/20">
                        <Check className="w-3 h-3 text-accent-green" />
                      </div>
                    </motion.div>

                    <motion.div
                      key="kyochon-settled"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ 
                        type: "spring", 
                        stiffness: 400, 
                        damping: 30, 
                        delay: (allMamakPaid ? 1 : 0) * 0.05 + 0.15
                      }}
                      whileTap={{ scale: 0.98 }}
                      className="p-4 rounded-2xl glass-card flex items-center justify-between cursor-default"
                    >
                      <div className="flex items-center gap-3 opacity-60">
                        <div className="w-10 h-10 rounded-full bg-white/5 text-secondary border border-white/10 flex items-center justify-center font-bold">K</div>
                        <div>
                          <p className="font-semibold text-sm text-white">Kyochon <span className="text-[10px] font-normal text-secondary/70 ml-1 uppercase tracking-wider">(Host)</span></p>
                          <p className="text-[10px] text-secondary/70 mt-0.5 uppercase tracking-tight">Oct 15, 2023 • Total Bill: <span className="tabular-nums">RM 84.00</span></p>
                        </div>
                      </div>
                      <div className="w-6 h-6 rounded-full bg-accent-green/10 flex items-center justify-center border border-accent-green/20">
                        <Check className="w-3 h-3 text-accent-green" />
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </main>

            {/* Dashboard Ledger Modal Overlay */}
            <AnimatePresence>
              {isLedgerOpen && selectedSession && (
                <>
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsLedgerOpen(false)}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm z-40"
                  />
                   <motion.div 
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    drag="y"
                    dragConstraints={{ top: 0, bottom: 0 }}
                    dragElastic={{ top: 0.05, bottom: 0.3 }}
                    onDragEnd={(_, info) => { if (info.offset.y > 100) setIsLedgerOpen(false); }}
                    transition={{ type: 'spring', damping: 28, stiffness: 220 }}
                    className="absolute bottom-0 inset-x-0 bg-[#0A0A0A] border-t border-white/[0.08] rounded-t-[32px] p-6 pb-12 shadow-[0_-20px_60px_rgba(0,0,0,0.8)] z-50 flex flex-col touch-none"
                  >
                    {/* Drag handle */}
                    <div className="w-12 h-1 bg-white/20 rounded-full mb-6 mx-auto" />
                    
                    {/* IIFE to derive Left to Collect dynamically from selectedSession.participants */}
                    {(() => {
                      const sessionId = selectedSession.id;
                      const guests = (selectedSession.participants ?? []).filter(p => p.id !== 'me');
                      const leftToCollect = guests.reduce((acc, p) => {
                        const st = sessionParticipants[`${sessionId}::${p.id}`] ?? p.payment_status;
                        return st !== 'confirmed_paid' ? acc + (p.totalOwed ?? 0) : acc;
                      }, 0);
                      const totalCollected = guests.reduce((acc, p) => {
                        const st = sessionParticipants[`${sessionId}::${p.id}`] ?? p.payment_status;
                        return (st === 'paid' || st === 'confirmed_paid') ? acc + (p.totalOwed ?? 0) : acc;
                      }, 0);
                      const isSettled = guests.length > 0 && leftToCollect === 0;

                      return (
                        <>
                          <div className="flex justify-between items-end mb-6">
                            <div>
                              <h3 className="text-xl font-bold tracking-tight text-white">{selectedSession.merchant}</h3>
                              <p className="text-xs font-medium text-secondary uppercase tracking-wider">
                                {selectedSession.date} • <span className="tabular-nums">RM {(selectedSession.total ?? 0).toFixed(2)}</span>
                              </p>
                            </div>
                            <div className="text-right">
                              {selectedSession.role === 'host' ? (
                                isSettled ? (
                                  <>
                                    <p className="text-sm font-semibold text-accent-green number-font">RM {totalCollected.toFixed(2)}</p>
                                    <p className="text-[10px] text-accent-green uppercase tracking-widest">Total Collected</p>
                                  </>
                                ) : leftToCollect > 0 ? (
                                  <>
                                    <p className="text-sm font-semibold text-accent-pink number-font">RM {leftToCollect.toFixed(2)}</p>
                                    <p className="text-[10px] text-secondary uppercase tracking-widest">Left to Collect</p>
                                  </>
                                ) : (
                                  <>
                                    <p className="text-sm font-semibold text-[oklch(0.85_0.15_220)] number-font">RM {(selectedSession.total ?? 0).toFixed(2)}</p>
                                    <p className="text-[10px] text-[oklch(0.85_0.15_220)] uppercase tracking-widest">Awaiting Claims</p>
                                  </>
                                )
                              ) : (
                                <>
                                  <p className="text-sm font-semibold text-[oklch(0.7_0.25_340)] number-font">Guest</p>
                                  <p className="text-[10px] text-secondary uppercase tracking-widest">Open Tab</p>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="h-px bg-white/10 mb-6" />
                          
                          <div className="space-y-3 mb-4">
                            {(selectedSession.participants ?? []).map(p => {
                              const st = sessionParticipants[`${sessionId}::${p.id}`] ?? p.payment_status;
                              const isSelf = p.id === 'me';
                              const isPaid = st === 'confirmed_paid';
                              const isDeclared = st === 'payment_declared';

                              return (
                                <div
                                  key={p.id}
                                  className={`p-4 rounded-xl flex items-center justify-between transition-all ${
                                    isSelf
                                      ? 'bg-surface border border-white/5 opacity-60'
                                      : isDeclared
                                      ? 'bg-surface-light border border-accent-pink/50 shadow-[0_0_20px_rgba(255,20,147,0.15)]'
                                      : isPaid
                                      ? 'bg-surface border border-white/5 opacity-80'
                                      : 'bg-surface border border-white/5'
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                                      isDeclared ? 'bg-accent-pink/10 text-accent-pink' : 'bg-white/5 text-secondary'
                                    }`}>
                                      {p.avatar}
                                    </div>
                                    <p className={`font-medium text-sm ${isPaid || isSelf ? 'text-secondary' : 'text-primary'}`}>
                                      {p.name}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    {(p.totalOwed ?? 0) > 0 && (
                                      <p className={`font-semibold text-sm number-font mb-1 ${isPaid || isSelf ? 'text-secondary' : 'text-white'}`}>
                                        RM {p.totalOwed.toFixed(2)}
                                      </p>
                                    )}
                                     {isSelf ? (
                                       <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded font-bold bg-white/10 text-secondary">Self</span>
                                     ) : isDeclared ? (
                                       <button
                                         onClick={() => { setGuestToVerify({ id: p.id, name: p.name, amount: p.totalOwed, sessionId }); setIsVerifyPaymentOpen(true); }}
                                         className="text-[10px] uppercase tracking-widest px-3 py-1.5 rounded font-bold bg-[#FF8C00] text-black shadow-[0_0_15px_rgba(255,140,0,0.3)] animate-pulse"
                                       >
                                         Verify
                                       </button>
                                     ) : isPaid ? (
                                       <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded font-bold bg-accent-green/10 text-accent-green border border-accent-green/20">Paid</span>
                                     ) : (
                                       <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded font-bold bg-accent-pink text-white shadow-[0_0_10px_rgba(255,20,147,0.3)]">Pending</span>
                                     )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </>
                      );
                    })()}
                    
                    <motion.button 
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setIsLedgerOpen(false);
                        // HARDEN: If session carries receipt data, sync to receipt state for lobby
                        if (selectedSession?.receipt) setReceipt(selectedSession.receipt);
                        setRole('host');
                        navigate('session_lobby', 1);
                      }}
                      className="w-full mt-4 bg-surface border border-white/10 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-surface-light transition-colors text-sm"
                    >
                      {allMamakPaid && selectedSession.id === 'receipt-992' ? 'View Settled Details' : 'View Full Details'}
                    </motion.button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            {/* Host Verify Payment Modal Overlay */}
            <AnimatePresence>
              {isVerifyPaymentOpen && guestToVerify && (
                <>
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsVerifyPaymentOpen(false)}
                    className="absolute inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center px-6"
                  >
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0, y: 20 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      exit={{ scale: 0.9, opacity: 0, y: 20 }}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full bg-surface border border-white/10 rounded-3xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.8)]"
                    >
                      <div className="w-16 h-16 rounded-full bg-[#FF8C00]/10 flex items-center justify-center text-[#FF8C00] mx-auto mb-4 border border-[#FF8C00]/20">
                        <ShieldCheck className="w-8 h-8" />
                      </div>
                      
                      <h3 className="text-xl font-bold text-center mb-2">Confirm Payment</h3>
                      <p className="text-sm text-secondary text-center mb-6 leading-relaxed">
                        Did you receive <strong className="text-white number-font">RM {guestToVerify.amount.toFixed(2)}</strong> from <strong className="text-white">{guestToVerify.name}</strong>?
                      </p>

                      <div className="space-y-3">
                        <motion.button 
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            // HARDEN: write to sessionParticipants using sessionId stored in guestToVerify
                            const key = `${guestToVerify.sessionId}::${guestToVerify.id}`;
                            setSessionParticipants(prev => ({ ...prev, [key]: 'confirmed_paid' }));
                            setIsVerifyPaymentOpen(false);
                          }}
                          className="w-full bg-accent-green text-black font-bold py-3.5 rounded-xl shadow-[0_0_20px_rgba(0,255,100,0.2)]"
                        >
                          Yes, Confirm Receipt
                        </motion.button>
                        <motion.button 
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setIsVerifyPaymentOpen(false)}
                          className="w-full bg-surface-light text-white font-semibold py-3.5 rounded-xl hover:bg-white/10 transition-colors"
                        >
                          Not yet
                        </motion.button>
                      </div>
                    </motion.div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

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

            <main className="flex-1 overflow-y-auto px-4 py-6 pb-72 no-scrollbar">
              <div className="flex flex-col gap-3">
                {receipt.items.map((item) => {
                  const Icon = item.icon;
                  const isMine = item.claimedBy.includes('me');
                   return (
                     <motion.div layout whileTap={{ scale: 0.98 }} onClick={() => toggleClaimItem(item.id)} key={item.id} className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-4 ${isMine ? 'bg-accent-pink/5 border-accent-pink/30 shadow-[0_0_20px_rgba(255,20,147,0.08)]' : 'glass-card'}`}>
                       <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors ${isMine ? 'bg-accent-pink text-white' : 'bg-white/5 text-secondary border border-white/10'}`}>
                         <Icon className="w-5 h-5" />
                       </div>
                       <div className="flex-1">
                         <p className={`font-semibold text-sm transition-colors text-white`}>{item.name}</p>
                         <p className="text-secondary text-[10px] uppercase tracking-wider mt-0.5 tabular-nums">RM {item.price.toFixed(2)}</p>
                       </div>
                       <div className="shrink-0 flex items-center">
                         <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${isMine ? 'border-accent-pink bg-accent-pink text-white' : 'border-white/10 bg-transparent'}`}>
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
                  <p>SVC ({serviceChargePercentage.toFixed(0)}%): RM {myServiceChargeAmount.toFixed(2)}</p>
                  <p>SST ({sstPercentage.toFixed(0)}%): RM {mySstAmount.toFixed(2)}</p>
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
            <header className="px-4 pt-12 pb-4 flex items-center justify-between border-b border-white/10 bg-surface/50 backdrop-blur-md sticky top-0 z-20">
              <button onClick={() => navigate('dashboard', -1)} className="p-2"><ChevronLeft className="w-6 h-6" /></button>
              <h2 className="font-semibold tracking-tight text-primary">Session Lobby</h2>
              <div className="w-10" />
            </header>

            <main className="flex-1 px-6 py-8 overflow-y-auto pb-10 no-scrollbar">
              {/* HARDEN: Determine lobby context */}
              {(() => {
                const isHistorical = selectedSession !== null;
                const lobbySessionId = selectedSession?.id ?? '';
                const lobbyParticipants = selectedSession?.participants ?? [];
                const lobbyGuests = lobbyParticipants.filter(p => p.id !== 'me');
                const isSettled = isHistorical && lobbyGuests.length > 0 && lobbyGuests.every(
                  p => (sessionParticipants[`${lobbySessionId}::${p.id}`] ?? p.payment_status) === 'confirmed_paid'
                );

                return (
                  <>
                    {/* Merchant & Total */}
                    <div className="text-center mb-8">
                      <h3 className="text-2xl font-bold mb-2 tracking-tight">
                        {isHistorical ? selectedSession.merchant : receipt.merchant}
                      </h3>
                      <p className="text-sm text-secondary number-font">
                        Total Bill: RM {isHistorical
                          ? (selectedSession.total ?? 0).toFixed(2)
                          : (receipt.subtotal + receipt.extractedTax + receipt.extractedServiceCharge + receipt.roundingAdjustment).toFixed(2)
                        }
                      </p>
                      {isHistorical && isSettled && (
                        <div className="mt-3 inline-flex items-center gap-2 bg-accent-green/10 border border-accent-green/20 text-accent-green px-4 py-1.5 rounded-full text-xs font-bold">
                          <Check className="w-3.5 h-3.5" />
                          Fully Settled
                        </div>
                      )}
                    </div>

                    {/* Share Tab section: show for fresh scan, OR historical + not settled */}
                    {(!isHistorical || !isSettled) && (
                      <>
                        <motion.button
                          whileTap={{ scale: 0.97 }}
                          onClick={() => setIsInviteFriendsOpen(true)}
                          className="w-full bg-accent-pink text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-[0_4px_25px_rgba(255,20,147,0.3)] mb-3"
                        >
                          <UserPlus className="w-5 h-5" />
                          {isHistorical ? 'Share Tab' : 'Invite Friends'}
                        </motion.button>

                        {/* Copy Link Tile */}
                        <div className="bg-surface-light border border-white/10 rounded-2xl px-4 py-3 flex items-center justify-between mb-8">
                          <p className="text-xs text-secondary font-mono truncate mr-2">aa-mate.app/t/mrni-892</p>
                          <motion.button
                            whileTap={{ scale: 0.93 }}
                            onClick={() => {
                              setIsCopied(true);
                              setTimeout(() => setIsCopied(false), 2000);
                            }}
                            className={`shrink-0 flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${isCopied ? 'bg-accent-green/20 text-accent-green' : 'bg-white/10 text-white hover:bg-white/20'}`}
                          >
                            <AnimatePresence mode="wait">
                              {isCopied ? (
                                <motion.span key="copied" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1">
                                  <Check className="w-3.5 h-3.5" /> Copied!
                                </motion.span>
                              ) : (
                                <motion.span key="copy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>Copy</motion.span>
                              )}
                            </AnimatePresence>
                          </motion.button>
                        </div>
                      </>
                    )}

                     {/* Participants List */}
                     {isHistorical ? (
                       // HISTORICAL PATH: render from selectedSession.participants with live statuses
                       <>
                         <h4 className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em] mb-4">
                           Participants ({lobbyParticipants.length})
                         </h4>
                         <div className="space-y-3">
                           {lobbyParticipants.map(p => {
                             const st = sessionParticipants[`${lobbySessionId}::${p.id}`] ?? p.payment_status;
                             const isSelf = p.id === 'me';
                             const isPaid = st === 'confirmed_paid';
                             const isDeclared = st === 'payment_declared';
                             return (
                               <motion.div
                                 key={p.id}
                                 initial={{ opacity: 0, y: 10 }}
                                 animate={{ opacity: 1, y: 0 }}
                                 whileTap={{ scale: 0.98 }}
                                 className={`p-4 rounded-2xl flex items-center justify-between transition-all ${
                                   isSelf ? 'bg-white/[0.02] border border-white/[0.05] opacity-60'
                                   : isDeclared ? 'bg-accent-pink/5 border border-accent-pink/30 shadow-[0_0_20px_rgba(255,20,147,0.1)]'
                                   : 'glass-card'
                                 }`}
                               >
                                 <div className="flex items-center gap-3">
                                   <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                                     isSelf ? 'bg-primary text-black'
                                     : isDeclared ? 'bg-accent-pink/10 text-accent-pink'
                                     : 'bg-white/5 text-secondary border border-white/10'
                                   }`}>
                                     {p.avatar}
                                   </div>
                                   <div>
                                     <p className="font-semibold text-sm text-white">{p.name}{isSelf ? ' (Host)' : ''}</p>
                                     {!isSelf && (
                                       <p className="text-[10px] text-secondary font-medium mt-0.5">
                                         {isDeclared ? 'Awaiting verification' : isPaid ? 'Payment confirmed' : 'Pending payment'}
                                       </p>
                                     )}
                                   </div>
                                 </div>
                                 <div className="text-right">
                                   {(p.totalOwed ?? 0) > 0 && (
                                     <p className={`font-bold text-sm tabular-nums mb-1 ${isPaid || isSelf ? 'text-secondary' : 'text-white'}`}>
                                       RM {p.totalOwed.toFixed(2)}
                                     </p>
                                   )}
                                   {isSelf ? (
                                     <span className="text-[10px] uppercase tracking-widest bg-white/10 text-secondary px-2 py-0.5 rounded font-bold">Self</span>
                                   ) : isDeclared ? (
                                     <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded font-bold bg-[#FF8C00]/10 text-[#FF8C00] border border-[#FF8C00]/20">Declared</span>
                                   ) : isPaid ? (
                                     <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded font-bold bg-accent-green/10 text-accent-green border border-accent-green/20">Paid</span>
                                   ) : (
                                     <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded font-bold bg-accent-pink/10 text-accent-pink border border-accent-pink/20">Pending</span>
                                   )}
                                 </div>
                               </motion.div>
                             );
                           })}
                         </div>
                       </>
                     ) : (
                       // FRESH SCAN PATH: existing behavior
                       <>
                         <h4 className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em] mb-4">
                           Participants ({1 + sessionGuests.length})
                         </h4>
                         <div className="space-y-3">
                           {/* Host Row */}
                           <div className="p-4 rounded-2xl glass-card border-white/[0.08] flex items-center justify-between opacity-90">
                             <div className="flex items-center gap-3">
                               <div className="w-10 h-10 rounded-full bg-primary text-black flex items-center justify-center font-bold">D</div>
                               <p className="font-semibold text-sm text-white">Daniel (Host)</p>
                             </div>
                             <div className="text-right">
                               <p className="font-bold text-sm tabular-nums mb-1 text-secondary">RM {myFinalTotal.toFixed(2)}</p>
                               <span className="text-[10px] uppercase tracking-widest bg-white/10 text-secondary px-2 py-0.5 rounded font-bold">Self</span>
                             </div>
                           </div>

                           {/* Dynamic Session Guests */}
                           {sessionGuests.map(guest => (
                             <motion.div
                               key={guest.id}
                               initial={{ opacity: 0, y: 10 }}
                               animate={{ opacity: 1, y: 0 }}
                               whileTap={{ scale: 0.98 }}
                               className="p-4 rounded-2xl glass-card border-accent-pink/20 flex items-center justify-between"
                             >
                               <div className="flex items-center gap-3">
                                 <div className="w-10 h-10 rounded-full bg-accent-pink/10 text-accent-pink border border-accent-pink/20 flex items-center justify-center font-bold">{guest.avatar}</div>
                                 <div>
                                   <p className="font-semibold text-sm text-white">{guest.name}</p>
                                   <p className="text-[10px] text-secondary font-medium mt-0.5">Invited — awaiting claims</p>
                                 </div>
                               </div>
                               <div className="text-right">
                                 <p className="font-bold text-sm tabular-nums mb-1 text-secondary">RM 0.00</p>
                                 <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded font-bold bg-accent-pink/10 text-accent-pink border border-accent-pink/20">Invited</span>
                               </div>
                             </motion.div>
                           ))}
                         </div>
                       </>
                     )}
                  </>
                );
              })()}
            </main>

            {/* Confirm & Go Live Sticky Footer — only shown for fresh scans (not historical view) */}
            {!selectedSession && (
              <div className="px-6 pb-8 pt-4 border-t border-white/5 bg-background shrink-0">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    const sessionData = {
                      id: `session-${Date.now()}`,
                      receipt: receipt,
                      guests: sessionGuests,
                      date: new Date().toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' }),
                      participantCount: 1 + sessionGuests.length,
                    };
                    navigate('dashboard', -1, sessionData);
                  }}
                  className="w-full bg-primary text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(255,255,255,0.15)]"
                >
                  <Check className="w-5 h-5" />
                  Confirm &amp; Go Live
                </motion.button>
              </div>
            )}


            {/* Invite Friends Bottom Sheet */}
            <AnimatePresence>
              {isInviteFriendsOpen && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={() => setIsInviteFriendsOpen(false)}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm z-40"
                  />
                  <motion.div
                    initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                    transition={{ type: 'spring', damping: 28, stiffness: 220 }}
                    className="absolute bottom-0 inset-x-0 bg-[#0A0A0A] border-t border-white/[0.08] rounded-t-[32px] p-6 pb-12 shadow-[0_-20px_60px_rgba(0,0,0,0.8)] z-50"
                  >
                    <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6" />
                    <h3 className="text-lg font-bold mb-1">Invite Friends</h3>
                    <p className="text-sm text-secondary mb-6">Select friends to split this bill with.</p>

                    <div className="space-y-3">
                      {friendsList.filter(f => f.friendshipStatus === 'accepted').map(friend => {
                        const isAdded = sessionGuests.some(g => g.id === friend.id);
                        return (
                          <div key={friend.id} className="flex items-center justify-between p-4 rounded-xl bg-surface-light border border-white/5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-surface text-secondary flex items-center justify-center font-bold text-lg border border-white/10">{friend.avatar}</div>
                              <p className="font-medium text-sm">{friend.name}</p>
                            </div>
                            <motion.button
                              whileTap={{ scale: 0.93 }}
                              disabled={isAdded}
                              onClick={() => {
                                if (!isAdded) setSessionGuests(prev => [...prev, friend]);
                              }}
                              className={`text-xs font-bold px-4 py-2 rounded-lg transition-all ${isAdded ? 'bg-accent-green/10 text-accent-green border border-accent-green/20 cursor-default' : 'bg-accent-pink text-white shadow-[0_0_15px_rgba(255,20,147,0.3)]'}`}
                            >
                              {isAdded ? '✓ Added' : '+ Add'}
                            </motion.button>
                          </div>
                        );
                      })}
                    </div>

                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setIsInviteFriendsOpen(false)}
                      className="w-full mt-6 bg-surface-light border border-white/10 text-white font-semibold py-3.5 rounded-xl"
                    >
                      Done
                    </motion.button>
                  </motion.div>
                </>
              )}
             </AnimatePresence>
           </motion.div>
         )}

        {/* VIEW 5: GUEST CLAIM SCREEN */}
         {view === 'guest_claim' && (
          <motion.div key="guest_claim" custom={slideDirection} variants={pageTransition} initial="initial" animate="animate" exit="exit" className="flex-1 h-full bg-background flex flex-col">
            <header className="px-4 pt-12 pb-4 flex items-center justify-between border-b border-white/10 bg-surface/50 backdrop-blur-md sticky top-0 z-20">
              <button 
                onClick={() => navigate('dashboard', -1)} 
                className="p-2"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <div className="text-center">
                <h2 className="font-semibold tracking-tight text-primary">{selectedSession?.merchant || 'HDL Friday'}</h2>
                <div className="flex items-center gap-1.5 justify-center text-accent-pink text-xs font-medium bg-accent-pink/10 px-2 py-0.5 rounded-full inline-flex mt-1">
                  <span>Invited by Daniel</span>
                </div>
              </div>
              <div className="w-10" />
            </header>

            <main className="flex-1 overflow-y-auto px-4 py-6 pb-72 no-scrollbar">
              <div className="bg-accent-pink/10 border border-accent-pink/20 rounded-xl p-3 mb-6 flex items-start gap-3">
                <Info className="w-5 h-5 text-accent-pink shrink-0 mt-0.5" />
                <p className="text-xs text-accent-pink/90 leading-relaxed">
                  {isClaimsLocked ? "Your claims are saved. Tap 'Edit Claims' to make changes." : "Only unclaimed items are shown. Tap to claim what you ordered."}
                </p>
              </div>

              <div className="flex flex-col gap-3">
                 {receipt.items.map((item) => {
                   const Icon = item.icon;
                   const isMine = item.claimedBy.includes('me');
                   return (
                     <motion.div layout whileTap={{ scale: 0.98 }} onClick={() => toggleClaimItem(item.id)} key={item.id} className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-4 ${isMine ? 'bg-accent-green/5 border-accent-green/30 shadow-[0_0_20px_rgba(0,255,100,0.08)]' : 'glass-card'}`}>
                       <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors ${isMine ? 'bg-accent-green text-black' : 'bg-white/5 text-secondary border border-white/10'}`}>
                         <Icon className="w-5 h-5" />
                       </div>
                       <div className="flex-1">
                         <p className={`font-semibold text-sm transition-colors text-white`}>{item.name}</p>
                         <p className="text-secondary text-[10px] uppercase tracking-wider mt-0.5 tabular-nums">RM {item.price.toFixed(2)}</p>
                       </div>
                       <div className="shrink-0 flex items-center">
                         <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${isMine ? 'border-accent-green bg-accent-green text-black' : 'border-white/10 bg-transparent'}`}>
                           {isMine && <Check className="w-4 h-4" />}
                         </div>
                       </div>
                     </motion.div>
                   );
                 })}
              </div>
            </main>

            {/* Guest Calculator Bottom Sheet */}
            <motion.div className="absolute bottom-0 inset-x-0 bg-surface border-t border-white/10 rounded-t-[32px] p-6 pb-8 shadow-[0_-10px_40px_rgba(0,0,0,0.8)] z-30">
              <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6" />
              <div className="flex justify-between items-end mb-6">
                <div>
                  <p className="text-sm text-secondary mb-1">Your Total</p>
                  <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent-green to-teal-400 number-font">RM {myFinalTotal.toFixed(2)}</span>
                </div>
                <div className="text-right text-xs text-secondary space-y-1">
                  <p>Subtotal: RM {mySubtotal.toFixed(2)}</p>
                  <p>SVC ({serviceChargePercentage.toFixed(0)}%): RM {myServiceChargeAmount.toFixed(2)}</p>
                  <p>SST ({sstPercentage.toFixed(0)}%): RM {mySstAmount.toFixed(2)}</p>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {!isClaimsLocked ? (
                  <motion.button 
                    key="save"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    whileTap={{ scale: 0.96 }} 
                    disabled={mySubtotal === 0} 
                    onClick={() => setIsClaimsLocked(true)} 
                    className={`w-full py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${mySubtotal > 0 ? 'bg-primary text-black' : 'bg-surface-light text-secondary'}`}
                  >
                    <span>Save My Claims</span>
                  </motion.button>
                ) : (
                  <motion.div 
                    key="locked"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col gap-3"
                  >
                    <div className="bg-accent-green/10 border border-accent-green/30 text-accent-green py-3 rounded-xl flex items-center justify-center gap-2 mb-2">
                      <ShieldCheck className="w-5 h-5" />
                      <span className="font-semibold text-sm">Claims Saved & Locked</span>
                    </div>
                    
                    <motion.button 
                      whileTap={{ scale: 0.96 }} 
                      onClick={() => navigate('settlement', 1)} 
                      className="w-full bg-accent-pink text-white font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(255,20,147,0.3)]"
                    >
                      Settle My Bill
                    </motion.button>
                    
                    <motion.button 
                      whileTap={{ scale: 0.96 }} 
                      onClick={() => setIsClaimsLocked(false)} 
                      className="w-full bg-surface-light text-white font-semibold py-3 rounded-xl hover:bg-white/10 transition-colors text-sm"
                    >
                      Edit Claims
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}

        {/* VIEW 6: SETTLEMENT SCREEN (GUEST PACING) */}
        {view === 'settlement' && (
          <motion.div key="settlement" custom={slideDirection} variants={pageTransition} initial="initial" animate="animate" exit="exit" className="flex-1 h-full bg-background flex flex-col px-6 overflow-y-auto no-scrollbar pb-12">
            <header className="pt-12 pb-8 text-center flex flex-col items-center relative">
              <button 
                onClick={() => isPaymentDeclared ? resetFlow() : navigate('guest_claim', -1)} 
                className="absolute left-0 top-12 p-2 -ml-2"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              
              <AnimatePresence mode="wait">
              {!isPaymentDeclared ? (
                  <motion.div key="owe-text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center">
                    <h2 className="text-xl text-secondary mb-2 mt-2">You owe</h2>
                    <p className="text-5xl font-bold number-font text-white mb-2 tracking-tight">RM {myFinalTotal.toFixed(2)}</p>
                    <p className="text-sm text-secondary font-medium">to Daniel (Host)</p>
                  </motion.div>
                ) : (
                  <motion.div key="paid-text" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center pt-8">
                    <div className="w-16 h-16 rounded-full bg-[oklch(0.85_0.15_220)]/10 flex items-center justify-center text-[oklch(0.85_0.15_220)] mb-4 border border-[oklch(0.85_0.15_220)]/20 shadow-[0_0_30px_rgba(0,180,255,0.15)]">
                      <Clock className="w-8 h-8 animate-pulse" />
                    </div>
                    <p className="text-sm font-semibold text-secondary uppercase tracking-widest mb-2">Total Paid</p>
                    <p className="text-5xl font-bold number-font text-white mb-4 tracking-tight">RM {myFinalTotal.toFixed(2)}</p>
                    
                    <div className="bg-[oklch(0.85_0.15_220)]/10 px-4 py-2 rounded-full border border-[oklch(0.85_0.15_220)]/20 mb-3">
                      <span className="text-sm font-bold text-[oklch(0.85_0.15_220)] tracking-wide">Pending Verification</span>
                    </div>
                    <p className="text-xs text-neutral-400">Waiting for Daniel to confirm your payment.</p>
                    
                    <motion.button 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate('dashboard', -1)}
                      className="mt-6 px-10 py-2.5 rounded-full bg-white/5 border border-white/10 text-white font-semibold text-sm hover:bg-white/10 transition-colors"
                    >
                      OK
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </header>

            <AnimatePresence mode="wait">
              {!isPaymentDeclared && (
                <>
                <motion.div key="qr-flow" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col items-center flex-1">
                  <div className="text-center mb-6">
                    <span className="font-bold text-lg tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-500">DuitNow</span>
                    <p className="text-xs text-secondary mt-1">Scan to automatically pay host</p>
                  </div>
                  
                  <div className="w-64 h-64 bg-white rounded-[32px] p-6 shadow-[0_0_50px_rgba(255,20,147,0.15)] flex flex-col items-center justify-center mb-8">
                    <QrCode className="w-full h-full text-black/80" strokeWidth={1} />
                  </div>

                  <div className="w-full mt-auto mt-4">
                    <motion.button 
                      whileTap={{ scale: 0.96 }} 
                      onClick={() => setIsPaymentDeclared(true)} 
                      className="w-full bg-accent-green text-black font-bold py-4 rounded-xl flex items-center justify-center shadow-[0_4px_25px_rgba(0,255,100,0.25)] tracking-wide"
                    >
                      I've Transferred the Money
                    </motion.button>
                  </div>
                </motion.div>
                <motion.div key="digital-receipt" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full mt-2 flex flex-col items-center">
                   
                   <div className="w-full bg-[#0A0A0A] border border-white/[0.08] rounded-3xl p-6 shadow-xl relative overflow-hidden">
                     {/* Visual Receipt ZigZag Edge */}
                     <div className="absolute top-0 inset-x-0 h-1 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjQiPjxwb2x5Z29uIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wOCkiIHBvaW50cz0iwCA0IDQgMCA4IDQiLz48L3N2Zz4=')] repeat-x" />
                     
                     <h4 className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em] mb-4 border-b border-white/[0.08] pb-4">Itemized Claims</h4>
                     
                     <div className="space-y-4 mb-4">
                       {myClaimedItems.map((item, idx) => (
                         <div key={idx} className="flex justify-between items-center">
                           <span className="text-sm font-medium text-white/90">{item.name}</span>
                           <span className="text-sm font-bold tabular-nums text-white">RM {item.price.toFixed(2)}</span>
                         </div>
                       ))}
                     </div>

                     <div className="h-px border-dashed border-b border-white/[0.08] my-6" />
                     
                     <div className="space-y-2.5 mb-2">
                       <div className="flex justify-between items-center text-xs">
                         <span className="text-secondary font-medium">Subtotal</span>
                         <span className="text-secondary tabular-nums font-bold">RM {mySubtotal.toFixed(2)}</span>
                       </div>
                       <div className="flex justify-between items-center text-xs">
                         <span className="text-secondary font-medium">Service Charge ({serviceChargePercentage.toFixed(0)}%)</span>
                         <span className="text-secondary tabular-nums font-bold">RM {myServiceChargeAmount.toFixed(2)}</span>
                       </div>
                       <div className="flex justify-between items-center text-xs font-medium">
                         <span className="text-secondary font-medium">SST ({sstPercentage.toFixed(0)}%)</span>
                         <span className="text-secondary tabular-nums font-bold">RM {mySstAmount.toFixed(2)}</span>
                       </div>
                     </div>

                     <div className="h-px bg-white/[0.08] my-6" />

                     <div className="flex justify-between items-center">
                       <span className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">Total</span>
                       <span className="text-xl font-bold tabular-nums text-[oklch(0.85_0.15_220)]">RM {myFinalTotal.toFixed(2)}</span>
                     </div>

                   </div>

                   <motion.button whileTap={{ scale: 0.98 }} onClick={resetFlow} className="mt-8 text-secondary text-sm font-bold hover:text-white transition-colors py-3 px-8 rounded-full bg-white/5 border border-white/10">
                     Return to Dashboard
                   </motion.button>
                </motion.div>
              </>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* VIEW 7: PROFILE & AUTHENTICATION */}
        {view === 'profile' && (
          <motion.div key="profile" custom={slideDirection} variants={pageTransition} initial="initial" animate="animate" exit="exit" className="flex-1 h-full bg-background flex flex-col relative overflow-hidden">
            <header className="px-4 pt-12 pb-4 flex items-center justify-between border-b border-white/10 bg-surface/50 backdrop-blur-md sticky top-0 z-20">
              <button onClick={() => navigate('dashboard', -1)} className="p-2"><ChevronLeft className="w-6 h-6" /></button>
              <h2 className="font-semibold tracking-tight text-primary">Profile</h2>
              <button className="p-2 text-secondary"><Settings className="w-5 h-5" /></button>
            </header>

            <main className="flex-1 overflow-y-auto px-6 py-8 pb-48 no-scrollbar">
               {/* Profile Header */}
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="flex flex-col items-center mb-10"
               >
                 <motion.div 
                   whileHover={{ scale: 1.05 }}
                   whileTap={{ scale: 0.95 }}
                   className="w-24 h-24 rounded-full bg-[#0A0A0A] border-2 border-white/10 overflow-hidden mb-4 relative group cursor-pointer shadow-[0_10px_40px_rgba(0,0,0,0.5)]"
                 >
                   <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Daniel" alt="Avatar" className="w-full h-full object-cover" />
                   <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                     <Camera className="w-6 h-6 text-white" />
                   </div>
                 </motion.div>
                 <h3 className="text-xl font-bold text-white tracking-tight">Daniel Hafiz</h3>
                 <p className="text-secondary text-sm font-medium mt-1">@danielhfz</p>
               </motion.div>

               {/* Contact Details & Verification */}
               <h4 className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em] mb-4">Contact Details</h4>
               <div className="glass-card rounded-2xl overflow-hidden mb-10">
                
                {/* Phone Field */}
                <div className="p-4 flex items-center justify-between border-b border-white/[0.05]">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-secondary border border-white/10">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">Phone Number</p>
                      <p className="text-xs text-secondary mt-0.5 tabular-nums font-medium">+60 12-345 6789</p>
                    </div>
                  </div>
                  {isPhoneVerified ? (
                    <div className="flex items-center gap-1.5 text-accent-green bg-accent-green/10 px-3 py-1.5 rounded-full text-xs font-semibold">
                      <ShieldCheck className="w-4 h-4" />
                      Verified
                    </div>
                  ) : (
                    <button 
                      onClick={() => { setOtpType('phone'); setIsOtpOpen(true); }}
                      className="text-xs font-semibold bg-accent-pink text-white px-4 py-1.5 rounded-full hover:bg-accent-pink/90 transition-colors shadow-[0_0_15px_rgba(255,20,147,0.3)]"
                    >
                      Verify
                    </button>
                  )}
                </div>

                {/* Email Field */}
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-secondary border border-white/10">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">Email Address</p>
                      <p className="text-xs text-secondary mt-0.5 font-medium">daniel@example.com</p>
                    </div>
                  </div>
                  {isEmailVerified ? (
                    <div className="flex items-center gap-1.5 text-accent-green bg-accent-green/10 px-3 py-1.5 rounded-full text-xs font-semibold">
                      <ShieldCheck className="w-4 h-4" />
                      Verified
                    </div>
                  ) : (
                    <button 
                      onClick={() => { setOtpType('email'); setIsOtpOpen(true); }}
                      className="text-xs font-semibold bg-accent-pink text-white px-4 py-1.5 rounded-full hover:bg-accent-pink/90 transition-colors"
                    >
                      Verify
                    </button>
                  )}
                </div>
              </div>

              {/* Friend Requests Section */}
              {friendsList.filter(f => f.friendshipStatus === 'pending_incoming').length > 0 && (
                <div className="mb-8">
                  <h4 className="text-xs font-semibold text-secondary uppercase tracking-wider mb-4 flex items-center gap-2">
                    Friend Requests
                    <span className="bg-accent-pink text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                      {friendsList.filter(f => f.friendshipStatus === 'pending_incoming').length}
                    </span>
                  </h4>
                  <div className="space-y-3">
                    {friendsList.filter(f => f.friendshipStatus === 'pending_incoming').map(friend => (
                      <motion.div 
                        key={friend.id} 
                        whileTap={{ scale: 0.98 }}
                        className="p-4 rounded-2xl glass-card border-accent-pink/30 flex items-center justify-between shadow-[0_4px_25px_rgba(255,20,147,0.1)]"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-white/5 text-secondary flex items-center justify-center font-bold text-lg border border-white/10">{friend.avatar}</div>
                          <div>
                            <p className="font-semibold text-sm text-white">{friend.name}</p>
                            <p className="text-[10px] text-secondary font-medium mt-0.5">Wants to be friends</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleRejectFriend(friend.id)} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-secondary border border-white/10 transition-colors">
                            <X className="w-4 h-4" />
                          </motion.button>
                          <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleAcceptFriend(friend.id)} className="w-8 h-8 rounded-full bg-accent-green text-black hover:opacity-90 flex items-center justify-center transition-colors shadow-[0_0_10px_rgba(0,255,100,0.3)]">
                            <Check className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* My Friends Section */}
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xs font-semibold text-secondary uppercase tracking-wider">My Friends</h4>
              </div>
              
                <div className="space-y-3 mb-6">
                  {friendsList.filter(f => f.friendshipStatus === 'accepted').map(friend => (
                    <motion.div 
                      key={friend.id} 
                      whileTap={{ scale: 0.98 }}
                      className="p-4 rounded-2xl glass-card flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/5 text-secondary flex items-center justify-center font-bold text-lg border border-white/10">{friend.avatar}</div>
                        <div>
                          <p className="font-semibold text-sm flex items-center gap-1.5 text-white">
                            {friend.name}
                            <ShieldCheck className="w-3 h-3 text-accent-green" />
                          </p>
                          <p className="text-[10px] text-secondary font-medium mt-0.5 uppercase tracking-wider tabular-nums">Joined Oct 2023</p>
                        </div>
                      </div>
                      <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleRejectFriend(friend.id)} className="text-[10px] font-bold bg-white/10 px-3 py-1.5 rounded uppercase tracking-widest text-white border border-white/10 hover:bg-white/20 transition-all">Remove</motion.button>
                    </motion.div>
                  ))}
                </div>

              <motion.button 
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsAddFriendOpen(true)}
                className="w-full border border-dashed border-white/20 rounded-xl p-4 flex flex-col items-center justify-center gap-2 text-secondary hover:text-white hover:border-white/40 transition-colors bg-surface-light/30"
              >
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-current">
                  <UserPlus className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium">Add Friend via User ID</span>
              </motion.button>

            </main>

            {/* OTP Bottom Sheet Overlay */}
            <AnimatePresence>
              {isOtpOpen && (
                <>
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => { setIsOtpOpen(false); setOtpValue(['','','','','','']); }}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm z-40"
                  />
                   <motion.div 
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ type: 'spring', damping: 28, stiffness: 220 }}
                    className="absolute bottom-0 inset-x-0 bg-[#0A0A0A] border-t border-white/[0.08] rounded-t-[32px] p-6 pb-12 shadow-[0_-20px_60px_rgba(0,0,0,0.8)] z-50 flex flex-col items-center"
                  >
                    <div className="w-12 h-1 bg-white/20 rounded-full mb-8" />
                    
                    <div className="w-16 h-16 rounded-full bg-accent-pink/10 flex items-center justify-center text-accent-pink mb-4">
                      <ShieldCheck className="w-8 h-8" />
                    </div>
                    
                     <h3 className="text-xl font-bold text-white tracking-tight mb-2">Verification Code</h3>
                    <p className="text-sm text-secondary text-center mb-10 font-medium">
                      We've sent a 6-digit code to your {otpType}.<br />Enter it below to verify.
                    </p>

                    <div className="flex gap-2 mb-8 justify-center w-full">
                      {otpValue.map((digit, index) => (
                        <input
                          key={index}
                          ref={otpRefs[index]}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9]/g, '');
                            const newOtp = [...otpValue];
                            newOtp[index] = val;
                            setOtpValue(newOtp);
                            
                            // /delight Auto-focus next
                            if (val && index < 5) {
                              otpRefs[index + 1].current.focus();
                            }
                            
                            // Mock success
                            if (index === 5 && val && newOtp.join('') === '123456') {
                              setTimeout(() => {
                                if (otpType === 'phone') setIsPhoneVerified(true);
                                if (otpType === 'email') setIsEmailVerified(true);
                                setIsOtpOpen(false);
                                setOtpValue(['','','','','','']);
                              }, 600);
                            }
                          }}
                          onKeyDown={(e) => {
                            // Handle backspace auto-focus
                            if (e.key === 'Backspace' && !digit && index > 0) {
                              otpRefs[index - 1].current.focus();
                            }
                          }}
                          className={`w-12 h-14 rounded-xl text-center text-2xl font-bold number-font bg-background border transition-colors outline-none focus:ring-2 focus:ring-accent-pink/50 ${
                            digit ? 'border-accent-pink text-white shadow-[0_0_15px_rgba(255,20,147,0.1)]' : 'border-white/10 text-secondary focus:border-white/30'
                          }`}
                        />
                      ))}
                    </div>

                    <p className="text-xs font-semibold text-secondary hover:text-white cursor-pointer transition-colors">
                      Didn't receive a code? Resend
                    </p>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            {/* Add Friend Bottom Sheet Overlay */}
            <AnimatePresence>
              {isAddFriendOpen && (
                <>
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => { setIsAddFriendOpen(false); setAddFriendId(''); }}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm z-40"
                  />
                  <motion.div 
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="absolute bottom-0 inset-x-0 bg-[#0A0A0A] border-t border-white/[0.08] rounded-t-[32px] p-6 pb-12 shadow-[0_-20px_60px_rgba(0,0,0,0.8)] z-50 flex flex-col"
                  >
                    <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6" />
                    
                    <h3 className="text-xl font-bold mb-2">Add a Friend</h3>
                    <p className="text-sm text-secondary mb-6">
                      Enter their unique User ID to send a request.
                    </p>

                    <div className="relative mb-6">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary" />
                      <input 
                        type="text"
                        value={addFriendId}
                        onChange={(e) => setAddFriendId(e.target.value)}
                        placeholder="e.g. danielhfz"
                        className="w-full bg-background border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-secondary/50 focus:border-accent-pink focus:outline-none transition-colors text-lg"
                      />
                    </div>

                    <motion.button 
                      whileTap={{ scale: 0.96 }}
                      disabled={addFriendId.length < 3}
                      onClick={() => {
                        // Create mock pending outgoing request
                        const newFriend = {
                          id: `user-${Date.now()}`,
                          name: `@${addFriendId}`,
                          avatar: '?',
                          friendshipStatus: 'pending_outgoing'
                        };
                        setFriendsList([...friendsList, newFriend]);
                        setIsAddFriendOpen(false);
                        setAddFriendId('');
                      }}
                      className={`w-full py-4 rounded-xl font-bold transition-all shadow-lg ${addFriendId.length >= 3 ? 'bg-accent-pink text-white shadow-[0_0_20px_rgba(255,20,147,0.3)]' : 'bg-surface-light text-secondary shadow-none cursor-not-allowed'}`}
                    >
                      Send Request
                    </motion.button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
