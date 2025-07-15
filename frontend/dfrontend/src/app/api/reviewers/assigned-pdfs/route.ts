import { NextResponse } from "next/server";
import { getServerSession } from "next-auth"; // or your custom auth
import { authOptions } from "@/lib/auth"; // adjust to your auth file
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions); // or your auth logic

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user || user.role !== "REVIEWER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const assignedPDFs = await prisma.pDF.findMany({
    where: {
      reviewerId: user.id,
    },
    orderBy: {
      uploadedAt: "desc",
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      flags: true,
    },
  });

  return NextResponse.json(assignedPDFs);
}
