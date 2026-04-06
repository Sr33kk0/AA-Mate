-- AA-Mate Supabase PostgreSQL Schema
-- /harden: Strict Row Level Security Implementation

-- 1. Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    display_name TEXT NOT NULL,
    phone_number TEXT UNIQUE,
    email TEXT UNIQUE,
    avatar_url TEXT,
    is_phone_verified BOOLEAN DEFAULT false,
    is_email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 2. Friends (Join Table)
-- Status: 'pending', 'accepted'
CREATE TABLE friends (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    friend_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (user_id, friend_id),
    CHECK (user_id != friend_id),
    CHECK (status IN ('pending', 'accepted'))
);

-- Enable RLS on friends
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- USERS TABLE POLICIES -------------------

-- 1. Users can read their own profile
CREATE POLICY "Users can view own profile" 
ON users FOR SELECT 
USING (auth.uid() = id);

-- 2. Users can read profiles of accepted friends
-- This explicitly joins the friends table to check if there is an accepted relationship
CREATE POLICY "Users can view accepted friends profiles" 
ON users FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM friends 
        WHERE (
            -- Either I invited them and they accepted
            (friends.user_id = auth.uid() AND friends.friend_id = users.id AND friends.status = 'accepted')
            OR 
            -- Or they invited me and I accepted
            (friends.friend_id = auth.uid() AND friends.user_id = users.id AND friends.status = 'accepted')
        )
    )
);

-- 3. Users can only update their own profile
CREATE POLICY "Users can update own profile" 
ON users FOR UPDATE 
USING (auth.uid() = id);

-- FRIENDS TABLE POLICIES -----------------

-- 1. Users can view friend requests they sent or received
CREATE POLICY "Users can view own friend links" 
ON friends FOR SELECT 
USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- 2. Users can insert friend requests (where they are the sender)
CREATE POLICY "Users can send friend requests" 
ON friends FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 3. Users can update friend requests (e.g., to accept a pending request they received)
CREATE POLICY "Users can update received friend requests" 
ON friends FOR UPDATE 
USING (auth.uid() = friend_id);

-- 4. Users can delete friend links (unfriend or cancel request)
CREATE POLICY "Users can delete own friend links" 
ON friends FOR DELETE 
USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- ==========================================
-- RECEIPT SPLITTING SYSTEM SCHEMA
-- ==========================================

-- 5. Receipts Table
CREATE TABLE receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    host_id UUID REFERENCES users(id) ON DELETE CASCADE,
    restaurant_name TEXT NOT NULL,
    receipt_image_url TEXT,
    subtotal NUMERIC NOT NULL,
    tax_amount NUMERIC NOT NULL DEFAULT 0,
    service_charge NUMERIC NOT NULL DEFAULT 0,
    total_amount NUMERIC NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('active', 'settled')) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;

-- 6. Receipt Items
CREATE TABLE receipt_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receipt_id UUID REFERENCES receipts(id) ON DELETE CASCADE,
    item_name TEXT NOT NULL,
    raw_price NUMERIC NOT NULL
);

ALTER TABLE receipt_items ENABLE ROW LEVEL SECURITY;

-- 7. Receipt Participants
CREATE TABLE receipt_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receipt_id UUID REFERENCES receipts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    proportional_total NUMERIC NOT NULL,
    payment_status TEXT NOT NULL CHECK (payment_status IN ('pending', 'payment_declared', 'confirmed_paid')) DEFAULT 'pending',
    claim_status TEXT NOT NULL CHECK (claim_status IN ('selecting', 'locked')) DEFAULT 'selecting',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(receipt_id, user_id)
);

ALTER TABLE receipt_participants ENABLE ROW LEVEL SECURITY;

-- 8. Item Claims
CREATE TABLE item_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID REFERENCES receipt_items(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    share_fraction NUMERIC NOT NULL CHECK (share_fraction > 0 AND share_fraction <= 1) DEFAULT 1,
    UNIQUE(item_id, user_id)
);

ALTER TABLE item_claims ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- SPLITTING RLS POLICIES
-- ==========================================

-- RECEIPTS
CREATE POLICY "Users can view relevant receipts"
ON receipts FOR SELECT
USING (
    auth.uid() = host_id OR 
    EXISTS (SELECT 1 FROM receipt_participants WHERE receipt_id = receipts.id AND user_id = auth.uid())
);

-- RECEIPT ITEMS
CREATE POLICY "Users can view relevant receipt items"
ON receipt_items FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM receipts 
        WHERE id = receipt_items.receipt_id AND (
            host_id = auth.uid() OR 
            EXISTS (SELECT 1 FROM receipt_participants WHERE receipt_id = receipts.id AND user_id = auth.uid())
        )
    )
);

-- RECEIPT PARTICIPANTS
CREATE POLICY "Users can view relevant participants"
ON receipt_participants FOR SELECT
USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM receipts WHERE id = receipt_participants.receipt_id AND host_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM receipt_participants rp2 WHERE rp2.receipt_id = receipt_participants.receipt_id AND rp2.user_id = auth.uid())
);

-- GUEST UPDATE POLICY (Double Confirmation Step 1)
-- Guests can only transition their own status from 'pending' to 'payment_declared'
CREATE POLICY "Guests can declare payment"
ON receipt_participants FOR UPDATE
USING (user_id = auth.uid() AND payment_status = 'pending')
WITH CHECK (user_id = auth.uid() AND payment_status = 'payment_declared');

-- HOST UPDATE POLICY (Double Confirmation Step 2)
-- Only the host of the receipt can transition a participant to 'confirmed_paid'
CREATE POLICY "Hosts can confirm payment"
ON receipt_participants FOR UPDATE
USING (
    EXISTS (SELECT 1 FROM receipts WHERE id = receipt_participants.receipt_id AND host_id = auth.uid())
    AND payment_status = 'payment_declared'
)
WITH CHECK (
    EXISTS (SELECT 1 FROM receipts WHERE id = receipt_participants.receipt_id AND host_id = auth.uid())
    AND payment_status = 'confirmed_paid'
);

-- ITEM CLAIMS
CREATE POLICY "Users can view relevant item claims"
ON item_claims FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM receipt_items 
        JOIN receipts ON receipt_items.receipt_id = receipts.id
        WHERE receipt_items.id = item_claims.item_id AND (
            receipts.host_id = auth.uid() OR
            EXISTS (SELECT 1 FROM receipt_participants WHERE receipt_id = receipts.id AND user_id = auth.uid())
        )
    )
);

CREATE POLICY "Users can insert own item claims"
ON item_claims FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own item claims"
ON item_claims FOR UPDATE
USING (user_id = auth.uid());
