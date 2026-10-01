export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
export type Category = 'SECURITY' | 'STYLE' | 'PERFORMANCE' | 'BUG' | 'MAINTAINABILITY';

export interface Finding {
  id: string;
  reviewId: string;
  title: string;
  description: string;
  severity: Severity;
  category: Category;
  filePath: string | null;
  line: number | null;
  suggestion: string | null;
  createdAt: string;
}

export interface ReviewListItem {
  id: string;
  repository: string;
  pullRequest: string | null;
  status: 'COMPLETED' | 'FAILED';
  summary: string;
  createdAt: string;
  findingCount: number;
}

export interface Review extends Omit<ReviewListItem, 'findingCount'> {
  diff: string;
  findings: Finding[];
  quota?: ReviewQuota;
}

export interface ReviewQuota {
  used: number;
  limit: number;
  remaining: number;
}

export interface CurrentAccess {
  type: 'guest' | 'user';
  user: { id: string; email: string; displayName: string } | null;
  quota: ReviewQuota;
}

export interface CreateReviewInput {
  repository: string;
  pullRequest?: string;
  diff: string;
}

export interface HealthStatus {
  status: string;
  service: string;
}
