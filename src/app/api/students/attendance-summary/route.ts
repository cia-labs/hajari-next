import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const student = await prisma.student.findUnique({
      where: { clerkId: userId },
    });
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }


    const allRecords = await prisma.attendance.findMany({
      where: { studentId: student.id },
      select: { subjectId: true, attendanceStatus: true },
    });


    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);

    const recentRecords = await prisma.attendance.findMany({
      where: {
        studentId: student.id,
        createdAt: { gte: cutoff },
      },
      select: { subjectId: true, attendanceStatus: true },
    });


    function buildMap(records: { subjectId: string | null; attendanceStatus: string }[]) {
      const m = new Map<string, { present: number; total: number }>();
      for (const r of records) {
        if (!r.subjectId) continue;
        const stats = m.get(r.subjectId) || { present: 0, total: 0 };
        stats.total++;
        if (r.attendanceStatus === "present") stats.present++;
        m.set(r.subjectId, stats);
      }
      return m;
    }

    const allMap = buildMap(allRecords);
    const recentMap = buildMap(recentRecords);


    async function mapToSummaries(
      subjectMap: Map<string, { present: number; total: number }>
    ) {
      return Promise.all(
        Array.from(subjectMap.entries()).map(async ([subjectId, stats]) => {
          const subj = await prisma.subject.findUnique({ where: { id: subjectId } });
          const percentage = stats.total
            ? Math.round((stats.present / stats.total) * 1000) / 10
            : 0;
          return {
            subjectId,
            subjectName: subj?.name || "Unknown",
            stats: {
              present: stats.present,
              absent: stats.total - stats.present,
              total: stats.total,
              percentage,
            },
          };
        })
      );
    }

    const [allSubjects, recentSubjects] = await Promise.all([
      mapToSummaries(allMap),
      mapToSummaries(recentMap),
    ]);


    const overallPresent = allMap.size
      ? Array.from(allMap.values()).reduce((sum, s) => sum + s.present, 0)
      : 0;
    const overallTotal = allRecords.length;
    const overallPercentage = overallTotal
      ? Math.round((overallPresent / overallTotal) * 1000) / 10
      : 0;

    return NextResponse.json({
      success: true,
      summary: {
        overallAttendance: {
          present: overallPresent,
          total: overallTotal,
          percentage: overallPercentage,
        },
        subjects: allSubjects,          
        recentSubjects: recentSubjects, 
      },
    });
  } catch (err) {
    console.error("Error fetching attendance summary:", err);
    return NextResponse.json(
      { error: "Internal Server Error", details: err instanceof Error ? err.message : err },
      { status: 500 }
    );
  }
}
