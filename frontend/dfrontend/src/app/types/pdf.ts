import { User } from "@prisma/client";
import { NeverToUnknown } from "@prisma/client/runtime/library";

export enum Status {
  VERIFIED = "VERIFIED",
  PENDING = "PENDING",
  FAILED = "FAILED",
}

export enum FlagType {
  FLAG = "FLAG",
  COMMENT = "COMMENT",
  QUESTION = "QUESTION",
  CRITICAL = "CRITICAL",
}

export enum FlagStatus {
  ACTIVE = "ACTIVE",
  RESOLVED = "RESOLVED",
  DISMISSED = "DISMISSED",
  IN_REVIEW = "IN_REVIEW",
}

export enum Priority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

export type UserType = {
  id: string;
  email: string;
  name: string;
  role: "AUDITOR" | "REVIEWER" | "ADMIN";
  createdAt: Date;
  updatedAt: Date;
};

export type UserWithPdfCount = {
  id: string;
  name: string;
  email: string;
  role: "AUDITOR" | "REVIEWER" | "ADMIN";
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
  _count: {
    pdfs: number;
  };
};

export type PDF = {
  id: string;
  userId: string;
  text: string;
  inconsistencies: string;
  rag_analysis: string;
  recommendations: string;
  enhanced: string;
  error: string;
  summary: string;
  filename: string;
  status: Status;
  uploadedAt: Date;
  updatedAt: Date;
  lastFlagged: Date | null; // null if never flagged
  commentCount: number; // Count of COMMENT type flags
  flagCount: number; // Count of FLAG, QUESTION, CRITICAL type flags
  // pdfURL: string | null;
};
export type PdfWithUser = PDF & {
  user: Pick<User, "id" | "name" | "email" | "role">;
  reviewerId?: string | null;
  reviewer?: Pick<User, "id" | "name" | "email" | "role"> | null;
};
export type Flag = {
  id: string;
  pdfId: string;
  userId: string;
  text: string;
  comment: string;
  reviewComment?: string;
  type: FlagType;
  section: string;
  startIndex: number;
  endIndex: number;
  status: FlagStatus;
  priority: Priority;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt: Date | null;
  resolvedBy: string | null;
};

export interface ReviewComment {
  id: string;
  flagId: string;
  reviewerId: string;
  comment: string;
  createdAt: Date;
  reviewerName: string;
}


export interface FlagReview {
  id: string;
  flagId: string;
  reviewerId: string;
  status: "APPROVED" | "REJECTED" | "NEEDS_CLARIFICATION";
  comment: string;
  createdAt: Date;
}


export interface ReviewComment {
  id: string;
  flagId: string;
  reviewerId: string;
  comment: string;
  createdAt: Date;
  reviewerName: string;
}


export interface DocumentReview {
  id: string;
  pdfId: string;
  reviewerId: string;
  status: "APPROVED" | "REJECTED" | "NEEDS_REVISION";
  comment: string;
  createdAt: Date;
  updatedAt : Date
}

export enum FlagReviewStatus {
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  NEEDS_CLARIFICATION = "NEEDS_CLARIFICATION",
}

export enum DocumentReviewStatus {
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  NEEDS_REVISION = "NEEDS_REVISION",
}

