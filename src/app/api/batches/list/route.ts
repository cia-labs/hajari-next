import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const batches = await prisma.batch.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { students: true } },
        subjects: {                                
          include: {
            subject: { select: { id: true, name: true } },
          },
        },
      },
    });

    const result = batches.map((b) => ({
      id: b.id,
      name: b.name,
      startDate: b.startDate,
      endDate: b.endDate,
      createdAt: b.createdAt,
      _count: b._count,
      subjects: b.subjects.map((sb) => sb.subject),
    }));

    return NextResponse.json(result);
  } catch (err) {
    console.error("GET /api/batches/list error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
