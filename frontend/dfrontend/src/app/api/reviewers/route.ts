import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const reviewers = await prisma.user.findMany({
    where: {
      role: "REVIEWER",
    },
  });

  return NextResponse.json(reviewers);
}
export async function POST(req: Request) {
  try {
    const { reportId, reviewerId } = await req.json();

    if (!reportId || !reviewerId) {
      return NextResponse.json(
        { error: "reportId and reviewerId are required" },
        { status: 400 }
      );
    }

    const reviewer = await prisma.user.findUnique({
      where: { id: reviewerId },
      select: { role: true },
    });
    if (!reviewer || reviewer.role !== "REVIEWER") {
      return NextResponse.json(
        { error: "Reviewer not found or is not a REVIEWER" },
        { status: 400 }
      );
    }

    const updatedPDF = await prisma.pDF.update({
      where: { id: reportId },
      data: { reviewer: { connect: { id: reviewerId } } },
      include: { reviewer: true },
    });

    return NextResponse.json(
      { message: "Reviewer assigned successfully", pdf: updatedPDF },
      { status: 200 }
    );
  } catch (err) {
    console.error("[POST /api/reviewers] ", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
