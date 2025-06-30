import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
// import { AwardIcon } from "lucide-react";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(){
    const session = await getServerSession(authOptions);

    const pdfs = await prisma.pDF.findMany({
        where : {
            userId : session?.user.id
        }
    })

    console.log(pdfs)
    return NextResponse.json({pdfs})
}