import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const teachers = await prisma.user.findMany({
            where: { role: "teacher" },
            select: { id: true, name: true },
        });

        const teacherAttendance = [];

        for (const teacher of teachers) {
            const sessions = await prisma.attendance.findMany({
                where: { teacherId: teacher.id },
                select: {
                    sessionId: true,
                    date: true,
                    time: true,
                    batch: { select: { name: true } },
                    subject: { select: { name: true } },
                },
            });

            const uniqueSessionsMap = new Map();

            sessions.forEach((session) => {
                if (!uniqueSessionsMap.has(session.sessionId)) {
                    uniqueSessionsMap.set(session.sessionId, {
                        sessionId: session.sessionId,
                        date: session.date,
                        time: session.time,
                        batch: session.batch?.name || "Unknown Batch",
                        subject: session.subject?.name || "Unknown Subject",
                    });
                }
            });

            teacherAttendance.push({
                teacherId: teacher.id,
                teacherName: teacher.name,
                sessions: Array.from(uniqueSessionsMap.values()),
            });
        }

        return NextResponse.json({
            success: true,
            teacherAttendance,
        });
    } catch (err) {
        console.error("Error in adminGetTeacherAttendance:", err);
        return NextResponse.json(
            { error: "Failed to fetch teacher attendance" },
            { status: 500 }
        );
    }
}
