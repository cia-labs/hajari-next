import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidUUID } from "@/utils/validation";
import type { RouteContext } from "next";

export async function GET(
  _req: NextRequest,
  context: RouteContext<{ studentId: string }>
) {
  const { studentId } = context.params;

  if (!isValidUUID(studentId)) {
    return NextResponse.json(
      { error: "Invalid student ID format" },
      { status: 400 }
    );
  }

  try {
    const attendanceRecords = await prisma.attendance.findMany({
      where: { studentId },
      orderBy: { date: "desc" },
      select: {

        id: true,
        sessionId: true,
        studentId: true,

        date: true,
        time: true,
        attendanceStatus: true,
        subject: { select: { name: true } },
        teacher: { select: { name: true } },
      },
    });

    if (!attendanceRecords.length) {
      return NextResponse.json(
        { error: "Attendance not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(attendanceRecords);
  } catch (err) {
    console.error("Error fetching attendance:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
