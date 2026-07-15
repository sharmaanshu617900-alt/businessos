-- MeetingOS AI Pipeline + Notifications Migration
-- Run in Supabase SQL Editor

-- ========================================
-- 1. NOTIFICATIONS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'transcript_ready',
    'analysis_complete',
    'diarization_complete',
    'translation_complete',
    'processing_failed',
    'meeting_shared',
    'task_assigned',
    'weekly_report'
  )),
  title TEXT NOT NULL,
  body TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notifications"
  ON notifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON notifications(user_id, read, created_at DESC);

-- ========================================
-- 2. ADD DIARIZATION FIELDS TO MEETINGS
-- ========================================
ALTER TABLE meetings
  ADD COLUMN IF NOT EXISTS diarization_status TEXT
    DEFAULT 'pending'
    CHECK (diarization_status IN ('pending', 'processing', 'completed', 'failed')),
  ADD COLUMN IF NOT EXISTS translation_status TEXT
    DEFAULT 'pending'
    CHECK (translation_status IN ('pending', 'processing', 'completed', 'failed')),
  ADD COLUMN IF NOT EXISTS detected_language TEXT,
  ADD COLUMN IF NOT EXISTS original_file_name TEXT,
  ADD COLUMN IF NOT EXISTS upload_date TIMESTAMPTZ DEFAULT now();

-- ========================================
-- 3. ADD LANGUAGE TO MEETING_ANALYSES
-- ========================================
ALTER TABLE meeting_analyses
  ADD COLUMN IF NOT EXISTS detected_language TEXT;

-- ========================================
-- 4. ADD DIARIZED SEGMENTS TO TRANSCRIPTS
-- ========================================
ALTER TABLE transcripts
  ADD COLUMN IF NOT EXISTS diarized_segments JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS translated_text TEXT,
  ADD COLUMN IF NOT EXISTS translation_language TEXT,
  ADD COLUMN IF NOT EXISTS speaker_count INTEGER DEFAULT 0;

-- ========================================
-- 5. PROCESSING QUEUE TABLE (for background jobs)
-- ========================================
CREATE TABLE IF NOT EXISTS processing_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  step TEXT NOT NULL CHECK (step IN (
    'metadata', 'transcribe', 'diarize', 'analyze', 'translate', 'index'
  )),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  priority INTEGER DEFAULT 0,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  error_message TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE processing_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own queue"
  ON processing_queue FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own queue"
  ON processing_queue FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own queue"
  ON processing_queue FOR UPDATE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_queue_status
  ON processing_queue(status, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_queue_meeting
  ON processing_queue(meeting_id, step);

-- ========================================
-- 6. FUNCTION: Auto-create notification on processing events
-- ========================================
CREATE OR REPLACE FUNCTION notify_processing_complete()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status = 'processing' THEN
    INSERT INTO notifications (user_id, type, title, body, metadata)
    VALUES (
      NEW.user_id,
      CASE
        WHEN NEW.step = 'transcribe' THEN 'transcript_ready'
        WHEN NEW.step = 'analyze' THEN 'analysis_complete'
        WHEN NEW.step = 'diarize' THEN 'diarization_complete'
        WHEN NEW.step = 'translate' THEN 'translation_complete'
        ELSE 'processing_failed'
      END,
      CASE
        WHEN NEW.step = 'transcribe' THEN 'Transcript Ready'
        WHEN NEW.step = 'analyze' THEN 'Analysis Complete'
        WHEN NEW.step = 'diarize' THEN 'Speakers Identified'
        WHEN NEW.step = 'translate' THEN 'Translation Complete'
        ELSE 'Processing Done'
      END,
      CASE
        WHEN NEW.step = 'transcribe' THEN 'Your meeting transcript has been generated successfully.'
        WHEN NEW.step = 'analyze' THEN 'AI analysis with decisions and action items is ready.'
        WHEN NEW.step = 'diarize' THEN 'Speaker diarization has been completed.'
        WHEN NEW.step = 'translate' THEN 'Translation to the selected language is ready.'
        ELSE 'Processing step completed.'
      END,
      jsonb_build_object('meeting_id', NEW.meeting_id, 'step', NEW.step)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_processing_complete
  AFTER UPDATE ON processing_queue
  FOR EACH ROW
  WHEN (NEW.status = 'completed' AND OLD.status = 'processing')
  EXECUTE FUNCTION notify_processing_complete();
