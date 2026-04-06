// src/utils/splitEngine.js

/**
 * Perform all receipt split mathematical calculations strictly in cents to avoid JS floating-point issues.
 * @param {Object} payload The OCR receipt payload
 * @returns {Object} A structured calculation result, with everything perfectly balanced.
 */
export function calculateReceiptBreakdown(payload) {
  const { hostId, items, taxes, participants, receiptTotalAmount } = payload;
  const { taxAmount, serviceChargeAmount } = taxes;

  let computedSubtotal = 0;
  
  // 1. Calculate each item's split and subtotal
  const processedItems = items.map(item => {
    computedSubtotal += item.price;
    const splitCount = item.claimedBy.length;
    const splitPriceCents = splitCount > 0 ? Math.floor(item.price / splitCount) : 0;
    
    return {
      ...item,
      splitPriceCents
    };
  });

  // If OCR gave us a total, we use it as truth. But if not, we default to computing it.
  const totalBill = receiptTotalAmount != null ? receiptTotalAmount : (computedSubtotal + taxAmount + serviceChargeAmount);

  // 2. Initialize participant accumulators
  const participantShares = {};
  Object.keys(participants).forEach(uid => {
    participantShares[uid] = {
      ...participants[uid],
      id: uid,
      itemTotal: 0,
      serviceChargeTotal: 0,
      taxTotalLine: 0,
      taxTotal: 0,
      finalShare: 0
    };
  });

  // 3. Accumulate base item totals
  processedItems.forEach(item => {
    if (item.claimedBy.length > 0) {
      item.claimedBy.forEach(uid => {
        if (participantShares[uid]) {
          participantShares[uid].itemTotal += item.splitPriceCents;
        }
      });
    }
  });

  // 4. Distribute proportional taxes and calculate total client contributions
  let totalClientContributions = 0;

  Object.values(participantShares).forEach(user => {
    if (computedSubtotal > 0 && user.itemTotal > 0) {
      const proportion = user.itemTotal / computedSubtotal;
      const userSC = Math.floor(proportion * serviceChargeAmount);
      const userTax = Math.floor(proportion * taxAmount);
      user.serviceChargeTotal = userSC;
      user.taxTotalLine = userTax;
      user.taxTotal = userSC + userTax;
    }
    
    if (user.id !== hostId) {
      user.finalShare = user.itemTotal + user.taxTotal;
      totalClientContributions += user.finalShare;
    }
  });

  // 5. Host absorbs everything left over (all rounding errors and potential receipt total mismatches)
  if (participantShares[hostId]) {
    participantShares[hostId].serviceChargeTotal = serviceChargeAmount - Object.values(participantShares).reduce((acc, p) => p.id !== hostId ? acc + p.serviceChargeTotal : acc, 0);
    participantShares[hostId].taxTotalLine = taxAmount - Object.values(participantShares).reduce((acc, p) => p.id !== hostId ? acc + p.taxTotalLine : acc, 0);
    participantShares[hostId].finalShare = totalBill - totalClientContributions;
  }

  return {
    subtotal: computedSubtotal,
    taxAmount,
    serviceChargeAmount,
    totalBill,
    items: processedItems,
    participantShares
  };
}

// Utility to format cents to standard RM display string safely
export function formatCents(cents) {
  return (cents / 100).toFixed(2);
}

// Global default mock state. Easily adaptable.
export const defaultMockPayload = {
  restaurantName: "Murni Discovery",
  date: "Oct 24, 2023 • 08:42 PM",
  category: "Dining & Social",
  splitMode: "Item Claim",
  hostId: "user_alex",
  receiptTotalAmount: 12880, // Total from OCR is RM 128.80
  taxes: {
    serviceChargeAmount: 1100, // 11.00
    taxAmount: 660             // 6.60
  },
  items: [
    { id: 1, name: "Signature Wagyu Burger", price: 6800, claimedBy: ["user_alex", "user_sarah"] },
    { id: 2, name: "Neon Gin & Tonic", price: 3800, claimedBy: ["user_sarah"] },
    { id: 3, name: "Truffle Fries", price: 2280, claimedBy: ["user_alex", "user_marcus"] }
  ],
  participants: {
    "user_alex": { name: "Alex (You)", role: "host", status: "HOST" },
    "user_sarah": { name: "Sarah Chen", role: "guest", status: "PENDING PAYMENT" },
    "user_marcus": { name: "Marcus Holloway", role: "guest", status: "PENDING PAYMENT" }
  }
};
