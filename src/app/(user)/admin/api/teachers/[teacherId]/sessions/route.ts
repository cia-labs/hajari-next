import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { teacherId: string } }
) {
  const { teacherId } = params;
  if (!teacherId) {
    return NextResponse.json({ error: "teacherId is required" }, { status: 400 });
  }
  try {
    const sessions = await prisma.session.findMany({
      where: { teacherClerkId: teacherId },
      select: {
        sessionId: true,
        date: true,
        time: true,
        batch: { select: { id: true, name: true } },
        subject: { select: { id: true, name: true } }
      },
      orderBy: [{ date: "desc" }, { time: "desc" }],
    });
    return NextResponse.json({ sessions });
  } catch (err) {
    console.error("admin get sessions error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
