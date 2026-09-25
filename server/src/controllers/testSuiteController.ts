import { Request, Response, NextFunction } from 'express';
import { testSuiteService } from '../services/testSuiteService.js';
import {
  GenerateTestCasesRequestSchema,
  RegenerateRequestSchema,
  SaveTestSuiteSchema,
  UpdateTestSuiteSchema,
} from '../schemas/testCase.schema.js';
import { ApiSuccessResponse } from '../types/index.js';

export class TestSuiteController {
  /**
   * POST /api/generate
   */
  async generate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = GenerateTestCasesRequestSchema.parse(req.body);
      const result = await testSuiteService.generateCases(
        validated.requirement,
        validated.dimensions,
        validated.userApiKey,
        validated.provider
      );

      const response: ApiSuccessResponse<typeof result> = {
        success: true,
        data: result,
        meta: {
          requestId: req.id || '',
          timestamp: new Date().toISOString(),
        },
      };

      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/refine
   */
  async refine(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = RegenerateRequestSchema.parse(req.body);
      const result = await testSuiteService.refineCases(
        validated.requirement,
        validated.previousTestCases,
        validated.feedbackPrompt,
        validated.userApiKey,
        validated.provider
      );

      const response: ApiSuccessResponse<typeof result> = {
        success: true,
        data: result,
        meta: {
          requestId: req.id || '',
          timestamp: new Date().toISOString(),
        },
      };

      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/suites
   */
  async save(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = SaveTestSuiteSchema.parse(req.body);
      const saved = await testSuiteService.saveSuite(validated);

      const response: ApiSuccessResponse<typeof saved> = {
        success: true,
        data: saved,
        meta: {
          requestId: req.id || '',
          timestamp: new Date().toISOString(),
        },
      };

      res.status(201).json(response);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/suites
   */
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const suites = await testSuiteService.listSuites();

      const response: ApiSuccessResponse<typeof suites> = {
        success: true,
        data: suites,
        meta: {
          requestId: req.id || '',
          timestamp: new Date().toISOString(),
        },
      };

      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/suites/:id
   */
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const suite = await testSuiteService.getSuite(id);

      const response: ApiSuccessResponse<typeof suite> = {
        success: true,
        data: suite,
        meta: {
          requestId: req.id || '',
          timestamp: new Date().toISOString(),
        },
      };

      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/suites/:id
   */
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      const validated = UpdateTestSuiteSchema.parse(req.body);
      const updated = await testSuiteService.updateSuite(id, validated);

      const response: ApiSuccessResponse<typeof updated> = {
        success: true,
        data: updated,
        meta: {
          requestId: req.id || '',
          timestamp: new Date().toISOString(),
        },
      };

      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  /**
   * DELETE /api/suites/:id
   */
  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = String(req.params.id);
      await testSuiteService.deleteSuite(id);

      const response: ApiSuccessResponse<{ message: string }> = {
        success: true,
        data: { message: `Test suite ${id} successfully deleted` },
        meta: {
          requestId: req.id || '',
          timestamp: new Date().toISOString(),
        },
      };

      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }
}

export const testSuiteController = new TestSuiteController();
