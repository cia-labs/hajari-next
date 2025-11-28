import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { teacherId: string } }
) {
  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { teacherId } = params!;
  const rows = await prisma.attendance.findMany({
    where: { teacherId },
    orderBy: [{ date: "desc" }, { time: "desc" }],
    include: {
      batch: { select: { name: true } },
      subject: { select: { name: true } },
    },
  });

  const map = new Map<string, any>();
  rows.forEach((r) => {
    if (!map.has(r.sessionId)) {
      map.set(r.sessionId, {
        sessionId: r.sessionId,
        date: r.date,
        time: r.time,
        batch: r.batch,
        subject: r.subject,
      });
    }
  });

  return NextResponse.json({ sessions: Array.from(map.values()) });
}
