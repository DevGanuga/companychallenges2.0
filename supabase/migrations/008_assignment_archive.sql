-- Add archived_at column to assignments for soft delete/archive functionality
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ DEFAULT NULL;

-- Create index for filtering archived assignments
CREATE INDEX IF NOT EXISTS idx_assignments_archived ON assignments (archived_at);

-- Comment
COMMENT ON COLUMN assignments.archived_at IS 'When set, the assignment is archived (soft deleted). NULL means active.';
