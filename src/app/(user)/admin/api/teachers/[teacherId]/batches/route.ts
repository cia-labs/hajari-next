import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  context: { params: Promise<{ teacherId: string }> }
) {
  const { teacherId } = await context.params;

  if (!teacherId) {
    return NextResponse.json(
      { error: "teacherId is required" },
      { status: 400 }
    );
  }

  try {
    const batches = await prisma.batch.findMany({
      where: {
        subjects: {
          some: {
            subject: {
              teacherId: teacherId,
            },
          },
        },
      },
      select: {
        id: true,
        name: true,
      },
    });

    return NextResponse.json(batches);
  } catch (err) {
    console.error("Error fetching batches for teacher", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
