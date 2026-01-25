-- Add password_remember column to assignments
-- When true, password is remembered in session; when false, always required
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS password_remember BOOLEAN DEFAULT false;

-- Comment for clarity
COMMENT ON COLUMN assignments.password_remember IS 'If true, password unlocks for browser session. If false, password is always required on each visit.';
