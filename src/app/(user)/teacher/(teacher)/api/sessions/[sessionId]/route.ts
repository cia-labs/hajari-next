import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


export async function GET(
  _req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const anchor = await prisma.attendance.findFirst({
      where: { sessionId: params.sessionId },
      select: {
        date: true,
        time: true,
        batchId: true,
        subjectId: true,
        teacherId: true,
        createdAt: true,
      },
    });

    if (!anchor) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    const records = await prisma.attendance.findMany({
      where: {
        date: anchor.date,
        time: anchor.time,
        batchId: anchor.batchId,
        subjectId: anchor.subjectId,
        teacherId: anchor.teacherId,
      },
      include: {
        student: true,
        batch: true,
        subject: true,
      },
      orderBy: { studentId: "asc" },
    });

    const session = {
      batch: records[0]?.batch ?? { name: "Unknown Batch" },
      subject: records[0]?.subject ?? { name: "Unknown Subject" },
      date: anchor.date,
      time: anchor.time,
      createdAt: anchor.createdAt,
    };

    return NextResponse.json({ records, session });
  } catch (err) {
    console.error("Error fetching session details:", err);
    return NextResponse.json(
      { error: "Failed to fetch session data" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const body = await req.json();

    if (!body.updates || !Array.isArray(body.updates)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const anchor = await prisma.attendance.findFirst({
      where: { sessionId: params.sessionId },
      select: {
        date: true,
        time: true,
        batchId: true,
        subjectId: true,
        teacherId: true,
      },
    });

    if (!anchor) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    const updates = await Promise.all(
      body.updates.map((record: any) =>
        prisma.attendance.updateMany({
          where: {
            studentId: record.studentId,
            date: anchor.date,
            time: anchor.time,
            batchId: anchor.batchId,
            subjectId: anchor.subjectId,
            teacherId: anchor.teacherId,
          },
          data: {
            attendanceStatus: record.status,
          },
        })
      )
    );

    return NextResponse.json({ message: "Attendance updated", updates });
  } catch (err) {
    console.error("Error updating attendance:", err);
    return NextResponse.json(
      { error: "Failed to update attendance" },
      { status: 500 }
    );
  }
}
