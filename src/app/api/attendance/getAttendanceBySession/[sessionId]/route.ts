import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  const { sessionId } = params;

  if (!sessionId) {
    return NextResponse.json(
      { error: "Missing sessionId parameter" },
      { status: 400 }
    );
  }

  try {
    const attendanceRecords = await prisma.attendance.findMany({
      where: { sessionId },
      include: {
        student: { select: { id: true, name: true } },
        batch: { select: { name: true } },
        subject: { select: { name: true } },
      },
      orderBy: { student: { name: "asc" } },
    });

    if (attendanceRecords.length === 0) {
      return NextResponse.json({ success: true, session: null, records: [] });
    }

    const { date, time, batch, subject } = attendanceRecords[0];

    const records = attendanceRecords.map((r) => ({
      id: r.id,
      studentId: r.student?.id,
      studentName: r.student?.name,
      attendanceStatus: r.attendanceStatus,
    }));

    return NextResponse.json({
      success: true,
      session: {
        date,
        time,
        batchName: batch?.name,
        subjectName: subject?.name,
      },
      records,
    });
  } catch (error) {
    console.error("❌ getAttendanceBySession error:", error);
    return NextResponse.json(
      { error: "Server error fetching attendance" },
      { status: 500 }
    );
  }
}
