-- MeetingOS Multilingual AI Support
-- Adds fields needed for language detection, display, and cross-lingual search
-- Run this in Supabase SQL Editor after the base migration

-- ========================================
-- 1. TRANSCRIPTS — language tracking
-- ========================================
ALTER TABLE transcripts
  ADD COLUMN IF NOT EXISTS language_name TEXT DEFAULT 'English',
  ADD COLUMN IF NOT EXISTS detected_languages JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN transcripts.language IS 'Primary detected language (ISO 639-1 code, e.g., hi, ur, bn)';
COMMENT ON COLUMN transcripts.language_name IS 'Human-readable language name (e.g., Hindi, Urdu, Bengali)';
COMMENT ON COLUMN transcripts.detected_languages IS 'Array of ISO codes for all detected languages if code-switching is identified';

-- ========================================
-- 2. MEETINGS — language awareness
-- ========================================
ALTER TABLE meetings
  ADD COLUMN IF NOT EXISTS detected_language TEXT DEFAULT 'en';

COMMENT ON COLUMN meetings.detected_language IS 'Primary language detected during transcription (ISO 639-1)';

-- ========================================
-- 3. MEETING_ANALYSES — language context
-- ========================================
ALTER TABLE meeting_analyses
  ADD COLUMN IF NOT EXISTS detected_language TEXT DEFAULT 'en';

COMMENT ON COLUMN meeting_analyses.detected_language IS 'Language of the source transcript when analysis was performed';

-- ========================================
-- 4. INDEX for language-based queries
-- ========================================
CREATE INDEX IF NOT EXISTS idx_meetings_detected_language ON meetings(detected_language);
CREATE INDEX IF NOT EXISTS idx_transcripts_language ON transcripts(language);
