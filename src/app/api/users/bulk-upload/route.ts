import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/clerk-sdk-node";
import { prisma } from "@/lib/prisma";

const expectedHeaders = [
  "Teacher Name",
  "Employee Id",
  "Email",
  "Password",
  "Role",
];

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!Array.isArray(body) || !body.length) {
      return NextResponse.json({ error: "Invalid or empty CSV data" }, { status: 400 });
    }

    const csvHeaders = Object.keys(body[0]);
    const missingHeaders = expectedHeaders.filter(
      (header) => !csvHeaders.includes(header)
    );

    if (missingHeaders.length > 0) {
      return NextResponse.json({
        error: `Missing required headers: ${missingHeaders.join(", ")}`,
      }, { status: 400 });
    }

    for (let i = 0; i < body.length; i++) {
      const row = body[i];
      for (const header of expectedHeaders) {
        if (!row[header] || row[header].toString().trim() === '') {
          return NextResponse.json({
            error: `Missing value for '${header}' in row ${i + 1}`,
          }, { status: 400 });
        }
      }

      const email = row["Email"].trim().replace(/;$/, "").toLowerCase();
      if (!emailRegex.test(email)) {
        return NextResponse.json({
          error: `Invalid email format '${email}' in row ${i + 1}`,
        }, { status: 400 });
      }
    }

    const createdUsers: any[] = [];
    const skipped: any[] = [];

    for (const teacher of body) {
      const name = teacher["Teacher Name"].trim().replace(/;$/, "");
      const email = teacher["Email"].trim().replace(/;$/, "").toLowerCase();
      const password = teacher["Password"].trim().replace(/;$/, "");
      const employeeId = teacher["Employee Id"].trim().replace(/;$/, "");
      const role = teacher["Role"].toLowerCase();

      const normalizedName = name
        .split(" ")
        .filter(Boolean)
        .map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
        .join(" ");

      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        skipped.push({ email, reason: "User already exists in DB" });
        continue;
      }

      let clerkUser = null;
      try {
        const users = await clerkClient.users.getUserList({ emailAddress: [email] });
        clerkUser = users.length > 0 ? users[0] : null;
      } catch (err) {
        console.error("Failed to fetch Clerk user list", err);
        skipped.push({ email, reason: "Unable to check Clerk account" });
        continue;
      }

      if (!clerkUser) {
        try {
          clerkUser = await clerkClient.users.createUser({
            emailAddress: [email],
            password,
            firstName: normalizedName,
            lastName: "",
            publicMetadata: { role, employeeId },
          });
        } catch (err) {
          console.error("Clerk creation failed", err);
          skipped.push({ email, reason: "Failed to create user in Clerk" });
          continue;
        }
      } else {
        try {
          await clerkClient.users.updateUser(clerkUser.id, {
            password,
            publicMetadata: { role, employeeId },
          });
        } catch (err) {
          console.warn(`Failed to update Clerk user for ${email}`);
        }
      }

      try {
        const newUser = await prisma.user.create({
          data: {
            name: normalizedName,
            email,
            password,
            role,
            employeeId,
            clerkId: clerkUser.id,
          },
        });
        createdUsers.push(newUser);
      } catch (err) {
        console.error(`DB creation failed for ${email}`, err);
        skipped.push({ email, reason: "Failed to create user in DB" });
      }
    }

    return NextResponse.json({
      message: "Bulk upload processed",
      created: createdUsers,
      skipped,
    });
  } catch (err) {
    console.error("bulk-upload error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}