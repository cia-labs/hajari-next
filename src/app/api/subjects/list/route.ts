import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const subjects = await prisma.subject.findMany({
      orderBy: { name: 'asc' },
      include: {
        batches: {
          include: {
            batch: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    const formattedSubjects = subjects.map((subject) => ({
      ...subject,
      batches: subject.batches.map((sb) => sb.batch),
    }));

    return NextResponse.json(formattedSubjects);
  } catch (err) {
    console.error('Error fetching subjects:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
