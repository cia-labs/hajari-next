import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { isValidUUID } from "@/utils/validation";
import type { RouteContext } from "next";

export async function GET(
  _req: NextRequest,
  context: RouteContext<{ id: string }>
) {
  const { id } = context.params; 
  
  if (!isValidUUID(id)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  try {
    const student = await prisma.student.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, usnNumber: true },
    });

    if (!student) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(student);
  } catch (err) {
    console.error("GET /api/students/[id] error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
