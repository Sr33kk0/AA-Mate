import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, UserPlus, Users, UtensilsCrossed } from 'lucide-react';
import { useReceiptDetail } from '../lib/useReceiptDetail';
import { formatCents } from '../utils/splitEngine';

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

const PAYMENT_LABEL = {
  pending:           { text: 'PENDING',             color: 'text-[#FF007F]' },
  payment_declared:  { text: 'AWAITING CONFIRM',    color: 'text-yellow-400' },
  confirmed_paid:    { text: 'PAID',                color: 'text-secondary'  },
};

export default function HostReceiptWaitClaim() {
  const navigate = useNavigate();
  const { receiptId } = useParams();
  const { loading, error, data, userId, participantMap } = useReceiptDetail(receiptId);

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
        <button onClick={() => navigate('/dashboard')} className="text-subtext text-sm underline">
          Back to Dashboard
        </button>
      </div>
    );
  }

  const totalCents      = Math.round(data.total_amount   * 100);
  const subtotalCents   = Math.round(data.subtotal       * 100);
  const taxCents        = Math.round(data.tax_amount     * 100);
  const scCents         = Math.round(data.service_charge * 100);

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
          <div className="bg-[#eab308]/10 text-[#eab308] px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase border border-[#eab308]/20">
            WAITING FOR CLAIMS
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
          <button className="w-full bg-[#FF007F] py-4 rounded-full flex items-center justify-center gap-3 active:scale-[0.98] transition-transform">
            <UserPlus className="w-5 h-5 text-text" />
            <span className="text-text font-bold text-lg tracking-tight">Share Tab</span>
          </button>
        </section>

        {/* Items Breakdown */}
        <section className="space-y-4">
          <h2 className="text-subtext text-[10px] font-bold tracking-widest uppercase px-1">Items Breakdown</h2>
          <div className="bg-subground/50 backdrop-blur-md border border-border rounded-2xl p-6 relative overflow-hidden">
            <div className="flex justify-between items-start mb-8 relative z-10">
              <div>
                <h3 className="font-bold text-xl text-text">{data.restaurant_name}</h3>
                <p className="text-subtext text-[10px] mt-1 uppercase tracking-wider font-bold">{formatDate(data.created_at)}</p>
              </div>
            </div>

            <div className="space-y-5 relative z-10">
              {data.receipt_items.map(item => {
                const claimers = item.item_claims.map(c => participantMap[c.user_id]?.firstName ?? '?');
                return (
                  <div key={item.id} className="flex justify-between items-start group">
                    <div className="flex flex-col">
                      <span className="text-text/90 text-sm font-semibold">{item.item_name}</span>
                      {claimers.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1 mt-0.5">
                          <span className="text-[10px] font-bold text-subtext tracking-wider uppercase">Claimed by</span>
                          {claimers.map((name, idx) => {
                            const uid = item.item_claims[idx]?.user_id;
                            const isItemHost = uid === userId;
                            return (
                              <React.Fragment key={idx}>
                                {idx > 0 && <span className="text-[10px] font-extrabold text-subtext tracking-wider">&amp;</span>}
                                <span className={`text-[10px] font-extrabold tracking-wider uppercase ${isItemHost ? 'text-tertiary' : 'text-[#FF007F]'}`}>
                                  {name}
                                </span>
                              </React.Fragment>
                            );
                          })}
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

            <div className="space-y-3 relative z-10 mb-6">
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

            <div className="flex justify-between items-center relative z-10">
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
              const isItemHost = p.userId === userId;
              const status = PAYMENT_LABEL[p.payment_status] ?? PAYMENT_LABEL.pending;
              return (
                <div key={p.userId} className="bg-subground/50 backdrop-blur-md border border-border flex justify-between items-center p-5 rounded-2xl">
                  <div className="flex flex-col">
                    <span className="text-text font-bold text-base">{p.name}{isItemHost ? ' (You)' : ''}</span>
                    <span className={`text-[10px] font-extrabold tracking-widest uppercase ${isItemHost ? 'text-tertiary' : status.color}`}>
                      {isItemHost ? 'HOST' : status.text}
                    </span>
                  </div>
                  <span className="tabular-nums font-extrabold text-xl text-text">RM {formatCents(p.totalCents)}</span>
                </div>
              );
            })}
          </div>
        </section>

      </main>
    </div>
  );
}
