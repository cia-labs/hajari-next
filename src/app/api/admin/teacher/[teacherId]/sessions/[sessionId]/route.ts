import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { teacherId: string; sessionId: string } }
) {
  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { sessionId } = params!;
  const records = await prisma.attendance.findMany({
    where: { sessionId },
    include: {
      student: { select: { id: true, name: true } },
      batch:   { select: { name: true } },
      subject: { select: { name: true } },
    },
  });

  return NextResponse.json({
    session: {
      sessionId,
      date: records[0]?.date,
      time: records[0]?.time,
      batch: records[0]?.batch,
      subject: records[0]?.subject,
    },
    records,
  });
}
