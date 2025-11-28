import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { v4 as uuid } from "uuid";
import { sendAbsenceNotification, AbsenceMailPayload } from "@/lib/email-util";

export async function POST(req: NextRequest) {
  try {
    const { teacherClerkId, batchId, subjectId, date, time, students } = await req.json();
    const sessionId = uuid();


    const teacher = await prisma.user.findUnique({ where: { clerkId: teacherClerkId } });
    if (!teacher || teacher.role !== "teacher") {
      return NextResponse.json({ error: "Invalid or unauthorized teacher" }, { status: 403 });
    }

    const rejected = await prisma.attendanceException.findMany({
      where: { date, status: "rejected" },
      include: { student: true },
    });
    const lockedIds = new Set(rejected.map(r => r.studentId));


    const rows = students.map((s: any) => ({
      sessionId,
      teacherId: teacher.id,
      studentId: s.studentId,
      subjectId,
      batchId,
      date,
      time,
      attendanceStatus: s.status,
      isLocked: lockedIds.has(s.studentId),
    }));
    await prisma.attendance.createMany({ data: rows });


    const absentButOpen = rows.filter(r => r.attendanceStatus === "absent" && !r.isLocked);


    const absentIds = absentButOpen.map(r => r.studentId);
    const [studs, subj] = await Promise.all([
      prisma.student.findMany({
        where: { id: { in: absentIds } },
        select: {
          id: true,
          name: true,
          email: true,
          parentEmail: true,
        },
      }),

      prisma.subject.findUnique({ where: { id: subjectId }, select: { name: true } })
    ]);


    let mailedCount = 0;
    const subjectName = subj?.name ?? "Class";
    for (const r of absentButOpen) {
      const s = studs.find(x => x.id === r.studentId);
      if (!s) continue;
      const payload: AbsenceMailPayload = {
        studentEmail: s.email,
        parentEmail: s.parentEmail ?? undefined,
        studentName: s.name,
        subjectName,
        date, time
      };

      const ok = await sendAbsenceNotification(payload);
      if (ok) mailedCount++;
    }


    return NextResponse.json({
      success: true,
      sessionId,
      skippedCount: rows.filter(r => r.isLocked).length,
      skippedNames: rejected.map(r => r.student.name),
      mailedCount,
    });
  } catch (err: any) {
    console.error("Attendance POST Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
