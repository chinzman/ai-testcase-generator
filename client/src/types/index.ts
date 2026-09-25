export type TestDimension = 'POSITIVE' | 'NEGATIVE' | 'EDGE_CASE' | 'VALIDATION' | 'SECURITY';

export type TestPriority = 'HIGH' | 'MEDIUM' | 'LOW';

export type TestCaseStatus = 'DRAFT' | 'REVIEWED' | 'APPROVED';

export interface TestCase {
  id?: string;
  testCaseId: string;
  title: string;
  description: string;
  dimension: TestDimension;
  priority: TestPriority;
  preconditions: string;
  steps: string[];
  expectedResult: string;
  gherkin?: string;
  status?: TestCaseStatus;
}

export interface RequirementQualityAnalysis {
  completenessScore: number;
  clarityScore: number;
  strengths: string[];
  ambiguities: string[];
  recommendations: string[];
}

export interface TestSuite {
  id?: string;
  title: string;
  rawRequirement: string;
  modelUsed: string;
  qualityScore?: number;
  qualityFeedback?: string;
  testCases: TestCase[];
  createdAt?: string;
  updatedAt?: string;
}

export interface GenerateResponse {
  title: string;
  qualityAnalysis: RequirementQualityAnalysis;
  testCases: TestCase[];
  modelUsed: string;
}

export interface SystemHealth {
  status: string;
  uptimeSeconds: number;
  memoryUsageMb: number;
  database?: string;
  aiEngine?: string;
}
