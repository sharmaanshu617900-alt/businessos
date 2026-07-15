// Shared database types matching Supabase schema

export interface Client {
  id: string;
  user_id: string;
  name: string;
  email: string | null;
  company: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Meeting {
  id: string;
  user_id: string;
  client_id: string | null;
  client_name: string;
  title: string;
  date: string;
  file_type: string;
  file_name: string;
  original_file_name: string;
  file_size: number;
  file_url: string | null;
  storage_path: string | null;
  duration: number | null;
  upload_date: string;
  uploaded_by: string | null;
  codec: string | null;
  resolution: string | null;
  processing_status: string | null;
  estimated_processing_time: number | null;
  transcript: TranscriptEntry[];
  transcript_id: string | null;
  analysis_id: string | null;
  summary: string | null;
  action_items: string[];
  key_decisions: string[];
  status: "uploaded" | "processing" | "completed" | "failed";
  created_at: string;
  updated_at: string;
}

export interface TranscriptEntry {
  speaker: string;
  text: string;
}

export interface Transcript {
  id: string;
  meeting_id: string;
  user_id: string;
  transcript_text: string;
  language: string;
  duration: number | null;
  processing_time: number | null;
  word_count: number;
  segments: TranscriptSegment[];
  status: "pending" | "processing" | "completed" | "failed";
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface TranscriptSegment {
  start: number;
  end: number;
  text: string;
  speaker?: string;
}

export type IntegrationProvider =
  | "zoom"
  | "google_meet"
  | "slack"
  | "google_drive";

export interface Integration {
  id: string;
  user_id: string;
  provider: IntegrationProvider;
  connected: boolean;
  access_token: string | null;
  refresh_token: string | null;
  token_expires_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface MeetingAnalysis {
  id: string;
  meeting_id: string;
  user_id: string;
  summary: string | null;
  key_discussion: KeyDiscussion[];
  decisions: AnalysisDecision[];
  action_items: AnalysisActionItem[];
  risks: AnalysisRisk[];
  questions: string[];
  next_steps: string[];
  topics: string[];
  keywords: string[];
  sentiment: SentimentData;
  model_used: string;
  tokens_used: number | null;
  processing_time: number | null;
  status: "pending" | "processing" | "completed" | "failed";
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface KeyDiscussion {
  topic: string;
  summary: string;
}

export interface AnalysisDecision {
  title: string;
  description: string;
  confidence: number; // 0-1
  timestamp?: string;
  owner?: string;
}

export interface AnalysisActionItem {
  task: string;
  owner: string | null;
  priority: "high" | "medium" | "low";
  status: "pending" | "in_progress" | "completed";
  due_date: string | null;
}

export interface AnalysisRisk {
  risk: string;
  severity: "high" | "medium" | "low";
  mitigation?: string;
}

export interface SentimentData {
  overall: string;
  score: number; // -1 to 1
  breakdown?: Record<string, number>;
}

// Form data for creating a meeting (from upload form)
export interface CreateMeetingData {
  title: string;
  client_name: string;
  date: string;
  file_type: string;
  file_name: string;
  original_file_name: string;
  file_size: number;
  storage_path: string;
  transcript: TranscriptEntry[];
  summary: string;
  action_items: string[];
  key_decisions: string[];
}
