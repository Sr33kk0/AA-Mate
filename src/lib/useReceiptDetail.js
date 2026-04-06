import { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabase';

const DEV_MOCK_USER_ID = '8357269d-e69b-474e-9610-3a3776c14af1';

export function useReceiptDetail(receiptId) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [userId, setUserId] = useState(null);
  const [tick, setTick] = useState(0);

  const refetch = useCallback(() => setTick(t => t + 1), []);

  useEffect(() => {
    if (!receiptId) return;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const uid = user?.id ?? DEV_MOCK_USER_ID;
        setUserId(uid);

        const { data: receipt, error: fetchError } = await supabase
          .from('receipts')
          .select(`
            id, restaurant_name, host_id, subtotal, tax_amount, service_charge,
            total_amount, status, created_at, receipt_image_url,
            receipt_items (
              id, item_name, raw_price,
              item_claims ( user_id, share_fraction )
            ),
            receipt_participants (
              id, user_id, proportional_total, payment_status, claim_status,
              users ( first_name, last_name )
            )
          `)
          .eq('id', receiptId)
          .single();

        if (fetchError) throw fetchError;
        setData(receipt);
      } catch (err) {
        console.error('Receipt detail fetch failed:', err);
        setError('Could not load receipt. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [receiptId, tick]);

  const isHost = data ? data.host_id === userId : false;

  const myParticipant = data
    ? data.receipt_participants?.find(p => p.user_id === userId) ?? null
    : null;

  // Map userId → display info, built from receipt_participants
  const participantMap = {};
  if (data?.receipt_participants) {
    data.receipt_participants.forEach(p => {
      participantMap[p.user_id] = {
        id: p.id,
        userId: p.user_id,
        name: p.users ? `${p.users.first_name} ${p.users.last_name}` : 'Unknown',
        firstName: p.users?.first_name ?? 'Unknown',
        payment_status: p.payment_status,
        claim_status: p.claim_status,
        totalCents: Math.round(p.proportional_total * 100),
      };
    });
  }

  return { loading, error, data, userId, isHost, myParticipant, participantMap, refetch };
}
