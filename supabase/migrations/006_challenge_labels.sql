-- Migration: Add customizable labels system for i18n
-- This allows each challenge to have custom labels (e.g., 'Sprint' -> 'Missie')

-- =============================================================================
-- Challenge Labels Table
-- =============================================================================

CREATE TABLE IF NOT EXISTS challenge_labels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  key text NOT NULL,           -- e.g., 'sprint', 'start', 'complete', 'available'
  value text NOT NULL,         -- e.g., 'Missie', 'Begin', 'Klaar', 'beschikbaar'
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(challenge_id, key)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_challenge_labels_challenge_id ON challenge_labels(challenge_id);

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION update_challenge_labels_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER challenge_labels_updated_at
  BEFORE UPDATE ON challenge_labels
  FOR EACH ROW
  EXECUTE FUNCTION update_challenge_labels_updated_at();

-- =============================================================================
-- Add contact_info and password_instructions to challenges
-- =============================================================================

ALTER TABLE challenges 
  ADD COLUMN IF NOT EXISTS contact_info text,
  ADD COLUMN IF NOT EXISTS password_instructions text;

-- Comment on the new columns
COMMENT ON COLUMN challenges.contact_info IS 'Contact information displayed on the challenge page';
COMMENT ON COLUMN challenges.password_instructions IS 'Instructions for participants about how to get passwords for assignments';

-- =============================================================================
-- Enable RLS on challenge_labels
-- =============================================================================

ALTER TABLE challenge_labels ENABLE ROW LEVEL SECURITY;

-- Allow read access to all (labels are public)
CREATE POLICY "challenge_labels_read_all" ON challenge_labels
  FOR SELECT USING (true);

-- Allow admin operations (in production, restrict to admins)
CREATE POLICY "challenge_labels_admin_all" ON challenge_labels
  FOR ALL USING (true);

-- =============================================================================
-- Insert default labels as a reference (these are the built-in defaults)
-- =============================================================================

COMMENT ON TABLE challenge_labels IS 'Customizable UI labels per challenge for i18n support. Default values are used when no custom label is defined.';
