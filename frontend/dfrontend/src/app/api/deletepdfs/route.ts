import { prisma } from "@/lib/db";
import {  NextResponse } from "next/server";

export async function DELETE(req: Request) {
    try {
        // Parse the JSON body - need to await this
        const body = await req.json();
        const { id } = body;

        // Validate that ID is provided
        if (!id) {
            return NextResponse.json(
                { error: "PDF ID is required" },
                { status: 400 }
            );
        }

        // Delete the PDF from database
        const deletedPDF = await prisma.pDF.delete({
            where: {
                id: id
            }
        });

        return NextResponse.json(
            { 
                message: "PDF deleted successfully", 
                deletedPDF 
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Error deleting PDF:", error);
        
        // Handle Prisma errors specifically
        if (error instanceof Error) {
            // Check if it's a Prisma "record not found" error
            if (error.message.includes("Record to delete does not exist")) {
                return NextResponse.json(
                    { error: "PDF not found" },
                    { status: 404 }
                );
            }
        }

        return NextResponse.json(
            { error: "Failed to delete PDF" },
            { status: 500 }
        );
    }
}