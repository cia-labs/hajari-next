import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const batchSchema = z.object({
  name: z.string().min(1, "Batch name is required"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = batchSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ errors: parsed.error.format() }, { status: 400 });
    }

    const newBatch = await prisma.batch.create({
      data: {
        name: parsed.data.name,
      },
    });

    return NextResponse.json(newBatch);
  } catch (err) {
    console.error("POST /api/batches/create error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
