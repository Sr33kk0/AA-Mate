import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, UtensilsCrossed, Users } from 'lucide-react';
import { useReceiptDetail } from '../lib/useReceiptDetail';
import { supabase } from '../lib/supabase';
import { formatCents } from '../utils/splitEngine';

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function ClientReceiptPending() {
  const navigate = useNavigate();
  const { receiptId } = useParams();
  const { loading, error, data, userId, myParticipant, participantMap, refetch } = useReceiptDetail(receiptId);
  const [busy, setBusy] = useState(false);

  async function handleDeclarePayment() {
    if (!myParticipant) return;
    setBusy(true);
    const { error: updateError } = await supabase
      .from('receipt_participants')
      .update({ payment_status: 'payment_declared' })
      .eq('id', myParticipant.id);
    setBusy(false);
    if (updateError) {
      console.error('Declare payment failed:', updateError);
      return;
    }
    await refetch();
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-bg">
        <p className="text-subtext text-sm">Loading…</p>
      </div>
    );
  }

  if (error || !data || !myParticipant) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-bg gap-4 px-6">
        <p className="text-[#FF007F] text-sm text-center">{error ?? 'Receipt not found.'}</p>
        <button onClick={() => navigate('/dashboard')} className="text-subtext text-sm underline">Back to Dashboard</button>
      </div>
    );
  }

  const isDeclared = myParticipant.payment_status === 'payment_declared';
  const myTotalCents = Math.round(myParticipant.proportional_total * 100);
  const subtotalCents = Math.round(data.subtotal * 100);
  const taxCents = Math.round(data.tax_amount * 100);
  const scCents = Math.round(data.service_charge * 100);

  // Items claimed by this user
  const myItems = data.receipt_items
    .map(item => {
      const claim = item.item_claims.find(c => c.user_id === userId);
      if (!claim) return null;
      return {
        ...item,
        myCents: Math.round(item.raw_price * 100 * claim.share_fraction),
        totalClaimers: item.item_claims.length,
      };
    })
    .filter(Boolean);

  // Proportional breakdown
  const myItemSubtotalCents = myItems.reduce((sum, i) => sum + i.myCents, 0);
  const proportion = subtotalCents > 0 ? myItemSubtotalCents / subtotalCents : 0;
  const myTaxCents = Math.round(proportion * taxCents);
  const mySCCents = Math.round(proportion * scCents);

  const hostParticipant = participantMap[data.host_id];
  const hostFirstName = hostParticipant?.firstName ?? 'the host';

  return (
    <div className="flex-1 flex flex-col h-full bg-bg relative isolate text-text font-sans w-full">

      {/* Header */}
      <header className="absolute top-0 inset-x-0 z-50 bg-bg/60 backdrop-blur-xl flex justify-between items-center px-6 h-16 border-b border-border">
        <button
          onClick={() => navigate(-1)}
          className="hover:bg-white/10 transition-colors p-2 -ml-2 rounded-full active:scale-95 duration-150 flex items-center justify-center text-text outline-none"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
      </header>

      <main className="flex-1 mt-16 px-6 overflow-y-auto pb-32 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] z-10 relative">

        {/* Hero */}
        <section className="flex flex-col items-center justify-center text-center pt-12 pb-8">
          <div className="mb-4">
            {isDeclared ? (
              <span
                className="inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase text-yellow-500 bg-yellow-400/10 border border-yellow-400/20"
              >
                Awaiting Confirmation
              </span>
            ) : (
              <span
                className="inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase text-tertiary"
                style={{ backgroundColor: '#e4f5fa', outline: '1px solid #afeffa' }}
              >
                Pending Payment
              </span>
            )}
          </div>
          <h2 className="font-sans font-extrabold text-5xl tracking-tighter tabular-nums text-text mb-3">
            RM {formatCents(myTotalCents)}
          </h2>
          <p className="text-subtext text-sm font-sans max-w-[240px] leading-relaxed">
            {isDeclared
              ? <>Waiting for <span className="text-text font-medium">{hostFirstName}</span> to confirm your payment.</>
              : <>Your share of the bill at <span className="text-text font-medium">{data.restaurant_name}</span>.</>
            }
          </p>
        </section>

        {/* Receipt Card */}
        <div className="bg-subground/50 backdrop-blur-md border border-border rounded-2xl p-6 relative overflow-hidden">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="font-sans font-bold text-xl text-text tracking-tight">{data.restaurant_name}</h3>
              <p className="text-subtext text-[10px] mt-1 uppercase tracking-wider font-bold">{formatDate(data.created_at)}</p>
            </div>
          </div>

          <div className="space-y-5">
            {myItems.map(item => (
              <div key={item.id} className="flex justify-between items-center">
                <span className="text-text/80 text-sm">
                  {item.item_name}{item.totalClaimers > 1 ? ` (1/${item.totalClaimers})` : ''}
                </span>
                <span className="text-text tabular-nums font-semibold tracking-tight">RM {formatCents(item.myCents)}</span>
              </div>
            ))}
          </div>

          <div className="my-6 border-t border-dashed border-border" />

          <div className="space-y-3 mb-6">
            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-subtext">
              <span>Subtotal</span>
              <span className="tabular-nums">RM {formatCents(myItemSubtotalCents)}</span>
            </div>
            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-subtext">
              <span>Service Charge</span>
              <span className="tabular-nums">RM {formatCents(mySCCents)}</span>
            </div>
            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-subtext">
              <span>Tax</span>
              <span className="tabular-nums">RM {formatCents(myTaxCents)}</span>
            </div>
          </div>

          <div className="h-[1px] bg-border mb-6" />

          <div className="flex justify-between items-center">
            <span className="font-sans font-bold text-lg text-text">Your Split</span>
            <span className="font-sans font-black text-2xl tabular-nums text-[#FF007F]">
              RM {formatCents(myTotalCents)}
            </span>
          </div>
        </div>

        {/* Metadata */}
        <div className="mt-6 flex gap-4">
          <div className="flex-1 p-4 bg-subground/50 border border-border rounded-2xl flex flex-col gap-2">
            <span className="text-[10px] uppercase tracking-widest text-subtext font-bold">HOST</span>
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="w-4 h-4 text-secondary" />
              <span className="text-xs font-bold text-text tracking-wide">{hostFirstName}</span>
            </div>
          </div>
          <div className="flex-1 p-4 bg-subground/50 border border-border rounded-2xl flex flex-col gap-2">
            <span className="text-[10px] uppercase tracking-widest text-subtext font-bold">PARTICIPANTS</span>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#FF007F]" />
              <span className="text-xs font-bold text-text tracking-wide">{data.receipt_participants.length}</span>
            </div>
          </div>
        </div>

        {/* Declare Payment Button */}
        {!isDeclared && (
          <button
            onClick={handleDeclarePayment}
            disabled={busy}
            className="mt-6 w-full bg-[#FF007F] py-4 rounded-full flex items-center justify-center font-bold text-lg text-text tracking-tight active:scale-[0.98] transition-all disabled:opacity-60"
          >
            {busy ? 'Processing…' : "I've Paid"}
          </button>
        )}

      </main>
    </div>
  );
}
