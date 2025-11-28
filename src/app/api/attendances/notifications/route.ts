import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const notifications = await prisma.absenceNotification.findMany({
            where: {
                notificationLevel: {
                    gte: 3,
                },
                notified: false,
            },
            include: {
                student: {
                    select: {
                        name: true,
                        email: true,
                        usnNumber: true, 
                    },
                },
            },
            orderBy: {
                lastAbsenceDate: "desc",
            },
        });

        const formatted = notifications.map((n) => ({
            studentName: n.student.name,
            studentEmail: n.student.email,
            studentUSN: n.student.usnNumber, 
            consecutiveDays: n.consecutiveDays,
            lastAbsenceDate: n.lastAbsenceDate,
        }));

        return NextResponse.json({ notifications: formatted });
    } catch (err) {
        console.error("Error fetching absence notifications:", err);
        return NextResponse.json(
            { error: "Failed to fetch notifications" },
            { status: 500 }
        );
    }
}
