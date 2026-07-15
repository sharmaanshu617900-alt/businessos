import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/supabase/server";
import { callAI, isAIConfigured } from "@/lib/ai-service";

// POST /api/search - Search across all meetings with AI-powered answers
export async function POST(request: NextRequest) {
  try {
    const { user, supabase } = await getServerUser();
    if (!user || !supabase) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      query,
      filters = {},
      mode = "smart", // "smart" | "keyword"
    } = body;

    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const trimmedQuery = query.trim();
    const startTime = Date.now();

    // ─── STEP 1: Keyword search across all meeting data ───
    let meetingsQuery = supabase
      .from("meetings")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    // Apply filters
    if (filters.client) {
      meetingsQuery = meetingsQuery.ilike("client_name", `%${filters.client}%`);
    }
    if (filters.status) {
      meetingsQuery = meetingsQuery.eq("status", filters.status);
    }
    if (filters.dateFrom) {
      meetingsQuery = meetingsQuery.gte("date", filters.dateFrom);
    }
    if (filters.dateTo) {
      meetingsQuery = meetingsQuery.lte("date", filters.dateTo);
    }

    const { data: meetings, error: meetingsError } = await meetingsQuery;

    if (meetingsError) {
      console.error("Search query error:", meetingsError);
      return NextResponse.json({ error: "Search failed" }, { status: 500 });
    }

    if (!meetings || meetings.length === 0) {
      return NextResponse.json({
        answer: "No meetings found matching your query.",
        results: [],
        sources: { meetings: [], decisions: [], transcript_sections: [] },
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

      // Title match (high weight)
      if (m.title?.toLowerCase().includes(lowerQuery)) {
        score += 10;
        matchedFields.push("title");
      }
      // Client match
      if (m.client_name?.toLowerCase().includes(lowerQuery)) {
        score += 8;
        matchedFields.push("client");
      }
      // Summary match
      if (m.summary?.toLowerCase().includes(lowerQuery)) {
        score += 6;
        matchedFields.push("summary");
      }
      // Word-level matching across fields
      for (const word of queryWords) {
        if (m.title?.toLowerCase().includes(word)) { score += 3; matchedFields.push("title"); }
        if (m.summary?.toLowerCase().includes(word)) { score += 2; matchedFields.push("summary"); }
        if (m.client_name?.toLowerCase().includes(word)) { score += 2; matchedFields.push("client"); }
        if (m.topics?.some?.((t: string) => t.toLowerCase().includes(word))) { score += 2; matchedFields.push("topics"); }
        if (m.keywords?.some?.((k: string) => k.toLowerCase().includes(word))) { score += 2; matchedFields.push("keywords"); }
      }
      // Transcript text match
      if (m.transcript && Array.isArray(m.transcript)) {
        const transcriptText = m.transcript.map((t: { text: string }) => t.text).join(" ").toLowerCase();
        for (const word of queryWords) {
          if (transcriptText.includes(word)) {
            score += 1;
            matchedFields.push("transcript");
            break;
          }
        }
      }

      return { meeting: m, score, matchedFields: [...new Set(matchedFields)] };
    });

    // Sort by score, then by date
    scored.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return new Date(b.meeting.created_at).getTime() - new Date(a.meeting.created_at).getTime();
    });

    // Take top 10 results
    const topResults = scored.filter((s) => s.score > 0).slice(0, 10);

    // If no keyword matches, include top meetings by recency
    if (topResults.length === 0) {
      topResults.push(...scored.slice(0, 5));
    }

    // ─── STEP 3: Extract decisions and action items from matched meetings ───
    const allDecisions: Array<{
      title: string;
      description: string;
      confidence: number;
      meetingTitle: string;
      meetingDate: string;
      meetingId: string;
    }> = [];

    const transcriptSections: Array<{
      text: string;
      meetingTitle: string;
      meetingDate: string;
      meetingId: string;
    }> = [];

    for (const { meeting } of topResults) {
      // Get analysis for this meeting
      if (meeting.analysis_id) {
        const { data: analysis } = await supabase
          .from("meeting_analyses")
          .select("decisions, action_items, summary")
          .eq("id", meeting.analysis_id)
          .single();

        if (analysis?.decisions) {
          for (const d of analysis.decisions) {
            const dStr = JSON.stringify(d).toLowerCase();
            const isRelevant = queryWords.some((w) => dStr.includes(w)) || dStr.includes(lowerQuery);
            if (isRelevant || topResults.indexOf(topResults.find((t) => t.meeting.id === meeting.id)!) < 3) {
              allDecisions.push({
                ...d,
                meetingTitle: meeting.title,
                meetingDate: meeting.date,
                meetingId: meeting.id,
              });
            }
          }
        }
      }

      // Extract relevant transcript sections
      if (meeting.transcript && Array.isArray(meeting.transcript)) {
        for (const entry of meeting.transcript) {
          const text = entry.text?.toLowerCase() || "";
          const isRelevant = queryWords.some((w) => text.includes(w));
          if (isRelevant) {
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

    // ─── STEP 4: Generate AI answer if AI is configured ───
    let answer = "";

    if (isAIConfigured() && mode === "smart") {
      // Build context for AI
      const contextParts: string[] = [];

      contextParts.push(`Search Query: "${trimmedQuery}"`);
      contextParts.push("");

      contextParts.push(`Matched Meetings (${topResults.length}):`);
      for (const { meeting, matchedFields } of topResults.slice(0, 8)) {
        const dur = meeting.duration ? `${Math.round(meeting.duration / 60)} min` : "unknown duration";
        contextParts.push(`- "${meeting.title}" (${meeting.client_name}, ${meeting.date}, ${dur})`);
        if (meeting.summary) {
          contextParts.push(`  Summary: ${meeting.summary.substring(0, 300)}`);
        }
        if (matchedFields.length > 0) {
          contextParts.push(`  Matched in: ${matchedFields.join(", ")}`);
        }
      }

      if (allDecisions.length > 0) {
        contextParts.push("");
        contextParts.push(`Related Decisions:`);
        for (const d of allDecisions.slice(0, 8)) {
          contextParts.push(`- "${d.title}" from "${d.meetingTitle}" (${d.meetingDate})`);
          if (d.description) contextParts.push(`  ${d.description.substring(0, 200)}`);
        }
      }

      if (transcriptSections.length > 0) {
        contextParts.push("");
        contextParts.push(`Relevant Transcript Excerpts:`);
        for (const ts of transcriptSections.slice(0, 5)) {
          contextParts.push(`- From "${ts.meetingTitle}" (${ts.meetingDate}): "${ts.text.substring(0, 200)}"`);
        }
      }

      const context = contextParts.join("\n");

      try {
        const systemPrompt = `You are AgencyOS Brain, an AI assistant that answers questions about company meetings and decisions. You have access to the user's meeting data. Answer concisely and accurately based ONLY on the provided context. Always cite which meeting your answer comes from. If the context doesn't contain enough information to answer, say so. Use markdown formatting for readability.`;

        const aiResult = await callAI(
          systemPrompt,
          `Based on the following company meeting data, answer this question: "${trimmedQuery}"\n\nContext:\n${context}`,
          { temperature: 0.3, maxTokens: 1000 }
        );

        if (aiResult.content) {
          answer = aiResult.content;
        }
      } catch (aiError) {
        console.error("AI search error:", aiError);
        // Fall through to non-AI answer
      }
    }

    // Fallback answer if AI didn't produce one
    if (!answer) {
      const meetingCount = topResults.length;
      const decisionCount = allDecisions.length;
      answer = `Found **${meetingCount} meeting${meetingCount !== 1 ? "s" : ""}** matching "${trimmedQuery}".`;
      if (decisionCount > 0) {
        answer += `\n\n**${decisionCount} related decision${decisionCount !== 1 ? "s" : ""}** were identified across these meetings.`;
      }
      if (transcriptSections.length > 0) {
        answer += `\n\nFound **${transcriptSections.length} relevant transcript section${transcriptSections.length !== 1 ? "s" : ""}** in your meeting recordings.`;
      }
      answer += `\n\nSee the results below for details.`;
    }

    const searchTime = Date.now() - startTime;

    return NextResponse.json({
      answer,
      results: topResults.map(({ meeting, score, matchedFields }) => ({
        id: meeting.id,
        title: meeting.title,
        client: meeting.client_name,
        date: meeting.date,
        summary: meeting.summary,
        duration: meeting.duration,
        status: meeting.status,
        score,
        matchedFields,
        topics: meeting.topics || [],
        keywords: meeting.keywords || [],
        processing_status: meeting.processing_status,
      })),
      sources: {
        meetings: topResults.map(({ meeting }) => ({
          id: meeting.id,
          title: meeting.title,
          date: meeting.date,
          client: meeting.client_name,
          summary: meeting.summary?.substring(0, 200) || "",
        })),
        decisions: allDecisions.slice(0, 10),
        transcript_sections: transcriptSections.slice(0, 5),
      },
      searchTime,
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Search failed. Please try again." },
      { status: 500 }
    );
  }
}

// GET /api/search - Get search suggestions / autocomplete
export async function GET(request: NextRequest) {
  try {
    const { user, supabase } = await getServerUser();
    if (!user || !supabase) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";

    if (q.length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    const lowerQ = q.toLowerCase();

    // Search meeting titles
    const { data: titleMatches } = await supabase
      .from("meetings")
      .select("id, title, client_name, date")
      .eq("user_id", user.id)
      .ilike("title", `%${q}%`)
      .limit(5);

    // Search client names
    const { data: clientMatches } = await supabase
      .from("meetings")
      .select("client_name")
      .eq("user_id", user.id)
      .ilike("client_name", `%${q}%`)
      .limit(3);

    const uniqueClients = [...new Set((clientMatches || []).map((m) => m.client_name))];

    const suggestions = [
      ...(titleMatches || []).map((m) => ({
        type: "meeting" as const,
        id: m.id,
        title: m.title,
        subtitle: `${m.client_name} · ${m.date}`,
      })),
      ...uniqueClients.map((c) => ({
        type: "client" as const,
        title: c,
        subtitle: "Client",
      })),
    ];

    return NextResponse.json({ suggestions: suggestions.slice(0, 8) });
  } catch {
    return NextResponse.json({ suggestions: [] });
  }
}
