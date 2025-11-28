import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const [
      studentCount,
      teacherCount,
      batchCount,
      totalAttendanceRecords,
      presentCount,
    ] = await Promise.all([
      prisma.student.count({ where: { active: true } }),
      prisma.user.count({ where: { role: "teacher" } }),
      prisma.batch.count({ where: { isDisabled: false } }),
      prisma.attendance.count(),
      prisma.attendance.count({ where: { attendanceStatus: "present" } }),
    ]);

    const attendanceRate =
      totalAttendanceRecords === 0
        ? 0
        : parseFloat(((presentCount / totalAttendanceRecords) * 100).toFixed(2));

    return NextResponse.json({
      studentCount,
      teacherCount,
      batchCount,
      attendanceRate,
    });
  } catch (error) {
    console.error("ADMIN_STATS_API_ERROR:", error);
    return NextResponse.json(
      { error: "Failed to fetch admin stats" },
      { status: 500 }
    );
  }
}
