import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const requests = await prisma.attendanceException.findMany({
      include: {
        student: true,
        reviewedBy: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, requests });
  } catch (err) {
    console.error("[ADMIN: Fetch Exception List]", err);
    return NextResponse.json({ success: false, error: "Failed to load exception requests." }, { status: 500 });
  }
}
