import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const batch = await prisma.batch.delete({
      where: { id },
    });

    return NextResponse.json(batch);
  } catch (error) {
    console.error("Error deleting batch:", error);
    return NextResponse.json(
      { error: "Failed to delete batch. It may not exist." },
      { status: 500 }
    );
  }
}
