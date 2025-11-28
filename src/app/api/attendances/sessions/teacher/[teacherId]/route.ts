import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    req: NextRequest,
    { params }: { params: { teacherId: string } }
) {
    try {
        const { teacherId } = params;

        const teacher = await prisma.user.findUnique({
            where: { clerkId: teacherId },
        });

        if (!teacher) {
            return NextResponse.json(
                { error: "Teacher not found" },
                { status: 404 }
            );
        }

        const sessions = await prisma.attendance.findMany({
            where: {
                teacherId: teacher.id,
            },
            select: {
                sessionId: true,
                date: true,
                time: true,
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

        const uniqueSessionsMap = new Map();
        for (const session of sessions) {
            if (!uniqueSessionsMap.has(session.sessionId)) {
                uniqueSessionsMap.set(session.sessionId, {
                    sessionId: session.sessionId,
                    date: session.date,
                    time: session.time,
                    batch: session.batch,
                    subject: session.subject,
                });
            }
        }

        const uniqueSessions = Array.from(uniqueSessionsMap.values());

        return NextResponse.json({
            success: true,
            sessions: uniqueSessions,
        });
    } catch (err) {
        console.error("GET /api/attendance/sessions/teacher/[teacherId] error:", err);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
