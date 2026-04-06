-- =============================================================
-- AA-Mate Seed Data (applied as migration for remote DB)
-- Logged-in user (for UI testing): Alex Tan
--   UUID: 8357269d-e69b-474e-9610-3a3776c14af1
--
-- Dashboard balance targets for Alex:
--   Owed to You  = RM 22.40  (Alex hosts Mamak Maju; Sarah+Kevin+Priya owe him)
--   You Owe      = RM 21.46  (Alex owes Sarah RM 15.20 + Kevin RM 6.26)
-- =============================================================

-- ── 1. USERS ─────────────────────────────────────────────────
INSERT INTO users (id, first_name, last_name, email, phone_number, is_email_verified) VALUES
  ('8357269d-e69b-474e-9610-3a3776c14af1', 'Alex',  'Tan',  'alex.tan@example.com',   '+60121234567', true),
  ('aa000002-0000-0000-0000-000000000000', 'Sarah', 'Lim',  'sarah.lim@example.com',  '+60129876543', true),
  ('aa000003-0000-0000-0000-000000000000', 'Kevin', 'Wong', 'kevin.wong@example.com', '+60123456789', true),
  ('aa000004-0000-0000-0000-000000000000', 'Priya', 'Nair', 'priya.nair@example.com', '+60127654321', true)
ON CONFLICT (id) DO NOTHING;

-- ── 2. FRIENDS (all accepted) ─────────────────────────────────
INSERT INTO friends (user_id, friend_id, status) VALUES
  ('8357269d-e69b-474e-9610-3a3776c14af1', 'aa000002-0000-0000-0000-000000000000', 'accepted'),
  ('8357269d-e69b-474e-9610-3a3776c14af1', 'aa000003-0000-0000-0000-000000000000', 'accepted'),
  ('8357269d-e69b-474e-9610-3a3776c14af1', 'aa000004-0000-0000-0000-000000000000', 'accepted'),
  ('aa000002-0000-0000-0000-000000000000', 'aa000003-0000-0000-0000-000000000000', 'accepted'),
  ('aa000002-0000-0000-0000-000000000000', 'aa000004-0000-0000-0000-000000000000', 'accepted')
ON CONFLICT DO NOTHING;


-- =============================================================
-- RECEIPT 1: Mamak Maju  (Host: Alex)
-- subtotal 28.00 + tax 1.40 = total 29.40
-- Participants: Alex 7.00 | Sarah 8.40 | Kevin 7.50 | Priya 6.50
-- Sarah+Kevin+Priya = 22.40  →  "Owed to You" ✓
-- =============================================================
INSERT INTO receipts (id, host_id, restaurant_name, subtotal, tax_amount, service_charge, total_amount, status)
VALUES ('bb000001-0000-0000-0000-000000000000',
        '8357269d-e69b-474e-9610-3a3776c14af1',
        'Mamak Maju', 28.00, 1.40, 0.00, 29.40, 'active')
ON CONFLICT (id) DO NOTHING;

INSERT INTO receipt_items (id, receipt_id, item_name, raw_price) VALUES
  ('cc000101-0000-0000-0000-000000000000', 'bb000001-0000-0000-0000-000000000000', 'Nasi Goreng Kampung', 5.00),
  ('cc000102-0000-0000-0000-000000000000', 'bb000001-0000-0000-0000-000000000000', 'Nasi Lemak Ayam',     8.00),
  ('cc000103-0000-0000-0000-000000000000', 'bb000001-0000-0000-0000-000000000000', 'Roti Canai',          2.50),
  ('cc000104-0000-0000-0000-000000000000', 'bb000001-0000-0000-0000-000000000000', 'Char Kway Teow',      5.50),
  ('cc000105-0000-0000-0000-000000000000', 'bb000001-0000-0000-0000-000000000000', 'Teh Tarik',           1.75),
  ('cc000106-0000-0000-0000-000000000000', 'bb000001-0000-0000-0000-000000000000', 'Teh Tarik',           1.75),
  ('cc000107-0000-0000-0000-000000000000', 'bb000001-0000-0000-0000-000000000000', 'Teh Tarik',           1.75),
  ('cc000108-0000-0000-0000-000000000000', 'bb000001-0000-0000-0000-000000000000', 'Teh Tarik',           1.75)
ON CONFLICT (id) DO NOTHING;

INSERT INTO receipt_participants (receipt_id, user_id, proportional_total, payment_status, claim_status) VALUES
  ('bb000001-0000-0000-0000-000000000000', '8357269d-e69b-474e-9610-3a3776c14af1',  7.00, 'confirmed_paid',  'locked'),
  ('bb000001-0000-0000-0000-000000000000', 'aa000002-0000-0000-0000-000000000000',  8.40, 'payment_declared','locked'),
  ('bb000001-0000-0000-0000-000000000000', 'aa000003-0000-0000-0000-000000000000',  7.50, 'pending',         'locked'),
  ('bb000001-0000-0000-0000-000000000000', 'aa000004-0000-0000-0000-000000000000',  6.50, 'pending',         'locked')
ON CONFLICT (receipt_id, user_id) DO NOTHING;

INSERT INTO item_claims (item_id, user_id, share_fraction) VALUES
  ('cc000101-0000-0000-0000-000000000000', '8357269d-e69b-474e-9610-3a3776c14af1', 1),
  ('cc000102-0000-0000-0000-000000000000', 'aa000002-0000-0000-0000-000000000000', 1),
  ('cc000103-0000-0000-0000-000000000000', 'aa000003-0000-0000-0000-000000000000', 1),
  ('cc000104-0000-0000-0000-000000000000', 'aa000004-0000-0000-0000-000000000000', 1),
  ('cc000105-0000-0000-0000-000000000000', '8357269d-e69b-474e-9610-3a3776c14af1', 1),
  ('cc000106-0000-0000-0000-000000000000', 'aa000002-0000-0000-0000-000000000000', 1),
  ('cc000107-0000-0000-0000-000000000000', 'aa000003-0000-0000-0000-000000000000', 1),
  ('cc000108-0000-0000-0000-000000000000', 'aa000004-0000-0000-0000-000000000000', 1)
ON CONFLICT (item_id, user_id) DO NOTHING;


-- =============================================================
-- RECEIPT 2: Sae Ma Eul BBQ  (Host: Sarah)
-- subtotal 54.00 + tax 3.24 + service 2.76 = total 60.00
-- Participants: Sarah 16.20 | Alex 15.20 | Kevin 14.30 | Priya 14.30
-- Alex owes Sarah RM 15.20  →  contributes to "You Owe" ✓
-- =============================================================
INSERT INTO receipts (id, host_id, restaurant_name, subtotal, tax_amount, service_charge, total_amount, status)
VALUES ('bb000002-0000-0000-0000-000000000000',
        'aa000002-0000-0000-0000-000000000000',
        'Sae Ma Eul BBQ', 54.00, 3.24, 2.76, 60.00, 'active')
ON CONFLICT (id) DO NOTHING;

INSERT INTO receipt_items (id, receipt_id, item_name, raw_price) VALUES
  ('cc000201-0000-0000-0000-000000000000', 'bb000002-0000-0000-0000-000000000000', 'Galbi (Beef Short Ribs) 500g', 32.00),
  ('cc000202-0000-0000-0000-000000000000', 'bb000002-0000-0000-0000-000000000000', 'Samgyeopsal 200g',            14.00),
  ('cc000203-0000-0000-0000-000000000000', 'bb000002-0000-0000-0000-000000000000', 'Kimchi Jjigae',                8.00)
ON CONFLICT (id) DO NOTHING;

INSERT INTO receipt_participants (receipt_id, user_id, proportional_total, payment_status, claim_status) VALUES
  ('bb000002-0000-0000-0000-000000000000', 'aa000002-0000-0000-0000-000000000000', 16.20, 'confirmed_paid',  'locked'),
  ('bb000002-0000-0000-0000-000000000000', '8357269d-e69b-474e-9610-3a3776c14af1', 15.20, 'pending',         'locked'),
  ('bb000002-0000-0000-0000-000000000000', 'aa000003-0000-0000-0000-000000000000', 14.30, 'confirmed_paid',  'locked'),
  ('bb000002-0000-0000-0000-000000000000', 'aa000004-0000-0000-0000-000000000000', 14.30, 'payment_declared','locked')
ON CONFLICT (receipt_id, user_id) DO NOTHING;

INSERT INTO item_claims (item_id, user_id, share_fraction) VALUES
  ('cc000201-0000-0000-0000-000000000000', '8357269d-e69b-474e-9610-3a3776c14af1', 0.5),
  ('cc000201-0000-0000-0000-000000000000', 'aa000002-0000-0000-0000-000000000000', 0.5),
  ('cc000202-0000-0000-0000-000000000000', 'aa000003-0000-0000-0000-000000000000', 0.5),
  ('cc000202-0000-0000-0000-000000000000', 'aa000004-0000-0000-0000-000000000000', 0.5),
  ('cc000203-0000-0000-0000-000000000000', '8357269d-e69b-474e-9610-3a3776c14af1', 0.25),
  ('cc000203-0000-0000-0000-000000000000', 'aa000002-0000-0000-0000-000000000000', 0.25),
  ('cc000203-0000-0000-0000-000000000000', 'aa000003-0000-0000-0000-000000000000', 0.25),
  ('cc000203-0000-0000-0000-000000000000', 'aa000004-0000-0000-0000-000000000000', 0.25)
ON CONFLICT (item_id, user_id) DO NOTHING;


-- =============================================================
-- RECEIPT 3: The Coffee Academics  (Host: Kevin)
-- subtotal 22.40 + tax 1.34 + service 1.26 = total 25.00
-- Participants: Kevin 6.25 | Alex 6.26 | Sarah 6.25 | Priya 6.24
-- Alex owes Kevin RM 6.26  →  contributes to "You Owe" ✓
-- Alex total You Owe: 15.20 + 6.26 = 21.46 ✓
-- =============================================================
INSERT INTO receipts (id, host_id, restaurant_name, subtotal, tax_amount, service_charge, total_amount, status)
VALUES ('bb000003-0000-0000-0000-000000000000',
        'aa000003-0000-0000-0000-000000000000',
        'The Coffee Academics', 22.40, 1.34, 1.26, 25.00, 'active')
ON CONFLICT (id) DO NOTHING;

INSERT INTO receipt_items (id, receipt_id, item_name, raw_price) VALUES
  ('cc000301-0000-0000-0000-000000000000', 'bb000003-0000-0000-0000-000000000000', 'Flat White',    5.50),
  ('cc000302-0000-0000-0000-000000000000', 'bb000003-0000-0000-0000-000000000000', 'Latte',         5.50),
  ('cc000303-0000-0000-0000-000000000000', 'bb000003-0000-0000-0000-000000000000', 'Matcha Latte',  5.70),
  ('cc000304-0000-0000-0000-000000000000', 'bb000003-0000-0000-0000-000000000000', 'Avocado Toast', 5.70)
ON CONFLICT (id) DO NOTHING;

INSERT INTO receipt_participants (receipt_id, user_id, proportional_total, payment_status, claim_status) VALUES
  ('bb000003-0000-0000-0000-000000000000', 'aa000003-0000-0000-0000-000000000000', 6.25, 'confirmed_paid',  'locked'),
  ('bb000003-0000-0000-0000-000000000000', '8357269d-e69b-474e-9610-3a3776c14af1', 6.26, 'pending',         'locked'),
  ('bb000003-0000-0000-0000-000000000000', 'aa000002-0000-0000-0000-000000000000', 6.25, 'confirmed_paid',  'locked'),
  ('bb000003-0000-0000-0000-000000000000', 'aa000004-0000-0000-0000-000000000000', 6.24, 'payment_declared','locked')
ON CONFLICT (receipt_id, user_id) DO NOTHING;

INSERT INTO item_claims (item_id, user_id, share_fraction) VALUES
  ('cc000301-0000-0000-0000-000000000000', '8357269d-e69b-474e-9610-3a3776c14af1', 1),
  ('cc000302-0000-0000-0000-000000000000', 'aa000002-0000-0000-0000-000000000000', 1),
  ('cc000303-0000-0000-0000-000000000000', 'aa000003-0000-0000-0000-000000000000', 1),
  ('cc000304-0000-0000-0000-000000000000', 'aa000004-0000-0000-0000-000000000000', 1)
ON CONFLICT (item_id, user_id) DO NOTHING;
