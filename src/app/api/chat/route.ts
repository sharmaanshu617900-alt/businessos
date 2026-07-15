import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/supabase/server";
import { callAI, isAIConfigured } from "@/lib/ai-service";

// POST /api/chat — Ask a question about your meetings
export async function POST(request: NextRequest) {
  try {
    const { user, supabase } = await getServerUser();
    if (!supabase || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { query, conversationHistory = [] } = body;

    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return NextResponse.json({ error: "Question is required" }, { status: 400 });
    }

    const trimmedQuery = query.trim();
    const startTime = Date.now();

    // ─── STEP 1: Fetch all user's meetings ───
    const { data: meetings, error: meetingsError } = await supabase
      .from("meetings")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (meetingsError) {
      return NextResponse.json({ error: "Failed to fetch meetings" }, { status: 500 });
    }

    if (!meetings || meetings.length === 0) {
      return NextResponse.json({
        answer: "You haven't imported any meetings yet. Upload a meeting recording first, then I can help answer questions about it.",
        sources: [],
        searchTime: Date.now() - startTime,
      });
    }

    // ─── STEP 2: Score and rank meetings by relevance ───
    const lowerQuery = trimmedQuery.toLowerCase();
    const queryWords = lowerQuery.split(/\s+/).filter((w) => w.length > 2);

    interface ScoredMeeting {
      meeting: typeof meetings[number];
      score: number;
      matchedFields: string[];
    }

    const scored: ScoredMeeting[] = meetings.map((m) => {
      let score = 0;
      const matchedFields: string[] = [];

      if (m.title?.toLowerCase().includes(lowerQuery)) { score += 10; matchedFields.push("title"); }
      if (m.client_name?.toLowerCase().includes(lowerQuery)) { score += 8; matchedFields.push("client"); }
      if (m.summary?.toLowerCase().includes(lowerQuery)) { score += 6; matchedFields.push("summary"); }

      for (const word of queryWords) {
        if (m.title?.toLowerCase().includes(word)) { score += 3; }
        if (m.summary?.toLowerCase().includes(word)) { score += 2; }
        if (m.client_name?.toLowerCase().includes(word)) { score += 2; }
      }

      if (m.transcript && Array.isArray(m.transcript)) {
        const transcriptText = m.transcript.map((t: { text: string }) => t.text).join(" ").toLowerCase();
        for (const word of queryWords) {
          if (transcriptText.includes(word)) { score += 1; matchedFields.push("transcript"); break; }
        }
      }

      return { meeting: m, score, matchedFields: [...new Set(matchedFields)] };
    });

    scored.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return new Date(b.meeting.created_at).getTime() - new Date(a.meeting.created_at).getTime();
    });

    const topResults = scored.filter((s) => s.score > 0).slice(0, 8);
    if (topResults.length === 0) topResults.push(...scored.slice(0, 3));

    // ─── STEP 3: Fetch analysis data for matched meetings ───
    const allDecisions: Array<{
      title: string; description: string; confidence: number;
      meetingTitle: string; meetingDate: string; meetingId: string;
    }> = [];

    const transcriptSections: Array<{
      text: string; speaker?: string; timestamp?: string;
      meetingTitle: string; meetingDate: string; meetingId: string;
    }> = [];

    for (const { meeting } of topResults) {
      if (meeting.analysis_id) {
        const { data: analysis } = await supabase
          .from("meeting_analyses")
          .select("decisions, action_items, summary, key_discussion, next_steps, questions, keywords")
          .eq("id", meeting.analysis_id)
          .single();

        if (analysis?.decisions) {
          for (const d of analysis.decisions) {
            allDecisions.push({
              ...d,
              meetingTitle: meeting.title,
              meetingDate: meeting.date,
              meetingId: meeting.id,
            });
          }
        }
      }

      if (meeting.transcript && Array.isArray(meeting.transcript)) {
        for (const entry of meeting.transcript) {
          const text = entry.text?.toLowerCase() || "";
          if (queryWords.some((w) => text.includes(w))) {
            transcriptSections.push({
              text: entry.text,
              meetingTitle: meeting.title,
              meetingDate: meeting.date,
              meetingId: meeting.id,
            });
          }
        }
      }
    }

    // ─── STEP 4: Build context and generate AI answer ───
    let answer = "";

    // Build structured context
    const contextLines: string[] = [];
    contextLines.push(`User Question: "${trimmedQuery}"`);
    contextLines.push("");

    for (const { meeting, matchedFields } of topResults.slice(0, 6)) {
      const dur = meeting.duration ? `${Math.round(meeting.duration / 60)} min` : "unknown";
      contextLines.push(`MEETING: "${meeting.title}"`);
      contextLines.push(`  Client: ${meeting.client_name} | Date: ${meeting.date} | Duration: ${dur}`);
      if (meeting.summary) contextLines.push(`  Summary: ${meeting.summary.substring(0, 400)}`);
      if (matchedFields.length > 0) contextLines.push(`  Relevance: ${matchedFields.join(", ")}`);
    }

    const decisionsForContext = allDecisions.slice(0, 10);
    if (decisionsForContext.length > 0) {
      contextLines.push("");
      contextLines.push("DECISIONS:");
      for (const d of decisionsForContext) {
        contextLines.push(`- "${d.title}" (from "${d.meetingTitle}", ${d.meetingDate})`);
      }
    }

    const transcriptForContext = transcriptSections.slice(0, 6);
    if (transcriptForContext.length > 0) {
      contextLines.push("");
      contextLines.push("TRANSCRIPT EXCERPTS:");
      for (const ts of transcriptForContext) {
        contextLines.push(`- [${ts.meetingTitle}]: "${ts.text.substring(0, 250)}"`);
      }
    }

    const context = contextLines.join("\n");

    // Generate AI answer
    if (isAIConfigured()) {
      try {
        const systemPrompt = `You are MeetingOS AI, an assistant that ONLY answers questions about the user's meetings.

RULES:
- Answer ONLY using the provided meeting context. Never make up information.
- If the context doesn't contain enough to answer the question, say so honestly.
- Every claim must be traceable to a specific meeting.
- Use markdown formatting for readability.
- Keep answers concise but thorough.
- When listing decisions or action items, always mention which meeting they came from.
- Format your response with clear sections when appropriate.`;

        const aiResult = await callAI(
          systemPrompt,
          `Based on the meeting data below, answer: "${trimmedQuery}"\n\n${context}`,
          { temperature: 0.3, maxTokens: 1500 }
        );

        answer = aiResult.content;
      } catch {
        // fallback
      }
    }

    // Fallback answer
    if (!answer) {
      const mc = topResults.length;
      const dc = allDecisions.length;
      const tc = transcriptSections.length;

      if (mc > 0) {
        answer = `Found **${mc} meeting${mc !== 1 ? "s" : ""}** matching your question.\n\n`;
        for (const { meeting, matchedFields } of topResults.slice(0, 5)) {
          answer += `### ${meeting.title}\n**${meeting.client_name}** · ${meeting.date}\n`;
          if (meeting.summary) answer += `${meeting.summary.substring(0, 200)}\n`;
          answer += "\n";
        }
        if (dc > 0) answer += `\n**${dc} decision${dc !== 1 ? "s" : ""}** found across these meetings.\n`;
      } else {
        answer = `I couldn't find any meetings matching "${trimmedQuery}". Try rephrasing your question or checking your meeting library.`;
      }
    }

    // ─── STEP 5: Build structured sources ───
    const sources = topResults.slice(0, 6).map(({ meeting }) => ({
      id: meeting.id,
      title: meeting.title,
      client: meeting.client_name,
      date: meeting.date,
      duration: meeting.duration,
      summary: meeting.summary?.substring(0, 200) || "",
    }));

    const decisions = decisionsForContext.map((d) => ({
      title: d.title,
      description: d.description,
      meetingTitle: d.meetingTitle,
      meetingDate: d.meetingDate,
      meetingId: d.meetingId,
    }));

    return NextResponse.json({
      answer,
      sources,
      decisions,
      searchTime: Date.now() - startTime,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to process your question. Please try again." },
      { status: 500 }
    );
  }
}
