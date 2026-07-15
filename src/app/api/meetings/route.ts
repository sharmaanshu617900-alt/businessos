import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/supabase/server";

// GET /api/meetings - List all meetings for current user
export async function GET(request: NextRequest) {
  try {
    const { user, supabase } = await getServerUser();
    if (!user || !supabase) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const clientId = searchParams.get("client_id") || "";
    const limit = searchParams.get("limit");

    let query = supabase
      .from("meetings")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (search) {
      query = query.or(`title.ilike.%${search}%,client_name.ilike.%${search}%`);
    }

    if (clientId) {
      query = query.eq("client_id", clientId);
    }

    if (limit) {
      const limitNum = parseInt(limit, 10);
      if (!isNaN(limitNum) && limitNum > 0) {
        query = query.limit(limitNum);
      }
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ meetings: data });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/meetings - Create a new meeting
export async function POST(request: NextRequest) {
  try {
    const { user, supabase } = await getServerUser();
    if (!user || !supabase) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      client_name,
      date,
      file_type,
      file_name,
      original_file_name,
      file_size,
      storage_path,
      duration,
      transcript,
      summary,
      action_items,
      key_decisions,
    } = body;

    if (!title || !client_name || !date) {
      return NextResponse.json(
        { error: "Missing required fields: title, client_name, date" },
        { status: 400 }
      );
    }

    // Try to find or create client
    let clientId: string | null = null;
    const { data: existingClient } = await supabase
      .from("clients")
      .select("id")
      .eq("user_id", user.id)
      .eq("name", client_name)
      .single();

    if (existingClient) {
      clientId = existingClient.id;
    } else {
      const { data: newClient } = await supabase
        .from("clients")
        .insert({ user_id: user.id, name: client_name })
        .select("id")
        .single();
      clientId = newClient?.id || null;
    }

    const { data, error } = await supabase
      .from("meetings")
      .insert({
        user_id: user.id,
        client_id: clientId,
        client_name,
        title,
        date,
        file_type: file_type || "AUDIO",
        file_name: file_name || "",
        original_file_name: original_file_name || file_name || "",
        file_size: file_size || 0,
        storage_path: storage_path || null,
        duration: duration || null,
        uploaded_by: user.id,
        transcript: transcript || [],
        summary: summary || null,
        action_items: action_items || [],
        key_decisions: key_decisions || [],
        status: "uploaded",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ meeting: data }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
