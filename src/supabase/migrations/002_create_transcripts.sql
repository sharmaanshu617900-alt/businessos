-- ============================================
-- Feature 3: Meeting Transcription Engine
-- ============================================

-- ─── TRANSCRIPTS TABLE ───
CREATE TABLE IF NOT EXISTS transcripts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transcript_text TEXT NOT NULL DEFAULT '',
  language TEXT DEFAULT 'en',
  duration DOUBLE PRECISION,
  processing_time INTEGER, -- seconds
  word_count INTEGER DEFAULT 0,
  segments JSONB DEFAULT '[]'::jsonb, -- timestamped segments
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_transcripts_meeting_id ON transcripts(meeting_id);
CREATE INDEX IF NOT EXISTS idx_transcripts_user_id ON transcripts(user_id);

-- Add transcript_id to meetings table for quick lookup
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS transcript_id UUID REFERENCES transcripts(id) ON DELETE SET NULL;

-- ─── ROW LEVEL SECURITY ───
ALTER TABLE transcripts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transcripts"
  ON transcripts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transcripts"
  ON transcripts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transcripts"
  ON transcripts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transcripts"
  ON transcripts FOR DELETE
  USING (auth.uid() = user_id);

-- ─── UPDATE processing_status CHECK CONSTRAINT ───
-- Drop old constraint and add new one with transcription states
ALTER TABLE meetings DROP CONSTRAINT IF EXISTS meetings_processing_status_check;
ALTER TABLE meetings ADD CONSTRAINT meetings_processing_status_check
  CHECK (processing_status IN ('pending', 'reading', 'detecting', 'preparing', 'metadata_ready', 'transcribing', 'transcribed', 'ready', 'failed'));

