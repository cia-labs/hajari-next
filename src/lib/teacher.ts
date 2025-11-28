import { prisma } from "./prisma";

export async function getTeacherBatches(teacherId: string) {
  const recs = await prisma.attendance.findMany({
    where: { teacherId },
    distinct: ["batchId"],
    select: { batch: { select: { id: true, name: true } } }
  });
  return recs.map(r => r.batch);
}

export async function getBatchDetails(batchId: string) {
  const students = await prisma.studentBatch.findMany({
    where: { batchId },
    select: { student: { select: { id: true, name: true, usnNumber: true } } }
  });
  const subjects = await prisma.subjectBatch.findMany({
    where: { batchId },
    select: { subject: { select: { id: true, name: true } } }
  });
  return {
    students: students.map(s => s.student),
    subjects: subjects.map(s => s.subject),
  };
}
