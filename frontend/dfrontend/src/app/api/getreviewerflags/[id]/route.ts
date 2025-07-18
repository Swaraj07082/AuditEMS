import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { count } from "console";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true },
  });

  if (!user || user.role !== "REVIEWER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const pdf = await prisma.pDF.findUnique({
    where: { id: params.id },
    select: { reviewerId: true },
  });

  if (!pdf || pdf.reviewerId !== user.id) {
    return NextResponse.json(
      { error: "PDF not found or not assigned to you" },
      { status: 404 }
    );
  }

  const flags = await prisma.flag.findMany({
    where: { pdfId: params.id },
    orderBy: { createdAt: "desc" },
    include: {
      flagReviews: {
        where: {
          reviewerId: user.id,
        },
        select: { status: true },
      },
    },
  });

  const counts = {
    total: flags.length,
    reviewed: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    needsClarification: 0,
  };

  for (const flag of flags) {
    if (flag.flagReviews.length > 0) {
      counts.reviewed += 1;
      const status = flag.flagReviews[0].status;
      if (status === "APPROVED") counts.approved += 1;
      else if (status === "REJECTED") counts.rejected += 1;
      else if (status === "NEEDS_CLARIFICATION") counts.needsClarification += 1;
    } else {
      counts.pending += 1;
    }
  }
  return NextResponse.json({ flags, counts }); // 200 OK
}
