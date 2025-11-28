import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    req: Request,
    { params }: { params: { teacherId: string } }
) {
    try {
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1", 10);
        const limit = parseInt(searchParams.get("limit") || "10", 10);
        const subject = (searchParams.get("subject") || "").toLowerCase();
        const date = searchParams.get("date") || "";

        const skip = (page - 1) * limit;

        const teacher = await prisma.user.findUnique({
            where: { clerkId: params.teacherId },
        });

        if (!teacher) {
            return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
        }

        const filters: any = {
            teacherId: teacher.id,
        };

        if (date) filters.date = date;

        const sessions = await prisma.attendance.groupBy({
            by: ["sessionId"],
            where: filters,
            _min: { date: true, time: true },
            _max: { date: true, time: true },
        });

        const sessionIds = sessions.map((s) => s.sessionId);

        const sessionData = await Promise.all(
            sessionIds.map(async (sessionId) => {
                const records = await prisma.attendance.findFirst({
                    where: { sessionId },
                    include: {
                        subject: true,
                        batch: true,
                    },
                });

                if (!records) return null;

                return {
                    sessionId: records.sessionId,
                    date: records.date,
                    time: records.time,
                    batch: {
                        id: records.batch?.id,
                        name: records.batch?.name,
                    },
                    subject: {
                        id: records.subject?.id,
                        name: records.subject?.name,
                    },
                };
            })
        );

        let filteredSessions = sessionData.filter(Boolean);

        if (subject) {
            filteredSessions = filteredSessions.filter((s) =>
                s?.subject?.name.toLowerCase().includes(subject)
            );
        }

        const total = filteredSessions.length;
        const paginated = filteredSessions.slice(skip, skip + limit);

        return NextResponse.json({
            success: true,
            total,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            sessions: paginated,
        });
    } catch (error) {
        console.error("Error fetching paginated teacher sessions:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}