import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    _req: NextRequest,
    { params }: { params: { sessionId: string } }
) {
    try {
        const { sessionId } = params;

        if (!sessionId) {
            return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
        }

        const attendanceRecords = await prisma.attendance.findMany({
            where: { sessionId },
            include: {
                student: {
                    select: {
                        id: true,
                        name: true,
                        usnNumber: true,
                    },
                },
                batch: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                subject: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        return NextResponse.json({
            success: true,
            attendanceRecords,
        });
    } catch (error) {
        console.error("GET /api/attendance/session/[sessionId] error:", error);
        return NextResponse.json(
            { error: "Failed to fetch attendance records" },
            { status: 500 }
        );
    }
}
