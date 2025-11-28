
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        const {
            searchParams,
        } = new URL(req.url);

        const sessionId = searchParams.get("sessionId") || undefined;
        const teacherId = searchParams.get("teacher") || undefined;
        const studentId = searchParams.get("student") || undefined;
        const subjectId = searchParams.get("subject") || undefined;
        const batchId = searchParams.get("batch") || undefined;
        const date = searchParams.get("date") || undefined;
        const time = searchParams.get("time") || undefined;
        const attendanceStatus = searchParams.get("attendanceStatus") || undefined;

        const where: any = {};

        if (sessionId) where.sessionId = sessionId;
        if (teacherId) where.teacherId = teacherId;
        if (studentId) where.studentId = studentId;
        if (subjectId) where.subjectId = subjectId;
        if (batchId) where.batchId = batchId;
        if (date) where.date = date;
        if (time) where.time = time;
        if (attendanceStatus) where.attendanceStatus = attendanceStatus;

        const attendanceRecords = await prisma.attendance.findMany({
            where,
            include: {
                teacher: true,
                student: true,
                subject: true,
                batch: true,
            },
            orderBy: {
                date: "desc",
            },
        });

        return NextResponse.json(attendanceRecords);
    } catch (error) {
        console.error("Error fetching attendance list:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}


