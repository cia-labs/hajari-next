
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function GET(
  req: Request,
  { params }: { params: { batchId: string } }
) {
  const { batchId } = params;

  if (!batchId) {
    return NextResponse.json(
      { error: "batchId is required" },
      { status: 400 }
    );
  }

  try {
    const students = await prisma.student.findMany({
      where: {
        batches: {
          some: {
            batchId: batchId,
          },
        },
      },
      orderBy: {
        usnNumber: "asc",
      },
    });

    return NextResponse.json(students);
  } catch (error) {
    console.error("Error fetching students by batch:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
