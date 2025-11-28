import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const students = await prisma.student.findMany({
      orderBy: { usnNumber: "asc" },
      include: {
        batches: {
          include: {
            batch: true,
          },
        },
      },
    });

    const formattedStudents = students.map((student) => ({
      ...student,
      batches: student.batches.map((sb) => sb.batch),
    }));

    return NextResponse.json(formattedStudents);
  } catch (err) {
    console.error("GET /api/students/list error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
