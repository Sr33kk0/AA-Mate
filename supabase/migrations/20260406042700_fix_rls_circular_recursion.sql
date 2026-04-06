-- =============================================================
-- FIX: Infinite recursion between receipts ↔ receipt_participants RLS policies
--
-- Problem: The receipts SELECT policy checks receipt_participants,
--          and the receipt_participants SELECT policy checks receipts.
--          When PostgREST does a JOIN (select receipts with receipt_participants),
--          PostgreSQL evaluates both policies simultaneously, causing infinite recursion.
--
-- Solution: Create SECURITY DEFINER helper functions that bypass RLS,
--           then rewrite policies to use those functions instead of
--           direct cross-table EXISTS subqueries.
-- =============================================================

-- 1. Helper: Does this user participate in a given receipt?
--    SECURITY DEFINER bypasses RLS so it won't trigger the receipt_participants policy.
CREATE OR REPLACE FUNCTION public.is_receipt_participant(p_receipt_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM receipt_participants
    WHERE receipt_id = p_receipt_id
      AND user_id = p_user_id
  );
$$;

-- 2. Helper: Is this user the host of a given receipt?
CREATE OR REPLACE FUNCTION public.is_receipt_host(p_receipt_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM receipts
    WHERE id = p_receipt_id
      AND host_id = p_user_id
  );
$$;


-- ── Rewrite RECEIPTS SELECT policy ──────────────────────────────
DROP POLICY IF EXISTS "Users can view relevant receipts" ON receipts;

CREATE POLICY "Users can view relevant receipts"
ON receipts FOR SELECT
USING (
    auth.uid() = host_id
    OR public.is_receipt_participant(id, auth.uid())
);


-- ── Rewrite RECEIPT_PARTICIPANTS SELECT policy ──────────────────
DROP POLICY IF EXISTS "Users can view relevant participants" ON receipt_participants;

CREATE POLICY "Users can view relevant participants"
ON receipt_participants FOR SELECT
USING (
    user_id = auth.uid()
    OR public.is_receipt_host(receipt_id, auth.uid())
);


-- ── Rewrite RECEIPT_ITEMS SELECT policy ─────────────────────────
-- This also has a nested check through receipts → receipt_participants
DROP POLICY IF EXISTS "Users can view relevant receipt items" ON receipt_items;

CREATE POLICY "Users can view relevant receipt items"
ON receipt_items FOR SELECT
USING (
    public.is_receipt_host(receipt_id, auth.uid())
    OR public.is_receipt_participant(receipt_id, auth.uid())
);


-- ── Rewrite ITEM_CLAIMS SELECT policy ───────────────────────────
-- This chains: item_claims → receipt_items → receipts → receipt_participants
DROP POLICY IF EXISTS "Users can view relevant item claims" ON item_claims;

CREATE POLICY "Users can view relevant item claims"
ON item_claims FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM receipt_items
        WHERE receipt_items.id = item_claims.item_id
          AND (
            public.is_receipt_host(receipt_items.receipt_id, auth.uid())
            OR public.is_receipt_participant(receipt_items.receipt_id, auth.uid())
          )
    )
);


-- ── Rewrite HOST UPDATE policies to use helper ──────────────────
DROP POLICY IF EXISTS "Hosts can confirm payment" ON receipt_participants;

CREATE POLICY "Hosts can confirm payment"
ON receipt_participants FOR UPDATE
USING (
    public.is_receipt_host(receipt_id, auth.uid())
    AND payment_status = 'payment_declared'
)
WITH CHECK (
    public.is_receipt_host(receipt_id, auth.uid())
    AND payment_status = 'confirmed_paid'
);
