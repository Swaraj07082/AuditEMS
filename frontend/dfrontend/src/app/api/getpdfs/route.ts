import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        
        console.log('Session:', session);
        console.log('User ID:', session?.user?.id);
        
        // Validate authentication
        if (!session || !session.user || !session.user.id) {
            console.log('No valid session or user ID found');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        // Get all PDFs for the user
        const pdfs = await prisma.pDF.findMany({
            where: {
                userId: session.user.id
            },
            orderBy: {
                uploadedAt: 'desc' // Basic ordering by upload date
            }
        });
        
        console.log(`Found ${pdfs.length} PDFs for user ${session.user.id}`);
        
        return NextResponse.json({ pdfs });
        
    } catch (error) {
        console.error('Error fetching PDFs:', error);
        return NextResponse.json(
            { error: 'Failed to fetch PDFs' }, 
            { status: 500 }
        );
    }
}