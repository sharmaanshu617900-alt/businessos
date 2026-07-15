/**
 * MeetingOS AI Service — Unified AI provider with free Google Gemini + OpenAI fallback
 *
 * Default behavior:
 *   GOOGLE_GEMINI_API_KEY → Uses Gemini 2.0 Flash (free tier, no credit card needed)
 *   OPENAI_API_KEY        → Uses OpenAI GPT-4o-mini (paid, used as fallback)
 *   Neither               → Returns fallback responses (graceful degradation)
 *
 * Get your free Gemini API key: https://aistudio.google.com/apikey
 */

// ─── Provider Configuration ───

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

interface AIOptions {
  /** System prompt / instruction */
  system?: string;
  /** Response temperature (0.0 - 1.0) */
  temperature?: number;
  /** Max output tokens */
  maxTokens?: number;
  /** Request structured JSON output */
  jsonMode?: boolean;
}

interface AIResponse {
  content: string;
  provider: "gemini" | "openai" | "fallback";
  model: string;
}

// ─── Available providers detection ───

export function getAvailableAIProviders(): {
  primary: "gemini" | "openai" | null;
  hasGemini: boolean;
  hasOpenAI: boolean;
} {
  const hasGemini = !!process.env.GOOGLE_GEMINI_API_KEY;
  const hasOpenAI = !!process.env.OPENAI_API_KEY;

  if (hasGemini) return { primary: "gemini", hasGemini, hasOpenAI };
  if (hasOpenAI) return { primary: "openai", hasGemini, hasOpenAI };
  return { primary: null, hasGemini, hasOpenAI };
}

// ─── Gemini Provider (FREE) ───

async function callGemini(
  systemPrompt: string | undefined,
  userPrompt: string,
  options: AIOptions = {}
): Promise<AIResponse> {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY!;

  const requestBody: Record<string, unknown> = {
    contents: [{
      role: "user",
      parts: [{ text: userPrompt }],
    }],
    generationConfig: {
      temperature: options.temperature ?? 0.3,
      maxOutputTokens: options.maxTokens ?? 4000,
    },
  };

  // Gemini uses system_instruction as a top-level field (not in contents)
  // This is required for reliable JSON mode responses
  if (systemPrompt) {
    requestBody.system_instruction = {
      parts: [{ text: systemPrompt }],
    };
  }

  // JSON mode
  if (options.jsonMode) {
    requestBody.generationConfig = {
      ...(requestBody.generationConfig as Record<string, unknown>),
      responseMimeType: "application/json",
    };
  }

  const url = `${GEMINI_API_URL}?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error");
    throw new Error(`Gemini API error (${response.status}): ${errorText}`);
  }

  const result = await response.json();
  const content =
    result.candidates?.[0]?.content?.parts?.[0]?.text || "";

  return { content, provider: "gemini", model: "gemini-2.0-flash" };
}

// ─── OpenAI Provider ───

async function callOpenAI(
  systemPrompt: string | undefined,
  userPrompt: string,
  options: AIOptions = {}
): Promise<AIResponse> {
  const apiKey = process.env.OPENAI_API_KEY!;

  const messages: Array<{ role: string; content: string }> = [];

  if (systemPrompt) {
    messages.push({ role: "system", content: systemPrompt });
  }

  messages.push({ role: "user", content: userPrompt });

  const requestBody: Record<string, unknown> = {
    model: "gpt-4o-mini",
    messages,
    temperature: options.temperature ?? 0.3,
    max_tokens: options.maxTokens ?? 4000,
  };

  if (options.jsonMode) {
    requestBody.response_format = { type: "json_object" };
  }

  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage =
      errorData.error?.message || `OpenAI API error (${response.status})`;
    throw new Error(errorMessage);
  }

  const result = await response.json();
  const content = result.choices?.[0]?.message?.content || "";

  return { content, provider: "openai", model: "gpt-4o-mini" };
}

// ─── Fallback Provider (no API keys) ───

function callFallback(
  _systemPrompt: string | undefined,
  _userPrompt: string,
  _options: AIOptions = {}
): AIResponse {
  return {
    content: "",
    provider: "fallback",
    model: "none",
  };
}

// ─── Public API ───

/**
 * Call any AI model with automatic provider selection.
 * Tries Gemini first (free), falls back to OpenAI, then graceful degradation.
 */
export async function callAI(
  systemPrompt: string | undefined,
  userPrompt: string,
  options: AIOptions = {}
): Promise<AIResponse> {
  const providers = getAvailableAIProviders();

  // Try Gemini (free) first
  if (providers.hasGemini) {
    try {
      return await callGemini(systemPrompt, userPrompt, options);
    } catch (error) {
      console.warn("[AI] Gemini failed, falling back to OpenAI:", error);
      // Fall through to OpenAI
    }
  }

  // Try OpenAI as fallback
  if (providers.hasOpenAI) {
    try {
      return await callOpenAI(systemPrompt, userPrompt, options);
    } catch (error) {
      console.warn("[AI] OpenAI also failed:", error);
    }
  }

  // No AI available — return fallback
  console.warn("[AI] No AI provider configured. Set GOOGLE_GEMINI_API_KEY for free AI.");
  return callFallback(systemPrompt, userPrompt, options);
}

/**
 * Call AI with guaranteed JSON response.
 * The model will be instructed to return valid JSON.
 */
export async function callAIJSON<T = Record<string, unknown>>(
  systemPrompt: string | undefined,
  userPrompt: string,
  options: AIOptions = {}
): Promise<{
  data: T | null;
  provider: "gemini" | "openai" | "fallback";
  model: string;
  error?: string;
}> {
  const result = await callAI(systemPrompt, userPrompt, {
    ...options,
    jsonMode: true,
  });

  if (!result.content) {
    return {
      data: null,
      provider: result.provider,
      model: result.model,
      error: "No response generated",
    };
  }

  try {
    // Try direct parse first
    let jsonStr = result.content;

    // Handle markdown code blocks
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }

    const data = JSON.parse(jsonStr) as T;
    return { data, provider: result.provider, model: result.model };
  } catch (parseError) {
    console.error("[AI] Failed to parse JSON response:", parseError);
    return {
      data: null,
      provider: result.provider,
      model: result.model,
      error: "Failed to parse JSON response",
    };
  }
}

// ─── Speaker Diarization ───

const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
};

/**
 * Analyze raw Whisper segments and assign speaker labels using AI.
 * Uses Gemini (free) to identify speaker changes from conversational context.
 * Returns null if diarization is unavailable or fails (falls back to generic labels).
 */
export async function analyzeSpeakerDiarization(
  segments: Array<{ start: number; end: number; text: string }>
): Promise<Array<{ start: number; end: number; text: string; speaker: string }> | null> {
  if (segments.length < 3) return null;

  // Build a compact, timestamped transcript for AI analysis
  const transcriptForAnalysis = segments
    .map((s, i) => `[${formatTime(s.start)}--${formatTime(s.end)}] Seg${i + 1}: ${s.text}`)
    .join("\n");

  const systemPrompt =
    "You are an expert meeting diarization analyst. Your task is to analyze a timestamped transcript and identify speaker changes based on conversational context, topic shifts, and response patterns.";

  const userPrompt = `Analyze this meeting transcript and assign speaker labels to each segment.

Instructions:
1. Read through ALL segments carefully to understand the conversation flow
2. Identify when the speaker changes based on: topic shifts, question-answer pairs, conversational turns
3. Assign each segment a speaker label: "Speaker A", "Speaker B", "Speaker C", etc.
4. Consecutive segments from the SAME speaker get the SAME label
5. When speaker changes, use the NEXT letter
6. Keep original start, end, and text EXACTLY as given

Transcript:
${transcriptForAnalysis}

Return a JSON array where each element has: {start, end, text, speaker}
Example: [{"start":0.0,"end":4.5,"text":"Hello everyone","speaker":"Speaker A"}]

Rules:
- EVERY segment must have a speaker
- Use ONLY "Speaker A", "Speaker B", "Speaker C" etc.
- Two speakers can alternate throughout (e.g., A, B, A, B is fine)
- Return ONLY the JSON array, no other text`;

  try {
    const result = await callAIJSON<Array<{
      start: number;
      end: number;
      text: string;
      speaker?: string;
    }>>(systemPrompt, userPrompt, {
      temperature: 0.1,
      maxTokens: 8000,
    });

    if (
      result.data &&
      Array.isArray(result.data) &&
      result.data.length === segments.length
    ) {
      // Validate and merge back with originals for safety
      return result.data.map((seg, i) => ({
        start: typeof seg.start === "number" ? seg.start : segments[i].start,
        end: typeof seg.end === "number" ? seg.end : segments[i].end,
        text: seg.text || segments[i].text,
        speaker: seg.speaker || `Speaker ${String.fromCharCode(65 + (i % 26))}`,
      }));
    }

    return null;
  } catch (error) {
    console.warn("[Diarization] Failed:", error);
    return null;
  }
}

/**
 * Check if any AI provider is configured
 */
export function isAIConfigured(): boolean {
  const { hasGemini, hasOpenAI } = getAvailableAIProviders();
  return hasGemini || hasOpenAI;
}

/**
 * Get configuration status message for the UI
 */
export function getAIStatusMessage(): {
  configured: boolean;
  message: string;
  setupUrl?: string;
} {
  const { hasGemini, hasOpenAI } = getAvailableAIProviders();

  if (hasGemini) {
    return {
      configured: true,
      message: "Using Google Gemini (free tier)",
    };
  }

  if (hasOpenAI) {
    return {
      configured: true,
      message: "Using OpenAI",
    };
  }

  return {
    configured: false,
    message:
      "No AI provider configured. Get a free Google Gemini API key to enable AI features.",
    setupUrl: "https://aistudio.google.com/apikey",
  };
}
