import { aiService } from '../ai/aiService.js';
import { testSuiteRepository } from '../repositories/testSuiteRepository.js';
import {
  GenerateTestCasesResponse,
  TestCaseDTO,
  TestDimension,
} from '../types/index.js';

export class TestSuiteService {
  /**
   * Generates new test cases from requirement text using AI
   */
  async generateCases(
    requirement: string,
    dimensions: TestDimension[],
    userApiKey?: string,
    provider?: 'openai' | 'claude' | 'auto'
  ): Promise<GenerateTestCasesResponse> {
    return aiService.generateTestSuite(requirement, dimensions, userApiKey, provider);
  }

  /**
   * Refines existing test cases based on engineer feedback
   */
  async refineCases(
    requirement: string,
    previousTestCases: TestCaseDTO[],
    feedbackPrompt: string,
    userApiKey?: string,
    provider?: 'openai' | 'claude' | 'auto'
  ): Promise<GenerateTestCasesResponse> {
    return aiService.refineTestSuite(
      requirement,
      previousTestCases,
      feedbackPrompt,
      userApiKey,
      provider
    );
  }

  /**
   * Saves a generated test suite to database
   */
  async saveSuite(data: {
    title: string;
    rawRequirement: string;
    modelUsed: string;
    qualityScore?: number;
    qualityFeedback?: string;
    testCases: TestCaseDTO[];
  }) {
    const suite = await testSuiteRepository.createSuite(data);
    return this.formatSuiteResponse(suite);
  }

  /**
   * Lists all saved test suites
   */
  async listSuites() {
    return testSuiteRepository.listSuites();
  }

  /**
   * Gets a specific test suite by ID
   */
  async getSuite(id: string) {
    const suite = await testSuiteRepository.getSuiteById(id);
    if (!suite) {
      const error: any = new Error(`Test Suite with ID ${id} not found`);
      error.statusCode = 404;
      error.code = 'NOT_FOUND';
      throw error;
    }
    return this.formatSuiteResponse(suite);
  }

  /**
   * Updates an existing test suite and its test cases
   */
  async updateSuite(
    id: string,
    data: {
      title?: string;
      testCases?: TestCaseDTO[];
    }
  ) {
    const existing = await testSuiteRepository.getSuiteById(id);
    if (!existing) {
      const error: any = new Error(`Test Suite with ID ${id} not found`);
      error.statusCode = 404;
      error.code = 'NOT_FOUND';
      throw error;
    }

    const updated = await testSuiteRepository.updateSuite(id, data);
    return this.formatSuiteResponse(updated!);
  }

  /**
   * Deletes a test suite
   */
  async deleteSuite(id: string) {
    const existing = await testSuiteRepository.getSuiteById(id);
    if (!existing) {
      const error: any = new Error(`Test Suite with ID ${id} not found`);
      error.statusCode = 404;
      error.code = 'NOT_FOUND';
      throw error;
    }
    return testSuiteRepository.deleteSuite(id);
  }

  private formatSuiteResponse(suite: any) {
    return {
      ...suite,
      testCases: (suite.testCases || []).map((tc: any) => ({
        ...tc,
        steps: typeof tc.steps === 'string' ? JSON.parse(tc.steps) : tc.steps,
      })),
    };
  }
}

export const testSuiteService = new TestSuiteService();
