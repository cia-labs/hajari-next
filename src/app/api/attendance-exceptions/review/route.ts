import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!admin || admin.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admin only" }, { status: 403 });
    }

    const body = await req.json();
    const { id, status } = body;

    if (!["approved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }


    const exception = await prisma.attendanceException.findUnique({
      where: { id },
    });

    if (!exception) {
      return NextResponse.json({ error: "Exception not found" }, { status: 404 });
    }

    const now = new Date();


    const updated = await prisma.attendanceException.update({
      where: { id },
      data: {
        status,
        reviewedAt: now,
        reviewedById: admin.id,
      },
    });


    if (!exception.sessionId) {
      return NextResponse.json({ success: true, exception: updated });
    }


    if (status === "approved") {
      await prisma.attendance.updateMany({
        where: {
          sessionId: exception.sessionId,
          studentId: exception.studentId,
        },
        data: {
          attendanceStatus: "present",
          isLocked: true,
        },
      });
    }

    if (status === "rejected") {
      await prisma.attendance.updateMany({
        where: {
          sessionId: exception.sessionId,
          studentId: exception.studentId,
        },
        data: {
          attendanceStatus: "absent",
          isLocked: true,
        },
      });
    }

    return NextResponse.json({ success: true, exception: updated });
  } catch (err: any) {
    console.error("Review error:", err);
    return NextResponse.json(
      { error: "Failed to update exception", details: err.message },
      { status: 500 }
    );
  }
}
