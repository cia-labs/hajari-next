import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { sendAbsenceNotification } from "@/lib/email-util";

const AttendanceUpdateSchema = z.object({
    sessionId: z.string(),
    updates: z.array(
        z.object({
            studentId: z.string(),
            attendanceStatus: z.enum(["present", "absent"]),
        })
    ),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const parsed = AttendanceUpdateSchema.parse(body);
        const { sessionId, updates } = parsed;

        if (!sessionId || updates.length === 0) {
            return NextResponse.json(
                { success: false, message: "Invalid request data" },
                { status: 400 }
            );
        }

        const session = await prisma.attendance.findFirst({
            where: { sessionId },
            include: { subject: true },
        });

        if (!session) {
            return NextResponse.json(
                { success: false, message: "Session not found" },
                { status: 404 }
            );
        }

        const updateOperations = updates.map((update) =>
            prisma.attendance.updateMany({
                where: {
                    sessionId,
                    studentId: update.studentId,
                },
                data: {
                    attendanceStatus: update.attendanceStatus,
                    updatedAt: new Date(),
                },
            })
        );

        const newlyAbsentStudentIds = updates
            .filter((u) => u.attendanceStatus === "absent")
            .map((u) => u.studentId);

        await Promise.all(updateOperations);

        if (newlyAbsentStudentIds.length > 0 && session.subject) {
            const students = await prisma.student.findMany({
                where: { id: { in: newlyAbsentStudentIds } },
                select: { email: true, name: true },
            });

            await Promise.all(
                students.map((student) =>
                    sendAbsenceNotification(
                        student.email,
                        student.name,
                        session.subject?.name,
                        session.date,
                        session.time
                    )
                )
            );

            await Promise.all(
                newlyAbsentStudentIds.map((studentId) =>
                    prisma.absenceNotification.upsert({
                        where: { studentId },
                        update: {
                            consecutiveDays: { increment: 1 },
                            lastAbsenceDate: new Date(session.date),
                            notified: false,
                        },
                        create: {
                            studentId,
                            consecutiveDays: 1,
                            lastAbsenceDate: new Date(session.date),
                            notified: false,
                        },
                    })
                )
            );
        }

        return NextResponse.json({
            success: true,
            message: "Attendance updated successfully",
        });
    } catch (err) {
        console.error("bulkUpdateAttendance error:", err);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to update attendance",
                error: err instanceof Error ? err.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
