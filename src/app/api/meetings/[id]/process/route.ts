import { NextRequest, NextResponse } from "next/server";
import { getServerUser, createClient } from "@/lib/supabase/server";

// POST /api/meetings/[id]/process - Extract metadata from uploaded file
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

    if (!meeting.storage_path) {
      return NextResponse.json(
        { error: "No file associated with this meeting" },
        { status: 400 }
      );
    }

    // Update status to processing
    await supabase
      .from("meetings")
      .update({ status: "processing", processing_status: "reading" })
      .eq("id", id);

    // Download the file from Supabase Storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("meeting-recordings")
      .download(meeting.storage_path);

    if (downloadError || !fileData) {
      await supabase
        .from("meetings")
        .update({ status: "failed", processing_status: "failed" })
        .eq("id", id);
      return NextResponse.json(
        { error: "Failed to download file for processing" },
        { status: 500 }
      );
    }

    // Update processing status
    await supabase
      .from("meetings")
      .update({ processing_status: "detecting" })
      .eq("id", id);

    // Parse metadata using music-metadata with streaming (avoids loading entire file into memory)
    let metadata;
    try {
      // Convert ReadableStream to Buffer for music-metadata
      const buffer = await fileData.arrayBuffer();
      const { parseBuffer } = await import("music-metadata");
      metadata = await parseBuffer(Buffer.from(buffer), undefined, {
        duration: true,
        skipCovers: true,
      });
    } catch (parseError) {
      console.warn("music-metadata parse failed, using fallback:", parseError);
      metadata = null;
    }

    // Extract metadata
    let duration: number | null = null;
    let codec: string | null = null;
    let resolution: string | null = null;
    let fileType = meeting.file_type;

    if (metadata && metadata.format) {
      // Duration in seconds
      duration = metadata.format.duration ?? null;

      // Audio codec
      if (metadata.format.codec) {
        codec = metadata.format.codec;
      } else if (metadata.format.container) {
        codec = metadata.format.container;
      }

      // For video files, try to get resolution
      if (metadata.format.trackInfo && metadata.format.trackInfo.length > 0) {
        // Try to extract resolution from codec string
        const codecStr = metadata.format.codec || "";
        const match = codecStr.match(/(\d+)x(\d+)/);
        if (match) {
          resolution = `${match[1]}x${match[2]}`;
        }
      }

      // Determine file type from container/format
      if (metadata.format.container) {
        const container = metadata.format.container.toLowerCase();
        if (container.includes("mp4") || container.includes("mpeg-4")) {
          fileType = "VIDEO";
        } else if (container.includes("mp3") || container.includes("mpeg")) {
          fileType = "MP3";
        } else if (container.includes("wav")) {
          fileType = "WAV";
        } else if (container.includes("m4a") || container.includes("aac")) {
          fileType = "M4A";
        }
      }
    } else {
      // Fallback metadata extraction from file extension
      const ext = meeting.file_name.split(".").pop()?.toLowerCase() || "";
      switch (ext) {
        case "mp3":
          fileType = "MP3";
          codec = "MP3 (MPEG Audio Layer III)";
          break;
        case "mp4":
          fileType = "VIDEO";
          codec = "MP4 (MPEG-4)";
          break;
        case "wav":
          fileType = "WAV";
          codec = "WAV (PCM)";
          break;
        case "m4a":
          fileType = "M4A";
          codec = "M4A (AAC)";
          break;
        default:
          codec = ext.toUpperCase();
      }

      // Estimate duration based on file size (rough estimate: 1MB ≈ 1 min for MP3)
      if (meeting.file_size > 0) {
        const sizeInMB = meeting.file_size / (1024 * 1024);
        if (fileType === "MP3") {
          duration = sizeInMB * 60; // ~1 min per MB for 128kbps MP3
        } else if (fileType === "M4A") {
          duration = sizeInMB * 75; // ~1.25 min per MB for AAC
        } else if (fileType === "WAV") {
          duration = sizeInMB * 9; // ~9 sec per MB for WAV
        } else if (fileType === "VIDEO") {
          duration = sizeInMB * 8; // ~8 sec per MB for MP4 video
        }
      }
    }

    // Calculate estimated processing time based on file size
    // Rough estimate: 1 minute of processing per 10MB of file
    const estimatedProcessingTime = Math.max(
      30,
      Math.ceil((meeting.file_size / (10 * 1024 * 1024)) * 60)
    );

    // Update processing status to preparing
    await supabase
      .from("meetings")
      .update({ processing_status: "preparing" })
      .eq("id", id);

    // Small delay to show the preparing step
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Update meeting with extracted metadata
    const { error: updateError } = await supabase
      .from("meetings")
      .update({
        duration,
        codec,
        resolution,
        file_type: fileType,
        processing_status: "metadata_ready",
        estimated_processing_time: estimatedProcessingTime,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (updateError) {
      console.error("Failed to update meeting:", updateError);
      return NextResponse.json(
        { error: "Failed to save metadata" },
        { status: 500 }
      );
    }

    // Fetch updated meeting
    const { data: updatedMeeting } = await supabase
      .from("meetings")
      .select("*")
      .eq("id", id)
      .single();

    return NextResponse.json({
      success: true,
      meeting: updatedMeeting,
      metadata: {
        duration,
        codec,
        resolution,
        fileType,
        estimatedProcessingTime,
      },
      nextStep: "transcribe",
    });
  } catch (error) {
    console.error("Processing error:", error);

    // Try to mark as failed
    try {
      const { id: meetingId } = await params;
      const sb = await createClient();
      await sb
        .from("meetings")
        .update({ status: "failed", processing_status: "failed" })
        .eq("id", meetingId);
    } catch {
      // ignore cleanup errors
    }

    return NextResponse.json(
      { error: "Processing failed. Please try again." },
      { status: 500 }
    );
  }
}
