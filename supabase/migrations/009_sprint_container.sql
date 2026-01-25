-- Add new columns to sprints table for sprint-as-container functionality
-- Sprints now behave like assignments with nested content

-- Basic fields
ALTER TABLE sprints ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE sprints ADD COLUMN IF NOT EXISTS subtitle TEXT;
ALTER TABLE sprints ADD COLUMN IF NOT EXISTS description_html TEXT;
ALTER TABLE sprints ADD COLUMN IF NOT EXISTS cover_image_url TEXT;
ALTER TABLE sprints ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Create unique index on slug (but allow nulls for backward compatibility)
CREATE UNIQUE INDEX IF NOT EXISTS idx_sprints_slug ON sprints (slug) WHERE slug IS NOT NULL;

-- Comments
COMMENT ON COLUMN sprints.slug IS 'URL-friendly identifier for sprint page';
COMMENT ON COLUMN sprints.subtitle IS 'Short teaser text shown on sprint card';
COMMENT ON COLUMN sprints.description_html IS 'Rich HTML description shown on sprint detail page';
COMMENT ON COLUMN sprints.cover_image_url IS 'Cover image shown on sprint card';
COMMENT ON COLUMN sprints.password_hash IS 'Optional password protection for sprint';

-- Add position column if not exists (for sorting sprints)
ALTER TABLE sprints ADD COLUMN IF NOT EXISTS position INTEGER DEFAULT 0;
