import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // console.log(session?.user)
    
    if (!session?.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const flags = await prisma.flag.findMany({
      where: {
        pdfId : params.id,
        userId : session.user.id
      }
    });

    if (!flags) {
      return NextResponse.json({ error: "Flags not found" }, { status: 404 });
    }

    console.log("Fetched Flags:", flags);
    return NextResponse.json({ flags });
    
  } catch (error) {
    console.error("Error fetching Flags:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}