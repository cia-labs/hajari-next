import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { clerkClient } from "@clerk/clerk-sdk-node";

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;

  if (!id) {
    return NextResponse.json({ error: "Student ID missing" }, { status: 400 });
  }

  try {
    const student = await prisma.student.findUnique({ where: { id } });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    if (student.clerkId) {
      try {
        await clerkClient.users.deleteUser(student.clerkId);
      } catch (err) {
        console.warn("Clerk deletion failed:", err);
      }
    }

    await prisma.attendance.deleteMany({
      where: { studentId: id },
    });

    await prisma.absenceNotification.deleteMany({
      where: { studentId: id },
    });

    await prisma.studentBatch.deleteMany({
      where: { studentId: id },
    });

    await prisma.student.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Student deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/students/remove/[id] error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
