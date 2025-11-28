import { prisma } from "@/lib/prisma";
import { sendAbsenceNotification } from "@/lib/email-util";

export async function trackStudentAbsence(studentId: string, absenceDate: string) {
    try {
        const existing = await prisma.absenceNotification.findFirst({
            where: { studentId },
        });
        const dateObj = new Date(absenceDate);

        if (existing) {
            const lastDate = existing.lastAbsenceDate ? new Date(existing.lastAbsenceDate) : null;
            if (lastDate) {
                const dayDifference = Math.floor((dateObj.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

                if (dayDifference > 0 && dayDifference <= 10) {
                    const newConsecutiveDays = existing.consecutiveDays + 1;
                    let notificationLevel = existing.notificationLevel;
                    let notified = existing.notified;

                    if (newConsecutiveDays >= 3) {
                        notificationLevel = newConsecutiveDays;
                        notified = false;
                    }

                    await prisma.absenceNotification.update({
                        where: { id: existing.id },
                        data: {
                            consecutiveDays: newConsecutiveDays,
                            lastAbsenceDate: dateObj,
                            notificationLevel,
                            notified,
                        },
                    });
                } else if (dayDifference > 10) {
                    await prisma.absenceNotification.update({
                        where: { id: existing.id },
                        data: {
                            consecutiveDays: 1,
                            lastAbsenceDate: dateObj,
                            notificationLevel: 0,
                            notified: true,
                        },
                    });
                }
            }
        } else {
            await prisma.absenceNotification.create({
                data: {
                    studentId,
                    consecutiveDays: 1,
                    lastAbsenceDate: dateObj,
                    notificationLevel: 0,
                    notified: true,
                },
            });
        }
    } catch (error) {
        console.error("Error tracking student absence:", error);
    }
}

export async function sendEmailsToAbsentStudents(
    studentIds: string[],
    subjectName: string,
    date: string,
    time: string
) {
    try {
        const students = await prisma.student.findMany({
            where: {
                id: { in: studentIds },
            },
            select: { email: true, name: true },
        });

        for (const stu of students) {
            if (stu.email) {
                await sendAbsenceNotification(stu.email, stu.name, subjectName, date, time);
            }
        }
    } catch (error) {
        console.error("Error sending absence notifications:", error);
    }
}
