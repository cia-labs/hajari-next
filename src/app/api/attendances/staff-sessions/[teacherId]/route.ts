import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    req: Request,
    { params }: { params: { teacherId: string } }
) {
    try {
        const { teacherId } = params;
        const { searchParams } = new URL(req.url);
        const subject = searchParams.get("subject")?.toLowerCase() || "";
        const date = searchParams.get("date") || "";
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const skip = (page - 1) * limit;

        const teacher = await prisma.user.findUnique({
            where: { clerkId: teacherId },
            select: { id: true },
        });

        if (!teacher) {
            return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
        }

        const whereClause: any = {
            teacherId: teacher.id,
        };

        if (date) whereClause.date = date;

        const allSessions = await prisma.attendance.findMany({
            where: whereClause,
            include: {
                subject: true,
                batch: true,
            },
        });

        const filtered = subject
            ? allSessions.filter((s) =>
                s.subject?.name?.toLowerCase().includes(subject)
            )
            : allSessions;

        const sessionMap = new Map();

        for (const record of filtered) {
            if (!record.sessionId) continue;

            if (!sessionMap.has(record.sessionId)) {
                sessionMap.set(record.sessionId, {
                    sessionId: record.sessionId,
                    date: record.date,
                    time: record.time,
                    batch: record.batch?.name || "Unknown",
                    subject: record.subject?.name || "Unknown",
                });
            }
        }

        const allMapped = Array.from(sessionMap.values());
        const paginated = allMapped.slice(skip, skip + limit);

        return NextResponse.json({
            success: true,
            data: {
                sessions: paginated,
                pagination: {
                    total: allMapped.length,
                    currentPage: page,
                    totalPages: Math.ceil(allMapped.length / limit),
                    perPage: limit,
                },
            },
        });
    } catch (err: any) {
        console.error("Error in staffSessions:", err);
        return NextResponse.json(
            { success: false, error: "Failed to fetch sessions", message: err.message },
            { status: 500 }
        );
    }
}