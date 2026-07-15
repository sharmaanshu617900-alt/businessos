import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, agency, teamSize } = body;

    // Validate required fields
    if (!name || !email || !agency || !teamSize) {
      return NextResponse.json(
        { message: "All fields are required." },
        { status: 400 }
      );
    }

    // Basic email validation
    if (!email.includes("@") || !email.includes(".")) {
      return NextResponse.json(
        { message: "Invalid email address." },
        { status: 400 }
      );
    }

    // Insert into Supabase
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from("waitlist_signups")
      .insert([
        {
          name,
          email: email.toLowerCase(),
          agency,
          team_size: teamSize,
          created_at: new Date().toISOString(),
        },
      ] as never);

    if (error) {
      // Handle duplicate email
      if (error.code === "23505") {
        return NextResponse.json(
          { message: "This email is already on the waitlist!" },
          { status: 409 }
        );
      }

      console.error("Supabase insert error:", error);

      // Check if table doesn't exist
      if (error.code === "42P01") {
        return NextResponse.json(
          { message: "Waitlist table not configured. Please create the waitlist_signups table in Supabase." },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { message: "Failed to join waitlist. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Successfully joined the waitlist!" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Waitlist API error:", error);
    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
