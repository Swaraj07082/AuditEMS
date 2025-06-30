export type Status = "verified" | "pending" | "failed";

export interface PDF {
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
  flagCount: number;
  commentCount: number;
  lastFlagged: number;
  uploadedAt: string; // or Date depending on how your API returns it
}
