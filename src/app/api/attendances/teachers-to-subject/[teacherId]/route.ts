import { prisma } from "@/lib/prisma";
import { isValidUUID } from "@/utils/validation";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    _req: NextRequest,
    { params }: { params: { teacherId: string } }
) {
    const { teacherId } = params;

    if (!isValidUUID(teacherId)) {
        return NextResponse.json({ error: "Invalid teacher ID" }, { status: 400 });
    }

    try {
        const teacher = await prisma.user.findUnique({
            where: { id: teacherId },
        });

        if (!teacher) {
            return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
        }

        const attendances = await prisma.attendance.findMany({
            where: { teacherId },
            include: { subject: true },
        });

        const subjectSet = new Set<string>();
        for (const record of attendances) {
            if (record.subject?.name) {
                subjectSet.add(record.subject.name);
            }
        }

        const subjects = Array.from(subjectSet);

        if (subjects.length === 0) {
            return NextResponse.json(
                { error: "No subjects found for this teacher" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            teacher: teacher.name,
            subjects,
        });
    } catch (error: any) {
        console.error("Error fetching teacher's subjects:", error);
        return NextResponse.json(
            { error: "Failed to fetch subjects", detail: error.message },
            { status: 500 }
        );
    }
}


