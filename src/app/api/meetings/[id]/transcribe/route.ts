import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/supabase/server";
import { analyzeSpeakerDiarization } from "@/lib/ai-service";

// POST /api/meetings/[id]/transcribe - Transcribe a meeting recording
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { user, supabase } = await getServerUser();
    if (!user || !supabase) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch the meeting
    const { data: meeting, error: fetchError } = await supabase
      .from("meetings")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !meeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    if (!meeting.storage_path) {
      return NextResponse.json(
        { error: "No file associated with this meeting" },
        { status: 400 }
      );
    }

    // Check if transcript already exists
    if (meeting.transcript_id) {
      const { data: existingTranscript } = await supabase
        .from("transcripts")
        .select("*")
        .eq("id", meeting.transcript_id)
        .single();

      if (existingTranscript && existingTranscript.status === "completed") {
        return NextResponse.json({
          success: true,
          transcript: existingTranscript,
          cached: true,
        });
      }
    }

    // Create transcript record
    const { data: transcript, error: transcriptError } = await supabase
      .from("transcripts")
      .insert({
        meeting_id: id,
        user_id: user.id,
        status: "processing",
      })
      .select()
      .single();

    if (transcriptError || !transcript) {
      return NextResponse.json(
        { error: "Failed to create transcript record" },
        { status: 500 }
      );
    }

    // Link transcript to meeting
    await supabase
      .from("meetings")
      .update({ transcript_id: transcript.id })
      .eq("id", id);

    // Download file from Supabase Storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("meeting-recordings")
      .download(meeting.storage_path);

    if (downloadError || !fileData) {
      await supabase
        .from("transcripts")
        .update({ status: "failed", error_message: "Failed to download file" })
        .eq("id", transcript.id);
      return NextResponse.json(
        { error: "Failed to download file for transcription" },
        { status: 500 }
      );
    }

    // ─── TRANSCRIPTION: Try free providers first, then OpenAI ───
    const arrayBuffer = await fileData.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    // Determine file extension for MIME type
    const ext = meeting.file_name.split(".").pop()?.toLowerCase() || "mp3";
    const mimeMap: Record<string, string> = {
      mp3: "audio/mpeg",
      mp4: "video/mp4",
      wav: "audio/wav",
      m4a: "audio/x-m4a",
      aac: "audio/aac",
      ogg: "audio/ogg",
      flac: "audio/flac",
    };
    const mimeType = mimeMap[ext] || "audio/mpeg";

    // Try Groq (FREE Whisper-large-v3) first
    const groqApiKey = process.env.GROQ_API_KEY;
    const openaiApiKey = process.env.OPENAI_API_KEY;

    let transcriptionResult: {
      text: string;
      segments: Array<{ start: number; end: number; text: string }>;
      language?: string;
      duration?: number;
    } | null = null;
    let providerName = "";
    const startTime = Date.now();

    if (groqApiKey) {
      try {
        const formData = new FormData();
        const blob = new Blob([fileBuffer], { type: mimeType });
        formData.append("file", blob, meeting.file_name);
        formData.append("model", "whisper-large-v3");
        formData.append("response_format", "verbose_json");
        formData.append("temperature", "0");

        const groqRes = await fetch(
          "https://api.groq.com/openai/v1/audio/transcriptions",
          {
            method: "POST",
            headers: { Authorization: `Bearer ${groqApiKey}` },
            body: formData,
          }
        );

        if (groqRes.ok) {
          const groqResult = await groqRes.json();
          transcriptionResult = {
            text: groqResult.text || "",
            segments: (groqResult.segments || []).map(
              (seg: { start: number; end: number; text: string; seek?: number }) => ({
                start: seg.start,
                end: seg.end,
                text: seg.text.trim(),
              })
            ),
            language: groqResult.language,
            duration: groqResult.duration,
          };
          providerName = "groq (free)";
        }
      } catch (groqError) {
        console.warn("[Transcribe] Groq failed, trying alternatives:", groqError);
      }
    }

    // Fallback to OpenAI Whisper
    if (!transcriptionResult && openaiApiKey) {
      try {
        const formData = new FormData();
        const blob = new Blob([fileBuffer], { type: mimeType });
        formData.append("file", blob, meeting.file_name);
        formData.append("model", "whisper-1");
        formData.append("response_format", "verbose_json");
        formData.append("timestamp_granularities[]", "segment");
        // No language specified — Whisper auto-detects

        const openaiRes = await fetch(
          "https://api.openai.com/v1/audio/transcriptions",
          {
            method: "POST",
            headers: { Authorization: `Bearer ${openaiApiKey}` },
            body: formData,
          }
        );

        if (openaiRes.ok) {
          const openaiResult = await openaiRes.json();
          transcriptionResult = {
            text: openaiResult.text || "",
            segments: (openaiResult.segments || []).map(
              (seg: { start: number; end: number; text: string }) => ({
                start: seg.start,
                end: seg.end,
                text: seg.text.trim(),
              })
            ),
            language: openaiResult.language,
            duration: openaiResult.duration,
          };
          providerName = "openai";
        } else {
          const errorData = await openaiRes.json().catch(() => ({}));
          throw new Error(errorData.error?.message || `Whisper API failed (${openaiRes.status})`);
        }
      } catch (openaiError) {
        if (!transcriptionResult) throw openaiError;
      }
    }

    if (!transcriptionResult) {
      await supabase
        .from("transcripts")
        .update({
          status: "failed",
          error_message: "No transcription service configured. Add GROQ_API_KEY (free) or OPENAI_API_KEY to .env.local",
        })
        .eq("id", transcript.id);
      return NextResponse.json(
        { error: "Transcription service not configured. Add GROQ_API_KEY (free) or OPENAI_API_KEY to .env.local" },
        { status: 500 }
      );
    }

    const processingTime = Math.round((Date.now() - startTime) / 1000);
    const result = transcriptionResult;

    // Process segments — Whisper doesn't do diarization natively
    const rawSegments = (result.segments || []).map(
      (
        seg: { start: number; end: number; text: string }
      ) => ({
        start: seg.start,
        end: seg.end,
        text: seg.text.trim(),
      })
    );

    // ─── SPEAKER DIARIZATION: Use Gemini to identify speaker changes ───
    let segments = rawSegments.map((s) => ({
      ...s,
      speaker: "",
    }));
    let diarizationApplied = false;

    try {
      const diarized = await analyzeSpeakerDiarization(rawSegments);
      if (diarized && diarized.length === rawSegments.length) {
        segments = diarized.map((s) => ({
          start: s.start,
          end: s.end,
          text: s.text,
          speaker: s.speaker || "",
        }));
        diarizationApplied = true;
        console.log(
          `[Transcribe] Speaker diarization applied: ${new Set(segments.map((s) => s.speaker)).size} unique speakers detected`
        );
      }
    } catch (diarizationError) {
      console.warn("[Transcribe] Diarization unavailable, using generic labels:", diarizationError);
    }

    // Build transcript text from segments
    const transcriptText =
      result.text ||
      segments.map((s: { text: string; speaker?: string }) => {
        return diarizationApplied && s.speaker
          ? `[${s.speaker}] ${s.text}`
          : s.text;
      }).join("\n");

    // Calculate word count
    const wordCount = transcriptText
      .split(/\s+/)
      .filter((w: string) => w.length > 0).length;

    // Language detection — Whisper returns ISO 639-1 codes
    const detectedLanguage = result.language || "unknown";
    const languageNames: Record<string, string> = {
      en: "English",
      hi: "Hindi",
      ur: "Urdu",
      bn: "Bengali",
      te: "Telugu",
      ta: "Tamil",
      mr: "Marathi",
      gu: "Gujarati",
      pa: "Punjabi",
      kn: "Kannada",
      ml: "Malayalam",
      or: "Odia",
      as: "Assamese",
      ne: "Nepali",
      sd: "Sindhi",
      ks: "Kashmiri",
      sa: "Sanskrit",
      kok: "Konkani",
      bho: "Bhojpuri",
      mai: "Maithili",
    };

    // Update transcript record
    const { error: updateError } = await supabase
      .from("transcripts")
      .update({
        transcript_text: transcriptText,
        language: detectedLanguage,
        language_name: languageNames[detectedLanguage] || detectedLanguage,
        duration: result.duration || meeting.duration,
        processing_time: processingTime,
        word_count: wordCount,
        detected_languages: result.language ? [result.language] : [],
        segments: segments,
        status: "completed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", transcript.id);

    if (updateError) {
      console.error("Failed to update transcript:", updateError);
      return NextResponse.json(
        { error: "Failed to save transcript" },
        { status: 500 }
      );
    }

    // Update meeting transcript field with segments
    const transcriptEntries = segments.map(
      (s: { start: number; end: number; text: string; speaker?: string }) => ({
        timestamp: `${Math.floor(s.start / 60)}:${String(Math.floor(s.start % 60)).padStart(2, "0")}`,
        text: s.text,
        ...(diarizationApplied && s.speaker ? { speaker: s.speaker } : {}),
      })
    );

    await supabase
      .from("meetings")
      .update({ transcript: transcriptEntries })
      .eq("id", id);

    // Fetch updated transcript
    const { data: updatedTranscript } = await supabase
      .from("transcripts")
      .select("*")
      .eq("id", transcript.id)
      .single();

    return NextResponse.json({
      success: true,
      transcript: updatedTranscript,
      metadata: {
        language: detectedLanguage,
        language_name: languageNames[detectedLanguage] || detectedLanguage,
        duration: result.duration,
        wordCount,
        processingTime,
        segmentCount: segments.length,
      },
    });
  } catch (error) {
    console.error("Transcription error:", error);

    // Try to mark as failed
    try {
      const { id } = await params;
      const { supabase } = await getServerUser();
      if (supabase) {
        await supabase
          .from("transcripts")
          .update({
            status: "failed",
            error_message: "Transcription failed unexpectedly",
          })
          .eq("meeting_id", id);
      }
    } catch {
      // ignore cleanup errors
    }

    return NextResponse.json(
      { error: "Transcription failed. Please try again." },
      { status: 500 }
    );
  }
}

// GET /api/meetings/[id]/transcribe - Get transcript for a meeting
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { user, supabase } = await getServerUser();
    if (!user || !supabase) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch transcript via meeting
    const { data: meeting } = await supabase
      .from("meetings")
      .select("transcript_id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (!meeting?.transcript_id) {
      return NextResponse.json({ transcript: null });
    }

    const { data: transcript } = await supabase
      .from("transcripts")
      .select("*")
      .eq("id", meeting.transcript_id)
      .single();

    return NextResponse.json({ transcript });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
