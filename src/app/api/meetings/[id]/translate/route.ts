import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/supabase/server";
import { callAI, isAIConfigured } from "@/lib/ai-service";

const SUPPORTED_LANGUAGES = [
  { code: "hi", name: "Hindi" },
  { code: "bn", name: "Bengali" },
  { code: "te", name: "Telugu" },
  { code: "ta", name: "Tamil" },
  { code: "mr", name: "Marathi" },
  { code: "gu", name: "Gujarati" },
  { code: "pa", name: "Punjabi" },
  { code: "kn", name: "Kannada" },
  { code: "ml", name: "Malayalam" },
  { code: "or", name: "Odia" },
  { code: "ur", name: "Urdu" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "zh", name: "Chinese" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "ar", name: "Arabic" },
] as const;

// GET /api/meetings/[id]/translate — Get supported languages
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { user, supabase } = await getServerUser();
  if (!user || !supabase) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: meeting } = await supabase
    .from("meetings")
    .select("id, title, detected_language")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!meeting) {
    return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
  }

  return NextResponse.json({
    languages: SUPPORTED_LANGUAGES,
    detectedLanguage: meeting.detected_language || "en",
  });
}

// POST /api/meetings/[id]/translate — Translate transcript to target language
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

    const body = await request.json();
    const { targetLanguage } = body;

    if (!targetLanguage) {
      return NextResponse.json(
        { error: "targetLanguage is required" },
        { status: 400 }
      );
    }

    const langInfo = SUPPORTED_LANGUAGES.find((l) => l.code === targetLanguage);
    if (!langInfo) {
      return NextResponse.json(
        { error: `Unsupported language: ${targetLanguage}` },
        { status: 400 }
      );
    }

    // Fetch meeting and transcript
    const { data: meeting } = await supabase
      .from("meetings")
      .select("*, transcript_id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (!meeting?.transcript_id) {
      return NextResponse.json(
        { error: "No transcript available for translation" },
        { status: 400 }
      );
    }

    const { data: transcript } = await supabase
      .from("transcripts")
      .select("*")
      .eq("id", meeting.transcript_id)
      .single();

    if (!transcript?.transcript_text) {
      return NextResponse.json(
        { error: "No transcript text to translate" },
        { status: 400 }
      );
    }

    // Update status
    await supabase
      .from("meetings")
      .update({ translation_status: "processing", processing_status: "translating" })
      .eq("id", id);

    if (!isAIConfigured()) {
      return NextResponse.json(
        { error: "AI service not configured. Add GOOGLE_GEMINI_API_KEY (free) or OPENAI_API_KEY to .env.local" },
        { status: 500 }
      );
    }

    // Detect source language
    const sourceLang = transcript.language || "en";
    const sourceLangName =
      SUPPORTED_LANGUAGES.find((l) => l.code === sourceLang)?.name || "English";

    // Use unified AI service for translation
    const aiResult = await callAI(
      `You are an expert translator. Translate the following meeting transcript from ${sourceLangName} to ${langInfo.name}.

Rules:
- Preserve the original meaning and nuance
- Keep speaker labels, timestamps, and formatting intact
- For Indian languages: handle code-switching naturally, translate only the non-English portions
- If the text is already in ${langInfo.name}, return it as-is
- Respond with ONLY the translated text, no explanations`,
      transcript.transcript_text,
      { temperature: 0.1, maxTokens: 8000 }
    );

    const translatedText = aiResult.content;

    // Save translation
    await supabase
      .from("transcripts")
      .update({
        translated_text: translatedText,
        translation_language: targetLanguage,
      })
      .eq("id", transcript.id);

    await supabase
      .from("meetings")
      .update({ translation_status: "completed" })
      .eq("id", id);

    return NextResponse.json({
      success: true,
      sourceLanguage: sourceLang,
      targetLanguage,
      targetLanguageName: langInfo.name,
      translatedText,
      wordCount: translatedText.split(/\s+/).filter((w: string) => w.length > 0).length,
    });
  } catch (error) {
    console.error("Translation error:", error);

    try {
      const { supabase } = await getServerUser();
      if (supabase) {
        await supabase
          .from("meetings")
          .update({ translation_status: "failed", processing_status: "failed" })
          .eq("id", id);
      }
    } catch {
      // ignore
    }

    return NextResponse.json(
      { error: "Translation failed. Please try again." },
      { status: 500 }
    );
  }
}
