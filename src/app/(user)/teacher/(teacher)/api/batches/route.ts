import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const batches = await prisma.batch.findMany({
      where: { isDisabled: false },
      orderBy: { name: 'asc' },
      include: { 
        _count: { select: { students: true } },
        subjects: {
          include: {
            subject: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },   
    });

    const enriched = batches.map(b => ({
      id: b.id,
      name: b.name,
      createdAt: b.createdAt,
      studentCount: b._count.students,
      subjects: b.subjects.map(sb => sb.subject),                      
    }));

    return NextResponse.json(enriched);
  } catch (err) {
    console.error('Error fetching batches:', err);
    return NextResponse.json({ error: 'Failed to fetch batches' }, { status: 500 });
  }
}
