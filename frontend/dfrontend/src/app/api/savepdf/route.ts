import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const {
      text,
      inconsistencies,
      rag_analysis,
      recommendations,
      enhanced,
      error,
      summary,
      filename,
      status,
      pdfURL,
    } = await req.json();

    const newPDF = await prisma.pDF.create({
      data: {
        userId: user.id, // ✅ Securely fetched server-side
        text,
        inconsistencies,
        rag_analysis,
        recommendations,
        enhanced,
        error,
        summary,
        filename,
        status,
        pdfURL,
      },
    });

    return NextResponse.json({ success: true, pdf: newPDF });
  } catch (err) {
    console.error("Failed to save PDF:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
