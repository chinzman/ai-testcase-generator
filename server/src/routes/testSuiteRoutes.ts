import { Router } from 'express';
import { testSuiteController } from '../controllers/testSuiteController.js';

export const testSuiteRouter = Router();

// Test Generation & Refinement
testSuiteRouter.post('/generate', (req, res, next) => testSuiteController.generate(req, res, next));
testSuiteRouter.post('/refine', (req, res, next) => testSuiteController.refine(req, res, next));

// CRUD for Saved Test Suites
testSuiteRouter.post('/suites', (req, res, next) => testSuiteController.save(req, res, next));
testSuiteRouter.get('/suites', (req, res, next) => testSuiteController.list(req, res, next));
testSuiteRouter.get('/suites/:id', (req, res, next) => testSuiteController.getById(req, res, next));
testSuiteRouter.put('/suites/:id', (req, res, next) => testSuiteController.update(req, res, next));
testSuiteRouter.delete('/suites/:id', (req, res, next) => testSuiteController.delete(req, res, next));
