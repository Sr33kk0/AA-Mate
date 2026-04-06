-- =============================================================
-- FIX: Allow participants to see all other participants of the same receipt.
-- Previously, guests could only see their own participant row (not others),
-- causing incorrect participant counts and missing participant info.
--
-- Uses the existing is_receipt_participant() SECURITY DEFINER function
-- to avoid infinite recursion.
-- =============================================================

DROP POLICY IF EXISTS "Users can view relevant participants" ON receipt_participants;

CREATE POLICY "Users can view relevant participants"
ON receipt_participants FOR SELECT
USING (
    user_id = auth.uid()
    OR public.is_receipt_host(receipt_id, auth.uid())
    OR public.is_receipt_participant(receipt_id, auth.uid())
);
