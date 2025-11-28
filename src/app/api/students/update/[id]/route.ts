
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { clerkClient } from "@clerk/clerk-sdk-node";

const updateStudentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  usnNumber: z
    .string()
    .regex(/^AU[0-9]{2}UG-[0-9]{3}$/, "Invalid USN format"),
  email: z
    .string()
    .email("Invalid email")
    .refine((val) => val.endsWith("@atriauniversity.edu.in"), {
      message: "Email must be a university domain",
    }),
  batch: z.array(z.string().uuid()).min(1, "At least one batch is required"),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const studentId = params.id;
    const body = await req.json();
    const parsed = updateStudentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { errors: parsed.error.format() },
        { status: 400 }
      );
    }

    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const { name, usnNumber, email, batch } = parsed.data;

    const updatedStudent = await prisma.student.update({
      where: { id: studentId },
      data: {
        name,
        usnNumber,
        email,
        batches: {
          deleteMany: {},
          create: batch.map((batchId) => ({ batchId })),
        },
      },
    });

    if (student.clerkId) {
      try {
        await clerkClient.users.updateUser(student.clerkId, {
          firstName: name,
          publicMetadata: {
            role: "student",
            usnNumber,
          },
        });
      } catch (err) {
        console.error("Clerk update failed:", err);
      }
    }

    return NextResponse.json(updatedStudent);
  } catch (err) {
    console.error("PUT /api/students/update/[id] error:", err);
    return NextResponse.json(
      { error: "Internal Server Error", details: err.message },
      { status: 500 }
    );
  }
}