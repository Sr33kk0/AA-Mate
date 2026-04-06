ALTER TABLE users
  RENAME COLUMN display_name TO first_name;

ALTER TABLE users
  ADD COLUMN last_name TEXT NOT NULL DEFAULT '';

ALTER TABLE users
  ALTER COLUMN last_name DROP DEFAULT;
