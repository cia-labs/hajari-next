import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export default async function handler(req, res) {
  const { userId } = auth();
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return res.status(404).json({ error: "Not found" });
  return res.status(200).json({ role: user.role });
}
