import { prisma } from "@/lib/prisma";
import { isValidUUID } from "@/utils/validation";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
    _req: NextRequest,
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
        const deleted = await prisma.attendance.delete({
            where: { id: attendanceId },
        });

        return NextResponse.json(deleted, { status: 200 });
    } catch (error: any) {
        if (error.code === "P2025") {
            return NextResponse.json(
                { error: "Attendance record not found" },
                { status: 404 }
            );
        }

        console.error("Error deleting attendance:", error);
        return NextResponse.json(
            { error: "Failed to delete attendance", detail: error.message },
            { status: 500 }
        );
    }
}


