import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type UpdateItem = {
  id?: string;
  sessionId?: string;
  studentId?: string;
  attendanceStatus: "present" | "absent" | "late";
};

export async function POST(req: NextRequest) {

  let body: { updates: UpdateItem[] };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid JSON" },
      { status: 400 }
    );
  }

  const { updates } = body;

  if (!Array.isArray(updates) || updates.length === 0) {
    return NextResponse.json(
      { success: false, message: "Non-empty updates[] required" },
      { status: 400 }
    );
  }

  const ops = updates.map((u) => {
    if (u.id) {
      return prisma.attendance.update({
        where: { id: u.id },
        data: { attendanceStatus: u.attendanceStatus },
      });
    }
    if (u.sessionId && u.studentId) {
      return prisma.attendance.updateMany({
        where: { sessionId: u.sessionId, studentId: u.studentId },
        data: { attendanceStatus: u.attendanceStatus },
      });
    }
    throw new Error(
      `Invalid update entry (needs id or sessionId+studentId): ${JSON.stringify(
        u
      )}`
    );
  });

  try {
    const results = await prisma.$transaction(ops);
    const modifiedCount = results.reduce(
      (sum, r: any) => sum + (r.count ?? 1),
      0
    );

    return NextResponse.json({ success: true, modifiedCount });
  } catch (err: any) {
    console.error("bulkUpdateAttendance ERROR:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Server error" },
      { status: 500 }
    );
  }
}
