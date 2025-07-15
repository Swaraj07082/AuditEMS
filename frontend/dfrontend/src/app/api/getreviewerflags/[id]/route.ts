import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

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
  });

  return NextResponse.json({flags}); // 200 OK
}
