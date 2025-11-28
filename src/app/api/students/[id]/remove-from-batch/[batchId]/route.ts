import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { isValidUUID } from "@/utils/validation";

type RouteContext = {
  params: Promise<{ id: string; batchId: string }>;
};

export async function DELETE(_req: NextRequest, context: RouteContext) {
  const { id: studentId, batchId } = await context.params;

  // Validate UUIDs
  if (!isValidUUID(studentId)) {
    return NextResponse.json(
      { error: "Invalid student ID" },
      { status: 400 }
    );
  }

  if (!isValidUUID(batchId)) {
    return NextResponse.json({ error: "Invalid batch ID" }, { status: 400 });
  }

  try {
    // Check if student exists
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    // Check if batch exists
    const batch = await prisma.batch.findUnique({
      where: { id: batchId },
    });

    if (!batch) {
      return NextResponse.json({ error: "Batch not found" }, { status: 404 });
    }

    // Check if student is in the batch
    const studentBatch = await prisma.studentBatch.findFirst({
      where: {
        studentId: studentId,
        batchId: batchId,
      },
    });

    if (!studentBatch) {
      return NextResponse.json(
        { error: "Student is not enrolled in this batch" },
        { status: 400 }
      );
    }

    // Remove student from batch by deleting the StudentBatch record
    await prisma.studentBatch.delete({
      where: {
        id: studentBatch.id,
      },
    });

    return NextResponse.json(
      {
        message: "Student removed from batch successfully",
        studentId,
        batchId,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error(
      "DELETE /api/students/[id]/remove-from-batch/[batchId] error:",
      err
    );
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
