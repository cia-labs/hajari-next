
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Parser } from "json2csv";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const sessionId = searchParams.get("sessionId") || undefined;
        const teacherId = searchParams.get("teacherId") || undefined;
        const subjectId = searchParams.get("subjectId") || undefined;

        const where: any = {};
        if (sessionId) where.sessionId = sessionId;
        if (teacherId) where.teacherId = teacherId;
        if (subjectId) where.subjectId = subjectId;

        const attendanceRecords = await prisma.attendance.findMany({
            where,
            include: {
                student: true,
                subject: true,
                batch: true,
                teacher: true,
            },
        });

        if (!attendanceRecords.length) {
            return NextResponse.json(
                { success: false, message: "No attendance records found" },
                { status: 404 }
            );
        }

        const records = attendanceRecords.map((record) => ({
            Date: record.date ?? "N/A",
            Time: record.time ?? "N/A",
            "Student Name": record.student?.name || "Unknown",
            "USN Number": record.student?.usnNumber || "N/A",
            Subject: record.subject?.name || "Unknown",
            Batch: record.batch?.name || "Unknown",
            Teacher: record.teacher?.name || "Unknown",
            Status: record.attendanceStatus,
        }));

        const parser = new Parser({ fields: Object.keys(records[0]) });
        const csv = parser.parse(records);

        const filename = `attendance_report_${new Date()
            .toISOString()
            .split("T")[0]}.csv`;

        return new NextResponse(csv, {
            status: 200,
            headers: {
                "Content-Type": "text/csv",
                "Content-Disposition": `attachment; filename=${filename}`,
            },
        });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                message: "Failed to generate report",
                error: (error as Error).message,
            },
            { status: 500 }
        );
    }
}
