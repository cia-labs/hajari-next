import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const subjectSchema = z.object({
  name: z.string().min(1, "Subject name is required"),
  batchIds: z.array(z.string().uuid()).min(1, "At least one batch must be selected"),
  teacherIds: z.array(z.string().uuid()).min(1, "At least one teacher must be selected"),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
}).refine((data) => data.endDate > data.startDate, {
  message: "End date must be after start date",
  path: ["endDate"],
});

function standardizeName(name: string) {
  return name.trim().replace(/;+$/, "").trim();
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = subjectSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ errors: parsed.error.format() }, { status: 400 });
    }

    const { name, batchIds, teacherIds, startDate, endDate } = parsed.data;
    const standardized = standardizeName(name);

    const existing = await prisma.subject.findFirst({
      where: {
        name: { equals: standardized, mode: "insensitive" },
      },
    });

    if (existing) {
      return NextResponse.json({ error: "Subject name already exists" }, { status: 400 });
    }

    const validTeachers = await prisma.user.findMany({
      where: {
        id: { in: teacherIds },
        role: "teacher",
      },
    });

    if (validTeachers.length !== teacherIds.length) {
      return NextResponse.json({ error: "One or more teacher IDs are invalid" }, { status: 400 });
    }

    const subject = await prisma.subject.create({
      data: {
        name: standardized,
        startDate,
        endDate,
        batches: {
          create: batchIds.map((id) => ({ batchId: id })),
        },
        teachers: {
          create: teacherIds.map((id) => ({
            teacher: { connect: { id } },
          })),
        },
      },
    });

    return NextResponse.json(subject, { status: 201 });
  } catch (err) {
    console.error("Error creating subject:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
