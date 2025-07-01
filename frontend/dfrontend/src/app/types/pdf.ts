export enum Status {
  VERIFIED = "VERIFIED",
  PENDING = "PENDING",
  FAILED = "FAILED"
}


export enum FlagType {
  FLAG = "FLAG",
  COMMENT = "COMMENT", 
  QUESTION = "QUESTION",
  CRITICAL = "CRITICAL"
}

export enum FlagStatus {
  ACTIVE = "ACTIVE",
  RESOLVED = "RESOLVED",
  DISMISSED = "DISMISSED",
  IN_REVIEW = "IN_REVIEW"
}

export enum Priority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL"
}


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
};


export type Flag = {
  id: string;
  pdfId: string;
  userId: string;
  text: string;
  comment: string;
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

