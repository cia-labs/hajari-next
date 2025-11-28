import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: { batchId: string } }
) {
  try {
    const { batchId } = params;

    if (!batchId) {
      return NextResponse.json({ error: "Batch ID not provided" }, { status: 400 });
    }

    const subjectBatchLinks = await prisma.subjectBatch.findMany({
      where: { batchId },
      include: {
        subject: true,
      },
    });

    const subjects = subjectBatchLinks.map((sb) => sb.subject);

    return NextResponse.json(subjects);
  } catch (err) {
    console.error("GET /api/subjects/list-batch-wise/[batchId] error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
