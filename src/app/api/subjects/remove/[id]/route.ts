import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidUUID } from "@/utils/validation";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function DELETE(_req: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    // Validate UUID
    if (!isValidUUID(id)) {
      return NextResponse.json({ error: "Invalid subject ID" }, { status: 400 });
    }

    // Check if subject exists
    const subject = await prisma.subject.findUnique({
      where: { id },
      include: {
        batches: true,
        teachers: true,
        attendances: true,
      },
    });

    if (!subject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    // Delete all related records in a transaction
    await prisma.$transaction([
      // Delete SubjectBatch records
      prisma.subjectBatch.deleteMany({
        where: { subjectId: id },
      }),

      // Delete SubjectTeacher records
      prisma.subjectTeacher.deleteMany({
        where: { subjectId: id },
      }),

      // Update Attendance records to remove subject reference
      // (Set subjectId to null instead of deleting attendance records)
      prisma.attendance.updateMany({
        where: { subjectId: id },
        data: { subjectId: null },
      }),

      // Finally, delete the subject
      prisma.subject.delete({
        where: { id },
      }),
    ]);

    return NextResponse.json({
      message: "Subject deleted successfully",
      id,
    });
  } catch (err) {
    const error = err as { code?: string; message?: string };
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }
    console.error("Error deleting subject:", err);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
