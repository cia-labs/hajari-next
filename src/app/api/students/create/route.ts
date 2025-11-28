import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { clerkClient } from "@clerk/clerk-sdk-node";
import { z } from "zod";
import { sendStudentRegistrationConfirmation } from "@/lib/email-util";

const studentSchema = z.object({
  name: z.string().min(1),
  usnNumber: z
    .string()
    .regex(/^AU[0-9]{2}UG-[0-9]{3}$/, "Invalid USN format (Expected: AU00UG-000)"),
  email: z
    .string()
    .email("Invalid email format")
    .refine((val) => val.endsWith("@atriauniversity.edu.in"), {
      message: "Email must end with @atriauniversity.edu.in",
    }),
  batch: z.array(z.string()).min(1, "At least one batch must be selected"),
});

const DEFAULT_PASSWORD = Math.random().toString(36).slice(-8);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = studentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({
        error: "Validation error",
        details: parsed.error.format(),
      }, { status: 400 });
    }

    const { name, usnNumber, email, batch } = parsed.data;

    const existingStudent = await prisma.student.findFirst({
      where: {
        OR: [{ usnNumber }, { email }],
      },
      include: { batches: true },
    });

    const batchIdsToLink = batch;

    if (existingStudent) {
      const existingBatchIds = existingStudent.batches.map((b) => b.batchId);
      const newBatchIds = batchIdsToLink.filter((id) => !existingBatchIds.includes(id));

      if (newBatchIds.length === 0) {
        return NextResponse.json({
          error: "Student already exists with the same batch.",
        }, { status: 400 });
      }

      await prisma.studentBatch.createMany({
        data: newBatchIds.map((batchId) => ({
          studentId: existingStudent.id,
          batchId,
        })),
      });

      return NextResponse.json({
        message: "Student updated with new batches",
      });
    }

    const clerkUser = await clerkClient.users.createUser({
      emailAddress: [email],
      password: DEFAULT_PASSWORD,
      firstName: name,
      publicMetadata: {
        role: "student",
        usnNumber,
      },
    });

    const newStudent = await prisma.student.create({
      data: {
        name,
        email,
        usnNumber,
        role: "student",
        password: DEFAULT_PASSWORD,
        clerkId: clerkUser.id,
        batches: {
          create: batchIdsToLink.map((batchId) => ({
            batch: { connect: { id: batchId } },
          })),
        },
      },
    });

    const emailSent = await sendStudentRegistrationConfirmation(
      email,
      name,
      DEFAULT_PASSWORD
    );

    if (!emailSent.success) {
      console.warn("Student created, but email failed:", emailSent.error);
    }

    return NextResponse.json(newStudent, { status: 201 });
  } catch (err) {
    console.error("Create Student Error:", err);
    return NextResponse.json({
      error: "Internal Server Error",
    }, { status: 500 });
  }
}
