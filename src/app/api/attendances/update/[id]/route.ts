import { prisma } from "@/lib/prisma";
import { isValidUUID } from "@/utils/validation"; 
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const attendanceId = params.id;

    if (!isValidUUID(attendanceId)) {
        return NextResponse.json(
            { error: "Invalid attendance ID format" },
            { status: 400 }
        );
    }

    try {
        const body = await req.json();

        const updatedAttendance = await prisma.attendance.update({
            where: { id: attendanceId },
            data: {
                ...body,
                updatedAt: new Date(), 
            },
        });

        return NextResponse.json(updatedAttendance, { status: 200 });
    } catch (error: any) {
        if (error.code === "P2025") {
            return NextResponse.json(
                { error: "Attendance record not found" },
                { status: 404 }
            );
        }

        console.error("Error updating attendance:", error);
        return NextResponse.json(
            { error: "Failed to update attendance", detail: error.message },
            { status: 500 }
        );
    }
}
