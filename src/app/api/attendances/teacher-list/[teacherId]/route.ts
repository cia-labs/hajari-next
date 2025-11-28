
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    _req: Request,
    { params }: { params: { teacherId: string } }
) {
    try {
        const { teacherId } = params;

        if (!teacherId) {
            return NextResponse.json({ error: "Teacher ID not provided" }, { status: 400 });
        }

        const records = await prisma.attendance.findMany({
            where: { teacherId },
            select: {
                sessionId: true,
                date: true,
                time: true,
                batch: {
                    select: { id: true, name: true },
                },
                subject: {
                    select: { id: true, name: true },
                },
            },
        });

        const sessionMap = new Map<string, any>();

        for (const record of records) {
            if (!sessionMap.has(record.sessionId)) {
                sessionMap.set(record.sessionId, {
                    sessionId: record.sessionId,
                    date: record.date,
                    time: record.time,
                    batch: record.batch,
                    subject: record.subject,
                });
            }
        }

        const uniqueSessions = Array.from(sessionMap.values());

        return NextResponse.json({
            success: true,
            count: uniqueSessions.length,
            data: uniqueSessions,
        });
    } catch (error) {
        console.error("Error in teacherList:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}



