
import { NextRequest, NextResponse } from "next/server";
import { getBatchDetails } from "@/lib/teacher";

export async function GET(
  req: NextRequest,
  context: { params: { batchId: string } }
) {
  const batchId = context.params.batchId;

  const { students, subjects } = await getBatchDetails(batchId);
  return NextResponse.json({ students, subjects });
}
