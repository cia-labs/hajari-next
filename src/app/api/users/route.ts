import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { teacherId: string } }
) {
  const { sessionClaims } = getAuth(req);
  if (sessionClaims?.publicMetadata?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { teacherId } = params;
  if (!teacherId) {
    return NextResponse.json(
      { error: "teacherId is required" },
      { status: 400 }
    );
  }

  try {

    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
      select: {
        id: true,
        name: true,
        email: true,
        employeeId: true,
      },
    });

    if (!teacher) {
      return NextResponse.json(
        { error: "Teacher not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(teacher);
  } catch (err) {
    console.error("GET /api/admin/teacher/[teacherId] error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
