import React, { createContext, useContext, useState, useMemo } from 'react';
import { calculateReceiptBreakdown, defaultMockPayload } from '../utils/splitEngine';

const ReceiptContext = createContext(null);

export function ReceiptProvider({ children }) {
  const [participants, setParticipants] = useState(() => {
    const initial = JSON.parse(JSON.stringify(defaultMockPayload.participants));
    // Pre-set Sarah as VERIFICATION NEEDED to demonstrate the flow
    initial['user_sarah'].status = 'VERIFICATION NEEDED';
    return initial;
  });

  const receipt = useMemo(() => {
    const payload = { ...defaultMockPayload, participants };
    return calculateReceiptBreakdown(payload);
  }, [participants]);

  const receiptStatus = useMemo(() => {
    const guests = Object.values(participants).filter(p => p.role === 'guest');
    if (guests.every(p => p.status === 'SETTLED')) return 'settled';
    if (guests.some(p => p.status === 'VERIFICATION NEEDED')) return 'verification_needed';
    return 'waiting_for_payment';
  }, [participants]);

  function verifyGuest(uid) {
    setParticipants(prev => ({
      ...prev,
      [uid]: { ...prev[uid], status: 'SETTLED' }
    }));
  }

  function rejectGuest(uid) {
    setParticipants(prev => ({
      ...prev,
      [uid]: { ...prev[uid], status: 'PENDING PAYMENT' }
    }));
  }

  return (
    <ReceiptContext.Provider value={{ participants, receipt, receiptStatus, verifyGuest, rejectGuest }}>
      {children}
    </ReceiptContext.Provider>
  );
}

export function useReceipt() {
  return useContext(ReceiptContext);
}
