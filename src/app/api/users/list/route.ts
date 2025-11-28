
import { clerkClient } from "@clerk/clerk-sdk-node";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    
    const users = await prisma.user.findMany({
      where: {
        role: {
          not: "admin",
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        employeeId: true,
        role: true,
        clerkId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(users);
  } catch (err) {
    console.error("GET /api/users/list error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
