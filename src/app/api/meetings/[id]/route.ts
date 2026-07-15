import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/supabase/server";

// GET /api/meetings/[id] - Get single meeting
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

    const { data, error } = await supabase
      .from("meetings")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Meeting not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ meeting: data });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/meetings/[id] - Delete a meeting and its storage file
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { user, supabase } = await getServerUser();
    if (!user || !supabase) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // First fetch the meeting to get storage_path
    const { data: meeting, error: fetchError } = await supabase
      .from("meetings")
      .select("storage_path")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !meeting) {
      return NextResponse.json(
        { error: "Meeting not found" },
        { status: 404 }
      );
    }

    // Delete file from storage if storage_path exists
    if (meeting.storage_path) {
      const { error: storageError } = await supabase.storage
        .from("meeting-recordings")
        .remove([meeting.storage_path]);

      // Log but don't fail if storage delete fails (file may already be gone)
      if (storageError) {
        console.warn(
          "Failed to delete storage file:",
          storageError.message
        );
      }
    }

    // Delete the meeting record
    const { error } = await supabase
      .from("meetings")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
