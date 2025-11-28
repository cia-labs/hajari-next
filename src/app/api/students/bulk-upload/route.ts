import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/clerk-sdk-node";
import { prisma } from "@/lib/prisma";
import pLimit from "p-limit";

const DEFAULT_PASSWORD = Math.random().toString(36).slice(-8);
const CONCURRENCY = 6;

export async function POST(req: Request) {
  try {
    const rows: any[] = await req.json();
    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: "Invalid CSV or empty data" }, { status: 400 });
    }

    const allBatchNames = [
      ...new Set(
        rows.flatMap((r) =>
          r["Batch"]?.split(";").map((b: string) => b.trim()).filter(Boolean) ?? []
        )
      ),
    ];

    const batchRecords = await prisma.batch.findMany({
      where: { name: { in: allBatchNames } },
      select: { id: true, name: true },
    });
    const batchByName = Object.fromEntries(batchRecords.map((b) => [b.name, b.id]));

    const allEmails = rows.map((r) => (r["Email"] ?? "").replace(/;+$/, "").trim());
    const allUsns = rows.map((r) => r["USN"]?.trim());

    const existingStudents = await prisma.student.findMany({
      where: {
        OR: [
          { email: { in: allEmails } },
          { usnNumber: { in: allUsns } },
        ],
      },
      include: { batches: true },
    });
    const studentByEmail = new Map(existingStudents.map((s) => [s.email, s]));
    const studentByUsn = new Map(existingStudents.map((s) => [s.usnNumber, s]));

    const limit = pLimit(CONCURRENCY);
    const results = { created: [] as string[], updated: [] as string[], failed: [] as any[] };

    await Promise.all(
      rows.map((row, idx) =>
        limit(async () => {
          const rowNum = idx + 1;
          try {
            const name = row["Student Name"]?.trim();
            const usn = row["USN"]?.trim();
            const rawEmail = row["Email"];
            const email = rawEmail?.replace(/;+$/, "").trim();
            const batchNames = row["Batch"]
              ?.split(";")
              .map((b: string) => b.trim())
              .filter(Boolean);

            if (!name || !usn || !email || !batchNames?.length) {
              throw new Error("Missing required fields");
            }
            if (!/^AU[0-9]{2}UG-[0-9]{3}$/.test(usn)) {
              throw new Error("Invalid USN format");
            }
            if (!email.endsWith("@atriauniversity.edu.in")) {
              throw new Error("Email must end with @atriauniversity.edu.in");
            }

            const missing = batchNames.filter((n) => !batchByName[n]);
            if (missing.length) {
              throw new Error(`Invalid batch name(s): ${missing.join(", ")}`);
            }

            const batchIds = batchNames.map((n) => {
              const id = batchByName[n];
              if (!id) throw new Error(`Batch '${n}' not found in DB`);
              return id;
            });

            let clerkUser;
            const existingUsers = await clerkClient.users.getUserList({ emailAddress: [email] });
            if (existingUsers.length) {
              clerkUser = existingUsers[0];
            } else {
              clerkUser = await clerkClient.users.createUser({
                emailAddress: [email],
                password: DEFAULT_PASSWORD,
                firstName: name,
                publicMetadata: { role: "student", usnNumber: usn },
              });
            }

            const existing = studentByEmail.get(email) || studentByUsn.get(usn);
            if (existing) {
              await prisma.student.update({
                where: { id: existing.id },
                data: {
                  name,
                  email,
                  usnNumber: usn,
                  clerkId: clerkUser.id,
                  password: DEFAULT_PASSWORD,
                  batches: {
                    connectOrCreate: batchIds.map((bid) => ({
                      where: { studentId_batchId: { studentId: existing.id, batchId: bid } },
                      create: { batchId: bid },
                    })),
                  },
                },
              });
              results.updated.push(usn);
            } else {
              const newStudent = await prisma.student.create({
                data: {
                  name,
                  email,
                  usnNumber: usn,
                  password: DEFAULT_PASSWORD,
                  clerkId: clerkUser.id,
                  role: "student",
                  batches: {
                    createMany: {
                      data: batchIds.map((id) => ({ batchId: id })),
                    },
                  },
                },
              });

              studentByEmail.set(email, newStudent);
              studentByUsn.set(usn, newStudent);

              results.created.push(usn);
            }
          } catch (err: any) {
            results.failed.push({
              row: rowNum,
              reason: err.message || "Unexpected error",
            });
          }
        })
      )
    );

    const status = results.failed.length ? 207 : 200;
    return NextResponse.json({ message: "Bulk upload complete", results }, { status });
  } catch (err) {
    console.error("Bulk upload error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
