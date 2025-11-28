import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
    teacherId: string;
}

export async function GET(
    req: Request,
    { params }: { params: Params }
) {
    try {
        const { teacherId } = params;
        const { searchParams } = new URL(req.url);

        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const subjectFilter = searchParams.get("subject")?.toLowerCase() || "";
        const dateFilter = searchParams.get("date") || "";

        if (!teacherId) {
            return NextResponse.json(
                { error: "Teacher ID is required" },
                { status: 400 }
            );
        }

        const teacher = await prisma.user.findUnique({
            where: { clerkId: teacherId },
        });

        if (!teacher) {
            return NextResponse.json(
                { error: "Teacher not found" },
                { status: 404 }
            );
        }

        const baseWhere = {
            teacherId: teacher.id,
            ...(dateFilter ? { date: dateFilter } : {}),
        };

        const allSessions = await prisma.attendance.findMany({
            where: baseWhere,
            select: {
                sessionId: true,
                date: true,
                time: true,
                subject: {
                    select: { id: true, name: true },
                },
                batch: {
                    select: { id: true, name: true },
                },
            },
        });

        const sessionMap = new Map<string, any>();

        for (const session of allSessions) {
            const subjectName = session.subject?.name || "";

            if (
                subjectFilter &&
                !subjectName.toLowerCase().includes(subjectFilter)
            ) {
                continue;
            }

            if (!sessionMap.has(session.sessionId)) {
                sessionMap.set(session.sessionId, {
                    sessionId: session.sessionId,
                    date: session.date,
                    time: session.time,
                    batch: session.batch,
                    subject: session.subject,
                });
            }
        }

        const all = Array.from(sessionMap.values());
        const total = all.length;
        const totalPages = Math.ceil(total / limit);
        const paginated = all.slice((page - 1) * limit, page * limit);

        return NextResponse.json({
            success: true,
            total,
            currentPage: page,
            totalPages,
            sessions: paginated,
        });
    } catch (err: any) {
        console.error("GET /api/attendance/teacher-sessions-alt error:", err);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
