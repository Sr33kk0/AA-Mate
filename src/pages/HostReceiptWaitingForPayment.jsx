import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, UserPlus, ShieldCheck } from 'lucide-react';
import { useReceiptDetail } from '../lib/useReceiptDetail';
import { supabase } from '../lib/supabase';
import { formatCents } from '../utils/splitEngine';

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function VerificationModal({ name, amountCents, onVerify, onDismiss, busy }) {
  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end justify-center">
      <div className="bg-subground border border-border rounded-3xl p-8 mx-4 mb-6 w-full max-w-sm">
        <div className="w-16 h-16 rounded-full bg-[#FF007F]/15 flex items-center justify-center mx-auto mb-5">
          <ShieldCheck className="w-8 h-8 text-[#FF007F]" />
        </div>
        <h2 className="text-2xl font-extrabold text-text text-center mb-2">Verify Payment</h2>
        <p className="text-subtext text-sm text-center leading-relaxed mb-8">
          <span className="text-text font-semibold">{name}</span> declared they paid{' '}
          <span className="text-text font-semibold">RM {formatCents(amountCents)}</span>. Confirm the transaction?
        </p>
        <div className="space-y-2">
          <button
            onClick={onVerify}
            disabled={busy}
            className="w-full bg-[#FF007F] text-white font-bold text-base py-4 rounded-full active:scale-[0.98] transition-all disabled:opacity-60"
          >
            {busy ? 'Confirming…' : 'Transaction Verified'}
          </button>
          <button
            onClick={onDismiss}
            disabled={busy}
            className="w-full text-subtext font-semibold py-3 text-sm hover:text-text transition-colors"
          >
            Check Later
          </button>
        </div>
      </div>
    </div>
  );
}

export default function HostReceiptWaitingForPayment() {
  const navigate = useNavigate();
  const { receiptId } = useParams();
  const { loading, error, data, userId, participantMap, refetch } = useReceiptDetail(receiptId);
  const [modalUserId, setModalUserId] = useState(null);
  const [busy, setBusy] = useState(false);

  // Auto-open modal for first payment_declared guest
  useEffect(() => {
    if (!data) return;
    const first = data.receipt_participants.find(
      p => p.user_id !== data.host_id && p.payment_status === 'payment_declared'
    );
    if (first) setModalUserId(first.user_id);
  }, [data]);

  // Navigate to settled when all guests are confirmed_paid
  useEffect(() => {
    if (!data) return;
    const guests = data.receipt_participants.filter(p => p.user_id !== data.host_id);
    if (guests.length > 0 && guests.every(p => p.payment_status === 'confirmed_paid')) {
      navigate(`/host-receipt-settled/${receiptId}`, { replace: true });
    }
  }, [data, navigate, receiptId]);

  async function handleVerify() {
    const participant = data.receipt_participants.find(p => p.user_id === modalUserId);
    if (!participant) return;
    setBusy(true);
    const { error: updateError } = await supabase
      .from('receipt_participants')
      .update({ payment_status: 'confirmed_paid' })
      .eq('id', participant.id);
    setBusy(false);
    if (updateError) {
      console.error('Verify failed:', updateError);
      return;
    }
    setModalUserId(null);
    await refetch();
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-bg">
        <p className="text-subtext text-sm">Loading…</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-bg gap-4 px-6">
        <p className="text-[#FF007F] text-sm text-center">{error ?? 'Receipt not found.'}</p>
        <button onClick={() => navigate('/dashboard')} className="text-subtext text-sm underline">Back to Dashboard</button>
      </div>
    );
  }

  const totalCents    = Math.round(data.total_amount   * 100);
  const subtotalCents = Math.round(data.subtotal       * 100);
  const taxCents      = Math.round(data.tax_amount     * 100);
  const scCents       = Math.round(data.service_charge * 100);

  const modalParticipant = modalUserId ? participantMap[modalUserId] : null;

  const PAYMENT_LABEL = {
    pending:           { text: 'PENDING PAYMENT',    color: 'text-[#FF007F]' },
    payment_declared:  { text: 'AWAITING CONFIRM',   color: 'text-yellow-400' },
    confirmed_paid:    { text: 'PAID',               color: 'text-secondary'  },
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-bg relative isolate font-sans text-text w-full overflow-hidden">

      {/* Header */}
      <header className="absolute top-0 w-full z-50 bg-bg/60 backdrop-blur-xl border-b border-border h-16 px-6 flex items-center justify-between">
        <button
          onClick={() => navigate('/dashboard')}
          className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
      </header>

      <main className="flex-1 pt-24 pb-12 px-6 overflow-y-auto space-y-8 z-10 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">

        {/* Status */}
        <section className="flex flex-col items-center text-center space-y-4">
          <div className="bg-[#FF007F]/10 text-[#FF007F] px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase border border-[#FF007F]/20">
            WAITING FOR PAYMENT
          </div>
          <div className="space-y-1">
            <p className="text-subtext text-sm font-medium">Receipt Total</p>
            <h1 className="text-5xl font-extrabold tabular-nums tracking-tighter text-text">
              RM {formatCents(totalCents)}
            </h1>
          </div>
        </section>

        {/* Actions */}
        <section className="space-y-4">
          <button className="w-full bg-[#FF007F] py-4 rounded-full flex items-center justify-center gap-3 active:scale-[0.98] transition-all">
            <UserPlus className="w-5 h-5 text-text" />
            <span className="text-text font-bold text-lg tracking-tight">Share Tab</span>
          </button>
        </section>

        {/* Items Breakdown */}
        <section className="space-y-4">
          <h2 className="text-subtext text-[10px] font-bold tracking-widest uppercase px-1">Items Breakdown</h2>
          <div className="bg-subground/50 backdrop-blur-md border border-border rounded-2xl p-6">
            <div className="mb-8">
              <h3 className="font-bold text-xl text-text">{data.restaurant_name}</h3>
              <p className="text-subtext text-[10px] mt-1 uppercase tracking-wider font-bold">{formatDate(data.created_at)}</p>
            </div>

            <div className="space-y-5">
              {data.receipt_items.map(item => {
                const claimers = item.item_claims.map(c => ({
                  name: participantMap[c.user_id]?.firstName ?? '?',
                  isHost: c.user_id === userId,
                }));
                return (
                  <div key={item.id} className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <span className="text-text/90 text-sm font-semibold">{item.item_name}</span>
                      {claimers.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1 mt-0.5">
                          <span className="text-[10px] font-bold text-subtext tracking-wider uppercase">Claimed by</span>
                          {claimers.map((c, idx) => (
                            <React.Fragment key={idx}>
                              {idx > 0 && <span className="text-[10px] font-extrabold text-subtext">&amp;</span>}
                              <span className={`text-[10px] font-extrabold tracking-wider uppercase ${c.isHost ? 'text-tertiary' : 'text-[#FF007F]'}`}>
                                {c.name}
                              </span>
                            </React.Fragment>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="text-text tabular-nums font-semibold tracking-tight">
                      RM {formatCents(Math.round(item.raw_price * 100))}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="my-6 border-t border-dashed border-border" />

            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-subtext">
                <span>Subtotal</span>
                <span className="tabular-nums">RM {formatCents(subtotalCents)}</span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-subtext">
                <span>Service Charge</span>
                <span className="tabular-nums">RM {formatCents(scCents)}</span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-subtext">
                <span>Tax</span>
                <span className="tabular-nums">RM {formatCents(taxCents)}</span>
              </div>
            </div>

            <div className="h-[1px] bg-border mb-6" />

            <div className="flex justify-between items-center">
              <span className="font-bold text-lg text-text">Total Spent</span>
              <span className="font-black text-2xl tabular-nums text-[#FF007F]">
                RM {formatCents(totalCents)}
              </span>
            </div>
          </div>
        </section>

        {/* Participant Shares */}
        <section className="space-y-4">
          <h2 className="text-subtext text-[10px] font-bold tracking-widest uppercase px-1">Participant Shares</h2>
          <div className="space-y-3">
            {Object.values(participantMap).map(p => {
              const isMe = p.userId === userId;
              const status = PAYMENT_LABEL[p.payment_status] ?? PAYMENT_LABEL.pending;
              const canVerify = !isMe && p.payment_status === 'payment_declared';
              return (
                <div
                  key={p.userId}
                  className="bg-subground/50 backdrop-blur-md border border-border flex justify-between items-center p-5 rounded-2xl"
                >
                  <div className="flex flex-col">
                    <span className="text-text font-bold text-base">{p.name}{isMe ? ' (You)' : ''}</span>
                    <span className={`text-[10px] font-extrabold tracking-widest uppercase mt-0.5 ${isMe ? 'text-tertiary' : status.color}`}>
                      {isMe ? 'HOST' : status.text}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {canVerify && (
                      <button
                        onClick={() => setModalUserId(p.userId)}
                        className="bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full hover:bg-yellow-400/20 transition-colors"
                      >
                        Verify
                      </button>
                    )}
                    <span className="tabular-nums font-extrabold text-xl text-text">RM {formatCents(p.totalCents)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

      </main>

      {modalParticipant && (
        <VerificationModal
          name={modalParticipant.name}
          amountCents={modalParticipant.totalCents}
          onVerify={handleVerify}
          onDismiss={() => setModalUserId(null)}
          busy={busy}
        />
      )}
    </div>
  );
}
