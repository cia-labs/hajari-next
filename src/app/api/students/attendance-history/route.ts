import { getAuth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { userId } = getAuth(req);  

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const subjectId = url.searchParams.get("subjectId");
    const fromDate = url.searchParams.get("fromDate");
    const toDate = url.searchParams.get("toDate");
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const student = await prisma.student.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const filter: any = {
      studentId: student.id,
    };

    if (subjectId) filter.subjectId = subjectId;
    if (fromDate && toDate) filter.date = { gte: fromDate, lte: toDate };

    const total = await prisma.attendance.count({ where: filter });

    const records = await prisma.attendance.findMany({
      where: filter,
      orderBy: [
        { date: "desc" },
        { time: "desc" },
      ],
      skip,
      take: limit,
      include: {
        subject: { select: { name: true, id: true } },
        teacher: { select: { name: true } },
      },
    });

    return NextResponse.json({
      success: true,
      history: {
        records,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (err: any) {
    console.error("GET /students/attendance-history error:", err);
    return NextResponse.json(
      { error: "Internal Server Error", details: err.message },
      { status: 500 }
    );
  }
}
