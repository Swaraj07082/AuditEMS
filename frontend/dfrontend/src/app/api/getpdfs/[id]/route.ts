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

    const pdf = await prisma.pDF.findFirst({
      where: {
        id: params.id,
        userId: session.user.id // Ensure user can only access their own PDFs
      }
    });

    if (!pdf) {
      return NextResponse.json({ error: "PDF not found" }, { status: 404 });
    }

    console.log("Fetched PDF:", pdf);
    return NextResponse.json({ pdf });
    
  } catch (error) {
    console.error("Error fetching PDF:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}