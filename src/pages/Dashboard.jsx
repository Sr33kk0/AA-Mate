import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Receipt, Users, UserPlus, UserCircle, Plus } from 'lucide-react';
import { formatCents } from '../utils/splitEngine';
import { supabase } from '../lib/supabase';

// ─── Dev fallback ────────────────────────────────────────────────────────────
// Used while auth is not yet wired up. Replace nothing — supabase.auth.getUser()
// will return the real user once auth is integrated.
const DEV_MOCK_USER_ID = '8357269d-e69b-474e-9610-3a3776c14af1';

// ─── Status helpers ───────────────────────────────────────────────────────────
function deriveHostStatus(participants, userId) {
  const guests = participants.filter(p => p.user_id !== userId);
  if (guests.length === 0) return 'wait_claim';
  if (guests.every(p => p.payment_status === 'confirmed_paid')) return 'settled';
  if (guests.some(p => p.payment_status === 'payment_declared')) return 'verification_needed';
  if (guests.some(p => p.claim_status === 'selecting')) return 'wait_claim';
  return 'wait_payment';
}

const HOST_STATUS_MAP = {
  settled:              { label: 'Settled',              statusColor: 'bg-white/40',    statusTextColor: 'text-subtext',    route: '/host-receipt-settled'     },
  verification_needed:  { label: 'Verification Needed',  statusColor: 'bg-yellow-400',  statusTextColor: 'text-yellow-400', route: '/host-receipt-waitpayment' },
  wait_claim:           { label: 'Claiming Items',        statusColor: 'bg-[#FF007F]',   statusTextColor: 'text-[#FF007F]',  route: '/host-receipt-waitclaim'   },
  wait_payment:         { label: 'Waiting for Payment',   statusColor: 'bg-[#FF007F]',   statusTextColor: 'text-[#FF007F]',  route: '/host-receipt-waitpayment' },
};

const GUEST_STATUS_MAP = {
  pending:           { label: 'Pending Payment',       statusColor: 'bg-secondary',   statusTextColor: 'text-secondary',  route: '/client-receipt-pending' },
  payment_declared:  { label: 'Awaiting Confirmation', statusColor: 'bg-yellow-400',  statusTextColor: 'text-yellow-400', route: '/client-receipt-pending' },
  confirmed_paid:    { label: 'Paid',                  statusColor: 'bg-white/40',    statusTextColor: 'text-subtext',    route: '/client-receipt-paid'    },
};

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ─── Data transform ───────────────────────────────────────────────────────────
function transformReceipt(receipt, userId) {
  const participants = receipt.receipt_participants ?? [];
  const isHost = receipt.host_id === userId;

  if (isHost) {
    const statusKey = deriveHostStatus(participants, userId);
    const { label, statusColor, statusTextColor, route } = HOST_STATUS_MAP[statusKey];

    // Sum what non-host guests still owe (unpaid proportional totals → cents)
    const owedToYouCents = participants
      .filter(p => p.user_id !== userId && p.payment_status !== 'confirmed_paid')
      .reduce((sum, p) => sum + Math.round(p.proportional_total * 100), 0);

    return {
      id: receipt.id,
      type: 'host',
      name: receipt.restaurant_name,
      participants: participants.length,
      date: formatDate(receipt.created_at),
      status: label,
      statusColor,
      statusTextColor,
      iconText: receipt.restaurant_name[0].toUpperCase(),
      route,
      amountInCents: owedToYouCents,
      isOwedToYou: true,
      isSettled: statusKey === 'settled',
    };
  }

  const myRow = participants.find(p => p.user_id === userId);
  if (!myRow) return null;

  const { label, statusColor, statusTextColor, route } = GUEST_STATUS_MAP[myRow.payment_status] ?? GUEST_STATUS_MAP.pending;
  const isSettled = myRow.payment_status === 'confirmed_paid';

  return {
    id: receipt.id,
    type: 'client',
    name: receipt.restaurant_name,
    participants: participants.length,
    date: formatDate(receipt.created_at),
    status: label,
    statusColor,
    statusTextColor,
    iconText: receipt.restaurant_name[0].toUpperCase(),
    route,
    amountInCents: Math.round(myRow.proportional_total * 100),
    isYouOwe: true,
    isSettled,
  };
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function DashboardSkeleton() {
  return (
    <div className="flex-1 flex w-full max-w-md mx-auto h-full bg-bg relative flex-col animate-pulse">
      {/* Header */}
      <header className="bg-bg/80 backdrop-blur-xl absolute top-0 z-50 flex justify-between items-center w-full px-6 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded bg-border/50" />
          <div className="w-24 h-5 rounded bg-border/50" />
        </div>
        <div className="w-10 h-10 rounded-full bg-border/50" />
      </header>

      <main className="flex-1 overflow-y-auto px-6 pt-24 pb-48 space-y-8">
        {/* Balance Cards */}
        <section className="grid grid-cols-2 gap-4">
          {[0, 1].map(i => (
            <div key={i} className="bg-subground border border-border rounded-2xl p-5 h-32 flex flex-col justify-between">
              <div className="w-16 h-2.5 rounded bg-border/50" />
              <div className="w-24 h-7 rounded bg-border/50" />
            </div>
          ))}
        </section>

        {/* Tabs */}
        <div className="bg-subground border border-border rounded-xl p-1 flex gap-1">
          <div className="flex-1 h-9 rounded-lg bg-border/50" />
          <div className="flex-1 h-9 rounded-lg bg-border/30" />
        </div>

        {/* Receipt Cards */}
        <section className="space-y-3">
          {[0, 1, 2].map(i => (
            <div key={i} className="bg-subground border border-border rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-border/50 shrink-0" />
                <div className="space-y-2">
                  <div className="w-32 h-3 rounded bg-border/50" />
                  <div className="w-20 h-2.5 rounded bg-border/30" />
                  <div className="w-28 h-2 rounded bg-border/30" />
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 pl-6">
                <div className="w-16 h-4 rounded bg-border/50" />
                <div className="w-10 h-2.5 rounded bg-border/30" />
              </div>
            </div>
          ))}
        </section>
      </main>

      {/* Bottom Nav */}
      <nav className="absolute bottom-0 w-full flex justify-around items-center px-6 pb-8 pt-4 bg-bg/80 backdrop-blur-xl border-t border-border z-50">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="flex flex-col items-center gap-1.5">
            <div className="w-6 h-6 rounded bg-border/50" />
            <div className="w-8 h-2 rounded bg-border/30" />
          </div>
        ))}
      </nav>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('active');
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchDashboard() {
      setLoading(true);
      setError(null);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const userId = user?.id ?? DEV_MOCK_USER_ID;

        const { data, error: fetchError } = await supabase
          .from('receipts')
          .select(`
            id,
            restaurant_name,
            host_id,
            status,
            total_amount,
            created_at,
            receipt_participants (
              user_id,
              proportional_total,
              payment_status,
              claim_status
            )
          `)
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;

        setReceipts((data ?? []).map(r => transformReceipt(r, userId)).filter(Boolean));
      } catch (err) {
        console.error('Dashboard fetch failed:', err);
        setError('Could not load receipts. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, []);

  const activeReceipts = useMemo(() => receipts.filter(r => !r.isSettled), [receipts]);
  const settledReceipts = useMemo(() => receipts.filter(r => r.isSettled), [receipts]);

  const totalOwedToYouCents = useMemo(
    () => activeReceipts.reduce((acc, r) => r.isOwedToYou ? acc + r.amountInCents : acc, 0),
    [activeReceipts]
  );

  const totalYouOweCents = useMemo(
    () => activeReceipts.reduce((acc, r) => r.isYouOwe ? acc + r.amountInCents : acc, 0),
    [activeReceipts]
  );

  const displayedReceipts = activeTab === 'active' ? activeReceipts : settledReceipts;

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="flex-1 flex w-full max-w-md mx-auto h-full bg-bg relative flex-col">
      {/* Header */}
      <header className="bg-bg/80 backdrop-blur-xl absolute top-0 z-50 flex justify-between items-center w-full px-6 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Menu className="w-6 h-6 text-text hover:opacity-80 transition-opacity active:scale-95 duration-200 ease-out cursor-pointer" />
          <h1 className="text-xl font-bold tracking-tight text-text font-sans">AA-Mate</h1>
        </div>
        <div className="w-10 h-10 rounded-full border border-border overflow-hidden hover:opacity-80 transition-opacity active:scale-95 duration-200 cursor-pointer">
          <img
            alt="User Profile"
            className="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuB04hfs9-r7Z3uS2588xEf5MJeC0wOZooy03L9EZqQ_iRvu6sQb_oBmV4IMMWYSTHtFIYI8VSMSPYwe28Dh1YluHZHdJRBb5q2dRrESvqxCr_VBBXvjxC8b7P7_wG3RM7oZFM7ijmIiGJhAjGv32R06znQt6Afkk_H2z_3rbgl0Bm-WGfzyuV-ku6NwxC9AkVS9xtKo3jiFj22_lc9cGu67DS2AXFoLmNgbwgHjTwtaxh5IWvMstSrm1xOnlgP4PLzwkcgjWVVLh6WA"
          />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 items-stretch overflow-y-auto px-6 pt-24 pb-48 space-y-8 scroll-smooth z-10 font-sans [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">

        {/* Balance Section */}
        <section className="grid grid-cols-2 gap-4">
          <div className="bg-subground border border-border rounded-2xl p-5 flex flex-col justify-between h-32 hover:bg-white/5 transition-colors">
            <span className="text-[10px] font-bold uppercase tracking-widest text-text">You Owe</span>
            <div className="flex flex-col">
              <span className="text-2xl font-black text-[#FF007F] tabular-nums">
                RM {formatCents(totalYouOweCents)}
              </span>
            </div>
          </div>
          <div className="bg-subground border border-border rounded-2xl p-5 flex flex-col justify-between h-32 hover:bg-white/5 transition-colors">
            <span className="text-[10px] font-bold uppercase tracking-widest text-text">Owed to You</span>
            <div className="flex flex-col">
              <span className="text-2xl font-black text-secondary tabular-nums">
                RM {formatCents(totalOwedToYouCents)}
              </span>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="flex bg-subground p-1 rounded-xl w-full border border-border relative">
          <div
            className={`tab-slider-pill absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg transition-all duration-300 ease-out ${activeTab === 'active' ? 'left-1' : 'left-[calc(50%+2px)]'}`}
          />
          <button
            onClick={() => setActiveTab('active')}
            className={`flex-1 relative z-10 font-bold py-2.5 rounded-lg text-xs transition-colors duration-300 ${activeTab === 'active' ? 'text-black' : 'text-text hover:text-text'}`}
          >
            Active Tabs
          </button>
          <button
            onClick={() => setActiveTab('settled')}
            className={`flex-1 relative z-10 font-bold py-2.5 rounded-lg text-xs transition-colors duration-300 ${activeTab === 'settled' ? 'text-black' : 'text-text hover:text-text'}`}
          >
            Settled
          </button>
        </section>

        {/* Receipt List */}
        <section className="space-y-3">
          {error && (
            <p className="text-[#FF007F] text-sm text-center py-8">{error}</p>
          )}
          {!error && displayedReceipts.length === 0 && (
            <p className="text-subtext text-sm text-center py-8">No {activeTab} receipts.</p>
          )}
          {!error && displayedReceipts.map((item) => (
            <div
              key={item.id}
              onClick={() => item.route && navigate(`${item.route}/${item.id}`)}
              className={`bg-subground border border-border rounded-2xl p-4 flex items-stretch justify-between transition-all duration-200 ${item.route ? 'group active:scale-[0.98] cursor-pointer' : 'opacity-60 cursor-default'}`}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-bg flex items-center justify-center border border-border shrink-0">
                  <span className={`font-black text-xl ${item.type === 'host' ? 'text-[#FF007F]' : 'text-secondary'}`}>{item.iconText}</span>
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-text text-sm">{item.name}</h3>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${item.statusColor} ${item.status === 'Verification Needed' ? 'animate-blink-slow' : ''}`} />
                    <span className={`text-[10px] font-bold ${item.statusTextColor} uppercase tracking-tighter ${item.status === 'Verification Needed' ? 'animate-blink-slow' : ''}`}>{item.status}</span>
                  </div>
                  <p className="text-[10px] text-subtext font-medium">{item.date} • {item.participants} Participants</p>
                </div>
              </div>
              <div className="relative flex flex-col items-end shrink-0 self-stretch pl-6 min-w-[100px]">
                <span className={`absolute top-1/2 -translate-y-1/2 text-sm font-black tabular-nums whitespace-nowrap ${item.isOwedToYou ? 'text-secondary' : 'text-[#FF007F]'}`}>
                  RM {formatCents(item.amountInCents)}
                </span>
                <span className="text-[10px] text-subtext font-medium mt-auto">({item.type === 'host' ? 'Host' : 'Guest'})</span>
              </div>
            </div>
          ))}
        </section>
      </main>

      {/* Floating Action Button */}
      <div className="absolute bottom-32 right-6 z-40">
        <button className="bg-[#FF007F] text-white w-14 h-14 rounded-2xl flex items-center justify-center active:scale-[0.98] transition-all">
          <Plus className="w-8 h-8" />
        </button>
      </div>

      {/* Bottom Nav */}
      <nav className="absolute bottom-0 w-full flex justify-around items-center px-6 pb-8 pt-4 bg-bg/80 backdrop-blur-xl border-t border-border z-50">
        <button onClick={() => navigate('/dashboard')} className="flex flex-col items-center justify-center text-[#FF007F] active:scale-90 transition-transform">
          <Receipt className="w-6 h-6" />
          <span className="font-medium text-[10px] font-sans mt-1">Activity</span>
        </button>
        <button onClick={() => navigate('/dashboard')} className="flex flex-col items-center justify-center text-subtext hover:text-text transition-colors active:scale-90">
          <Users className="w-6 h-6" />
          <span className="font-medium text-[10px] font-sans mt-1">Groups</span>
        </button>
        <button onClick={() => navigate('/dashboard')} className="flex flex-col items-center justify-center text-subtext hover:text-text transition-colors active:scale-90">
          <UserPlus className="w-6 h-6" />
          <span className="font-medium text-[10px] font-sans mt-1">Friends</span>
        </button>
        <button onClick={() => navigate('/profile')} className="flex flex-col items-center justify-center text-subtext hover:text-text transition-colors active:scale-90">
          <UserCircle className="w-6 h-6" />
          <span className="font-medium text-[10px] font-sans mt-1">Profile</span>
        </button>
      </nav>
    </div>
  );
}
