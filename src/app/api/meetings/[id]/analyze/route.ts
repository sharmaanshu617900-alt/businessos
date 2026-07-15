import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/supabase/server";
import { callAIJSON, isAIConfigured } from "@/lib/ai-service";

const LANGUAGE_MAP: Record<string, string> = {
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

function buildAnalysisPrompt(transcript: string, detectedLanguage: string, languageName: string): string {
  const isIndianLanguage = detectedLanguage !== "en" && detectedLanguage !== "unknown";

  return `You are an expert multilingual meeting analyst. You fluently understand ALL Indian languages and code-switched conversations.

## Language Context
- Detected primary language: ${languageName} (ISO code: ${detectedLanguage})
- ${isIndianLanguage
    ? `This meeting is primarily in ${languageName}. The transcript may also contain code-switching (mixing ${languageName} with English or other Indian languages). Important: Analyze the content in its original language.`
    : "This meeting is in English. However, it may contain terms or phrases from Indian languages."
  }

## Instructions
- Analyze the transcript in its ORIGINAL language
- Extract information accurately regardless of language
- If the meeting mixes languages (code-switching), handle each utterance in its original language
- Never try to transliterate or translate the content for analysis — understand it in the original form
- Output the summary and extracted fields in English (for universal readability), but keep extracted action items and decisions in their original language when specific phrases were used

## Transcript
${transcript}

Provide a JSON response with the following structure (no markdown, pure JSON):
{
  "summary": "Executive summary in 2-3 paragraphs (in English for universal readability)",
  "key_discussion": [
    {"topic": "Topic name", "summary": "Brief summary of what was discussed"}
  ],
  "decisions": [
    {"title": "Decision title (keep original language if specific phrasing was used)", "description": "What was decided", "confidence": 0.85}
  ],
  "action_items": [
    {"task": "What needs to be done (keep original language)", "owner": "Who is responsible or null", "priority": "high|medium|low", "due_date": "date if mentioned or null"}
  ],
  "risks": [
    {"risk": "Risk or blocker mentioned", "severity": "high|medium|low", "mitigation": "Suggested mitigation if any"}
  ],
  "questions": ["Unanswered questions raised during the meeting (keep original language)"],
  "next_steps": ["Follow-up actions agreed upon"],
  "topics": ["Topic tags for categorization"],
  "keywords": ["Important searchable keywords (multilingual OK)"],
  "sentiment": {"overall": "positive|neutral|negative", "score": 0.7}
}

Rules:
- Extract real information from the transcript only
- If a field cannot be determined, use empty array or null
- Confidence scores should be 0.0 to 1.0
- Priority must be high, medium, or low
- Sentiment score: -1.0 (very negative) to 1.0 (very positive)
- Keep summaries concise and actionable`;
}

// POST /api/meetings/[id]/analyze - Run AI analysis on transcript
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

    // Check if analysis already exists
    if (meeting.analysis_id) {
      const { data: existingAnalysis } = await supabase
        .from("meeting_analyses")
        .select("*")
        .eq("id", meeting.analysis_id)
        .single();

      if (existingAnalysis && existingAnalysis.status === "completed") {
        return NextResponse.json({
          success: true,
          analysis: existingAnalysis,
          cached: true,
        });
      }
    }

    // Get transcript text and language
    let transcriptText = "";
    let detectedLanguage = "en";
    let languageName = "English";

    // Try to get from transcript record first
    if (meeting.transcript_id) {
      const { data: transcript } = await supabase
        .from("transcripts")
        .select("transcript_text, language, language_name")
        .eq("id", meeting.transcript_id)
        .single();

      if (transcript?.transcript_text) {
        transcriptText = transcript.transcript_text;
        detectedLanguage = transcript.language || "en";
        languageName = transcript.language_name || LANGUAGE_MAP[detectedLanguage] || detectedLanguage;
      }
    }

    // Fallback to meeting.transcript JSONB field
    if (!transcriptText && meeting.transcript?.length > 0) {
      transcriptText = meeting.transcript
        .map((t: { text: string }) => t.text)
        .join("\n");
    }

    if (!transcriptText) {
      return NextResponse.json(
        { error: "No transcript available for analysis" },
        { status: 400 }
      );
    }

    // Create or update analysis record
    let analysisId = meeting.analysis_id;

    if (!analysisId) {
      const { data: newAnalysis, error: createError } = await supabase
        .from("meeting_analyses")
        .insert({
          meeting_id: id,
          user_id: user.id,
          status: "processing",
          detected_language: detectedLanguage,
        })
        .select()
        .single();

      if (createError || !newAnalysis) {
        return NextResponse.json(
          { error: "Failed to create analysis record" },
          { status: 500 }
        );
      }

      analysisId = newAnalysis.id;

      // Link analysis to meeting
      await supabase
        .from("meetings")
        .update({ analysis_id: analysisId })
        .eq("id", id);
    } else {
      // Reset existing analysis for retry
      await supabase
        .from("meeting_analyses")
        .update({ status: "processing", error_message: null })
        .eq("id", analysisId);
    }

    // Update processing status
    await supabase
      .from("meetings")
      .update({ processing_status: "analyzing" })
      .eq("id", id);

    // Check if any AI provider is available
    if (!isAIConfigured()) {
      await supabase
        .from("meeting_analyses")
        .update({
          status: "failed",
          error_message: "No AI provider configured",
        })
        .eq("id", analysisId);

      await supabase
        .from("meetings")
        .update({ processing_status: "failed" })
        .eq("id", id);

      return NextResponse.json(
        { error: "AI service not configured. Add GOOGLE_GEMINI_API_KEY (free) or OPENAI_API_KEY to .env.local" },
        { status: 500 }
      );
    }

    // Truncate transcript if too long (keep first ~8000 words for context window)
    const words = transcriptText.split(/\s+/);
    if (words.length > 8000) {
      transcriptText = words.slice(0, 8000).join(" ") + "\n\n[Transcript truncated for analysis]";
    }

    // Build language-aware prompt
    const analysisPrompt = buildAnalysisPrompt(transcriptText, detectedLanguage, languageName);

    // Call AI via unified service
    const startTime = Date.now();
    const sysPrompt = `You are an expert multilingual meeting analyst who understands all Indian languages. Current meeting language: ${languageName} (${detectedLanguage}). Always respond with valid JSON only, no markdown formatting.`;

    const aiResult = await callAIJSON<{
      summary: string;
      key_discussion: Array<{ topic: string; summary: string }>;
      decisions: Array<{ title: string; description: string; confidence: number }>;
      action_items: Array<{ task: string; owner: string | null; priority: string; status: string; due_date: string | null }>;
      risks: Array<{ risk: string; severity: string; mitigation: string }>;
      questions: string[];
      next_steps: string[];
      topics: string[];
      keywords: string[];
      sentiment: { overall: string; score: number };
    }>(sysPrompt, analysisPrompt, { temperature: 0.3, maxTokens: 4000 });

    const processingTime = Math.round((Date.now() - startTime) / 1000);

    if (!aiResult.data || aiResult.error) {
      const errorMessage = aiResult.error || "No analysis generated";

      await supabase
        .from("meeting_analyses")
        .update({ status: "failed", error_message: errorMessage })
        .eq("id", analysisId);

      await supabase
        .from("meetings")
        .update({ processing_status: "failed" })
        .eq("id", id);

      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }

    const analysis = aiResult.data;

    // Update analysis record with results
    const modelUsed = aiResult.model;
    const tokensUsed = null; // Token tracking not available for Gemini

    const { error: updateError } = await supabase
      .from("meeting_analyses")
      .update({
        summary: analysis.summary || null,
        key_discussion: analysis.key_discussion || [],
        decisions: analysis.decisions || [],
        action_items: (analysis.action_items || []).map(
          (item: { task: string; owner: string | null; priority: string; status: string; due_date: string | null }) => ({
            task: item.task,
            owner: item.owner,
            priority: item.priority || "medium",
            status: item.status || "pending",
            due_date: item.due_date,
          })
        ),
        risks: analysis.risks || [],
        questions: analysis.questions || [],
        next_steps: analysis.next_steps || [],
        topics: analysis.topics || [],
        keywords: analysis.keywords || [],
        sentiment: analysis.sentiment || { overall: "neutral", score: 0 },
        detected_language: detectedLanguage,
        model_used: modelUsed,
        tokens_used: tokensUsed,
        processing_time: processingTime,
        status: "completed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", analysisId);

    if (updateError) {
      console.error("Failed to update analysis:", updateError);
      return NextResponse.json(
        { error: "Failed to save analysis" },
        { status: 500 }
      );
    }

    // Update meeting with summary and processing status
    await supabase
      .from("meetings")
      .update({
        summary: analysis.summary || null,
        detected_language: detectedLanguage,
        processing_status: "ready",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    // Fetch updated analysis
    const { data: updatedAnalysis } = await supabase
      .from("meeting_analyses")
      .select("*")
      .eq("id", analysisId)
      .single();

    return NextResponse.json({
      success: true,
      analysis: updatedAnalysis,
      metadata: {
        model: modelUsed,
        tokensUsed,
        processingTime,
        detectedLanguage,
        languageName,
      },
    });
  } catch (error) {
    console.error("Analysis error:", error);

    // Try to mark as failed
    try {
      const { id } = await params;
      const { supabase } = await getServerUser();
      if (!supabase) return;

      const { data: meeting } = await supabase
        .from("meetings")
        .select("analysis_id")
        .eq("id", id)
        .single();

      if (meeting?.analysis_id) {
        await supabase
          .from("meeting_analyses")
          .update({ status: "failed", error_message: "Analysis failed unexpectedly" })
          .eq("id", meeting.analysis_id);
      }

      await supabase
        .from("meetings")
        .update({ processing_status: "failed" })
        .eq("id", id);
    } catch {
      // ignore cleanup errors
    }

    return NextResponse.json(
      { error: "Analysis failed. Please try again." },
      { status: 500 }
    );
  }
}

// GET /api/meetings/[id]/analyze - Get analysis for a meeting
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

    // Fetch analysis via meeting
    const { data: meeting } = await supabase
      .from("meetings")
      .select("analysis_id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (!meeting?.analysis_id) {
      return NextResponse.json({ analysis: null });
    }

    const { data: analysis } = await supabase
      .from("meeting_analyses")
      .select("*")
      .eq("id", meeting.analysis_id)
      .single();

    return NextResponse.json({ analysis });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
