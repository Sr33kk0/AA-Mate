-- The original policy had a self-referential EXISTS subquery on receipt_participants,
-- which causes infinite recursion when PostgREST evaluates it during a join.
-- Replaced with two non-recursive conditions:
--   1. A user can always see their own participant row.
--   2. A host can see all participant rows for receipts they own.

DROP POLICY IF EXISTS "Users can view relevant participants" ON receipt_participants;

CREATE POLICY "Users can view relevant participants"
ON receipt_participants FOR SELECT
USING (
    user_id = auth.uid()
    OR
    EXISTS (
        SELECT 1 FROM receipts
        WHERE receipts.id = receipt_participants.receipt_id
        AND receipts.host_id = auth.uid()
    )
);
