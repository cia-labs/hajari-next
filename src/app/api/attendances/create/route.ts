"use server";

import { NextResponse } from "next/server";
import { format } from "date-fns";
import { v4 as uuidv4 } from "uuid";

import { prisma } from "@/lib/prisma";
import { createAttendanceSchema } from "../validation";
import { sendEmailsToAbsentStudents, trackStudentAbsence } from "../utils";
import { sendAbsenceNotification } from "@/lib/email-util";


export async function POST(req: Request) {
    try {
        const body = await req.json();

        const parseResult = createAttendanceSchema.safeParse(body);
        if (!parseResult.success) {
            const zodErrors = parseResult.error.issues.map(issue => ({ msg: issue.message }));
            return NextResponse.json({ errors: zodErrors }, { status: 400 });
        }
        const data = parseResult.data;

       
        for (const stu of data.students) {
            const existing = await prisma.attendance.findFirst({
                where: {
                    studentId: stu.student,
                    batchId: data.batch,
                    subjectId: data.subject,
                    date: data.date,
                    time: data.time,
                },
            });
            if (existing) {
                return NextResponse.json(
                    {
                        errors: [
                            {
                                msg:
                                    "Student is already marked for attendance on this date and time for this subject",
                            },
                        ],
                    },
                    { status: 400 }
                );
            }
        }

       
        const teacher = await prisma.user.findFirst({
            where: { employeeId: data.teacher, role: { in: ["teacher", "admin"] } },
        });
        if (!teacher) {
            return NextResponse.json(
                { errors: [{ msg: "Invalid teacher Id" }] },
                { status: 400 }
            );
        }

        const sessionId = uuidv4();

        const formattedDate = format(new Date(data.date), "yyyy-MM-dd");
        const absentStudentIds: string[] = [];
        const attendanceRows = data.students.map(s => {
            if (s.attendanceStatus === "absent") {
                absentStudentIds.push(s.student);
            }
            return {
                sessionId,
                teacherId: teacher.id,
                batchId: data.batch,
                subjectId: data.subject,
                date: formattedDate,
                time: data.time,
                studentId: s.student,
                attendanceStatus: s.attendanceStatus,
            };
        });

        await prisma.attendance.createMany({ data: attendanceRows });

        if (absentStudentIds.length > 0) {
            const subjectRecord = await prisma.subject.findUnique({
                where: { id: data.subject },
            });
            if (subjectRecord) {
                sendEmailsToAbsentStudents(
                    absentStudentIds,
                    subjectRecord.name,
                    formattedDate,
                    data.time
                );

                for (const studentId of absentStudentIds) {
                    await trackStudentAbsence(studentId, formattedDate);
                }
            }
        }

        const result = {
            sessionId,
            teacherId: teacher.id,
            date: formattedDate,
            time: data.time,
        };
        return NextResponse.json(result, { status: 201 });
    } catch (err) {
        console.error("Error in create attendance route:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

