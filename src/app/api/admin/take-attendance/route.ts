import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { v4 as uuid } from "uuid";
import { sendAbsenceNotification, AbsenceMailPayload } from "@/lib/email-util";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { adminClerkId, batchId, subjectId, date, time, students } = await req.json();

    // Verify the request is from the authenticated admin
    if (adminClerkId !== userId) {
      return NextResponse.json({ error: "Invalid admin ID" }, { status: 403 });
    }

    const admin = await prisma.user.findUnique({ where: { clerkId: adminClerkId } });
    if (!admin || admin.role !== "admin") {
      return NextResponse.json({ error: "Invalid or unauthorized admin" }, { status: 403 });
    }

    const sessionId = uuid();

    // Check for rejected attendance exceptions (students with rejected leave requests)
    const rejected = await prisma.attendanceException.findMany({
      where: { date, status: "rejected" },
      include: { student: true },
    });
    const lockedIds = new Set(rejected.map(r => r.studentId));

    // Create attendance records
    type AttendanceRow = {
      sessionId: string;
      teacherId: string;
      studentId: string;
      subjectId: string;
      batchId: string;
      date: string;
      time: string;
      attendanceStatus: string;
      isLocked: boolean;
    };

    const rows: AttendanceRow[] = students.map((s: { studentId: string; status: string }) => ({
      sessionId,
      teacherId: admin.id, // Admin takes attendance as a teacher
      studentId: s.studentId,
      subjectId,
      batchId,
      date,
      time,
      attendanceStatus: s.status,
      isLocked: lockedIds.has(s.studentId),
    }));
    
    await prisma.attendance.createMany({ data: rows });

    // Find absent students who don't have rejected leave requests
    const absentButOpen = rows.filter((r: AttendanceRow) => r.attendanceStatus === "absent" && !r.isLocked);

    // Send absence notifications
    const absentIds = absentButOpen.map((r: AttendanceRow) => r.studentId);
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
        date, 
        time
      };

      const ok = await sendAbsenceNotification(payload);
      if (ok) mailedCount++;
    }

    return NextResponse.json({
      success: true,
      sessionId,
      skippedCount: rows.filter((r: AttendanceRow) => r.isLocked).length,
      skippedNames: rejected.map(r => r.student.name),
      mailedCount,
    });
  } catch (err: unknown) {
    const error = err as { message?: string };
    console.error("Admin Attendance POST Error:", err);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}