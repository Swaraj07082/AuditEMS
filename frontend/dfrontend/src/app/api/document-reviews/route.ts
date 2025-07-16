import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Status } from "@/app/types/pdf";

// Define the enum values directly since we can't import from types
const DocumentReviewStatus = {
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  NEEDS_REVISION: "NEEDS_REVISION",
} as const;

type DocumentReviewStatusType =
  (typeof DocumentReviewStatus)[keyof typeof DocumentReviewStatus];

// GET: Fetch document review for a specific pdfId
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const pdfId = searchParams.get("pdfId");

  if (!pdfId) {
    return NextResponse.json({ error: "pdfId is required" }, { status: 400 });
  }

  try {
    const documentReview = await prisma.documentReview.findFirst({
      where: {
        pdfId,
        reviewerId: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      review: documentReview || null,
    });
  } catch (error) {
    console.error("Error fetching document review:", error);
    return NextResponse.json(
      { error: "Failed to fetch document review" },
      { status: 500 }
    );
  }
}

// POST: Create or update a document review
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { pdfId, status, comment } = body;

    if (!pdfId || !status || comment === undefined) {
      return NextResponse.json(
        { error: "pdfId, status, and comment are required" },
        { status: 400 }
      );
    }

    const normalizedStatus = status.toUpperCase();

    if (!Object.values(DocumentReviewStatus).includes(normalizedStatus as DocumentReviewStatusType)) {
      return NextResponse.json(
        { error: "Invalid review status" },
        { status: 400 }
      );
    }

    const pdf = await prisma.pDF.findUnique({ where: { id: pdfId } });
    if (!pdf) {
      return NextResponse.json({ error: "PDF not found" }, { status: 404 });
    }

    const existingReview = await prisma.documentReview.findFirst({
      where: { pdfId, reviewerId: session.user.id },
    });

    let documentReview;

    if (existingReview) {
      documentReview = await prisma.documentReview.update({
        where: { id: existingReview.id },
        data: {
          status: normalizedStatus as DocumentReviewStatusType,
          comment,
          updatedAt: new Date(),
        },
      });
    } else {
      documentReview = await prisma.documentReview.create({
        data: {
          pdfId,
          reviewerId: session.user.id,
          status: normalizedStatus as DocumentReviewStatusType,
          comment,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    }

    // Map DocumentReviewStatus -> PDF.Status
    const reviewToPdfStatusMap: Record<DocumentReviewStatusType, Status> = {
      APPROVED: Status.VERIFIED,
      REJECTED: Status.FAILED,
      NEEDS_REVISION: Status.PENDING,
    };

    await prisma.pDF.update({
      where: { id: pdfId },
      data: {
        status: reviewToPdfStatusMap[normalizedStatus as DocumentReviewStatusType],
        reviewText: comment,
        reviewedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, review: documentReview });
  } catch (error) {
    console.error("Error creating/updating document review:", error);
    return NextResponse.json(
      { error: "Failed to create/update document review" },
      { status: 500 }
    );
  }
}