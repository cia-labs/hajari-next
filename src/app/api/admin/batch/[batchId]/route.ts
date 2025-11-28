import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: NextRequest, { params }: { params: { batchId: string } }) {
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

    const { batchId } = params;

    // Get batch with students and subjects
    const batch = await prisma.batch.findUnique({
      where: { id: batchId },
      include: {
        students: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                usnNumber: true,
              }
            }
          }
        },
        subjects: {
          include: {
            subject: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        }
      }
    });

    if (!batch) {
      return NextResponse.json({ error: "Batch not found" }, { status: 404 });
    }

    // Transform the data to match the expected format
    const transformedBatch = {
      ...batch,
      students: batch.students.map(sb => sb.student).sort((a, b) => a.name.localeCompare(b.name)),
      subjects: batch.subjects.map(sb => sb.subject).sort((a, b) => a.name.localeCompare(b.name))
    };

    return NextResponse.json(transformedBatch);
  } catch (error) {
    console.error("Admin batch details GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}