import { NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const { userId } = getAuth(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const teacher = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { id: true, role: true },
  });

  if (!teacher || teacher.role !== 'teacher') {
    return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
  }

  const grouped = await prisma.attendance.groupBy({
  where: { teacherId: teacher.id },
  by: ['date', 'time', 'batchId', 'subjectId'],
  _min: { sessionId: true }, 
  _count: { studentId: true },
  orderBy: { date: 'desc' },
});


  const batchIds   = grouped.map(g => g.batchId).filter(Boolean);
  const subjectIds = grouped.map(g => g.subjectId).filter(Boolean);

  const [batches, subjects] = await Promise.all([
    prisma.batch.findMany({ where: { id: { in: batchIds } }, select: { id: true, name: true } }),
    prisma.subject.findMany({ where: { id: { in: subjectIds } }, select: { id: true, name: true } }),
  ]);

  const batchMap   = new Map(batches.map(b => [b.id, b.name]));
  const subjectMap = new Map(subjects.map(s => [s.id, s.name]));

  const sessions = grouped.map(row => ({
  sessionId: row._min.sessionId,
  date: row.date,
  time: row.time,
  batchId: row.batchId,
  subjectId: row.subjectId,
  batch:   { name: batchMap.get(row.batchId)    ?? 'Unknown Batch' },
  subject: { name: subjectMap.get(row.subjectId)?? 'Unknown Subject' },
  studentCount: row._count.studentId,
}));

  return NextResponse.json({ sessions });
}
