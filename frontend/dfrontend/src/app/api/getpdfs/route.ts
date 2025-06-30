import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
// import { AwardIcon } from "lucide-react";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
export async function GET() {
    const session = await getServerSession(authOptions);
    
    console.log('Session:', session);
    console.log('User ID:', session?.user?.id);
    
    // Add explicit validation
    if (!session || !session.user || !session.user.id) {
        console.log('No valid session or user ID found');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const pdfs = await prisma.pDF.findMany({
        where: {
            userId: session.user.id
        }
    });
    
    console.log(`Found ${pdfs.length} PDFs for user ${session.user.id}`);
    return NextResponse.json({ pdfs });
}