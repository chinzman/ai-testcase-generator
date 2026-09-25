export type TestDimension = 'POSITIVE' | 'NEGATIVE' | 'EDGE_CASE' | 'VALIDATION' | 'SECURITY';

export type TestPriority = 'HIGH' | 'MEDIUM' | 'LOW';

export type TestCaseStatus = 'DRAFT' | 'REVIEWED' | 'APPROVED';

export interface TestCaseDTO {
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
  completenessScore: number; // 0 - 100
  clarityScore: number;      // 0 - 100
  strengths: string[];
  ambiguities: string[];
  recommendations: string[];
}

export interface GenerateTestCasesResponse {
  title: string;
  qualityAnalysis: RequirementQualityAnalysis;
  testCases: TestCaseDTO[];
  modelUsed: string;
}

export interface TestSuiteWithCases {
  id: string;
  title: string;
  rawRequirement: string;
  modelUsed: string;
  qualityScore: number | null;
  qualityFeedback: string | null;
  createdAt: Date;
  updatedAt: Date;
  testCases: {
    id: string;
    suiteId: string;
    testCaseId: string;
    title: string;
    description: string;
    dimension: string;
    priority: string;
    preconditions: string;
    steps: string; // JSON
    expectedResult: string;
    gherkin: string | null;
    status: string;
    createdAt: Date;
    updatedAt: Date;
  }[];
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: {
    requestId: string;
    timestamp: string;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta: {
    requestId: string;
    timestamp: string;
  };
}
