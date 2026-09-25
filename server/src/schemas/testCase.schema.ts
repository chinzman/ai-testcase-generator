import { z } from 'zod';

export const TestDimensionEnum = z.enum([
  'POSITIVE',
  'NEGATIVE',
  'EDGE_CASE',
  'VALIDATION',
  'SECURITY',
]);

export const TestPriorityEnum = z.enum(['HIGH', 'MEDIUM', 'LOW']);

export const TestCaseStatusEnum = z.enum(['DRAFT', 'REVIEWED', 'APPROVED']);

export const TestCaseSchema = z.object({
  id: z.string().optional(),
  testCaseId: z.string().min(1, 'Test case ID is required'),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  dimension: TestDimensionEnum,
  priority: TestPriorityEnum,
  preconditions: z.string().default(''),
  steps: z.array(z.string()).min(1, 'At least one step is required'),
  expectedResult: z.string().min(3, 'Expected result is required'),
  gherkin: z.string().optional(),
  status: TestCaseStatusEnum.optional().default('DRAFT'),
});

export const RequirementQualitySchema = z.object({
  completenessScore: z.number().min(0).max(100),
  clarityScore: z.number().min(0).max(100),
  strengths: z.array(z.string()),
  ambiguities: z.array(z.string()),
  recommendations: z.array(z.string()),
});

export const GenerateTestCasesRequestSchema = z.object({
  requirement: z
    .string()
    .min(10, 'Software requirement or user story must be at least 10 characters long')
    .max(15000, 'Requirement exceeds maximum length of 15,000 characters'),
  dimensions: z.array(TestDimensionEnum).optional().default([
    'POSITIVE',
    'NEGATIVE',
    'EDGE_CASE',
    'VALIDATION',
  ]),
  userApiKey: z.string().optional(),
  provider: z.enum(['openai', 'claude', 'auto']).optional().default('auto'),
});

export const RegenerateRequestSchema = z.object({
  requirement: z.string().min(10),
  previousTestCases: z.array(TestCaseSchema),
  feedbackPrompt: z.string().min(3, 'Feedback prompt must be at least 3 characters'),
  userApiKey: z.string().optional(),
  provider: z.enum(['openai', 'claude', 'auto']).optional().default('auto'),
});

export const SaveTestSuiteSchema = z.object({
  title: z.string().min(1, 'Suite title is required'),
  rawRequirement: z.string().min(1, 'Raw requirement is required'),
  modelUsed: z.string().default('gpt-4o-mini'),
  qualityScore: z.number().optional().default(85),
  qualityFeedback: z.string().optional(),
  testCases: z.array(TestCaseSchema).min(1, 'At least one test case must be saved'),
});

export const UpdateTestSuiteSchema = z.object({
  title: z.string().min(1).optional(),
  testCases: z.array(TestCaseSchema).optional(),
});
