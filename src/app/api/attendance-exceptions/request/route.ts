import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { uploadToR2 } from "@/lib/r2-upload";

export async function POST(req: Request) {
  try {
    const form = await req.formData();

    const studentId = form.get("studentId")?.toString();
    const date = form.get("date")?.toString();
    const reasonType = form.get("reasonType")?.toString();
    const reason = form.get("reason")?.toString();
    const file = form.get("proof") as File | null;


    if (!studentId || !date || !reasonType || !reason) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let fileUrl = ""; 

    if (file && file.size > 0) {
      const uploadResult = await uploadToR2(file, "attendance-exceptions");
      
      if (!uploadResult.success) {
        return NextResponse.json({ 
          error: uploadResult.error || "File upload failed" 
        }, { status: 400 });
      }
      
      fileUrl = uploadResult.fileUrl!;
    }


    await prisma.attendanceException.create({
      data: {
        studentId,
        date,
        reasonType,
        reason,
        fileUrl,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Upload error:", err);
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: "Internal Server Error", details: errorMessage }, { status: 500 });
  }
}
