import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json();

    const {
      pdfId,
      text,
      comment,
      type,
      section,
      startIndex,
      endIndex,
      status,
      priority,
      createdAt,
      updatedAt,
    } = body;

    const result = await prisma.$transaction(async (prisma) => {
      const flag = await prisma.flag.create({
        data: {
          pdfId,
          userId: session.user.id,
          text,
          comment,
          type,
          section,
          startIndex,
          endIndex,
          status,
          priority,
          createdAt,
          updatedAt,
        },
      });

      await prisma.pDF.update({
        where: {
          id: pdfId,
        },
        data: {
          lastFlagged: new Date(),
          ...(type === "COMMENT"
            ? { commentCount: { increment: 1 } }
            : { flagCount: { increment: 1 } }),
        },
      });

      return flag;
    });

    return NextResponse.json({ flag: result }, { status: 201 });
  } catch (error) {
    console.error("Error creating flag :", error);
    return NextResponse.json(
      {
        error: "Failed to create flag",
      },
      { status: 500 }
    );
  }
}
