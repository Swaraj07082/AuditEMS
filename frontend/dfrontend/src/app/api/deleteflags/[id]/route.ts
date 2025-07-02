import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    await prisma.$transaction(async (prisma) => {
      const flag = await prisma.flag.findUnique({
        where: { id: id },
        select: { type: true, pdfId: true },
      });

      if (!flag) {
        throw new Error("Flag not found");
      }

      await prisma.flag.delete({
        where: { id: id },
      });

      await prisma.pDF.update({
        where: { id: flag.pdfId },
        data: {
          ...(flag.type === "COMMENT"
            ? { commentCount: { decrement: 1 } }
            : { flagCount: { decrement: 1 } }),
        },
      });
    });
    return NextResponse.json({ message: "Flag deleted successfully" });
  } catch (error) {
    console.error("Error deleting flag :", error);

    return NextResponse.json(
      {
        error: "Failed to delete flag",
      },
      { status: 500 }
    );
  }
}
