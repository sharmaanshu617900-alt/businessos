import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";

    let query = supabase
      .from("waitlist_signups")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    if (search) {
      query = query.or(
        `name.ilike.%${search}%,email.ilike.%${search}%,agency.ilike.%${search}%`
      );
    }

    const { data, error, count } = await query;

    if (error) {
      console.error("Supabase select error:", error);

      // Check if RLS is blocking
      if (error.code === "42501") {
        return NextResponse.json(
          {
            message:
              "RLS policy is blocking SELECT. Run the SQL to update the policy.",
            error: "rls_blocked",
          },
          { status: 403 }
        );
      }

      return NextResponse.json(
        { message: "Failed to fetch waitlist data." },
        { status: 500 }
      );
    }

    return NextResponse.json({ data, total: count ?? 0 });
  } catch (error) {
    console.error("Admin API error:", error);
    return NextResponse.json(
      { message: "Something went wrong." },
      { status: 500 }
    );
  }
}
