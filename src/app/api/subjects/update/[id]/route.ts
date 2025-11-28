import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const subjectUpdateSchema = z.object({
  name: z.string().min(1).optional(),
});

function standardizeSubjectName(name: string) {
  return name.trim().replace(/;+$/, "").trim();
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const parsed = subjectUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { errors: parsed.error.format() },
        { status: 400 }
      );
    }

    const { name } = parsed.data;

    if (name) {
      const standardizedName = standardizeSubjectName(name);

      const existing = await prisma.subject.findFirst({
        where: {
          name: {
            equals: standardizedName,
            mode: "insensitive",
          },
          NOT: { id },
        },
      });

      if (existing) {
        return NextResponse.json(
          { error: "Subject with this name already exists" },
          { status: 400 }
        );
      }

      const updated = await prisma.subject.update({
        where: { id },
        data: {
          name: standardizedName,
        },
      });

      return NextResponse.json(updated);
    }

    return NextResponse.json(
      { error: "Nothing to update" },
      { status: 400 }
    );
  } catch (err) {
    console.error("Error updating subject:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
