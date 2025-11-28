import { NextResponse } from "next/server";
import { getAuth  } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { userId } = getAuth (req);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const student = await prisma.student.findUnique({
      where: { clerkId: userId },
      include: {
        batches: {
          include: {
            batch: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const formattedBatches = student.batches.map((sb) => sb.batch);

    return NextResponse.json({
      success: true,
      student: {
        ...student,
        batches: formattedBatches,
      },
    });
  } catch (err) {
    console.error("Error fetching student profile:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
