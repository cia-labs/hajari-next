import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { teacherId: string } }
) {
  const { teacherId } = params;
  const url = req.nextUrl;
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const limit = parseInt(url.searchParams.get("limit") || "10", 10);
  const subjectFilter = url.searchParams.get("subject")?.trim() || "";
  const dateFilter = url.searchParams.get("date")?.trim() || "";

  if (!teacherId) {
    return NextResponse.json(
      { error: "Missing teacherId parameter" },
      { status: 400 }
    );
  }

  try {
    const where: any = { teacherId };

    if (dateFilter) {
      where.date = dateFilter;
    }

    if (subjectFilter) {
      where.subject = {
        name: { contains: subjectFilter, mode: "insensitive" },
      };
    }

    const grouped = await prisma.attendance.groupBy({
      where,
      by: ["date", "time", "batchId", "subjectId"],
      _min: { sessionId: true },
      _count: { studentId: true },
      orderBy: { date: "desc" },
    });

    const batchIds = grouped.map((g) => g.batchId).filter(Boolean);
    const subjectIds = grouped.map((g) => g.subjectId).filter(Boolean);

    const [batches, subjects] = await Promise.all([
      prisma.batch.findMany({
        where: { id: { in: batchIds } },
        select: { id: true, name: true },
      }),
      prisma.subject.findMany({
        where: { id: { in: subjectIds } },
        select: { id: true, name: true },
      }),
    ]);

    const batchMap = new Map(batches.map((b) => [b.id, b.name]));
    const subjectMap = new Map(subjects.map((s) => [s.id, s.name]));

    const sessions = grouped.map((row) => ({
      sessionId: row._min.sessionId,
      date: row.date,
      time: row.time,
      batchId: row.batchId,
      subjectId: row.subjectId,
      batch: { name: batchMap.get(row.batchId) ?? "Unknown Batch" },
      subject: { name: subjectMap.get(row.subjectId) ?? "Unknown Subject" },
      studentCount: row._count.studentId,
    }));

    const total = sessions.length;
    const totalPages = Math.ceil(total / limit);
    const paginated = sessions.slice((page - 1) * limit, page * limit);

    return NextResponse.json({
      success: true,
      total,
      totalPages,
      currentPage: page,
      sessions: paginated,
    });
  } catch (error: any) {
    console.error("getSessionsByTeacher error:", error);
    return NextResponse.json(
      { error: "Server error fetching sessions" },
      { status: 500 }
    );
  }
}
