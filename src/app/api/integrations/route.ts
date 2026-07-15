import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/supabase/server";

// GET /api/integrations - List all integrations for current user
export async function GET() {
  try {
    const { user, supabase } = await getServerUser();
    if (!user || !supabase) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("integrations")
      .select("*")
      .eq("user_id", user.id)
      .order("provider");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ integrations: data });
  } catch (err) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/integrations - Toggle a connection
export async function POST(request: NextRequest) {
  try {
    const { user, supabase } = await getServerUser();
    if (!user || !supabase) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { provider } = body;

    if (!provider) {
      return NextResponse.json(
        { error: "Missing required field: provider" },
        { status: 400 }
      );
    }

    // Check if integration exists
    const { data: existing } = await supabase
      .from("integrations")
      .select("id, connected")
      .eq("user_id", user.id)
      .eq("provider", provider)
      .single();

    if (existing) {
      // Toggle connected status
      const { data, error } = await supabase
        .from("integrations")
        .update({ connected: !existing.connected })
        .eq("id", existing.id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ integration: data });
    }

    // Create new integration
    const { data, error } = await supabase
      .from("integrations")
      .insert({
        user_id: user.id,
        provider,
        connected: true,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ integration: data }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
