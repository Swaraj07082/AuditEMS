import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { FlagReviewStatus, FlagStatus } from "@/app/types/pdf";

// GET: Fetch flag reviews for a specific pdfId
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
    const flagReviews = await prisma.flagReview.findMany({
      where: {
        flag: { pdfId },
        reviewerId: session.user.id,
      },
    });

    return NextResponse.json({ success: true, reviews: flagReviews });
  } catch (error) {
    console.error("Error fetching flag reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch flag reviews" },
      { status: 500 }
    );
  }
}

// POST: Create or update a flag review
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { flagId, status, reviewComment } = body;

    if (!flagId || !status || !reviewComment) {
      return NextResponse.json(
        { error: "flagId, status, and reviewComment are required" },
        { status: 400 }
      );
    }

    if (!Object.values(FlagReviewStatus).includes(status)) {
      return NextResponse.json(
        { error: "Invalid review status" },
        { status: 400 }
      );
    }

    // Check if the flag exists
    const flag = await prisma.flag.findUnique({ where: { id: flagId } });
    if (!flag) {
      return NextResponse.json({ error: "Flag not found" }, { status: 404 });
    }

    // Check if a review already exists
    const existingReview = await prisma.flagReview.findFirst({
      where: { flagId, reviewerId: session.user.id },
    });

    let flagReview;
    if (existingReview) {
      // Update existing review
      flagReview = await prisma.flagReview.update({
        where: { id: existingReview.id },
        data: {
          status,
          comment: reviewComment,
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new review
      flagReview = await prisma.flagReview.create({
        data: {
          flagId,
          reviewerId: session.user.id,
          status,
          comment: reviewComment,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    }

    // Example: auto-update flag status based on review status
    let newFlagStatus;
    switch (status) {
      case FlagReviewStatus.APPROVED:
        newFlagStatus = FlagStatus.RESOLVED;
        break;
      case FlagReviewStatus.REJECTED:
        newFlagStatus = FlagStatus.DISMISSED;
        break;
      case FlagReviewStatus.NEEDS_CLARIFICATION:
        newFlagStatus = FlagStatus.IN_REVIEW;
        break;
      default:
        newFlagStatus = undefined;
    }

    if (newFlagStatus) {
      await prisma.flag.update({
        where: { id: flagId },
        data: {
          reviewComment: reviewComment,
          status: newFlagStatus,
          updatedAt: new Date(),
        },
      });
    } else {
      await prisma.flag.update({
        where: { id: flagId },
        data: {
          reviewComment: reviewComment,
          updatedAt: new Date(),
        },
      });
    }

    return NextResponse.json({ success: true, review: flagReview });
  } catch (error) {
    console.error("Error creating/updating flag review:", error);
    return NextResponse.json(
      { error: "Failed to create/update flag review" },
      { status: 500 }
    );
  }
}
