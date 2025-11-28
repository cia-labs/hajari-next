import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user is admin
    const user = await prisma.user.findUnique({ 
      where: { clerkId: userId },
      select: { role: true }
    });
    
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    // Get all batches for admin
    const batches = await prisma.batch.findMany({
      select: {
        id: true,
        name: true,
        createdAt: true,
        _count: {
          select: {
            students: true
          }
        },
        subjects: {
          include: {
            subject: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Transform the data to include subject info and student count
    const enrichedBatches = batches.map(batch => ({
      id: batch.id,
      name: batch.name,
      createdAt: batch.createdAt,
      studentCount: batch._count.students,
      subjects: batch.subjects.map(sb => sb.subject)
    }));

    return NextResponse.json(enrichedBatches);
  } catch (error) {
    console.error("Admin batches GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}