import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/supabase/server";
import { callAIJSON, isAIConfigured } from "@/lib/ai-service";

// POST /api/meetings/[id]/diarize — Assign speaker labels to transcript segments
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const { user, supabase } = await getServerUser();
    if (!user || !supabase) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch meeting
    const { data: meeting, error: fetchError } = await supabase
      .from("meetings")
      .select("*, transcript_id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !meeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    // Get transcript with segments
    if (!meeting.transcript_id) {
      return NextResponse.json(
        { error: "No transcript available for diarization" },
        { status: 400 }
      );
    }

    const { data: transcript } = await supabase
      .from("transcripts")
      .select("*")
      .eq("id", meeting.transcript_id)
      .single();

    if (!transcript?.segments || transcript.segments.length === 0) {
      return NextResponse.json(
        { error: "No transcript segments to diarize" },
        { status: 400 }
      );
    }

    const segments = transcript.segments as Array<{
      start: number;
      end: number;
      text: string;
    }>;

    // Update status
    await supabase
      .from("meetings")
      .update({ diarization_status: "processing", processing_status: "diarizing" })
      .eq("id", id);

    await supabase
      .from("transcripts")
      .update({ status: "processing" })
      .eq("id", transcript.id);

    if (!isAIConfigured()) {
      // Fallback: simple turn-based speaker assignment
      const speakerLabels = ["Speaker A", "Speaker B", "Speaker C", "Speaker D"];
      const diarized = segments.map((seg, i) => ({
        ...seg,
        speaker: speakerLabels[i % speakerLabels.length],
      }));
      const speakerSet = new Set(diarized.map((s) => s.speaker));

      await supabase
        .from("transcripts")
        .update({
          diarized_segments: diarized,
          speaker_count: speakerSet.size,
          status: "completed",
        })
        .eq("id", transcript.id);

      await supabase
        .from("meetings")
        .update({ diarization_status: "completed" })
        .eq("id", id);

      return NextResponse.json({
        success: true,
        segments: diarized,
        speakerCount: speakerSet.size,
        method: "turn-based",
      });
    }

    // Use AI to intelligently diarize based on content analysis
    const segmentTexts = segments.map(
      (s, i) => `[${i}] (${s.start.toFixed(1)}s-${s.end.toFixed(1)}s): "${s.text.trim()}"`
    );

    const prompt = `You are a meeting diarization expert. Analyze these transcript segments from a meeting recording and identify distinct speakers based on content, language patterns, conversational flow, and topic shifts.

For each segment, assign a speaker label (e.g., "Alex", "Maya", "Sam" — use descriptive names like "Speaker 1", "Speaker 2" if actual names can't be inferred).

Respond with ONLY a JSON array of objects:
[{ "segmentIndex": 0, "speaker": "Speaker 1" }, { "segmentIndex": 1, "speaker": "Speaker 2" }, ...]

Rules:
- Group consecutive segments by the same speaker when they're clearly the same person
- A new speaker typically starts after a question, a topic shift, or when someone responds
- Look for conversational patterns: "Let me ask...", "I think...", "Great point..." indicate speaker changes
- Assign at most 8 distinct speakers
- Return exactly ${segments.length} entries, one per segment

Segments to analyze:
${segmentTexts.join("\n")}`;

    // Use unified AI service (Gemini free tier or OpenAI)
    const aiResult = await callAIJSON<Array<{ segmentIndex: number; speaker: string }>>(
      "You are a precise diarization AI. You analyze meeting transcripts and identify who said what. Respond with valid JSON only.",
      prompt,
      { temperature: 0.1, maxTokens: 4000 }
    );

    const speakerAssignments = aiResult.data || [];

    // Merge speaker assignments with original segments
    const speakerMap = new Map<number, string>();
    for (const a of speakerAssignments) {
      if (typeof a.segmentIndex === "number" && a.speaker) {
        speakerMap.set(a.segmentIndex, a.speaker);
      }
    }

    const speakerLabels = ["Speaker A", "Speaker B", "Speaker C", "Speaker D"];
    const diarized = segments.map((seg, i) => ({
      ...seg,
      speaker: speakerMap.get(i) || speakerLabels[i % speakerLabels.length],
    }));

    // Count unique speakers
    const speakerSet = new Set(diarized.map((s) => s.speaker));

    // Save to database
    await supabase
      .from("transcripts")
      .update({
        diarized_segments: diarized,
        speaker_count: speakerSet.size,
        status: "completed",
      })
      .eq("id", transcript.id);

    await supabase
      .from("meetings")
      .update({ diarization_status: "completed" })
      .eq("id", id);

    // Build speaker stats
    const speakerStats = Array.from(speakerSet).map((speaker) => {
      const speakerSegments = diarized.filter((s) => s.speaker === speaker);
      const totalTime = speakerSegments.reduce((sum, s) => sum + (s.end - s.start), 0);
      const wordCount = speakerSegments.reduce(
        (sum, s) => sum + s.text.split(/\s+/).filter((w: string) => w.length > 0).length,
        0
      );
      return {
        speaker,
        segmentCount: speakerSegments.length,
        totalTimeSeconds: Math.round(totalTime),
        wordCount,
        speakingPercentage: Math.round((totalTime / (segments[segments.length - 1]?.end || 1)) * 100),
      };
    });

    return NextResponse.json({
      success: true,
      segments: diarized,
      speakerCount: speakerSet.size,
      speakers: speakerStats,
      method: "ai",
    });
  } catch (error) {
    console.error("Diarization error:", error);

    // Mark as failed
    try {
      const { supabase } = await getServerUser();
      if (supabase) {
        await supabase
          .from("meetings")
          .update({ diarization_status: "failed", processing_status: "failed" })
          .eq("id", id);
      }
    } catch {
      // ignore
    }

    return NextResponse.json(
      { error: "Diarization failed. Please try again." },
      { status: 500 }
    );
  }
}
