import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function calculatePercentage(present: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((present / total) * 1000) / 10;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;
    const searchQuery = searchParams.get("searchQuery") || undefined;

    const studentWhere: any = {};
    if (searchQuery) {
      studentWhere.OR = [
        { name: { contains: searchQuery, mode: "insensitive" } },
        { usnNumber: { contains: searchQuery, mode: "insensitive" } },
        { email: { contains: searchQuery, mode: "insensitive" } },
      ];
    }
    const total = await prisma.student.count({ where: studentWhere });
    const students = await prisma.student.findMany({
      where: studentWhere,
      orderBy: [
        { usnNumber: "desc" }, 
        { name: "asc" },       
      ],
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        name: true,
        usnNumber: true,
        email: true,
      },
    });


    const attendanceWhere: any = {};
    if (startDate && endDate) {
      attendanceWhere.date = {
        gte: startDate,
        lte: endDate,
      };
    }
    attendanceWhere.studentId = { in: students.map((s) => s.id) };

    const attendance = await prisma.attendance.findMany({
      where: attendanceWhere,
      select: {
        studentId: true,
        subject: { select: { name: true } },
        attendanceStatus: true,
      },
    });

    const summary: Record<string, any> = {};
    for (const student of students) {
      summary[student.id] = {
        name: student.name,
        usnNumber: student.usnNumber,
        email: student.email,
        subjects: {},
      };
    }
    for (const record of attendance) {
      const studentId = record.studentId;
      const subjectName = record.subject?.name || "Unknown";
      if (!summary[studentId].subjects[subjectName]) {
        summary[studentId].subjects[subjectName] = { total: 0, present: 0 };
      }
      summary[studentId].subjects[subjectName].total += 1;
      if (record.attendanceStatus === "present") {
        summary[studentId].subjects[subjectName].present += 1;
      }
    }

    const result = Object.values(summary).map((student: any) => {
      const subjects = Object.entries(student.subjects).map(
        ([subjectName, stats]: [string, any]) => {
          return [
            subjectName,
            {
              stats: {
                total: stats.total,
                present: stats.present,
                percentage: calculatePercentage(stats.present, stats.total),
              },
            },
          ];
        }
      );
      return {
        name: student.name,
        usnNumber: student.usnNumber,
        email: student.email,
        subjects: Object.fromEntries(subjects),
      };
    });

       return NextResponse.json(
      {
        attendance: result,
        pagination: {
          total,
          pages: Math.ceil(total / limit),
          currentPage: page,
          limit,
        },
      },
      {
        headers: {
          "Cache-Control": "public, max-age=120, stale-while-revalidate=60",
        },
      }
    );
  } catch (err) {
    console.error("Failed to get master attendance report:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
