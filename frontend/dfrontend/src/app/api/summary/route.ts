import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [userCount, totalPdfs, verifiedPdfs, pendingPdfs] = await Promise.all(
      [
        prisma.user.count(),
        prisma.pDF.count(),
        prisma.pDF.count({ where: { status: "VERIFIED" } }),
        prisma.pDF.count({ where: { status: "PENDING" } }),
      ]
    );

    return NextResponse.json({
      totalUsers: userCount,
      totalPDFs: totalPdfs,
      verifiedPDFs: verifiedPdfs,
      pendingPDFs: pendingPdfs,
    });
  } catch (error) {
    console.error("Dashboard summary error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard summary" },
      { status: 500 }
    );
  }
}
