import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const subjectRowSchema = z.object({
  "Subject Name": z.string().min(1),
  Batches: z.union([
    z.string(),
    z.array(z.string()),
  ])
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!Array.isArray(body) || body.length === 0) {
      return NextResponse.json({ error: "Empty or invalid CSV data" }, { status: 400 });
    }

    const parsedRows = z.array(subjectRowSchema).safeParse(body);
    if (!parsedRows.success) {
      return NextResponse.json({ errors: parsedRows.error.format() }, { status: 400 });
    }

    const data = parsedRows.data;
    const seenSubjects = new Set();
    let added = 0;
    let updated = 0;

    for (let row of data) {
      const name = row["Subject Name"].trim().replace(/;+$/, "");
      const batchNames = Array.isArray(row.Batches) ? row.Batches : row.Batches.split(",").map((b) => b.trim());

      if (seenSubjects.has(name.toLowerCase())) {
        return NextResponse.json({
          error: `Duplicate subject found in upload: ${name}`
        }, { status: 400 });
      }
      seenSubjects.add(name.toLowerCase());

      const foundBatches = await prisma.batch.findMany({
        where: {
          name: {
            in: batchNames
          }
        }
      });

      if (foundBatches.length !== batchNames.length) {
        const foundNames = foundBatches.map((b) => b.name);
        const missing = batchNames.filter((name) => !foundNames.includes(name));
        return NextResponse.json({ error: `Invalid batch name(s): ${missing.join(", ")}` }, { status: 400 });
      }

      const existingSubject = await prisma.subject.findFirst({
        where: {
          name: { equals: name, mode: "insensitive" },
        },
        include: { batches: true }
      });

      if (existingSubject) {
        const existingBatchIds = existingSubject.batches.map((sb) => sb.batchId);
        const newBatchIds = foundBatches.map((b) => b.id).filter((id) => !existingBatchIds.includes(id));

        for (const batchId of newBatchIds) {
          await prisma.subjectBatch.create({
            data: {
              subjectId: existingSubject.id,
              batchId
            }
          });
        }
        updated++;
      } else {
        const newSubject = await prisma.subject.create({
          data: { name },
        });

        for (const batch of foundBatches) {
          await prisma.subjectBatch.create({
            data: {
              subjectId: newSubject.id,
              batchId: batch.id
            }
          });
        }
        added++;
      }
    }

    return NextResponse.json({
      message: "Bulk upload successful",
      summary: { added, updated }
    });
  } catch (err) {
    console.error("Bulk subject upload error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
