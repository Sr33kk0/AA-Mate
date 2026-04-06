-- Allow a newly authenticated user to insert their own profile row.
-- auth.uid() = id ensures they can only create a row for themselves.
CREATE POLICY "Users can insert own profile"
ON users FOR INSERT
WITH CHECK (auth.uid() = id);
