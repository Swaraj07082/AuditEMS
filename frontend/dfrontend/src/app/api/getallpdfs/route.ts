import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function getAllPdfsWithUser() {
  return prisma.pDF.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
    orderBy: { uploadedAt: "desc" }, // optional: newest first
  });
}

export async function GET() {
  try {
    const pdfs = await getAllPdfsWithUser();
    return NextResponse.json(pdfs); // 200 OK
  } catch (err) {
    console.error("PDF fetch error:", err);
    return NextResponse.json(
      { error: "Failed to fetch PDFs" },
      { status: 500 }
    );
  }
}
