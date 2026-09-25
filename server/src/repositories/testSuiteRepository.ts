import { prisma } from '../lib/prisma.js';
import { TestCaseDTO } from '../types/index.js';

export class TestSuiteRepository {
  async createSuite(data: {
    title: string;
    rawRequirement: string;
    modelUsed: string;
    qualityScore?: number;
    qualityFeedback?: string;
    testCases: TestCaseDTO[];
  }) {
    return prisma.testSuite.create({
      data: {
        title: data.title,
        rawRequirement: data.rawRequirement,
        modelUsed: data.modelUsed,
        qualityScore: data.qualityScore,
        qualityFeedback: data.qualityFeedback,
        testCases: {
          create: data.testCases.map((tc) => ({
            testCaseId: tc.testCaseId,
            title: tc.title,
            description: tc.description,
            dimension: tc.dimension,
            priority: tc.priority,
            preconditions: tc.preconditions,
            steps: JSON.stringify(tc.steps),
            expectedResult: tc.expectedResult,
            gherkin: tc.gherkin,
            status: tc.status || 'DRAFT',
          })),
        },
      },
      include: {
        testCases: true,
      },
    });
  }

  async listSuites() {
    return prisma.testSuite.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { testCases: true },
        },
      },
    });
  }

  async getSuiteById(id: string) {
    return prisma.testSuite.findUnique({
      where: { id },
      include: {
        testCases: {
          orderBy: { testCaseId: 'asc' },
        },
      },
    });
  }

  async updateSuite(
    id: string,
    data: {
      title?: string;
      testCases?: TestCaseDTO[];
    }
  ) {
    return prisma.$transaction(async (tx) => {
      if (data.title) {
        await tx.testSuite.update({
          where: { id },
          data: { title: data.title },
        });
      }

      if (data.testCases && data.testCases.length > 0) {
        // Delete existing cases and recreate to maintain state cleanly
        await tx.testCase.deleteMany({
          where: { suiteId: id },
        });

        await tx.testCase.createMany({
          data: data.testCases.map((tc) => ({
            suiteId: id,
            testCaseId: tc.testCaseId,
            title: tc.title,
            description: tc.description,
            dimension: tc.dimension,
            priority: tc.priority,
            preconditions: tc.preconditions,
            steps: JSON.stringify(tc.steps),
            expectedResult: tc.expectedResult,
            gherkin: tc.gherkin,
            status: tc.status || 'DRAFT',
          })),
        });
      }

      return tx.testSuite.findUnique({
        where: { id },
        include: {
          testCases: {
            orderBy: { testCaseId: 'asc' },
          },
        },
      });
    });
  }

  async deleteSuite(id: string) {
    return prisma.testSuite.delete({
      where: { id },
    });
  }
}

export const testSuiteRepository = new TestSuiteRepository();
