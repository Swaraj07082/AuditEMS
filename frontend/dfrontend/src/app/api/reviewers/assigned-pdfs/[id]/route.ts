// app/api/reviewers/assigned-pdfs/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // adjust path if different
import { prisma } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // 1️⃣  Authenticate
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2️⃣  Fetch user & verify role
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true },
  });

  if (!user || user.role !== "REVIEWER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 3️⃣  Fetch the PDF and be sure it belongs to this reviewer
  const pdf = await prisma.pDF.findFirst({
    where: {
      id: params.id, // URL param `[id]`
      reviewerId: user.id, // must be assigned to this reviewer
    },
    include: {
      user: {
        // uploader’s basic info
        select: { name: true, email: true },
      },
      flags: true, // include flags if you need them
    },
  });

  if (!pdf) {
    return NextResponse.json({ error: "PDF not found" }, { status: 404 });
  }

  return NextResponse.json(pdf); // 200 OK with the PDF object
}
