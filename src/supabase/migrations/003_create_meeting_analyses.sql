-- ============================================
-- Feature 4: AI Meeting Analysis
-- ============================================

-- ─── MEETING ANALYSES TABLE ───
CREATE TABLE IF NOT EXISTS meeting_analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Core outputs
  summary TEXT,
  key_discussion JSONB DEFAULT '[]'::jsonb,
  decisions JSONB DEFAULT '[]'::jsonb,
  action_items JSONB DEFAULT '[]'::jsonb,
  risks JSONB DEFAULT '[]'::jsonb,
  questions JSONB DEFAULT '[]'::jsonb,
  next_steps JSONB DEFAULT '[]'::jsonb,
  topics JSONB DEFAULT '[]'::jsonb,
  keywords JSONB DEFAULT '[]'::jsonb,
  sentiment JSONB DEFAULT '{}'::jsonb,
  
  -- Metadata
  model_used TEXT DEFAULT 'gpt-4o-mini',
  tokens_used INTEGER,
  processing_time INTEGER, -- seconds
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_meeting_analyses_meeting_id ON meeting_analyses(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_analyses_user_id ON meeting_analyses(user_id);

-- Add analysis_id to meetings table for quick lookup
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS analysis_id UUID REFERENCES meeting_analyses(id) ON DELETE SET NULL;

-- ─── ROW LEVEL SECURITY ───
ALTER TABLE meeting_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own analyses"
  ON meeting_analyses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analyses"
  ON meeting_analyses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own analyses"
  ON meeting_analyses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own analyses"
  ON meeting_analyses FOR DELETE
  USING (auth.uid() = user_id);

-- ─── UPDATE processing_status CHECK CONSTRAINT ───
ALTER TABLE meetings DROP CONSTRAINT IF EXISTS meetings_processing_status_check;
ALTER TABLE meetings ADD CONSTRAINT meetings_processing_status_check
  CHECK (processing_status IN (
    'pending', 'reading', 'detecting', 'preparing', 'metadata_ready',
    'transcribing', 'transcribed', 'analyzing', 'analyzed',
    'ready', 'failed'
  ));
