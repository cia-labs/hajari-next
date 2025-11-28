import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { clerkClient } from "@clerk/clerk-sdk-node";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, employeeId, role } = await req.json();

    const errors: string[] = [];
    if (!name || name.trim().length === 0) errors.push("Full Name is required.");
    if (!email || email.trim().length === 0) errors.push("Email is required.");
    if (!password || password.trim().length < 6)
      errors.push("Password is required (min 6 characters).");
    if (!role) errors.push("User role is missing.");
    if (role === "teacher" && !employeeId)
      errors.push("Employee ID is required for teachers.");

    if (errors.length > 0) {
      return NextResponse.json(
        { error: "Validation failed", details: errors },
        { status: 400 }
      );
    }


    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        {
          error: `User with email "${email}" already exists in the system.`,
        },
        { status: 409 }
      );
    }


    let clerkUser;
    try {
      clerkUser = await clerkClient.users.createUser({
        emailAddress: [email],
        password,
        firstName: name,
        lastName: "",
        publicMetadata: {
          role,
          employeeId: employeeId || null,
        },
      });
    } catch (clerkError: any) {
      console.error(" Clerk error:", clerkError);
      return NextResponse.json(
        {
          error:
            "Failed to create user in Clerk. Please check if email is valid and unique.",
        },
        { status: 500 }
      );
    }

    if (!clerkUser?.id) {
      return NextResponse.json(
        { error: "Unknown error while creating Clerk user." },
        { status: 500 }
      );
    }


    try {
      const newUser = await prisma.user.create({
        data: {
          name,
          email,
          password,
          employeeId: employeeId || null,
          role,
          clerkId: clerkUser.id,
        },
      });

      return NextResponse.json(
        { message: "User created successfully.", user: newUser },
        { status: 201 }
      );
    } catch (dbError: any) {
      console.error("🔴 Prisma DB error:", dbError);
      return NextResponse.json(
        {
          error:
            "User created in Clerk, but failed to save in database. Please contact support.",
        },
        { status: 500 }
      );
    }
  } catch (err: any) {
    console.error("🔴 Unknown server error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again later." },
      { status: 500 }
    );
  }
}
